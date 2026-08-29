//@ts-ignore
import picoModal from "picomodal";
import type {
  Config,
  GeoJsonFeature,
  LoadedPage,
  ObservationData,
  ObservedPropertyData,
  Path,
  QueryObject,
} from "./types";
import { DEFAULT_MAX_ENTITIES } from "./STAInterface";

/** The Plotly browser build, as the consuming page loads it */
declare var Plotly:
  | {
      newPlot(target: string, data: Array<unknown>, layout: unknown, config: unknown): void;
      extendTraces(target: string, data: unknown, traces: Array<number>): void;
      prependTraces(target: string, data: unknown, traces: Array<number>): void;
      relayout(target: string, layout: unknown): void;
      purge(target: string): void;
    }
  | undefined;

//A series longer than this is drawn with WebGL instead of SVG
const DEFAULT_WEBGL_FROM = 2000;

/**
 * The observations of a page as plot points
 * @param page rows of a dataArray query
 * @returns the times and the results, a timespan split into its two ends
 */
function pointsOf(page: LoadedPage): { x: Array<unknown>; y: Array<unknown> } {
  const x: Array<unknown> = [];
  const y: Array<unknown> = [];
  const ROWS = Array.isArray(page) ? [] : (page?.dataArray ?? []);

  ROWS.forEach((Observation) => {
    const time = String(Observation[1]);

    //Split data if a timespan was entered, and add both to the x array
    if (time.indexOf("/") != -1) {
      x.push(time.split("/")[0]);
      x.push(time.split("/")[1]);

      y.push(Observation[2]);
    } else {
      //Time is not a timespan
      x.push(time);
    }
    y.push(Observation[2]);
  });

  return { x, y };
}

/** The plot element, once Plotly turned it into a graph div */
type GraphDiv = HTMLElement & {
  on?: (event: string, listener: (event: RelayoutEvent) => void) => void;
};

/** What Plotly reports when the plot was panned or zoomed */
type RelayoutEvent = Record<string, unknown> & { "xaxis.range"?: Array<unknown> };

/**
 * The time range a pan or zoom brought into view
 * @param event the relayout event of the plot
 * @returns the range as SensorThings timestamps, undefined when the axis was reset
 */
function rangeOf(event: RelayoutEvent): { from: string; to: string } | undefined {
  const RANGE = event["xaxis.range"];
  const FROM = event["xaxis.range[0]"] ?? RANGE?.[0];
  const TO = event["xaxis.range[1]"] ?? RANGE?.[1];
  if (FROM == undefined || TO == undefined) return undefined;

  const START = timestampOf(FROM);
  const END = timestampOf(TO);
  return START && END ? { from: START, to: END } : undefined;
}

/**
 * A date of a Plotly axis as a SensorThings timestamp
 * @param value the axis value, a date string or a number of milliseconds
 * @returns the ISO timestamp, undefined when the value is not a date
 */
function timestampOf(value: unknown): string | undefined {
  if (typeof value == "number") {
    const MILLIS = new Date(value);
    return isNaN(MILLIS.getTime()) ? undefined : MILLIS.toISOString();
  }

  const TEXT = String(value).replace(" ", "T");
  //Plotly hands out UTC without saying so, a timestamp of the service says it itself
  const DATE = new Date(/([zZ]|[+-]\d{2}:?\d{2})$/.test(TEXT) ? TEXT : `${TEXT}Z`);
  return isNaN(DATE.getTime()) ? undefined : DATE.toISOString();
}

/**
 * Requests the observations of a time range
 * @param observedProperty the observed property of the plot
 * @param range the range to load
 * @param signal aborts the request when the plot is closed
 * @returns the points of the range
 */
async function loadRange(
  observedProperty: ObservedPropertyData,
  range: { from: string; to: string },
  signal: AbortSignal,
) {
  const DATA = await observedProperty.getData(
    (query: QueryObject) => {
      query.resultFormat = "dataArray";
      query.orderby = "phenomenonTime asc";
      query.filter = `phenomenonTime ge ${range.from} and phenomenonTime le ${range.to}`;
      return query;
    },
    { signal },
  );

  return pointsOf(DATA.value);
}

/**
 * Loads the observations of a range the plot does not hold yet, whenever it is panned there
 * @param observedProperty the observed property of the plot
 * @param target id of the plot element
 * @param covered the range the plot already holds, grown by every load
 * @param signal aborts the requests when the plot is closed
 */
function loadWhilePanning(
  observedProperty: ObservedPropertyData,
  target: string,
  covered: { from?: string; to?: string },
  signal: AbortSignal,
) {
  const PLOT = document.getElementById(target) as GraphDiv | null;
  //An older Plotly, or a plot that never made it onto the page
  if (!PLOT?.on) return;

  var loading = false;

  PLOT.on("plotly_relayout", async function (event: RelayoutEvent) {
    if (loading || signal.aborted) return;

    const RANGE = rangeOf(event);
    if (!RANGE || !covered.from || !covered.to) return;

    //Only what lies outside of the loaded observations is still to come
    const BEFORE = RANGE.from < covered.from ? { from: RANGE.from, to: covered.from } : undefined;
    const AFTER = RANGE.to > covered.to ? { from: covered.to, to: RANGE.to } : undefined;
    if (!BEFORE && !AFTER) return;

    loading = true;
    try {
      if (BEFORE) {
        const POINTS = await loadRange(observedProperty, BEFORE, signal);
        //The range counts as loaded even when it held nothing, so panning there stops asking
        covered.from = BEFORE.from;
        if (POINTS.x.length) {
          Plotly!.prependTraces(target, { x: [POINTS.x], y: [POINTS.y] }, [0]);
        }
      }

      if (AFTER) {
        const POINTS = await loadRange(observedProperty, AFTER, signal);
        covered.to = AFTER.to;
        if (POINTS.x.length) {
          Plotly!.extendTraces(target, { x: [POINTS.x], y: [POINTS.y] }, [0]);
        }
      }
    } catch (e) {
      if (!signal.aborted) console.error("Failed to load the observations of the range", e);
    } finally {
      loading = false;
    }
  });
}

/**
 * Add css to the document
 * @param css Css string
 */
export function addCss(css: string) {
  const head = document.head;
  const style = document.createElement("style");

  head.appendChild(style);

  style.appendChild(document.createTextNode(css));
}

/**
 * Helper function, to set the background of an element to transparent, if nothing was set.
 * This is necessary due to the behavior of leaflet, to set the background to the border color, if no fill color was set
 * @param configStyle The config to edit
 */
export function addTransparentBackground(configStyle: Path | undefined) {
  if (configStyle && !configStyle.fillColor) {
    configStyle.fillColor = "rgba(255,0,0,0.0)";
  }
}

/**
 * Adds the default body to a popup
 * @param content_element popup content element
 * @param feature GeoJSON feature that was clicked
 */
export function createDefaultPopup(
  content_element: HTMLElement,
  feature: GeoJsonFeature,
  config: Config,
) {
  content_element.innerHTML = "<h3>" + feature.properties.name + "</h3>";

  var list = document.createElement("ul");

  //Iterate all ObservedProperties
  feature.properties.getData?.forEach(function (obj: ObservedPropertyData) {
    //Create new list element
    var li = document.createElement("li");
    li.innerText = obj.observedProperty;
    //Set cursor style on hover
    li.setAttribute("style", "cursor: pointer");
    if (typeof Plotly != "undefined") {
      li.onclick = function () {
        //Closing the modal stops the request and the pages it still has to follow
        const ABORT = new AbortController();

        //Create new popup
        picoModal({
          width: "70%",
          content: "",
          modalId: "pico-1",
        })
          .beforeClose(function () {
            ABORT.abort();
            Plotly!.purge("pico-1");
            //Remove pico-1 element from the DOM
            document.getElementById("pico-1")?.remove();
          })
          .afterShow(async function (modal: { modalElem(): HTMLElement }) {
            //Set overflow to hidden, so no scrollbar is shown
            modal.modalElem().style.overflow = "hidden";
            //Set height to 50%
            modal.modalElem().style.height = "50%";

            //Create loader div
            var loader = document.createElement("div");
            //Set class to loader
            loader.classList.add("loader");

            //Tells how far a long series got, right below the loader
            var status = document.createElement("div");
            status.setAttribute(
              "style",
              "position:fixed;left:0;right:0;top:calc(50% + 50px);text-align:center",
            );

            //Add loader to modal
            modal.modalElem().append(loader, status);

            var reverse: boolean = false;
            var limit: number = config.maxEntities ?? DEFAULT_MAX_ENTITIES;

            const CONFIGURE = function (query: QueryObject) {
              //Get the dataArray
              query.resultFormat = "dataArray";
              query.orderby = "phenomenonTime asc";
              if (config.plot) {
                var operator: string = "gt";
                //Check if offset is present
                if (config.plot.offset) {
                  //Set top to the offset
                  query.top = Math.abs(config.plot.offset);
                  limit = query.top;
                  //Check if number is negative
                  if (Math.sign(config.plot.offset) == -1) {
                    //Reverse array after getting the data, due to the orderby
                    reverse = true;
                    //Reverse order to get the last $top observations
                    query.orderby = "phenomenonTime desc";
                    //Change operator to lower than
                    operator = "lt";
                  }

                  //Add filter
                  query.filter = `phenomenonTime ${operator} ${config.plot.startDate.toISOString()}`;
                } else {
                  //Check if end data is present
                  if (config.plot.endDate) {
                    //Filter for startDate and endDate
                    query.filter = `(phenomenonTime gt ${config.plot.startDate.toISOString()}) and (phenomenonTime lt ${config.plot.endDate.toISOString()})`;
                  }
                }
              }
              return query;
            };

            //The axes stay the same while the series grows
            const AXIS = { autorange: true, title: { text: "" } };
            const LAYOUT = {
              xaxis: { autorange: true },
              yaxis: AXIS,
              autosize: true,
            };

            //A plot that may grow to the limit is drawn with WebGL right away
            const TYPE = limit > DEFAULT_WEBGL_FROM ? "scattergl" : "scatter";

            var plotted = false;

            //The range the plot holds, so panning past it knows what to load
            const COVERED: { from?: string; to?: string } = {};
            const COVER = function (points: { x: Array<unknown> }) {
              COVERED.from ??= timestampOf(points.x[0]);
              COVERED.to = timestampOf(points.x[points.x.length - 1]) ?? COVERED.to;
            };

            //Draw a page as soon as it is in, instead of waiting for the last one
            const DRAW = function (page: LoadedPage, loaded: number) {
              if (ABORT.signal.aborted) return;

              //Newest first is only plottable once everything is in and reversed
              if (reverse) {
                status.innerText = `${loaded} observations`;
                return;
              }

              const POINTS = pointsOf(page);
              if (POINTS.x.length == 0) return;

              COVER(POINTS);

              if (plotted) {
                //Grow the series the plot already shows
                Plotly!.extendTraces("pico-1", { x: [POINTS.x], y: [POINTS.y] }, [0]);
                return;
              }

              loader.remove();
              status.remove();
              Plotly!.newPlot("pico-1", [{ x: POINTS.x, y: POINTS.y, type: TYPE }], LAYOUT, {
                responsive: true,
              });
              plotted = true;
            };

            //Get data, page by page
            var result: ObservationData;
            try {
              result = await obj.getData(CONFIGURE, { signal: ABORT.signal, onPage: DRAW });
            } catch (e) {
              //The closed modal aborted the request, there is nothing left to show
              if (ABORT.signal.aborted) return;

              loader.remove();
              status.innerText = "Failed to load the observations";
              console.error("Failed to load the observations", e);
              return;
            }

            //The modal closed while the observations were loading
            if (ABORT.signal.aborted) return;

            const UNIT = { title: { text: result.unitOfMeasurement?.name } };

            if (plotted) {
              //Everything is drawn already, only the unit is still to come
              Plotly!.relayout("pico-1", { yaxis: { ...AXIS, ...UNIT } });
              loadWhilePanning(obj, "pico-1", COVERED, ABORT.signal);
              return;
            }

            loader.remove();

            //Nothing was streamed: a reversed series, or a getData that reports no pages
            const DATA = result.value;
            if (reverse && DATA?.dataArray) DATA.dataArray = DATA.dataArray.reverse();

            const POINTS = pointsOf(DATA);
            if (POINTS.x.length == 0) {
              status.innerText = "No observations";
              return;
            }

            status.remove();
            Plotly!.newPlot(
              "pico-1",
              [{ x: POINTS.x, y: POINTS.y, type: TYPE }],
              { ...LAYOUT, yaxis: { ...AXIS, ...UNIT } },
              { responsive: true },
            );

            COVER(POINTS);
            loadWhilePanning(obj, "pico-1", COVERED, ABORT.signal);
          })
          .show();
      };
    }
    //Append to list
    list.appendChild(li);
  });

  //Append list to popup
  content_element.appendChild(list);
}
