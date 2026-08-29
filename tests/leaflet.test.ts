// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import L from "leaflet";
import type { Config } from "../src/types.js";

//The bundle expects Leaflet as a browser global
(globalThis as any).L = L;

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
 * A map on a container with a size, happy-dom reports none on its own
 */
const createMap = () => {
  const container = document.createElement("div");
  for (const [size, value] of [
    ["clientWidth", 800],
    ["clientHeight", 600],
  ]) {
    Object.defineProperty(container, size, { value, configurable: true });
  }
  document.body.appendChild(container);

  return L.map(container, { fadeAnimation: false, zoomAnimation: false }).setView(
    [50.27264, 7.26469],
    8,
  );
};

/**
 * The markers Leaflet currently has on the map
 */
const markers = (map: any) => {
  const found: Array<any> = [];
  map.eachLayer((layer: any) => {
    if (layer instanceof L.Marker) found.push(layer);
  });
  return found;
};

const move = async (map: any, expected: number) => {
  map.fire("moveend");
  //Leaflet realtime polls the cache, so the markers appear a moment later
  await vi.waitFor(() => expect(markers(map).length).toBe(expected), { timeout: 3000 });
};

/**
 * A movement that changes nothing, so there is no marker count to wait for. The rendering
 * has to be given its time, otherwise a rebuild would go unnoticed
 */
const moveAgain = async (map: any) => {
  map.fire("moveend");
  await new Promise((resolve) => setTimeout(resolve, 800));
};

describe("leaflet", () => {
  let STAM: any;
  let service: any;
  let map: any;

  beforeEach(async () => {
    service = mockService();
    STAM = (await import("../src/leaflet.js")).STAM;

    map = createMap();
    map._stam = STAM({ ...config, map });
    map._stam.addTo(map);
  });

  afterEach(() => {
    map?.remove();
    vi.restoreAllMocks();
  });

  it("renders the markers of the current view", async () => {
    await move(map, 2);

    expect(
      markers(map)
        .map((marker: any) => marker.feature.properties["@iot.id"])
        .sort(),
    ).toEqual([1, 2]);
  });

  it("keeps the markers that stay instead of recreating them", async () => {
    await move(map, 2);
    const before = markers(map);

    //A second movement over the same area, everything is served from the cache
    await moveAgain(map);

    const after = markers(map);
    expect(after.length).toBe(2);
    //The very same layer objects, so Leaflet has nothing to redraw
    for (const marker of before) expect(after).toContain(marker);
  });

  describe("caching", () => {
    it("serves a movement over the same area without requesting again", async () => {
      await move(map, 2);

      const requested = service.mock.calls.length;
      expect(requested).toBeGreaterThan(0);

      //Nothing moved, so everything is still cached
      await moveAgain(map);
      expect(service.mock.calls.length).toBe(requested);
    });

    it("requests again once the cached data expired", async () => {
      const expiring = createMap();
      STAM({ ...config, cachingDuration: 1, map: expiring }).addTo(expiring);

      await move(expiring, 2);
      const requested = service.mock.calls.length;

      //Still cached
      await moveAgain(expiring);
      expect(service.mock.calls.length).toBe(requested);

      //A second later the cache is stale
      await new Promise((resolve) => setTimeout(resolve, 1100));
      await moveAgain(expiring);
      expect(service.mock.calls.length).toBeGreaterThan(requested);

      expiring.remove();
    });
  });

  describe("teardown", () => {
    it("stops listening and drawing once the layer is removed", async () => {
      await move(map, 2);
      const requested = service.mock.calls.length;

      map.removeLayer(map._stam);
      expect(markers(map)).toEqual([]);

      //The map still moves, but the removed layer must not react to it any more
      await moveAgain(map);
      expect(service.mock.calls.length).toBe(requested);
    });

    it("works again after it was added back", async () => {
      await move(map, 2);

      map.removeLayer(map._stam);
      map._stam.addTo(map);

      await move(map, 2);
      expect(markers(map).length).toBe(2);
    });
  });

  describe("callbacks", () => {
    const withConfig = async (extra: Partial<Config>) => {
      map.removeLayer(map._stam);
      map._stam = STAM({ ...config, ...extra, map });
      map._stam.addTo(map);

      await move(map, 2);
      return markers(map)[0];
    };

    it("takes the color a style function returns", async () => {
      const marker = await withConfig({ markerStyle: () => "violet" });
      expect(marker.options.icon.options.iconUrl).toContain("marker-icon-2x-violet");
    });

    it("takes the color a style function resolves to", async () => {
      const marker = await withConfig({ markerStyle: async () => "gold" });

      //The marker is drawn first and gets its icon once the color arrives
      await vi.waitFor(() =>
        expect(marker.options.icon.options.iconUrl).toContain("marker-icon-2x-gold"),
      );
    });

    it("shows what markerClick returns instead of the default popup", async () => {
      const marker = await withConfig({ markerClick: () => "<b>own popup</b>" });

      marker.fire("click");
      expect(marker.getPopup().getContent()).toBe("<b>own popup</b>");
    });

    it("keeps the default popup when markerClick returns nothing", async () => {
      const markerClick = vi.fn();
      const marker = await withConfig({ markerClick });

      marker.fire("click");
      expect(markerClick).toHaveBeenCalledTimes(1);
      //A default popup is built from the feature itself
      expect(marker.getPopup().getContent()).toBeInstanceOf(HTMLElement);
    });

    it("calls popupClose when the popup closes", async () => {
      const popupClose = vi.fn();
      const marker = await withConfig({ popupClose, markerClick: () => "<b>own</b>" });

      marker.fire("click");
      marker.fire("popupclose");
      expect(popupClose).toHaveBeenCalledTimes(1);
    });
  });
});
