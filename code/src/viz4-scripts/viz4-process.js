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
                return a.name.localeCompare(b.name);
            }
            return 0; // No sorting needed for single element
});
}