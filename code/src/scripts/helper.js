
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
export function cleanMovieName(name) {
  let nameStr = String(name)
  const articlePattern = /^(.+),\s+(The|A|An)$/i
  const articleMatch = nameStr.match(articlePattern)

  if (articleMatch) nameStr = `${articleMatch[2]} ${articleMatch[1]}`
  return nameStr.toLowerCase().replace(/[^a-z0-9\s]/g, '')
}

/**
 * Adjusts a monetary amount for inflation based on the year difference
 *
 * @param {number} moneterayAmount The original monetary amount to adjust
 * @param {number} movieYear The year of the original amount
 * @param {number} topYear The year to adjust the amount to
 * @returns {number} The inflation-adjusted amount, rounded to 2 decimal places
 */
export function adjustForInflation(moneterayAmount, movieYear, topYear) {
  const nYears = topYear - movieYear
  const inflationRate = 1 + (3.3 / 100)

  for (let i = 0; i < nYears; i++) {
    moneterayAmount *= inflationRate
  }

  return Number(moneterayAmount.toFixed(2))
}

/**
 * Parses a runtime string into total minutes
 *
 * @param {string} runtimeString A string representing the runtime in hours and/or minutes
 * @returns {number|null} The total runtime in minutes, or null if invalid input
 */
export function parseRuntime(runtimeString) {
  if (!runtimeString || typeof runtimeString !== 'string') return null
  let totalMins = 0

  const hoursMatch = runtimeString.match(/(\d+)h/)
  const minutesMatch = runtimeString.match(/(\d+)m/)

  if (hoursMatch && hoursMatch[1]) totalMins += parseInt(hoursMatch[1], 10) * 60
  if (minutesMatch && minutesMatch[1]) totalMins += parseInt(minutesMatch[1], 10)

  return totalMins > 0 ? totalMins : null
}

export const stopWords = new Set([
  'about', 'after', 'again', 'against', 'all', 'also', 'and', 'any', 'are', 'because',
  'been', 'before', 'being', 'between', 'both', 'but', 'can', 'cant', 'could', 'did', 'does',
  'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'his', 'here', 'how', 'into', 'its', 'just', 'more', 'most', 'not', 'now', 'off',
  'once', 'only', 'other', 'over', 'same', 'should', 'some', 'such', 'than', 'that',
  'the', 'their', 'them', 'then', 'there', 'theres', 'these', 'they', 'this', 'those', 'through',
  'too', 'under', 'until', 'very', 'was', 'were', 'what', 'when', 'where', 'which',
  'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'your'
])

/**
 * Converts all the movie names to string values
 *
 * @param {object} movies An object containing a list of the top 250 IMBD movies
 * @returns {object} A list of the top 250 IMDB movies with their names all being of type string
 */
export function convertMovieNamesToString(movies) {
  movies.forEach(movie => {
    if (typeof movie.name !== 'string') movie.name = String(movie.name)
  })

  return movies
}
