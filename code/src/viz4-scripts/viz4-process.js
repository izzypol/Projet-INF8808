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
        // Filter movies that include this specific field value (case-insensitive exact match)
        const matchingMovies = data.filter(movie => {
            //if (movie.name === movieName) return false; // Skip the target movie
            
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
            categorie: targetValue, // The specific value being matched (e.g. "Action")
            movies: sortedMovies    // Array of matching movies
        };
    });

    //console.log("Movies by field value : ", moviesByFieldValue);

    return moviesByFieldValue;
}

// export function getMoviesBySameField(movieName, data, field) {
//     const targetMovie = data.find(movie => movie.name === movieName);
//     if (!targetMovie) return [];

//     // Handle both string and array field values
//     const targetValues = Array.isArray(targetMovie[field])
//         ? targetMovie[field]
//         : [targetMovie[field]];

//     console.log("Target values:", targetValues);

//     return data
//         .filter(movie => {
//             const movieFieldValues = Array.isArray(movie[field])
//                 ? movie[field]
//                 : [movie[field]];

//             // Check if any target value exists in movie's field values
//             return targetValues.some(targetVal =>
//                 movieFieldValues.some(movieVal =>
//                     String(movieVal).toLowerCase().includes(String(targetVal).toLowerCase())
//                 )
//             );
//         })
//         .sort((a, b) => {
//         // Only sort if there are multiple elements
//             if (data.length > 1) {
//                 //console.log(a.name);
//                 return a.name.localeCompare(b.name);
//             }
//             return 0; // No sorting needed for single element
//         })
//         ;
// }

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

export function generateDataToDisplay(movieName, data, fields, minlength) {
    const dataToDisplay = [];
    
    fields.forEach(field => {
        // Get grouped movies for this field
        const groupedResults = getMoviesBySameField(movieName, data, field);
        
        // Process each group separately
        groupedResults.forEach(group => {

            const averageData = averageByYear(group.movies, "mesureDeSucces");
            //console.log("Average :", averageData);

            if (averageData.length > minlength){
                dataToDisplay.push({
                    category: `${group.categorie}`, // e.g. "genre: Action"
                    data: averageByYear(group.movies, "mesureDeSucces")
                })
            } 
            else {
                //console.log(group.categorie, " is singleton")
            }
        });
    });
    
    //console.log("Data to display:", dataToDisplay);
    return dataToDisplay;
}

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
    //console.log(`Indexing ${validData.length} movies against ${referenceName} (${referenceValue})`);

    return validData.map(movie => ({
        ...movie,  
        mesureDeSucces: (movie[successMesure] / referenceValue) * 100
    }));
}