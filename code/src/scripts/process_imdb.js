/**
 * Fix the field values in order to proceed with processing
 *
 * @param {object[]} data The top 250 movies on IMDB
 * @returns {object} The correct value types for all the various fields of the data
 */
export function processMovieData (data) {
  const stringToArray = (movie, fieldName) => {
    if (!movie[fieldName]) return []

    try {
      if (typeof movie[fieldName] === 'string') {
        return movie[fieldName].split(',').map(item => item.trim())
      }
      return movie[fieldName]
    } catch (error) {
      return []
    }
  }

  return data.map((movie) => {
    const processedMovie = { ...movie }
    const fieldsToProcess = ['casts', 'directors', 'genre', 'writers']

    fieldsToProcess.forEach(field => {
      processedMovie[field] = stringToArray(movie, field)
    })

    return processedMovie
  })
}
