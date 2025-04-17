/* eslint-disable space-before-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable space-in-parens */
/* eslint-disable spaced-comment */
/* eslint-disable indent */
/* eslint-disable no-multi-spaces */
/**
 * Positions the x axis label and y axis label.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} width The width of the graph
 * @param {number} height The height of the graph
 */
export function positionLabels (g, width, height) {
  g.select('.x1.axis-text')
    .attr('transform', 'translate(' + width/2 + ', '+ (height+50) +')');    // On décale le label x à la moitié de la largeur

  g.select('.y1.axis-text')
    .attr('transform', 'translate(-75, ' + height/2 + ')rotate(-90)');      // On décale le label x à la moitié de la hauteur
}
/**
 * Draws the circles on the graph.
 *
 * @param {object} g The D3 selection of the <g> element to draw in
 * @param {object} data The data to bind to
 * @param {*} rScale The scale for the circles' radius
 * @param {*} colorScale The scale for the circles' color
 */
export function drawCircles(g, data, rScale, colorScale) {
  // On garde uniquement les films avec un box office valide
  const cleanedData = data.filter(d =>
    d.box_office !== "Not Available" &&
    !isNaN(d.box_office) &&
    d.rank !== undefined &&
    d.box_office > 100000 &&  // on enlève les films avec un box office trop faible qui sont certainement des erreurs dans le dataset
    !isNaN(d.rank)
  );

  // Liaison des données et création des cercles
  g.selectAll('circle')
    .data(cleanedData)
    .enter()
    .append('circle')
    .attr('class', 'bubble1');

  // Mise à jour des attributs des cercles
  g.selectAll('.bubble1')
    .data(cleanedData)
    .attr('r', d => rScale(
      d.oscarsData.oscarNominations + d.goldenGlobesData.goldenGlobesNominations
    ))
    .attr('fill', d => colorScale(d.year))
    .style('opacity', 0.80)
    .attr('stroke', 'white');
}

/**
 * Updates the position of the circles based on their bound data.
 *
 * @param {object} g The D3 selection of the <g> element containing the circles
 * @param {*} xScale The x scale used to position the circles
 * @param {*} yScale The y scale used to position the circles
 * @param {number} transitionDuration The duration of the transition
 */
export function moveCircles(g, xScale, yScale, transitionDuration) {
  g.selectAll('.bubble1')
    .transition()
    .duration(transitionDuration)
    .attr('cx', d => xScale(d.box_office))
    .attr('cy', d => yScale(d.rank));
}


/**
 * Sets up the hover event handler. The tooltip should show on on hover.
 *
 * @param {*} tip The tooltip
 */
export function setCircleHoverHandler (g,tip) {

                             // On sélectionne le graphe et les bulles
    g.selectAll('.bubble1')                                  

    .on('mouseover', function (e,d){              // Quand la souris passe dessus
      d3.select(this).style('opacity', 1);        // Opacité -> 100%
      tip.show(d, this);                          // On montre le tip 
    })
    .on('mouseout', function (e,d){               // Quand la souris sort
      d3.select(this).style('opacity', 0.80);      // Opacité -> 80%
      tip.hide(d, this);                          // On cache le tip 
    });
}