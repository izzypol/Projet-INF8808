import { cleanMovieName } from './helper'

/**
 * Gets the data for oscar nominations for all the movies in the top 250 in IMDB
 *
 * @param {object[]} oscars The oscars data to analyze
 * @param {string[]} movieNames The names of the top 250 movies on IMDB
 * @returns {object} The oscars data of the top 250 movies on IMDB
 */
export function getOscarsMovieData (oscars, movieNames) {
  return oscars.reduce((acc, item) => {
    const cleanName = cleanMovieName(item.film)

    if (movieNames.includes(cleanName)) {
      const isWinner = item.winner === 'True'
      if (!acc[cleanName]) {
        acc[cleanName] = {
          nominations: [{ year: item.year_film, nominee: item.name, winner: isWinner }],
          nbNominations: 1,
          nbWins: isWinner ? 1 : 0
        }
      } else {
        acc[cleanName].nominations.push({
          year: item.year_film,
          nominee: item.name,
          winner: isWinner
        })

        acc[cleanName].nbNominations++
        if (isWinner) acc[cleanName].nbWins++
      }
    }

    return acc
  }, {})
}

/**
 * Add the data collected from the oscars awards to the imdb data
 *
 * @param {object[]} imdb The data of the top 250 movies on IMDB
 * @param {object} oscarMovies The oscars data of the movies in the top 250 on IMDB
 * @returns {object} The imdb data concatenated with the oscars data
 */
export function addOscarsData (imdb, oscarMovies) {
  return imdb.map(movie => {
    const enhancedMovie = { ...movie }
    const cleanName = cleanMovieName(movie.name)

    enhancedMovie.oscarsData = {
      oscarNominees: oscarMovies[cleanName] ? oscarMovies[cleanName].nominations : [],
      oscarNominations: oscarMovies[cleanName] ? oscarMovies[cleanName].nbNominations : 0,
      oscarWins: oscarMovies[cleanName] ? oscarMovies[cleanName].nbWins : 0
    }

    return enhancedMovie
  })
}
