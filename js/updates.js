////////////////////////////////////////////////////////////////////////////////////
// Switching from dots to heat map
// update button
var updateButton = function(button) {
  // Update buttons
  var value = button._groups[0][0].value;

  // change button to selected styles
  button.style("background-color", d3.rgb(79,39,79))
        .style("color", "white");

  // assign other button
  if (value == "dots") {
    d3.select("#button-heatmap").style("background-color", "white")
                                .style("color", d3.color("#a19da8"));
  }
  else if (value == "heatmap") {
    d3.select("#button-dots").style("background-color", "white")
                             .style("color", d3.color("#a19da8"));
  }
}; // end update button

////////////////////////////////////////////////////////////////////////////////////
// Function to predict a path
function definePath(clickXY) {
  // first convert the XY coordinate from the clicked location to
  xPos = xScale_Xpos(clickXY[0])
  yPos = yScale_Ypos(clickXY[1])
}; // end definePath

////////////////////////////////////////////////////////////////////////////////////
// Plotting points
function plotNewPoints(array_priorXY, array_newPos, minuteCount) { // plot any additional sets of points
  // Plot the new positions
  var newDot = svg.selectAll(".newDot")
                  .data(array_newPos);
  newDot.exit().remove();
  var newDot_enter = newDot.enter()
                           .append("circle")
                           .attr("class", "dot")
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

  // plot new dots
  plotNewPoints(array_priorXY, array_newPos, minuteCount);

  // Get heat map data
  dataset_heatmap = getHeatmapData(dataset_positions, 15, minuteCount);

}; // end on click function

/*function findClickPos(event) { // function to find x y coords of clicked position
  var adjustedX = event.clientX - x_map;
  var adjustedY = event.clientY - y_map;
  return [adjustedX, adjustedY];
}; // end findClickPos*/
