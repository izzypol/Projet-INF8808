/**
 * Defines the contents of the tooltip. See CSS for tooltip styling.
 * The tooltip features the movie name, box office, total nominations,
 * rank, and release year.
 *
 * @param {object} d The data associated to the hovered element
 * @returns {string} The tooltip contents
 */
var Tooltip = d3.select("viz5")
.append("div")
.style("opacity", 0)
.attr("class", "tooltip")
.style("background-color", "white")
.style("border", "solid")
.style("border-width", "2px")
.style("border-radius", "5px")
.style("padding", "5px")

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
Tooltip
  .style("opacity", 1)
}
var mousemove = function(d) {
Tooltip
  .html('<u>' + d.key + '</u>' + "<br>" + d.value + "Number of occurences")
  .style("left", (d3.mouse(this)[0]+20) + "px")
  .style("top", (d3.mouse(this)[1]) + "px")
}
var mouseleave = function(d) {
Tooltip
  .style("opacity", 0)
}