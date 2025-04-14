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
    .attr("transform", `translate(${width + 60}, 60)`);  // Position of the legend

  legendBar.append("rect")
    .attr("width", width / 30)
    .attr("height", height * 0.7)
    .style("fill", "url(#gradient)");

  // Add min and max year labels
  legendBar.append("text")
    .attr("x", 13)
    .attr("y", height-100)
    .attr("text-anchor", "middle")
    .text(minYear);

  legendBar.append("text")
    .attr("x", 11)
    .attr("y", height - 440)
    .attr("text-anchor", "middle")
    .text(maxYear);
  
    // === BUBBLE LEGEND ===
  const bubbleLegend = g.append("g")
    .attr("transform", `translate(${width + 130}, 140)`); // position ajustable

  const circleSizes = [20, 14, 9, 4]; // rayons
  const spacing = 50;
  const startY = 0;

  circleSizes.forEach((r, i) => {
    bubbleLegend.append("circle")
      .attr("cx", 0)
      .attr("cy", startY + i * spacing)
      .attr("r", r)
      .attr("fill", "black");
  });

  // Flèche verticale
  bubbleLegend.append("defs").append("marker")
    .attr("id", "arrow-head")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 5)
    .attr("refY", 5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z")
    .attr("fill", "black");

  bubbleLegend.append("line")
    .attr("x1", 30)
    .attr("y1", spacing * (circleSizes.length - 1) + 20)
    .attr("x2", 30)
    .attr("y2", -20)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#arrow-head)");

  const textLines = ["Nominations", "(Oscars et", "Golden Globes)"];

  const text = bubbleLegend.append("text")
    .attr("x", 40)
    .attr("y", spacing * 1.5)
    .attr("text-anchor", "start")
    .style("font-family", "sans-serif")
    .style("font-size", "12px");
  
  text.selectAll("tspan")
    .data(textLines)
    .enter()
    .append("tspan")
    .attr("x", 40)
    .attr("dy", (d, i) => i === 0 ? "0em" : "1.2em")
    .text(d => d);
  }
