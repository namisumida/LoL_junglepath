////////////////////////////////////////////////////////////////////////////////////
var w_graphic = document.getElementById("graphic").getBoundingClientRect().width;
var h_graphic = document.getElementById("graphic").getBoundingClientRect().height;
var svg = d3.select("#graphic-svg");
var w_map = document.getElementById("graphic-svg").getBoundingClientRect().width;
var h_map = document.getElementById("graphic-svg").getBoundingClientRect().height;
var xScale_posX = d3.scaleLinear() // x scale that converts a position to X coord
                    .domain([0,14700])
                    .range([0, w_map]); // svg/map doesn't start at 0 since centered
var xScale_Xpos = d3.scaleLinear() // x scale that converts a X coord to position (to be used in definePath)
                    .domain([0, w_map])
                    .range([0,14700]);
var yScale_posY = d3.scaleLinear()
                    .domain([0,14700])
                    .range([h_map,0]);
var yScale_Ypos = d3.scaleLinear()
                    .domain([h_map,0])
                    .range([0,14700]);
var lightRed = d3.rgb(227,128,115);
var demblue = d3.rgb(69,106,131);
var dataset, posList, dataset_positions, array_priorXY, minuteCount, heatmap_config, heatmapInstance, dataset_heatmap;

////////////////////////////////////////////////////////////////////////////////////
// Helper functions
function getHeatmapData(data, radius, minute) {
  var numBuckets = Math.floor(w_map/radius); // number of entries in a row
  var counts = Array(numBuckets*numBuckets).fill(0); // set up an array that counts the number of points that fall into each bucket with all the buckets filled in with 0
  for (var i=0; i<data.length; i++) { // for every row in data
    var row = data[i]; // pull out the row we're looking at
    var xBucket = Math.floor(xScale_posX(row[(minute-1)][0])/radius); // find which xBucket it would be in
    var yBucket = Math.floor(yScale_posY(row[(minute-1)][1])/radius); // find which yBucket it would be in
    var bucket = xBucket + yBucket*numBuckets; // based on which bucket it's in, find the index in the counts array
    counts[bucket] = counts[bucket]+1; // add into counts array
  }
  var dataset_output = []; // set up the dataset that needs to go into heatmap setData
  for (var j=0; j<counts.length; j++) { // for every bucket in counts array
    // now need to work "backwards" and assign x y coordinates to buckets
    var colIndex = Math.floor(j / numBuckets);
    var rowIndex = j % numBuckets;
    dataset_output.push({x: rowIndex*radius+Math.floor(radius/2), y: colIndex*radius+Math.floor(radius/2), value: counts[j]}) // what needs to go into heatmap setData
    // added radius/2 to center it in the bucket square
  }
  return {max: d3.max(dataset_output, function(d) { return d.value; }),
          min: d3.min(dataset_output, function(d) { return d.value; }),
          data: dataset_output};
}; // end getHeatmapData function

function setup() {
  // Minute mark
  var minuteMark = svg.append("text")
                      .text("Minute "+minuteCount)
                      .attr("class", "minuteMark")
                      .attr("x", w_map-5)
                      .attr("y", h_map-5);

  // Plot initial points - all 2nd minute positions
  var dots = svg.selectAll("dot")
                 .data(dataset_positions)
                 .enter()
                 .append("circle")
                 .attr("class", "dot")
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
                   dots.style("opacity", 0.5);
                 })
                 .on("click", function() {
                    var x = d3.select(this).attr("cx");
                    var y = d3.select(this).attr("cy");
                    onClickFunction(x,y);
                 });

  // Create heatmap instance
  heatmapInstance = h337.create({
    container: document.getElementById("heatmap-container"),
    radius: 20,
    maxOpacity: 1,
    minOpacity: 0,
    blur: .7
  });
  dataset_heatmap = getHeatmapData(dataset_positions, 15, 2);
}; // end setup

function resize() {
  w_graphic = document.getElementById("graphic").getBoundingClientRect().width;
  h_graphic = document.getElementById("graphic").getBoundingClientRect().height;
  w_map = document.getElementById("graphic-svg").getBoundingClientRect().width;
  h_map = document.getElementById("graphic-svg").getBoundingClientRect().height;
  xScale_posX = d3.scaleLinear() // x scale that converts a position to X coord
                  .domain([0,14700])
                  .range([0, w_map]); // svg/map doesn't start at 0 since centered
  xScale_Xpos = d3.scaleLinear() // x scale that converts a X coord to position (to be used in definePath)
                  .domain([0, w_map])
                  .range([0,14700]);
  yScale_posY = d3.scaleLinear()
                  .domain([0,14700])
                  .range([h_map,0]);
  yScale_Ypos = d3.scaleLinear()
                  .domain([h_map,0])
                  .range([0,14700]);

  // Minute mark
  svg.selectAll(".minuteMark")
     .attr("x", w_map-5)
     .attr("y", h_map-5);

  // Plot initial points - all 2nd minute positions
  svg.selectAll(".dot")
     .attr("cx", function(d) {
       return xScale_posX(d[1][0])
     })
     .attr("cy", function(d) {
       return yScale_posY(d[1][1])
     })
     .on("click", function() {
        var x = d3.select(this).attr("cx");
        var y = d3.select(this).attr("cy");
        onClickFunction(x,y);
     });

  // Heat map
  heatmapInstance._renderer.canvas.remove(); // delete old one
  /*heatmapInstance = h337.create({
    container: document.getElementById("heatmap-container"),
    radius: 20,
    maxOpacity: 1,
    minOpacity: 0,
    blur: .7
  });
  var newHeight = heatmapInstance._renderer.canvas.width;
  heatmapInstance._renderer.canvas.height = newHeight;
  heatmapInstance._renderer.height = newHeight;
  heatmapInstance._renderer.shadowCanvas.height = newHeight;*/
}; // end resize
////////////////////////////////////////////////////////////////////////////////////
// init function
function init() {
  setup();
  window.addEventListener('resize', resize);
}; // end init function

// Get data and run
function rowConverterInput(d) {
  return {
    matchId: parseInt(d.matchId),
    participantId: parseInt(d.participantId),
    pos: d.pos,
    distance: d.distance,
    difference: d.difference
  }
}; // end rowConverter
d3.csv('Data/compData.csv', rowConverterInput, function(data) {
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

  init();

  // interactivity
  d3.select("#button-dots").on("click", function() {
    updateButton(d3.select(this));
    svg.selectAll(".dot").style("fill", "white"); // show dots
    heatmapInstance.setData({max:0, min:0, data:[]}); // hide heatmap
  }); // end sorting changes
  d3.select("#button-heatmap").on("click", function() {
    updateButton(d3.select(this));
    svg.selectAll(".dot").style("fill", "none"); // hide dots
    heatmapInstance.setData(dataset_heatmap); // show heatmap
  }); // end sorting changes

}); // end d3.csv
