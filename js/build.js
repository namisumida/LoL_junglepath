////////////////////////////////////////////////////////////////////////////////////
var w_graphic = document.getElementById("graphic").getBoundingClientRect().width;
var h_graphic = document.getElementById("graphic").getBoundingClientRect().height;
var svg = d3.select("#graphic-svg");
var w_map = document.getElementById("graphic-svg").getBoundingClientRect().width;
var h_map = document.getElementById("graphic-svg").getBoundingClientRect().height;
var xScale_posX = d3.scaleLinear() // x scale that converts a position to X coord
                    .domain([0,14700])
                    .range([0, w_map]); // svg/map doesn't start at 0 since centered
var yScale_posY = d3.scaleLinear()
                    .domain([0,14700])
                    .range([h_map,0]);
// Colors
var blue = d3.rgb(0, 109, 230);
var red = d3.rgb(126,91,104);
// Variables to store
var currMinute, currNodeIndices, currTeam;
var selectedNodes = [0];
////////////////////////////////////////////////////////////////////////////////////
// Convenient helper functions
d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
////////////////////////////////////////////////////////////////////////////////////
// Set up function
function setup() {
  // Minute mark
  svg.append("text")
     .text("Minute "+currMinute)
     .attr("id", "minuteMark")
     .attr("x", w_map-5)
     .attr("y", h_map-5);

  // Nodes - csv
  svg.selectAll("nodesBlue")
     .data(currNodeIndices.map(i => dataset_bNodeList[i]))
     .enter()
     .append("circle")
     .attr("class", "nodes")
     .attr("id", "nodesBlue")
     .attr("cx", function(d) {
       return xScale_posX(d.pos[0]);
     })
     .attr("cy", function(d) {
       return yScale_posY(d.pos[1]);
     })
     .attr("r", 20)
     .style("fill", blue);
  svg.selectAll(".nodes")
     .on("click", function() {
       updateNodeClick(d3.select(this));
     });
  // Helper - to be deleted soon
  svg.selectAll("nodesLabel")
     .data(currNodeIndices.map(i => dataset_bNodeList[i]))
     .enter()
     .append("text")
     .attr("class", "nodeLabels")
     .attr("id", "nodeLabelsBlue")
     .attr("x", function(d) {
       return xScale_posX(d.pos[0]);
     })
     .attr("y", function(d) {
       return yScale_posY(d.pos[1]);
     })
     .text(function(d) { return d.index; })

}; // end setup
// What happens when a node is clicked - need to update it every time a new node is added
function updateNodeClick(currNode) {
  var currData = currNode.data()[0];

  // Update minute
  currMinute = d3.min([currMinute+1, 5], function(d) { return d; }); // don't want it to be larger than 5
  svg.select("#minuteMark").text("Minute " + currMinute);

  // Figure out transition delays/durations for path positions
  var currPathIndices = currData.pathIndices;


  // Show individual path positions associated to node that was clicked
  plotPositions(currPathIndices, true);

  // Append selected node to list of selected nodes
  selectedNodes.push(currData.index); // we only need the index because we only care about it as a parent index

  // Plot nodes if min < 5
  if (currMinute < 5) {
    // Find node indices
    if (currTeam == "blue") { currNodeIndices = dataset_bLookup[currMinute-2].nodeIndices; }
    else { currNodeIndices = dataset_rLookup[currMinute-2].nodeIndices; }
  }
  else { currNodeIndices = []; }
  plotNewNodes(currData.index);
}; // end updateNodeClick
// Update nodes
function plotNewNodes(parentIndex) {
  if (currTeam == "blue") {  // BLUE
    var nodesBlue = svg.selectAll(".nodes")
                       .data(currNodeIndices.map(i => dataset_bNodeList[i]).filter(function(d) {
                         return d.parent == parentIndex;
                       }));
    nodesBlue.exit().remove();
    var nodesBlueEnter = nodesBlue.enter()
                                  .append("circle")
                                  .attr("class", "nodes")
                                  .attr("id", "nodesBlue")
                                  .attr("cx", function(d) {
                                    return xScale_posX(d.pos[0]);
                                  })
                                  .attr("cy", function(d) {
                                    return yScale_posY(d.pos[1]);
                                  })
                                  .attr("r", 20);
    nodesBlue = nodesBlue.merge(nodesBlueEnter);
    nodesBlue.attr("cx", function(d) {
                return xScale_posX(d.pos[0]);
              })
              .attr("cy", function(d) {
                return yScale_posY(d.pos[1]);
              })
              .attr("r", 20)
              .style("fill", blue)
              .on("click", function() {
                updateNodeClick(d3.select(this));
              })
              .moveToFront();
    // Labels
    var nodeLabelsBlue = svg.selectAll(".nodeLabels")
                            .data(currNodeIndices.map(i => dataset_bNodeList[i]).filter(function(d) {
                              return d.parent == parentIndex;
                            }));
    nodeLabelsBlue.exit().remove();
    var nodeLabelsBlueEnter = nodeLabelsBlue.enter()
                                            .append("text")
                                            .attr("class", "nodeLabels")
                                            .attr("id", "nodeLabelsBlue")
                                            .attr("x", function(d) {
                                              return xScale_posX(d.pos[0]);
                                            })
                                            .attr("y", function(d) {
                                              return yScale_posY(d.pos[1]);
                                            })
                                            .text(function(d,i) { return i; });
    nodeLabelsBlue = nodeLabelsBlue.merge(nodeLabelsBlueEnter);
    nodeLabelsBlue.attr("x", function(d) {
                      return xScale_posX(d.pos[0]);
                    })
                    .attr("y", function(d) {
                      return yScale_posY(d.pos[1]);
                    })
                    .text(function(d) { return d.index; })
                    .moveToFront();
  } // end if blue statement
  else { // RED
    var nodesRed = svg.selectAll(".nodes")
                       .data(currNodeIndices.map(i => dataset_rNodeList[i]).filter(function(d) {
                         return d.parent == parentIndex;
                       }));
    nodesRed.exit().remove();
    var nodesRedEnter = nodesRed.enter()
                                .append("circle")
                                .attr("class", "nodes")
                                .attr("id", "nodesRed")
                                .attr("cx", function(d) {
                                  return xScale_posX(d.pos[0]);
                                })
                                .attr("cy", function(d) {
                                  return yScale_posY(d.pos[1]);
                                })
                                .attr("r", 20);
    nodesRed = nodesRed.merge(nodesRedEnter);
    nodesRed.attr("cx", function(d) {
              return xScale_posX(d.pos[0]);
            })
            .attr("cy", function(d) {
              return yScale_posY(d.pos[1]);
            })
            .attr("r", 20)
            .style("fill", red)
            .on("click", function() {
              updateNodeClick(d3.select(this));
            })
            .moveToFront();
    // Labels
    var nodeLabelsRed = svg.selectAll(".nodeLabels")
                            .data(currNodeIndices.map(i => dataset_rNodeList[i]).filter(function(d) {
                              return d.parent == parentIndex;
                            }));
    nodeLabelsRed.exit().remove();
    var nodeLabelsRedEnter = nodeLabelsRed.enter()
                                          .append("text")
                                          .attr("class", "nodeLabels")
                                          .attr("id", "nodeLabelsRed")
                                          .attr("x", function(d) {
                                            return xScale_posX(d.pos[0]);
                                          })
                                          .attr("y", function(d) {
                                            return yScale_posY(d.pos[1]);
                                          })
                                          .text(function(d,i) { return i; });
    nodeLabelsRed = nodeLabelsRed.merge(nodeLabelsRedEnter);
    nodeLabelsRed.attr("x", function(d) {
                    return xScale_posX(d.pos[0]);
                  })
                  .attr("y", function(d) {
                    return yScale_posY(d.pos[1]);
                  })
                  .text(function(d) { return d.index; })
                  .moveToFront();
  }; // end else red
}; // end plotNewNodes
// Plot path positions
function plotPositions(currPathIndices, delay) {
  // get paths from pathIndices
  if (currTeam=="blue") { var currPaths = currPathIndices.map(i => dataset_bPathList[i]); }
  else { var currPaths = currPathIndices.map(i => dataset_rPathList[i]); }
  // Plot paths
  var pathPoints = svg.selectAll(".pathPoints")
                      .data(currPaths);
  pathPoints.exit().remove(); // remove any that are not needed
  var pathPointsEnter = pathPoints.enter()
                                  .append("circle")
                                  .attr("class", "pathPoints")
                                  .attr("cx", function(d) {
                                    return xScale_posX(d.path[(currMinute-1)][0]);
                                  })
                                  .attr("cy", function(d) {
                                    return yScale_posY(d.path[(currMinute-1)][1]);
                                  })
                                  .attr("r", 5)
                                  .style("fill", "none");
  pathPoints = pathPoints.merge(pathPointsEnter);
  pathPoints.attr("cx", function(d) {
              return xScale_posX(d.path[(currMinute-1)][0]);
            })
            .attr("cy", function(d) {
              return yScale_posY(d.path[(currMinute-1)][1]);
            })
            .transition()
            .delay(function(d,i) {
              if (delay) { return i/(currPathIndices.length/800); }
              else { return 0; }
            })
            .style("fill", "white");
}; // end plotPositions
// Function for when the back button is clicked: remove most recently selected node and replot nodes
function backClick() {
  // Remove previous node from list
  selectedNodes.pop();
  // Update minute
  currMinute = d3.max([currMinute-1, 2], function(d) { return d; }); // don't want it to be smaller than 2
  svg.select("#minuteMark").text("Minute " + currMinute);
  // update currNodeIndices
  if (currTeam == "blue") { currNodeIndices = dataset_bLookup[currMinute-2].nodeIndices; }
  else { currNodeIndices = dataset_rLookup[currMinute-2].nodeIndices; }
  // Update nodes
  if (selectedNodes.length > 1) { // if it's not at Minute 2 (back to the beginning)
    if (currTeam == "blue") { plotPositions(dataset_bNodeList[selectedNodes[selectedNodes.length-1]].pathIndices, false); }
    else { plotPositions(dataset_rNodeList[selectedNodes[selectedNodes.length-1]].pathIndices, false); };
    plotNewNodes(selectedNodes[selectedNodes.length-1]); // plot new nodes
  }
  else {
    svg.selectAll(".pathPoints").style("fill", "none"); // hide all path points
    plotNewNodes(0); // plot minute 2 nodes
  }
}; // end backClick
// Resent settings
function reset() {
  currMinute = 2; // reset minute
  // update currNodeIndices
  if (currTeam == "blue") { currNodeIndices = dataset_bLookup[currMinute-2].nodeIndices; }
  else { currNodeIndices = dataset_rLookup[currMinute-2].nodeIndices; }

  // remove all path positions
  svg.selectAll(".pathPoints").exit().remove();
}; // end reset function
// Init function
function init() {
  // Initial settings
  reset();
  currTeam = "blue";

  // Create elements for initial load
  setup();

  // Interactivity
  // Toggle from blue and red team
  d3.select("#button-blue").on("click", function() {
    // start over when color is changed
    reset();
    svg.select("#minuteMark")
       .text("Minute " + currMinute);
    currTeam = "blue";
    plotNewNodes(0);
    // Change button styles
    d3.select(this)
      .style("background-color", d3.rgb(79,39,79))
      .style("color", "white");
    d3.select("#button-red")
      .style("background-color", "white")
      .style("color", d3.color("#a19da8"));
  }); // end on blue button select

  d3.select("#button-red").on("click", function() {
    // start over when color is changed
    reset();
    svg.select("#minuteMark")
       .text("Minute " + currMinute);
    currTeam = "red";
    plotNewNodes(0);
    // Change button styles
    d3.select(this)
      .style("background-color", d3.rgb(79,39,79))
      .style("color", "white");
    d3.select("#button-blue")
      .style("background-color", "white")
      .style("color", d3.color("#a19da8"));
  }); // end on red button select

  // When the back button is clicked
  d3.select("#button-back").on("click", function() {
    backClick();
  })
}; // end init function
////////////////////////////////////////////////////////////////////////////////////
// Load data
var dataset_Lookup, dataset_bNodeList, dataset_bPathList, dataset_rNodeList, dataset_rPathList;
function rowConverterNodes(d,i) {
  return {
    index: i,
    pos: [parseInt(d.pos.split(",")[0].replace("[", "")), parseInt(d.pos.split(",")[1].replace("]", ""))],
    parent: parseInt(d.parent.replace("", "0")),
    pathIndices: d.pathIndices.split(",").map(function(d) { return parseInt(d.replace("[","")); })
  }
}; // end row converter nodes
function rowConverterLookup(d) {
  return {
    nodeIndices: d.nodeIndices.split(",").map(function(d) { return parseInt(d.replace("[","")); })
  }
}; // end rowconverter lookup
function rowConverterPaths(d) {
  return {
    path: d.path.split("],[").map(function(d) { return d.replace("[[", "").replace("]]","").split(",").map(function(d) { return parseInt(d); }); })
  }
}; // end rowconverter paths
d3.csv('Data/bLookupTable.csv', rowConverterLookup, function(data_bLookup) {
  d3.csv('Data/bNodeList.csv', rowConverterNodes, function(data_bNodeList) {
    d3.csv('Data/bPathList.csv', rowConverterPaths, function(data_bPathList) {
      d3.csv('Data/rLookupTable.csv', rowConverterLookup, function(data_rLookup) {
        d3.csv('Data/rNodeList.csv', rowConverterNodes, function(data_rNodeList) {
          d3.csv('Data/rPathList.csv', rowConverterPaths, function(data_rPathList) {
            dataset_bLookup = data_bLookup;
            dataset_bNodeList = data_bNodeList;
            dataset_bPathList = data_bPathList;
            dataset_rLookup = data_rLookup;
            dataset_rNodeList = data_rNodeList;
            dataset_rPathList = data_rPathList;

            init();

          });
        });
      });
    });
  });
});
