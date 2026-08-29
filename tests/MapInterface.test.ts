import { afterEach, describe, expect, it, vi } from "vitest";
import { MapInterface } from "../src/MapInterface.js";
import type { IClientOptions } from "mqtt";
import type { Config, MqttClient } from "../src/types.js";

//Stands in for the bundled MQTT.js, which the lazy import would otherwise load
const bundled = vi.hoisted(() => {
  const connected: Array<[string, IClientOptions | undefined]> = [];
  const subscribed: Array<Array<string>> = [];

  return {
    connected,
    subscribed,
    connect: (url: string, options?: IClientOptions) => {
      connected.push([url, options]);
      //Only the two members STAM uses, the rest of the MQTT.js client is not needed here
      return {
        on: () => {},
        subscribe: (topics: Array<string>, callback: (error: unknown) => void) => {
          subscribed.push(topics);
          callback(undefined);
        },
      };
    },
  };
});

vi.mock("mqtt", () => ({ default: { connect: bundled.connect } }));

const config: Config = {
  baseUrl: "https://sensor.example/v1.1",
  queryObject: { entityType: "Things" },
  debounceDuration: 50,
};

//Bounding box as the map bundles report it: north east, then south west
const boundingBox = [7.3, 50.3, 7.2, 50.2];

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  bundled.connected.length = 0;
  bundled.subscribed.length = 0;
});

describe("MapInterface", () => {
  it("only requests the last movement while the map is still moving", async () => {
    vi.useFakeTimers();
    const mapInterface = new MapInterface(config);
    const load = vi.spyOn(mapInterface as any, "loadLayerData").mockResolvedValue(undefined);

    for (const zoom of [8, 9, 10, 11]) {
      mapInterface.getLayerData(zoom, boundingBox);
      await vi.advanceTimersByTimeAsync(10);
    }
    await vi.advanceTimersByTimeAsync(50);

    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith(11, boundingBox);
  });

  it("emits the cached features without waiting for the debounce", () => {
    vi.useFakeTimers();
    const mapInterface = new MapInterface(config);
    vi.spyOn(mapInterface as any, "loadLayerData").mockResolvedValue(undefined);
    const change = vi.fn();
    mapInterface.onChange(change);

    mapInterface.getLayerData(8, boundingBox);

    expect(change).toHaveBeenCalledTimes(1);
  });

  it("requests again once the map settled", async () => {
    vi.useFakeTimers();
    const mapInterface = new MapInterface(config);
    const load = vi.spyOn(mapInterface as any, "loadLayerData").mockResolvedValue(undefined);

    mapInterface.getLayerData(8, boundingBox);
    await vi.advanceTimersByTimeAsync(50);
    mapInterface.getLayerData(9, boundingBox);
    await vi.advanceTimersByTimeAsync(50);

    expect(load).toHaveBeenCalledTimes(2);
  });

  it("loads a polygon's markers before the other polygons are counted", async () => {
    let releaseSecondCount = () => {};
    const secondCount = new Promise<void>((resolve) => (releaseSecondCount = resolve));
    let requests = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      requests++;
      //Hold one polygon's count open, the others resolve right away
      if (requests == 2) await secondCount;
      return new Response(JSON.stringify({ value: [], "@iot.count": 0 }));
    });

    const mapInterface = new MapInterface(config);
    const getMarkers = vi.spyOn(mapInterface as any, "getMarkers").mockResolvedValue(undefined);

    const loaded = (mapInterface as any).loadLayerData(12, boundingBox);

    //Markers are requested while the held count is still pending
    await vi.waitFor(() => expect(getMarkers).toHaveBeenCalled());
    expect(getMarkers.mock.calls[0][0]).toHaveLength(1);

    releaseSecondCount();
    await loaded;
  });

  it("counts only once, the entity request does not ask for the count again", async () => {
    const urls: string[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url: any) => {
      urls.push(decodeURIComponent(String(url)));
      return new Response(JSON.stringify({ value: [], "@iot.count": 0 }));
    });

    //Even a queryObject that asks for the count only gets it on the polygon query
    const mapInterface = new MapInterface({
      ...config,
      queryObject: { entityType: "Things", count: true },
    });
    await (mapInterface as any).loadLayerData(12, boundingBox);

    const counting = urls.filter((url) => url.includes("$count=true"));
    const entities = urls.filter((url) => url.includes("$expand=Datastreams"));

    expect(counting.length).toBeGreaterThan(0);
    expect(entities.length).toBeGreaterThan(0);
    expect(counting.every((url) => url.includes("$top=0"))).toBe(true);
    expect(entities.some((url) => url.includes("$count"))).toBe(false);
  });

  it("sums the cached tiles of the zoom level below instead of counting again", async () => {
    let counts = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url: any) => {
      const counting = decodeURIComponent(String(url)).includes("$count=true");
      if (counting) counts++;
      //Every counted tile holds three things
      return new Response(JSON.stringify({ value: [], "@iot.count": counting ? 3 : 0 }));
    });

    const mapInterface = new MapInterface(config) as any;
    //Zoom 13 splits every zoom 12 tile into four
    await mapInterface.loadLayerData(13, boundingBox);
    const countedWhileZoomedIn = counts;
    expect(countedWhileZoomedIn).toBeGreaterThan(0);

    await mapInterface.loadLayerData(12, boundingBox);

    const tiles = mapInterface
      .getCached(12)
      .features.filter((feature: any) => feature.properties?.count != undefined);
    const summed = tiles.filter((feature: any) => feature.properties.count == 12);

    //Tiles whose four children were all cached are summed, the ones at the edge are not
    expect(summed.length).toBeGreaterThan(0);
    expect(counts - countedWhileZoomedIn).toBe(tiles.length - summed.length);
  });

  it("never queries a tile that lies completely outside the viewport", async () => {
    const queried: number[][] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url: any) => {
      const match = decodeURIComponent(String(url)).match(/POLYGON \(\((.*?)\)\)/);
      if (match) {
        const points = match[1].split(",").map((point) => point.trim().split(" ").map(Number));
        //west, south, east, north of the queried polygon
        queried.push([
          Math.min(...points.map((p) => p[0])),
          Math.min(...points.map((p) => p[1])),
          Math.max(...points.map((p) => p[0])),
          Math.max(...points.map((p) => p[1])),
        ]);
      }
      return new Response(JSON.stringify({ value: [], "@iot.count": 0 }));
    });

    //boundingBox is [east, north, west, south]
    const [east, north, west, south] = boundingBox;
    const mapInterface = new MapInterface(config) as any;
    await mapInterface.loadLayerData(12, boundingBox);

    expect(queried.length).toBeGreaterThan(0);
    const outside = queried.filter(
      (box) => box[0] >= east || box[2] <= west || box[1] >= north || box[3] <= south,
    );
    expect(outside).toEqual([]);
  });

  it("reuses the entities of a fetched tile instead of requesting them again", async () => {
    const requests: string[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url: any) => {
      const link = decodeURIComponent(String(url));
      requests.push(link);

      if (link.includes("$count=true")) {
        return new Response(JSON.stringify({ value: [], "@iot.count": 1 }));
      }
      return new Response(
        JSON.stringify({
          value: [
            {
              "@iot.id": 1,
              name: "station",
              Locations: [{ location: { type: "Point", coordinates: [7.205, 50.205] } }],
              Datastreams: [],
            },
          ],
        }),
      );
    });

    //A high clusterMin makes every tile fetch its entities
    const mapInterface = new MapInterface({ ...config, clusterMin: 100 }) as any;
    await mapInterface.loadLayerData(12, boundingBox);
    expect(requests.length).toBeGreaterThan(0);

    //Zooming in is served from the tiles that were fetched
    requests.length = 0;
    await mapInterface.loadLayerData(13, boundingBox);

    expect(requests).toEqual([]);
    const markers = mapInterface
      .getCached(13)
      .features.filter((feature: any) => feature.properties?.["@iot.id"] != undefined);
    expect(markers.length).toBeGreaterThan(0);
  });

  it("stops calling a listener that unsubscribed", async () => {
    vi.useFakeTimers();
    const mapInterface = new MapInterface(config);
    vi.spyOn(mapInterface as any, "loadLayerData").mockResolvedValue(undefined);

    const listener = vi.fn();
    const unsubscribe = mapInterface.onChange(listener);
    mapInterface.getLayerData(8, boundingBox);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    mapInterface.getLayerData(8, boundingBox);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("drops a listener when its abort signal fires", async () => {
    vi.useFakeTimers();
    const mapInterface = new MapInterface(config);
    vi.spyOn(mapInterface as any, "loadLayerData").mockResolvedValue(undefined);

    const listener = vi.fn();
    const controller = new AbortController();
    mapInterface.onChange(listener, { signal: controller.signal });

    mapInterface.getLayerData(8, boundingBox);
    controller.abort();
    mapInterface.getLayerData(8, boundingBox);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  describe("defaults", () => {
    const tiles = async (config: Config, count: number) => {
      const requests: string[] = [];
      vi.spyOn(globalThis, "fetch").mockImplementation(async (url: any) => {
        requests.push(decodeURIComponent(String(url)));
        return new Response(JSON.stringify({ value: [], "@iot.count": count }));
      });

      const mapInterface = new MapInterface(config) as any;
      await mapInterface.loadLayerData(12, boundingBox);

      return {
        counted: requests.filter((url) => url.includes("$count=true")).length,
        entities: requests.filter((url) => url.includes("$expand=Datastreams")).length,
        cached: mapInterface.getCached(12).features,
      };
    };

    it("keeps a tile clustered from five features on, without a clusterMin", async () => {
      const clustered = await tiles(config, 5);
      expect(clustered.entities).toBe(0);
      expect(clustered.cached.every((feature: any) => feature.properties.count == 5)).toBe(true);
    });

    it("resolves a tile below five features into markers, without a clusterMin", async () => {
      const resolved = await tiles(config, 4);
      expect(resolved.entities).toBeGreaterThan(0);
    });

    it("clusters unless the config turns it off", async () => {
      //Clustering on by default asks for the counts
      expect((await tiles(config, 5)).counted).toBeGreaterThan(0);
      //With it off no count is needed, the entities are loaded right away
      const off = await tiles({ ...config, cluster: false }, 5);
      expect(off.counted).toBe(0);
      expect(off.entities).toBeGreaterThan(0);
    });
  });
  describe("mqtt", () => {
    //A client recording what it was connected and subscribed to
    const client = () => {
      const connected: Array<[string, IClientOptions | undefined]> = [];
      const subscribed: Array<Array<string>> = [];
      //Only the two members STAM uses, the rest of the MQTT.js client is not needed here
      const client = {
        on: () => {},
        subscribe: (topics: Array<string>, callback: (error: unknown) => void) => {
          subscribed.push(topics);
          callback(undefined);
        },
      } as unknown as MqttClient;

      return {
        connected,
        subscribed,
        connect: (url: string, options?: IClientOptions) => {
          connected.push([url, options]);
          return client;
        },
      };
    };

    //Loads a tile and waits for the subscription, which does not hold the data back
    const load = async (mqtt: Config["mqtt"], baseUrl = config.baseUrl) => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ value: [], "@iot.count": 0 })),
      );

      const mapInterface = new MapInterface({ ...config, baseUrl, mqtt }) as any;
      await mapInterface.loadLayerData(12, boundingBox);
      await mapInterface.mqttReady;

      return mapInterface;
    };

    const subscribe = async (mqtt: Config["mqtt"], baseUrl = config.baseUrl) => {
      const mock = client();
      const options = mqtt === true ? { client: mock.connect } : { ...mqtt, client: mock.connect };

      await load(options, baseUrl);
      await vi.waitFor(() => expect(mock.subscribed.length).toBe(1));

      return mock;
    };

    it("derives the broker url and the topic from the base url", async () => {
      const mock = await subscribe(true);
      expect(mock.connected[0][0]).toBe("wss://sensor.example/mqtt");
      expect(mock.subscribed[0]).toEqual(["v1.1/Things"]);
    });

    it("keeps the port of the base url and drops TLS for an http service", async () => {
      const mock = await subscribe(true, "http://localhost:8080/v1.1");
      expect(mock.connected[0][0]).toBe("ws://localhost:8080/mqtt");
    });

    it("connects to the configured url with the given options", async () => {
      const mock = await subscribe({
        url: "wss://broker.example:8884/ws",
        options: { username: "sta", password: "secret" },
      });
      expect(mock.connected[0]).toEqual([
        "wss://broker.example:8884/ws",
        { username: "sta", password: "secret" },
      ]);
    });

    it("subscribes below the configured topic prefix", async () => {
      const mock = await subscribe({ topicPrefix: "sta/v1.1" });
      expect(mock.subscribed[0]).toEqual(["sta/v1.1/Things"]);
    });

    it("subscribes to the configured topics instead of the derived one", async () => {
      const mock = await subscribe({ topics: ["custom/topic"] });
      expect(mock.subscribed[0]).toEqual(["custom/topic"]);
    });

    it("passes the entity type to a topics callback", async () => {
      const mock = await subscribe({ topics: (entityType) => `v1.1/${entityType}?$select=id` });
      expect(mock.subscribed[0]).toEqual(["v1.1/Things?$select=id"]);
    });

    it("uses a connected client as it is, without connecting", async () => {
      const mock = client();
      const connected = mock.connect("wss://broker.example/mqtt");
      mock.connected.length = 0;

      await load({ client: connected });
      await vi.waitFor(() => expect(mock.subscribed.length).toBe(1));

      expect(mock.connected).toEqual([]);
      expect(mock.subscribed[0]).toEqual(["v1.1/Things"]);
    });

    it("falls back to the bundled client, without a client on the page", async () => {
      const mapInterface = await load(true);

      expect(bundled.connected).toEqual([["wss://sensor.example/mqtt", undefined]]);
      expect(mapInterface.client).toBeDefined();
      await vi.waitFor(() => expect(bundled.subscribed[0]).toEqual(["v1.1/Things"]));
    });

    it("never loads the bundled client unless mqtt is enabled", async () => {
      await load(undefined);

      expect(bundled.connected).toEqual([]);
      expect(new MapInterface(config).client).toBeUndefined();
    });

    it("keeps the map working when the connection fails", async () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const mapInterface = await load({
        client: () => {
          throw new Error("no broker");
        },
      });

      expect(mapInterface.client).toBeUndefined();
      expect(error).toHaveBeenCalled();
    });
  });
});
