// set the dimensions and margins of the graph
// change for what we need on the website 
var width = 460
var height = 460

// append the svg object to the body of the page
var svg = d3.select(".season-tagline-svg")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

// Color palette for emotions
var color = d3.scaleOrdinal()
  .domain(["Happy", "Sad", "etc.", "", ""])
  .range(d3.schemeSet1);

/**
 * Defines the color scale based on release year.
 * @param data
 * @returns {*}
 */
export function setColorScale_5 (data) {
  return d3.scaleOrdinal().domain(data).range(d3.schemeSet1);
}

// // Size scale for movies
// var size = d3.scaleLinear()
//   .domain([0, 1400000000])
//   .range([7,55])  // circle will be between 7 and 55 px wide

// // create a tooltip
// // not sure how to make this work with the tooltip file
// var Tooltip = d3.select(".season-tagline-svg")
//   .append("div")
//   .style("opacity", 0)
//   .attr("class", "tooltip")
//   .style("background-color", "white")
//   .style("border", "solid")
//   .style("border-width", "2px")
//   .style("border-radius", "5px")
//   .style("padding", "5px")

// // Three function that change the tooltip when user hover / move / leave a cell
// var mouseover = function(d) {
//   Tooltip
//     .style("opacity", 1)
// }
// var mousemove = function(d) {
//   Tooltip
//     .html('<u>' + d.key + '</u>' + "<br>" + d.value + " inhabitants")
//     .style("left", (d3.mouse(this)[0]+20) + "px")
//     .style("top", (d3.mouse(this)[1]) + "px")
// }
// var mouseleave = function(d) {
//   Tooltip
//     .style("opacity", 0)
// }

// // Initialize the circle: all located at the center of the svg area
// var node = svg.append("g")
//   .selectAll("circle")
//   .data(data)
//   .enter()
//   .append("circle")
//     .attr("class", "node")
//     .attr("r", function(d){ return size(d.value)})
//     .attr("cx", width / 2)
//     .attr("cy", height / 2)
//     .style("fill", function(d){ return color(d.region)})
//     .style("fill-opacity", 0.8)
//     .attr("stroke", "black")
//     .style("stroke-width", 1)
//     .on("mouseover", mouseover) // What to do when hovered
//     .on("mousemove", mousemove)
//     .on("mouseleave", mouseleave)
//     .call(d3.drag() // call specific function when circle is dragged
//     .on("start", dragstarted)
//     .on("drag", dragged)
//     .on("end", dragended));