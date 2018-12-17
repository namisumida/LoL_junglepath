////////////////////////////////////////////////////////////////////////////////////
function rowConverter(d) {
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

var dataset, posList;
d3.csv('../Data/exampleOutput.csv', rowConverter, function(data) {
  dataset = data; // save to variable

  // list of previous positions
  posList = [[4000,7000],[7500,4000]];

  // dots
  plotInitialPoints(posList, dataset);


}); // end d3.csv


////////////////////////////////////////////////////////////////////////////////////
// Interactivity with clicking
function findClickPos(event) { // function to find x y coords of clicked position
 return [event.clientX, event.clientY];
}; // end findClickPos

document.addEventListener("click", findClickPos);

////////////////////////////////////////////////////////////////////////////////////
// Plotting points
var svg = d3.select("#graphic-svg");
var w_map = document.getElementById("graphic-svg").getBoundingClientRect().width;
var h_map = document.getElementById("graphic-svg").getBoundingClientRect().height;
var x_map = document.getElementById("graphic-svg").getBoundingClientRect().left;
var y_map = document.getElementById("graphic-svg").getBoundingClientRect().top;
var xScale = d3.scaleLinear()
               .domain([0,14700])
               .range([0, w_map]); // svg/map doesn't start at 0 since centered
var yScale = d3.scaleLinear()
               .domain([0,14600])
               .range([h_map,w_map-h_map]);
var lightRed = d3.rgb(227,128,115);
var demblue = d3.rgb(69,106,131);

function plotInitialPoints(array_priorPos, array_newPos) {

  svg.selectAll("oldPos")
     .data(array_priorPos)
     .enter()
     .append("circle")
     .attr("class", "oldPosition")
     .attr("cx", function(d) {
       return xScale(d[0])
     })
     .attr("cy", function(d) {
       return yScale(d[1])
     })
     .attr("r", 4)
     .style("fill", "white");

  svg.selectAll("newPos")
     .data(array_newPos)
     .enter()
     .append("circle")
     .attr("class", "newPosition")
     .attr("cx", function(d) {
       return xScale(d.x_position4)
     })
     .attr("cy", function(d) {
       return yScale(d.y_position4)
     })
     .attr("r", 4)
     .style("opacity", 0.5)
     .style("fill", lightRed);

}; // end plotPoint

////////////////////////////////////////////////////////////////////////////////////
// Function to predict a path
function definePath(input) {
  $.ajax({
      type: "POST",
      url: "python/predictPaths.py",
      data: { param: input },
      success: callbackFunc
  });
}; // end definePath

function callbackFunc(response) {
    // do something with the response
    console.log(response);
};
