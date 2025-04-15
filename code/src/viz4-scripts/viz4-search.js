/**
 * Initializes the film list with search functionality
 * @param {Array<Object>} filmArray - Array of film objects containing name properties
 * @returns {void} Sets up the search input listener and initial film list display
 */
export function initFilmList(filmArray) {

    const filmData = d3.map(filmArray, d => String(d.name)).sort();
    
    // Initial render of all films
    updateFilmList(filmData);
    
    // Set up search input event listener
    d3.select("#search-input").on("input", function() {
      const searchTerm = this.value.toLowerCase();
      
      if (searchTerm === "") {
        updateFilmList(filmData);
      } else {
        const filteredFilms = filmData.filter(film =>
            film.toLowerCase().includes(searchTerm)
        );
        updateFilmList(filteredFilms);
      }
    });
  }
  
/**
 * Updates and displays the filtered film list
 * @param {Array<string>} films - Array of film names to display
 * @returns {void} Modifies the DOM to show the film list with interactive elements
 */
export function updateFilmList(films) {
  const list = d3.select("#movie-list");
  list.selectAll("*").remove();
    
  if (films.length === 0) {
      list.append("li")
    .style("color", "#999")
    .style("font-style", "italic")
    .style("padding", "8px 12px")
    .style("border-bottom", "1px solid #eee")
    .text("Aucun film trouvé");
  } else {
    // Create all list items
    list.selectAll("li")
       .data(films)
       .enter()
       .append("li")
       .style("padding", "8px 12px")
       .style("border-bottom", "1px solid #eee")
       .style("cursor", "pointer")
       .text(d => d)
       .on("click", function(_, d) {
           d3.select("#search-input").property("value", d);
           list.style("display", "none");
           console.log("Selected Movie : ", d);

           document.dispatchEvent(new CustomEvent('viz4movieSelected', {
            detail: {
                movie: d,
                timestamp: new Date()
            }
        }));
       });
  }
    
    // Always show all results but in a scrollable container
    list.style("display", "block")
       .style("max-height", "100px")  // Fixed height for scrolling
       .style("overflow-y", "auto");  // Enable vertical scroll
    
    // Remove border from last item
    list.selectAll("li:last-child")
       .style("border-bottom", "none");
  }
