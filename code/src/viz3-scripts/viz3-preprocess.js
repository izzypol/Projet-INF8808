import { parseRuntime } from '../scripts/helper.js'

/**
* 
* @param {float} movieLength 
* @param {int} interval_size 
* @returns {string} The movie length interval in the format "0-60", "61-{60+interval_size}", "{60+interval_size+1}-{60+2*interval_size}", etc.
*/

function getMovieLengthInterval(movieLength, interval_size) {
    // first interval is alway 0-60
    if (movieLength < 61) return "0-60";

    // other res interval are such that : movieLenght in res, length(res) = interval_size 
    // console.log(movieLength, interval_size)

    const floor = Math.floor((movieLength - 60) / interval_size) * interval_size + 60;


    return `${floor}-${floor + interval_size}`;
}


/**
 * Gets movies with the same field value as the specified movie
 * @param {Array} data - movie dataset
 * @param {int} intervalsLenght - La longueur des intervalles de dates, e.g : intervalsLenght : 5 -> intervals [1921,1925],[1926,1930]...
 * @param {string} selectedMetric - La métrique utilisé pour l'analyse (e.g., "box_office", "profit", "rating", "numNominations")
 * @returns {Object} data in the form 
 * { 
 *  "[1921, 1925]": {
 * 
 *          "totalMetric" : float //pour rating = num movies dans cet interval
 * 
 *          "metricPerGenre" : {
 *              "Action" : float //pour rating = num movies de ce genre dans cet interval
 *              "Drama" : float,
 *               ...
 *              },
 * 
 *           "metricsPerMovieLenght" : {
 *                "0-100" : float //pour rating = num movies de cette longueur dans cet interval
 *               "100-110" : float,
 *               ...
 *               },
 * 
 *           "metricsPerCertificate" : {
 *                "R" : float //pour rating = num movies de cette catégorie dans cet interval
 *                "PG-13" : float,
 *                 ...
 *                },
 *      },
 * 
 *  "[1926, 1930]": {
 *      ...
 *      },
 * 
 *  ...
 * 
 *  "[2016, 2020]": {
 *      ...
 *      }
 * }
 */
export function getDataPerTimeInterval(data, intervalsLenght, selectedMetric) {

    const minYear = Math.min(...data.map(movie => movie.year));
    const maxYear = Math.max(...data.map(movie => movie.year));

    const res = {};

    for (let i = minYear; i < maxYear; i += intervalsLenght) {
        const interval = `[${i}, ${i + intervalsLenght}]`;
        res[interval] = {
            totalMetric: 0,
            metricPerGenre: {},
            metricsPerMovieLenght: {},
            metricsPerCertificate: {}
        };
    }


    // We do the process for a tmp dict with key = only the year
    const tmp = {};


    for (const movie of data) {
        // console.log(movie);

        const year = movie.year;
        if (!tmp[year]) {
            tmp[year] = {
                totalMetric: 0,
                metricPerGenre: {},
                metricsPerMovieLenght: {},
                metricsPerCertificate: {}
            };
        }

        // Add the movie contribution to this year

        const yearElem = tmp[year];

        if (selectedMetric === "box_office") {
            yearElem.totalMetric += movie.box_office;
            movie.genre.forEach(genre => {
                if (!yearElem.metricPerGenre[genre]) yearElem.metricPerGenre[genre] = 0;
                yearElem.metricPerGenre[genre] += movie.box_office;
            })
            const movieLength = parseRuntime(movie.run_time);
            if (movieLength) {
                const lengthInterval = getMovieLengthInterval(movieLength, 5);
                if (!yearElem.metricsPerMovieLenght[lengthInterval]) yearElem.metricsPerMovieLenght[lengthInterval] = 0;
                yearElem.metricsPerMovieLenght[lengthInterval] += movie.box_office;
            }






        }
    }
}