/**
 * Defines the log scale used to position the center of the circles in X.
 *
 * @param {number} width The width of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in X
 */
export function setXScale (width, directors) {
    const xScale = d3.scaleBand()
      .domain(directors)
      .range([0, 650])
      .padding(0.5);  
  
    return xScale
  }

/**
 * Defines the log scale used to position the center of the circles in Y.
 *
 * @param {number} height The height of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in Y
 */
export function setYScale(height, topY) {      // Idem que la fonction précédente
    // TODO : Set scale
    const yScale =  d3.scaleBand()
      .domain(topY)
      .range([0, height])
      .padding(0.05);
  
    return yScale}

/**
 * Sets the color scale for entity types.
 * 
 * @returns {d3.ScaleOrdinal} The color scale
 */
export function setColorScale() {
  return d3.scaleOrdinal()
    .domain(['actor', 'director'])
    .range(['#4285F4', '#EA4335']);
}

/**
 * Creates a radius scale for entity nodes based on collaboration count.
 * 
 * @param {Array} data The entity data
 * @returns {d3.ScaleLinear} The radius scale
 */
export function setRadiusScale(data) {
  // Find the maximum connection count
  const maxCount = d3.max(data, d => d.count || 0);
  
  // Create scale with range appropriate for the visualization
  return d3.scaleLinear()
    .domain([0, maxCount])
    .range([5, 20]);
}