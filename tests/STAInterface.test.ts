import { afterEach, describe, expect, it, vi } from "vitest";
import { STAInterface } from "../src/STAInterface.js";
import type { Config, QueryObject } from "../src/types.js";

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
    expect(fetchMock).toHaveBeenNthCalledWith(2, "https://sensor.example/v1.1/Things?$skip=2");
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
