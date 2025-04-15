// eslint-disable-next-line camelcase
export function setColorScale_5 (data) {
  return d3.scaleOrdinal().domain(data).range(d3.schemeSet1)
}

// eslint-disable-next-line camelcase
export function setRadiusScale_5 (taglineWordCounts) {
  return d3.scaleLinear().domain([d3.min(taglineWordCounts), d3.max(taglineWordCounts)]).range([10, 25])
}
