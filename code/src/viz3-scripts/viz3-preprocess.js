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


    // We do the process for a tmp dict with key = only the year
    const tmp = {};

    for (const movie of data) {

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

        let metric = null;
        if (selectedMetric === "box_office") {
            if (typeof movie.box_office === "number") {
                metric = movie.box_office;
            }
            else {
                metric = 0;
            }
        }
        if (selectedMetric === "rating")
            metric = 1; // for rating, we just count the number of movies in the interval


        if (movie.box_office) {
            yearElem.totalMetric += metric;
        }
        movie.genre.forEach(genre => {
            if (!yearElem.metricPerGenre[genre]) yearElem.metricPerGenre[genre] = 0;
            yearElem.metricPerGenre[genre] += metric;
        })
        const movieLength = parseRuntime(movie.run_time);
        if (movieLength) {
            const lengthInterval = getMovieLengthInterval(movieLength, 5);
            if (!yearElem.metricsPerMovieLenght[lengthInterval]) yearElem.metricsPerMovieLenght[lengthInterval] = 0;
            yearElem.metricsPerMovieLenght[lengthInterval] += metric;
        }
        if (movie.certificate) {
            if (!yearElem.metricsPerCertificate[movie.certificate]) yearElem.metricsPerCertificate[movie.certificate] = 0;
            yearElem.metricsPerCertificate[movie.certificate] += metric;
        }
    }

    // Now we need to reduce the tmp dict by grouping the years by intervals
    for (const year in tmp) {
        const yearElem = tmp[year];
        const interval = `[${Math.floor(year / intervalsLenght) * intervalsLenght}, ${Math.floor(year / intervalsLenght) * intervalsLenght + intervalsLenght}]`;

        if (!res[interval]) {
            res[interval] = {
                totalMetric: 0,
                metricPerGenre: {},
                metricsPerMovieLenght: {},
                metricsPerCertificate: {}
            };
        }

        const res_elem = res[interval];


        res_elem.totalMetric += yearElem.totalMetric;

        Object.keys(yearElem.metricPerGenre).forEach(genre => {
            if (!res_elem.metricPerGenre[genre]) res_elem.metricPerGenre[genre] = 0;
            res_elem.metricPerGenre[genre] += yearElem.metricPerGenre[genre];
        })

        Object.keys(yearElem.metricsPerMovieLenght).forEach(lengthInterval => {
            if (!res_elem.metricsPerMovieLenght[lengthInterval]) res_elem.metricsPerMovieLenght[lengthInterval] = 0;
            res_elem.metricsPerMovieLenght[lengthInterval] += yearElem.metricsPerMovieLenght[lengthInterval];
        })

        Object.keys(yearElem.metricsPerCertificate).forEach(certificate => {
            if (!res_elem.metricsPerCertificate[certificate]) res_elem.metricsPerCertificate[certificate] = 0;
            res_elem.metricsPerCertificate[certificate] += yearElem.metricsPerCertificate[certificate];
        })
    }
    console.log(res);
}