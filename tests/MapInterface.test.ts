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
});
