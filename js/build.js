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

var blue = d3.rgb(0, 109, 230);
////////////////////////////////////////////////////////////////////////////////////
// Set up function
function setup() {
  // Minute mark
  var minuteMark = svg.append("text")
                      .text("Minute "+currMinute)
                      .attr("class", "minuteMark")
                      .attr("x", w_map-5)
                      .attr("y", h_map-5);
  // Nodes - csv
  var nodesBlue = svg.selectAll("nodesBlue")
                     .data(dataset_bNodeList)
                     .enter()
                     .append("circle")
                     .attr("class", "nodesBlue")
                     .attr("cx", function(d) {
                       return xScale_posX(d.pos[0]);
                     })
                     .attr("cy", function(d) {
                       return yScale_posY(d.pos[1]);
                     })
                     .attr("r", 20)
                     .style("fill", function(d,i) {
                       if (dataset_bLookup.nodeIndices[currMinute-2].includes(i)) { return blue; }
                       else { return "none";}
                     });

}; // end setup

// Init function
function init() {
  // Initial settings
  currMinute = 2;

  setup();

  // Interactivity
  svg.selectAll(".nodesBlue").on("click", function() {
    var currNode = d3.select(this); // get node that was clicked on
    console.log(currNode.data());

    // Get pathIndices associated to node
    // have to start from currMinute since pathIndices aren't encoded into circles
    /*var index = currNode.data()[0].key; // index of node in nodeList*/

  })
}; // end init function

////////////////////////////////////////////////////////////////////////////////////
// Load data
var dataset_bLookup, dataset_bNodeList, dataset_bPathList, dataset_rLookup, dataset_rNodeList, dataset_rPathList;
function rowConverterNodes(d) {
  return {
    pos: [parseInt(d.pos.split(",")[0].replace("[", "")), parseInt(d.pos.split(",")[1].replace("]", ""))],
    parent: parseInt(d.parent),
    pathIndices: d.pathIndices
  }
}; // end row converter nodes
d3.json('Data/bLookupTable.json', function(data_bLookup) {
  d3.csv('Data/csv/bNodeList.csv.copy',rowConverterNodes, function(data_bNodeList) {
    d3.json('Data/bPathList.json', function(data_bPathList) {
      //d3.csv('Data/csv/rLookupTable.csv', function(data_rLookup) {
        //d3.csv('Data/csv/rNodeList.csv', function(data_rNodeList) {
          //d3.csv('Data/csv/rPathList.csv', function(data_rPathList) {
            dataset_bLookup = data_bLookup;
            dataset_bNodeList = data_bNodeList;
            dataset_bPathList = data_bPathList;
            //dataset_rLookup = data_rLookup;
            //dataset_rNodeList = data_rNodeList;
            //dataset_rPathList = data_rPathList;

            init();

          //});
        //});
      //});
    });
  });
});
