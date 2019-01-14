////////////////////////////////////////////////////////////////////////////////////
var w_graphic = document.getElementById("graphic").getBoundingClientRect().width;
var h_graphic = document.getElementById("graphic").getBoundingClientRect().height;
var svg = d3.select("#graphic-svg");
var w_map = document.getElementById("graphic-svg").getBoundingClientRect().width;
var h_map = document.getElementById("graphic-svg").getBoundingClientRect().height;
var xScale_posX = d3.scaleLinear() // x scale that converts a position to X coord
                    .domain([0,14700])
                    .range([0, w_map]); // svg/map doesn't start at 0 since centered
/*var xScale_Xpos = d3.scaleLinear() // x scale that converts a X coord to position (to be used in definePath)
                    .domain([0, w_map])
                    .range([0,14700]);*/
var yScale_posY = d3.scaleLinear()
                    .domain([0,14700])
                    .range([h_map,0]);
/*var yScale_Ypos = d3.scaleLinear()
                    .domain([h_map,0])
                    .range([0,14700]);*/
// Colors
var blue = d3.rgb(0, 109, 230);
var red = d3.rgb(126,91,104);

// Variables to store
var currMinute, currNodeIndices, currTeam;
var selectedNodes = [];
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
     .data(dataset_bNodeList)
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
     .style("fill", function(d,i) {
       if (currNodeIndices.includes(i)) { return blue; }
       else { return "none";}
     });
  svg.selectAll("nodesRed")
     .data(dataset_rNodeList)
     .enter()
     .append("circle")
     .attr("class", "nodes")
     .attr("id", "nodesRed")
     .attr("cx", function(d) {
        return xScale_posX(d.pos[0]);
     })
     .attr("cy", function(d) {
        return yScale_posY(d.pos[1]);
     })
     .attr("r", 20)
     .style("fill", "none");
}; // end setup

// Plot path positions
function plotPositions(currNode) {
  // Hide nodes
  svg.selectAll(".nodes")
     .style("fill", "none");
  currNode.style("fill", function() {
    if (currTeam=="blue") { return blue; }
    else { return red; }
  })
  // Find paths and plot them
  var currPathIndices = currNode.data()[0].pathIndices; // Get pathIndices associated to node that was clicked on
  if (currTeam=="blue") { // get paths from pathIndices
    var currPaths = currPathIndices.map(i => dataset_bPathList[i]);
  }
  else { var currPaths = currPathIndices.map(i => dataset_rPathList[i]); }
  // Plot paths
  var pathPoints = svg.selectAll(".pathPoints")
                      .data(currPaths);
  pathPoints.exit().remove(); // remove any that are not needed
  var pathPointsEnter = pathPoints.enter()
                                  .append("circle")
                                  .attr("class", "pathPoints")
                                  .attr("cx", function(d) {
                                    return xScale_posX(d.path[(currMinute)][0]); // using currMinute because index is always -1 and keeping it previous minute until a node is clicked on
                                  })
                                  .attr("cy", function(d) {
                                    return yScale_posY(d.path[(currMinute)][1]);
                                  })
                                  .attr("r", 5);
  pathPoints = pathPoints.merge(pathPointsEnter);
  pathPoints.attr("cx", function(d) {
              return xScale_posX(d.path[(currMinute)][0]);
            })
            .attr("cy", function(d) {
              return yScale_posY(d.path[(currMinute)][1]);
            })
            .style("fill", "white");
}; // end plotPositions

// Update nodes
function updateNodes(clickedNode) {
  var currParentIndex = clickedNode.data()[0].index;
  // BLUE
  var nodesBlue = svg.selectAll("#nodesBlue")
                     .data(currNodeIndices.map(i => dataset_bNodeList[i]).filter(function(d,i) {
                       return d.parent == currParentIndex;
                     }))
  nodesBlue.exit().remove();
  var nodesBlueEnter = svg.enter()
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
            .style("fill", function() {
              if (currTeam == "blue") { return blue; }
              else { return "none"; }
            });
}; // end updateNodes

// Init function
function init() {
  // Initial settings
  currMinute = 2;
  currNodeIndices = dataset_Lookup[currMinute-2].nodeIndices;
  currTeam = "blue";

  setup();

  // Interactivity
  // Toggle from blue and red team
  d3.select("#button-blue").on("click", function() {
    currTeam = "blue";
    d3.selectAll("#nodesRed").style("fill", "none"); // Hide red
    d3.selectAll("#nodesBlue") // Show blue
      .style("fill", function(d,i) {
        if (currNodeIndices.includes(i)) { return blue; }
        else { return "none";}
      });
    // Change button styles
    d3.select(this)
      .style("background-color", d3.rgb(79,39,79))
      .style("color", "white");
    d3.select("#button-red")
      .style("background-color", "white")
      .style("color", d3.color("#a19da8"));
  }); // end on blue button select
/*  d3.select("#button-red").on("click", function() {
    currTeam = "red";
    d3.selectAll("#nodesBlue").style("fill", "none"); // Hide blue
    d3.selectAll("#nodesRed") // Show red
      .style("fill", function(d,i) {
        if (currNodeIndices.includes(i)) { return red; }
        else { return "none";}
      });
    // Change button styles
    d3.select(this)
      .style("background-color", d3.rgb(79,39,79))
      .style("color", "white");
    d3.select("#button-blue")
      .style("background-color", "white")
      .style("color", d3.color("#a19da8"));
  }); // end on blue button select */

  // Mouseover nodes to see possible positions
  /*svg.selectAll(".nodes")
     .on("mouseover", function() {
       plotPositions(d3.select(this));
       svg.select("#minuteMark").text("Minute "+(currMinute+1)); // change minute mark when hovered
     })
     .on("mouseout", function() {
       svg.selectAll(".pathPoints").style("fill", "none");
       if (currTeam == "blue") {
         svg.selectAll("#nodesBlue")
            .filter(function(d,i) { return currNodeIndices.includes(i); })
            .style("fill", blue)
       }
       else {
         svg.selectAll("#nodesRed")
            .filter(function(d,i) { return currNodeIndices.includes(i); })
            .style("fill", red)
       }
       svg.select("#minuteMark").text("Minute "+currMinute); // change minute mark back
     })*/

  // When a node is clicked
  svg.selectAll(".nodes")
     .on("click", function() {
       var currNode = d3.select(this);
       // Update minute
       currMinute = currMinute + 1;
       svg.select("#minuteMark").text("Minute " + currMinute);
       // Find node indices
       currNodeIndices = dataset_Lookup[currMinute-2].nodeIndices; 
       // Append selected node to list of selected nodes
       selectedNodes.push(currNode.data()[0].index);
       // Update nodes
       updateNodes(currNode);
     });

  // When the back button is clicked
  d3.select("#button-back").on("click", function() {
    // Update minute
    currMinute = currMinute - 1;
    svg.select("#minuteMark").text("Minute " + currMinute);

    selectedNodes.pop(); // Remove the last node from list
    currNodeIndices = dataset_Lookup[currMinute-2].nodeIndices; // update currNodeIndices
    // Update nodes
    if ((selectedNodes.length) == 0) { // if it's back to minute 2
      svg.selectAll(".nodesBlue")
         .style("fill", function(d,i) {
           if (currNodeIndices.includes(i)) { return blue; }
           else { return "none";}
         });
    }
    else {
      updateNodes(svg.selectAll(".nodesBlue").filter(function(d) { return d.index == selectedNodes[(selectedNodes.length-1)]; }))
    }

  })
}; // end init function

////////////////////////////////////////////////////////////////////////////////////
// Load data
var dataset_Lookup, dataset_bNodeList, dataset_bPathList, dataset_rNodeList, dataset_rPathList;
function rowConverterNodes(d) {
  return {
    index: parseInt(d.index),
    pos: [parseInt(d.pos.split(",")[0].replace("[", "")), parseInt(d.pos.split(",")[1].replace("]", ""))],
    parent: parseInt(d.parent),
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
      d3.csv('Data/rNodeList.csv', rowConverterNodes, function(data_rNodeList) {
        d3.csv('Data/rPathList.csv', rowConverterPaths, function(data_rPathList) {
          dataset_Lookup = data_bLookup;
          dataset_bNodeList = data_bNodeList;
          dataset_bPathList = data_bPathList;
          dataset_rNodeList = data_rNodeList;
          dataset_rPathList = data_rPathList;

          init();

        });
      });
    });
  });
});
