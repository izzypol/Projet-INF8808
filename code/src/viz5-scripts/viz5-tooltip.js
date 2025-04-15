let tooltip

/**
 * Initializes the tooltip once and appends it to <body>
 */
export function initTooltip () {
  tooltip = document.getElementById('bubble-tooltip')

  if (!tooltip) {
    tooltip = document.createElement('div')
    tooltip.id = 'bubble-tooltip'

    Object.assign(tooltip.style, {
      position: 'absolute',
      border: '1px solid #ccc',
      pointerEvents: 'none',
      display: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      maxWidth: '250px',
      zIndex: '10000',
      transition: 'opacity 0.15s ease',
      backgroundColor: '#fff',
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '13px',
      borderRadius: '8px',
      lineHeight: '1.5',
      color: '#222',
      padding: '12px'
    })

    document.body.appendChild(tooltip)

    const style = document.createElement('style')
    style.textContent = `
      #bubble-tooltip .tooltip-header {
        display: flex;
        justify-content: space-between;
        font-weight: 600;
        margin-bottom: 6px;
      }
      #bubble-tooltip .tooltip-word {
        text-transform: capitalize;
        font-size: 14px;
      }
      #bubble-tooltip .tooltip-rating {
        font-size: 13px;
        color: #444;
      }
      #bubble-tooltip .tooltip-subtitle {
        font-size: 12px;
        font-weight: 600;
        margin-top: 6px;
        margin-bottom: 4px;
        color: #666;
      }
      #bubble-tooltip .tooltip-movie-list {
        list-style: disc;
        padding-left: 18px;
        margin: 0;
      }
      #bubble-tooltip .tooltip-movie-list li {
        margin-bottom: 4px;
      }
      #bubble-tooltip .tooltip-movie-list .rating {
        color: #888;
        font-weight: 500;
      }
    `
    document.head.appendChild(style)
  }
}

/**
 * Show the tooltip near the mouse with movie info
 *
 * @param {object} d - Bubble data
 * @param {MouseEvent} event - Mouse event
 */
export function showTooltip (d, event) {
  if (!tooltip) return

  const topMovies = (d.movies || [])
    .filter(m => typeof m.rating === 'number')
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)

  const movieList = topMovies.length
    ? topMovies.map(m => `<li><strong>🎬 ${m.name}</strong> (${m.rating})</li>`).join('')
    : '<li>No rated movies</li>'

  tooltip.innerHTML = `
    <strong>📝 Word:</strong> ${d.word}<br/>
    <strong>🧮 Count:</strong> ${d.count}<br/>
    <strong>🌟 Average Rating:</strong> ${(d.avgRating).toFixed(2)}<br/>
    <strong>Top Movies:</strong>
    <ul style="margin: 6px 0; padding-left: 18px;">${movieList}</ul>
  `

  tooltip.style.left = `${event.pageX + 15}px`
  tooltip.style.top = `${event.pageY - 28}px`
  tooltip.style.display = 'block'
  tooltip.style.opacity = '1'
}

/**
 * Hide the tooltip
 */
export function hideTooltip () {
  if (tooltip) {
    tooltip.style.opacity = '0'
    tooltip.style.display = 'none'
  }
}
