// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import Overlay from "ol/Overlay.js";
import View from "ol/View.js";
import * as color from "ol/color.js";
import * as format from "ol/format.js";
import * as geom from "ol/geom.js";
import * as layer from "ol/layer.js";
import * as source from "ol/source.js";
import * as style from "ol/style.js";
import type { Config } from "../src/types.js";

//The bundle expects OpenLayers as a browser global
(globalThis as any).ol = { layer, source, style, geom, format, color, Feature, Overlay };

const config = {
  baseUrl: "https://sensor.example/v1.1",
  queryObject: { entityType: "Things" },
  debounceDuration: 1,
} as Config;

const thing = (id: number, coordinates: Array<number>) => ({
  "@iot.id": id,
  name: `station ${id}`,
  Locations: [{ location: { type: "Point", coordinates } }],
  Datastreams: [],
});

//Two things inside the view, so the tiles stay below clusterMin and their markers are loaded
const things = [thing(1, [7.2, 50.2]), thing(2, [7.6, 50.6])];

const mockService = () =>
  vi.spyOn(globalThis, "fetch").mockImplementation(async (url: any) => {
    if (decodeURIComponent(String(url)).includes("$count=true")) {
      return new Response(JSON.stringify({ value: [], "@iot.count": 2 }));
    }
    return new Response(JSON.stringify({ value: things }));
  });

/**
 * The layers STAM adds to the map, the vector layer holds the markers and clusters
 */
const stamLayers = (map: Map) => {
  const group: any = map
    .getLayers()
    .getArray()
    .find((added: any) => added.getLayers && added.getLayers().getLength() == 2);

  return {
    circles: group.getLayers().getArray()[0].getSource(),
    features: group.getLayers().getArray()[1].getSource(),
  };
};

const move = async (map: Map, source: any, expected: number) => {
  map.dispatchEvent("moveend");
  await vi.waitFor(() => expect(source.getFeatures().length).toBe(expected), { timeout: 2000 });
};

/**
 * A movement that changes nothing, so there is no feature count to wait for. The rendering
 * has to be given its time, otherwise a rebuild would go unnoticed
 */
const moveAgain = async (map: Map) => {
  map.dispatchEvent("moveend");
  await new Promise((resolve) => setTimeout(resolve, 200));
};

describe("openlayers", () => {
  let STAM: any;
  let map: Map;
  let service: any;
  let stam: any;

  beforeEach(async () => {
    service = mockService();
    STAM = (await import("../src/openlayers.js")).STAM;

    map = new Map({
      layers: [],
      view: new View({ center: [808701.59, 6493626.85], zoom: 8 }),
    });
    map.setSize([800, 600]);
    stam = new STAM({ ...config, map });
    map.addLayer(stam);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the markers of the current view", async () => {
    const { features } = stamLayers(map);
    await move(map, features, 2);

    expect(
      features
        .getFeatures()
        .map((feature: any) => feature.get("@iot.id"))
        .sort(),
    ).toEqual([1, 2]);
  });

  it("keeps the features that stay instead of recreating them", async () => {
    const { features } = stamLayers(map);
    await move(map, features, 2);

    const before = features.getFeatures();
    const geometries = before.map((feature: any) => feature.getGeometry());

    //A second movement over the same area, everything is served from the cache
    await moveAgain(map);

    const after = features.getFeatures();
    expect(after.length).toBe(2);
    //The very same feature objects, so OpenLayers has nothing to redraw
    for (const feature of before) expect(after).toContain(feature);
    after.forEach((feature: any, index: number) =>
      expect(feature.getGeometry()).toBe(geometries[index]),
    );
  });

  it("drops the features that are gone", async () => {
    //A short caching duration, so the cache empties between the two movements
    const expiring = new Map({
      layers: [],
      view: new View({ center: [808701.59, 6493626.85], zoom: 8 }),
    });
    expiring.setSize([800, 600]);
    expiring.addLayer(new STAM({ ...config, cachingDuration: 1, map: expiring }));

    const { features } = stamLayers(expiring);
    await move(expiring, features, 2);

    //The service lost one of the things while the cache expires
    things.pop();
    await new Promise((resolve) => setTimeout(resolve, 1100));
    await move(expiring, features, 1);

    expect(features.getFeatures()[0].get("@iot.id")).toBe(1);
    things.push(thing(2, [7.6, 50.6]));
  });

  describe("caching", () => {
    it("serves a movement over the same area without requesting again", async () => {
      const { features } = stamLayers(map);
      await move(map, features, 2);

      const requested = service.mock.calls.length;
      expect(requested).toBeGreaterThan(0);

      //Nothing moved, so everything is still cached
      await moveAgain(map);
      expect(service.mock.calls.length).toBe(requested);
    });

    it("requests again once the cached data expired", async () => {
      const expiring = new Map({
        layers: [],
        view: new View({ center: [808701.59, 6493626.85], zoom: 8 }),
      });
      expiring.setSize([800, 600]);
      expiring.addLayer(new STAM({ ...config, cachingDuration: 1, map: expiring }));

      const { features } = stamLayers(expiring);
      await move(expiring, features, 2);
      const requested = service.mock.calls.length;

      //Still cached
      await moveAgain(expiring);
      expect(service.mock.calls.length).toBe(requested);

      //A second later the cache is stale
      await new Promise((resolve) => setTimeout(resolve, 1100));
      await moveAgain(expiring);
      expect(service.mock.calls.length).toBeGreaterThan(requested);
    });
  });

  describe("teardown", () => {
    it("stops listening and drawing once the layer is removed", async () => {
      const { features } = stamLayers(map);
      await move(map, features, 2);
      const requested = service.mock.calls.length;

      map.removeLayer(stam);
      //Its own layers are off the map as well
      expect(map.getLayers().getArray()).toEqual([]);

      //The map still moves, but the removed layer must not react to it any more
      await moveAgain(map);
      expect(service.mock.calls.length).toBe(requested);
    });

    it("works again after it was added back", async () => {
      await move(map, stamLayers(map).features, 2);

      map.removeLayer(stam);
      map.addLayer(stam);

      await move(map, stamLayers(map).features, 2);
      expect(stamLayers(map).features.getFeatures().length).toBe(2);
    });
  });
});
