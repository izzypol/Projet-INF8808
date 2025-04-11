import { stopWords, parseRuntime } from './helper'

/**
 * Helper functions for metrics calculations (averages, quantity, etc)
 */
const MetricsHelper = {
  standardMetrics: [
    { property: 'rating', movieProperty: 'rating' },
    { property: 'budget', movieProperty: 'budget' },
    { property: 'boxOffice', movieProperty: 'box_office' },
    { property: 'popularity', movieProperty: 'popularity' }
  ],

  /**
   * Creates an object with new metrics with initialized properties for current standard metrics
   *
   * @returns {object} An object with total value and count properties for each of the standard metrics
   */
  createMetricsObject () {
    const metricsObject = {}

    this.standardMetrics.forEach(metric => {
      metricsObject[`total${metric.property.charAt(0).toUpperCase() + metric.property.slice(1)}`] = 0
      metricsObject[`${metric.property}Count`] = 0
      metricsObject[`avg${metric.property.charAt(0).toUpperCase() + metric.property.slice(1)}`] = 0
    })

    return metricsObject
  },

  /**
   * Adds the new metrics of a movie to an existing object
   *
   * @param {object} currObject The current object to which we will be adding the new metrics to
   * @param {object} movie The movie object which contains the metric values required
   * @returns {object} The updated current object with the new metrics
   */
  addMovieMetrics (currObject, movie) {
    this.standardMetrics.forEach(metric => {
      const value = movie[metric.movieProperty]
      const totalProp = `total${metric.property.charAt(0).toUpperCase() + metric.property.slice(1)}`
      const countProp = `${metric.property}Count`

      if (typeof value === 'number' && !isNaN(value)) {
        currObject[totalProp] += value
        currObject[countProp]++
      }
    })

    return currObject
  },

  /**
   * Calculates the average values for all standard metrics of a given metrics object
   *
   * @param {object} currObject The metrics object to which we need to calculate the averages of the standard
   * metrics for
   * @returns {object} The metrics object with the calculated averages added to it
   */
  calculateAverages (currObject) {
    this.standardMetrics.forEach(metric => {
      const totalProp = `total${metric.property.charAt(0).toUpperCase() + metric.property.slice(1)}`
      const countProp = `${metric.property}Count`
      const avgProp = `avg${metric.property.charAt(0).toUpperCase() + metric.property.slice(1)}`

      currObject[avgProp] = currObject[countProp] > 0 ? currObject[totalProp] / currObject[countProp] : 0
    })

    return currObject
  },

  /**
   * Removes the temporary calculation properties, such as the total and count, from the current object
   *
   * @param {object} currObject The current object on which to remove the additional metrics
   * @returns {object} The current cleaned metrics object
   */
  cleanupMetricsProperties (currObject) {
    this.standardMetrics.forEach(metric => {
      const totalProp = `total${metric.property.charAt(0).toUpperCase() + metric.property.slice(1)}`
      const countProp = `${metric.property}Count`

      delete currObject[totalProp]
      delete currObject[countProp]
    })

    return currObject
  },

  /**
   * Finds the most popular genre from an array of genres
   *
   * @param {string[]} genres Array of genre names
   * @returns {object|null} Object containing most popular genre and counts
   */
  findMostPopularGenre (genres) {
    if (!genres || !genres.length) return null

    const genreCounts = {}
    genres.forEach(genre => {
      if (genre && genre.trim()) {
        genreCounts[genre.trim()] = (genreCounts[genre.trim()] || 0) + 1
      }
    })

    let maxCount = 0
    let mostPopularGenre = null

    Object.entries(genreCounts).forEach(([genre, count]) => {
      if (count > maxCount) {
        maxCount = count
        mostPopularGenre = genre
      }
    })

    return { mostPopularGenre, genreCounts }
  }
}

/**
 * Gets important movie data associated to each contributor of the top 250 movies on IMDB
 * with additional statistics
 *
 * @param {object[]} movies The data of the movies
 * @returns {object} The casts, directors, and writers associated to the top 250 movies on IMDB
 */
export function getFilmContributorsData (movies) {
  const contributors = {
    casts: {},
    directors: {},
    writers: {}
  }

  const contributorCategories = {
    casts: 'casts',
    directors: 'directors',
    writers: 'writers'
  }

  const createContributorObject = () => {
    return {
      movies: [],
      nMovies: 0,
      ...MetricsHelper.createMetricsObject()
    }
  }

  movies.forEach(movie => {
    const movieInfo = {
      name: movie.name,
      genre: movie.genre || []
    }

    Object.entries(contributorCategories).forEach(([movieProperty, categoryName]) => {
      if (movie[movieProperty]) {
        movie[movieProperty].forEach(person => {
          if (!contributors[categoryName][person]) {
            contributors[categoryName][person] = createContributorObject()
          }

          contributors[categoryName][person].movies.push({ ...movieInfo })
          contributors[categoryName][person].nMovies = contributors[categoryName][person].movies.length

          MetricsHelper.addMovieMetrics(contributors[categoryName][person], movie)
        })
      }
    })
  })

  Object.keys(contributors).forEach(category => {
    Object.keys(contributors[category]).forEach(person => {
      const data = contributors[category][person]

      MetricsHelper.calculateAverages(data)
      MetricsHelper.cleanupMetricsProperties(data)
    })
  })

  return contributors
}

/**
 * Analyzes genre data for movies across different time periods
 *
 * @param {object[]} movies Array of movie objects
 * @returns {object[]} Array of interval objects by a set of years with genre and movie analysis
 */
export function getGenreDataIntervals (movies) {
  const decades = createYearIntervals(movies)

  decades.forEach(decade => {
    if (!decade.movies.length) {
      decade.mostCommonGenre = null
      decade.genreCounts = {}
      return
    }

    const allGenres = []
    decade.movies.forEach(movie => {
      if (movie.genre && Array.isArray(movie.genre)) {
        movie.genre.forEach(genre => {
          if (genre && genre.trim()) allGenres.push(genre.trim())
        })
      }
    })

    const { mostPopularGenre, genreCounts } = MetricsHelper.findMostPopularGenre(allGenres)
    decade.mostCommonGenre = mostPopularGenre
    decade.genreCounts = genreCounts
  })

  return decades
}

/**
 * Creates time intervals for movies based on their release years
 *
 * @param {object[]} movies Array of movie objects
 * @param {number} intervalSize Size of each interval in years (10 by default)
 * @returns {object[]} Array of interval objects with movies and their metrics
 */
export function createYearIntervals (movies, intervalSize = 10) {
  const minYear = movies.reduce((min, movie) => movie.year < min ? movie.year : min, Number.MAX_VALUE)
  const maxYear = movies.reduce((max, movie) => movie.year > max ? movie.year : max, Number.MIN_VALUE)

  const firstDecade = Math.floor(minYear / intervalSize) * intervalSize
  const lastDecade = Math.floor(maxYear / intervalSize) * intervalSize

  const intervals = []
  for (let decade = firstDecade; decade <= lastDecade; decade += intervalSize) {
    const decadeYears = decade + (intervalSize - 1)
    intervals.push({
      startYear: decade,
      endYear: decadeYears,
      label: `${decade}s`,
      movies: [],
      nMovies: 0,
      genreCounts: {},
      ...MetricsHelper.createMetricsObject()
    })
  }

  movies.forEach(movie => {
    const interval = intervals.find(interval => movie.year >= interval.startYear && movie.year <= interval.endYear)
    if (!interval) return

    interval.movies.push(movie)
    interval.nMovies++

    MetricsHelper.addMovieMetrics(interval, movie)
  })

  intervals.forEach(interval => {
    MetricsHelper.calculateAverages(interval)
    MetricsHelper.cleanupMetricsProperties(interval)
  })

  return intervals
}

/**
 * Gets the top collaborations for actor/director, actor/actor, and writer/director collaborations.
 *
 * @param {Array} movies Array of movie objects
 * @param {number} limit Number of top collaborations to return (20 by default)
 * @returns {object} Object with the top actor/director, actor/actor, and writer/director collaborations
 */
export function getTopCollaborations (movies, limit = 20) {
  const allCollabs = countCollaborations(movies)

  return {
    topActorDirectorCollabs: allCollabs.actorDirectorCollabs.slice(0, limit),
    topActorActorCollabs: allCollabs.actorActorCollabs.slice(0, limit),
    topWriterDirectorCollabs: allCollabs.writerDirectorCollabs.slice(0, limit)
  }
}

/**
 * Counts the amount of collaborations between actors and directors, writers and directors, and also between actors themselves
 *
 * @param {Array} movies Array of movie objects with casts, writers, and directors properties
 * @returns {object} Object containing actorDirectorCollabs, actorActorCollabs, and writerDirectorCollabs
 */
export function countCollaborations (movies) {
  const actorDirectorCollabs = {}
  const actorActorCollabs = {}
  const writerDirectorCollabs = {}

  const createCollabObject = (type, participant1, participant2) => {
    const keys = {
      actorDirector: { actor: participant1, director: participant2 },
      actorActor: { actor1: participant1, actor2: participant2 },
      writerDirector: { writer: participant1, director: participant2 }
    }

    return {
      ...keys[type],
      movies: [],
      genres: [],
      mostPopularGenre: null,
      count: 0,
      ...MetricsHelper.createMetricsObject()
    }
  }

  const addMovieToCollab = (collab, movie) => {
    if (collab.movies.includes(movie.name)) return

    collab.count++
    collab.movies.push(movie.name)

    MetricsHelper.addMovieMetrics(collab, movie)

    if (movie.genre) {
      const genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre]
      genres.forEach(genre => {
        if (genre && genre.trim()) collab.genres.push(genre.trim())
      })
    }
  }

  movies.forEach(movie => {
    const castMembers = movie.casts || []
    const directors = movie.directors || []
    const writers = movie.writers || []

    // Actor/Director
    castMembers.forEach(actor => {
      if (!actor) return

      directors.forEach(director => {
        if (!director) return

        const key = `${actor}/${director}`
        if (!actorDirectorCollabs[key]) {
          actorDirectorCollabs[key] = createCollabObject("actorDirector", actor, director)
        }

        addMovieToCollab(actorDirectorCollabs[key], movie)
      })
    })

    // Actor/Actor
    for (let i = 0; i < castMembers.length; i++) {
      const actor1 = castMembers[i]
      if (!actor1) continue

      for (let j = i + 1; j < castMembers.length; j++) {
        const actor2 = castMembers[j]
        if (!actor2) continue

        const pair = [actor1, actor2].sort()
        const key = `${pair[0]}/${pair[1]}`

        if (!actorActorCollabs[key]) {
          actorActorCollabs[key] = createCollabObject("actorActor", pair[0], pair[1])
        }

        addMovieToCollab(actorActorCollabs[key], movie)
      }
    }

    // Writer/Director
    writers.forEach(writer => {
      if (!writer) return

      directors.forEach(director => {
        if (!director) return

        const key = `${writer}/${director}`
        if (!writerDirectorCollabs[key]) {
          writerDirectorCollabs[key] = createCollabObject("writerDirector", writer, director)
        }

        addMovieToCollab(writerDirectorCollabs[key], movie)
      })
    })
  })

  const finalizeCollabs = collabs => {
    return Object.values(collabs).map(collab => {
      MetricsHelper.calculateAverages(collab)

      if (collab.genres.length) {
        const { mostPopularGenre } = MetricsHelper.findMostPopularGenre(collab.genres)
        collab.mostPopularGenre = mostPopularGenre
      }

      MetricsHelper.cleanupMetricsProperties(collab)
      delete collab.genres

      return collab
    }).sort((a, b) => b.count - a.count)
  }

  return {
    actorDirectorCollabs: finalizeCollabs(actorDirectorCollabs),
    actorActorCollabs: finalizeCollabs(actorActorCollabs),
    writerDirectorCollabs: finalizeCollabs(writerDirectorCollabs)
  }
}

/**
 * Analyzes the movie data by the available certificate ratings
 *
 * @param {object[]} movies Array of movie objects
 * @returns {object} Object with certificate data and associated metrics
 */
export function getCertificateData (movies) {
  const createCertificateObject = () => {
    return {
      movies: [],
      count: 0,
      genres: [],
      mostPopularGenre: null,
      ...MetricsHelper.createMetricsObject()
    }
  }

  const certificateData = movies.reduce((certificateList, movie) => {
    const certificate = typeof movie.certificate === 'string' ? movie.certificate.toLowerCase() : 'unknown'

    if (!certificateList[certificate]) certificateList[certificate] = createCertificateObject()

    certificateList[certificate].movies.push({ name: movie.name })
    certificateList[certificate].count++

    MetricsHelper.addMovieMetrics(certificateList[certificate], movie)

    if (movie.genre) {
      const genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre]
      genres.forEach(genre => {
        if (genre && genre.trim()) certificateList[certificate].genres.push(genre.trim())
      })
    }

    return certificateList
  }, {})

  Object.keys(certificateData).forEach(certificate => {
    const data = certificateData[certificate]
    MetricsHelper.calculateAverages(data)

    if (data.genres.length) {
      const { mostPopularGenre, genreCounts } = MetricsHelper.findMostPopularGenre(data.genres)
      data.mostPopularGenre = mostPopularGenre
      data.genreCounts = genreCounts
    }

    MetricsHelper.cleanupMetricsProperties(data)
    delete data.genres
  })

  return certificateData
}

/**
 * Groups the movie data by seasons (summer, fall, winter, spring) based on release dates
 *
 * @param {object[]} movies Array of movie objects
 * @returns {object} Object with movie data organized by season and their associated metrics
 */
export function getDataBySeason (movies) {
  const createSeasonObject = (beginDate, endDate) => ({
    beginDate,
    endDate,
    movies: [],
    count: 0,
    genres: [],
    mostPopularGenre: null,
    ...MetricsHelper.createMetricsObject()
  })

  const seasons = {
    spring: createSeasonObject('03-20', '06-20'),
    summer: createSeasonObject('06-21', '09-22'),
    fall: createSeasonObject('09-23', '12-20'),
    winter: createSeasonObject('12-21', '03-19')
  }

  const getSeason = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return null

    // Reason : We need to split the string, however year is not required for use
    // eslint-disable-next-line no-unused-vars
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10))
    const monthDay = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

    if (monthDay >= '03-20' && monthDay <= '06-20') return 'spring'
    else if (monthDay >= '06-21' && monthDay <= '09-22') return 'summer'
    else if (monthDay >= '09-23' && monthDay <= '12-20') return 'fall'
    else return 'winter'
  }

  movies.forEach(movie => {
    const season = getSeason(movie.releaseDate)
    if (season === null) return

    seasons[season].movies.push(movie)
    seasons[season].count++

    MetricsHelper.addMovieMetrics(seasons[season], movie)

    if (movie.genre) {
      const genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre]
      genres.forEach(genre => {
        if (genre && genre.trim()) seasons[season].genres.push(genre.trim())
      })
    }
  })

  Object.keys(seasons).forEach(season => {
    const data = seasons[season]
    MetricsHelper.calculateAverages(data)

    if (data.genres.length) {
      const { mostPopularGenre, genreCounts } = MetricsHelper.findMostPopularGenre(data.genres)
      data.mostPopularGenre = mostPopularGenre
      data.genreCounts = genreCounts
    }

    MetricsHelper.cleanupMetricsProperties(data)
    delete data.genres
  })

  return seasons
}

/**
 * Groups and analyzes movies by given runtime length intervals
 *
 * @param {object[]} movies Array of movie objects
 * @param {number} intervalSize Size of each runtime interval in minutes (10 by default)
 * @returns {object[]} Array of runtime interval objects with their associated movies and metrics
 */
export function getMovieLengthData (movies, intervalSize = 10) {
  let minRuntime = Number.MAX_VALUE
  let maxRuntime = 0

  movies.forEach(movie => {
    const runtime = parseRuntime(movie.run_time)
    if (runtime) {
      minRuntime = Math.min(minRuntime, runtime)
      maxRuntime = Math.max(maxRuntime, runtime)
    }
  })

  const firstInterval = Math.floor(minRuntime / intervalSize) * intervalSize
  const lastInterval = Math.floor(maxRuntime / intervalSize) * intervalSize

  const intervals = []
  for (let minutes = firstInterval; minutes <= lastInterval; minutes += intervalSize) {
    intervals.push({
      startMinutes: minutes,
      endMinutes: minutes + (intervalSize - 1),
      label: `${minutes}s`,
      movies: [],
      nMovies: 0,
      genres: [],
      ...MetricsHelper.createMetricsObject()
    })
  }

  movies.forEach(movie => {
    const movieRuntime = parseRuntime(movie.run_time)
    const interval = intervals.find(interval => movieRuntime >= interval.startMinutes && movieRuntime <= interval.endMinutes)
    if (!interval) return

    interval.movies.push(movie)
    interval.nMovies++

    MetricsHelper.addMovieMetrics(interval, movie)

    if (movie.genre) {
      const genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre]
      genres.forEach(genre => {
        if (genre && genre.trim()) interval.genres.push(genre.trim())
      })
    }
  })

  intervals.forEach(interval => {
    MetricsHelper.calculateAverages(interval)

    if (interval.genres.length) {
      const { mostPopularGenre, genreCounts } = MetricsHelper.findMostPopularGenre(interval.genres)
      interval.mostPopularGenre = mostPopularGenre
      interval.genreCounts = genreCounts
    }

    MetricsHelper.cleanupMetricsProperties(interval)
    delete interval.genres
  })

  return intervals
}

/**
 * Analyzes the frequency of appearance for words and associated data in movie taglines
 *
 * @param {object[]} movies Array of movie objects
 * @param {number} minWordLength Minimum length of words to include (3 by default)
 * @param {number} minOccurrences Minimum occurrences of words to include (2 by default)
 * @returns {object[]} Array of word objects with associated movie data and their metrics
 */
export function getTaglineWordsData (movies, minWordLength = 3, minOccurrences = 2) {
  const createWordObject = () => {
    return {
      movies: [],
      count: 0,
      genres: [],
      mostPopularGenre: null,
      ...MetricsHelper.createMetricsObject()
    }
  }

  const wordCounts = {}
  movies.forEach(movie => {
    if (!movie.tagline || typeof movie.tagline !== 'string') return

    const words = movie.tagline
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word =>
        word.length >= minWordLength &&
        !stopWords.has(word)
      )

    words.forEach(word => {
      if (!wordCounts[word]) wordCounts[word] = 0
      wordCounts[word]++
    })
  })

  const significantWords = Object.keys(wordCounts)
    .filter(word => wordCounts[word] >= minOccurrences)

  const wordData = {}
  significantWords.forEach(word => {
    wordData[word] = createWordObject()
  })

  movies.forEach(movie => {
    if (!movie.tagline || typeof movie.tagline !== 'string') return

    const movieWords = new Set(
      movie.tagline
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => significantWords.includes(word))
    )

    movieWords.forEach(word => {
      wordData[word].movies.push({
        name: movie.name,
        year: movie.year,
        tagline: movie.tagline
      })

      wordData[word].count++

      MetricsHelper.addMovieMetrics(wordData[word], movie)

      if (movie.genre) {
        const genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre]
        genres.forEach(genre => {
          if (genre && genre.trim()) wordData[word].genres.push(genre.trim())
        })
      }
    })
  })

  Object.keys(wordData).forEach(word => {
    const data = wordData[word]
    MetricsHelper.calculateAverages(data)

    if (data.genres.length) {
      const { mostPopularGenre, genreCounts } = MetricsHelper.findMostPopularGenre(data.genres)
      data.mostPopularGenre = mostPopularGenre
      data.genreCounts = genreCounts
    }

    MetricsHelper.cleanupMetricsProperties(data)
    delete data.genres
  })

  const result = Object.entries(wordData)
    .map(([word, data]) => ({
      word,
      ...data
    }))
    .sort((a, b) => b.count - a.count)

  return result
}

/**
 * Analyzes the tagline length statistics and metrics for movies
 *
 * @param {object[]} movies Array of movie objects
 * @returns {object[]} Array of tagline length objects with associated movie data and metrics
 */
export function getTaglineLengthData (movies) {
  const lengthMap = {}

  const createLengthObject = () => {
    return {
      movies: [],
      count: 0,
      wordCount: 0,
      ...MetricsHelper.createMetricsObject()
    }
  }

  movies.forEach(movie => {
    if (!movie.tagline || typeof movie.tagline !== 'string') return

    const tagline = movie.tagline.trim()
    if (tagline.length === 0) return

    const length = tagline.length

    if (!lengthMap[length]) lengthMap[length] = createLengthObject()
    lengthMap[length].movies.push({
      name: movie.name,
      year: movie.year,
      tagline: movie.tagline
    })
    lengthMap[length].count++

    const wordCount = tagline.split(/\s+/).length

    lengthMap[length].wordCount += wordCount
    MetricsHelper.addMovieMetrics(lengthMap[length], movie)
  })

  const result = Object.entries(lengthMap).map(([length, data]) => {
    MetricsHelper.calculateAverages(data)

    data.avgWordCount = data.wordCount / data.count
    delete data.wordCount

    MetricsHelper.cleanupMetricsProperties(data)
    delete data.genres

    return {
      length: parseInt(length, 10),
      ...data
    }
  })

  return result.sort((a, b) => a.length - b.length)
}

/**
 * Calculates the profit for each movie based on budget and box office data
 *
 * @param {object[]} imdb Array of movie objects
 * @returns {object[]} Array of movie objects with added profit property
 */
export function calculateMovieProfits (imdb) {
  imdb.forEach(movie => {
    if (movie.budget && movie.box_office && typeof movie.budget !== 'string' && typeof movie.box_office !== 'string') {
      movie.profit = movie.box_office - movie.budget
    }
  })

  return imdb
}

/**
 * Groups and analyzes movies by their genres
 *
 * @param {object[]} movies Array of movie objects
 * @returns {object} Object with the genre data and associated movie metrics
 */
export function getMoviesByGenre (movies) {
  const genreData = {}

  movies.forEach(movie => {
    const genres = []

    if (movie.genre) {
      if (Array.isArray(movie.genre)) {
        for (let i = 0; i < movie.genre.length; i++) {
          if (movie.genre[i] && typeof movie.genre[i] === 'string') {
            genres.push(movie.genre[i].trim())
          }
        }
      } else if (typeof movie.genre === 'object') {
        Object.keys(movie.genre).forEach(key => {
          if (movie.genre[key] && typeof movie.genre[key] === 'string') {
            genres.push(movie.genre[key].trim())
          }
        })
      } else if (typeof movie.genre === 'string') genres.push(movie.genre.trim())
    }

    genres.forEach(genreName => {
      if (!genreData[genreName]) {
        genreData[genreName] = {
          movies: [],
          count: 0,
          ...MetricsHelper.createMetricsObject()
        }
      }

      genreData[genreName].movies.push(movie)
      genreData[genreName].count++

      MetricsHelper.addMovieMetrics(genreData[genreName], movie)
    })
  })

  Object.keys(genreData).forEach(genre => {
    MetricsHelper.calculateAverages(genreData[genre])
    MetricsHelper.cleanupMetricsProperties(genreData[genre])
  })

  return genreData
}
