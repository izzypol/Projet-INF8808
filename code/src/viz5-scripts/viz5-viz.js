// set the dimensions and margins of the graph
// change for what we need on the website 
var width = 460
var height = 460

// append the svg object to the body of the page
var svg = d3.select(".season-tagline-svg")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

// // Color palette for emotions
// var color = d3.scaleOrdinal()
//   .domain(["Happy", "Sad", "etc.", "", ""])
//   .range(d3.schemeSet1);

/**
 * Defines the color scale based on release year.
 * @param data
 * @returns {*}
 */
export function setColorScale_5 (data) {
  return d3.scaleOrdinal().domain(data).range(d3.schemeSet1);
}

export function setRadiusScale_5 (taglineWordCounts) {
  return d3.scaleLinear().domain([d3.min(taglineWordCounts), d3.max(taglineWordCounts)]).range([10, 25])
}

/**
 * This function builds the graph.
* @param {object} g5 The D3 selection of the <g> element containing the circles
  * @param {object} data5 The data to be used
* @param {number} transitionDuration5 The duration of the transition while placing the circles
* @param {*} rScale5 The scale for the circles' radius
* @param {*} colorScale5 The scale for the circles' color
*/
export function build5(data5,rScale5, colorScale5) {

// // Initialize the circle: all located at the center of the svg area
  d3.select("g")
    .selectAll("circle")
    .data(data5)// change this?
    .enter()
    .append("circle")
      .attr("class", "node")
      .attr("r", rScale5)
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .style("fill", colorScale5)
      .style("fill-opacity", 0.8)
      .attr("stroke", "black")
      .style("stroke-width", 1)
};