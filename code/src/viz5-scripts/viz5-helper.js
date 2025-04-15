/**
 * Creates UI elements for the visualization
 *
 * @param {Array} seasonalCategories - Array of categories
 */
export function createUIElements (seasonalCategories) {
  this.createSeasonDropdown()
  this.createLegendsContainer(seasonalCategories)
}

/**
 * Creates the season selection dropdown
 */
export function createSeasonDropdown () {
  if (!document.getElementById('season-select')) {
    const controlsDiv = document.createElement('div')
    controlsDiv.style.marginBottom = '20px'

    const label = document.createElement('label')
    label.htmlFor = 'season-select'
    label.textContent = 'Select Season: '

    const select = document.createElement('select')
    select.id = 'season-select'

    const options = [
      { value: 'all', text: 'All Seasons' },
      { value: 'spring', text: 'Spring' },
      { value: 'summer', text: 'Summer' },
      { value: 'fall', text: 'Fall' },
      { value: 'winter', text: 'Winter' }
    ]

    options.forEach(option => {
      const optionElement = document.createElement('option')
      optionElement.value = option.value
      optionElement.textContent = option.text
      select.appendChild(optionElement)
    })

    select.value = 'summer'

    controlsDiv.appendChild(label)
    controlsDiv.appendChild(select)

    const svgContainer = document.querySelector('.season-tagline-svg')
    if (svgContainer && svgContainer.parentNode) {
      svgContainer.parentNode.insertBefore(controlsDiv, svgContainer)
    }
  }
}

/**
 * Creates containers for legends inside the existing #tagline-legend div
 *
 * @param {Array} seasonalCategories - Array of categories
 */
export function createLegendsContainer (seasonalCategories) {
  const legendsContainer = document.getElementById('tagline-legend')

  legendsContainer.innerHTML = ''

  legendsContainer.style.display = 'flex'
  legendsContainer.style.flexDirection = 'column'
  legendsContainer.style.gap = '20px'
  legendsContainer.style.marginTop = '20px'
  legendsContainer.style.width = '100%'

  const topRow = document.createElement('div')
  topRow.style.display = 'flex'
  topRow.style.justifyContent = 'flex-start'
  topRow.style.gap = '60px'
  topRow.style.position = 'relative'
  topRow.style.left = '-100px'

  const categoryContainer = document.createElement('div')
  categoryContainer.id = 'category-legend-container'

  const categoryTitle = document.createElement('div')
  categoryTitle.textContent = 'Categories'
  categoryTitle.style.fontWeight = 'bold'
  categoryTitle.style.fontSize = '14px'
  categoryTitle.style.marginBottom = '10px'
  categoryContainer.appendChild(categoryTitle)

  categoryContainer.innerHTML += `<svg id="category-legend-svg" width="150" height="${20 * seasonalCategories.length + 20}"></svg>`

  const frequencyContainer = document.createElement('div')
  frequencyContainer.id = 'frequency-legend-container'

  const frequencyTitle = document.createElement('div')
  frequencyTitle.textContent = 'Frequency'
  frequencyTitle.style.fontWeight = 'bold'
  frequencyTitle.style.fontSize = '14px'
  frequencyTitle.style.marginBottom = '10px'
  frequencyTitle.style.marginLeft = '10px'
  frequencyContainer.appendChild(frequencyTitle)

  frequencyContainer.innerHTML += '<svg id="frequency-legend-svg" width="150" height="300"></svg>'

  topRow.appendChild(categoryContainer)
  topRow.appendChild(frequencyContainer)

  legendsContainer.appendChild(topRow)

  const numberedLegendContainer = document.createElement('div')
  numberedLegendContainer.id = 'numbered-legend-container'
  numberedLegendContainer.style.position = 'relative'
  numberedLegendContainer.style.left = '-100px'

  const numberedTitle = document.createElement('div')
  numberedTitle.textContent = 'Words with Numbers'
  numberedTitle.style.fontWeight = 'bold'
  numberedTitle.style.fontSize = '14px'
  numberedTitle.style.marginBottom = '10px'
  numberedTitle.style.marginLeft = '27%'
  numberedLegendContainer.appendChild(numberedTitle)

  numberedLegendContainer.innerHTML += '<div id="numbered-legend-list" style="font-size: 12px;"></div>'

  legendsContainer.appendChild(numberedLegendContainer)
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
