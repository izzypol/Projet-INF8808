/**
 * Generates a specific <g> container inside a given SVG container.
 *
 * @param {string} svgSelector The selector of the SVG container (e.g. ".viz1-svg" or ".film-impact-svg")
 * @param {object} margin The desired margins around the graph
 * @param {string} id Optional ID or class for the <g> container
 * @returns {*} The d3 Selection for the created g element
 */
// eslint-disable-next-line camelcase
export function generateG_5 (svgSelector, margin, id = null) {
  const g = svgSelector
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  if (id) g.attr('id', id)

  return g
}

/**
 * Sets the size of the SVG canvas containing the graph.
 *
 * @param {number} width The desired width
 * @param {number} height The desired height
 */
// eslint-disable-next-line camelcase
export function setCanvasSize_5 (width, height) {
  d3.select('.season-tagline-svg')
    .attr('width', width)
    .attr('height', height)
}
