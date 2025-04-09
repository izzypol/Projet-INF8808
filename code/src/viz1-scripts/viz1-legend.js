/**
 * Draws a color gradient legend as a horizontal bar with year labels.
 *
 * @param {*} colorScale The color scale to use (d3.scaleSequential)
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} width The width of the graph, used to place the legend
 * @param {number} height The height for the legend (bar height)
 * @param {number} minYear The minimum year value
 * @param {number} maxYear The maximum year value
 */
export function drawLegend(colorScale, g, width, height, minYear, maxYear) {
  // Create the gradient
  const defs = g.append("defs");

  const gradient = defs.append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "100%")
    .attr("y2", "0%");

  // Define the gradient stops based on the color scale
  gradient.selectAll("stop")
    .data(colorScale.ticks(10))  // Divide into 10 intervals
    .enter().append("stop")
    .attr("offset", (d, i) => `${(i / 10) * 100}%`)
    .attr("stop-color", d => colorScale(d));

  // Append a rectangle to display the gradient
  const legendBar = g.append("g")
    .attr("transform", `translate(${width + 50}, 30)`);  // Position of the legend

  legendBar.append("rect")
    .attr("width", width / 30)
    .attr("height", height)
    .style("fill", "url(#gradient)");

  // Add min and max year labels
  legendBar.append("text")
    .attr("x", 0)
    .attr("y", height+20)
    .attr("text-anchor", "middle")
    .text(minYear);

  legendBar.append("text")
    .attr("x", 0)
    .attr("y", height - 450)
    .attr("text-anchor", "middle")
    .text(maxYear);
}
