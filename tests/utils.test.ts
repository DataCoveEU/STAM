// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { addCss, addTransparentBackground, createDefaultPopup } from "../src/utils";
import type { Config, GeoJsonFeature, Path } from "../src/types";

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
