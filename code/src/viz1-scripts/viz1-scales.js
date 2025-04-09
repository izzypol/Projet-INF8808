/**
 * Defines the scale to use for the circle markers' radius.
 *
 * The radius is linearly proportional to the total number of nominations.
 * (Oscars + Golden Globes), in the interval [5, 20].
 *
 * @param {object} data The data to be displayed
 * @returns {*} The linear scale used to determine the radius
 */
export function setRadiusScale (data) {
  const flatData = Object.values(data).flat();

  const minNominations = d3.min(flatData, d =>
    (d.oscarsData.oscarNominations + d.goldenGlobesData.goldenGlobesNominations)
  );

  const maxNominations = d3.max(flatData, d =>
    (d.oscarsData.oscarNominations + d.goldenGlobesData.goldenGlobesNominations)
  );

  return d3.scaleLinear()
    .domain([minNominations, maxNominations])
    .range([5, 15]);
}

/**
 * Defines the color scale based on release year.
 * @param data
 * @returns {*}
 */
export function setColorScale(data) {
  const flatData = Object.values(data).flat();

  const years = flatData.map(d => new Date(d.releaseDate).getFullYear());
  const minYear = d3.min(years);
  const maxYear = d3.max(years);

  return d3.scaleSequential()
    .domain([minYear, maxYear])
    .interpolator(d3.interpolateViridis); // interpolatePlasma ou interpolateViridis
}

/**
 * Defines the linear scale in X (Box Office).
 *
 * @param {number} width The width of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in X
 */
export function setXScale (width, data) {
  const flatData = Object.values(data).flat()
    .filter(d => d.box_office !== "Not Available" && !isNaN(d.box_office));

  const minBO = d3.min(flatData, d => +d.box_office);
  const maxBO = d3.max(flatData, d => +d.box_office);

  return d3.scaleLog()
    .domain([minBO, maxBO])
    .range([0, width]);
}

/**
 * Defines the linear scale in Y (rank), inverted.
 *
 * @param {number} height The height of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in Y
 */
export function setYScale (height, data) {
  const flatData = Object.values(data).flat()
    .filter(d => d.rank !== undefined && !isNaN(d.rank));

  const minRank = d3.min(flatData, d => d.rank);
  const maxRank = d3.max(flatData, d => d.rank);

  return d3.scaleLinear()
    .domain([maxRank, minRank]) // échelle inversée, le meilleur rank est en haut
    .range([height, 0]);
}
