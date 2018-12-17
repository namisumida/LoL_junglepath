////////////////////////////////////////////////////////////////////////////////////
function rowConverterOutput(d) { // can delete eventually
  return {
    matchId: parseInt(d.matchId),
    pos: parseInt(d.pos),
    position2: d.position2,
    position3: d.position3,
    position4: d.position4,
    distance2: d.distance2,
    distance3: d.distance3,
    x_position4: parseInt(d.x_position4),
    y_position4: parseInt(d.y_position4)

  }
}; // end rowConverter
function rowConverterInput(d) {
  return {
    matchId: parseInt(d.matchId),
    participantId: parseInt(d.participantId),
    pos: d.pos,
    distance: d.distance,
    difference: d.difference

  }
}; // end rowConverter

var w_graphic = document.getElementById("graphic").getBoundingClientRect().width;
var h_graphic = document.getElementById("graphic").getBoundingClientRect().height;
var svg = d3.select("#graphic-svg");
var w_map = document.getElementById("graphic-svg").getBoundingClientRect().width;
var h_map = document.getElementById("graphic-svg").getBoundingClientRect().height;
var x_map = document.getElementById("graphic-svg").getBoundingClientRect().left;
var y_map = document.getElementById("graphic-svg").getBoundingClientRect().top;
var xScale_posX = d3.scaleLinear() // x scale that converts a position to X coord
                    .domain([0,14700])
                    .range([0, w_map]); // svg/map doesn't start at 0 since centered
var xScale_Xpos = d3.scaleLinear() // x scale that converts a X coord to position (to be used in definePath)
                    .domain([0, w_map])
                    .range([0,14700]);
var yScale_posY = d3.scaleLinear()
                    .domain([0,14600])
                    .range([h_map,0]);
var yScale_Ypos = d3.scaleLinear()
                    .domain([h_map,0])
                    .range([0,14600]);
var lightRed = d3.rgb(227,128,115);
var demblue = d3.rgb(69,106,131);

var dataset, posList, dataset_positions, array_priorXY, minuteCount;
d3.csv('../Data/compData.csv', rowConverterInput, function(data) {
  dataset = data; // save to variable
  array_priorXY = [];
  minuteCount = 2;

  // create a dataset with list of positions for each row
  dataset_positions = [];
  dataset.forEach(function(d) { // for every row
    var coordList = d.pos.split("),"); // create a list of all the arrays in pos string
    var rowList = []; // getting output list ready
    coordList.forEach(function(item) { // for each position (as a string currently)
      posString = item.replace("array", "").replace("(", "").replace("[[", "").replace("]]", "").replace("[", "").replace(")", "").replace("]", "");
      posStringSplit = posString.split(",")
      rowList.push([parseInt(posStringSplit[0]),parseInt(posStringSplit[1])]);
    })
    dataset_positions.push(rowList);
  })

  // Minute mark
  var minuteMark = svg.append("text")
                      .text("Minute "+minuteCount)
                      .attr("class", "minuteMark")
                      .attr("x", w_map-5)
                      .attr("y", h_map-5);

  // Plot initial points - all 2nd minute positions
  var newDot = svg.selectAll("newDot")
                   .data(dataset_positions)
                   .enter()
                   .append("circle")
                   .attr("class", "newDot")
                   .attr("cx", function(d) {
                     return xScale_posX(d[1][0])
                   })
                   .attr("cy", function(d) {
                     return yScale_posY(d[1][1])
                   })
                   .attr("r", 4)
                   .style("opacity", 0.5)
                   .style("fill", "white")
                   .on("mouseover", function(d) {
                     d3.select(this).style("opacity", 1);
                   })
                   .on("mouseout", function() {
                     newDot.style("opacity", 0.5);
                   })
                   .on("click", function() {
                      var x = d3.select(this).attr("cx");
                      var y = d3.select(this).attr("cy");
                      onClickFunction(x,y);
                   });

}); // end d3.csv

////////////////////////////////////////////////////////////////////////////////////
// Plotting points
function plotNewPoints(array_priorXY, array_newPos, minuteCount) { // plot any additional sets of points
  // Plot the new positions
  var newDot = svg.selectAll(".newDot")
                  .data(array_newPos);
  newDot.exit().remove();
  var newDot_enter = newDot.enter()
                           .append("circle")
                           .attr("class", "newDot")
                           .attr("cx", function(d) {
                             return xScale_posX(d[(minuteCount-1)][0])
                           })
                           .attr("cy", function(d) {
                             return yScale_posY(d[(minuteCount-1)][1])
                           })
                           .attr("r", 4);
  newDot = newDot.merge(newDot_enter); // merge in the entered dots
  newDot.attr("cx", function(d) {
           return xScale_posX(d[(minuteCount-1)][0])
         })
         .attr("cy", function(d) {
           return yScale_posY(d[(minuteCount-1)][1])
         })
         .style("opacity", 0.5)
         .style("fill", "white")
         .on("mouseover", function(d) {
           d3.select(this).style("opacity", 1);
         })
         .on("mouseout", function() {
           newDot.style("opacity", 0.5);
         })
         .on("click", function() {
            var x = d3.select(this).attr("cx");
            var y = d3.select(this).attr("cy");
            onClickFunction(x,y);
         });

  // Plot the old positions (that were clicked on)
  var oldDot = svg.selectAll(".oldDot")
                  .data(array_priorXY);
  oldDot.exit().remove(); // remove the points that weren't clicked on
  var oldDot_enter = oldDot.enter() // enter new dots
                           .append("circle")
                           .attr("class", "oldDot")
                           .attr("cx", function(d) {
                             return d[0]; // don't need to use xScale because it's based off of clicked positions
                           })
                           .attr("cy", function(d) {
                             return d[1];
                           })
                           .attr("r", 4);
  oldDot = oldDot.merge(oldDot_enter); // merge in the entered dots
  oldDot.attr("cx", function(d) {
           return d[0];
         })
         .attr("cy", function(d) {
           return d[1];
         })
         .style("opacity", 1)
         .style("fill", lightRed);

}; // end plot new points

////////////////////////////////////////////////////////////////////////////////////
// Interactivity with clicking
function onClickFunction(xCoord, yCoord) {
  array_priorXY.push([xCoord, yCoord]); // Add clicked position to array_priorPos

  // Get new paths/positions
  // var array_newPos = definePath(clickXY);
  var array_newPos = dataset_positions;

  // Change minute count and text
  minuteCount++;
  svg.select(".minuteMark").text("Minute " + minuteCount);
  plotNewPoints(array_priorXY, array_newPos, minuteCount);
}

/*function findClickPos(event) { // function to find x y coords of clicked position
  var adjustedX = event.clientX - x_map;
  var adjustedY = event.clientY - y_map;
  return [adjustedX, adjustedY];
}; // end findClickPos*/

////////////////////////////////////////////////////////////////////////////////////
// Function to predict a path
function definePath(clickXY) {
  // first convert the XY coordinate from the clicked location to
  xPos = xScale_Xpos(clickXY[0])
  yPos = yScale_Ypos(clickXY[1])
}; // end definePath
