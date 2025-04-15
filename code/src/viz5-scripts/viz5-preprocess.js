
/**
 * Helper functions for metrics calculations (averages, quantity, etc)
 */
export const MetricsHelper = {
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
// Words that do not bring significant value to the data
const stopWords = new Set([
  'about', 'after', 'again', 'against', 'all', 'also', 'and', 'any', 'are', 'because',
  'been', 'before', 'being', 'between', 'both', 'but', 'can', 'cant', 'could', 'did', 'does',
  'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'his', 'here', 'how', 'into', 'its', 'just', 'more', 'most', 'not', 'now', 'off',
  'once', 'only', 'other', 'over', 'same', 'should', 'some', 'such', 'than', 'that',
  'the', 'their', 'them', 'then', 'there', 'theres', 'these', 'they', 'this', 'those', 'through',
  'too', 'under', 'until', 'very', 'was', 'were', 'what', 'when', 'where', 'which',
  'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'your', 'youve', 'hes', 'got'
])

// Word categories for tagline significant word categorization
const wordCategories = {
  emotionalThemes: {
    positiveEmotions: [
      'hope', 'triumph', 'dreams', 'love', 'heart', 'passion', 'friendship',
      'celebration', 'comedy', 'laugh', 'laughter', 'awe', 'incredible',
      'extraordinary', 'brilliant', 'good', 'joy', 'perfect'
    ],
    negativeEmotions: [
      'horror', 'beast', 'suspense', 'murder', 'hate', 'vengeance', 'betrayal',
      'enemy', 'war', 'fight', 'kill', 'death', 'dead', 'murdered', 'sin',
      'crime', 'killer', 'hell', 'madness', 'fear', 'terror', 'treason', 'lies'
    ],
    inspirational: [
      'courage', 'believe', 'believes', 'inspired', 'hero', 'masterpiece',
      'greatest', 'dream', 'imagination'
    ]
  },

  timeAndChange: {
    timeElements: [
      'time', 'years', 'forever', 'beginning', 'year', 'days', 'minutes',
      'day', 'november', 'season', 'summer', 'since', 'never', 'past', 'last',
      'lifetime'
    ],
    transformation: [
      'change', 'journey', 'adventure', 'becomes', 'became', 'ends', 'break', 'begins', 'new'
    ],
    progressMovement: [
      'way', 'comes', 'goes', 'run', 'come', 'coming', 'take',
      'close', 'back', 'out', 'far', 'stay'
    ]
  },

  humanExperience: {
    identity: [
      'family', 'father', 'husband', 'man', 'people', 'children',
      'someone', 'anyone', 'everyone', 'young', 'men', 'name', "he's",
      'girls', 'you', 'her', 'our', 'star', 'parents', 'others', 'him',
      'job'
    ],
    relationships: [
      'marriage'
    ],
    lifeAndDeath: [
      'life', 'live', 'die', 'born', 'nothing'
    ],
    perception: [
      'see', 'feel', 'mind', 'think', 'remember', 'memories', 'forget',
      'discover', 'want', 'need', 'made', 'didnt', 'knew', 'know', 'like',
      'meant', 'find', 'get', 'wanted'
    ]
  },

  storytellingElements: {
    narrative: [
      'story', 'legend', 'saga', 'true', 'real', 'tale', 'films', 'picture', 'experience'
    ],
    mystery: [
      'secrets', 'missing', 'truth', 'beyond', 'mystery'
    ],
    conflict: [
      'gun', 'powder'
    ],
    setting: [
      'world', 'worlds', 'earth', 'universe', 'space', 'galaxy', 'street', 'country',
      'nation', 'wall', 'inside', 'lubbock', 'texas', 'syracuse', 'calgary'
    ]
  },

  filmSpecific: {
    cinemaTerms: [
      'film', 'screen', 'director', 'motion', 'footage', 'theatre',
      'dvd', 'reissue', 'poster', 'print', 'rerelease', 'screens',
      'hollywood', 'hitchcock', 'ingmar', 'bergman', 'alfred'
    ],
    movieQualities: [
      'classic', 'powerful', 'best'
    ],
    genreWords: [
      'action', 'thriller', 'musical', 'music'
    ],
    marketingTerms: [
      'thrills', 'exciting', 'waiting'
    ]
  },

  conceptual: {
    abstractConcepts: [
      'power', 'freedom', 'free', 'innocence', 'silence', 'mighty', 'make', 'thing', 'put'
    ],
    existence: [
      'place'
    ],
    scaleAndIntensity: [
      'great', 'entire', 'whole', 'little', 'high',
      'thousands', 'much', 'anything', 'everything', 'different', 'every',
      'alone', 'must', 'ever', 'long'
    ]
  },

  miscellaneous: {
    numbers: [
      'one', 'three', 'seven', 'first', 'second', 'two', '2007'
    ],
    specializedTerms: [
      'sheet', 'avalanche', 'morning', 'caps', 'una', 'que', 'taste', 'inc',
      'water', 'clear', 'french', 'read', 'prize', 'american'
    ]
  }
}

const wordToCategoryMap = (() => {
  const map = {}
  Object.entries(wordCategories).forEach(([mainCategory, subcategories]) => {
    Object.entries(subcategories).forEach(([subCategory, words]) => {
      words.forEach(word => {
        if (!map[word]) map[word] = ''

        let stringMainCategory = String(mainCategory)
        stringMainCategory = stringMainCategory && String(stringMainCategory[0]).toUpperCase() + String(stringMainCategory).slice(1)
        stringMainCategory = stringMainCategory.replace(/([a-z])([A-Z])/g, '$1 $2')
        stringMainCategory = stringMainCategory.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
        map[word] = stringMainCategory
      })
    })
  })
  return map
})()

/**
 * Groups the movie data by seasons (summer, fall, winter, spring) based on release dates
 * with tagline word analysis distributed by season
 *
 * @param {object[]} movies Array of movie objects
 * @param {number} minWordLength Minimum length of words for tagline analysis (3 by default)
 * @param {number} minOccurrences Minimum occurrences for global analysis (2 by default)
 * @returns {object} Object with movie data organized by season and their associated metrics
 */
export function getDataBySeason (movies, minWordLength = 3, minOccurrences = 2) {
  const createSeasonObject = (beginDate, endDate) => ({
    beginDate,
    endDate,
    movies: [],
    count: 0,
    genres: [],
    mostPopularGenre: null,
    taglineWords: [],
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
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10))
    const monthDay = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    if (monthDay >= '03-20' && monthDay <= '06-20') return 'spring'
    else if (monthDay >= '06-21' && monthDay <= '09-22') return 'summer'
    else if (monthDay >= '09-23' && monthDay <= '12-20') return 'fall'
    else return 'winter'
  }

  const wordCounts = {}
  movies.forEach(movie => {
    if (!movie.tagline || typeof movie.tagline !== 'string') return
    const words = movie.tagline.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
      .filter(word => word.length >= minWordLength && !stopWords.has(word))
    const uniqueWords = new Set(words)
    uniqueWords.forEach(word => { wordCounts[word] = (wordCounts[word] || 0) + 1 })
  })

  const significantWords = Object.keys(wordCounts).filter(word => wordCounts[word] >= minOccurrences)

  movies.forEach(movie => {
    const season = getSeason(movie.releaseDate)
    if (season === null) return
    seasons[season].movies.push(movie)
    seasons[season].count++
    MetricsHelper.addMovieMetrics(seasons[season], movie)
    if (movie.genre) {
      const genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre]
      genres.forEach(genre => { if (genre && genre.trim()) seasons[season].genres.push(genre.trim()) })
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

    const seasonWordData = {}
    const seasonWordCounts = {}
    data.movies.forEach(movie => {
      if (!movie.tagline || typeof movie.tagline !== 'string') return
      const words = movie.tagline.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
        .filter(word => significantWords.includes(word))
      const uniqueWords = new Set(words)
      uniqueWords.forEach(word => { seasonWordCounts[word] = (seasonWordCounts[word] || 0) + 1 })
    })

    Object.keys(seasonWordCounts).forEach(word => {
      seasonWordData[word] = {
        word,
        count: seasonWordCounts[word],
        category: wordToCategoryMap[word] || [],
        movies: [],
        genres: [],
        mostPopularGenre: null,
        ...MetricsHelper.createMetricsObject()
      }
    })

    data.movies.forEach(movie => {
      if (!movie.tagline || typeof movie.tagline !== 'string') return
      const movieWords = new Set(
        movie.tagline.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
          .filter(word => word in seasonWordData)
      )
      movieWords.forEach(word => {
        seasonWordData[word].movies.push({ name: movie.name, year: movie.year, tagline: movie.tagline, rating: movie.rating })
        MetricsHelper.addMovieMetrics(seasonWordData[word], movie)
        if (movie.genre) {
          const genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre]
          genres.forEach(genre => { if (genre && genre.trim()) seasonWordData[word].genres.push(genre.trim()) })
        }
      })
    })

    Object.keys(seasonWordData).forEach(word => {
      MetricsHelper.calculateAverages(seasonWordData[word])
      if (seasonWordData[word].genres && seasonWordData[word].genres.length) {
        const { mostPopularGenre } = MetricsHelper.findMostPopularGenre(seasonWordData[word].genres)
        seasonWordData[word].mostPopularGenre = mostPopularGenre
      }
      MetricsHelper.cleanupMetricsProperties(seasonWordData[word])
      delete seasonWordData[word].genres
    })

    data.taglineWords = Object.values(seasonWordData).sort((a, b) => b.count - a.count)
    MetricsHelper.cleanupMetricsProperties(data)
    delete data.genres
  })

  return seasons
}

/**
 * Creates a list of strings that contains the different word categories
 *
 * @param {object} seasonalData - Object containing the various word data associated to each season
 * @returns {string[]} Array of strings with the different word categories
 */
export function getSeasonalCategories (seasonalData) {
  const categories = []
  Object.entries(seasonalData).map(([keys, value]) => {
    value.taglineWords.forEach(tagline => {
      if (!categories.includes(tagline.category)) categories.push(tagline.category)
    })
  })

  return categories
}

/**
 * Iterates over the different words associated to a given season and stores their count in an array
 *
 * @param {object} seasonalData - Object containing the various word data associated to each season
 * @returns {string[]} Array of word counts associated to a given season
 */
export function getTaglineCounts (seasonalData) {
  const taglineCounts = []
  Object.entries(seasonalData).map(([keys, value]) => {
    value.taglineWords.forEach(tagline => {
      if (!taglineCounts.includes(tagline.count)) taglineCounts.push(tagline.count)
    })
  })

  return taglineCounts
}
