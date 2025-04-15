import * as d3 from 'd3';

/**
 * Sets the color scale for entity types.
 * 
 * @returns {d3.ScaleOrdinal} The color scale
 */
export function createColorScale() {
  return d3.scaleOrdinal()
    .domain(['actor', 'director', 'writer'])
    .range(['#4285F4', '#EA4335', '#F4B400']);
}

/**
 * Create the chord layout object
 * @returns {d3.ChordLayout} The chord layout
 */
export function createChordScales() {
  return d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending);
}

/**
 * Create the arc generator
 * @param {number} innerRadius - The inner radius of the arc
 * @param {number} outerRadius - The outer radius of the arc
 * @returns {d3.Arc} The arc generator
 */
export function createArcScales(innerRadius, outerRadius) {
  return d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);
}

/**
 * Create the ribbon generator
 * @param {number} innerRadius - The radius for the ribbon
 * @returns {d3.Ribbon} The ribbon generator
 */
export function createRibbonScales(innerRadius) {
  return d3.ribbon()
    .radius(innerRadius);
}
