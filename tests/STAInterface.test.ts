import { afterEach, describe, expect, it, vi } from "vitest";
import { STAInterface } from "../src/STAInterface";
import type { Config, DataArray, QueryObject } from "../src/types";

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
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://sensor.example/v1.1/Things?$skip=2",
      undefined,
    );
  });

  it("sends the configured fetch options with every page", async () => {
    const options = { headers: { Authorization: "Bearer token" } };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            value: [{ id: 1 }],
            "@iot.nextLink": "https://sensor.example/v1.1/Things?$skip=1",
          }),
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: [{ id: 2 }] })));

    await new STAInterface({ ...config, fetchOptions: options }).getGeoJson({
      entityType: "Things",
      top: 2,
    });

    expect(fetchMock.mock.calls.every((call) => call[1] == options)).toBe(true);
  });

  it("stops paging at maxEntities, instead of following every next link", async () => {
    var page = 0;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      page++;
      //A service that always offers another page
      return new Response(
        JSON.stringify({
          value: [{ id: page }, { id: page }],
          "@iot.nextLink": `https://sensor.example/v1.1/Things?$skip=${page * 2}`,
        }),
      );
    });

    const result = await new STAInterface({ ...config, maxEntities: 6 }).getGeoJson({
      entityType: "Things",
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect((result.value as Array<unknown>).length).toBe(6);
    expect(String(fetchMock.mock.calls[0][0])).toContain("$top=6");
  });

  it("reports the rows of every page while they load", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            value: [{ id: 1 }, { id: 2 }],
            "@iot.nextLink": "https://sensor.example/v1.1/Things?$skip=2",
          }),
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: [{ id: 3 }] })));

    const pages: Array<Array<unknown>> = [];
    const loaded: Array<number> = [];
    await new STAInterface(config).getGeoJson(
      { entityType: "Things", top: 3 },
      {
        onPage: (page, rows) => {
          pages.push(page as Array<unknown>);
          loaded.push(rows);
        },
      },
    );

    //Every page carries its own rows, the count is the total
    expect(pages).toEqual([[{ id: 1 }, { id: 2 }], [{ id: 3 }]]);
    expect(loaded).toEqual([2, 3]);
  });

  it("aborts the pages that are still to come", async () => {
    const controller = new AbortController();
    vi.spyOn(globalThis, "fetch").mockImplementation(async (_url: any, init: any) => {
      if (init?.signal?.aborted) throw new Error("aborted");
      controller.abort();
      return new Response(
        JSON.stringify({
          value: [{ id: 1 }],
          "@iot.nextLink": "https://sensor.example/v1.1/Things?$skip=1",
        }),
      );
    });

    await expect(
      new STAInterface(config).getGeoJson({ entityType: "Things" }, { signal: controller.signal }),
    ).rejects.toThrow();
  });

  it("pages a service that honours the requested top, instead of stopping after it", async () => {
    var page = 0;
    const urls: Array<string> = [];
    //A service that answers with exactly as many rows as were asked for
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (url: any) => {
      urls.push(String(url));
      page++;
      const TOP = Number(new URL(String(url)).searchParams.get("$top"));
      return new Response(
        JSON.stringify({
          value: Array.from({ length: TOP }, (_, index) => ({ id: page * TOP + index })),
          "@iot.nextLink": `https://sensor.example/v1.1/Things?$top=${TOP}&$skip=${page * TOP}`,
        }),
      );
    });

    const result = await new STAInterface({
      ...config,
      maxEntities: 25,
      pageSize: 10,
    }).getGeoJson({ entityType: "Things" });

    expect(urls[0]).toContain("$top=10");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect((result.value as Array<unknown>).length).toBe(25);
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

    const result = await new STAInterface(config).getGeoJson<DataArray>({
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

  it("does not space the requests out without a request delay", async () => {
    const sentAt: number[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      sentAt.push(Date.now());
      return new Response(JSON.stringify({ value: [{ id: 1 }] }));
    });

    //maxConcurrentRequests alone throttles nothing, it is the width of a wave
    const api = new STAInterface({ ...config, maxConcurrentRequests: 2 });
    await Promise.all(
      Array.from({ length: 6 }, (_, id) => api.getGeoJson({ entityType: "Things", id })),
    );

    expect(sentAt).toHaveLength(6);
    expect(sentAt[5] - sentAt[0]).toBeLessThan(20);
  });
});
