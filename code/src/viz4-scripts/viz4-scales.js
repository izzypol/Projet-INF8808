/**
 * Defines the linear scale used to position the center of the circles in X.
 *
 * @param {number} width The width of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in X
 */
export function setXScale (width, data) {
  
    const flatData = Object.values(data).flat();
  
    const xScale = d3.scaleLinear()
      .domain([
                d3.min(flatData, d => d.year),    
                d3.max(flatData, d => d.year)
              ])
      .range([0,width]);
  
    return xScale
  }

/**
 * Defines the linear scale displayed by default in Y.
 *
 * @param {number} height The height of the graph
 * @returns {*} The linear scale in Y
 */
export function setEmptyYScale (height) {
  
    const yScale = d3.scaleLinear()
      .domain([
                0,
                100
              ])
      .range([height,0]);
  
    return yScale}

/**
 * Sets a linear scale for the Y-axis based on a specified data key.
 * Used for success measure visualizations with dynamic domain calculation.
 * 
 * @param {number} height - The height of the graph in pixels
 * @param {object} data - The dataset containing the values to scale
 * @param {string} key - The property name to use for domain calculation
 * @returns {d3.ScaleLinear} A D3 linear scale configured for the Y-axis
 */
export function setYScaleMesureSucces (height, data, key) {

  const yScale = d3.scaleLinear()
    .domain([
              d3.min(data, d => 
                d3.min(d.data, x => x.average)
              ),
              d3.max(data, d => 
                d3.max(d.data, x => x.average)
              )
            ])
    .range([height,0]);

  return yScale
}

/**
 * Creates an ordinal color scale mapping categories to colors from the d3.schemeSet2 palette.
 * 
 * @param {Array} data - Dataset containing categories to be color-coded
 * @returns {d3.ScaleOrdinal} A D3 ordinal scale configured for category coloring
 */
export function setColorScale(data){

  const categories = data.map(d => d.category).sort();

  const colorScale = d3.scaleOrdinal()
    .domain(categories)
    .range(d3.schemeSet2);                          

  return colorScale
}