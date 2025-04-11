import * as d3 from 'd3'

/**
 * Creates a tooltip div if it doesn't exist yet.
 * 
 * @returns {*} The tooltip selection
 */
export function createTooltip() {
    let tooltip = d3.select(".tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(255, 255, 255, 0.95)")
        .style("border", "1px solid #ddd")
        .style("border-radius", "6px")
        .style("padding", "8px 12px")
        .style("font-size", "13px")
        .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("max-width", "300px")
        .style("transition", "opacity 0.2s");
    }
    return tooltip;
  }
  
  /**
   * Generate detailed tooltip content for entity hover.
   * 
   * @param {string} entity The name of the entity
   * @param {string} type The type of the entity ('actor' or 'director')
   * @param {object} data The visualization data
   * @param {number} index The index of the entity in the data arrays
   * @returns {string} HTML content for the tooltip
   */
  export function generateEntityTooltipContent(entity, type, data, index) {
    const connections = [];
    
    // Find all connections for this entity
    data.matrix[index].forEach((count, i) => {
      if (count > 0 && i !== index) {
        connections.push({
          name: data.entities[i],
          type: data.types[i],
          count: count
        });
      }
    });
  
    // Sort connections by count (descending)
    connections.sort((a, b) => b.count - a.count);
  
    let content = `<div style="margin-bottom: 6px;">
                    <strong style="font-size: 14px; color: ${type === 'actor' ? '#4285F4' : '#EA4335'}">${entity}</strong><br>
                    <span style="color: #666">${type === 'actor' ? 'Actor' : 'Director'}</span>
                  </div>`;
  
    if (connections.length > 0) {
      content += `<div style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 6px;">
                    <div style="font-size: 12px; color: #555; margin-bottom: 4px;">Collaborations:</div>`;
      
      connections.forEach(conn => {
        content += `<div style="font-size: 11px; margin: 2px 0; display: flex; justify-content: space-between;">
                     <span>${conn.name} <span style="color: ${conn.type === 'actor' ? '#4285F4' : '#EA4335'}">(${conn.type === 'actor' ? 'Actor' : 'Director'})</span></span>
                     <span style="font-weight: bold; margin-left: 10px;">${conn.count}</span>
                   </div>`;
      });
      
      content += `</div>`;
    } else {
      content += `<div style="margin-top: 8px; color: #999; font-size: 11px;">No direct collaborations</div>`;
    }
  
    return content;
  }
  
  /**
   * Generate tooltip content for ribbon/connection hover.
   * 
   * @param {object} data The visualization data
   * @param {object} d The D3 data point for the connection
   * @param {array} collabs The collaboration data
   * @param {array} imdb The IMDB movie data
   * @returns {string} HTML content for the tooltip
   */
  export function generateConnectionTooltipContent(data, d, collabs, imdb) {
    const sourceType = data.types[d.source.index];
    const targetType = data.types[d.target.index];
    const sourceName = data.entities[d.source.index];
    const targetName = data.entities[d.target.index];
    
    // Find the collaboration data
    let collab = collabs.find(c => 
      (c.participant1 === sourceName && c.participant2 === targetName) || 
      (c.participant1 === targetName && c.participant2 === sourceName)
    );
    
    if (!collab) {
      // Fallback if collaboration not found
      return `
        <div style="margin-bottom: 4px;">
          <strong>Collaboration between:</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: ${sourceType === 'actor' ? '#4285F4' : '#EA4335'}">
            ${sourceName}
          </span>
          <span style="color: ${targetType === 'actor' ? '#4285F4' : '#EA4335'}">
            ${targetName}
          </span>
        </div>`;
    }
    
    const avgBoxOffice = collab.avgBoxOffice;
    const moviesList = collab.movies || [];
    
    let updatedMovieList = [];
    if (moviesList && moviesList.length > 0) {
      updatedMovieList = imdb.filter(movie => moviesList.includes(movie.name));
    }
    
    const boxOfficeText = avgBoxOffice ? 
      `$${avgBoxOffice.toLocaleString()}` : 'N/A';
  
    // Create movies list HTML with profit data
    let moviesHTML = '';
    if (updatedMovieList.length > 0) {
      moviesHTML = `<div style="margin-top: 6px; border-top: 1px solid #eee; padding-top: 4px;">
        <div style="max-height: 120px; overflow-y: auto; font-size: 10px;">`;
      
      updatedMovieList.forEach(movie => {
        let profitDisplay = '';
        if (movie.profit !== undefined && movie.profit !== null) {
          const sign = movie.profit >= 0 ? '+' : '-';
          const color = movie.profit >= 0 ? '#2e7d32' : '#c62828';
          profitDisplay = `<span style="color: ${color}; margin-left: 5px;">
            ${sign}$${Math.abs(movie.profit).toLocaleString()}
          </span>`;
        }
        
        const yearDisplay = movie.year ? `<span style="color: #666;">(${movie.year})</span>` : '';
        
        moviesHTML += `
        <div style="display: flex; align-items: center; justify-content: space-between; margin: 4px 0; padding: 4px 0; ">
          <div style="font-weight: 500;">
            ${movie.name} ${yearDisplay}
          </div>
          ${profitDisplay}
        </div>`;
      });
      
      moviesHTML += `</div></div>`;
    }
    
    // Add the popular genre if available
    let genreHTML = '';
    if (collab.mostPopularGenre) {
      genreHTML = `
      <div style="font-size: 11px; margin-top: 4px;">
        <span style="color: #555;">Popular Genre:</span>
        <span style="font-weight: bold; margin-left: 5px;">${collab.mostPopularGenre}</span>
      </div>`;
    }
    
    return `
      <div style="margin-bottom: 4px;">
        <strong>Collaboration(s): ${collab.count || d.source.value} </strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="color: ${sourceType === 'actor' ? '#4285F4' : '#EA4335'}">
          ${sourceName}
        </span>
        <span style="color: ${targetType === 'actor' ? '#4285F4' : '#EA4335'}">
          ${targetName}
        </span>
      </div>
      <div style="margin-top: 6px; border-top: 1px solid #eee; padding-top: 4px;">
        <div style="font-size: 11px;">
          <span style="color: #555;">Average Box Office:</span>
          <span style="font-weight: bold; margin-left: 5px;">${boxOfficeText}</span>
        </div>
        ${genreHTML}
        <div style="font-size: 11px; margin-top: 4px;">
          <span style="color: #555;">Average Rating:</span>
          <span style="font-weight: bold; margin-left: 5px;">${collab.avgRating ? collab.avgRating.toFixed(1) : 'N/A'}</span>
        </div>
      </div>
      ${moviesHTML}`;
  }