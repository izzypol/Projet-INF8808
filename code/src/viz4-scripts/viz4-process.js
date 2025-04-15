/**
 * Gets movies with the same field value as the specified movie
 * @param {Array} data - Your movie dataset
 * @param {string} movieName - Target movie name
 * @param {string} field - Dynamic field to compare (e.g., "genre", "director")
 * @returns {Array} Sorted array of matching movies
 */
export function getMoviesBySameField(movieName, data, field) {
    const targetMovie = data.find(movie => movie.name === movieName);
    if (!targetMovie) return [];

    // Normalize field values (handle both arrays and single values)
    const targetValues = Array.isArray(targetMovie[field])
        ? targetMovie[field]
        : [targetMovie[field]];

    // Create an array of arrays, one per distinct field value
    const moviesByFieldValue = targetValues.map(targetValue => {
        const matchingMovies = data.filter(movie => {
            
            const movieValues = Array.isArray(movie[field])
                ? movie[field]
                : [movie[field]];
                
            return movieValues.some(value => 
                String(value).toLowerCase() === String(targetValue).toLowerCase()
            );
        });

        // Sort alphabetically if multiple movies
        const sortedMovies = matchingMovies.length > 1
            ? [...matchingMovies].sort((a, b) => a.name.localeCompare(b.name))
            : matchingMovies;

        return {
            categorie: targetValue, 
            movies: sortedMovies    
        };
    });

    return moviesByFieldValue;
}

/**
 * Calculates yearly averages for a success metric
 * @param {Array<Object>} data - Array of movie objects
 * @param {string} successMesure - Field containing the success metric
 * @returns {Array<{year: number, average: number, count: number, noms: string}>} Yearly average data
 */
function averageByYear(data, succesMesure) {
    const yearGroups = {};
    
    // Group and sum by year
    data.forEach(item => {
        if (typeof item[succesMesure] !== 'number') return;
        
        const year = item.year;
        yearGroups[year] = yearGroups[year] || { sum: 0, count: 0, names: [] };
        yearGroups[year].sum += item[succesMesure];
        yearGroups[year].count++;
        yearGroups[year].names.push(item.name);
    });
    
    // Calculate averages and format output
    return Object.keys(yearGroups)
        .map(year => ({
            year: +year,
            average: parseFloat((yearGroups[year].sum / yearGroups[year].count).toFixed(2)),
            count : yearGroups[year].count,
            noms : yearGroups[year].names.join("; ")
        }))
        .sort((a, b) => a.year - b.year);
}

/**
 * Generates formatted display data for visualization
 * @param {string} movieName - Target movie name
 * @param {Array<Object>} data - Complete movie dataset
 * @param {Array<string>} fields - Fields to analyze (e.g. ["genre", "director"])
 * @param {number} minlength - Minimum data points required for inclusion
 * @returns {Array<{category: string, data: Array<Object>}>} Formatted data for charting
 */
export function generateDataToDisplay(movieName, data, fields, minlength) {
    const dataToDisplay = [];

    // Capitalize first letter helper
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    
    fields.forEach(field => {
        // Get grouped movies for this field
        const groupedResults = getMoviesBySameField(movieName, data, field);
        
        // Process each group separately
        groupedResults.forEach(group => {

            const averageData = averageByYear(group.movies, "mesureDeSucces");

            if (averageData.length > minlength){
                dataToDisplay.push({
                    category: `${capitalize(field)} : ${group.categorie}`, // e.g. "genre: Action"
                    data: averageByYear(group.movies, "mesureDeSucces")
                })
            } 
            else {
                //console.log(group.categorie, " is singleton")
            }
        });
    });
    
    return dataToDisplay;
}

/**
 * Normalizes success metrics relative to a reference movie
 * @param {string} referenceName - Movie to use as reference (100%)
 * @param {Array<Object>} originalData - Complete movie dataset
 * @param {string} successMesure - Field containing the success metric
 * @returns {Array<Object>} Data with indexed success values
 */
export function indexData(referenceName, originalData, successMesure) {

    const validData = originalData.filter(movie => {
        const value = movie[successMesure];
        return (
            value !== undefined &&  
            value !== null &&     
            !isNaN(value) &&       
            value > 0             
        );
    });

    const targetMovie = validData.find(movie => movie.name === referenceName);
    if (!targetMovie) {
        return [];
    }

    const referenceValue = targetMovie[successMesure];
    const targetYear = targetMovie.year;

    return validData.map(movie => ({
        ...movie,  
        mesureDeSucces: (movie[successMesure] / referenceValue) * 100
    }))
    .filter(movie => 
        movie.name === referenceName ||  // Keep target movie
        movie.year !== targetYear    // Remove others with same year
    );
}

/**
 * Enhances movie data with nomination counts
 * @param {Array<Object>} dataSource - Original movie data
 * @returns {Array<Object>} Enhanced data with nomination metrics
 */
export function addNumberOfNominations(dataSource) {
    return dataSource.map(movie => {
        // Calculate Golden Globes nominations (with null checks)
        const ggNomination = movie.goldenGlobesData?.goldenGlobesNominations ?? 0;
        
        // Calculate Oscars nominations (with null checks)
        const oscarNomination = movie.oscarsData?.oscarNominations ?? 0;
        
        // Calculate total metric (sum of both)
        const metric = (typeof ggNomination === 'number' ? ggNomination : 0) + 
                      (typeof oscarNomination === 'number' ? oscarNomination : 0);
        
        // Return new object with all original properties plus the new metric field
        return {
            ...movie,
            nominations: {
                goldenGlobes: ggNomination,
                oscars: oscarNomination,
                total: metric
            },
            numNominations: metric  // Adding the total as a top-level property for easy access
        };
    });
}