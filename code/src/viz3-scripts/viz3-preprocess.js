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

        if (selectedMetric === "profit") {
            if (typeof movie.profit === "number") {
                metric = movie.profit;
            }
            else {
                metric = 0;
            }
        }

        if (selectedMetric === "numNominations") {
            const ggNomination = movie.goldenGlobesData ? (movie.goldenGlobesData.goldenGlobesNominations ? (typeof movie.goldenGlobesData.goldenGlobesNominations === "number" ? movie.goldenGlobesData.goldenGlobesNominations : 0) : 0) : 0;
            const oscarNomination = movie.oscarsData ? (movie.oscarsData.oscarNominations ? (typeof movie.oscarsData.oscarNominations === "number" ? movie.oscarsData.oscarNominations : 0) : 0) : 0;
            metric = ggNomination + oscarNomination;
        }

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
    return res;
}



/**
 * 
 * @param {object} intervalData - res of preceding function in form 
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
 * @param {string} selectedFilter - Le filtre utilisé pour l'analyse (e.g., "genre", "movieLength", "certificate")
 * @returns {object} res in the form
 * {
 * "[1921, 1925]" : {
 *      metricForfilter (metricPerselectedFilter) : {
 *          "Action" : float //e.g: 0.5
 *          "Drama" : float //e.g: 0.2
 *              ...
 *          },
 *      },
 *  [1926, 1930] : {...}
 *   ...
 * } 
 */


export function getMarketPerTimeInterval(intervalData, selectedFilter) {
    const res = {};


    for (const interval in intervalData) {
        const intervalElem = intervalData[interval];


        res[interval] = {
            metricForfilter: {}
        };


        const res_elem = res[interval];

        // On normalise les valeurs par rapport à la somme des valeurs de chaque intervalle
        if (selectedFilter === "genre") {
            const sum_genre_metric = Object.values(intervalElem.metricPerGenre).reduce((acc, val) => acc + val, 0);
            Object.keys(intervalElem.metricPerGenre).forEach(genre => {
                res_elem.metricForfilter[genre] = intervalElem.metricPerGenre[genre] / sum_genre_metric;
            })
        }
        if (selectedFilter === "movieLength") {
            const sum_lenght_metric = Object.values(intervalElem.metricsPerMovieLenght).reduce((acc, val) => acc + val, 0);
            Object.keys(intervalElem.metricsPerMovieLenght).forEach(lengthInterval => {
                res_elem.metricForfilter[lengthInterval] = intervalElem.metricsPerMovieLenght[lengthInterval] / sum_lenght_metric;
            })
        }

        if (selectedFilter === "certificate") {
            const sum_certificate_metric = Object.values(intervalElem.metricsPerCertificate).reduce((acc, val) => acc + val, 0);
            Object.keys(intervalElem.metricsPerCertificate).forEach(certificate => {
                res_elem.metricForfilter[certificate] = intervalElem.metricsPerCertificate[certificate] / sum_certificate_metric;
            })
        }
    }
    return res;
}


/**
 * 
 * @param {*} marketData - res of preceding function 
 * @param {*} maxLines - object of the same form as marketData, but with the number of element in metricsForfilter limited to maxLines by regrouping the last elements in "Other" - and we store the list of present category in the res object to be able to display the legend
 * * @returns {object} res in the form
 * {
 * "presentCategory": ["Action", "Drama", ...],}
 * "intervals" : {
 *    "[1921, 1925]" : {}...}
 *    }
 * }
 */

export function reduceNumberOfLine(marketData, maxLines) {

    const res = { "presentCategory": [], "intervals": {} };

    for (const interval in marketData) {
        const intervalElem = marketData[interval];
        const res_elem = res["intervals"][interval] = { metricForfilter: {} };


        // Sort the genres by value
        const sortedGenres = Object.entries(intervalElem.metricForfilter).sort((a, b) => b[1] - a[1]);


        // Keep only the first maxLines elements and group the others in "Other"
        const topGenres = sortedGenres.slice(0, maxLines - 1);
        const otherGenres = sortedGenres.slice(maxLines - 1);


        topGenres.forEach(([genre, value]) => {
            res_elem.metricForfilter[genre] = value;
            res["presentCategory"].push(genre);
        })


        // Add the "Other" category
        res_elem.metricForfilter["Other"] = otherGenres.reduce((acc, [_, value]) => acc + value, 0);
    }

    // Remove duplicates from presentCategory
    res["presentCategory"] = [...new Set(res["presentCategory"])];
    res["presentCategory"].push("Other");
    return res;
}

/**
 * @param {object} marketDataSmall - res of preceding function
 * @returns {object} res in the form
 * [
 *  { interval: "[1920, 1928]", Comedy: 0.28, Drama: 0.21, ..., Other: 0.*  21 },
 *  { interval: "[1928, 1936]", Comedy: 0.18, Drama: 0.18, ..., Other: 0.*  36 },
 *  ...
 * ]
*/


export function stackData(marketDataSmall) {

    return Object.entries(marketDataSmall.intervals).map(([interval, data]) => {
        const row = { interval };
        marketDataSmall.presentCategory.forEach(cat => {
            row[cat] = data.metricForfilter[cat] || 0;
        });
        return row;
    });

}




