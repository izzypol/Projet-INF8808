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
  graphWrapper.style.justifyContent = 'flex-end'
  graphWrapper.style.gap = '10px'
  graphWrapper.style.position = 'relative'
  graphWrapper.style.paddingLeft = '100px'

  let description = document.getElementById('viz5-description')
  if (!description) {
    description = document.createElement('div')
    description.id = 'viz5-description'
    description.style.width = '250px'
    description.style.fontSize = '16px'
    description.style.lineHeight = '1.6'
    description.style.position = 'absolute'
    description.style.left = '-100px'
    description.style.top = '10px'
    description.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
    description.style.padding = '15px'
    description.style.borderRadius = '5px'
    description.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)'
    description.style.zIndex = '20'

    description.innerHTML = `
      <strong style="font-size: 16px;">Comment lire ce graphique :</strong><br />
      Chaque bulle représente un mot fréquemment utilisé dans les taglines.<br>
      <br><strong style="font-size: 16px; margin-top: 8px">Interaction :</strong>
      <ul style="margin-top: 8px; padding-left: 20px; max-width: 100%;">
        <li style="margin-bottom: 8px;"><strong>Menu déroulant</strong> : sélectionnez une saison spécifique pour voir les mots les plus utilisés durant cette période.</li>
        <li style="margin-bottom: 8px;"><strong>Survol</strong> : passez votre souris sur une bulle pour voir des détails supplémentaires sur le mot.</li>
        <li style="margin-bottom: 8px;"><strong>Légende des catégories</strong> : référez-vous au panneau de droite pour identifier les différentes catégories thématiques.</li>
      </ul>
      
      <strong style="font-size: 16px;">Analyse :</strong>
      <ul style="margin-top: 8px; padding-left: 20px; max-width: 100%;">
        <li style="margin-bottom: 8px;">Observez quels types de mots dominent selon les saisons et comment les tendances évoluent.</li>
        <li style="margin-bottom: 8px;">Comparez la fréquence relative des différentes catégories thématiques.</li>
        <li style="margin-bottom: 8px;">Identifiez les mots-clés récurrents qui caractérisent le cinéma de chaque période.</li>
      </ul>
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

  categoryContainer.innerHTML += `<svg id="category-legend-svg" width="175" height="${20 * seasonalCategories.length + 20}"></svg>`

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
  bottomLegendContainer.style.paddingTop = '50px'

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
    const wordMap = {}

    const dataToProcess = Array.isArray(viz5data)
      ? viz5data
      : Object.values(viz5data).flatMap(seasonData => seasonData.taglineWords || [])

    dataToProcess.forEach(wordData => {
      if (!wordData || !wordData.word) return

      const word = wordData.word

      if (!wordMap[word]) {
        wordMap[word] = {
          word,
          count: wordData.count || 0,
          movies: Array.isArray(wordData.movies) ? [...wordData.movies] : []
        }
      } else {
        wordMap[word].count += wordData.count || 0

        if (Array.isArray(wordData.movies)) {
          const existingMovieIds = new Set(wordMap[word].movies.map(movie => movie.id || movie.name))
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
      const ratedMovies = entry.movies.filter(movie => typeof movie.rating === 'number')
      const avgRating = ratedMovies.length
        ? Number((ratedMovies.reduce((sum, movie) => sum + movie.rating, 0) / ratedMovies.length).toFixed(2))
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
