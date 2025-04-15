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
  if (season === 'all') {
    const wordMap = {}

    Object.values(viz5data).forEach(seasonData => {
      seasonData.taglineWords.forEach(word => {
        if (!wordMap[word.word]) {
          wordMap[word.word] = { ...word }
        } else {
          wordMap[word.word].count += word.count

          if (word.movies) {
            if (!wordMap[word.word].movies) {
              wordMap[word.word].movies = [...word.movies]
            } else {
              const existingMovieIds = new Set(wordMap[word.word].movies.map(m => m.id))
              const uniqueNewMovies = word.movies.filter(movie =>
                !existingMovieIds.has(movie.id)
              )
              wordMap[word.word].movies.push(...uniqueNewMovies)
            }
          }
        }
      })
    })

    const sortedWords = Object.values(wordMap).sort((a, b) => b.count - a.count)
    return sortedWords.slice(0, 110)
  } else {
    return viz5data[season].taglineWords
  }
}
