/**
 * Sets up the hover event handler. The tooltip should show on on hover.
 *
 * @param {*} tip The tooltip
 */
export function setCircleHoverHandler_5 (g,tip) {
  // TODO : Set hover handler. The tooltip shows on
  // hover and the opacity goes up to 100% (from 70%)

                             // On sélectionne le graphe et les bulles
    g.selectAll('.bubble5')                                  

    .on('mouseover', function (e,d){              // Quand la souris passe dessus
      d3.select(this).style('opacity', 1);        // Opacité -> 100%
      tip.show(d, this);                          // On montre le tip 
    })
    .on('mouseout', function (e,d){               // Quand la souris sort
      d3.select(this).style('opacity', 0.85);      // Opacité -> 70%
      tip.hide(d, this);                          // On cache le tip 
    });
}