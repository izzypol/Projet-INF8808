/**
 * Defines the log scale used to position the center of the circles in X.
 *
 * @param {number} width The width of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in X
 */
export function setXScale (width, data) {
    // TODO : Set scale
  
    const flatData = Object.values(data).flat();  // On applatit pour avoir des extrema globaux de GDP
    //console.log(data);
  
    const xScale = d3.scaleLinear()                  // Contrairement au carnet observable, l'échelle est logarithmique
      .domain([
                d3.min(flatData, d => d.year),    
                d3.max(flatData, d => d.year)
              ])
      .range([0,width]);
  
    return xScale
  }

/**
 * Defines the log scale used to position the center of the circles in Y.
 *
 * @param {number} height The height of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in Y
 */
export function setYScaleBO (height, data) {      // Idem que la fonction précédente
    // TODO : Set scale

    const flatData = Object.values(data).flat();
  
    const yScale = d3.scaleLinear()
      .domain([
                d3.min(flatData, d => 0),    
                d3.max(flatData, d => 1000)
              ])
      .range([height,0]);
  
    return yScale}

export function setYScaleMesureSucces (height, data, key) {
  // TODO : Set scale

  const flatData = Object.values(data).flat();
  //console.log("flat : ", flatData);

//   const maxIndex = d3.maxIndex(flatData, d => d[key]);
// const maxEntry = flatData[maxIndex];

// console.log(
//   "Max value:", maxEntry[key],
//   "Movie name:", maxEntry.name
// );

  const yScale = d3.scaleLinear()
    .domain([
              //d3.min(flatData, d => d[key]),    
              //d3.max(flatData, d => d[key])
              d3.min(data, d => 
                d3.min(d.data, x => x.average)
              ),
              d3.max(data, d => 
                d3.max(d.data, x => x.average)
              )
            ])
    .range([height,0]);

  return yScale}

export function setColorScale(data){

  const colorScale = d3.scaleOrdinal()
    .domain(data.sort())
                                                    
    .range(d3.schemeSet2);                          

  return colorScale
}