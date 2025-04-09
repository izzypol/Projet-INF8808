/**
 * Defines the contents of the tooltip. See CSS for tooltip styling.
 * The tooltip features the movie name, box office, total nominations,
 * rank, and release year.
 *
 * @param {object} d The data associated to the hovered element
 * @returns {string} The tooltip contents
 */
export function getContents(d) {
  const boxOfficeFormatted = d.box_office
    ? `$${Number(d.box_office).toLocaleString()}`
    : 'Not Available'

  const totalNominations = (d.oscarsData.oscarNominations || 0) + (d.goldenGlobesData.goldenGlobesNominations || 0)

  return ` <div class="tooltip-value" style="
      background: linear-gradient(90deg,rgb(143, 143, 143) 0%,rgba(166, 166, 166, 0.4) 100%);
      padding: 12px;
      border-radius: 6px;
      color: white;
      backdrop-filter: blur(5px);
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
      "
  >
    <div style="margin: 4px 0;">
      <strong>🎬 Movie:</strong> ${d.name}
    </div>
    <div style="margin: 4px 0;">
      <strong>💰 Box Office:</strong> ${boxOfficeFormatted}
    </div>
    <div style="margin: 4px 0;">
      <strong>🏆 Nominations:</strong> ${totalNominations}
    </div>
    <div style="margin: 4px 0;">
      <strong>⭐ Rank:</strong> ${d.rank}
    </div>
    <div style="margin: 4px 0;">
      <strong>📅 Year:</strong> ${d.year}
    </div>
  </div> 
  `
}
