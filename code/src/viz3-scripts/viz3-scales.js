/**
 *
 *
 * @param {number} width The width of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in X
 */
export function setXScale(width, intervals) {
  // TODO : Set scale

  const xScale = d3.scaleBand()
    .domain(intervals) // Les intervalles deviennent les domaines
    .range([0, width])
    .padding(0);

  return xScale;
}

/**
 *
 *
 * @param {number} height The height of the graph
 * @returns {*} The linear scale in Y
 */
export function setYScale(height) {

  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([height, 0]);

  return yScale
}