import { parseRuntime } from '../scripts/helper.js'
/**
* 
* @param {float} movieLength 
* @param {int} interval_size 
* @returns {string} The movie length interval in the format "0-60", "61-{60+interval_size}", "{60+interval_size+1}-{60+2*interval_size}", etc.
*/
export function getCellData(directors, topY, filteredData) {
    let cellData = []
    directors.forEach((director, dirIndex) => {
        topY.forEach((person, personIndex) => {
            // Find data point for this director-person pair
            const dataPoint = filteredData.find(d => d.director === director && d['actor'] === person.actor);
            if (dataPoint) {
                cellData.push({
                    director: director,
                    person: person,
                    dirIndex: dirIndex,
                    personIndex: personIndex,
                    value: dataPoint["avgBoxOffice"],
                    movies: dataPoint.movies
            });
            } else {
                // Create empty cell if no data
                cellData.push({
                    director: director,
                    person: person,
                    dirIndex: dirIndex,
                    personIndex: personIndex,
                    value: null,
                    movies: []
                });
            }
        });
    });
    return cellData;
}

// function sortCollaborationsByMetric(data, metric){
//     return data.sort((collab1, collab2) => {
//         if(metric === 'box_office'){
//             collab1.
//         }else if(metric === 'rating'){

//         }
//     });
// }
