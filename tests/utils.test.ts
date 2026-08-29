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
    const newPlot = vi.fn();
    (globalThis as any).Plotly = { newPlot, purge: vi.fn() };
    return newPlot;
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
    Array.from({ length: count }, (_, index) => [index, `2026-01-0${(index % 9) + 1}`, index]);

  afterEach(() => {
    delete (globalThis as any).Plotly;
    document.getElementById("pico-1")?.remove();
  });

  it("plots the observations it loaded", async () => {
    const { newPlot } = await open(async () => ({ value: { dataArray: rows(3) } }));

    await vi.waitFor(() => expect(newPlot).toHaveBeenCalled());
    expect(newPlot.mock.calls[0][1][0].type).toBe("scatter");
    expect(newPlot.mock.calls[0][1][0].x).toHaveLength(3);
  });

  it("draws a long series with WebGL, so it stays responsive", async () => {
    const { newPlot } = await open(async () => ({ value: { dataArray: rows(2001) } }));

    await vi.waitFor(() => expect(newPlot).toHaveBeenCalled());
    expect(newPlot.mock.calls[0][1][0].type).toBe("scattergl");
  });

  it("says so when the limit cut the series off", async () => {
    const { newPlot } = await open(async () => ({ value: { dataArray: rows(5) } }), {
      ...config,
      maxEntities: 5,
    });

    await vi.waitFor(() => expect(newPlot).toHaveBeenCalled());
    expect(newPlot.mock.calls[0][2].title.text).toBe("First 5 observations");
  });

  it("plots nothing for a datastream without observations", async () => {
    const { newPlot, modal } = await open(async () => ({ value: { dataArray: [] } }));

    await vi.waitFor(() => expect(modal()?.textContent).toContain("No observations"));
    expect(newPlot).not.toHaveBeenCalled();
  });

  it("tells how many observations are loaded already", async () => {
    var report: LoadOptions["onProgress"];
    const { modal } = await open(
      (_query: (query: QueryObject) => QueryObject, options?: LoadOptions) => {
        report = options?.onProgress;
        return new Promise(() => {});
      },
    );

    await vi.waitFor(() => expect(report).toBeDefined());
    report!(1500);

    expect(modal()?.textContent).toContain("1500 observations");
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
