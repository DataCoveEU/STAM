import { afterEach, describe, expect, it, vi } from "vitest";
import { MapInterface } from "../src/MapInterface.js";
import type { Config } from "../src/types.js";

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
    mapInterface.on("change", change);

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
});
