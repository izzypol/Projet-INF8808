
/**
 * Creates the color legend for categories
 *
 * @param {Array} seasonalCategories - Array of categories
 * @param {Function} colorScale - D3 color scale function
 */
export function setLegendColor (seasonalCategories, colorScale) {
  const categorySvg = d3.select('#category-legend-svg')
  categorySvg.html('')

  seasonalCategories.forEach((category, i) => {
    const y = 15 + i * 20

    categorySvg.append('circle')
      .attr('cx', 10)
      .attr('cy', y)
      .attr('r', 6)
      .style('fill', colorScale(category))
      .style('stroke', 'black')
      .style('stroke-width', 0.5)

    categorySvg.append('text')
      .attr('x', 25)
      .attr('y', y + 4)
      .attr('text-anchor', 'start')
      .style('font-size', '14px')
      .text(category)
  })
}

/**
   * Creates the size legend for word frequency bubbles and the color categories legend
   *
   * @param {Array} taglineCounts - Array of word counts
   * @param {Function} radiusScale - D3 radius scale function
   */
export function setLegendSize (taglineCounts, radiusScale) {
  const frequencySvg = d3.select('#frequency-legend-svg')
  frequencySvg.html('')

  const idealBubbleValues = [1, 3, 5, 10]
  let valuesToDisplay = []

  idealBubbleValues.forEach(idealValue => {
    if (taglineCounts.includes(idealValue)) {
      valuesToDisplay.push(idealValue)
    } else {
      const closest = taglineCounts.reduce((previous, current) =>
        Math.abs(current - idealValue) < Math.abs(previous - idealValue) ? current : previous
      )

      if (!valuesToDisplay.includes(closest)) {
        valuesToDisplay.push(closest)
      }
    }
  })

  valuesToDisplay.sort((a, b) => b - a)
  valuesToDisplay = [...new Set(valuesToDisplay)]

  const legendRadiusScale = d3.scaleSqrt()
    .domain(radiusScale.domain())
    .range([6, 20])

  const maxRadius = legendRadiusScale(valuesToDisplay[0])
  const minRadius = legendRadiusScale(valuesToDisplay[valuesToDisplay.length - 1])

  const spacing = 5
  const positions = []
  let currentY = maxRadius

  valuesToDisplay.forEach((value, i) => {
    const radius = legendRadiusScale(value)
    positions.push(currentY)
    if (i < valuesToDisplay.length - 1) {
      currentY += radius + spacing + legendRadiusScale(valuesToDisplay[i + 1])
    }
  })

  const totalHeight = positions[positions.length - 1] + minRadius + 20
  frequencySvg.attr('height', totalHeight)

  const centerX = 50
  const lineX = centerX + maxRadius + 15

  const startY = positions[0] - maxRadius
  const endY = positions[positions.length - 1] + minRadius

  valuesToDisplay.forEach((value, i) => {
    frequencySvg.append('circle')
      .attr('cx', centerX)
      .attr('cy', positions[i])
      .attr('r', legendRadiusScale(value))
      .style('fill', 'black')
      .style('stroke', 'black')
      .style('stroke-width', 1)
  })

  frequencySvg.append('line')
    .attr('x1', lineX)
    .attr('y1', endY)
    .attr('x2', lineX)
    .attr('y2', startY + 10)
    .attr('stroke', 'black')
    .attr('stroke-width', 1.5)

  frequencySvg.append('path')
    .attr('d', `M${lineX - 5},${startY + 10} L${lineX}, ${startY} L${lineX + 5},${startY + 10} Z`)
    .style('fill', 'black')
    .style('stroke', 'none')
}

/**
 * Creates the numbered words legend below the others with color-coded circles
 *
 * @param {Array} numberedWords - Array of objects with number, word, category, count
 */
export function setNumberedWordsLegend (numberedWords) {
  const listContainer = document.getElementById('bubble-numbers-legend')
  if (!listContainer) return

  listContainer.innerHTML = ''

  const ul = document.createElement('ul')
  ul.style.listStyle = 'none'
  ul.style.padding = '0'
  ul.style.margin = '0'
  ul.style.columnCount = 6
  ul.style.columnGap = '40px'
  ul.style.justifySelf = 'flex-end'


  numberedWords.forEach(entry => {
    const li = document.createElement('li')
    li.style.display = 'flex'
    li.style.alignItems = 'center'
    li.style.marginBottom = '6px'

    const colorCircle = document.createElement('span')
    colorCircle.style.display = 'inline-block'
    colorCircle.style.width = '10px'
    colorCircle.style.height = '10px'
    colorCircle.style.borderRadius = '50%'
    colorCircle.style.backgroundColor = entry.color || 'gray'
    colorCircle.style.marginRight = '6px'
    colorCircle.style.border = '1px solid black'

    const text = document.createElement('span')
    text.textContent = `${entry.number}. ${entry.word}`

    li.appendChild(colorCircle)
    li.appendChild(text)
    ul.appendChild(li)
  })

  listContainer.appendChild(ul)
}
