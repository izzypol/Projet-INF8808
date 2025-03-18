import { cleanMovieName } from './helper'

/**
 * Gets the additional data required for all the movies in the top 250 in IMDB
 *
 * @param {object[]} movies The additional movie data to analyze
 * @param {object[]} movieNames The names of the top 250 movies on IMDB
 * @returns {object} The additonal movie data of the top 250 movies on IMDB
 */
export function getAdditionalMovieData (movies, movieNames) {
  return movies.reduce((acc, movie) => {
    if (!movie.original_title) return acc

    const cleanName = cleanMovieName(movie.original_title)

    if (movieNames.includes(cleanName)) {
      let companies = []
      if (movie.production_companies) {
        const pCompaniesData = typeof movie.production_companies === 'string'
          ? JSON.parse(movie.production_companies) : movie.production_companies

        if (Array.isArray(pCompaniesData) && pCompaniesData.length > 0) {
          companies = pCompaniesData.map(pCompany => pCompany.name).filter(Boolean)
        }
      }

      let releaseDate = ''
      if (movie.release_date) {
        try {
          releaseDate = new Date(movie.release_date).toISOString().split('T')[0]
        } catch (error) {
          releaseDate = movie.release_date
        }
      }

      acc[cleanName] = {
        keywords: movie.keywords || '',
        popularity: movie.popularity || 0,
        productionCompanies: companies,
        releaseDate: releaseDate,
        budget: movie.budget,
        revenue: movie.revenue
      }
    }
    return acc
  }, {})
}

/**
 * Add the additional movie data to the imdb data
 *
 * @param {object[]} imdb The data of the top 250 movies on IMDB
 * @param {object} additionalData The additional data of the movies in the top 250 on IMDB
 * @returns {object} The imdb data concatenated with the oscars data
 */
export function addAdditionalMovieData (imdb, additionalData) {
  return imdb.map(movie => {
    const enhancedMovie = { ...movie }
    const cleanName = cleanMovieName(movie.name)

    enhancedMovie.keywords = additionalData[cleanName] ? additionalData[cleanName].keywords : []
    enhancedMovie.popularity = additionalData[cleanName] ? additionalData[cleanName].popularity : 0
    enhancedMovie.productionCompanies = additionalData[cleanName] ? additionalData[cleanName].productionCompanies : {}
    enhancedMovie.releaseDate = additionalData[cleanName] ? additionalData[cleanName].releaseDate : null

    if (typeof enhancedMovie.budget === 'string' && additionalData[cleanName]) {
      enhancedMovie.budget = additionalData[cleanName].budget
    }

    if (typeof enhancedMovie.boxOffice === 'string' && additionalData[cleanName]) {
      enhancedMovie.boxOffice = additionalData[cleanName].revenue
    }

    return enhancedMovie
  })
}
