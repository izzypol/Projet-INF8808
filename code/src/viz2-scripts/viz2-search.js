/**
 * Creates the dropdown container for the search box.
 * 
 * @param {HTMLElement} searchInput The search input element
 * @returns {Object} Object containing the container and dropdown elements
 */
export function createDropdownContainer(searchInput) {
  let dropdownContainer = d3.select("#search-container");
  if (dropdownContainer.empty()) {
    const searchParent = d3.select(searchInput.parentNode);
    dropdownContainer = searchParent.append("div")
      .attr("id", "search-container")
      .style("position", "relative")
      .style("width", "100%");
    
    searchInput.parentNode.removeChild(searchInput);
    dropdownContainer.node().appendChild(searchInput);
  }

  let dropdown = dropdownContainer.select(".autocomplete-dropdown");
  if (dropdown.empty()) {
    dropdown = dropdownContainer.append("div")
      .attr("class", "autocomplete-dropdown")
      .style("position", "absolute")
      .style("width", "100%")
      .style("max-height", "200px")
      .style("overflow-y", "auto")
      .style("background", "white")
      .style("border", "1px solid #ddd")
      .style("border-top", "none")
      .style("border-radius", "0 0 4px 4px")
      .style("z-index", "1000")
      .style("display", "none")
      .style("box-shadow", "0 4px 8px rgba(0,0,0,0.1)");
  } else {
    dropdown.style("display", "none").html("");
  }
  
  return { container: dropdownContainer, dropdown: dropdown };
}

/**
 * Updates the dropdown with filtered suggestions based on search term.
 * 
 * @param {string} searchTerm The search term from the input
 * @param {Object} collabs The collaborations data
 * @param {d3.Selection} dropdown The dropdown element
 * @param {Function} handleEntitySelect Function to handle entity selection
 */
export function updateDropdownSuggestions(searchTerm, collabs, dropdown, handleEntitySelect) {
  const actors = new Set();
  const directors = new Set();
  const writers = new Set();
  collabs.forEach(collab => {
    if (collab.connectionType === 'actor/actor') {
      // Both participants are actors
      actors.add(collab.participant1);
      actors.add(collab.participant2);
    } else if (collab.connectionType === 'actor/director') {
      // One is actor, one is director
      if (collab.participant1 === 'actor/director') {
        directors.add(collab.participant1);
        actors.add(collab.participant2);
      } else {
        actors.add(collab.participant1);
        directors.add(collab.participant2);
      }
    } else if (collab.connectionType === 'writer/director') {
      // Handle writer/director type
      if (collab.participant1 === 'writer/director') {
        directors.add(collab.participant1);
        writers.add(collab.participant2);
      } else {
        writers.add(collab.participant1);
        directors.add(collab.participant2);
      }
    }
  });
  
  // Filter entities based on search term
  const filteredActors = Array.from(actors)
    .filter(actor => actor && actor.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const filteredDirectors = Array.from(directors)
    .filter(director => director && director.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const filteredWriters = Array.from(writers)
    .filter(writer => writer && writer.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Limit results to avoid overwhelming the user
  const maxSuggestions = 10;
  const limitedActors = filteredActors.slice(0, Math.ceil(maxSuggestions/2));
  const limitedDirectors = filteredDirectors.slice(0, Math.floor(maxSuggestions/2));
  const limitedWriters = filteredWriters.slice(0, Math.floor(maxSuggestions/2));
  
  const suggestions = [
    ...limitedActors.map(name => ({ name, type: 'actor' })),
    ...limitedDirectors.map(name => ({ name, type: 'director' })),
    ...limitedWriters.map(name => ({ name, type: 'writer' }))
  ];
  
  if (suggestions.length > 0) {
    dropdown.html("") // Clear previous suggestions
      .style("display", "block");
    
    suggestions.forEach(suggestion => {
      dropdown.append("div")
        .attr("class", "dropdown-item")
        .style("padding", "8px 12px")
        .style("cursor", "pointer")
        .style("border-bottom", "1px solid #eee")
        .style("display", "flex")
        .style("justify-content", "space-between")
        .style("align-items", "center")
        .on("mouseover", function() {
          d3.select(this).style("background", "#f5f5f5");
        })
        .on("mouseout", function() {
          d3.select(this).style("background", "none");
        })
        .on("click", () => {
          handleEntitySelect(suggestion.name, suggestion.type);
        })
        .html(`
          <span>${suggestion.name}</span>
          <span style="color: ${suggestion.type === 'actor' ? '#4285F4' : suggestion.type === 'director' ? '#EA4335' : '#F4B400'}; 
                       font-size: 12px; padding: 2px 6px; 
                       border: 1px solid ${suggestion.type === 'actor' ? '#4285F4' : suggestion.type === 'director' ? '#EA4335' : '#F4B400'};
                       border-radius: 12px;">
            ${suggestion.type === 'actor' ? 'Actor' : suggestion.type === 'director' ? 'Director' : 'Writer'}
          </span>
        `);
    });
  } else {
    dropdown.style("display", "none");
  }
}
