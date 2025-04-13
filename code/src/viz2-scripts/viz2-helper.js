/**
 * Generates the SVG element g which will contain the data visualization.
 *
 * @param {*} svgSelector The d3 selection of the SVG element
 * @param {object} margin The desired margins around the graph
 * @param {string} id Optional ID to give to the g element
 * @returns {*} The d3 Selection for the created g element
 */
export function generateG (svgSelector, margin, id = null) {
  const g = svgSelector.append('g')
    .attr('id', id)
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  
  return g
}

/**
 * Sets the size of the SVG canvas containing the graph.
 *
 * @param {number} width The desired width
 * @param {number} height The desired height
 */
export function setCanvasSize (width, height) {
  d3.select('#collaboration-chord')
    .select('svg')
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

/**
 * Creates the dropdown container for the search box.
 * 
 * @param {*} searchInput The search input element
 * @returns {*} The dropdown container
 */
export function createDropdownContainer(searchInput) {
  let dropdownContainer = d3.select("#search-container");
  if (dropdownContainer.empty()) {
    // If the container doesn't exist, create it and wrap the search input
    const searchParent = d3.select(searchInput.parentNode);
    dropdownContainer = searchParent.append("div")
      .attr("id", "search-container")
      .style("position", "relative")
      .style("width", "100%");
    
    // Move the search input inside the container
    searchInput.parentNode.removeChild(searchInput);
    dropdownContainer.node().appendChild(searchInput);
  }

  // Create or clear the dropdown element
  let dropdown = dropdownContainer.select(".autocomplete-dropdown");
  if (dropdown.empty()) {
    dropdown = dropdownContainer.append("div")
      .attr("class", "autocomplete-dropdown")
      .style("position", "absolute")
      .style("width", "100%")
      .style("max-height", "200px")
      .style("overflow-y", "auto")
      .style("background", "white")
      .style("border", "1px solid #ddd")
      .style("border-top", "none")
      .style("border-radius", "0 0 4px 4px")
      .style("z-index", "1000")
      .style("display", "none")
      .style("box-shadow", "0 4px 8px rgba(0,0,0,0.1)");
  } else {
    dropdown.style("display", "none").html("");
  }
  
  return { container: dropdownContainer, dropdown: dropdown };
}