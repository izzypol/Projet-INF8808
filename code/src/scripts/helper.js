
// /**
//  * Generates the SVG element g which will contain the data visualisation.
//  *
//  * @param {object} margin The desired margins around the graph
//  * @returns {*} The d3 Selection for the created g element
//  */
// export function generateG (margin) {
//   return d3.select('.graph')
//     .select('svg')
//     .append('g')
//     .attr('id', 'graph-g')
//     .attr('transform',
//       'translate(' + margin.left + ',' + margin.top + ')')
// }

// /**
//  * Sets the size of the SVG canvas containing the graph.
//  *
//  * @param {number} width The desired width
//  * @param {number} height The desired height
//  */
// export function setCanvasSize (width, height) {
//   d3.select('#heatmap').select('svg')
//     .attr('width', width)
//     .attr('height', height)
// }

// /**
//  * Appends an SVG g element which will contain the axes.
//  *
//  * @param {*} g The d3 Selection of the graph's g SVG element
//  */
// export function appendAxes (g) {
//   g.append('g')
//     .attr('class', 'x axis')

//   g.append('g')
//     .attr('class', 'y axis')
// }

/**
 * Cleans the name to avoid mismatching during the comparison of movie names
 *
 * @param {string} name The movie name to clean
 * @returns {string} the cleaned movie name
 */
export function cleanMovieName (name) {
  let nameStr = String(name)
  const articlePattern = /^(.+),\s+(The|A|An)$/i
  const articleMatch = nameStr.match(articlePattern)

  if (articleMatch) nameStr = `${articleMatch[2]} ${articleMatch[1]}`
  return nameStr.toLowerCase().replace(/[^a-z0-9\s]/g, '')
}
