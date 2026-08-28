import { afterEach, describe, expect, it, vi } from "vitest";
import { STAInterface } from "../src/STAInterface";
import type { Config, QueryObject } from "../src/types";

const config: Config = {
  baseUrl: "https://sensor.example/v1.1",
  queryObject: { entityType: "Things" },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("STAInterface", () => {
  it("fetches a query and follows SensorThings next links", async () => {
    const query: QueryObject = {
      entityType: "Things",
      top: 3,
    };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            value: [{ id: 1 }, { id: 2 }],
            "@iot.nextLink": "https://sensor.example/v1.1/Things?$skip=2",
          }),
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: [{ id: 3 }] })));

    const result = await new STAInterface(config).getGeoJson(query);

    expect(result.value).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://sensor.example/v1.1/Things?$top=3",
      undefined,
    );
    //The next link is requested without the configured fetch options
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://sensor.example/v1.1/Things?$skip=2",
      undefined,
    );
  });

  it("never exceeds the configured request concurrency", async () => {
    let inFlight = 0;
    let peak = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 1));
      inFlight--;
      return new Response(JSON.stringify({ value: [{ id: 1 }] }));
    });

    const api = new STAInterface({ ...config, maxConcurrentRequests: 2 });
    await Promise.all(
      Array.from({ length: 10 }, (_, id) => api.getGeoJson({ entityType: "Things", id })),
    );

    expect(peak).toBe(2);
  });

  it("merges dataArray pages", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            value: [{ dataArray: [["id", "time", 1]] }],
            "@iot.nextLink": "https://sensor.example/next",
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ value: [{ dataArray: [["id", "time", 2]] }] })),
      );

    const result = await new STAInterface(config).getGeoJson({
      entityType: "Datastreams",
      resultFormat: "dataArray",
    });

    expect(result.value.dataArray).toEqual([
      ["id", "time", 1],
      ["id", "time", 2],
    ]);
  });
});
