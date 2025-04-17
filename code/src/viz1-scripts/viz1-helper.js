/**
 * Generates a specific <g> container inside a given SVG container.
 *
 * @param {string} svgSelector The selector of the SVG container (e.g. ".viz1-svg" or ".film-impact-svg")
 * @param {object} margin The desired margins around the graph
 * @param {string} id Optional ID or class for the <g> container
 * @returns {*} The d3 Selection for the created g element
 */
export function generateG (svgSelector, margin, id = null) {
  const g = svgSelector
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  if (id) {
    g.attr('id', id);
  }

  return g;
}

/**
 * Sets the size of the SVG canvas containing the graph.
 *
 * @param {number} width The desired width
 * @param {number} height The desired height
 */
export function setCanvasSize (width, height) {
  d3.select('.success-scatter-svg')
    .attr('width', width)
    .attr('height', height)
}

/**
 * Appends an SVG g element which will contain the axes.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
export function appendAxes (g) {
  g.append('g')
    .attr('class', 'x1 axis')

  g.append('g')
    .attr('class', 'y1 axis')
}
/**
 * Appends the labels for the the y axis and the title of the graph.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
export function appendGraphLabels (g) {
  g.append('text')
    .text('Classement')
    .attr('class', 'y1 axis-text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -30)
    .attr('y', 13)
    .attr('font-size', 12);

    g.append('text')
    .text('Box-office (en $)')
    .attr('class', 'x1 axis-text')
    .attr('x', -40)
    .attr('y', 0)
    .attr('font-size', 12);
}

/**
 * Draws the X axis at the bottom of the diagram.
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {*} xScale The scale to use to draw the axis
 * @param {number} height The height of the graphic
 */
export function drawXAxis (g, xScale, height) {
  g.select('.x1.axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScale).tickSizeOuter(0).tickArguments([5, '~s']));
}

/**
 * Draws the Y axis to the left of the diagram.
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {*} yScale The scale to use to draw the axis
 */
export function drawYAxis (g, yScale) {
  g.select('.y1.axis')
    .call(d3.axisLeft(yScale)
      .tickSizeOuter(0)
      .tickValues([1, 50, 100, 150, 200, 250])
      .tickFormat(d3.format('d'))
  );
}

/**
 * Places the graph's title.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
export function placeTitle (g) {
  g.append('text')
    .attr('class', 'title1')
    .attr('x1', 0)
    .attr('y1', -20)
    .attr('font-size', 14)
}
