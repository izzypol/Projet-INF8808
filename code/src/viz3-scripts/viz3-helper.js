/**
 * Generates a specific <g> container inside a given SVG container.
 *
 * @param {string} svgSelector The selector of the SVG container (e.g. ".viz1-svg" or ".film-impact-svg")
 * @param {object} margin The desired margins around the graph
 * @param {string} id Optional ID or class for the <g> container
 * @returns {*} The d3 Selection for the created g element
 */
export function generateG(svgSelector, margin, id = null) {
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
export function setCanvasSize(width, height) {
    d3.select('.tendance-timeline-svg')
        .attr('width', width)
        .attr('height', height)
}

/**
 * Appends an SVG g element which will contain the axes.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
export function appendAxes(g) {
    g.append('g')
        .attr('class', 'x3 axis')

    g.append('g')
        .attr('class', 'y3 axis')
}
/**
 * Appends the labels for the the y axis and the title of the graph.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
export function appendGraphLabels(g) {
    g.append('text')
        .text('Distribution du marché (de 0 à 100%)')
        .attr('class', 'y axis-text')
        .attr('transform', 'rotate(-90)')
        .attr('font-size', 12)

    g.append('text')
        .text('Années')
        .attr('class', 'x axis-text')
        .attr('font-size', 12)
}

/**
* Positions the x axis label and y axis label.
*
* @param {*} g The d3 Selection of the graph's g SVG element
* @param {number} width The width of the graph
* @param {number} height The height of the graph
*/
export function positionLabels(g, width, height) {
    // TODO : Position axis labels
    g.select('.x.axis-text')
        .attr('transform', 'translate(' + width / 2 + ', ' + (height + 50) + ')');    // On décale le label x à la moitié de la largeur

    g.select('.y.axis-text')
        .attr('transform', 'translate(-50, ' + height / 2 + ')rotate(-90)');      // On décale le label x à la moitié de la hauteur
}

/**
 * Draws the X axis at the bottom of the diagram.
 *
 * @param {*} xScale The scale to use to draw the axis
 * @param {number} height The height of the graphic
 */
export function drawXAxis(xScale, height, intervals) {

    const tickStep = Math.ceil(intervals.length / 12);
    const filteredTicks = intervals.filter((_, i) => i % tickStep === 0);


    d3.select('.x3.axis')
        .attr('transform', 'translate( 0, ' + height + ')')
        .call(d3.axisBottom(xScale)
            .tickValues(filteredTicks)
            .tickFormat(d => d)
        );
    // .tickSizeOuter(0)
    // .ticks(10)
    // .tickFormat(d3.format("d")));
}

/**
 * Draws the Y axis to the left of the diagram.
 *
 * @param {*} yScale The scale to use to draw the axis
 */
export function drawYAxis(yScale) {
    d3.select('.y3.axis')
        .call(d3.axisLeft(yScale)
            .tickSizeOuter(0)
            .ticks(10)
            .tickFormat(d3.format(".2f")));
}