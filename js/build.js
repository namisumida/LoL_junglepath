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
var numPositionsMin = 5000;
// Variables to store
var currMinute, currTeam;
var selectedNodesList = [];
////////////////////////////////////////////////////////////////////////////////////
// Convenient helper functions
// Function to move items to the front of other overlapping elements
d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
}; // end moveToFront function

////////////////////////////////////////////////////////////////////////////////////
// What happens when a node is clicked - need to update it every time a new node is added
function updateNodeClick(currNode) {

  var currData = currNode.data()[0];
  // Update minute
  currMinute = d3.min([currMinute+1, 5], function(d) { return d; }); // don't want it to be larger than 5
  svg.select("#minuteMark").text("Minute " + currMinute);

  // Find path positions for the next minute
  if (currData.pathIndices.length > numPositionsMin) { // if there are more paths to be displayed than the min
    var currPathIndices = currData.pathIndices.slice(0,numPositionsMin);
  }
  else { var currPathIndices = currData.pathIndices; }

  // Plot the path positions
  if (currTeam == "blue") { plotPositions(currPathIndices.map(i => dataset_bPathList[i])); }
  else { plotPositions(currPathIndices.map(i => dataset_rPathList[i])); }

  // Append selected node to list of selected nodes
  selectedNodesList.push(currData.index); // we only need the index because we only care about it as a parent index
  if (currMinute < 5) { // plot nodes if min<5
    // Find node indices first
    if (currTeam == "blue") { var currNodeIndices = dataset_bLookup[currMinute-2].nodeIndices; }
    else { var currNodeIndices = dataset_rLookup[currMinute-2].nodeIndices; }
  }
  else { currNodeIndices = []; }
  plotSelectedNodes(selectedNodesList); // plot nodes that have already been selected
  plotNewNodes(currNodeIndices, currData.index); // plot the new nodes

}; // end updateNodeClick
// Update nodes
function updateMouseoverRing(currNode) {
  currNode.style("opacity", 1);
  svg.append("circle")
     .attr("class", "nodeRings")
     .attr("id", function() {
       if (currTeam=="blue") { return "nodeRingsBlue"; }
       else { return "nodeRingsRed"; }
     })
     .attr("cx", parseFloat(currNode.attr("cx")))
     .attr("cy", parseFloat(currNode.attr("cy")))
     .attr("r", 15);
}; // end updateMouseoverRing
function plotNewNodes(currNodeIndices, parentIndex) {
  if (currTeam == "blue") {  var dataset_node = dataset_bNodeList; }
  else { var dataset_node = dataset_rNodeList; }
  var nodes = svg.selectAll(".nodes")
                 .data(currNodeIndices.map(i => dataset_node[i]).filter(function(d) {
                   return d.parent == parentIndex;
                 }));
  nodes.exit().remove();
  var nodesEnter = nodes.enter()
                        .append("circle")
                        .attr("class", "nodes")
                        .attr("cx", function(d) {
                          return xScale_posX(d.pos[0]);
                        })
                        .attr("cy", function(d) {
                          return yScale_posY(d.pos[1]);
                        })
                        .attr("r", 7);
  nodes = nodes.merge(nodesEnter);
  nodes.attr("id", function() {
          if (currTeam == "blue") { return "nodesBlue"; }
          else { return "nodesRed"; }
        })
       .attr("cx", function(d) {
          return xScale_posX(d.pos[0]);
        })
        .attr("cy", function(d) {
          return yScale_posY(d.pos[1]);
        })
        .attr("r", 7);
  svg.selectAll(".nodes")
     .moveToFront()
     .on("mouseover", function() {
       updateMouseoverRing(d3.select(this));
     })
     .on("mouseout", function() {
       svg.selectAll(".nodeRings").remove();
       d3.select(this).style("opacity", 0.8);
     })
     .on("click", function() {
       svg.selectAll(".nodeRings").remove();
       updateNodeClick(d3.select(this));
     });

  // Labels
  var nodeLabels = svg.selectAll(".nodeLabels")
                      .data(currNodeIndices.map(i => dataset_node[i]).filter(function(d) {
                        return d.parent == parentIndex;
                      }));
  nodeLabels.exit().remove();
  var nodeLabelsEnter = nodeLabels.enter()
                                  .append("text")
                                  .attr("class", "nodeLabels")
                                  .attr("x", function(d) {
                                    return xScale_posX(d.pos[0]);
                                  })
                                  .attr("y", function(d) {
                                    return yScale_posY(d.pos[1]);
                                  })
                                  .text(function(d,i) { return i; });
  nodeLabels = nodeLabels.merge(nodeLabelsEnter);
  nodeLabels.attr("id", function() {
              if (currTeam == "blue") { return "nodeLabelsBlue"; }
              else { return "nodeLabelsRed"; }
            })
            .attr("x", function(d) {
              return xScale_posX(d.pos[0]);
            })
            .attr("y", function(d) {
              return yScale_posY(d.pos[1]);
            })
            .text(function(d) { return d.index; })
            .moveToFront();
}; // end plotNewNodes
// Plot path positions
function plotSelectedNodes(selectedNodesList) {
  if (currTeam == "blue") { var dataset_node = dataset_bNodeList; }
  else { var dataset_node = dataset_rNodeList; }
  var selectedNodes = svg.selectAll(".selectedNodes")
                         .data(selectedNodesList.map(i => dataset_node[i]));
  selectedNodes.exit().remove(); // remove old ones if not needed
  var selectedNodesEnter = selectedNodes.enter()
                                        .append("circle")
                                        .attr("class", "selectedNodes")
                                        .attr("cx", function(d) {
                                          return xScale_posX(d.pos[0]);
                                        })
                                        .attr("cy", function(d) {
                                          return yScale_posY(d.pos[1]);
                                        })
                                        .attr("r", 7);
  selectedNodes = selectedNodes.merge(selectedNodesEnter);
  selectedNodes.attr("id", function() {
                  if (currTeam == "blue") { return "selectedNodesBlue"; }
                  else { return "selectedNodesRed"; }
                })
                .attr("cx", function(d) {
                  return xScale_posX(d.pos[0]);
                })
                .attr("cy", function(d) {
                  return yScale_posY(d.pos[1]);
                })
                .attr("r", 7);
}; // end plotSelectedNodes
function plotPositions(currPaths) {

  // Plot paths
  var pathPoints = svg.selectAll(".pathPoints")
                      .data(currPaths);
  pathPoints.exit().remove(); // remove any that are not needed
  var pathPointsEnter = pathPoints.enter()
                                  .append("circle")
                                  .attr("class", "pathPoints")
                                  .attr("cx", function(d) { return xScale_posX(d.path[(currMinute-1)][0]); })
                                  .attr("cy", function(d) { return yScale_posY(d.path[(currMinute-1)][1]); })
                                  .attr("r", 2.5);
  pathPoints = pathPoints.merge(pathPointsEnter);
  pathPoints.attr("cx", function(d) { return xScale_posX(d.path[(currMinute-1)][0]); })
            .attr("cy", function(d) { return yScale_posY(d.path[(currMinute-1)][1]); })
            .style("fill", "white");
}; // end plotPositions
// Function for when the back button is clicked: remove most recently selected node and replot nodes
function backClick() {

  // Update minute
  currMinute = d3.max([currMinute-1, 2], function(d) { return d; }); // don't want it to be smaller than 2
  svg.select("#minuteMark").text("Minute " + currMinute);
  // update currNodeIndices (for plotNewNodes function)
  if (currTeam == "blue") { var currNodeIndices = dataset_bLookup[currMinute-2].nodeIndices; }
  else { var currNodeIndices = dataset_rLookup[currMinute-2].nodeIndices; }
  // Remove previous node from list if there are any to be removed
  if (selectedNodesList.length > 1) { // if it's not at Minute 2 (back to the beginning)
    selectedNodesList.pop(); // Remove previous node from list
  }
  // Re plot positions (if any) and nodes
  if (selectedNodesList.length > 1) { // if even after popping last node, there are more nodes...
    if (currTeam == "blue") { // BLUE team
      if (dataset_bNodeList[selectedNodesList[selectedNodesList.length-1]].pathIndices.length > numPositionsMin) { // if the new list of path positions is longer than our min...
        var currPathIndices = dataset_bNodeList[selectedNodesList[selectedNodesList.length-1]].pathIndices.slice(0,numPositionsMin);
      }
      else { var currPathIndices = dataset_bNodeList[selectedNodesList[selectedNodesList.length-1]].pathIndices; }
      plotPositions(currPathIndices.map(i => dataset_bPathList[i]));
    }
    else { // RED team
      if (dataset_rNodeList[selectedNodesList[selectedNodesList.length-1]].pathIndices.length > numPositionsMin) { // if the new list of path positions is longer than our min...
        var currPathIndices = dataset_rNodeList[selectedNodesList[selectedNodesList.length-1]].pathIndices.slice(0,numPositionsMin);
      }
      else { var currPathIndices = dataset_rNodeList[selectedNodesList[selectedNodesList.length-1]].pathIndices; }
      plotPositions(currPathIndices.map(i => dataset_rPathList[i]));
    };
    plotNewNodes(currNodeIndices, selectedNodesList[selectedNodesList.length-1]); // plot new nodes
  }
  else { // plot minute 2 path points
    if (currTeam == "blue") { plotPositions(dataset_bPathList.slice(0,numPositionsMin)); }
    else { plotPositions(dataset_rPathList.slice(0,numPositionsMin)); }
    plotNewNodes(currNodeIndices, -1); // plot minute 2 nodes which are nodes with a parentIndex of 0
  }
}; // end backClick

////////////////////////////////////////////////////////////////////////////////////
// Set up function
function setup() {
  // Minute mark
  svg.append("text")
     .text("Minute "+currMinute)
     .attr("id", "minuteMark")
     .attr("x", 10)
     .attr("y", 25);

  // Path positions
  svg.selectAll("pathPoints")
     .data(dataset_bPathList.slice(0,numPositionsMin))
     .enter()
     .append("circle")
     .attr("class", "pathPoints")
     .attr("cx", function(d) {
       return xScale_posX(d.path[(currMinute-1)][0]);
     })
     .attr("cy", function(d) {
       return yScale_posY(d.path[(currMinute-1)][1]);
     })
     .attr("r", 2.5);

  // Nodes - csv
  var currNodeIndices = dataset_bLookup[currMinute-2].nodeIndices;
  svg.selectAll("nodes")
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
     .attr("r", 7)
     .moveToFront()
     .on("mouseover", function() {
       updateMouseoverRing(d3.select(this));
     })
     .on("mouseout", function() {
       svg.selectAll(".nodeRings").remove();
       d3.select(this).style("opacity", 0.8);
     })
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
     .text(function(d) { return d.index; });
}; // end setup
// Resent settings
function reset() {
  currMinute = 2; // reset minute
  selectedNodesList = []; // reset selected nodes list
  // remove all path positions
  svg.selectAll(".pathPoints").style("fill", "none");
}; // end reset function
// Init function
function init() {
  // Initial settings
  reset();
  currTeam = "blue";
  // Create elements for initial load
  setup();

  // Interactivity
  // Blue team button selected
  d3.select("#button-blue").on("click", function() {
    // start over when color is changed
    reset();
    svg.select("#minuteMark").text("Minute " + currMinute); // change minute mark back to min 2
    currTeam = "blue";
    // Plot nodes and positions
    plotPositions(dataset_bPathList.slice(0,numPositionsMin));
    var currNodeIndices = dataset_bLookup[currMinute-2].nodeIndices;
    plotNewNodes(currNodeIndices, -1);
    // Change button styles
    d3.select(this)
      .style("background-color", d3.rgb(79,39,79))
      .style("color", "white");
    d3.select("#button-red")
      .style("background-color", "white")
      .style("color", d3.rgb(79,39,79));
  }); // end on blue button select
  // Red team button selected
  d3.select("#button-red").on("click", function() {
    // start over when color is changed
    reset();
    svg.select("#minuteMark").text("Minute " + currMinute); // change minute mark back to min 2
    currTeam = "red";
    // Plot positions and nodes
    plotPositions(dataset_rPathList.slice(0,numPositionsMin));
    var currNodeIndices = dataset_rLookup[currMinute-2].nodeIndices;
    plotNewNodes(currNodeIndices, -1);
    // Change button styles
    d3.select(this)
      .style("background-color", d3.rgb(79,39,79))
      .style("color", "white");
    d3.select("#button-blue")
      .style("background-color", "white")
      .style("color", d3.rgb(79,39,79));
  }); // end on red button select
  // Back button selected
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
    parent: parseInt(d.parent) || -1,
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
