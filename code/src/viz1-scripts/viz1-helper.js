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
    .attr('x', -30)  // Plus négatif = plus bas (le long de l'axe Y)
    .attr('y', 13)    // Plus petit = plus proche de l'axe Y
    .attr('font-size', 12);

    g.append('text')
    .text('Box-office (en $)')
    .attr('class', 'x1 axis-text')
    .attr('x', -40)   // À ajuster selon la largeur de ton graphe
    .attr('y', 0)   // À ajuster selon la hauteur
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
      .tickValues([1, 50, 100, 150, 200, 250])  // ou tout autre intervalle clair
      .tickFormat(d3.format('d'))  // évite les arrondis foireux
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

/**
 * Draws the button to toggle the display year.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} year The year to display
 * @param {number} width The width of the graph, used to place the button
 */
export function drawButton (g, year, width) {
  const button = g.append('g')
    .attr('class', 'button1')
    .attr('transform', 'translate(' + width + ', 140)')
    .attr('width', 130)
    .attr('height', 25)

  button.append('rect')
    .attr('width', 130)
    .attr('height', 30)
    .attr('fill', '#f4f6f4')
    .on('mouseenter', function () {
      d3.select(this).attr('stroke', '#362023')
    })
    .on('mouseleave', function () {
      d3.select(this).attr('stroke', '#f4f6f4')
    })

  button.append('text')
    .attr('x1', 65)
    .attr('y1', 15)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('class', 'button-text1')
    .text('See ' + year + ' dataset')
    .attr('font-size', '10px')
    .attr('fill', '#362023')
}
