import { cleanMovieName } from './helper'

/**
 * Gets the data for golden globes nominations for all the movies in the top 250 in IMDB
 *
 * @param {object[]} goldenGlobes The golden globes data to analyze
 * @param {object[]} movieNames The names of the top 250 movies on IMDB
 * @returns {object} The golden globes data of the top 250 movies on IMDB
 */
export function getGoldenGlobesMovieData (goldenGlobes, movieNames) {
  return goldenGlobes.reduce((acc, item) => {
    const cleanName = cleanMovieName(item.film)

    if (movieNames.includes(cleanName)) {
      const isWinner = item.win === 'True'
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
 * Add the data collected from the golden globes awards to the imdb data
 *
 * @param {object[]} imdb The data of the top 250 movies on IMDB
 * @param {object} goldenGlobesMovies The golden globes data of the movies in the top 250 on IMDB
 * @returns {object} The imdb data concatenated with the golden globes data
 */
export function addGoldenGlobesData (imdb, goldenGlobesMovies) {
  return imdb.map(movie => {
    const enhancedMovie = { ...movie }
    const cleanName = cleanMovieName(movie.name)

    enhancedMovie.goldenGlobesData = {
      goldenGlobesNominees: goldenGlobesMovies[cleanName] ? goldenGlobesMovies[cleanName].nominations : [],
      goldenGlobesNominations: goldenGlobesMovies[cleanName] ? goldenGlobesMovies[cleanName].nbNominations : 0,
      goldenGlobesWins: goldenGlobesMovies[cleanName] ? goldenGlobesMovies[cleanName].nbWins : 0
    }

    return enhancedMovie
  })
}
