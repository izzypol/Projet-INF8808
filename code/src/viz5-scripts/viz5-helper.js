/**
 * Generates the SVG element g which will contain the data visualisation.
 *
 * @param {object} margin The desired margins around the graph
 * @returns {*} The d3 Selection for the created g element
 */
export function margeG (g, margin) {
    g.attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')')
  }
  
  /**
   * Sets the size of the SVG canvas containing the graph.
   *
   * @param {number} width The desired width
   * @param {number} height The desired height
   */
  export function setCanvasSize_5 (width, height) {
    d3.select('.season-taglines-svg')
      .attr('width', width)
      .attr('height', height)
  }

/**
 * Generates a specific <g> container inside a given SVG container.
 *
 * @param {string} svgSelector The selector of the SVG container (e.g. ".viz1-svg" or ".film-impact-svg")
 * @param {object} margin The desired margins around the graph
 * @param {string} id Optional ID or class for the <g> container
 * @returns {*} The d3 Selection for the created g element
 */
export function generateG_5 (svgSelector, margin, id = null) {
    const g = svgSelector
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    if (id) {
      g.attr('id', id);
    }
  
    return g;
  }
