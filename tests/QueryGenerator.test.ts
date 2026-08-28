import { describe, expect, it } from "vitest";
import { QueryGenerator } from "../src/QueryGenerator";
import type { Config, QueryObject } from "../src/types";

//A minimal configuration: only baseUrl and queryObject are required
const config = (queryParameters?: Map<string, string>): Config => ({
  baseUrl: "https://sensor.example/v1.1",
  queryObject: { entityType: "Things" },
  queryParameters,
});

describe("QueryGenerator", () => {
  it("creates a collection query with filters and selected fields", () => {
    const query: QueryObject = {
      entityType: "Things",
      filter: "name eq 'station'",
      select: ["id", "name"],
      top: 10,
    };

    expect(new QueryGenerator(query, config()).toString()).toBe(
      "Things?$filter=name eq 'station'&$select=id,name&$top=10",
    );
  });

  it("creates entity paths with nested expansions and query parameters", () => {
    const query: QueryObject = {
      entityType: "Things",
      id: 7,
      expand: [
        {
          entityType: "Locations",
          select: ["id", "location"],
        },
      ],
    };

    expect(
      new QueryGenerator(
        query,
        config(
          new Map([
            ["count", "true"],
            ["token", "abc"],
          ]),
        ),
      ).toString(),
    ).toBe("Things(7)?$expand=Locations($select=id,location)&count=true&token=abc");
  });

  it("formats an expanded entity without a top-level query string", () => {
    const query: QueryObject = {
      entityType: "Datastreams",
      id: 3,
      pathSuffix: "Observations",
    };

    expect(new QueryGenerator(query, config()).toString(false)).toBe("Datastreams(3)");
  });
});
