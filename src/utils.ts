//@ts-ignore
import picoModal from "picomodal";
import type {
  Config,
  GeoJsonFeature,
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
      purge(target: string): void;
    }
  | undefined;

//A series longer than this is drawn with WebGL instead of SVG
const DEFAULT_WEBGL_FROM = 2000;

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

            //Get data, page by page
            var result: ObservationData;
            try {
              result = await obj.getData(CONFIGURE, {
                signal: ABORT.signal,
                onProgress: (loaded) => (status.innerText = `${loaded} observations`),
              });
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

            loader.remove();

            //SHOW diagram

            const x: Array<unknown> = [];
            const y: Array<unknown> = [];

            //Get datastream
            const Datastream = result.value;
            const ROWS = Datastream?.dataArray ?? [];

            if (ROWS.length == 0) {
              status.innerText = "No observations";
              return;
            }

            status.remove();

            //Reverse array if necessary
            if (reverse) {
              Datastream.dataArray = ROWS.reverse();
            }

            Datastream.dataArray.forEach((Observation) => {
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

            //Create trace, WebGL keeps a long series responsive
            var trace1 = {
              x,
              y,
              type: x.length > DEFAULT_WEBGL_FROM ? "scattergl" : "scatter",
            };

            const data = [trace1];

            //Set both axis to autorange and add the unit as a title
            var layout = {
              xaxis: {
                autorange: true,
              },
              yaxis: {
                autorange: true,
                title: { text: result.unitOfMeasurement?.name },
              },
              autosize: true,
              //Say so when the limit cut the series off
              title:
                ROWS.length >= limit ? { text: `First ${ROWS.length} observations` } : undefined,
            };

            //Add new plot
            Plotly!.newPlot("pico-1", data, layout, { responsive: true });
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
