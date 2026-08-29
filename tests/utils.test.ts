// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { addCss, addTransparentBackground, createDefaultPopup } from "../src/utils";
import type {
  Config,
  GeoJsonFeature,
  LoadOptions,
  ObservedPropertyData,
  Path,
  QueryObject,
} from "../src/types";

const config = {
  baseUrl: "https://sensor.example/v1.1",
  queryObject: { entityType: "Things" },
} as Config;

const feature = (): GeoJsonFeature => ({
  type: "Feature",
  geometry: { type: "Point", coordinates: [7.2, 50.2] },
  properties: {
    "@iot.id": 1,
    name: "Station Koblenz",
    getData: [
      { observedProperty: "PM10", getData: async () => ({ value: { dataArray: [] } }) },
      { observedProperty: "NO2", getData: async () => ({ value: { dataArray: [] } }) },
    ],
  },
});

describe("createDefaultPopup", () => {
  it("shows the name and every observed property of the feature", () => {
    const content = document.createElement("div");
    createDefaultPopup(content, feature(), config);

    expect(content.querySelector("h3")?.textContent).toBe("Station Koblenz");
    expect([...content.querySelectorAll("li")].map((item) => item.innerText)).toEqual([
      "PM10",
      "NO2",
    ]);
  });

  it("shows only the name for a feature without observations", () => {
    const bare = feature();
    delete bare.properties.getData;

    const content = document.createElement("div");
    createDefaultPopup(content, bare, config);

    expect(content.querySelector("h3")?.textContent).toBe("Station Koblenz");
    expect(content.querySelectorAll("li")).toHaveLength(0);
  });
});

describe("the plot of the default popup", () => {
  //The plotly build the consuming page loads
  const plotly = () => {
    const listeners: Record<string, (event: any) => void> = {};
    const newPlot = vi.fn((target: string, ..._rest: Array<any>) => {
      //Plotly turns the element into a graph div that reports pan and zoom
      const plot = document.getElementById(target) as any;
      if (plot) {
        plot.on = (event: string, listener: (event: any) => void) => (listeners[event] = listener);
      }
    });
    (globalThis as any).Plotly = {
      newPlot,
      extendTraces: vi.fn(),
      prependTraces: vi.fn(),
      relayout: vi.fn(),
      purge: vi.fn(),
    };
    return Object.assign(newPlot, { listeners });
  };

  //Opens the plot of the first observed property and waits for it
  const open = async (getData: ObservedPropertyData["getData"], popupConfig: Config = config) => {
    const newPlot = plotly();
    const content = document.createElement("div");
    const marker = feature();
    marker.properties.getData = [{ observedProperty: "PM10", getData }];

    createDefaultPopup(content, marker, popupConfig);
    content.querySelector("li")!.click();

    return { newPlot, modal: () => document.getElementById("pico-1") };
  };

  //Rows as a dataArray query answers them: id, time, result
  const rows = (count: number) =>
    Array.from({ length: count }, (_, index) => [
      index,
      `2026-01-0${(index % 9) + 1}T00:00:00Z`,
      index,
    ]);

  afterEach(() => {
    delete (globalThis as any).Plotly;
    document.getElementById("pico-1")?.remove();
  });

  it("plots the observations it loaded", async () => {
    const { newPlot } = await open(async () => ({ value: { dataArray: rows(3) } }));

    await vi.waitFor(() => expect(newPlot).toHaveBeenCalled());
    expect(newPlot.mock.calls[0][1][0].x).toHaveLength(3);
  });

  it("draws with WebGL while the limit allows a long series", async () => {
    const { newPlot } = await open(async () => ({ value: { dataArray: rows(3) } }), {
      ...config,
      maxEntities: 5000,
    });

    await vi.waitFor(() => expect(newPlot).toHaveBeenCalled());
    expect(newPlot.mock.calls[0][1][0].type).toBe("scattergl");
  });

  it("draws a series that cannot grow long with SVG", async () => {
    const { newPlot } = await open(async () => ({ value: { dataArray: rows(3) } }));

    await vi.waitFor(() => expect(newPlot).toHaveBeenCalled());
    expect(newPlot.mock.calls[0][1][0].type).toBe("scatter");
  });

  it("plots without a title of its own", async () => {
    const { newPlot } = await open(async () => ({ value: { dataArray: rows(3) } }));

    await vi.waitFor(() => expect(newPlot).toHaveBeenCalled());
    expect(newPlot.mock.calls[0][2].title).toBeUndefined();
  });

  it("plots nothing for a datastream without observations", async () => {
    const { newPlot, modal } = await open(async () => ({ value: { dataArray: [] } }));

    await vi.waitFor(() => expect(modal()?.textContent).toContain("No observations"));
    expect(newPlot).not.toHaveBeenCalled();
  });

  it("draws every page while the rest still loads", async () => {
    var report: LoadOptions["onPage"];
    const { newPlot } = await open(
      (_query: (query: QueryObject) => QueryObject, options?: LoadOptions) => {
        report = options?.onPage;
        return new Promise(() => {});
      },
    );

    await vi.waitFor(() => expect(report).toBeDefined());
    report!({ dataArray: rows(2) }, 2);

    //The first page is plotted, the ones after it grow the series
    expect(newPlot).toHaveBeenCalledTimes(1);
    expect((globalThis as any).Plotly.extendTraces).not.toHaveBeenCalled();

    report!({ dataArray: rows(3) }, 5);

    expect(newPlot).toHaveBeenCalledTimes(1);
    expect((globalThis as any).Plotly.extendTraces).toHaveBeenCalledWith(
      "pico-1",
      {
        x: [["2026-01-01T00:00:00Z", "2026-01-02T00:00:00Z", "2026-01-03T00:00:00Z"]],
        y: [[0, 1, 2]],
      },
      [0],
    );
  });

  it("loads the observations of the range it was panned to", async () => {
    const queries: Array<QueryObject> = [];
    const { newPlot } = await open(async (configure: (query: QueryObject) => QueryObject) => {
      const query = configure({ entityType: "Datastreams" } as QueryObject);
      queries.push(query);
      //The first answer covers a few days, the panned range answers with a point of its own
      return {
        value: {
          dataArray: queries.length == 1 ? rows(3) : [[9, "2025-12-30T00:00:00Z", 9]],
        },
      };
    });

    await vi.waitFor(() => expect(newPlot).toHaveBeenCalled());
    await newPlot.listeners["plotly_relayout"]({
      "xaxis.range[0]": "2025-12-01 00:00:00",
      "xaxis.range[1]": "2026-01-02 00:00:00",
    });

    //Only the part before the loaded observations is requested
    expect(queries[1].filter).toBe(
      "phenomenonTime ge 2025-12-01T00:00:00.000Z and phenomenonTime le 2026-01-01T00:00:00.000Z",
    );
    expect((globalThis as any).Plotly.prependTraces).toHaveBeenCalledWith(
      "pico-1",
      { x: [["2025-12-30T00:00:00Z"]], y: [[9]] },
      [0],
    );
  });

  it("asks for nothing while the pan stays inside the loaded observations", async () => {
    var calls = 0;
    const { newPlot } = await open(async () => {
      calls++;
      return { value: { dataArray: rows(3) } };
    });

    await vi.waitFor(() => expect(newPlot).toHaveBeenCalled());
    await newPlot.listeners["plotly_relayout"]({
      "xaxis.range[0]": "2026-01-01 12:00:00",
      "xaxis.range[1]": "2026-01-02 12:00:00",
    });

    expect(calls).toBe(1);
  });

  it("keeps the axis reset from loading anything", async () => {
    var calls = 0;
    const { newPlot } = await open(async () => {
      calls++;
      return { value: { dataArray: rows(3) } };
    });

    await vi.waitFor(() => expect(newPlot).toHaveBeenCalled());
    await newPlot.listeners["plotly_relayout"]({ "xaxis.autorange": true });

    expect(calls).toBe(1);
  });

  it("shows a failed request instead of spinning on", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { newPlot, modal } = await open(async () => {
      throw new Error("service is down");
    });

    await vi.waitFor(() => expect(modal()?.textContent).toContain("Failed to load"));
    expect(newPlot).not.toHaveBeenCalled();
  });

  it("aborts the pages that are still to come when the modal closes", async () => {
    var signal: AbortSignal | undefined;
    var resolveData: (data: any) => void = () => {};
    const { newPlot } = await open(
      (_query: (query: QueryObject) => QueryObject, options?: LoadOptions) => {
        signal = options?.signal;
        return new Promise((resolve) => (resolveData = resolve));
      },
    );

    await vi.waitFor(() => expect(signal).toBeDefined());
    document.querySelector<HTMLElement>(".pico-close")!.click();
    resolveData({ value: { dataArray: rows(3) } });

    await vi.waitFor(() => expect(signal!.aborted).toBe(true));
    expect(newPlot).not.toHaveBeenCalled();
  });
});

describe("addTransparentBackground", () => {
  it("fills a style that only has a border color", () => {
    const style = { color: "red" } as Path;
    addTransparentBackground(style);

    expect(style.fillColor).toBe("rgba(255,0,0,0.0)");
  });

  it("keeps a fill that was configured", () => {
    const style = { color: "red", fillColor: "blue" } as Path;
    addTransparentBackground(style);

    expect(style.fillColor).toBe("blue");
  });

  it("takes a style that is not there", () => {
    expect(() => addTransparentBackground(undefined)).not.toThrow();
  });
});

describe("addCss", () => {
  it("puts the rules into the document", () => {
    addCss(".stam-test{color:red}");

    const styles = [...document.head.querySelectorAll("style")].map((tag) => tag.textContent);
    expect(styles).toContain(".stam-test{color:red}");
  });
});
