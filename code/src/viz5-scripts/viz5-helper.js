import { wordToCategoryMap } from './viz5-preprocess.js'

/**
 * Creates containers for legends inside the existing #tagline-legend div
 *
 * @param {Array} seasonalCategories - Array of categories
 */
export function createLegendsContainer (seasonalCategories) {
  const graphWrapper = document.querySelector('#season-taglines')
  graphWrapper.style.display = 'flex'
  graphWrapper.style.flexDirection = 'row'
  graphWrapper.style.alignItems = 'flex-start'
  graphWrapper.style.justifyContent = 'space-between'
  graphWrapper.style.gap = '20px'
  graphWrapper.style.position = 'relative'

  let description = document.getElementById('viz5-description')
  if (!description) {
    description = document.createElement('div')
    description.id = 'viz5-description'
    description.style.width = '20%'
    description.style.fontSize = '13px'
    description.style.lineHeight = '1.6'
    description.style.paddingRight = '10px'

    description.innerHTML = `
      <strong>Comment lire ce graphique :</strong><br />
      Chaque bulle représente un mot fréquemment utilisé dans les taglines.
      <ul style="margin-top: 5px; padding-left: 16px;">
        <li><strong>Taille</strong> : plus une bulle est grande, plus le mot est fréquent.</li>
        <li><strong>Couleur</strong> : elle correspond à la catégorie thématique du mot.</li>
        <li><strong>Numéros</strong> : certains mots trop longs ou peu lisibles sont remplacés par des numéros. 
        La légende en bas de la visualisation les détaille.</li>
      </ul>
      <br />
      Utilisez le menu déroulant pour explorer les mots par saison.
    `
    graphWrapper.insertBefore(description, graphWrapper.firstChild)
  }

  const legend = document.getElementById('tagline-legend')
  legend.innerHTML = ''
  legend.style.position = 'absolute'
  legend.style.top = '10px'
  legend.style.right = '10px'
  legend.style.zIndex = '10'
  legend.style.display = 'flex'
  legend.style.flexDirection = 'column'
  legend.style.gap = '10px'
  legend.style.background = 'none'

  const categoryContainer = document.createElement('div')
  categoryContainer.id = 'category-legend-container'

  const categoryTitle = document.createElement('div')
  categoryTitle.textContent = 'Catégories'
  categoryTitle.style.fontWeight = 'bold'
  categoryTitle.style.fontSize = '14px'
  categoryTitle.style.marginBottom = '6px'
  categoryContainer.appendChild(categoryTitle)

  categoryContainer.innerHTML += `<svg id="category-legend-svg" width="150" height="${20 * seasonalCategories.length + 20}"></svg>`

  const frequencyContainer = document.createElement('div')
  frequencyContainer.id = 'frequency-legend-container'

  const frequencyTitle = document.createElement('div')
  frequencyTitle.textContent = 'Fréquences'
  frequencyTitle.style.fontWeight = 'bold'
  frequencyTitle.style.fontSize = '14px'
  frequencyTitle.style.marginBottom = '6px'
  frequencyContainer.appendChild(frequencyTitle)

  frequencyContainer.innerHTML += '<svg id="frequency-legend-svg" width="150" height="150"></svg>'

  legend.appendChild(categoryContainer)
  legend.appendChild(frequencyContainer)

  const bottomLegendContainer = document.getElementById('bubble-numbers-legend')
  bottomLegendContainer.style.position = 'absolute'
  bottomLegendContainer.style.top = 'calc(100% - 500px)'
  bottomLegendContainer.style.left = '50%'
  bottomLegendContainer.style.transform = 'translateX(-50%)'
  bottomLegendContainer.style.textAlign = 'center'
  bottomLegendContainer.style.width = '100%'
  bottomLegendContainer.style.zIndex = '1'
  bottomLegendContainer.style.marginBottom = '30px'

  const legendList = document.createElement('div')
  legendList.id = 'numbered-legend-list'
  legendList.textContent = 'Mots avec chiffres'
  legendList.style.fontWeight = 'bold'
  legendList.style.fontSize = '16px'
  legendList.style.marginBottom = '20px'
  legendList.style.textAlign = 'center'

  bottomLegendContainer.appendChild(legendList)
}

/**
 * Gets the data for the selected season
 *
 * @param {string} season - Selected season
 * @param {object} viz5data - Season data object
 * @returns {Array} Data for the selected season
 */
export function getSeasonData (season, viz5data) {
  if (season === 'every-season') {
    console.log('viz5data structure:', viz5data)
    const wordMap = {}

    // Determine if viz5data is an object with seasons or an array
    const dataToProcess = Array.isArray(viz5data) 
      ? viz5data 
      : Object.values(viz5data).flatMap(seasonData => seasonData.taglineWords || [])

    console.log('Data to process:', dataToProcess)

    dataToProcess.forEach(wordData => {
      // Ensure wordData is valid
      if (!wordData || !wordData.word) return

      const word = wordData.word

      if (!wordMap[word]) {
        wordMap[word] = {
          word,
          count: wordData.count || 0,
          movies: Array.isArray(wordData.movies) ? [...wordData.movies] : []
        }
      } else {
        // Increment count
        wordMap[word].count += wordData.count || 0

        // Merge movies avoiding duplicates
        if (Array.isArray(wordData.movies)) {
          const existingMovieIds = new Set(wordMap[word].movies.map(m => m.id || m.name))
          wordData.movies.forEach(movie => {
            const uniqueId = movie.id || movie.name
            if (!existingMovieIds.has(uniqueId)) {
              wordMap[word].movies.push(movie)
              existingMovieIds.add(uniqueId)
            }
          })
        }
      }
    })

    const mergedWords = Object.values(wordMap).map(entry => {
      const ratedMovies = entry.movies.filter(m => typeof m.rating === 'number')
      const avgRating = ratedMovies.length
        ? Number((ratedMovies.reduce((sum, m) => sum + m.rating, 0) / ratedMovies.length).toFixed(2))
        : undefined

      const topMovies = ratedMovies.sort((a, b) => b.rating - a.rating).slice(0, 5)
      const category = wordToCategoryMap[entry.word] || 'Autres'

      return {
        word: entry.word,
        count: entry.count,
        avgRating,
        movies: topMovies,
        category
      }
    })

    const sortedWords = mergedWords.sort((a, b) => b.count - a.count)
    return sortedWords.slice(0, 100)
  } else {
    return viz5data[season].taglineWords
  }
}
