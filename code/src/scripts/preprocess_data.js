/**
 * Helper functions for metrics calculations
 */
const MetricsHelper = {
  standardMetrics: [
    { property: 'rating', movieProperty: 'rating' },
    { property: 'budget', movieProperty: 'budget' },
    { property: 'boxOffice', movieProperty: 'box_office' },
    { property: 'popularity', movieProperty: 'popularity' }
  ],

  createMetricsObject () {
    const metricsObject = {}

    this.standardMetrics.forEach(metric => {
      metricsObject[`total${metric.property.charAt(0).toUpperCase() + metric.property.slice(1)}`] = 0
      metricsObject[`${metric.property}Count`] = 0
      metricsObject[`avg${metric.property.charAt(0).toUpperCase() + metric.property.slice(1)}`] = 0
    })

    return metricsObject
  },

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

  calculateAverages (currObject) {
    this.standardMetrics.forEach(metric => {
      const totalProp = `total${metric.property.charAt(0).toUpperCase() + metric.property.slice(1)}`
      const countProp = `${metric.property}Count`
      const avgProp = `avg${metric.property.charAt(0).toUpperCase() + metric.property.slice(1)}`

      currObject[avgProp] = currObject[countProp] > 0 ? currObject[totalProp] / currObject[countProp] : 0
    })

    return currObject
  },

  cleanupMetricsProperties (currObject) {
    this.standardMetrics.forEach(metric => {
      const totalProp = `total${metric.property.charAt(0).toUpperCase() + metric.property.slice(1)}`
      const countProp = `${metric.property}Count`

      delete currObject[totalProp]
      delete currObject[countProp]
    })

    return currObject
  },

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

export function createYearIntervals (movies) {
  const minYear = movies.reduce((min, movie) => movie.year < min ? movie.year : min, Number.MAX_VALUE)
  const maxYear = movies.reduce((max, movie) => movie.year > max ? movie.year : max, Number.MIN_VALUE)

  const firstDecade = Math.floor(minYear / 10) * 10
  const lastDecade = Math.floor(maxYear / 10) * 10

  const intervals = []
  for (let decade = firstDecade; decade <= lastDecade; decade += 10) {
    const decadeYears = decade + 9
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
 * Gets the top collaborations for actor/director and actor/actor collaborations
 *
 * @param {Array} movies Array of movie objects
 * @param {number} limit Number of top collaborations to return (default 20)
 * @returns {object} Object with the top actor/director and actor/actor collaborations
 */
export function getTopCollaborations (movies, limit = 20) {
  const allCollabs = countCollaborations(movies)

  return {
    topActorDirectorCollabs: allCollabs.actorDirectorCollabs.slice(0, limit),
    topActorActorCollabs: allCollabs.actorActorCollabs.slice(0, limit)
  }
}

/**
 * Counts the amount of collaborations between actors and directors, and also between actors themselves
 *
 * @param {Array} movies Array of movie objects with casts and directors properties
 * @returns {object} Object containing actorDirectorCollabs and actorActorCollabs
 */
function countCollaborations (movies) {
  const actorDirectorCollabs = {}
  const actorActorCollabs = {}

  const createCollabObject = (isSameType, participant1, participant2) => {
    return {
      [isSameType ? 'actor1' : 'actor']: participant1,
      [isSameType ? 'actor2' : 'director']: participant2,
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

    castMembers.forEach(actor => {
      if (!actor) return

      directors.forEach(director => {
        if (!director) return

        const key = `${actor}/${director}`

        if (!actorDirectorCollabs[key]) {
          actorDirectorCollabs[key] = createCollabObject(false, actor, director)
        }

        addMovieToCollab(actorDirectorCollabs[key], movie)
      })
    })

    for (let i = 0; i < castMembers.length; i++) {
      const actor1 = castMembers[i]
      if (!actor1) continue

      for (let j = i + 1; j < castMembers.length; j++) {
        const actor2 = castMembers[j]
        if (!actor2) continue

        const actorPair = [actor1, actor2].sort()
        const key = `${actorPair[0]}/${actorPair[1]}`

        if (!actorActorCollabs[key]) {
          actorActorCollabs[key] = createCollabObject(true, actorPair[0], actorPair[1])
        }

        addMovieToCollab(actorActorCollabs[key], movie)
      }
    }
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
    actorActorCollabs: finalizeCollabs(actorActorCollabs)
  }
}

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

export function getMovieLengthData (movies) {
  let minRuntime = Number.MAX_VALUE
  let maxRuntime = 0

  movies.forEach(movie => {
    const runtime = parseRuntime(movie.run_time)
    if (runtime) {
      minRuntime = Math.min(minRuntime, runtime)
      maxRuntime = Math.max(maxRuntime, runtime)
    }
  })

  const firstInterval = Math.floor(minRuntime / 10) * 10
  const lastInterval = Math.floor(maxRuntime / 10) * 10

  console.log(minRuntime)
  console.log(maxRuntime)

  const intervals = []
  for (let minutes = firstInterval; minutes <= lastInterval; minutes += 10) {
    intervals.push({
      startMinutes: minutes,
      endMinutes: minutes + 9,
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

function parseRuntime (runtimeString) {
  if (!runtimeString || typeof runtimeString !== 'string') return null
  let totalMins = 0

  const hoursMatch = runtimeString.match(/(\d+)h/)
  const minutesMatch = runtimeString.match(/(\d+)m/)

  if (hoursMatch && hoursMatch[1]) totalMins += parseInt(hoursMatch[1], 10) * 60
  if (minutesMatch && minutesMatch[1]) totalMins += parseInt(minutesMatch[1], 10)

  return totalMins > 0 ? totalMins : null
}
