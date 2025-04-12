/**
 * Defines the contents of the tooltip. See CSS for tooltip styling.
 * The tooltip features the movie name, box office, total nominations,
 * rank, and release year.
 *
 * @param {object} d The data associated to the hovered element
 * @returns {string} The tooltip contents
 */
export function getContents(d, colorScale) {

  console.log(d);

  let html = `<div class="tooltip-value" style="
      z-index: 6;
      background: linear-gradient(90deg,rgb(145, 145, 145) 0%,rgba(166, 166, 166, 0.6) 100%);
      padding: 12px;
      border-radius: 6px;
      color: white;
      backdrop-filter: blur(5px);
      box-shadow: 1px -1px 10px 0px rgba(0, 0, 0, 0.3);
      margin-bottom: 15px;
      "
  >  `;

  if (d.name !== undefined) {
    html += `<div style="margin: 4px 0;">
              <strong>📋 Titre:</strong> ${d.name}
            </div>`;
  }

  // Always show year
  html += `<div style="margin: 4px 0; filter: brightness(1.5);">
            <strong>📅 Année:</strong> ${d.year}
          </div>`;

  // Conditional content based on data
  if (d.count !== undefined) {
    html += `<div style="margin: 4px 0;">
              <strong>🎬 Nombre de films:</strong> ${d.count}
            </div>`;
  }

  if (d.average !== undefined) {
    html += `<div style="margin: 4px 0;">
              <strong>⭐ Moyenne:</strong> ${d.average.toFixed(2)}%
            </div>`;
  }

  // Different detail display for different data types
  if (d.noms !== undefined) {
    html += `<div style="margin: 4px 0;">
              <strong>📋 Films:</strong> ${d.noms}
            </div>`;
  }

  // Close the div
  html += `</div>`;

  return html;
}


/**
 * Sets up the hover event handler. The tooltip should show on on hover.
 *
 * @param {*} tip The tooltip
 */
export function setCircleHoverHandler(g, tip) {
  // TODO : Set hover handler. The tooltip shows on
  // hover and the opacity goes up to 100% (from 70%)

  g.selectAll(".data-point, .ref-marker")
    .on('mouseover', function (e, d) {
      d3.select(this)
        .style('cursor', 'pointer')
        .attr("r", 6);
      tip.show(d, this);
    })
    .on('mouseout', function (e, d) {
      d3.select(this)
        .attr("r", 5);
      tip.hide(d, this);
    });
}