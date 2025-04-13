/**
 * Defines the contents of the tooltip. See CSS for tooltip styling. The tooltip
 * features the number of times a word was used in the taglines from a specific season 
 * by a label and followed by units where applicable.
 *
 * @param {object} d The data associated to the hovered element
 * @returns {string} The tooltip contents
 */
export function getContents_5 (d) {
  console.log(d)
  const hoverData_5 = {
    Count: getTaglineCounts(d)
  }

  const content = d3.create()

  Object.entries(hoverData_5).forEach(([key, value]) => {
    content.append('div')
      .text(`${key} : `)
      .append('span')
      .text(value)
      .attr('class', 'tooltip-value')
  })

  return content.html()
}