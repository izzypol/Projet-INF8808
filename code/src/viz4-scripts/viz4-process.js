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

    // Handle both string and array field values
    const targetValues = Array.isArray(targetMovie[field])
        ? targetMovie[field]
        : [targetMovie[field]];

    console.log("Target values:", targetValues);

    return data
        .filter(movie => {
            const movieFieldValues = Array.isArray(movie[field])
                ? movie[field]
                : [movie[field]];

            // Check if any target value exists in movie's field values
            return targetValues.some(targetVal =>
                movieFieldValues.some(movieVal =>
                    String(movieVal).toLowerCase().includes(String(targetVal).toLowerCase())
                )
            );
        })
        .sort((a, b) => {
        // Only sort if there are multiple elements
            if (data.length > 1) {
                //console.log(a.name);
                return a.name.localeCompare(b.name);
            }
            return 0; // No sorting needed for single element
        })
        ;
}

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

export function generateDataToDisplay(movieName, data, liste) {
    const dataToDisplay = []; 

    console.log("EncoreTest : ", data);
    
    liste.forEach(categorie => {
        dataToDisplay.push({
            category: categorie,
            data: averageByYear(getMoviesBySameField(movieName, data, categorie), "mesureDeSucces")
        });
    });

    console.log("ToDisplay : ", dataToDisplay);
    
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
    console.log(`Indexing ${validData.length} movies against ${referenceName} (${referenceValue})`);

    return validData.map(movie => ({
        ...movie,  
        mesureDeSucces: (movie[successMesure] / referenceValue) * 100
    }));
}