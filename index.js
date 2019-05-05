function init() {
  var svg = d3.select("#graphic-svg");
  var svg_heatmapLegend_desktop = d3.select("#svg-heatmapLegend-desktop");
  var svg_heatmapLegend_mobile = d3.select("#svg-heatmapLegend-mobile");
  var w_map = document.getElementById("graphic-svg").getBoundingClientRect().width;
  var h_map = document.getElementById("graphic-svg").getBoundingClientRect().height;
  var w = document.documentElement.clientWidth;
  var xScale_posX = d3.scaleLinear() // x scale that converts a position to X coord
                      .domain([0,14700])
                      .range([0, w_map]); // svg/map doesn't start at 0 since centered
  var yScale_posY = d3.scaleLinear()
                      .domain([0,14700])
                      .range([h_map,0]);
  var numRowBuckets = 30;
  var bucketWidth = document.getElementById("graphic").getBoundingClientRect().height/numRowBuckets;
  // Variables to store
  var currTeam, currNodeIndices, currPositionPaths, currWinrateHeatmapData, currHeatmapData, heatmapInstance, radius, numBuckets, currMinute, selectedNodesList;
  var currTeam = "blue"; // default
  var currDisplay = "dots"; // default
  var mobileWidthMax = 869; // max width for showing three column view
  // Node size
  if (w>400) {
    var nodeRadius = 7;
    var selectedNodeRadius = 8;
    var selectedNodeRingRadius = 11;
  }
  else {
    var nodeRadius = 5;
    var selectedNodeRadius = 6;
    var selectedNodeRingRadius = 9;
  }
  ////////////////////////////////////////////////////////////////////////////////////
  function setup() {
    // Minute mark
    svg.append("text")
       .text("Minute "+currMinute)
       .attr("id", "minuteMark")
       .attr("x", 10)
       .attr("y", 25);
    // Team mark
    svg.append("text")
       .text("Blue team")
       .attr("id", "teamMark")
       .attr("x", w_map-10)
       .attr("y", h_map-10);

    // Path positions
    currPositionPaths = bNodeRow1.pathIndices.map(i => dataset_bPathList[i]);
    svg.selectAll("pathPoints")
       .data(currPositionPaths)
       .enter()
       .append("circle")
       .attr("class", "pathPoints")
       .attr("cx", function(d) { return xScale_posX(d.path[(currMinute-2)][0]); })
       .attr("cy", function(d) { return yScale_posY(d.path[(currMinute-2)][1]); })
       .attr("r", 2);

    // Nodes - csv
    currNodeIndices = dataset_bLookup[currMinute-2].nodeIndices;
    svg.selectAll("nodes")
       .data(currNodeIndices.map(i => dataset_bNodeList[i]))
       .enter()
       .append("circle")
       .attr("class", "nodes")
       .attr("id", "nodesBlue")
       .attr("cx", function(d) { return xScale_posX(d.pos[0]); })
       .attr("cy", function(d) { return yScale_posY(d.pos[1]); })
       .attr("r", nodeRadius)
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
         generateInstructions();
       });

    // Heatmap instance
    currHeatmapData = formatHeatmapData(bNodeRow1.heatMap);
    heatmapInstance = h337.create({
      container: document.getElementById("heatmap-container"),
      minOpacity: 0,
      maxOpacity: 1,
      radius: bucketWidth*1.3,
      gradient: {
        '0': d3.rgb(0,0,128),
        '0.08': d3.rgb(0,0,223),
        '0.17': d3.rgb(0,41,255),
        '0.25': d3.rgb(0,129,255),
        '0.32': d3.rgb(0,213,255),
        '0.4': d3.rgb(54,255,255),
        '0.48': d3.rgb(125,255,255),
        '0.64': d3.rgb(255,230,0),
        '0.72': d3.rgb(255,148,0),
        '0.8': d3.rgb(255,71,0),
        '0.88': d3.rgb(223,0,0),
        '1': d3.rgb(128,0,0)
      }
    });
    heatmapInstance.setDataMax(currHeatmapData.max);
    heatmapInstance.setDataMin(0);
    /* TO FIND MAX WIN RATE HEAT MAP VALUE. RUN THIS ON BLUE AND RED NODE LISTS. RED IS 9.57 AND BLUE IS 11.5.
    var maxList = [];
    for (var i=0; i<dataset_bNodeList.length; i++) {
      maxList.push(d3.max(dataset_bNodeList[i].heatMap, function(d) { return d; }));
    }
    console.log(d3.max(maxList, function(d) { return d; }));*/
    // Win rate heatmap instance
    currWinrateHeatmapData = formatWinrateData(bNodeRow1.winHeatMap);
    winrateBlueInstance = h337.create({
      container: document.getElementById("winrate-blue-container"),
      radius: bucketWidth*1.2,
      minOpacity: 0.05,
      maxOpacity: 1,
      gradient: {
        0: d3.rgb(255,230,0),
        0.4: d3.rgb(0,129,255),
        0.8: d3.rgb(0,41,255),
        1: d3.rgb(0,0,223)
      }
    });
    winrateBlueInstance.setDataMax(200);
    winrateBlueInstance.setDataMin(0);
    /* TO FIND MAX WIN RATE HEAT MAP VALUE. RUN THIS ON BLUE AND RED NODE LISTS. BLUE IS 64.4 AND RED IS 63.6, so use (70-50)*10 so it mirrors the red side which is 20 points away
    var maxList = [];
    for (var i=0; i<dataset_rNodeList.length; i++) {
      maxList.push(d3.max(dataset_rNodeList[i].winHeatMap, function(d) { return d; }));
    }
    console.log(d3.max(maxList, function(d) { return d; }));*/
    winrateRedInstance = h337.create({
      container: document.getElementById("winrate-red-container"),
      radius: bucketWidth*1.2,
      minOpacity: 0.05,
      maxOpacity: 1,
      gradient: {
        0: d3.rgb(255,230,0),
        0.4: d3.rgb(224, 92, 21),
        0.8: d3.rgb(219, 6, 6),
        1: d3.rgb(128,0,0)
      }
    });
    winrateRedInstance.setDataMax(200);
    winrateRedInstance.setDataMin(0);
    /* TO FIND MIN WIN RATE HEAT MAP VALUE. RUN THIS ON BLUE AND RED NODE LISTS. BLUE IS 33.6 AND RED IS 37.1, so use (30-50)*10
    var maxList = [];
    for (var i=0; i<dataset_rNodeList.length; i++) {
      maxList.push(d3.min(dataset_rNodeList[i].winHeatMap, function(d) { return d; }));
    }
    console.log(d3.min(maxList, function(d) { return d; }));*/
    // Heat map legend DESKTOP
    var defs_desktop = svg_heatmapLegend_desktop.append("defs")
    // Gradient for positional heatmap
    defs_desktop.append("linearGradient")
                 .attr("id", "heatmapGradient1_desktop")
                 .attr("x1", "0%")
                 .attr("x2", "0%")
                 .attr("y1", "0%")
                 .attr("y2", "100%");
    for (var i=0; i<13; i++) {
      defs_desktop.select("#heatmapGradient1_desktop")
                   .append("stop")
                   .attr("class", "heatmapGradientStop")
                   .attr("offset", function() {
                      return Math.floor(100/12)*i + "%";
                   })
                   .attr("stop-color", function() {
                      if (i==0) { return d3.rgb(128,0,0); }
                      else if (i==1) { return d3.rgb(223,0,0); }
                      else if (i==2) { return d3.rgb(255,71,0); }
                      else if (i==3) { return d3.rgb(255,148,0); }
                      else if (i==4) { return d3.rgb(255,230,0); }
                      else if (i==5) { return d3.rgb(125,255,255); }
                      else if (i==6) { return d3.rgb(54,255,255); }
                      else if (i==7) { return d3.rgb(0,213,255); }
                      else if (i==8) { return d3.rgb(0,129,255); }
                      else if (i==9) { return d3.rgb(0,41,255); }
                      else if (i==10) { return d3.rgb(0,0,223); }
                      else { return d3.rgb(0,0,128); }
                   });
    };
    // Gradient for win rate heatmap
    defs_desktop.append("linearGradient")
                 .attr("id", "heatmapGradient2_desktop")
                 .attr("x1", "0%")
                 .attr("x2", "0%")
                 .attr("y1", "0%")
                 .attr("y2", "100%");
    for (var i=0; i<11; i++) {
      defs_desktop.select("#heatmapGradient2_desktop")
                   .append("stop")
                   .attr("class", "heatmapGradientStop")
                   .attr("offset", function() {
                      return Math.floor(100/10)*i + "%";
                   })
                   .attr("stop-color", function() {
                      if (i==0) { return d3.rgb(0,0,223); }
                      else if (i==1) { return d3.rgb(0,41,255); }
                      else if (i==2) { return d3.rgb(0,129,255); }
                      else if (i==3) { return d3.rgb(255,230,0); }
                      else if (i==4) { return d3.rgb(255,230,0); }
                      else if (i==5) { return d3.rgb(255,230,0); }
                      else if (i==6) { return d3.rgb(255,230,0); }
                      else if (i==7) { return d3.rgb(224, 92, 21); }
                      else if (i==8) { return d3.rgb(219, 6, 6); }
                      else { return d3.rgb(128,0,0); }
                   });
    }; // end for loop
    svg_heatmapLegend_desktop.append("rect") // rectangle with the gradient
                             .attr("class", "legendRect")
                             .attr("width", 10)
                             .attr("height", 70)
                             .attr("x", 10)
                             .attr("y", 5);
    svg_heatmapLegend_desktop.selectAll("legendText")
                             .data(["", "", ""]) // placeholders
                             .enter()
                             .append("text")
                             .attr("class", "legendText")
                             .attr("x", 25)
                             .attr("y", function(d,i) {
                               if (i==0) { return 13; }
                               else if (i==1) { return 43; }
                               else { return 75; }
                             });
    // Heat map legend MOBILE
    var defs_mobile = svg_heatmapLegend_mobile.append("defs")
    // Gradient for positional heatmap
    defs_mobile.append("linearGradient")
               .attr("id", "heatmapGradient1_mobile")
               .attr("x1", "0%")
               .attr("x2", "0%")
               .attr("y1", "0%")
               .attr("y2", "100%");
    for (var i=0; i<13; i++) {
      defs_mobile.select("#heatmapGradient1_mobile")
                 .append("stop")
                 .attr("class", "heatmapGradientStop")
                 .attr("offset", function() {
                    return Math.floor(100/12)*i + "%";
                 })
                 .attr("stop-color", function() {
                    if (i==0) { return d3.rgb(128,0,0); }
                    else if (i==1) { return d3.rgb(223,0,0); }
                    else if (i==2) { return d3.rgb(255,71,0); }
                    else if (i==3) { return d3.rgb(255,148,0); }
                    else if (i==4) { return d3.rgb(255,230,0); }
                    else if (i==5) { return d3.rgb(125,255,255); }
                    else if (i==6) { return d3.rgb(54,255,255); }
                    else if (i==7) { return d3.rgb(0,213,255); }
                    else if (i==8) { return d3.rgb(0,129,255); }
                    else if (i==9) { return d3.rgb(0,41,255); }
                    else if (i==10) { return d3.rgb(0,0,223); }
                    else { return d3.rgb(0,0,128); }
                 });
    };
    // Gradient for win rate heatmap
    defs_mobile.append("linearGradient")
               .attr("id", "heatmapGradient2_mobile")
               .attr("x1", "0%")
               .attr("x2", "0%")
               .attr("y1", "0%")
               .attr("y2", "100%");
    for (var i=0; i<11; i++) {
      defs_mobile.select("#heatmapGradient2_mobile")
                 .append("stop")
                 .attr("class", "heatmapGradientStop")
                 .attr("offset", function() {
                    return Math.floor(100/10)*i + "%";
                 })
                 .attr("stop-color", function() {
                   if (i==0) { return d3.rgb(0,0,223); }
                   else if (i==1) { return d3.rgb(0,41,255); }
                   else if (i==2) { return d3.rgb(0,129,255); }
                   else if (i==3) { return d3.rgb(255,230,0); }
                   else if (i==4) { return d3.rgb(255,230,0); }
                   else if (i==5) { return d3.rgb(255,230,0); }
                   else if (i==6) { return d3.rgb(255,230,0); }
                   else if (i==7) { return d3.rgb(224, 92, 21); }
                   else if (i==8) { return d3.rgb(219, 6, 6); }
                   else { return d3.rgb(128,0,0); }
                 });
    }; // end for loop
    svg_heatmapLegend_mobile.append("rect") // rectangle with the gradient
                             .attr("class", "legendRect")
                             .attr("width", 10)
                             .attr("height", 70)
                             .attr("x", 10)
                             .attr("y", 5);
    svg_heatmapLegend_mobile.selectAll("legendText")
                             .data(["", "", ""]) // placeholders
                             .enter()
                             .append("text")
                             .attr("class", "legendText")
                             .attr("x", 25)
                             .attr("y", function(d,i) {
                               if (i==0) { return 13; }
                               else if (i==1) { return 43; }
                               else { return 75; }
                             });
  }; // end setup
  // Resent settings
  function reset() {
    d3.selectAll(".preset-box").classed("preset-box-clicked", false); // remove clicked class from presets
    currMinute = 2; // reset minute
    selectedNodesList = []; // reset selected nodes list
    svg.selectAll(".selectedNodesGroup").remove(); // remove all selected node groups which include rings and selected nodes
    svg.selectAll(".selectedLines").remove();
    clearBreadcrumbs(); // clear breadcrumbs
    generateInstructions(); // change info text instructions
  }; // end reset function
  function resize() {
    // disable button clicks
    d3.selectAll("button").on("click", null);
    d3.selectAll(".button-dots").on("click", null);
    d3.selectAll(".button-heatmap").on("click", null);
    d3.selectAll(".button-winrate").on("click", null);
    d3.selectAll(".button-blue").on("click", null);
    d3.selectAll(".button-red").on("click", null);
    d3.selectAll(".preset-box").on("click", null);
    // Add rectangle with message
    w_map = document.getElementById("graphic-svg").getBoundingClientRect().width;
    svg.append("rect")
       .attr("x", 0)
       .attr("y", 0)
       .attr("width", w_map)
       .attr("height", w_map)
       .style("fill", d3.color("#9F9EA6"));
    svg.append("text")
       .attr("id", "reload-text")
       .attr("x", w_map/2)
       .attr("y", w_map/3)
       .text("Please refresh the page to reload the map");
  }; // end resize

  ////////////////////////////////////////////////////////////////////////////////////
  d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
          this.parentNode.appendChild(this);
        });
  }; // end moveToFront function
  // What happens when a node is clicked - need to update it every time a new node is added
  function clearBreadcrumbs() {
    d3.select("#button-min2").style("display", "none");
    d3.select("#button-min3").style("display", "none");
    d3.select("#button-min4").style("display", "none");
    d3.select("#arrow-1").style("display", "none");
    d3.select("#arrow-2").style("display", "none");
  }; // end clearBreadcrumbs
  // What happens when you click on a node
  function updateNodeClick(currNode) {
    var currData = currNode.data()[0];
    // Update minute
    currMinute = d3.min([currMinute+1, 5], function(d) { return d; }); // don't want it to be larger than 5
    svg.select("#minuteMark").text("Minute " + currMinute);

    // PATH POSITIONS
    // Find path positions for the next minute
    var currPathIndices = currData.pathIndices;
    // Find currPositionPaths
    if (currTeam == "blue") { currPositionPaths = currPathIndices.map(i => dataset_bPathList[i]); }
    else { currPositionPaths = currPathIndices.map(i => dataset_rPathList[i]); }
    // For heatmap dataset
    currHeatmapData = formatHeatmapData(currData.heatMap);
    currWinrateHeatmapData = formatWinrateData(currData.winHeatMap);
    // Plot dots or heatmap
    if (currDisplay == "dots") { plotPositions(currPositionPaths); }
    else if (currDisplay == "heatmap") {
      heatmapInstance.setData(currHeatmapData);
      heatmapInstance.setDataMax(currHeatmapData.max);
      heatmapInstance.setDataMin(0);
    }
    else {
      // Blue side of win rates
      winrateBlueInstance.setData(currWinrateHeatmapData[0]);
      winrateBlueInstance.setDataMax(200);
      winrateBlueInstance.setDataMin(0);
      // Red side of win rates
      winrateRedInstance.setData(currWinrateHeatmapData[1]);
      winrateRedInstance.setDataMax(200);
      winrateRedInstance.setDataMin(0);
    };

    // NODES
    // Append selected node to list of selected nodes
    selectedNodesList.push(currData.index); // we only need the index because we only care about it as a parent index
    if (currMinute < 5) { // plot nodes if min<5
      // Find node indices first
      if (currTeam == "blue") { currNodeIndices = dataset_bLookup[currMinute-2].nodeIndices; }
      else { currNodeIndices = dataset_rLookup[currMinute-2].nodeIndices; }
    }
    else { currNodeIndices = []; }
    plotSelectedNodes(selectedNodesList); // plot nodes that have already been selected
    plotNewNodes(currNodeIndices, currData.index); // plot the new nodes

    // BREADCRUMBS - show breadcrumb for the previous min
    var breadcrumbID = "#button-min" + (currMinute-1);
    d3.selectAll(".breadcrumb").classed("active", false); // remove styling for previous breadcrumbs
    d3.select(breadcrumbID).html(currData.name) // change the text to position text of current node
                           .style("display", "inline") // display it
                           .classed("active", true); // change style
    if (currMinute == 4 | currMinute == 5) { // if the next minute is 4 or 5, show the arrow
      var arrowID = "#arrow-" + (currMinute-3);
      d3.select(arrowID).style("display", "inline-block");
    };
  }; // end updateNodeClick
  // What happens when a node is moused over
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
       .attr("r", xScale_posX(750));
  }; // end updateMouseoverRing
  // Function that plots the new nodes, once a node is clicked on
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
                          .attr("r", nodeRadius);
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
          .attr("r", nodeRadius);
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
         generateInstructions();
       });

  }; // end plotNewNodes
  // Function that plos already selected nodes (and updates when a new node is clicked)
  function plotSelectedNodes(selectedNodesList) {
    // Set the right datasets depending on the team color
    if (currTeam == "blue") { var dataset_node = dataset_bNodeList; }
    else { var dataset_node = dataset_rNodeList; }

    // Draw lines
    if (selectedNodesList.length > 1 ) { // only if there's more than 1 previously selected node
      // line
      var selectedLines = svg.selectAll(".selectedLines")
                             .data(selectedNodesList.map(i => dataset_node[i]).slice(1));
      selectedLines.exit().remove();
      var selectedLinesEnter = selectedLines.enter()
                                            .append("line")
                                            .attr("x1", function(d,i) { return xScale_posX(dataset_node[selectedNodesList[i]].pos[0]); }) // using i because we slice in data() and skipping the first item in list
                                            .attr("y1", function(d,i) { return yScale_posY(dataset_node[selectedNodesList[i]].pos[1]); })
                                            .attr("x2", function(d,i) { return xScale_posX(d.pos[0]); })
                                            .attr("y2", function(d,i) { return yScale_posY(d.pos[1]); })
      selectedLines = selectedLines.merge(selectedLinesEnter);
      selectedLines.attr("class", "selectedLines")
                   .attr("id", function() {
                     if (currTeam == "blue") { return "selectedLinesBlue"; }
                     else { return "selectedLinesRed"; }
                   })
                   .attr("x1", function(d,i) { return xScale_posX(dataset_node[selectedNodesList[i]].pos[0]); })
                   .attr("y1", function(d,i) { return yScale_posY(dataset_node[selectedNodesList[i]].pos[1]); })
                   .attr("x2", function(d,i) { return xScale_posX(d.pos[0]); })
                   .attr("y2", function(d,i) { return yScale_posY(d.pos[1]); });
    } // end drawing lines
    else { svg.selectAll(".selectedLines").remove(); }

    // Draw the selected nodes and their rings
    var selectedNodesGroup = svg.selectAll(".selectedNodesGroup")
                                .data(selectedNodesList.map(i => dataset_node[i]));
    selectedNodesGroup.exit().remove();
    selectedNodesGroupEnter = selectedNodesGroup.enter()
                                                .append("g")
                                                .attr("class", "selectedNodesGroup");
    selectedNodesGroupEnter.append("circle")
                           .attr("class", "selectedNodes");
    selectedNodesGroupEnter.append("circle")
                           .attr("class", "selectedNodeRings");
    selectedNodesGroupEnter.append("text")
                           .attr("class", "selectedNodeText");

    // merge and update
    selectedNodesGroup = selectedNodesGroup.merge(selectedNodesGroupEnter).moveToFront();
    selectedNodesGroup.select(".selectedNodes")
                      .attr("id", function() {
                        if (currTeam == "blue") { return "selectedNodesBlue"; }
                        else { return "selectedNodesRed"; }
                      })
                      .attr("cx", function(d) { return xScale_posX(d.pos[0]); })
                      .attr("cy", function(d) { return yScale_posY(d.pos[1]); })
                      .attr("r", selectedNodeRadius);
    selectedNodesGroup.select(".selectedNodeRings")
                      .attr("id", function() {
                        if (currTeam == "blue") { return "selectedNodeRingsBlue"; }
                        else { return "selectedNodeRingsRed"; }
                      })
                      .attr("cx", function(d) { return xScale_posX(d.pos[0]); })
                      .attr("cy", function(d) { return yScale_posY(d.pos[1]); })
                      .attr("r", selectedNodeRingRadius);
    selectedNodesGroup.select(".selectedNodeText")
                      .attr("id", function() {
                        if (currTeam == "blue") { return "selectedNodeTextBlue"; }
                        else { return "selectedNodeTextRed"; }
                      })
                      .attr("x", function(d) { return xScale_posX(d.pos[0])-3; })
                      .attr("y", function(d) {
                        if (w>400) { return yScale_posY(d.pos[1])+5; }
                        else { return yScale_posY(d.pos[1])+4; }
                      })
                      .text(function(d,i) { return i+2; })
                      .moveToFront();
  }; // end plotSelectedNodes
  // Function that plots all the position points/tiny dots
  function plotPositions(currPositionPaths) {
    // Plot paths
    var pathPoints = svg.selectAll(".pathPoints")
                        .data(currPositionPaths);
    pathPoints.exit().remove(); // remove any that are not needed
    var pathPointsEnter = pathPoints.enter()
                                    .append("circle")
                                    .attr("class", "pathPoints");
    pathPoints = pathPoints.merge(pathPointsEnter);
    pathPoints.attr("cx", function(d) { return xScale_posX(d.path[(currMinute-2)][0]); })
              .attr("cy", function(d) { return yScale_posY(d.path[(currMinute-2)][1]); })
              .attr("r", 2);
  }; // end plotPositions
  // Function for when the back button is clicked: remove most recently selected node and replot nodes
  function backClick(numClicks) {
    d3.selectAll(".preset-box").classed("preset-box-clicked", false); // remove clicked class from preset boxes
    // Update minute
    currMinute = d3.max([currMinute-numClicks, 2], function(d) { return d; }); // don't want it to be smaller than 2
    svg.select("#minuteMark").text("Minute " + currMinute);

    // Update breadcrumbs
    if (currMinute==2) {
      d3.select("#button-min2").style("display", "none");
      d3.select("#arrow-1").style("display", "none");
    }
    else if (currMinute==3) {
      d3.select("#button-min3").style("display", "none");
      d3.select("#button-min4").style("display", "none");
      d3.select("#arrow-1").style("display", "none");
      d3.select("#arrow-2").style("display", "none");
    }
    else if (currMinute==4) {
      d3.select("#button-min4").style("display", "none");
      d3.select("#arrow-2").style("display", "none");
    }
    d3.select("#button-min"+(currMinute-1)).classed("active", true);
    // Remove previous node from list if there are any to be removed
    if (selectedNodesList.length > 0) { // if it's not at Minute 2 (back to the beginning)
      for (var i=0; i<numClicks; i++) {
        selectedNodesList.pop(); // Remove previous node from list the number of times we "click" back
      };
    };

    // Set currNodeIndices
    if (currTeam == "blue") { currNodeIndices = dataset_bLookup[currMinute-2].nodeIndices; }
    else { currNodeIndices = dataset_rLookup[currMinute-2].nodeIndices; }

    // set the right datasets to be used for blue/red team
    if (currTeam == "blue") { // blue team
      var dataset_node = dataset_bNodeList;
      var dataset_path = dataset_bPathList;
      var firstRow = bNodeRow1;
    }
    else { // red team
      var dataset_node = dataset_rNodeList;
      var dataset_path = dataset_rPathList;
      var firstRow = rNodeRow1;
    };

    // Re plot positions (if any) and nodes
    if (selectedNodesList.length > 0) { // if even after popping last node, there are more nodes...
      // determine path indices
      var currNodeData = dataset_node[selectedNodesList[selectedNodesList.length-1]];
      var currPathIndices = currNodeData.pathIndices;
      currPositionPaths = currPathIndices.map(i => dataset_path[i]);
      currHeatmapData = formatHeatmapData(currNodeData.heatMap);
      currWinrateHeatmapData = formatWinrateData(currNodeData.winHeatMap);
      // Plot dots or heatmap
      if (currDisplay == "dots") { plotPositions(currPositionPaths); }
      else if (currDisplay == "heatmap") {
        heatmapInstance.setData(currHeatmapData);
        heatmapInstance.setDataMax(currHeatmapData.max);
        heatmapInstance.setDataMin(0);
      }
      else {
        // Blue side of win rates
        winrateBlueInstance.setData(currWinrateHeatmapData[0]);
        winrateBlueInstance.setDataMax(200);
        winrateBlueInstance.setDataMin(0);
        // Red side of win rates
        winrateRedInstance.setData(currWinrateHeatmapData[1]);
        winrateRedInstance.setDataMax(200);
        winrateRedInstance.setDataMin(0);
       };
      // Plot nodes
      plotSelectedNodes(selectedNodesList); // plot nodes that have already been selected
      plotNewNodes(currNodeIndices, selectedNodesList[selectedNodesList.length-1]); // plot new nodes
    }
    // Else, you're back at min 2 and you need to plot those path points
    else {
      currPositionPaths = firstRow.pathIndices.map(i => dataset_path[i])
      currHeatmapData = formatHeatmapData(firstRow.heatMap);
      currWinrateHeatmapData = formatWinrateData(firstRow.winHeatMap);
      // Plot dots or heatmap
      if (currDisplay == "dots") { plotPositions(currPositionPaths); }
      else if (currDisplay == "heatmap") {
        heatmapInstance.setData(currHeatmapData);
        heatmapInstance.setDataMax(currHeatmapData.max);
        heatmapInstance.setDataMin(0);
      }
      else {
        // Blue side of win rates
        winrateBlueInstance.setData(currWinrateHeatmapData[0]);
        winrateBlueInstance.setDataMax(200);
        winrateBlueInstance.setDataMin(0);
        // Red side of win rates
        winrateRedInstance.setData(currWinrateHeatmapData[1]);
        winrateRedInstance.setDataMax(200);
        winrateRedInstance.setDataMin(0);
       };
      // Plot nodes
      plotNewNodes(currNodeIndices, -1); // plot minute 2 nodes which are nodes with a parentIndex of 0
      svg.selectAll(".selectedNodesGroup").remove();
    };
    // Change info text instructions
    generateInstructions();
  }; // end backClick
  function formatHeatmapData(dataset) {
    var dataset_output = [];
    for (var j=0; j<900; j++) { // for every bucket in counts array
      // assign x y coordinates to buckets
      var rowBucket = numRowBuckets - Math.floor(j / numRowBuckets); // tells what row you're in; determines y position
      var colBucket = (j % numRowBuckets); // tells what col you're in; determines x position
      dataset_output.push({x: colBucket*bucketWidth+Math.floor(bucketWidth/2),
                           y: rowBucket*bucketWidth-Math.floor(bucketWidth/2),
                           value: dataset[j]*20}) // what needs to go into heatmap setData
      // added radius/2 to center it in the bucket square
    };
    return {max: d3.max(dataset_output, function(d) { return d.value; }),
            min: d3.min(dataset_output, function(d) { return d.value; }),
            data: dataset_output };
  }; // end formatHeatmapData
  function formatWinrateData(dataset) {
    var dataset_blue = [];
    var dataset_red = [];
    for (var j=0; j<900; j++) { // for every bucket in counts array
      // assign x y coordinates to buckets
      var rowBucket = numRowBuckets - Math.floor(j / numRowBuckets); // tells what row you're in; determines y position
      var colBucket = (j % numRowBuckets); // tells what col you're in; determines x position
      if (dataset[j] >= 50) {
        var redValue = 0;
        var blueValue = (dataset[j]-50)*10;
      }
      else { // less than 50
        var blueValue = 0;
        var redValue = Math.abs(dataset[j]-50)*10;
      }
      dataset_blue.push({x: colBucket*bucketWidth+Math.floor(bucketWidth/2), y: rowBucket*bucketWidth-Math.floor(bucketWidth/2), value: blueValue});
      dataset_red.push({x: colBucket*bucketWidth+Math.floor(bucketWidth/2), y: rowBucket*bucketWidth-Math.floor(bucketWidth/2), value: redValue});
    };
    return [{max: d3.max(dataset_blue, function(d) { return d.value; }),min: d3.min(dataset_blue, function(d) { return d.value; }),data: dataset_blue},
            {max: d3.max(dataset_red, function(d) { return d.value; }),min: d3.min(dataset_red, function(d) { return d.value; }),data: dataset_red}];
  }; // end formatWinrateData
  // Draw a heatmap legend
  function drawHeatmapLegend(type) {
    if (type=="heatmap") { var legendLabels = ["10%", "", "0%"]; }
    else { var legendLabels = ["70%", "50%", "30%"]; }
    if (w>mobileWidthMax) {
      var svg_legend = svg_heatmapLegend_desktop;
      if (type=="heatmap") { var currUrl = "url(#heatmapGradient1_desktop)"; }
      else { var currUrl = "url(#heatmapGradient2_desktop)"; }
    }
    else {
      var svg_legend = svg_heatmapLegend_mobile;
      if (type=="heatmap") { var currUrl = "url(#heatmapGradient1_mobile)"; }
      else { var currUrl = "url(#heatmapGradient2_mobile)"; }
    }
    svg_legend.select(".legendRect").style("fill", currUrl);
    svg_legend.selectAll(".legendText").data(legendLabels).text(function(d) { return d; })
  }; // end drawHeatmapLegend
  // Function when team is switched
  function teamButtonClick(color) {
    // start over when color is changed
    reset();
    svg.select("#minuteMark").text("Minute " + currMinute); // change minute mark back to min 2
    currTeam = color;
    if (color == "blue") {
      var data_path = dataset_bPathList;
      var firstRow = bNodeRow1;
      var index_winrate = 0;
      var data_lookup = dataset_bLookup;
      // Change team mark
      svg.select("#teamMark").text("Blue team");
      // Change button styles
      d3.selectAll(".radio-blue").select(".checkmark").classed("checked", true);
      d3.selectAll(".radio-red").select(".checkmark").classed("checked", false);
      // Show the correct presets
      d3.select("#preset-box-blue-container").style("display", "inline");
      d3.select("#preset-box-red-container").style("display", "none");
    }
    else {
      var data_path = dataset_rPathList;
      var firstRow = rNodeRow1;
      var index_winrate = 1;
      var data_lookup = dataset_rLookup;
      // Change team mark
      svg.select("#teamMark").text("Red team");
      // Change button styles
      d3.selectAll(".radio-red").select(".checkmark").classed("checked", true);
      d3.selectAll(".radio-blue").select(".checkmark").classed("checked", false);
      // Show the correct presets
      d3.select("#preset-box-red-container").style("display", "inline");
      d3.select("#preset-box-blue-container").style("display", "none");
    }

    currPositionPaths = firstRow.pathIndices.map(i => data_path[i]);
    currHeatmapData = formatHeatmapData(firstRow.heatMap);
    currWinrateHeatmapData = formatWinrateData(firstRow.winHeatMap);
    // Plot dots or heatmap
    if (currDisplay == "dots") { plotPositions(currPositionPaths); }
    else if (currDisplay == "heatmap") {
      heatmapInstance.setData(currHeatmapData);
      heatmapInstance.setDataMax(currHeatmapData.max);
      heatmapInstance.setDataMin(0);
    }
    else {
      // Blue side of win rates
      winrateBlueInstance.setData(currWinrateHeatmapData[0]);
      winrateBlueInstance.setDataMax(200);
      winrateBlueInstance.setDataMin(0);
      // Red side of win rates
      winrateRedInstance.setData(currWinrateHeatmapData[1]);
      winrateRedInstance.setDataMax(200);
      winrateRedInstance.setDataMin(0);
    };
    // Plot nodes
    currNodeIndices = data_lookup[currMinute-2].nodeIndices;
    plotNewNodes(currNodeIndices, -1);
  }; // end teamButtonClick
  function switchView(view) {
    currDisplay = view;
    if (currDisplay == "dots") {
      // Plot dots
      plotPositions(currPositionPaths);
      svg.selectAll(".nodes").moveToFront();
      svg.selectAll(".selectedNodesGroup").moveToFront();
      // Hide heatmap
      heatmapInstance.setData({max:0, min:0, data:[]}); // hide heatmap
      winrateBlueInstance.setData({max:0, min:0, data:[]});
      winrateRedInstance.setData({max:0, min:0, data:[]});
      // Change button styles
      d3.selectAll(".radio-dots").select(".checkmark").classed("checked", true);
      d3.selectAll(".radio-heatmap").select(".checkmark").classed("checked", false);
      d3.selectAll(".radio-winrate").select(".checkmark").classed("checked", false);
      // Do not show heatmap legends
      d3.selectAll(".heatmap-legend").style("display", "none");
    }
    else if (currDisplay == "heatmap") {
      // plot heatmap
      heatmapInstance.setData(currHeatmapData);
      heatmapInstance.setDataMax(currHeatmapData.max);
      heatmapInstance.setDataMin(0);
      // Remove dots
      svg.selectAll(".pathPoints").remove();
      // Hide win rate heat map
      winrateBlueInstance.setData({max:0, min:0, data:[]});
      winrateRedInstance.setData({max:0, min:0, data:[]});
      // Change button styles
      d3.selectAll(".radio-heatmap").select(".checkmark").classed("checked", true);
      d3.selectAll(".radio-dots").select(".checkmark").classed("checked", false);
      d3.selectAll(".radio-winrate").select(".checkmark").classed("checked", false);
      // Show heatmap legend
      if (w>mobileWidthMax) {
        d3.select("#heatmap-legend-desktop").style("display", "block");
        d3.select("#options-title-desktop").text("FREQUENCY OF JUNGLERS");
      }
      else {
        d3.select("#heatmap-legend-mobile").style("display", "block");
        d3.select("#options-title-mobile").text("FREQUENCY OF JUNGLERS");
      }// mobile
      drawHeatmapLegend(currDisplay);
    }
    else {
      // plot winrate heatmap
      winrateBlueInstance.setData(currWinrateHeatmapData[0]);
      winrateBlueInstance.setDataMax(200);
      winrateBlueInstance.setDataMin(0);
      winrateRedInstance.setData(currWinrateHeatmapData[1]);
      winrateRedInstance.setDataMax(200);
      winrateRedInstance.setDataMin(0);
      // Remove dots
      svg.selectAll(".pathPoints").remove();
      // Remove position heat map
      heatmapInstance.setData({max:0, min:0, data:[]});
      // Change button styles
      d3.selectAll(".radio-winrate").select(".checkmark").classed("checked", true);
      d3.selectAll(".radio-heatmap").select(".checkmark").classed("checked", false);
      d3.selectAll(".radio-dots").select(".checkmark").classed("checked", false);
      // Show heatmap legend
      if (w>mobileWidthMax) {
        d3.select("#heatmap-legend-desktop").style("display", "block");
        d3.select("#options-title-desktop").text("ESTIMATED WIN RATE");
      } // desktop
      else {
        d3.select("#heatmap-legend-mobile").style("display", "block");
        d3.select("#options-title-mobile").text("ESTIMATED WIN RATE");
      } // mobile
      drawHeatmapLegend(currDisplay);
    };
  }; // end switchView
  function buttonClicks() {
    // Interactivity
    // Blue team button selected
    d3.selectAll(".button-blue").on("click", function() {
      teamButtonClick("blue");
    })
    // Red team button selected
    d3.selectAll(".button-red").on("click", function() {
      teamButtonClick("red");
    })
    // Back button selected
    d3.select("#button-back").on("click", function() {
      backClick(1);
    })
    // Reset button selected
    d3.select("#button-reset").on("click", function() {
      teamButtonClick(currTeam); // same as setting new team
    })
    // Dot button selected
    d3.selectAll(".button-dots").on("click", function() {
      switchView("dots");
    })
    // Heatmap button selected
    d3.selectAll(".button-heatmap").on("click", function() {
      switchView("heatmap");
    })
    // Win rate heatmap button selected
    d3.selectAll(".button-winrate").on("click", function() {
      switchView("winrate");
    })
    // Presets selected
    d3.select("#preset-box-blue1").on("click", function() {
      animatePresets("blue", "Near Krugs", "Near Raptors", "Near Blue", "fullclear");
      d3.selectAll(".preset-box").classed("preset-box-clicked", false);
      d3.select(this).classed("preset-box-clicked", true);
    })
    d3.select("#preset-box-blue2").on("click", function() {
      animatePresets("blue", "Near Krugs", "Near Enemy Blue", "Near Raptors", "vertical");
      d3.selectAll(".preset-box").classed("preset-box-clicked", false);
      d3.select(this).classed("preset-box-clicked", true);
    })
    d3.select("#preset-box-red1").on("click", function() {
      animatePresets("red", "Near Krugs", "Near Raptors", "Near Blue", "fullclear");
      d3.selectAll(".preset-box").classed("preset-box-clicked", false);
      d3.select(this).classed("preset-box-clicked", true);
    })
    d3.select("#preset-box-red2").on("click", function() {
      animatePresets("red", "Near Krugs", "Near Enemy Blue", "Near Raptors", "vertical");
      d3.selectAll(".preset-box").classed("preset-box-clicked", false);
      d3.select(this).classed("preset-box-clicked", true);
    })
    // Breadcrumb "buttons"
    for (var i=2; i<5; i++) {
      var breadcrumbID = "#button-min" + i;
      d3.select(breadcrumbID).on("click", function() {
        var breadcrumbIndex = d3.select(this).node().value; // value of breadcrumb/which min
        backClick(currMinute-breadcrumbIndex-1);
      }); // end on click
    }; // end for loop for breadcrumb buttons
  }; // end buttonClicks
  // Function to animate preset paths
  function animatePresets(teamColor, pos1, pos2, pos3, presetName) {
    // disable buttons
    d3.selectAll("button").on("click", null);
    teamButtonClick(teamColor);
    generateInstructions(presetName);
    updateNodeClick(d3.selectAll(".nodes").filter(function(d) { return d.name==pos1; }));
    setTimeout(function() { updateNodeClick(d3.selectAll(".nodes").filter(function(d) { return d.name==pos2; })); }, 1000);
    setTimeout(function() { updateNodeClick(d3.selectAll(".nodes").filter(function(d) { return d.name==pos3; })); }, 2000);
    setTimeout(function() { buttonClicks(); }, 3000);

  }; // end animatePresets
  function generateInstructions(presetName) {
    if (presetName=="vertical") {
      if (w>mobileWidthMax) { document.getElementById("info-text-desktop").innerHTML = "A vertical path typically involves clearing jungle camps from one of your allied quadrants as well as the nearest quadrant of your opponent."; }
      else { document.getElementById("info-text-mobile").innerHTML = "A vertical path typically involves clearing jungle camps from one of your allied quadrants as well as the nearest quadrant of your opponent."; }
    }
    else if (presetName=="fullclear") {
      if (w>mobileWidthMax) { document.getElementById("info-text-desktop").innerHTML = "A full clear path typically involves clearing the majority if not all of the camps in your two allied jungle quadrants."; }
      else { document.getElementById("info-text-mobile").innerHTML = "A full clear path typically involves clearing the majority if not all of the camps in your two allied jungle quadrants."; }
    }
    else {
      if (w>mobileWidthMax) { // desktop
        if (currMinute == 2) {
          if (currDisplay == "dots") { document.getElementById("info-text-desktop").innerHTML = "Each point shows the position of a jungler at 2 minutes in a Diamond+ NA solo queue game. <br><br>Choose a position to start your path."; }
          else if (currDisplay == "heatmap") { document.getElementById("info-text-desktop").innerHTML = "Regions are colored based on how many junglers were nearby at minute 2. <br><br>Choose a position to start your path."; }
          else { document.getElementById("info-text-desktop").innerHTML = "Regions are colored based on the percentage of nearby junglers at minute 2 who went on to win. <br><br>Choose a position to start your path."; }
        }
        else {
          if (currTeam == "blue") {  var dataset_node = dataset_bNodeList; }
          else { var dataset_node = dataset_rNodeList; }
          var newNodes = currNodeIndices.map(i => dataset_node[i]).filter(function(d) {
            return d.parent == selectedNodesList[selectedNodesList.length-1];
          })
          if (newNodes.length != 0) { // if there are more nodes
            if (currDisplay == "dots") { document.getElementById("info-text-desktop").innerHTML = "Junglers on your current path advanced to these positions at minute " + currMinute + ". <br><br>Click another position to continue your path."; }
            else if (currDisplay == "heatmap") { document.getElementById("info-text-desktop").innerHTML = "Junglers on your current path advanced to these positions at minute " + currMinute + ". <br><br>Regions are colored based on how many junglers were nearby at minute " + currMinute + ". <br><br>Choose another position to continue your path."; }
            else { document.getElementById("info-text-desktop").innerHTML = "Junglers on your current path advanced to these positions at minute " + currMinute + ". <br><br>Regions are colored based on the percentage of nearby junglers at minute " + currMinute + " who went on to win. <br><br>Choose another position to continue your path."; }
          }
          else { // end of the path
            if (currDisplay == "dots") { document.getElementById("info-text-desktop").innerHTML = "Junglers on your current path advanced to these positions at minute " + currMinute + ". <br><br><span style='font-family:radnika-bold'>You have reached the end of this path.</span> Click \"Back\" to explore a different path."; }
            else if (currDisplay == "heatmap") { document.getElementById("info-text-desktop").innerHTML = "Junglers on your current path advanced to these positions at minute " + currMinute + ". <br><br>Regions are colored based on how many junglers were nearby at minute " + currMinute + ". <br><br><span style='font-family:radnika-bold'>You have reached the end of this path.</span> Click \"Back\" to explore a different path."; }
            else { document.getElementById("info-text-desktop").innerHTML = "Junglers on your current path advanced to these positions at minute " + currMinute + ". <br><br>Regions are colored based on the percentage of nearby junglers at minute " + currMinute + " who went on to win. <br><br><span style='font-family:radnika-bold'>You have reached the end of this path.</span> Click \"Back\" to explore a different path."; }
          }
        }
      }
      else {
        if (currMinute == 2) {
          if (currDisplay == "dots") { document.getElementById("info-text-mobile").innerHTML = "Each point shows the position of a jungler at 2 minutes in a Diamond+ NA solo queue game. Choose a position to start your path."; }
          else if (currDisplay == "heatmap") { document.getElementById("info-text-mobile").innerHTML = "Regions are colored based on how many junglers were nearby at minute 2. Choose a position to start your path."; }
          else { document.getElementById("info-text-mobile").innerHTML = "Regions are colored based on the percentage of nearby junglers at minute 2 who went on to win. Choose a position to start your path."; }
        }
        else {
          if (currTeam == "blue") {  var dataset_node = dataset_bNodeList; }
          else { var dataset_node = dataset_rNodeList; }
          var newNodes = currNodeIndices.map(i => dataset_node[i]).filter(function(d) {
            return d.parent == selectedNodesList[selectedNodesList.length-1];
          })
          if (newNodes.length != 0) { // if there are more nodes
            if (currDisplay == "dots") { document.getElementById("info-text-mobile").innerHTML = "Junglers on your current path advanced to these positions at minute " + currMinute + ". Click another position to continue your path."; }
            else if (currDisplay == "heatmap") { document.getElementById("info-text-mobile").innerHTML = "Junglers on your current path advanced to these positions at minute " + currMinute + ". Regions are colored based on how many junglers were nearby at minute " + currMinute + ". Choose another position to continue your path."; }
            else { document.getElementById("info-text-mobile").innerHTML = "Junglers on your current path advanced to these positions at minute " + currMinute + ". Regions are colored based on the percentage of nearby junglers at minute " + currMinute + " who went on to win. Choose another position to continue your path."; }
          }
          else { // end of the path
            if (currDisplay == "dots") { document.getElementById("info-text-mobile").innerHTML = "Junglers on your current path advanced to these positions at minute " + currMinute + ". <span style='font-family:radnika-bold'>You have reached the end of this path.</span> Click \"Back\" to explore a different path."; }
            else if (currDisplay == "heatmap") { document.getElementById("info-text-mobile").innerHTML = "Junglers on your current path advanced to these positions at minute " + currMinute + ". Regions are colored based on how many junglers were nearby at minute " + currMinute + ". <span style='font-family:radnika-bold'>You have reached the end of this path.</span> Click \"Back\" to explore a different path."; }
            else { document.getElementById("info-text-mobile").innerHTML = "Junglers on your current path advanced to these positions at minute " + currMinute + ". Regions are colored based on the percentage of nearby junglers at minute " + currMinute + " who went on to win. <span style='font-family:radnika-bold'>You have reached the end of this path.</span> Click \"Back\" to explore a different path."; }
          }
        }
      }
    }
  }; // end generateInstructions

  reset();// Initial settings
  setup();// Create elements for initial load
  buttonClicks(); // allow button clicks

  // FAQ accordion
  var faq_items = d3.selectAll(".faq-item")._groups[0];
  for (var i=0; i<faq_items.length; i++) {
    faq_items[i].addEventListener("click", function() {
      var answer = d3.select(this).select(".faq-answer");
      var question = d3.select(this).select(".faq-question");
      if (answer.style("display")=="none") { // if hidden
        answer.style("display", "block"); // show answer
        question.classed("faq-active", true);
      }
      else { // showing panel
        answer.style("display", "none"); // hide answer
        question.classed("faq-active", false);
      }
    })
  }; // end for loop

  // Resizing window
  window.addEventListener("resize", resize);
}; // end init function
////////////////////////////////////////////////////////////////////////////////////
// Load data
function rowConverterNodes(d,i) {
  return {
    index: i,
    pos: [parseInt(d.pos.split(",")[0].replace("[", "")), parseInt(d.pos.split(",")[1].replace("]", ""))],
    name: d.name,
    parent: parseInt(d.parent) || -1,
    pathIndices: d.pathIndices.split(",").map(function(d) { return parseInt(d.replace("[","")); }) || -1,
    heatMap: d.heatMap.split(",").map(function(d) { return parseFloat(d.replace("[[", "").replace("[", "")); }),
    winHeatMap: d.winHeatMap.split(",").map(function(d) { return parseFloat(d.replace("[[", "").replace("[", "")); }),
  };
}; // end row converter nodes
function rowConverterLookup(d) {
  return {
    nodeIndices: d.nodeIndices.split(",").map(function(d) { return parseInt(d.replace("[","")); })
  };
}; // end rowconverter lookup
function rowConverterPaths(d) {
  return {
    path: d.pos.split("],[").map(function(d) { return d.replace("[[", "").replace("]]", "").replace("[", "").split(",").map(function(d) { return parseInt(d); }); }),
    win: parseInt(d.win)
  };
}; // end rowconverter paths
d3.csv('Data/bLookupTable.csv', rowConverterLookup, function(data_bLookup) {
  d3.csv('Data/bNodeList.csv', rowConverterNodes, function(data_bNodeList) {
    d3.csv('Data/bPathList.csv', rowConverterPaths, function(data_bPathList) {
      d3.csv('Data/rLookupTable.csv', rowConverterLookup, function(data_rLookup) {
        d3.csv('Data/rNodeList.csv', rowConverterNodes, function(data_rNodeList) {
          d3.csv('Data/rPathList.csv', rowConverterPaths, function(data_rPathList) {
            bNodeRow1 = data_bNodeList[0];
            rNodeRow1 = data_rNodeList[0];
            dataset_bLookup = data_bLookup;
            dataset_bNodeList = data_bNodeList;
            dataset_bPathList = data_bPathList;
            dataset_rLookup = data_rLookup;
            dataset_rNodeList = data_rNodeList;
            dataset_rPathList = data_rPathList;

            init();
            document.getElementById("loading-spinner").style.display = "none"; // make the loading icon disappear

          });
        });
      });
    });
  });
});
