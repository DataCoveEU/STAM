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

  it("sends a full wave at once and delays only the next one", async () => {
    const sentAt: number[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      sentAt.push(Date.now());
      return new Response(JSON.stringify({ value: [{ id: 1 }] }));
    });

    const api = new STAInterface({ ...config, maxConcurrentRequests: 2, requestDelay: 30 });
    await Promise.all(
      Array.from({ length: 5 }, (_, id) => api.getGeoJson({ entityType: "Things", id })),
    );

    expect(sentAt).toHaveLength(5);
    //Two per wave, the waves are 30ms apart. Timers may fire late, but never early
    const elapsed = sentAt.map((at) => at - sentAt[0]);
    expect(elapsed[1]).toBeLessThan(29);
    expect(elapsed[2]).toBeGreaterThanOrEqual(29);
    expect(elapsed[3] - elapsed[2]).toBeLessThan(29);
    expect(elapsed[4]).toBeGreaterThanOrEqual(59);
  });
});
