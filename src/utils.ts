//@ts-ignore
import picoModal from "picomodal";
import type { Config, Path, QueryObject } from "./types.js";

declare var Plotly: any;

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
export function addTransparentBackground(configStyle: Path) {
  if (configStyle && !configStyle.fillColor) {
    configStyle.fillColor = "rgba(255,0,0,0.0)";
  }
}

/**
 * Adds the default body to a popup
 * @param content_element popup content element
 * @param feature GeoJSON feature that was clicked
 */
export function createDefaultPopup(content_element: HTMLElement, feature: any, config: Config) {
  content_element.innerHTML = "<h3>" + feature.properties.name + "</h3>";

  var list = document.createElement("ul");

  //Iterate all ObservedProperties
  feature.properties.getData.forEach(function (obj: any) {
    //Create new list element
    var li = document.createElement("li");
    li.innerText = obj.observedProperty;
    //Set cursor style on hover
    li.setAttribute("style", "cursor: pointer");
    if (typeof Plotly != "undefined") {
      li.onclick = function () {
        //Create new popup
        picoModal({
          width: "70%",
          content: "",
          modalId: "pico-1",
        })
          .beforeClose(function () {
            Plotly.purge("pico-1");
            //Remove pico-1 element from the DOM
            document.getElementById("pico-1")?.remove();
          })
          .afterShow(async function (modal: any) {
            //Set overflow to hidden, so no scrollbar is shown
            modal.modalElem().style.overflow = "hidden";
            //Set height to 50%
            modal.modalElem().style.height = "50%";

            //Create loader div
            var loader = document.createElement("div");
            //Set class to loader
            loader.classList.add("loader");

            //Add loader to modal
            modal.modalElem().appendChild(loader);

            var reverse: boolean = false;
            //Get data
            var result = await obj.getData(function (query: QueryObject) {
              //Get the dataArray
              query.resultFormat = "dataArray";
              query.orderby = "phenomenonTime asc";
              if (config.plot) {
                var operator: string = "gt";
                //Check if offset is present
                if (config.plot.offset) {
                  //Set top to the offset
                  query.top = Math.abs(config.plot.offset);
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
            });

            //SHOW diagram

            var x: any = [];
            var y: any = [];

            //Get datastream
            var Datastream = result.value;

            //Check if data was returned
            if (Datastream.dataArray) {
              //Reverse array if necessary
              if (reverse) {
                Datastream.dataArray = Datastream.dataArray.reverse();
              }

              Datastream.dataArray.forEach((Observation: any) => {
                //Split data if a timespan was entered, and add both to the x array
                if (Observation[1].indexOf("/") != -1) {
                  x.push(Observation[1].split("/")[0]);
                  x.push(Observation[1].split("/")[1]);

                  y.push(Observation[2]);
                } else {
                  //Time is not a timespan
                  x.push(Observation[1]);
                }
                y.push(Observation[2]);
              });
            }

            //Create trace
            var trace1 = {
              x,
              y,
              type: "scatter",
            };

            var data: any = [trace1];

            //Set both axis to autorange and add the unit as a title
            var layout = {
              xaxis: {
                autorange: true,
              },
              yaxis: {
                autorange: true,
                title: { text: result.unitOfMeasurement.name },
              },
              autosize: true,
            };

            //Remove loader
            loader.remove();

            //Add new plot
            Plotly.newPlot("pico-1", data, layout, { responsive: true });
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
