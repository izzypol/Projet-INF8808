/**
 * Defines the contents of the tooltip. See CSS for tooltip styling.
 * The tooltip features the movie name, box office, total nominations,
 * rank, and release year.
 *
 * @param {object} d The data associated to the hovered element
 * @returns {string} The tooltip contents
 */
export function getContents(d, colorScale) {



  return `<div class="tooltip-value" style="
      background: linear-gradient(90deg,rgb(143, 143, 143) 0%,rgba(166, 166, 166, 0.4) 100%);
      padding: 12px;
      border-radius: 6px;
      color: white;
      backdrop-filter: blur(5px);
      box-shadow: 1px -1px 10px 0px rgba(0, 0, 0, 0.3);
      border-top : 1px solid ${colorScale(d.category)};
      z-index: 6;

      "
  >
    <div style="margin: 4px 0; color: ${colorScale(d.category)}; filter : brightness(1.5);">
      <strong>🎬 Catégorie : </strong>${d.category}
    </div>
    <div style="margin: 4px 0;">
      <strong>📊 Part de marché : </strong> ${((d[1] - d[0]) * 100).toFixed(2)}%
    </div>
    <div style="margin: 4px 0;">
      <strong>📅 Date : </strong> ${d.data.interval}
    </div>
  </div>
  `
}


/**
 * Sets up the hover event handler. The tooltip should show on on hover.
 *
 * @param {*} tip The tooltip
 */
export function setRectHoverHandler(g, tip) {
  // TODO : Set hover handler. The tooltip shows on
  // hover and the opacity goes up to 100% (from 70%)

  g.selectAll('.rect3')
    .on('mouseover', function (e, d) {              // Quand la souris passe dessus
      d3.select(this)
        .style('opacity', 0.8)
        .style('cursor', 'pointer');
      tip.show(d, this);                          // On montre le tip 
    })
    .on('mouseout', function (e, d) {               // Quand la souris sort
      d3.select(this).style('opacity', 1);      // Opacité -> 70%
      tip.hide(d, this);                          // On cache le tip 
    });
}