/**
 * Generates the SVG element g which will contain the data visualization.
 *
 * @param {*} svgSelector The d3 selection of the SVG element
 * @param {object} margin The desired margins around the graph
 * @param {string} id Optional ID to give to the g element
 * @returns {*} The d3 Selection for the created g element
 */
export function generateG (svgSelector, margin, id = null) {
  const g = svgSelector
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  if (id) {
    g.attr('id', id);
  }
  
  return g
}

/**
 * Sets the size of the SVG canvas containing the graph.
 *
 * @param {number} width The desired width
 * @param {number} height The desired height
 */
export function setCanvasSize (width, height) {
  d3.select(".collaboration-chord-svg")
    .attr('width', width)
    .attr('height', height)
}

/**
 * Appends an SVG g element which will contain the axes.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
export function appendAxes (g) {
  g.append('g')
    .attr('class', 'x axis')

  g.append('g')
    .attr('class', 'y axis')
}

/**
 * Appends the labels for the axes and the title of the graph.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
export function appendGraphLabels (g) {
  g.append('text')
    .text('Collaborations')
    .attr('class', 'title')
    .attr('font-size', 14)
    .attr('font-weight', 'bold')

  g.append('text')
    .text('Acteurs & Réalisateurs')
    .attr('class', 'axis-label')
    .attr('font-size', 12)
}

/**
 * Positions the title and axis labels.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} width The width of the graph
 * @param {number} height The height of the graph
 */
export function positionLabels (g, width, height) {
  g.select('.title')
    .attr('transform', 'translate(' + width/2 + ', -20)')
    .attr('text-anchor', 'middle')
}

/**
 * Creates a tooltip div if it doesn't exist yet.
 * 
 * @returns {*} The tooltip selection
 */
export function createTooltip() {
  let tooltip = d3.select(".tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(255, 255, 255, 0.95)")
      .style("border", "1px solid #ddd")
      .style("border-radius", "6px")
      .style("padding", "8px 12px")
      .style("font-size", "13px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("max-width", "300px")
      .style("transition", "opacity 0.2s");
  }
  return tooltip;
}

