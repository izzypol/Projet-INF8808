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
 * Defines the color scale based on release year.
 * @param data
 * @returns {*}
 */
export function setColorScale(topY) {
  const avg = topY.map(d => d.avg);
        
  return d3.scaleSequential()
        .domain([d3.min(avg), d3.max(avg)])
        .interpolator(d3.interpolateYlOrRd) 
}