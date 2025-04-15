/**
 * Creates a scale for bubble radius based on word counts
 *
 * @param {Array} taglineCounts - Array of word counts
 * @returns {Function} D3 scale function for radius
 */
export function createRadiusScale (taglineCounts) {
    return d3.scaleSqrt().domain([0, d3.max(taglineCounts)]).range([6, 50])
  }
  
  /**
     * Creates a scale for bubble colors based on their respective categories
     *
     * @param {Array} categories - Array of categories
     * @returns {Function} D3 scale function for colors
     */
  export function createColorScale (categories) {
    return d3.scaleOrdinal().domain(categories).range(d3.schemeSet1)
  }
  