import * as viz5Legend from './viz5-legend.js'
import * as Tooltip from './viz5-tooltip.js'

/**
 * Creates the bubble chart visualization with numbered references for small text
 *
 * @param {Array} data - Data array for the visualization
 * @param {object} g - D3 selection for the SVG group
 * @param {number} width - Width of the visualization area
 * @param {number} height - Height of the visualization area
 * @param {Function} radiusScale - Scale function for bubble radius
 * @param {Function} colorScale - Scale function for bubble color
 */
export function createVisualization (data, g, width, height, radiusScale, colorScale) {
  const numberedWords = []

  data.forEach((d, i) => {
    const radius = radiusScale(d.count)
    const fontSize = Math.min(2 * radius / 3, 14)
    const estimatedTextWidth = d.word.length * (fontSize * 0.6)

    if (fontSize < 8 || estimatedTextWidth > radius * 1.8) {
      d.refNumber = numberedWords.length + 1
      numberedWords.push({
        number: d.refNumber,
        word: d.word,
        category: d.category,
        count: d.count,
        color: colorScale(d.category)
      })
    }
  })

  const simulation = this.createForceSimulation(data, width, height, radiusScale)

  const nodes = this.createBubbles(data, g, radiusScale, colorScale)

  const labels = g.selectAll('.bubble-text')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'bubble-text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .text(d => {
      return d.refNumber ? d.refNumber : d.word
    })
    .style('font-size', d => {
      if (d.refNumber) {
        return `${Math.min(2 * radiusScale(d.count) / 2, 16)}px`
      } else {
        return `${Math.min(2 * radiusScale(d.count) / 3, 14)}px`
      }
    })
    .style('pointer-events', 'none')
    .style('font-weight', '600')
    .style('fill', 'black')

  simulation.on('tick', () => {
    this.updatePositions(nodes, labels, width, height, radiusScale)
  })

  viz5Legend.setNumberedWordsLegend(numberedWords)
  Tooltip.initTooltip()
}

/**
 * Creates force simulation for the bubbles
 *
 * @param {Array} data - Data array for the visualization
 * @param {number} width - Width of the visualization area
 * @param {number} height - Height of the visualization area
 * @param {Function} radiusScale - Scale function for bubble radius
 * @returns {object} D3 force simulation
 */
export function createForceSimulation (data, width, height, radiusScale) {
  const padding = 2

  return d3.forceSimulation(data)
    .force('center', d3.forceCenter((width / 2) - 100, height / 2 - 50))
    .force('x', d3.forceX(width / 2).strength(0.1))
    .force('y', d3.forceY(height / 2 + 40).strength(0.1))
    .force('charge', d3.forceManyBody().strength(8))
    .force('collision', d3.forceCollide().radius(d => radiusScale(d.count) + padding))
}

/**
 * Creates bubble nodes
 *
 * @param {Array} data - Data array for the visualization
 * @param {object} g - D3 selection for the SVG group
 * @param {Function} radiusScale - Scale function for bubble radius
 * @param {Function} colorScale - Scale function for bubble color
 * @returns {object} D3 selection of nodes
 */
export function createBubbles (data, g, radiusScale, colorScale) {
  return g.selectAll('.node')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'node')
    .attr('r', d => radiusScale(d.count))
    .attr('cx', d => d.x || 0)
    .attr('cy', d => d.y || 0)
    .style('fill', d => colorScale(d.category))
    .style('fill-opacity', 0.8)
    .style('stroke', 'black')
    .style('stroke-width', 1)
    .on('mouseover', function (event, d) {
      Tooltip.showTooltip(d, event)
    })
    .on('mousemove', function (event, d) {
      Tooltip.showTooltip(d, event)
    })
    .on('mouseout', function () {
      Tooltip.hideTooltip()
    })
}

/**
 * Creates text labels for the bubbles
 *
 * @param {Array} data - Data array for the visualization
 * @param {object} g - D3 selection for the SVG group
 * @param {Function} radiusScale - Scale function for bubble radius
 * @returns {object} D3 selection of text labels
 */
export function createLabels (data, g, radiusScale) {
  return g.selectAll('.bubble-text')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'bubble-text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .text(d => d.word)
    .style('font-size', d => Math.min(2 * radiusScale(d.count) / 3, 14) + 'px')
    .style('pointer-events', 'none')
    .style('font-weight', '600')
}

/**
 * Updates positions of nodes and labels on each tick
 *
 * @param {object} nodes - D3 selection of nodes
 * @param {object} labels - D3 selection of text labels
 * @param {number} width - Width of the visualization area
 * @param {number} height - Height of the visualization area
 * @param {Function} radiusScale - Scale function for bubble radius
 */
export function updatePositions (nodes, labels, width, height, radiusScale) {
  nodes
    .attr('cx', d => {
      const bubbleRadius = radiusScale(d.count)
      return d.x = Math.max(bubbleRadius, Math.min(width - bubbleRadius, d.x));
    })
    .attr('cy', d => {
      const bubbleRadius = radiusScale(d.count)
      return d.y = Math.max(bubbleRadius, Math.min(height - bubbleRadius, d.y));
    })

  labels
    .attr('x', d => d.x)
    .attr('y', d => {
      return d.y + 4
    })
}
