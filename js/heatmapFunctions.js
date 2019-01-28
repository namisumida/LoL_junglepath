function getHeatmapData(data, radius, numBuckets, minute) {
  var counts = Array(numBuckets*numBuckets).fill(0); // set up an array that counts the number of points that fall into each bucket with all the buckets filled in with 0
  for (var i=0; i<data.length; i++) { // for every row in data
    var row = data[i]; // pull out the row we're looking at
    var xBucket = Math.floor(xScale_posX(row.path[(minute-1)][0])/radius); // find which xBucket it would be in
    var yBucket = Math.floor(yScale_posY(row.path[(minute-1)][1])/radius); // find which yBucket it would be in
    var bucket = xBucket + yBucket*numBuckets; // based on which bucket it's in, find the index in the counts array
    counts[bucket] = counts[bucket]+1; // add into counts array
  }
  var dataset_output = []; // set up the dataset that needs to go into heatmap setData
  for (var j=0; j<counts.length; j++) { // for every bucket in counts array
    // now need to work "backwards" and assign x y coordinates to buckets
    dataset_output.push(counts[j]) // what needs to go into heatmap setData
    // added radius/2 to center it in the bucket square
  }
  return dataset_output;

}; // end getHeatmapData function

function generateHeatmap(data, numBuckets) {
  var contours = d3.contours()
                   .size([numBuckets, numBuckets])
                   .thresholds(d3.range(2, 21).map(p => Math.pow(2, p)))
                   (data);
  console.log(contours);
}
