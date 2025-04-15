// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"scripts/helper.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adjustForInflation = adjustForInflation;
exports.cleanMovieName = cleanMovieName;
exports.convertMovieNamesToString = convertMovieNamesToString;
exports.parseRuntime = parseRuntime;
exports.stopWords = void 0;
// /**
//  * Generates the SVG element g which will contain the data visualisation.
//  *
//  * @param {object} margin The desired margins around the graph
//  * @returns {*} The d3 Selection for the created g element
//  */
// export function generateG (margin) {
//   return d3.select('.graph')
//     .select('svg')
//     .append('g')
//     .attr('id', 'graph-g')
//     .attr('transform',
//       'translate(' + margin.left + ',' + margin.top + ')')
// }

// /**
//  * Sets the size of the SVG canvas containing the graph.
//  *
//  * @param {number} width The desired width
//  * @param {number} height The desired height
//  */
// export function setCanvasSize (width, height) {
//   d3.select('#heatmap').select('svg')
//     .attr('width', width)
//     .attr('height', height)
// }

// /**
//  * Appends an SVG g element which will contain the axes.
//  *
//  * @param {*} g The d3 Selection of the graph's g SVG element
//  */
// export function appendAxes (g) {
//   g.append('g')
//     .attr('class', 'x axis')

//   g.append('g')
//     .attr('class', 'y axis')
// }

/**
 * Cleans the name to avoid mismatching during the comparison of movie names
 *
 * @param {string} name The movie name to clean
 * @returns {string} the cleaned movie name
 */
function cleanMovieName(name) {
  var nameStr = String(name);
  var articlePattern = /^(.+),\s+(The|A|An)$/i;
  var articleMatch = nameStr.match(articlePattern);
  if (articleMatch) nameStr = "".concat(articleMatch[2], " ").concat(articleMatch[1]);
  return nameStr.toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

/**
 * Adjusts a monetary amount for inflation based on the year difference
 *
 * @param {number} moneterayAmount The original monetary amount to adjust
 * @param {number} movieYear The year of the original amount
 * @param {number} topYear The year to adjust the amount to
 * @returns {number} The inflation-adjusted amount, rounded to 2 decimal places
 */
function adjustForInflation(moneterayAmount, movieYear, topYear) {
  var nYears = topYear - movieYear;
  var inflationRate = 1 + 3.3 / 100;
  for (var i = 0; i < nYears; i++) {
    moneterayAmount *= inflationRate;
  }
  return Number(moneterayAmount.toFixed(2));
}

/**
 * Parses a runtime string into total minutes
 *
 * @param {string} runtimeString A string representing the runtime in hours and/or minutes
 * @returns {number|null} The total runtime in minutes, or null if invalid input
 */
function parseRuntime(runtimeString) {
  if (!runtimeString || typeof runtimeString !== 'string') return null;
  var totalMins = 0;
  var hoursMatch = runtimeString.match(/(\d+)h/);
  var minutesMatch = runtimeString.match(/(\d+)m/);
  if (hoursMatch && hoursMatch[1]) totalMins += parseInt(hoursMatch[1], 10) * 60;
  if (minutesMatch && minutesMatch[1]) totalMins += parseInt(minutesMatch[1], 10);
  return totalMins > 0 ? totalMins : null;
}
var stopWords = exports.stopWords = new Set(['about', 'after', 'again', 'against', 'all', 'also', 'and', 'any', 'are', 'because', 'been', 'before', 'being', 'between', 'both', 'but', 'can', 'cant', 'could', 'did', 'does', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'his', 'here', 'how', 'into', 'its', 'just', 'more', 'most', 'not', 'now', 'off', 'once', 'only', 'other', 'over', 'same', 'should', 'some', 'such', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'theres', 'these', 'they', 'this', 'those', 'through', 'too', 'under', 'until', 'very', 'was', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'your']);

/**
 * Converts all the movie names to string values
 *
 * @param {object} movies An object containing a list of the top 250 IMBD movies
 * @returns {object} A list of the top 250 IMDB movies with their names all being of type string
 */
function convertMovieNamesToString(movies) {
  movies.forEach(function (movie) {
    if (typeof movie.name !== 'string') movie.name = String(movie.name);
  });
  return movies;
}
},{}],"scripts/process_golden_globes.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addGoldenGlobesData = addGoldenGlobesData;
exports.getGoldenGlobesMovieData = getGoldenGlobesMovieData;
var _helper = require("./helper");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Gets the data for golden globes nominations for all the movies in the top 250 in IMDB
 *
 * @param {object[]} goldenGlobes The golden globes data to analyze
 * @param {object[]} movieNames The names of the top 250 movies on IMDB
 * @returns {object} The golden globes data of the top 250 movies on IMDB
 */
function getGoldenGlobesMovieData(goldenGlobes, movieNames) {
  return goldenGlobes.reduce(function (acc, item) {
    var cleanName = (0, _helper.cleanMovieName)(item.film);
    if (movieNames.includes(cleanName)) {
      var isWinner = item.win === 'True';
      if (!acc[cleanName]) {
        acc[cleanName] = {
          nominations: [{
            year: item.year_film,
            nominee: item.name,
            winner: isWinner
          }],
          nbNominations: 1,
          nbWins: isWinner ? 1 : 0
        };
      } else {
        acc[cleanName].nominations.push({
          year: item.year_film,
          nominee: item.name,
          winner: isWinner
        });
        acc[cleanName].nbNominations++;
        if (isWinner) acc[cleanName].nbWins++;
      }
    }
    return acc;
  }, {});
}

/**
 * Add the data collected from the golden globes awards to the imdb data
 *
 * @param {object[]} imdb The data of the top 250 movies on IMDB
 * @param {object} goldenGlobesMovies The golden globes data of the movies in the top 250 on IMDB
 * @returns {object} The imdb data concatenated with the golden globes data
 */
function addGoldenGlobesData(imdb, goldenGlobesMovies) {
  return imdb.map(function (movie) {
    var enhancedMovie = _objectSpread({}, movie);
    var cleanName = (0, _helper.cleanMovieName)(movie.name);
    enhancedMovie.goldenGlobesData = {
      goldenGlobesNominees: goldenGlobesMovies[cleanName] ? goldenGlobesMovies[cleanName].nominations : [],
      goldenGlobesNominations: goldenGlobesMovies[cleanName] ? goldenGlobesMovies[cleanName].nbNominations : 0,
      goldenGlobesWins: goldenGlobesMovies[cleanName] ? goldenGlobesMovies[cleanName].nbWins : 0
    };
    return enhancedMovie;
  });
}
},{"./helper":"scripts/helper.js"}],"scripts/process_oscars.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addOscarsData = addOscarsData;
exports.getOscarsMovieData = getOscarsMovieData;
var _helper = require("./helper");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Gets the data for oscar nominations for all the movies in the top 250 in IMDB
 *
 * @param {object[]} oscars The oscars data to analyze
 * @param {string[]} movieNames The names of the top 250 movies on IMDB
 * @returns {object} The oscars data of the top 250 movies on IMDB
 */
function getOscarsMovieData(oscars, movieNames) {
  return oscars.reduce(function (acc, item) {
    var cleanName = (0, _helper.cleanMovieName)(item.film);
    if (movieNames.includes(cleanName)) {
      var isWinner = item.winner === 'True';
      if (!acc[cleanName]) {
        acc[cleanName] = {
          nominations: [{
            year: item.year_film,
            nominee: item.name,
            winner: isWinner
          }],
          nbNominations: 1,
          nbWins: isWinner ? 1 : 0
        };
      } else {
        acc[cleanName].nominations.push({
          year: item.year_film,
          nominee: item.name,
          winner: isWinner
        });
        acc[cleanName].nbNominations++;
        if (isWinner) acc[cleanName].nbWins++;
      }
    }
    return acc;
  }, {});
}

/**
 * Add the data collected from the oscars awards to the imdb data
 *
 * @param {object[]} imdb The data of the top 250 movies on IMDB
 * @param {object} oscarMovies The oscars data of the movies in the top 250 on IMDB
 * @returns {object} The imdb data concatenated with the oscars data
 */
function addOscarsData(imdb, oscarMovies) {
  return imdb.map(function (movie) {
    var enhancedMovie = _objectSpread({}, movie);
    var cleanName = (0, _helper.cleanMovieName)(movie.name);
    enhancedMovie.oscarsData = {
      oscarNominees: oscarMovies[cleanName] ? oscarMovies[cleanName].nominations : [],
      oscarNominations: oscarMovies[cleanName] ? oscarMovies[cleanName].nbNominations : 0,
      oscarWins: oscarMovies[cleanName] ? oscarMovies[cleanName].nbWins : 0
    };
    return enhancedMovie;
  });
}
},{"./helper":"scripts/helper.js"}],"scripts/process_additional_movie_data.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addAdditionalMovieData = addAdditionalMovieData;
exports.getAdditionalMovieData = getAdditionalMovieData;
var _helper = require("./helper");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Gets the additional data required for all the movies in the top 250 in IMDB
 *
 * @param {object[]} movies The additional movie data to analyze
 * @param {object[]} movieNames The names of the top 250 movies on IMDB
 * @returns {object} The additonal movie data of the top 250 movies on IMDB
 */
function getAdditionalMovieData(movies, movieNames) {
  return movies.reduce(function (acc, movie) {
    if (!movie.original_title) return acc;
    var cleanName = (0, _helper.cleanMovieName)(movie.original_title);
    if (movieNames.includes(cleanName)) {
      var companies = [];
      if (movie.production_companies) {
        var pCompaniesData = typeof movie.production_companies === 'string' ? JSON.parse(movie.production_companies) : movie.production_companies;
        if (Array.isArray(pCompaniesData) && pCompaniesData.length > 0) {
          companies = pCompaniesData.map(function (pCompany) {
            return pCompany.name;
          }).filter(Boolean);
        }
      }
      var releaseDate = '';
      if (movie.release_date) {
        try {
          releaseDate = new Date(movie.release_date).toISOString().split('T')[0];
        } catch (error) {
          releaseDate = movie.release_date;
        }
      }
      acc[cleanName] = {
        keywords: movie.keywords || '',
        popularity: movie.popularity || 0,
        productionCompanies: companies,
        releaseDate: releaseDate,
        budget: movie.budget,
        revenue: movie.revenue
      };
    }
    return acc;
  }, {});
}

/**
 * Add the additional movie data to the imdb data
 *
 * @param {object[]} imdb The data of the top 250 movies on IMDB
 * @param {object} additionalData The additional data of the movies in the top 250 on IMDB
 * @returns {object} The imdb data concatenated with the oscars data
 */
function addAdditionalMovieData(imdb, additionalData) {
  return imdb.map(function (movie) {
    var enhancedMovie = _objectSpread({}, movie);
    var cleanName = (0, _helper.cleanMovieName)(movie.name);
    enhancedMovie.keywords = additionalData[cleanName] ? additionalData[cleanName].keywords : [];
    enhancedMovie.popularity = additionalData[cleanName] ? additionalData[cleanName].popularity : 0;
    enhancedMovie.productionCompanies = additionalData[cleanName] ? additionalData[cleanName].productionCompanies : {};
    enhancedMovie.releaseDate = additionalData[cleanName] ? additionalData[cleanName].releaseDate : null;
    if (typeof enhancedMovie.budget === 'string' && additionalData[cleanName]) {
      enhancedMovie.budget = additionalData[cleanName].budget;
    }
    if (typeof enhancedMovie.boxOffice === 'string' && additionalData[cleanName]) {
      enhancedMovie.boxOffice = additionalData[cleanName].revenue;
    }
    return enhancedMovie;
  });
}
},{"./helper":"scripts/helper.js"}],"scripts/process_imdb.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processMovieData = processMovieData;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Fix the field values in order to proceed with processing
 *
 * @param {object[]} data The top 250 movies on IMDB
 * @returns {object} The correct value types for all the various fields of the data
 */
function processMovieData(data) {
  var stringToArray = function stringToArray(movie, fieldName) {
    if (!movie[fieldName]) return [];
    try {
      if (typeof movie[fieldName] === 'string') {
        return movie[fieldName].split(',').map(function (item) {
          return item.trim();
        });
      }
      return movie[fieldName];
    } catch (error) {
      return [];
    }
  };
  return data.map(function (movie) {
    var processedMovie = _objectSpread({}, movie);
    var fieldsToProcess = ['casts', 'directors', 'genre', 'writers'];
    fieldsToProcess.forEach(function (field) {
      processedMovie[field] = stringToArray(movie, field);
    });
    return processedMovie;
  });
}
},{}],"scripts/preprocess_data.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateMovieProfits = calculateMovieProfits;
exports.createYearIntervals = createYearIntervals;
exports.getCertificateData = getCertificateData;
exports.getDataBySeason = getDataBySeason;
exports.getFilmContributorsData = getFilmContributorsData;
exports.getGenreDataIntervals = getGenreDataIntervals;
exports.getMovieLengthData = getMovieLengthData;
exports.getMoviesByGenre = getMoviesByGenre;
exports.getTaglineLengthData = getTaglineLengthData;
exports.getTaglineWordsData = getTaglineWordsData;
exports.getTopCollaborations = getTopCollaborations;
var _helper = require("./helper");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/**
 * Helper functions for metrics calculations (averages, quantity, etc)
 */
var MetricsHelper = {
  standardMetrics: [{
    property: 'rating',
    movieProperty: 'rating'
  }, {
    property: 'budget',
    movieProperty: 'budget'
  }, {
    property: 'boxOffice',
    movieProperty: 'box_office'
  }, {
    property: 'popularity',
    movieProperty: 'popularity'
  }],
  /**
   * Creates an object with new metrics with initialized properties for current standard metrics
   *
   * @returns {object} An object with total value and count properties for each of the standard metrics
   */
  createMetricsObject: function createMetricsObject() {
    var metricsObject = {};
    this.standardMetrics.forEach(function (metric) {
      metricsObject["total".concat(metric.property.charAt(0).toUpperCase() + metric.property.slice(1))] = 0;
      metricsObject["".concat(metric.property, "Count")] = 0;
      metricsObject["avg".concat(metric.property.charAt(0).toUpperCase() + metric.property.slice(1))] = 0;
    });
    return metricsObject;
  },
  /**
   * Adds the new metrics of a movie to an existing object
   *
   * @param {object} currObject The current object to which we will be adding the new metrics to
   * @param {object} movie The movie object which contains the metric values required
   * @returns {object} The updated current object with the new metrics
   */
  addMovieMetrics: function addMovieMetrics(currObject, movie) {
    this.standardMetrics.forEach(function (metric) {
      var value = movie[metric.movieProperty];
      var totalProp = "total".concat(metric.property.charAt(0).toUpperCase() + metric.property.slice(1));
      var countProp = "".concat(metric.property, "Count");
      if (typeof value === 'number' && !isNaN(value)) {
        currObject[totalProp] += value;
        currObject[countProp]++;
      }
    });
    return currObject;
  },
  /**
   * Calculates the average values for all standard metrics of a given metrics object
   *
   * @param {object} currObject The metrics object to which we need to calculate the averages of the standard
   * metrics for
   * @returns {object} The metrics object with the calculated averages added to it
   */
  calculateAverages: function calculateAverages(currObject) {
    this.standardMetrics.forEach(function (metric) {
      var totalProp = "total".concat(metric.property.charAt(0).toUpperCase() + metric.property.slice(1));
      var countProp = "".concat(metric.property, "Count");
      var avgProp = "avg".concat(metric.property.charAt(0).toUpperCase() + metric.property.slice(1));
      currObject[avgProp] = currObject[countProp] > 0 ? currObject[totalProp] / currObject[countProp] : 0;
    });
    return currObject;
  },
  /**
   * Removes the temporary calculation properties, such as the total and count, from the current object
   *
   * @param {object} currObject The current object on which to remove the additional metrics
   * @returns {object} The current cleaned metrics object
   */
  cleanupMetricsProperties: function cleanupMetricsProperties(currObject) {
    this.standardMetrics.forEach(function (metric) {
      var totalProp = "total".concat(metric.property.charAt(0).toUpperCase() + metric.property.slice(1));
      var countProp = "".concat(metric.property, "Count");
      delete currObject[totalProp];
      delete currObject[countProp];
    });
    return currObject;
  },
  /**
   * Finds the most popular genre from an array of genres
   *
   * @param {string[]} genres Array of genre names
   * @returns {object|null} Object containing most popular genre and counts
   */
  findMostPopularGenre: function findMostPopularGenre(genres) {
    if (!genres || !genres.length) return null;
    var genreCounts = {};
    genres.forEach(function (genre) {
      if (genre && genre.trim()) {
        genreCounts[genre.trim()] = (genreCounts[genre.trim()] || 0) + 1;
      }
    });
    var maxCount = 0;
    var mostPopularGenre = null;
    Object.entries(genreCounts).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        genre = _ref2[0],
        count = _ref2[1];
      if (count > maxCount) {
        maxCount = count;
        mostPopularGenre = genre;
      }
    });
    return {
      mostPopularGenre: mostPopularGenre,
      genreCounts: genreCounts
    };
  }
};

/**
 * Gets important movie data associated to each contributor of the top 250 movies on IMDB
 * with additional statistics
 *
 * @param {object[]} movies The data of the movies
 * @returns {object} The casts, directors, and writers associated to the top 250 movies on IMDB
 */
function getFilmContributorsData(movies) {
  var contributors = {
    casts: {},
    directors: {},
    writers: {}
  };
  var contributorCategories = {
    casts: 'casts',
    directors: 'directors',
    writers: 'writers'
  };
  var createContributorObject = function createContributorObject() {
    return _objectSpread({
      movies: [],
      nMovies: 0
    }, MetricsHelper.createMetricsObject());
  };
  movies.forEach(function (movie) {
    var movieInfo = {
      name: movie.name,
      genre: movie.genre || []
    };
    Object.entries(contributorCategories).forEach(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
        movieProperty = _ref4[0],
        categoryName = _ref4[1];
      if (movie[movieProperty]) {
        movie[movieProperty].forEach(function (person) {
          if (!contributors[categoryName][person]) {
            contributors[categoryName][person] = createContributorObject();
          }
          contributors[categoryName][person].movies.push(_objectSpread({}, movieInfo));
          contributors[categoryName][person].nMovies = contributors[categoryName][person].movies.length;
          MetricsHelper.addMovieMetrics(contributors[categoryName][person], movie);
        });
      }
    });
  });
  Object.keys(contributors).forEach(function (category) {
    Object.keys(contributors[category]).forEach(function (person) {
      var data = contributors[category][person];
      MetricsHelper.calculateAverages(data);
      MetricsHelper.cleanupMetricsProperties(data);
    });
  });
  return contributors;
}

/**
 * Analyzes genre data for movies across different time periods
 *
 * @param {object[]} movies Array of movie objects
 * @returns {object[]} Array of interval objects by a set of years with genre and movie analysis
 */
function getGenreDataIntervals(movies) {
  var decades = createYearIntervals(movies);
  decades.forEach(function (decade) {
    if (!decade.movies.length) {
      decade.mostCommonGenre = null;
      decade.genreCounts = {};
      return;
    }
    var allGenres = [];
    decade.movies.forEach(function (movie) {
      if (movie.genre && Array.isArray(movie.genre)) {
        movie.genre.forEach(function (genre) {
          if (genre && genre.trim()) allGenres.push(genre.trim());
        });
      }
    });
    var _MetricsHelper$findMo = MetricsHelper.findMostPopularGenre(allGenres),
      mostPopularGenre = _MetricsHelper$findMo.mostPopularGenre,
      genreCounts = _MetricsHelper$findMo.genreCounts;
    decade.mostCommonGenre = mostPopularGenre;
    decade.genreCounts = genreCounts;
  });
  return decades;
}

/**
 * Creates time intervals for movies based on their release years
 *
 * @param {object[]} movies Array of movie objects
 * @param {number} intervalSize Size of each interval in years (10 by default)
 * @returns {object[]} Array of interval objects with movies and their metrics
 */
function createYearIntervals(movies) {
  var intervalSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
  var minYear = movies.reduce(function (min, movie) {
    return movie.year < min ? movie.year : min;
  }, Number.MAX_VALUE);
  var maxYear = movies.reduce(function (max, movie) {
    return movie.year > max ? movie.year : max;
  }, Number.MIN_VALUE);
  var firstDecade = Math.floor(minYear / intervalSize) * intervalSize;
  var lastDecade = Math.floor(maxYear / intervalSize) * intervalSize;
  var intervals = [];
  for (var decade = firstDecade; decade <= lastDecade; decade += intervalSize) {
    var decadeYears = decade + (intervalSize - 1);
    intervals.push(_objectSpread({
      startYear: decade,
      endYear: decadeYears,
      label: "".concat(decade, "s"),
      movies: [],
      nMovies: 0,
      genreCounts: {}
    }, MetricsHelper.createMetricsObject()));
  }
  movies.forEach(function (movie) {
    var interval = intervals.find(function (interval) {
      return movie.year >= interval.startYear && movie.year <= interval.endYear;
    });
    if (!interval) return;
    interval.movies.push(movie);
    interval.nMovies++;
    MetricsHelper.addMovieMetrics(interval, movie);
  });
  intervals.forEach(function (interval) {
    MetricsHelper.calculateAverages(interval);
    MetricsHelper.cleanupMetricsProperties(interval);
  });
  return intervals;
}

/**
 * Gets the top collaborations for actor/director and actor/actor collaborations
 *
 * @param {Array} movies Array of movie objects
 * @param {number} limit Number of top collaborations to return (20 by default)
 * @returns {object} Object with the top actor/director and actor/actor collaborations
 */
function getTopCollaborations(movies) {
  var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;
  var allCollabs = countCollaborations(movies);
  return {
    topActorDirectorCollabs: allCollabs.actorDirectorCollabs.slice(0, limit),
    topActorActorCollabs: allCollabs.actorActorCollabs.slice(0, limit)
  };
}

/**
 * Counts the amount of collaborations between actors and directors, and also between actors themselves
 *
 * @param {Array} movies Array of movie objects with casts and directors properties
 * @returns {object} Object containing actorDirectorCollabs and actorActorCollabs
 */
function countCollaborations(movies) {
  var actorDirectorCollabs = {};
  var actorActorCollabs = {};
  var createCollabObject = function createCollabObject(isSameType, participant1, participant2) {
    return _objectSpread(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, isSameType ? 'actor1' : 'actor', participant1), isSameType ? 'actor2' : 'director', participant2), "movies", []), "genres", []), "mostPopularGenre", null), "count", 0), MetricsHelper.createMetricsObject());
  };
  var addMovieToCollab = function addMovieToCollab(collab, movie) {
    if (collab.movies.includes(movie.name)) return;
    collab.count++;
    collab.movies.push(movie.name);
    MetricsHelper.addMovieMetrics(collab, movie);
    if (movie.genre) {
      var genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre];
      genres.forEach(function (genre) {
        if (genre && genre.trim()) collab.genres.push(genre.trim());
      });
    }
  };
  movies.forEach(function (movie) {
    var castMembers = movie.casts || [];
    var directors = movie.directors || [];
    castMembers.forEach(function (actor) {
      if (!actor) return;
      directors.forEach(function (director) {
        if (!director) return;
        var key = "".concat(actor, "/").concat(director);
        if (!actorDirectorCollabs[key]) {
          actorDirectorCollabs[key] = createCollabObject(false, actor, director);
        }
        addMovieToCollab(actorDirectorCollabs[key], movie);
      });
    });
    for (var i = 0; i < castMembers.length; i++) {
      var actor1 = castMembers[i];
      if (!actor1) continue;
      for (var j = i + 1; j < castMembers.length; j++) {
        var actor2 = castMembers[j];
        if (!actor2) continue;
        var actorPair = [actor1, actor2].sort();
        var key = "".concat(actorPair[0], "/").concat(actorPair[1]);
        if (!actorActorCollabs[key]) {
          actorActorCollabs[key] = createCollabObject(true, actorPair[0], actorPair[1]);
        }
        addMovieToCollab(actorActorCollabs[key], movie);
      }
    }
  });
  var finalizeCollabs = function finalizeCollabs(collabs) {
    return Object.values(collabs).map(function (collab) {
      MetricsHelper.calculateAverages(collab);
      if (collab.genres.length) {
        var _MetricsHelper$findMo2 = MetricsHelper.findMostPopularGenre(collab.genres),
          mostPopularGenre = _MetricsHelper$findMo2.mostPopularGenre;
        collab.mostPopularGenre = mostPopularGenre;
      }
      MetricsHelper.cleanupMetricsProperties(collab);
      delete collab.genres;
      return collab;
    }).sort(function (a, b) {
      return b.count - a.count;
    });
  };
  return {
    actorDirectorCollabs: finalizeCollabs(actorDirectorCollabs),
    actorActorCollabs: finalizeCollabs(actorActorCollabs)
  };
}

/**
 * Analyzes the movie data by the available certificate ratings
 *
 * @param {object[]} movies Array of movie objects
 * @returns {object} Object with certificate data and associated metrics
 */
function getCertificateData(movies) {
  var createCertificateObject = function createCertificateObject() {
    return _objectSpread({
      movies: [],
      count: 0,
      genres: [],
      mostPopularGenre: null
    }, MetricsHelper.createMetricsObject());
  };
  var certificateData = movies.reduce(function (certificateList, movie) {
    var certificate = typeof movie.certificate === 'string' ? movie.certificate.toLowerCase() : 'unknown';
    if (!certificateList[certificate]) certificateList[certificate] = createCertificateObject();
    certificateList[certificate].movies.push({
      name: movie.name
    });
    certificateList[certificate].count++;
    MetricsHelper.addMovieMetrics(certificateList[certificate], movie);
    if (movie.genre) {
      var genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre];
      genres.forEach(function (genre) {
        if (genre && genre.trim()) certificateList[certificate].genres.push(genre.trim());
      });
    }
    return certificateList;
  }, {});
  Object.keys(certificateData).forEach(function (certificate) {
    var data = certificateData[certificate];
    MetricsHelper.calculateAverages(data);
    if (data.genres.length) {
      var _MetricsHelper$findMo3 = MetricsHelper.findMostPopularGenre(data.genres),
        mostPopularGenre = _MetricsHelper$findMo3.mostPopularGenre,
        genreCounts = _MetricsHelper$findMo3.genreCounts;
      data.mostPopularGenre = mostPopularGenre;
      data.genreCounts = genreCounts;
    }
    MetricsHelper.cleanupMetricsProperties(data);
    delete data.genres;
  });
  return certificateData;
}

/**
 * Groups the movie data by seasons (summer, fall, winter, spring) based on release dates
 *
 * @param {object[]} movies Array of movie objects
 * @returns {object} Object with movie data organized by season and their associated metrics
 */
function getDataBySeason(movies) {
  var createSeasonObject = function createSeasonObject(beginDate, endDate) {
    return _objectSpread({
      beginDate: beginDate,
      endDate: endDate,
      movies: [],
      count: 0,
      genres: [],
      mostPopularGenre: null
    }, MetricsHelper.createMetricsObject());
  };
  var seasons = {
    spring: createSeasonObject('03-20', '06-20'),
    summer: createSeasonObject('06-21', '09-22'),
    fall: createSeasonObject('09-23', '12-20'),
    winter: createSeasonObject('12-21', '03-19')
  };
  var getSeason = function getSeason(dateString) {
    if (!dateString || typeof dateString !== 'string') return null;

    // Reason : We need to split the string, however year is not required for use
    // eslint-disable-next-line no-unused-vars
    var _dateString$split$map = dateString.split('-').map(function (num) {
        return parseInt(num, 10);
      }),
      _dateString$split$map2 = _slicedToArray(_dateString$split$map, 3),
      year = _dateString$split$map2[0],
      month = _dateString$split$map2[1],
      day = _dateString$split$map2[2];
    var monthDay = "".concat(month.toString().padStart(2, '0'), "-").concat(day.toString().padStart(2, '0'));
    if (monthDay >= '03-20' && monthDay <= '06-20') return 'spring';else if (monthDay >= '06-21' && monthDay <= '09-22') return 'summer';else if (monthDay >= '09-23' && monthDay <= '12-20') return 'fall';else return 'winter';
  };
  movies.forEach(function (movie) {
    var season = getSeason(movie.releaseDate);
    if (season === null) return;
    seasons[season].movies.push(movie);
    seasons[season].count++;
    MetricsHelper.addMovieMetrics(seasons[season], movie);
    if (movie.genre) {
      var genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre];
      genres.forEach(function (genre) {
        if (genre && genre.trim()) seasons[season].genres.push(genre.trim());
      });
    }
  });
  Object.keys(seasons).forEach(function (season) {
    var data = seasons[season];
    MetricsHelper.calculateAverages(data);
    if (data.genres.length) {
      var _MetricsHelper$findMo4 = MetricsHelper.findMostPopularGenre(data.genres),
        mostPopularGenre = _MetricsHelper$findMo4.mostPopularGenre,
        genreCounts = _MetricsHelper$findMo4.genreCounts;
      data.mostPopularGenre = mostPopularGenre;
      data.genreCounts = genreCounts;
    }
    MetricsHelper.cleanupMetricsProperties(data);
    delete data.genres;
  });
  return seasons;
}

/**
 * Groups and analyzes movies by given runtime length intervals
 *
 * @param {object[]} movies Array of movie objects
 * @param {number} intervalSize Size of each runtime interval in minutes (10 by default)
 * @returns {object[]} Array of runtime interval objects with their associated movies and metrics
 */
function getMovieLengthData(movies) {
  var intervalSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
  var minRuntime = Number.MAX_VALUE;
  var maxRuntime = 0;
  movies.forEach(function (movie) {
    var runtime = (0, _helper.parseRuntime)(movie.run_time);
    if (runtime) {
      minRuntime = Math.min(minRuntime, runtime);
      maxRuntime = Math.max(maxRuntime, runtime);
    }
  });
  var firstInterval = Math.floor(minRuntime / intervalSize) * intervalSize;
  var lastInterval = Math.floor(maxRuntime / intervalSize) * intervalSize;
  var intervals = [];
  for (var minutes = firstInterval; minutes <= lastInterval; minutes += intervalSize) {
    intervals.push(_objectSpread({
      startMinutes: minutes,
      endMinutes: minutes + (intervalSize - 1),
      label: "".concat(minutes, "s"),
      movies: [],
      nMovies: 0,
      genres: []
    }, MetricsHelper.createMetricsObject()));
  }
  movies.forEach(function (movie) {
    var movieRuntime = (0, _helper.parseRuntime)(movie.run_time);
    var interval = intervals.find(function (interval) {
      return movieRuntime >= interval.startMinutes && movieRuntime <= interval.endMinutes;
    });
    if (!interval) return;
    interval.movies.push(movie);
    interval.nMovies++;
    MetricsHelper.addMovieMetrics(interval, movie);
    if (movie.genre) {
      var genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre];
      genres.forEach(function (genre) {
        if (genre && genre.trim()) interval.genres.push(genre.trim());
      });
    }
  });
  intervals.forEach(function (interval) {
    MetricsHelper.calculateAverages(interval);
    if (interval.genres.length) {
      var _MetricsHelper$findMo5 = MetricsHelper.findMostPopularGenre(interval.genres),
        mostPopularGenre = _MetricsHelper$findMo5.mostPopularGenre,
        genreCounts = _MetricsHelper$findMo5.genreCounts;
      interval.mostPopularGenre = mostPopularGenre;
      interval.genreCounts = genreCounts;
    }
    MetricsHelper.cleanupMetricsProperties(interval);
    delete interval.genres;
  });
  return intervals;
}

/**
 * Analyzes the frequency of appearance for words and associated data in movie taglines
 *
 * @param {object[]} movies Array of movie objects
 * @param {number} minWordLength Minimum length of words to include (3 by default)
 * @param {number} minOccurrences Minimum occurrences of words to include (2 by default)
 * @returns {object[]} Array of word objects with associated movie data and their metrics
 */
function getTaglineWordsData(movies) {
  var minWordLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;
  var minOccurrences = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
  var createWordObject = function createWordObject() {
    return _objectSpread({
      movies: [],
      count: 0,
      genres: [],
      mostPopularGenre: null
    }, MetricsHelper.createMetricsObject());
  };
  var wordCounts = {};
  movies.forEach(function (movie) {
    if (!movie.tagline || typeof movie.tagline !== 'string') return;
    var words = movie.tagline.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(function (word) {
      return word.length >= minWordLength && !_helper.stopWords.has(word);
    });
    words.forEach(function (word) {
      if (!wordCounts[word]) wordCounts[word] = 0;
      wordCounts[word]++;
    });
  });
  var significantWords = Object.keys(wordCounts).filter(function (word) {
    return wordCounts[word] >= minOccurrences;
  });
  var wordData = {};
  significantWords.forEach(function (word) {
    wordData[word] = createWordObject();
  });
  movies.forEach(function (movie) {
    if (!movie.tagline || typeof movie.tagline !== 'string') return;
    var movieWords = new Set(movie.tagline.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(function (word) {
      return significantWords.includes(word);
    }));
    movieWords.forEach(function (word) {
      wordData[word].movies.push({
        name: movie.name,
        year: movie.year,
        tagline: movie.tagline
      });
      wordData[word].count++;
      MetricsHelper.addMovieMetrics(wordData[word], movie);
      if (movie.genre) {
        var genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre];
        genres.forEach(function (genre) {
          if (genre && genre.trim()) wordData[word].genres.push(genre.trim());
        });
      }
    });
  });
  Object.keys(wordData).forEach(function (word) {
    var data = wordData[word];
    MetricsHelper.calculateAverages(data);
    if (data.genres.length) {
      var _MetricsHelper$findMo6 = MetricsHelper.findMostPopularGenre(data.genres),
        mostPopularGenre = _MetricsHelper$findMo6.mostPopularGenre,
        genreCounts = _MetricsHelper$findMo6.genreCounts;
      data.mostPopularGenre = mostPopularGenre;
      data.genreCounts = genreCounts;
    }
    MetricsHelper.cleanupMetricsProperties(data);
    delete data.genres;
  });
  var result = Object.entries(wordData).map(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
      word = _ref6[0],
      data = _ref6[1];
    return _objectSpread({
      word: word
    }, data);
  }).sort(function (a, b) {
    return b.count - a.count;
  });
  return result;
}

/**
 * Analyzes the tagline length statistics and metrics for movies
 *
 * @param {object[]} movies Array of movie objects
 * @returns {object[]} Array of tagline length objects with associated movie data and metrics
 */
function getTaglineLengthData(movies) {
  var lengthMap = {};
  var createLengthObject = function createLengthObject() {
    return _objectSpread({
      movies: [],
      count: 0,
      wordCount: 0
    }, MetricsHelper.createMetricsObject());
  };
  movies.forEach(function (movie) {
    if (!movie.tagline || typeof movie.tagline !== 'string') return;
    var tagline = movie.tagline.trim();
    if (tagline.length === 0) return;
    var length = tagline.length;
    if (!lengthMap[length]) lengthMap[length] = createLengthObject();
    lengthMap[length].movies.push({
      name: movie.name,
      year: movie.year,
      tagline: movie.tagline
    });
    lengthMap[length].count++;
    var wordCount = tagline.split(/\s+/).length;
    lengthMap[length].wordCount += wordCount;
    MetricsHelper.addMovieMetrics(lengthMap[length], movie);
  });
  var result = Object.entries(lengthMap).map(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2),
      length = _ref8[0],
      data = _ref8[1];
    MetricsHelper.calculateAverages(data);
    data.avgWordCount = data.wordCount / data.count;
    delete data.wordCount;
    MetricsHelper.cleanupMetricsProperties(data);
    delete data.genres;
    return _objectSpread({
      length: parseInt(length, 10)
    }, data);
  });
  return result.sort(function (a, b) {
    return a.length - b.length;
  });
}

/**
 * Calculates the profit for each movie based on budget and box office data
 *
 * @param {object[]} imdb Array of movie objects
 * @returns {object[]} Array of movie objects with added profit property
 */
function calculateMovieProfits(imdb) {
  imdb.forEach(function (movie) {
    if (movie.budget && movie.box_office && typeof movie.budget !== 'string' && typeof movie.box_office !== 'string') {
      movie.profit = movie.box_office - movie.budget;
    }
  });
  return imdb;
}

/**
 * Groups and analyzes movies by their genres
 *
 * @param {object[]} movies Array of movie objects
 * @returns {object} Object with the genre data and associated movie metrics
 */
function getMoviesByGenre(movies) {
  var genreData = {};
  movies.forEach(function (movie) {
    var genres = [];
    if (movie.genre) {
      if (Array.isArray(movie.genre)) {
        for (var i = 0; i < movie.genre.length; i++) {
          if (movie.genre[i] && typeof movie.genre[i] === 'string') {
            genres.push(movie.genre[i].trim());
          }
        }
      } else if (_typeof(movie.genre) === 'object') {
        Object.keys(movie.genre).forEach(function (key) {
          if (movie.genre[key] && typeof movie.genre[key] === 'string') {
            genres.push(movie.genre[key].trim());
          }
        });
      } else if (typeof movie.genre === 'string') genres.push(movie.genre.trim());
    }
    genres.forEach(function (genreName) {
      if (!genreData[genreName]) {
        genreData[genreName] = _objectSpread({
          movies: [],
          count: 0
        }, MetricsHelper.createMetricsObject());
      }
      genreData[genreName].movies.push(movie);
      genreData[genreName].count++;
      MetricsHelper.addMovieMetrics(genreData[genreName], movie);
    });
  });
  Object.keys(genreData).forEach(function (genre) {
    MetricsHelper.calculateAverages(genreData[genre]);
    MetricsHelper.cleanupMetricsProperties(genreData[genre]);
  });
  return genreData;
}
},{"./helper":"scripts/helper.js"}],"viz1-scripts/viz1-helper.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appendAxes = appendAxes;
exports.appendGraphLabels = appendGraphLabels;
exports.drawButton = drawButton;
exports.drawXAxis = drawXAxis;
exports.drawYAxis = drawYAxis;
exports.generateG = generateG;
exports.placeTitle = placeTitle;
exports.setCanvasSize = setCanvasSize;
/**
 * Generates a specific <g> container inside a given SVG container.
 *
 * @param {string} svgSelector The selector of the SVG container (e.g. ".viz1-svg" or ".film-impact-svg")
 * @param {object} margin The desired margins around the graph
 * @param {string} id Optional ID or class for the <g> container
 * @returns {*} The d3 Selection for the created g element
 */
function generateG(svgSelector, margin) {
  var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var g = svgSelector.append('g').attr('transform', "translate(".concat(margin.left, ",").concat(margin.top, ")"));
  if (id) {
    g.attr('id', id);
  }
  return g;
}

/**
 * Sets the size of the SVG canvas containing the graph.
 *
 * @param {number} width The desired width
 * @param {number} height The desired height
 */
function setCanvasSize(width, height) {
  d3.select('.success-scatter-svg').attr('width', width).attr('height', height);
}

/**
 * Appends an SVG g element which will contain the axes.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
function appendAxes(g) {
  g.append('g').attr('class', 'x1 axis');
  g.append('g').attr('class', 'y1 axis');
}
/**
 * Appends the labels for the the y axis and the title of the graph.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
function appendGraphLabels(g) {
  g.append('text').text('Classement').attr('class', 'y1 axis-text').attr('transform', 'rotate(-90)').attr('x', -30) // Plus négatif = plus bas (le long de l'axe Y)
  .attr('y', 13) // Plus petit = plus proche de l'axe Y
  .attr('font-size', 12);
  g.append('text').text('Box-office (en $)').attr('class', 'x1 axis-text').attr('x', -40) // À ajuster selon la largeur de ton graphe
  .attr('y', 0) // À ajuster selon la hauteur
  .attr('font-size', 12);
}

/**
 * Draws the X axis at the bottom of the diagram.
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {*} xScale The scale to use to draw the axis
 * @param {number} height The height of the graphic
 */
function drawXAxis(g, xScale, height) {
  g.select('.x1.axis').attr('transform', 'translate(0,' + height + ')').call(d3.axisBottom(xScale).tickSizeOuter(0).tickArguments([5, '~s']));
}

/**
 * Draws the Y axis to the left of the diagram.
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {*} yScale The scale to use to draw the axis
 */
function drawYAxis(g, yScale) {
  g.select('.y1.axis').call(d3.axisLeft(yScale).tickSizeOuter(0).tickValues([1, 50, 100, 150, 200, 250]) // ou tout autre intervalle clair
  .tickFormat(d3.format('d')) // évite les arrondis foireux
  );
}

/**
 * Places the graph's title.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
function placeTitle(g) {
  g.append('text').attr('class', 'title1').attr('x1', 0).attr('y1', -20).attr('font-size', 14);
}

/**
 * Draws the button to toggle the display year.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} year The year to display
 * @param {number} width The width of the graph, used to place the button
 */
function drawButton(g, year, width) {
  var button = g.append('g').attr('class', 'button1').attr('transform', 'translate(' + width + ', 140)').attr('width', 130).attr('height', 25);
  button.append('rect').attr('width', 130).attr('height', 30).attr('fill', '#f4f6f4').on('mouseenter', function () {
    d3.select(this).attr('stroke', '#362023');
  }).on('mouseleave', function () {
    d3.select(this).attr('stroke', '#f4f6f4');
  });
  button.append('text').attr('x1', 65).attr('y1', 15).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('class', 'button-text1').text('See ' + year + ' dataset').attr('font-size', '10px').attr('fill', '#362023');
}
},{}],"viz1-scripts/viz1-legend.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.drawLegend = drawLegend;
/**
 * Draws a color gradient legend as a horizontal bar with year labels.
 *
 * @param {*} colorScale The color scale to use (d3.scaleSequential)
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} width The width of the graph, used to place the legend
 * @param {number} height The height for the legend (bar height)
 * @param {number} minYear The minimum year value
 * @param {number} maxYear The maximum year value
 */
function drawLegend(colorScale, g, width, height, minYear, maxYear) {
  // Create the gradient
  var defs = g.append("defs");
  var gradient = defs.append("linearGradient").attr("id", "gradient").attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");

  // Define the gradient stops based on the color scale
  gradient.selectAll("stop").data(colorScale.ticks(10)) // Divide into 10 intervals
  .enter().append("stop").attr("offset", function (d, i) {
    return "".concat(i / 10 * 100, "%");
  }).attr("stop-color", function (d) {
    return colorScale(d);
  });

  // Append a rectangle to display the gradient
  var legendBar = g.append("g").attr("transform", "translate(".concat(width + 60, ", 60)")); // Position of the legend

  legendBar.append("rect").attr("width", width / 30).attr("height", height * 0.7).style("fill", "url(#gradient)");

  // Add min and max year labels
  legendBar.append("text").attr("x", 13).attr("y", height - 100).attr("text-anchor", "middle").text(minYear);
  legendBar.append("text").attr("x", 11).attr("y", height - 440).attr("text-anchor", "middle").text(maxYear);

  // === BUBBLE LEGEND ===
  var bubbleLegend = g.append("g").attr("transform", "translate(".concat(width + 130, ", 140)")); // position ajustable

  var circleSizes = [20, 14, 9, 4]; // rayons
  var spacing = 50;
  var startY = 0;
  circleSizes.forEach(function (r, i) {
    bubbleLegend.append("circle").attr("cx", 0).attr("cy", startY + i * spacing).attr("r", r).attr("fill", "black");
  });

  // Flèche verticale
  bubbleLegend.append("defs").append("marker").attr("id", "arrow-head").attr("viewBox", "0 0 10 10").attr("refX", 5).attr("refY", 5).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", "black");
  bubbleLegend.append("line").attr("x1", 30).attr("y1", spacing * (circleSizes.length - 1) + 20).attr("x2", 30).attr("y2", -20).attr("stroke", "black").attr("stroke-width", 2).attr("marker-end", "url(#arrow-head)");
  var textLines = ["Nominations", "(Oscars et", "Golden Globes)"];
  var text = bubbleLegend.append("text").attr("x", 40).attr("y", spacing * 1.5).attr("text-anchor", "start").style("font-family", "sans-serif").style("font-size", "12px");
  text.selectAll("tspan").data(textLines).enter().append("tspan").attr("x", 40).attr("dy", function (d, i) {
    return i === 0 ? "0em" : "1.2em";
  }).text(function (d) {
    return d;
  });
}
},{}],"viz1-scripts/viz1-scales.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setColorScale = setColorScale;
exports.setRadiusScale = setRadiusScale;
exports.setXScale = setXScale;
exports.setYScale = setYScale;
/**
 * Defines the scale to use for the circle markers' radius.
 *
 * The radius is linearly proportional to the total number of nominations.
 * (Oscars + Golden Globes), in the interval [5, 20].
 *
 * @param {object} data The data to be displayed
 * @returns {*} The linear scale used to determine the radius
 */
function setRadiusScale(data) {
  var flatData = Object.values(data).flat();
  var minNominations = d3.min(flatData, function (d) {
    return d.oscarsData.oscarNominations + d.goldenGlobesData.goldenGlobesNominations;
  });
  var maxNominations = d3.max(flatData, function (d) {
    return d.oscarsData.oscarNominations + d.goldenGlobesData.goldenGlobesNominations;
  });
  return d3.scaleLinear().domain([minNominations, maxNominations]).range([5, 15]);
}

/**
 * Defines the color scale based on release year.
 * @param data
 * @returns {*}
 */
function setColorScale(data) {
  var flatData = Object.values(data).flat();
  var years = flatData.map(function (d) {
    return d.year;
  });
  var minYear = d3.min(years);
  var maxYear = d3.max(years);
  return d3.scaleSequential().domain([minYear, maxYear]).interpolator(d3.interpolateViridis); // interpolatePlasma ou interpolateViridis
}

/**
 * Defines the linear scale in X (Box Office).
 *
 * @param {number} width The width of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in X
 */
function setXScale(width, data) {
  var flatData = Object.values(data).flat().filter(function (d) {
    return d.box_office !== "Not Available" && !isNaN(d.box_office);
  });
  var minBO = d3.min(flatData, function (d) {
    return +d.box_office;
  });
  var maxBO = d3.max(flatData, function (d) {
    return +d.box_office;
  });
  return d3.scaleLog().domain([minBO, maxBO]).range([0, width]);
}

/**
 * Defines the linear scale in Y (rank), inverted.
 *
 * @param {number} height The height of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in Y
 */
function setYScale(height, data) {
  var flatData = Object.values(data).flat().filter(function (d) {
    return d.rank !== undefined && !isNaN(d.rank);
  });
  var minRank = d3.min(flatData, function (d) {
    return d.rank;
  });
  var maxRank = d3.max(flatData, function (d) {
    return d.rank;
  });
  return d3.scaleLinear().domain([maxRank, minRank]) // échelle inversée, le meilleur rank est en haut
  .range([height, 0]);
}
},{}],"viz1-scripts/viz1-tooltip.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getContents = getContents;
/**
 * Defines the contents of the tooltip. See CSS for tooltip styling.
 * The tooltip features the movie name, box office, total nominations,
 * rank, and release year.
 *
 * @param {object} d The data associated to the hovered element
 * @returns {string} The tooltip contents
 */
function getContents(d) {
  var boxOfficeFormatted = d.box_office ? "$".concat(Number(d.box_office).toLocaleString()) : 'Not Available';
  var totalNominations = (d.oscarsData.oscarNominations || 0) + (d.goldenGlobesData.goldenGlobesNominations || 0);
  return " <div class=\"tooltip-value\" style=\"\n      background: linear-gradient(90deg,rgb(143, 143, 143) 0%,rgba(166, 166, 166, 0.4) 100%);\n      padding: 12px;\n      border-radius: 6px;\n      color: white;\n      backdrop-filter: blur(5px);\n      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);\n      \"\n  >\n    <div style=\"margin: 4px 0;\">\n      <strong>\uD83C\uDFAC Movie:</strong> ".concat(d.name, "\n    </div>\n    <div style=\"margin: 4px 0;\">\n      <strong>\uD83D\uDCB0 Box Office:</strong> ").concat(boxOfficeFormatted, "\n    </div>\n    <div style=\"margin: 4px 0;\">\n      <strong>\uD83C\uDFC6 Nominations:</strong> ").concat(totalNominations, "\n    </div>\n    <div style=\"margin: 4px 0;\">\n      <strong>\u2B50 Rank:</strong> ").concat(d.rank, "\n    </div>\n    <div style=\"margin: 4px 0;\">\n      <strong>\uD83D\uDCC5 Year:</strong> ").concat(d.year, "\n    </div>\n  </div> \n  ");
}
},{}],"viz1-scripts/viz1-viz.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.drawCircles = drawCircles;
exports.moveCircles = moveCircles;
exports.positionLabels = positionLabels;
exports.setCircleHoverHandler = setCircleHoverHandler;
exports.setTitleText = setTitleText;
/* eslint-disable space-before-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable space-in-parens */
/* eslint-disable spaced-comment */
/* eslint-disable indent */
/* eslint-disable no-multi-spaces */
/**
 * Positions the x axis label and y axis label.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} width The width of the graph
 * @param {number} height The height of the graph
 */
function positionLabels(g, width, height) {
  // TODO : Position axis labels
  g.select('.x1.axis-text').attr('transform', 'translate(' + width / 2 + ', ' + (height + 50) + ')'); // On décale le label x à la moitié de la largeur

  g.select('.y1.axis-text').attr('transform', 'translate(-75, ' + height / 2 + ')rotate(-90)'); // On décale le label x à la moitié de la hauteur
}
/**
 * Draws the circles on the graph.
 *
 * @param {object} g The D3 selection of the <g> element to draw in
 * @param {object} data The data to bind to
 * @param {*} rScale The scale for the circles' radius
 * @param {*} colorScale The scale for the circles' color
 */
function drawCircles(g, data, rScale, colorScale) {
  // On garde uniquement les films avec un box office valide
  var cleanedData = data.filter(function (d) {
    return d.box_office !== "Not Available" && !isNaN(d.box_office) && d.rank !== undefined && !isNaN(d.rank);
  });

  // Liaison des données et création des cercles
  g.selectAll('circle').data(cleanedData).enter().append('circle').attr('class', 'bubble1');

  // Mise à jour des attributs des cercles
  g.selectAll('.bubble1').data(cleanedData).attr('r', function (d) {
    return rScale(d.oscarsData.oscarNominations + d.goldenGlobesData.goldenGlobesNominations);
  }).attr('fill', function (d) {
    return colorScale(d.year);
  }).style('opacity', 0.85).attr('stroke', 'white');
}

/**
 * Updates the position of the circles based on their bound data.
 *
 * @param {object} g The D3 selection of the <g> element containing the circles
 * @param {*} xScale The x scale used to position the circles
 * @param {*} yScale The y scale used to position the circles
 * @param {number} transitionDuration The duration of the transition
 */
function moveCircles(g, xScale, yScale, transitionDuration) {
  g.selectAll('.bubble1').transition().duration(transitionDuration).attr('cx', function (d) {
    return xScale(d.box_office);
  }).attr('cy', function (d) {
    return yScale(d.rank);
  });
}

/**
 * Sets up the hover event handler. The tooltip should show on on hover.
 *
 * @param {*} tip The tooltip
 */
function setCircleHoverHandler(g, tip) {
  // TODO : Set hover handler. The tooltip shows on
  // hover and the opacity goes up to 100% (from 70%)

  // On sélectionne le graphe et les bulles
  g.selectAll('.bubble1').on('mouseover', function (e, d) {
    // Quand la souris passe dessus
    d3.select(this).style('opacity', 1); // Opacité -> 100%
    tip.show(d, this); // On montre le tip 
  }).on('mouseout', function (e, d) {
    // Quand la souris sort
    d3.select(this).style('opacity', 0.85); // Opacité -> 70%
    tip.hide(d, this); // On cache le tip 
  });
}

/**
 * Update the title of the graph.
 */
function setTitleText(year) {
  // TODO : Set the title
  d3.select('#graph-g') // Sélection du graphe
  .select('.title1') // Sélection du titre
  .text('Data for year : '); // On change le texte (initialement vide) comme attendu
}
},{}],"../node_modules/d3-collection/src/map.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prefix = exports.default = void 0;
var prefix = exports.prefix = "$";
function Map() {}
Map.prototype = map.prototype = {
  constructor: Map,
  has: function (key) {
    return prefix + key in this;
  },
  get: function (key) {
    return this[prefix + key];
  },
  set: function (key, value) {
    this[prefix + key] = value;
    return this;
  },
  remove: function (key) {
    var property = prefix + key;
    return property in this && delete this[property];
  },
  clear: function () {
    for (var property in this) if (property[0] === prefix) delete this[property];
  },
  keys: function () {
    var keys = [];
    for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
    return keys;
  },
  values: function () {
    var values = [];
    for (var property in this) if (property[0] === prefix) values.push(this[property]);
    return values;
  },
  entries: function () {
    var entries = [];
    for (var property in this) if (property[0] === prefix) entries.push({
      key: property.slice(1),
      value: this[property]
    });
    return entries;
  },
  size: function () {
    var size = 0;
    for (var property in this) if (property[0] === prefix) ++size;
    return size;
  },
  empty: function () {
    for (var property in this) if (property[0] === prefix) return false;
    return true;
  },
  each: function (f) {
    for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
  }
};
function map(object, f) {
  var map = new Map();

  // Copy constructor.
  if (object instanceof Map) object.each(function (value, key) {
    map.set(key, value);
  });

  // Index array by numeric index or specified key function.
  else if (Array.isArray(object)) {
    var i = -1,
      n = object.length,
      o;
    if (f == null) while (++i < n) map.set(i, object[i]);else while (++i < n) map.set(f(o = object[i], i, object), o);
  }

  // Convert object to map.
  else if (object) for (var key in object) map.set(key, object[key]);
  return map;
}
var _default = exports.default = map;
},{}],"../node_modules/d3-collection/src/nest.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _map = _interopRequireDefault(require("./map"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _default() {
  var keys = [],
    sortKeys = [],
    sortValues,
    rollup,
    nest;
  function apply(array, depth, createResult, setResult) {
    if (depth >= keys.length) {
      if (sortValues != null) array.sort(sortValues);
      return rollup != null ? rollup(array) : array;
    }
    var i = -1,
      n = array.length,
      key = keys[depth++],
      keyValue,
      value,
      valuesByKey = (0, _map.default)(),
      values,
      result = createResult();
    while (++i < n) {
      if (values = valuesByKey.get(keyValue = key(value = array[i]) + "")) {
        values.push(value);
      } else {
        valuesByKey.set(keyValue, [value]);
      }
    }
    valuesByKey.each(function (values, key) {
      setResult(result, key, apply(values, depth, createResult, setResult));
    });
    return result;
  }
  function entries(map, depth) {
    if (++depth > keys.length) return map;
    var array,
      sortKey = sortKeys[depth - 1];
    if (rollup != null && depth >= keys.length) array = map.entries();else array = [], map.each(function (v, k) {
      array.push({
        key: k,
        values: entries(v, depth)
      });
    });
    return sortKey != null ? array.sort(function (a, b) {
      return sortKey(a.key, b.key);
    }) : array;
  }
  return nest = {
    object: function (array) {
      return apply(array, 0, createObject, setObject);
    },
    map: function (array) {
      return apply(array, 0, createMap, setMap);
    },
    entries: function (array) {
      return entries(apply(array, 0, createMap, setMap), 0);
    },
    key: function (d) {
      keys.push(d);
      return nest;
    },
    sortKeys: function (order) {
      sortKeys[keys.length - 1] = order;
      return nest;
    },
    sortValues: function (order) {
      sortValues = order;
      return nest;
    },
    rollup: function (f) {
      rollup = f;
      return nest;
    }
  };
}
function createObject() {
  return {};
}
function setObject(object, key, value) {
  object[key] = value;
}
function createMap() {
  return (0, _map.default)();
}
function setMap(map, key, value) {
  map.set(key, value);
}
},{"./map":"../node_modules/d3-collection/src/map.js"}],"../node_modules/d3-collection/src/set.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _map = _interopRequireWildcard(require("./map"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function Set() {}
var proto = _map.default.prototype;
Set.prototype = set.prototype = {
  constructor: Set,
  has: proto.has,
  add: function (value) {
    value += "";
    this[_map.prefix + value] = value;
    return this;
  },
  remove: proto.remove,
  clear: proto.clear,
  values: proto.keys,
  size: proto.size,
  empty: proto.empty,
  each: proto.each
};
function set(object, f) {
  var set = new Set();

  // Copy constructor.
  if (object instanceof Set) object.each(function (value) {
    set.add(value);
  });

  // Otherwise, assume it’s an array.
  else if (object) {
    var i = -1,
      n = object.length;
    if (f == null) while (++i < n) set.add(object[i]);else while (++i < n) set.add(f(object[i], i, object));
  }
  return set;
}
var _default = exports.default = set;
},{"./map":"../node_modules/d3-collection/src/map.js"}],"../node_modules/d3-collection/src/keys.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default(map) {
  var keys = [];
  for (var key in map) keys.push(key);
  return keys;
}
},{}],"../node_modules/d3-collection/src/values.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default(map) {
  var values = [];
  for (var key in map) values.push(map[key]);
  return values;
}
},{}],"../node_modules/d3-collection/src/entries.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default(map) {
  var entries = [];
  for (var key in map) entries.push({
    key: key,
    value: map[key]
  });
  return entries;
}
},{}],"../node_modules/d3-collection/src/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "entries", {
  enumerable: true,
  get: function () {
    return _entries.default;
  }
});
Object.defineProperty(exports, "keys", {
  enumerable: true,
  get: function () {
    return _keys.default;
  }
});
Object.defineProperty(exports, "map", {
  enumerable: true,
  get: function () {
    return _map.default;
  }
});
Object.defineProperty(exports, "nest", {
  enumerable: true,
  get: function () {
    return _nest.default;
  }
});
Object.defineProperty(exports, "set", {
  enumerable: true,
  get: function () {
    return _set.default;
  }
});
Object.defineProperty(exports, "values", {
  enumerable: true,
  get: function () {
    return _values.default;
  }
});
var _nest = _interopRequireDefault(require("./nest"));
var _set = _interopRequireDefault(require("./set"));
var _map = _interopRequireDefault(require("./map"));
var _keys = _interopRequireDefault(require("./keys"));
var _values = _interopRequireDefault(require("./values"));
var _entries = _interopRequireDefault(require("./entries"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
},{"./nest":"../node_modules/d3-collection/src/nest.js","./set":"../node_modules/d3-collection/src/set.js","./map":"../node_modules/d3-collection/src/map.js","./keys":"../node_modules/d3-collection/src/keys.js","./values":"../node_modules/d3-collection/src/values.js","./entries":"../node_modules/d3-collection/src/entries.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/namespaces.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.xhtml = exports.default = void 0;
var xhtml = exports.xhtml = "http://www.w3.org/1999/xhtml";
var _default = exports.default = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/namespace.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _namespaces = _interopRequireDefault(require("./namespaces"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _default(name) {
  var prefix = name += "",
    i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return _namespaces.default.hasOwnProperty(prefix) ? {
    space: _namespaces.default[prefix],
    local: name
  } : name;
}
},{"./namespaces":"../node_modules/d3-tip/node_modules/d3-selection/src/namespaces.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/creator.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _namespace = _interopRequireDefault(require("./namespace"));
var _namespaces = require("./namespaces");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function creatorInherit(name) {
  return function () {
    var document = this.ownerDocument,
      uri = this.namespaceURI;
    return uri === _namespaces.xhtml && document.documentElement.namespaceURI === _namespaces.xhtml ? document.createElement(name) : document.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function () {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function _default(name) {
  var fullname = (0, _namespace.default)(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}
},{"./namespace":"../node_modules/d3-tip/node_modules/d3-selection/src/namespace.js","./namespaces":"../node_modules/d3-tip/node_modules/d3-selection/src/namespaces.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/selector.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function none() {}
function _default(selector) {
  return selector == null ? none : function () {
    return this.querySelector(selector);
  };
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/select.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _index = require("./index");
var _selector = _interopRequireDefault(require("../selector"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _default(select) {
  if (typeof select !== "function") select = (0, _selector.default)(select);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new _index.Selection(subgroups, this._parents);
}
},{"./index":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/index.js","../selector":"../node_modules/d3-tip/node_modules/d3-selection/src/selector.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/selectorAll.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function empty() {
  return [];
}
function _default(selector) {
  return selector == null ? empty : function () {
    return this.querySelectorAll(selector);
  };
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/selectAll.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _index = require("./index");
var _selectorAll = _interopRequireDefault(require("../selectorAll"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _default(select) {
  if (typeof select !== "function") select = (0, _selectorAll.default)(select);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new _index.Selection(subgroups, parents);
}
},{"./index":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/index.js","../selectorAll":"../node_modules/d3-tip/node_modules/d3-selection/src/selectorAll.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/matcher.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default(selector) {
  return function () {
    return this.matches(selector);
  };
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/filter.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _index = require("./index");
var _matcher = _interopRequireDefault(require("../matcher"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _default(match) {
  if (typeof match !== "function") match = (0, _matcher.default)(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new _index.Selection(subgroups, this._parents);
}
},{"./index":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/index.js","../matcher":"../node_modules/d3-tip/node_modules/d3-selection/src/matcher.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/sparse.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default(update) {
  return new Array(update.length);
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/enter.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EnterNode = EnterNode;
exports.default = _default;
var _sparse = _interopRequireDefault(require("./sparse"));
var _index = require("./index");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _default() {
  return new _index.Selection(this._enter || this._groups.map(_sparse.default), this._parents);
}
function EnterNode(parent, datum) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function (child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function (child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function (selector) {
    return this._parent.querySelector(selector);
  },
  querySelectorAll: function (selector) {
    return this._parent.querySelectorAll(selector);
  }
};
},{"./sparse":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/sparse.js","./index":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/index.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/constant.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default(x) {
  return function () {
    return x;
  };
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/data.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _index = require("./index");
var _enter = require("./enter");
var _constant = _interopRequireDefault(require("../constant"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var keyPrefix = "$"; // Protect against keys like “__proto__”.

function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0,
    node,
    groupLength = group.length,
    dataLength = data.length;

  // Put any non-null nodes that fit into update.
  // Put any null nodes into enter.
  // Put any remaining data into enter.
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new _enter.EnterNode(parent, data[i]);
    }
  }

  // Put any non-null nodes that don’t fit into exit.
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i,
    node,
    nodeByKeyValue = {},
    groupLength = group.length,
    dataLength = data.length,
    keyValues = new Array(groupLength),
    keyValue;

  // Compute the key for each node.
  // If multiple nodes have the same key, the duplicates are added to exit.
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
      if (keyValue in nodeByKeyValue) {
        exit[i] = node;
      } else {
        nodeByKeyValue[keyValue] = node;
      }
    }
  }

  // Compute the key for each datum.
  // If there a node associated with this key, join and add it to update.
  // If there is not (or the key is a duplicate), add it to enter.
  for (i = 0; i < dataLength; ++i) {
    keyValue = keyPrefix + key.call(parent, data[i], i, data);
    if (node = nodeByKeyValue[keyValue]) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue[keyValue] = null;
    } else {
      enter[i] = new _enter.EnterNode(parent, data[i]);
    }
  }

  // Add any remaining nodes that were not bound to data to exit.
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue[keyValues[i]] === node) {
      exit[i] = node;
    }
  }
}
function _default(value, key) {
  if (!value) {
    data = new Array(this.size()), j = -1;
    this.each(function (d) {
      data[++j] = d;
    });
    return data;
  }
  var bind = key ? bindKey : bindIndex,
    parents = this._parents,
    groups = this._groups;
  if (typeof value !== "function") value = (0, _constant.default)(value);
  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j],
      group = groups[j],
      groupLength = group.length,
      data = value.call(parent, parent && parent.__data__, j, parents),
      dataLength = data.length,
      enterGroup = enter[j] = new Array(dataLength),
      updateGroup = update[j] = new Array(dataLength),
      exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

    // Now connect the enter nodes to their following update node, such that
    // appendChild can insert the materialized enter node before this node,
    // rather than at the end of the parent node.
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength);
        previous._next = next || null;
      }
    }
  }
  update = new _index.Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
},{"./index":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/index.js","./enter":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/enter.js","../constant":"../node_modules/d3-tip/node_modules/d3-selection/src/constant.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/exit.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _sparse = _interopRequireDefault(require("./sparse"));
var _index = require("./index");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _default() {
  return new _index.Selection(this._exit || this._groups.map(_sparse.default), this._parents);
}
},{"./sparse":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/sparse.js","./index":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/index.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/join.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default(onenter, onupdate, onexit) {
  var enter = this.enter(),
    update = this,
    exit = this.exit();
  enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
  if (onupdate != null) update = onupdate(update);
  if (onexit == null) exit.remove();else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/merge.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _index = require("./index");
function _default(selection) {
  for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new _index.Selection(merges, this._parents);
}
},{"./index":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/index.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/order.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default() {
  for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/sort.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _index = require("./index");
function _default(compare) {
  if (!compare) compare = ascending;
  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }
  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new _index.Selection(sortgroups, this._parents).order();
}
function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}
},{"./index":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/index.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/call.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/nodes.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default() {
  var nodes = new Array(this.size()),
    i = -1;
  this.each(function () {
    nodes[++i] = this;
  });
  return nodes;
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/node.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }
  return null;
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/size.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default() {
  var size = 0;
  this.each(function () {
    ++size;
  });
  return size;
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/empty.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default() {
  return !this.node();
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/each.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default(callback) {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/attr.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _namespace = _interopRequireDefault(require("../namespace"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function attrRemove(name) {
  return function () {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function () {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, value) {
  return function () {
    this.setAttribute(name, value);
  };
}
function attrConstantNS(fullname, value) {
  return function () {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction(name, value) {
  return function () {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);else this.setAttribute(name, v);
  };
}
function attrFunctionNS(fullname, value) {
  return function () {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function _default(name, value) {
  var fullname = (0, _namespace.default)(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
}
},{"../namespace":"../node_modules/d3-tip/node_modules/d3-selection/src/namespace.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/window.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default(node) {
  return node.ownerDocument && node.ownerDocument.defaultView // node is a Node
  || node.document && node // node is a Window
  || node.defaultView; // node is a Document
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/style.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.styleValue = styleValue;
var _window = _interopRequireDefault(require("../window"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function styleRemove(name) {
  return function () {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, value, priority) {
  return function () {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction(name, value, priority) {
  return function () {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);else this.style.setProperty(name, v, priority);
  };
}
function _default(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || (0, _window.default)(node).getComputedStyle(node, null).getPropertyValue(name);
}
},{"../window":"../node_modules/d3-tip/node_modules/d3-selection/src/window.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/property.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function propertyRemove(name) {
  return function () {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function () {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function () {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];else this[name] = v;
  };
}
function _default(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/classed.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function (name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function (name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function (name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node),
    i = -1,
    n = names.length;
  while (++i < n) list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node),
    i = -1,
    n = names.length;
  while (++i < n) list.remove(names[i]);
}
function classedTrue(names) {
  return function () {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function () {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function () {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function _default(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()),
      i = -1,
      n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/text.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function textRemove() {
  this.textContent = "";
}
function textConstant(value) {
  return function () {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function () {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function _default(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/html.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function () {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function () {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function _default(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/raise.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}
function _default() {
  return this.each(raise);
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/lower.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function _default() {
  return this.each(lower);
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/append.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _creator = _interopRequireDefault(require("../creator"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _default(name) {
  var create = typeof name === "function" ? name : (0, _creator.default)(name);
  return this.select(function () {
    return this.appendChild(create.apply(this, arguments));
  });
}
},{"../creator":"../node_modules/d3-tip/node_modules/d3-selection/src/creator.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/insert.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _creator = _interopRequireDefault(require("../creator"));
var _selector = _interopRequireDefault(require("../selector"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function constantNull() {
  return null;
}
function _default(name, before) {
  var create = typeof name === "function" ? name : (0, _creator.default)(name),
    select = before == null ? constantNull : typeof before === "function" ? before : (0, _selector.default)(before);
  return this.select(function () {
    return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
  });
}
},{"../creator":"../node_modules/d3-tip/node_modules/d3-selection/src/creator.js","../selector":"../node_modules/d3-tip/node_modules/d3-selection/src/selector.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/remove.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}
function _default() {
  return this.each(remove);
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/clone.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function selection_cloneShallow() {
  var clone = this.cloneNode(false),
    parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true),
    parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function _default(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/datum.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/on.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.customEvent = customEvent;
exports.default = _default;
exports.event = void 0;
var filterEvents = {};
var event = exports.event = null;
if (typeof document !== "undefined") {
  var element = document.documentElement;
  if (!("onmouseenter" in element)) {
    filterEvents = {
      mouseenter: "mouseover",
      mouseleave: "mouseout"
    };
  }
}
function filterContextListener(listener, index, group) {
  listener = contextListener(listener, index, group);
  return function (event) {
    var related = event.relatedTarget;
    if (!related || related !== this && !(related.compareDocumentPosition(this) & 8)) {
      listener.call(this, event);
    }
  };
}
function contextListener(listener, index, group) {
  return function (event1) {
    var event0 = event; // Events can be reentrant (e.g., focus).
    exports.event = event = event1;
    try {
      listener.call(this, this.__data__, index, group);
    } finally {
      exports.event = event = event0;
    }
  };
}
function parseTypenames(typenames) {
  return typenames.trim().split(/^|\s+/).map(function (t) {
    var name = "",
      i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return {
      type: t,
      name: name
    };
  });
}
function onRemove(typename) {
  return function () {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.capture);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;else delete this.__on;
  };
}
function onAdd(typename, value, capture) {
  var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
  return function (d, i, group) {
    var on = this.__on,
      o,
      listener = wrap(value, i, group);
    if (on) for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.capture);
        this.addEventListener(o.type, o.listener = listener, o.capture = capture);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, capture);
    o = {
      type: typename.type,
      name: typename.name,
      value: value,
      listener: listener,
      capture: capture
    };
    if (!on) this.__on = [o];else on.push(o);
  };
}
function _default(typename, value, capture) {
  var typenames = parseTypenames(typename + ""),
    i,
    n = typenames.length,
    t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }
  on = value ? onAdd : onRemove;
  if (capture == null) capture = false;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
  return this;
}
function customEvent(event1, listener, that, args) {
  var event0 = event;
  event1.sourceEvent = event;
  exports.event = event = event1;
  try {
    return listener.apply(that, args);
  } finally {
    exports.event = event = event0;
  }
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/dispatch.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _window = _interopRequireDefault(require("../window"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function dispatchEvent(node, type, params) {
  var window = (0, _window.default)(node),
    event = window.CustomEvent;
  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window.document.createEvent("Event");
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;else event.initEvent(type, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type, params) {
  return function () {
    return dispatchEvent(this, type, params);
  };
}
function dispatchFunction(type, params) {
  return function () {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}
function _default(type, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
}
},{"../window":"../node_modules/d3-tip/node_modules/d3-selection/src/window.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/selection/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Selection = Selection;
exports.root = exports.default = void 0;
var _select = _interopRequireDefault(require("./select"));
var _selectAll = _interopRequireDefault(require("./selectAll"));
var _filter = _interopRequireDefault(require("./filter"));
var _data = _interopRequireDefault(require("./data"));
var _enter = _interopRequireDefault(require("./enter"));
var _exit = _interopRequireDefault(require("./exit"));
var _join = _interopRequireDefault(require("./join"));
var _merge = _interopRequireDefault(require("./merge"));
var _order = _interopRequireDefault(require("./order"));
var _sort = _interopRequireDefault(require("./sort"));
var _call = _interopRequireDefault(require("./call"));
var _nodes = _interopRequireDefault(require("./nodes"));
var _node = _interopRequireDefault(require("./node"));
var _size = _interopRequireDefault(require("./size"));
var _empty = _interopRequireDefault(require("./empty"));
var _each = _interopRequireDefault(require("./each"));
var _attr = _interopRequireDefault(require("./attr"));
var _style = _interopRequireDefault(require("./style"));
var _property = _interopRequireDefault(require("./property"));
var _classed = _interopRequireDefault(require("./classed"));
var _text = _interopRequireDefault(require("./text"));
var _html = _interopRequireDefault(require("./html"));
var _raise = _interopRequireDefault(require("./raise"));
var _lower = _interopRequireDefault(require("./lower"));
var _append = _interopRequireDefault(require("./append"));
var _insert = _interopRequireDefault(require("./insert"));
var _remove = _interopRequireDefault(require("./remove"));
var _clone = _interopRequireDefault(require("./clone"));
var _datum = _interopRequireDefault(require("./datum"));
var _on = _interopRequireDefault(require("./on"));
var _dispatch = _interopRequireDefault(require("./dispatch"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var root = exports.root = [null];
function Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection() {
  return new Selection([[document.documentElement]], root);
}
Selection.prototype = selection.prototype = {
  constructor: Selection,
  select: _select.default,
  selectAll: _selectAll.default,
  filter: _filter.default,
  data: _data.default,
  enter: _enter.default,
  exit: _exit.default,
  join: _join.default,
  merge: _merge.default,
  order: _order.default,
  sort: _sort.default,
  call: _call.default,
  nodes: _nodes.default,
  node: _node.default,
  size: _size.default,
  empty: _empty.default,
  each: _each.default,
  attr: _attr.default,
  style: _style.default,
  property: _property.default,
  classed: _classed.default,
  text: _text.default,
  html: _html.default,
  raise: _raise.default,
  lower: _lower.default,
  append: _append.default,
  insert: _insert.default,
  remove: _remove.default,
  clone: _clone.default,
  datum: _datum.default,
  on: _on.default,
  dispatch: _dispatch.default
};
var _default = exports.default = selection;
},{"./select":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/select.js","./selectAll":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/selectAll.js","./filter":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/filter.js","./data":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/data.js","./enter":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/enter.js","./exit":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/exit.js","./join":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/join.js","./merge":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/merge.js","./order":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/order.js","./sort":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/sort.js","./call":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/call.js","./nodes":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/nodes.js","./node":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/node.js","./size":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/size.js","./empty":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/empty.js","./each":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/each.js","./attr":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/attr.js","./style":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/style.js","./property":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/property.js","./classed":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/classed.js","./text":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/text.js","./html":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/html.js","./raise":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/raise.js","./lower":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/lower.js","./append":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/append.js","./insert":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/insert.js","./remove":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/remove.js","./clone":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/clone.js","./datum":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/datum.js","./on":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/on.js","./dispatch":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/dispatch.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/select.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _index = require("./selection/index");
function _default(selector) {
  return typeof selector === "string" ? new _index.Selection([[document.querySelector(selector)]], [document.documentElement]) : new _index.Selection([[selector]], _index.root);
}
},{"./selection/index":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/index.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/create.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _creator = _interopRequireDefault(require("./creator"));
var _select = _interopRequireDefault(require("./select"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _default(name) {
  return (0, _select.default)((0, _creator.default)(name).call(document.documentElement));
}
},{"./creator":"../node_modules/d3-tip/node_modules/d3-selection/src/creator.js","./select":"../node_modules/d3-tip/node_modules/d3-selection/src/select.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/local.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = local;
var nextId = 0;
function local() {
  return new Local();
}
function Local() {
  this._ = "@" + (++nextId).toString(36);
}
Local.prototype = local.prototype = {
  constructor: Local,
  get: function (node) {
    var id = this._;
    while (!(id in node)) if (!(node = node.parentNode)) return;
    return node[id];
  },
  set: function (node, value) {
    return node[this._] = value;
  },
  remove: function (node) {
    return this._ in node && delete node[this._];
  },
  toString: function () {
    return this._;
  }
};
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/sourceEvent.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _on = require("./selection/on");
function _default() {
  var current = _on.event,
    source;
  while (source = current.sourceEvent) current = source;
  return current;
}
},{"./selection/on":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/on.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/point.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
function _default(node, event) {
  var svg = node.ownerSVGElement || node;
  if (svg.createSVGPoint) {
    var point = svg.createSVGPoint();
    point.x = event.clientX, point.y = event.clientY;
    point = point.matrixTransform(node.getScreenCTM().inverse());
    return [point.x, point.y];
  }
  var rect = node.getBoundingClientRect();
  return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
}
},{}],"../node_modules/d3-tip/node_modules/d3-selection/src/mouse.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _sourceEvent = _interopRequireDefault(require("./sourceEvent"));
var _point = _interopRequireDefault(require("./point"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _default(node) {
  var event = (0, _sourceEvent.default)();
  if (event.changedTouches) event = event.changedTouches[0];
  return (0, _point.default)(node, event);
}
},{"./sourceEvent":"../node_modules/d3-tip/node_modules/d3-selection/src/sourceEvent.js","./point":"../node_modules/d3-tip/node_modules/d3-selection/src/point.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/selectAll.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _index = require("./selection/index");
function _default(selector) {
  return typeof selector === "string" ? new _index.Selection([document.querySelectorAll(selector)], [document.documentElement]) : new _index.Selection([selector == null ? [] : selector], _index.root);
}
},{"./selection/index":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/index.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/touch.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _sourceEvent = _interopRequireDefault(require("./sourceEvent"));
var _point = _interopRequireDefault(require("./point"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _default(node, touches, identifier) {
  if (arguments.length < 3) identifier = touches, touches = (0, _sourceEvent.default)().changedTouches;
  for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
    if ((touch = touches[i]).identifier === identifier) {
      return (0, _point.default)(node, touch);
    }
  }
  return null;
}
},{"./sourceEvent":"../node_modules/d3-tip/node_modules/d3-selection/src/sourceEvent.js","./point":"../node_modules/d3-tip/node_modules/d3-selection/src/point.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/touches.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _sourceEvent = _interopRequireDefault(require("./sourceEvent"));
var _point = _interopRequireDefault(require("./point"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _default(node, touches) {
  if (touches == null) touches = (0, _sourceEvent.default)().touches;
  for (var i = 0, n = touches ? touches.length : 0, points = new Array(n); i < n; ++i) {
    points[i] = (0, _point.default)(node, touches[i]);
  }
  return points;
}
},{"./sourceEvent":"../node_modules/d3-tip/node_modules/d3-selection/src/sourceEvent.js","./point":"../node_modules/d3-tip/node_modules/d3-selection/src/point.js"}],"../node_modules/d3-tip/node_modules/d3-selection/src/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "clientPoint", {
  enumerable: true,
  get: function () {
    return _point.default;
  }
});
Object.defineProperty(exports, "create", {
  enumerable: true,
  get: function () {
    return _create.default;
  }
});
Object.defineProperty(exports, "creator", {
  enumerable: true,
  get: function () {
    return _creator.default;
  }
});
Object.defineProperty(exports, "customEvent", {
  enumerable: true,
  get: function () {
    return _on.customEvent;
  }
});
Object.defineProperty(exports, "event", {
  enumerable: true,
  get: function () {
    return _on.event;
  }
});
Object.defineProperty(exports, "local", {
  enumerable: true,
  get: function () {
    return _local.default;
  }
});
Object.defineProperty(exports, "matcher", {
  enumerable: true,
  get: function () {
    return _matcher.default;
  }
});
Object.defineProperty(exports, "mouse", {
  enumerable: true,
  get: function () {
    return _mouse.default;
  }
});
Object.defineProperty(exports, "namespace", {
  enumerable: true,
  get: function () {
    return _namespace.default;
  }
});
Object.defineProperty(exports, "namespaces", {
  enumerable: true,
  get: function () {
    return _namespaces.default;
  }
});
Object.defineProperty(exports, "select", {
  enumerable: true,
  get: function () {
    return _select.default;
  }
});
Object.defineProperty(exports, "selectAll", {
  enumerable: true,
  get: function () {
    return _selectAll.default;
  }
});
Object.defineProperty(exports, "selection", {
  enumerable: true,
  get: function () {
    return _index.default;
  }
});
Object.defineProperty(exports, "selector", {
  enumerable: true,
  get: function () {
    return _selector.default;
  }
});
Object.defineProperty(exports, "selectorAll", {
  enumerable: true,
  get: function () {
    return _selectorAll.default;
  }
});
Object.defineProperty(exports, "style", {
  enumerable: true,
  get: function () {
    return _style.styleValue;
  }
});
Object.defineProperty(exports, "touch", {
  enumerable: true,
  get: function () {
    return _touch.default;
  }
});
Object.defineProperty(exports, "touches", {
  enumerable: true,
  get: function () {
    return _touches.default;
  }
});
Object.defineProperty(exports, "window", {
  enumerable: true,
  get: function () {
    return _window.default;
  }
});
var _create = _interopRequireDefault(require("./create"));
var _creator = _interopRequireDefault(require("./creator"));
var _local = _interopRequireDefault(require("./local"));
var _matcher = _interopRequireDefault(require("./matcher"));
var _mouse = _interopRequireDefault(require("./mouse"));
var _namespace = _interopRequireDefault(require("./namespace"));
var _namespaces = _interopRequireDefault(require("./namespaces"));
var _point = _interopRequireDefault(require("./point"));
var _select = _interopRequireDefault(require("./select"));
var _selectAll = _interopRequireDefault(require("./selectAll"));
var _index = _interopRequireDefault(require("./selection/index"));
var _selector = _interopRequireDefault(require("./selector"));
var _selectorAll = _interopRequireDefault(require("./selectorAll"));
var _style = require("./selection/style");
var _touch = _interopRequireDefault(require("./touch"));
var _touches = _interopRequireDefault(require("./touches"));
var _window = _interopRequireDefault(require("./window"));
var _on = require("./selection/on");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
},{"./create":"../node_modules/d3-tip/node_modules/d3-selection/src/create.js","./creator":"../node_modules/d3-tip/node_modules/d3-selection/src/creator.js","./local":"../node_modules/d3-tip/node_modules/d3-selection/src/local.js","./matcher":"../node_modules/d3-tip/node_modules/d3-selection/src/matcher.js","./mouse":"../node_modules/d3-tip/node_modules/d3-selection/src/mouse.js","./namespace":"../node_modules/d3-tip/node_modules/d3-selection/src/namespace.js","./namespaces":"../node_modules/d3-tip/node_modules/d3-selection/src/namespaces.js","./point":"../node_modules/d3-tip/node_modules/d3-selection/src/point.js","./select":"../node_modules/d3-tip/node_modules/d3-selection/src/select.js","./selectAll":"../node_modules/d3-tip/node_modules/d3-selection/src/selectAll.js","./selection/index":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/index.js","./selector":"../node_modules/d3-tip/node_modules/d3-selection/src/selector.js","./selectorAll":"../node_modules/d3-tip/node_modules/d3-selection/src/selectorAll.js","./selection/style":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/style.js","./touch":"../node_modules/d3-tip/node_modules/d3-selection/src/touch.js","./touches":"../node_modules/d3-tip/node_modules/d3-selection/src/touches.js","./window":"../node_modules/d3-tip/node_modules/d3-selection/src/window.js","./selection/on":"../node_modules/d3-tip/node_modules/d3-selection/src/selection/on.js"}],"../node_modules/d3-tip/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _d3Collection = require("d3-collection");
var _d3Selection = require("d3-selection");
/**
 * d3.tip
 * Copyright (c) 2013-2017 Justin Palmer
 *
 * Tooltips for d3.js SVG visualizations
 */
// eslint-disable-next-line no-extra-semi

// Public - constructs a new tooltip
//
// Returns a tip
function _default() {
  var direction = d3TipDirection,
    offset = d3TipOffset,
    html = d3TipHTML,
    rootElement = document.body,
    node = initNode(),
    svg = null,
    point = null,
    target = null;
  function tip(vis) {
    svg = getSVGNode(vis);
    if (!svg) return;
    point = svg.createSVGPoint();
    rootElement.appendChild(node);
  }

  // Public - show the tooltip on the screen
  //
  // Returns a tip
  tip.show = function () {
    var args = Array.prototype.slice.call(arguments);
    if (args[args.length - 1] instanceof SVGElement) target = args.pop();
    var content = html.apply(this, args),
      poffset = offset.apply(this, args),
      dir = direction.apply(this, args),
      nodel = getNodeEl(),
      i = directions.length,
      coords,
      scrollTop = document.documentElement.scrollTop || rootElement.scrollTop,
      scrollLeft = document.documentElement.scrollLeft || rootElement.scrollLeft;
    nodel.html(content).style('opacity', 1).style('pointer-events', 'all');
    while (i--) nodel.classed(directions[i], false);
    coords = directionCallbacks.get(dir).apply(this);
    nodel.classed(dir, true).style('top', coords.top + poffset[0] + scrollTop + 'px').style('left', coords.left + poffset[1] + scrollLeft + 'px');
    return tip;
  };

  // Public - hide the tooltip
  //
  // Returns a tip
  tip.hide = function () {
    var nodel = getNodeEl();
    nodel.style('opacity', 0).style('pointer-events', 'none');
    return tip;
  };

  // Public: Proxy attr calls to the d3 tip container.
  // Sets or gets attribute value.
  //
  // n - name of the attribute
  // v - value of the attribute
  //
  // Returns tip or attribute value
  // eslint-disable-next-line no-unused-vars
  tip.attr = function (n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return getNodeEl().attr(n);
    }
    var args = Array.prototype.slice.call(arguments);
    _d3Selection.selection.prototype.attr.apply(getNodeEl(), args);
    return tip;
  };

  // Public: Proxy style calls to the d3 tip container.
  // Sets or gets a style value.
  //
  // n - name of the property
  // v - value of the property
  //
  // Returns tip or style property value
  // eslint-disable-next-line no-unused-vars
  tip.style = function (n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return getNodeEl().style(n);
    }
    var args = Array.prototype.slice.call(arguments);
    _d3Selection.selection.prototype.style.apply(getNodeEl(), args);
    return tip;
  };

  // Public: Set or get the direction of the tooltip
  //
  // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
  //     sw(southwest), ne(northeast) or se(southeast)
  //
  // Returns tip or direction
  tip.direction = function (v) {
    if (!arguments.length) return direction;
    direction = v == null ? v : functor(v);
    return tip;
  };

  // Public: Sets or gets the offset of the tip
  //
  // v - Array of [x, y] offset
  //
  // Returns offset or
  tip.offset = function (v) {
    if (!arguments.length) return offset;
    offset = v == null ? v : functor(v);
    return tip;
  };

  // Public: sets or gets the html value of the tooltip
  //
  // v - String value of the tip
  //
  // Returns html value or tip
  tip.html = function (v) {
    if (!arguments.length) return html;
    html = v == null ? v : functor(v);
    return tip;
  };

  // Public: sets or gets the root element anchor of the tooltip
  //
  // v - root element of the tooltip
  //
  // Returns root node of tip
  tip.rootElement = function (v) {
    if (!arguments.length) return rootElement;
    rootElement = v == null ? v : functor(v);
    return tip;
  };

  // Public: destroys the tooltip and removes it from the DOM
  //
  // Returns a tip
  tip.destroy = function () {
    if (node) {
      getNodeEl().remove();
      node = null;
    }
    return tip;
  };
  function d3TipDirection() {
    return 'n';
  }
  function d3TipOffset() {
    return [0, 0];
  }
  function d3TipHTML() {
    return ' ';
  }
  var directionCallbacks = (0, _d3Collection.map)({
      n: directionNorth,
      s: directionSouth,
      e: directionEast,
      w: directionWest,
      nw: directionNorthWest,
      ne: directionNorthEast,
      sw: directionSouthWest,
      se: directionSouthEast
    }),
    directions = directionCallbacks.keys();
  function directionNorth() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.n.y - node.offsetHeight,
      left: bbox.n.x - node.offsetWidth / 2
    };
  }
  function directionSouth() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.s.y,
      left: bbox.s.x - node.offsetWidth / 2
    };
  }
  function directionEast() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.e.y - node.offsetHeight / 2,
      left: bbox.e.x
    };
  }
  function directionWest() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.w.y - node.offsetHeight / 2,
      left: bbox.w.x - node.offsetWidth
    };
  }
  function directionNorthWest() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.nw.y - node.offsetHeight,
      left: bbox.nw.x - node.offsetWidth
    };
  }
  function directionNorthEast() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.ne.y - node.offsetHeight,
      left: bbox.ne.x
    };
  }
  function directionSouthWest() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.sw.y,
      left: bbox.sw.x - node.offsetWidth
    };
  }
  function directionSouthEast() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.se.y,
      left: bbox.se.x
    };
  }
  function initNode() {
    var div = (0, _d3Selection.select)(document.createElement('div'));
    div.style('position', 'absolute').style('top', 0).style('opacity', 0).style('pointer-events', 'none').style('box-sizing', 'border-box');
    return div.node();
  }
  function getSVGNode(element) {
    var svgNode = element.node();
    if (!svgNode) return null;
    if (svgNode.tagName.toLowerCase() === 'svg') return svgNode;
    return svgNode.ownerSVGElement;
  }
  function getNodeEl() {
    if (node == null) {
      node = initNode();
      // re-add node to DOM
      rootElement.appendChild(node);
    }
    return (0, _d3Selection.select)(node);
  }

  // Private - gets the screen coordinates of a shape
  //
  // Given a shape on the screen, will return an SVGPoint for the directions
  // n(north), s(south), e(east), w(west), ne(northeast), se(southeast),
  // nw(northwest), sw(southwest).
  //
  //    +-+-+
  //    |   |
  //    +   +
  //    |   |
  //    +-+-+
  //
  // Returns an Object {n, s, e, w, nw, sw, ne, se}
  function getScreenBBox(targetShape) {
    var targetel = target || targetShape;
    while (targetel.getScreenCTM == null && targetel.parentNode != null) {
      targetel = targetel.parentNode;
    }
    var bbox = {},
      matrix = targetel.getScreenCTM(),
      tbbox = targetel.getBBox(),
      width = tbbox.width,
      height = tbbox.height,
      x = tbbox.x,
      y = tbbox.y;
    point.x = x;
    point.y = y;
    bbox.nw = point.matrixTransform(matrix);
    point.x += width;
    bbox.ne = point.matrixTransform(matrix);
    point.y += height;
    bbox.se = point.matrixTransform(matrix);
    point.x -= width;
    bbox.sw = point.matrixTransform(matrix);
    point.y -= height / 2;
    bbox.w = point.matrixTransform(matrix);
    point.x += width;
    bbox.e = point.matrixTransform(matrix);
    point.x -= width / 2;
    point.y -= height / 2;
    bbox.n = point.matrixTransform(matrix);
    point.y += height;
    bbox.s = point.matrixTransform(matrix);
    return bbox;
  }

  // Private - replace D3JS 3.X d3.functor() function
  function functor(v) {
    return typeof v === 'function' ? v : function () {
      return v;
    };
  }
  return tip;
}
},{"d3-collection":"../node_modules/d3-collection/src/index.js","d3-selection":"../node_modules/d3-tip/node_modules/d3-selection/src/index.js"}],"viz3-scripts/viz3-preprocess.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDataPerTimeInterval = getDataPerTimeInterval;
exports.getMarketPerTimeInterval = getMarketPerTimeInterval;
exports.reduceNumberOfLine = reduceNumberOfLine;
exports.stackData = stackData;
var _helper = require("../scripts/helper.js");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
  var floor = Math.floor((movieLength - 60) / interval_size) * interval_size + 60;
  return "".concat(floor, "-").concat(floor + interval_size);
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
function getDataPerTimeInterval(data, intervalsLenght, selectedMetric) {
  var res = {};

  // We do the process for a tmp dict with key = only the year
  var tmp = {};
  var _iterator = _createForOfIteratorHelper(data),
    _step;
  try {
    var _loop2 = function _loop2() {
      var movie = _step.value;
      var year = movie.year;
      if (!tmp[year]) {
        tmp[year] = {
          totalMetric: 0,
          metricPerGenre: {},
          metricsPerMovieLenght: {},
          metricsPerCertificate: {}
        };
      }

      // Add the movie contribution to this year
      var yearElem = tmp[year];
      var metric = null;
      if (selectedMetric === "box_office") {
        if (typeof movie.box_office === "number") {
          metric = movie.box_office;
        } else {
          metric = 0;
        }
      }
      if (selectedMetric === "rating") metric = 1; // for rating, we just count the number of movies in the interval

      if (selectedMetric === "profit") {
        if (typeof movie.profit === "number") {
          metric = movie.profit;
        } else {
          metric = 0;
        }
      }
      if (selectedMetric === "numNominations") {
        var ggNomination = movie.goldenGlobesData ? movie.goldenGlobesData.goldenGlobesNominations ? typeof movie.goldenGlobesData.goldenGlobesNominations === "number" ? movie.goldenGlobesData.goldenGlobesNominations : 0 : 0 : 0;
        var oscarNomination = movie.oscarsData ? movie.oscarsData.oscarNominations ? typeof movie.oscarsData.oscarNominations === "number" ? movie.oscarsData.oscarNominations : 0 : 0 : 0;
        metric = ggNomination + oscarNomination;
      }
      if (movie.box_office) {
        yearElem.totalMetric += metric;
      }
      movie.genre.forEach(function (genre) {
        if (!yearElem.metricPerGenre[genre]) yearElem.metricPerGenre[genre] = 0;
        yearElem.metricPerGenre[genre] += metric;
      });
      var movieLength = (0, _helper.parseRuntime)(movie.run_time);
      if (movieLength) {
        var lengthInterval = getMovieLengthInterval(movieLength, 5);
        if (!yearElem.metricsPerMovieLenght[lengthInterval]) yearElem.metricsPerMovieLenght[lengthInterval] = 0;
        yearElem.metricsPerMovieLenght[lengthInterval] += metric;
      }
      if (movie.certificate) {
        if (!yearElem.metricsPerCertificate[movie.certificate]) yearElem.metricsPerCertificate[movie.certificate] = 0;
        yearElem.metricsPerCertificate[movie.certificate] += metric;
      }
    };
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop2();
    }

    // Now we need to reduce the tmp dict by grouping the years by intervals
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var _loop = function _loop() {
    var yearElem = tmp[year];
    var interval = "[".concat(Math.floor(year / intervalsLenght) * intervalsLenght, ", ").concat(Math.floor(year / intervalsLenght) * intervalsLenght + intervalsLenght, "]");
    if (!res[interval]) {
      res[interval] = {
        totalMetric: 0,
        metricPerGenre: {},
        metricsPerMovieLenght: {},
        metricsPerCertificate: {}
      };
    }
    var res_elem = res[interval];
    res_elem.totalMetric += yearElem.totalMetric;
    Object.keys(yearElem.metricPerGenre).forEach(function (genre) {
      if (!res_elem.metricPerGenre[genre]) res_elem.metricPerGenre[genre] = 0;
      res_elem.metricPerGenre[genre] += yearElem.metricPerGenre[genre];
    });
    Object.keys(yearElem.metricsPerMovieLenght).forEach(function (lengthInterval) {
      if (!res_elem.metricsPerMovieLenght[lengthInterval]) res_elem.metricsPerMovieLenght[lengthInterval] = 0;
      res_elem.metricsPerMovieLenght[lengthInterval] += yearElem.metricsPerMovieLenght[lengthInterval];
    });
    Object.keys(yearElem.metricsPerCertificate).forEach(function (certificate) {
      if (!res_elem.metricsPerCertificate[certificate]) res_elem.metricsPerCertificate[certificate] = 0;
      res_elem.metricsPerCertificate[certificate] += yearElem.metricsPerCertificate[certificate];
    });
  };
  for (var year in tmp) {
    _loop();
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

function getMarketPerTimeInterval(intervalData, selectedFilter) {
  var res = {};
  var _loop3 = function _loop3() {
    var intervalElem = intervalData[interval];
    res[interval] = {
      metricForfilter: {}
    };
    var res_elem = res[interval];

    // On normalise les valeurs par rapport à la somme des valeurs de chaque intervalle

    // Par exemple si on a prix la métrique "profit", les valeurs de profits peuvent être négatives, donc pour chaque intervalle on calcule le min et si il est négatif on l'ajoute à chaque valeur de l'intervalle pour que toutes les valeurs soient positives.

    if (selectedFilter === "genre") {
      // Calcule du min :
      var minG = Math.min.apply(Math, _toConsumableArray(Object.values(intervalElem.metricPerGenre)));
      if (minG < 0) Object.keys(intervalElem.metricPerGenre).forEach(function (genre) {
        intervalElem.metricPerGenre[genre] += -minG;
      });
      var sum_genre_metric = Object.values(intervalElem.metricPerGenre).reduce(function (acc, val) {
        return acc + val;
      }, 0);
      Object.keys(intervalElem.metricPerGenre).forEach(function (genre) {
        res_elem.metricForfilter[genre] = intervalElem.metricPerGenre[genre] / sum_genre_metric;
      });
    }
    if (selectedFilter === "movieLength") {
      var minML = Math.min.apply(Math, _toConsumableArray(Object.values(intervalElem.metricsPerMovieLenght)));
      if (minML < 0) Object.keys(intervalElem.metricsPerMovieLenght).forEach(function (lengthInterval) {
        intervalElem.metricsPerMovieLenght[lengthInterval] += -minML;
      });
      var sum_lenght_metric = Object.values(intervalElem.metricsPerMovieLenght).reduce(function (acc, val) {
        return acc + val;
      }, 0);
      Object.keys(intervalElem.metricsPerMovieLenght).forEach(function (lengthInterval) {
        res_elem.metricForfilter[lengthInterval] = intervalElem.metricsPerMovieLenght[lengthInterval] / sum_lenght_metric;
      });
    }
    if (selectedFilter === "certificate") {
      var minC = Math.min.apply(Math, _toConsumableArray(Object.values(intervalElem.metricsPerCertificate)));
      if (minC < 0) Object.keys(intervalElem.metricsPerCertificate).forEach(function (certificate) {
        intervalElem.metricsPerCertificate[certificate] += -minC;
      });
      var sum_certificate_metric = Object.values(intervalElem.metricsPerCertificate).reduce(function (acc, val) {
        return acc + val;
      }, 0);
      Object.keys(intervalElem.metricsPerCertificate).forEach(function (certificate) {
        res_elem.metricForfilter[certificate] = intervalElem.metricsPerCertificate[certificate] / sum_certificate_metric;
      });
    }
  };
  for (var interval in intervalData) {
    _loop3();
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

function reduceNumberOfLine(marketData, maxLines) {
  var res = {
    "presentCategory": [],
    "intervals": {}
  };
  var _loop4 = function _loop4() {
    var intervalElem = marketData[interval];
    var res_elem = res["intervals"][interval] = {
      metricForfilter: {}
    };

    // Sort the genres by value
    var sortedGenres = Object.entries(intervalElem.metricForfilter).sort(function (a, b) {
      return b[1] - a[1];
    });

    // Keep only the first maxLines elements and group the others in "Other"
    var topGenres = sortedGenres.slice(0, maxLines - 1);
    var otherGenres = sortedGenres.slice(maxLines - 1);
    topGenres.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        genre = _ref2[0],
        value = _ref2[1];
      res_elem.metricForfilter[genre] = value;
      res["presentCategory"].push(genre);
    });

    // Add the "Other" category
    res_elem.metricForfilter["Other"] = otherGenres.reduce(function (acc, _ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
        _ = _ref4[0],
        value = _ref4[1];
      return acc + value;
    }, 0);
  };
  for (var interval in marketData) {
    _loop4();
  }

  // Remove duplicates from presentCategory
  res["presentCategory"] = _toConsumableArray(new Set(res["presentCategory"]));
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

function stackData(marketDataSmall) {
  return Object.entries(marketDataSmall.intervals).map(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
      interval = _ref6[0],
      data = _ref6[1];
    var row = {
      interval: interval
    };
    marketDataSmall.presentCategory.forEach(function (cat) {
      row[cat] = data.metricForfilter[cat] || 0;
    });
    return row;
  });
}
},{"../scripts/helper.js":"scripts/helper.js"}],"viz3-scripts/viz3-helper.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appendAxes = appendAxes;
exports.appendGraphLabels = appendGraphLabels;
exports.drawXAxis = drawXAxis;
exports.drawYAxis = drawYAxis;
exports.generateG = generateG;
exports.positionLabels = positionLabels;
exports.setCanvasSize = setCanvasSize;
/**
 * Generates a specific <g> container inside a given SVG container.
 *
 * @param {string} svgSelector The selector of the SVG container (e.g. ".viz1-svg" or ".film-impact-svg")
 * @param {object} margin The desired margins around the graph
 * @param {string} id Optional ID or class for the <g> container
 * @returns {*} The d3 Selection for the created g element
 */
function generateG(svgSelector, margin) {
  var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var g = svgSelector.append('g').attr('transform', "translate(".concat(margin.left, ",").concat(margin.top, ")"));
  if (id) {
    g.attr('id', id);
  }
  return g;
}

/**
 * Sets the size of the SVG canvas containing the graph.
 *
 * @param {number} width The desired width
 * @param {number} height The desired height
 */
function setCanvasSize(width, height) {
  d3.select('.tendance-timeline-svg').attr('width', width).attr('height', height);
}

/**
 * Appends an SVG g element which will contain the axes.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
function appendAxes(g) {
  g.append('g').attr('class', 'x3 axis');
  g.append('g').attr('class', 'y3 axis');
}
/**
 * Appends the labels for the the y axis and the title of the graph.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
function appendGraphLabels(g) {
  g.append('text').text('Distribution du marché (de 0 à 100%)').attr('class', 'y axis-text').attr('transform', 'rotate(-90)').attr('font-size', 12);
  g.append('text').text('Années').attr('class', 'x axis-text').attr('font-size', 12);
}

/**
* Positions the x axis label and y axis label.
*
* @param {*} g The d3 Selection of the graph's g SVG element
* @param {number} width The width of the graph
* @param {number} height The height of the graph
*/
function positionLabels(g, width, height) {
  // TODO : Position axis labels
  g.select('.x.axis-text').attr('transform', 'translate(' + width / 2 + ', ' + (height + 50) + ')'); // On décale le label x à la moitié de la largeur

  g.select('.y.axis-text').attr('transform', 'translate(-50, ' + height / 2 + ')rotate(-90)'); // On décale le label x à la moitié de la hauteur
}

/**
 * Draws the X axis at the bottom of the diagram.
 *
 * @param {*} xScale The scale to use to draw the axis
 * @param {number} height The height of the graphic
 */
function drawXAxis(xScale, height, intervals) {
  var tickStep = Math.ceil(intervals.length / 12);
  var filteredTicks = intervals.filter(function (_, i) {
    return i % tickStep === 0;
  });
  d3.select('.x3.axis').attr('transform', 'translate( 0, ' + height + ')').call(d3.axisBottom(xScale).tickValues(filteredTicks).tickFormat(function (d) {
    return d;
  }));
  // .tickSizeOuter(0)
  // .ticks(10)
  // .tickFormat(d3.format("d")));
}

/**
 * Draws the Y axis to the left of the diagram.
 *
 * @param {*} yScale The scale to use to draw the axis
 */
function drawYAxis(yScale) {
  d3.select('.y3.axis').call(d3.axisLeft(yScale).tickSizeOuter(0).ticks(10).tickFormat(d3.format(".2f")));
}
},{}],"viz3-scripts/viz3-scales.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setXScale = setXScale;
exports.setYScale = setYScale;
/**
 *
 *
 * @param {number} width The width of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in X
 */
function setXScale(width, intervals) {
  // TODO : Set scale

  var xScale = d3.scaleBand().domain(intervals) // Les intervalles deviennent les domaines
  .range([0, width]).padding(0);
  return xScale;
}

/**
 *
 *
 * @param {number} height The height of the graph
 * @returns {*} The linear scale in Y
 */
function setYScale(height) {
  var yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);
  return yScale;
}
},{}],"viz3-scripts/viz3-legend.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createLegend = createLegend;
function createLegend(viz3MarketPerIntervalSmall, legendDiv, colorScale) {
  // Ajouter les noms associés aux couleurs dans la légende -> insérer dans legendDiv
  viz3MarketPerIntervalSmall.presentCategory.forEach(function (cat) {
    var item = legendDiv.append("div").style("display", "flex").style("align-items", "center");
    item.append("div").style("width", "30px").style("height", "15px").style("background-color", colorScale(cat)).style("margin-right", "5px");
    item.append("span").text(cat).style("font-size", "12px");
  });
}
},{}],"viz3-scripts/viz3-tooltip.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getContents = getContents;
exports.setRectHoverHandler = setRectHoverHandler;
/**
 * Defines the contents of the tooltip. See CSS for tooltip styling.
 * The tooltip features the movie name, box office, total nominations,
 * rank, and release year.
 *
 * @param {object} d The data associated to the hovered element
 * @returns {string} The tooltip contents
 */
function getContents(d, colorScale) {
  return "<div class=\"tooltip-value\" style=\"\n      z-index: 6;\n      background: linear-gradient(90deg,rgb(143, 143, 143) 0%,rgba(166, 166, 166, 0.4) 100%);\n      padding: 12px;\n      border-radius: 6px;\n      color: white;\n      backdrop-filter: blur(5px);\n      box-shadow: 1px -1px 10px 0px rgba(0, 0, 0, 0.3);\n      border-top : 1px solid ".concat(colorScale(d.category), ";\n      \"\n  >\n    <div style=\"margin: 4px 0; color: ").concat(colorScale(d.category), "; filter : brightness(1.5);\">\n      <strong>\uD83C\uDFAC Cat\xE9gorie : </strong>").concat(d.category, "\n    </div>\n    <div style=\"margin: 4px 0;\">\n      <strong>\uD83D\uDCCA Part de march\xE9 : </strong> ").concat(((d[1] - d[0]) * 100).toFixed(2), "%\n    </div>\n    <div style=\"margin: 4px 0;\">\n      <strong>\uD83D\uDCC5 Date : </strong> ").concat(d.data.interval, "\n    </div>\n  </div>\n  ");
}

/**
 * Sets up the hover event handler. The tooltip should show on on hover.
 *
 * @param {*} tip The tooltip
 */
function setRectHoverHandler(g, tip) {
  // TODO : Set hover handler. The tooltip shows on
  // hover and the opacity goes up to 100% (from 70%)

  g.selectAll('.rect3').on('mouseover', function (e, d) {
    // Quand la souris passe dessus
    d3.select(this).style('opacity', 0.8).style('cursor', 'pointer');
    tip.show(d, this); // On montre le tip 
  }).on('mouseout', function (e, d) {
    // Quand la souris sort
    d3.select(this).style('opacity', 1); // Opacité -> 70%
    tip.hide(d, this); // On cache le tip 
  });
}
},{}],"viz3-scripts/viz3-example.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.phraseExemple = phraseExemple;
exports.selectRandomRectangle = selectRandomRectangle;
// Fonction pour sélectionner un rectangle au hasard et afficher ses infos

function selectRandomRectangle() {
  // Sélectionner tous les rectangles de la visualisation 3
  var rectangles = d3.selectAll(".bars .rect3").nodes();
  if (rectangles.length === 0) {
    console.log("Aucun rectangle trouvé dans la visualisation 3.");
    return;
  }
  var filteredRectangles = rectangles.filter(function (rect) {
    var rectData = d3.select(rect).datum();
    return rectData[1] - rectData[0] > 0.1; // Condition
  });

  // Choisir un rectangle au hasard
  var randomIndex = Math.floor(Math.random() * filteredRectangles.length);
  var randomRect = filteredRectangles[randomIndex];
  randomRect.setAttribute("stroke", "black");
  randomRect.setAttribute("stroke-width", "2");
  randomRect.setAttribute("stroke-dasharray", "4,2");
  randomRect.parentNode.appendChild(randomRect);
  randomRect.parentNode.parentNode.appendChild(randomRect.parentNode);

  // Récupérer les données associées au rectangle
  var rectData = d3.select(randomRect).datum();
  return {
    category: rectData.category,
    interval: rectData.data.interval,
    proportion: "".concat(((rectData[1] - rectData[0]) * 100).toFixed(2), "%")
  };
}
function phraseExemple(dataExample, colorScale) {
  var partsOfInterval = dataExample.interval.replace("[", "").replace("]", "").split(",");
  var startYear = partsOfInterval[0].trim();
  var endYear = partsOfInterval[1].trim();
  var ExempleLecture = "\n    <div class=\"exempleViz3\">\n        Exemple de Lecture : Entre <strong>".concat(startYear, "</strong> et <strong>").concat(endYear, "</strong>, la cat\xE9gorie <strong style=\"color : ").concat(colorScale(dataExample.category), "\">").concat(dataExample.category, "</strong> repr\xE9sentait <strong>").concat(dataExample.proportion, "</strong> du march\xE9.\n    </div>");
  return ExempleLecture;
}
},{}],"viz4-scripts/viz4-helper.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appendAxes = appendAxes;
exports.appendGraphLabels = appendGraphLabels;
exports.drawXAxis = drawXAxis;
exports.drawYAxis = drawYAxis;
exports.margeG = margeG;
exports.positionLabels = positionLabels;
exports.setCanvasSize = setCanvasSize;
/**
 * Generates the SVG element g which will contain the data visualisation.
 *
 * @param {object} margin The desired margins around the graph
 * @returns {*} The d3 Selection for the created g element
 */
function margeG(g, margin) {
  g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
}

/**
 * Sets the size of the SVG canvas containing the graph.
 *
 * @param {number} width The desired width
 * @param {number} height The desired height
 */
function setCanvasSize(width, height) {
  d3.select('.film-impact-svg').attr('width', width).attr('height', height);
}

/**
 * Appends an SVG g element which will contain the axes.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
function appendAxes(g) {
  g.append('g').attr('class', 'x axis');
  g.append('g').attr('class', 'y axis');
}
/**
 * Appends the labels for the the y axis and the title of the graph.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
function appendGraphLabels(g) {
  g.append('text').text('%').attr('class', 'y axis-text').attr('transform', 'rotate(-90)').attr('font-size', 12);
  g.append('text').text('Année').attr('class', 'x axis-text').attr('font-size', 12);
}

/**
* Positions the x axis label and y axis label.
*
* @param {*} g The d3 Selection of the graph's g SVG element
* @param {number} width The width of the graph
* @param {number} height The height of the graph
*/
function positionLabels(g, width, height) {
  // TODO : Position axis labels
  g.select('.x.axis-text').attr('transform', 'translate(' + width / 2 + ', ' + (height + 50) + ')'); // On décale le label x à la moitié de la largeur

  g.select('.y.axis-text').attr('transform', 'translate(-50, ' + height / 2 + ')rotate(-90)'); // On décale le label x à la moitié de la hauteur
}

/**
 * Draws the X axis at the bottom of the diagram.
 *
 * @param {*} xScale The scale to use to draw the axis
 * @param {number} height The height of the graphic
 */
function drawXAxis(xScale, height) {
  d3.select('.x.axis').attr('transform', 'translate( 0, ' + height + ')').call(d3.axisBottom(xScale).tickSizeOuter(0).ticks(10).tickFormat(d3.format("d")));
}

/**
 * Draws the Y axis to the left of the diagram.
 *
 * @param {*} yScale The scale to use to draw the axis
 */
function drawYAxis(yScale) {
  d3.select('.y.axis').call(d3.axisLeft(yScale).tickSizeOuter(0).ticks(5).tickFormat(d3.format("~s")));
}
},{}],"viz4-scripts/viz4-search.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initFilmList = initFilmList;
exports.updateFilmList = updateFilmList;
// Initialize the film list
function initFilmList(filmArray) {
  var filmData = d3.map(filmArray, function (d) {
    return String(d.name);
  }).sort();

  // Initial render of all films
  updateFilmList(filmData);

  // Set up search input event listener
  d3.select("#search-input").on("input", function () {
    var searchTerm = this.value.toLowerCase();
    if (searchTerm === "") {
      updateFilmList(filmData);
    } else {
      var filteredFilms = filmData.filter(function (film) {
        return film.toLowerCase().includes(searchTerm);
      });
      updateFilmList(filteredFilms);
    }
  });
}

// Update the displayed film list
function updateFilmList(films) {
  var list = d3.select("#movie-list");
  list.selectAll("*").remove();
  if (films.length === 0) {
    list.append("li").style("color", "#999").style("font-style", "italic").style("padding", "8px 12px").style("border-bottom", "1px solid #eee").text("Aucun film trouvé");
  } else {
    // Create all list items
    list.selectAll("li").data(films).enter().append("li").style("padding", "8px 12px").style("border-bottom", "1px solid #eee").style("cursor", "pointer").text(function (d) {
      return d;
    }).on("click", function (_, d) {
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
  list.style("display", "block").style("max-height", "100px") // Fixed height for scrolling
  .style("overflow-y", "auto"); // Enable vertical scroll

  // Remove border from last item
  list.selectAll("li:last-child").style("border-bottom", "none");
}
},{}],"viz4-scripts/viz4-scales.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setColorScale = setColorScale;
exports.setXScale = setXScale;
exports.setYScaleBO = setYScaleBO;
exports.setYScaleMesureSucces = setYScaleMesureSucces;
/**
 * Defines the log scale used to position the center of the circles in X.
 *
 * @param {number} width The width of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in X
 */
function setXScale(width, data) {
  // TODO : Set scale

  var flatData = Object.values(data).flat(); // On applatit pour avoir des extrema globaux de GDP
  //console.log(data);

  var xScale = d3.scaleLinear() // Contrairement au carnet observable, l'échelle est logarithmique
  .domain([d3.min(flatData, function (d) {
    return d.year;
  }), d3.max(flatData, function (d) {
    return d.year;
  })]).range([0, width]);
  return xScale;
}

/**
 * Defines the log scale used to position the center of the circles in Y.
 *
 * @param {number} height The height of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in Y
 */
function setYScaleBO(height, data) {
  // Idem que la fonction précédente
  // TODO : Set scale

  var flatData = Object.values(data).flat();
  var yScale = d3.scaleLinear().domain([d3.min(flatData, function (d) {
    return 0;
  }), d3.max(flatData, function (d) {
    return 1000;
  })]).range([height, 0]);
  return yScale;
}
function setYScaleMesureSucces(height, data, key) {
  // TODO : Set scale

  var flatData = Object.values(data).flat();
  var yScale = d3.scaleLinear().domain([
  //d3.min(flatData, d => d[key]),    
  //d3.max(flatData, d => d[key])
  d3.min(data, function (d) {
    return d3.min(d.data, function (x) {
      return x.average;
    });
  }), d3.max(data, function (d) {
    return d3.max(d.data, function (x) {
      return x.average;
    });
  })]).range([height, 0]);
  return yScale;
}
function setColorScale(data) {
  var categories = data.map(function (d) {
    return d.category;
  }).sort();
  var colorScale = d3.scaleOrdinal().domain(categories).range(d3.schemeSet2);
  return colorScale;
}
},{}],"viz4-scripts/viz4-process.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addNumberOfNominations = addNumberOfNominations;
exports.generateDataToDisplay = generateDataToDisplay;
exports.getMoviesBySameField = getMoviesBySameField;
exports.indexData = indexData;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * Gets movies with the same field value as the specified movie
 * @param {Array} data - Your movie dataset
 * @param {string} movieName - Target movie name
 * @param {string} field - Dynamic field to compare (e.g., "genre", "director")
 * @returns {Array} Sorted array of matching movies
 */
function getMoviesBySameField(movieName, data, field) {
  var targetMovie = data.find(function (movie) {
    return movie.name === movieName;
  });
  if (!targetMovie) return [];

  // Normalize field values (handle both arrays and single values)
  var targetValues = Array.isArray(targetMovie[field]) ? targetMovie[field] : [targetMovie[field]];

  // Create an array of arrays, one per distinct field value
  var moviesByFieldValue = targetValues.map(function (targetValue) {
    // Filter movies that include this specific field value (case-insensitive exact match)
    var matchingMovies = data.filter(function (movie) {
      //if (movie.name === movieName) return false; // Skip the target movie

      var movieValues = Array.isArray(movie[field]) ? movie[field] : [movie[field]];
      return movieValues.some(function (value) {
        return String(value).toLowerCase() === String(targetValue).toLowerCase();
      });
    });

    // Sort alphabetically if multiple movies
    var sortedMovies = matchingMovies.length > 1 ? _toConsumableArray(matchingMovies).sort(function (a, b) {
      return a.name.localeCompare(b.name);
    }) : matchingMovies;
    return {
      categorie: targetValue,
      // The specific value being matched (e.g. "Action")
      movies: sortedMovies // Array of matching movies
    };
  });
  return moviesByFieldValue;
}
function averageByYear(data, succesMesure) {
  var yearGroups = {};

  // Group and sum by year
  data.forEach(function (item) {
    if (typeof item[succesMesure] !== 'number') return;
    var year = item.year;
    yearGroups[year] = yearGroups[year] || {
      sum: 0,
      count: 0,
      names: []
    };
    yearGroups[year].sum += item[succesMesure];
    yearGroups[year].count++;
    yearGroups[year].names.push(item.name);
  });

  // Calculate averages and format output
  return Object.keys(yearGroups).map(function (year) {
    return {
      year: +year,
      average: parseFloat((yearGroups[year].sum / yearGroups[year].count).toFixed(2)),
      count: yearGroups[year].count,
      noms: yearGroups[year].names.join("; ")
    };
  }).sort(function (a, b) {
    return a.year - b.year;
  });
}
function generateDataToDisplay(movieName, data, fields, minlength) {
  var dataToDisplay = [];

  // Capitalize first letter helper
  var capitalize = function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  fields.forEach(function (field) {
    // Get grouped movies for this field
    var groupedResults = getMoviesBySameField(movieName, data, field);

    // Process each group separately
    groupedResults.forEach(function (group) {
      var averageData = averageByYear(group.movies, "mesureDeSucces");
      //console.log("Average :", averageData);

      if (averageData.length > minlength) {
        dataToDisplay.push({
          category: "".concat(capitalize(field), " : ").concat(group.categorie),
          // e.g. "genre: Action"
          data: averageByYear(group.movies, "mesureDeSucces")
        });
      } else {
        //console.log(group.categorie, " is singleton")
      }
    });
  });

  //console.log("Data to display:", dataToDisplay);
  return dataToDisplay;
}
function indexData(referenceName, originalData, successMesure) {
  var validData = originalData.filter(function (movie) {
    var value = movie[successMesure];
    return value !== undefined && value !== null && !isNaN(value) && value > 0;
  });
  var targetMovie = validData.find(function (movie) {
    return movie.name === referenceName;
  });
  if (!targetMovie) {
    return [];
  }
  var referenceValue = targetMovie[successMesure];
  console.log("Ref : ", referenceValue);
  var targetYear = targetMovie.year;
  //console.log(`Indexing ${validData.length} movies against ${referenceName} (${referenceValue})`);

  return validData.map(function (movie) {
    return _objectSpread(_objectSpread({}, movie), {}, {
      mesureDeSucces: movie[successMesure] / referenceValue * 100
    });
  }).filter(function (movie) {
    return movie.name === referenceName ||
    // Keep target movie
    movie.year !== targetYear;
  } // Remove others with same year
  );
}
function addNumberOfNominations(dataSource) {
  return dataSource.map(function (movie) {
    var _movie$goldenGlobesDa, _movie$goldenGlobesDa2, _movie$oscarsData$osc, _movie$oscarsData;
    // Calculate Golden Globes nominations (with null checks)
    var ggNomination = (_movie$goldenGlobesDa = (_movie$goldenGlobesDa2 = movie.goldenGlobesData) === null || _movie$goldenGlobesDa2 === void 0 ? void 0 : _movie$goldenGlobesDa2.goldenGlobesNominations) !== null && _movie$goldenGlobesDa !== void 0 ? _movie$goldenGlobesDa : 0;

    // Calculate Oscars nominations (with null checks)
    var oscarNomination = (_movie$oscarsData$osc = (_movie$oscarsData = movie.oscarsData) === null || _movie$oscarsData === void 0 ? void 0 : _movie$oscarsData.oscarNominations) !== null && _movie$oscarsData$osc !== void 0 ? _movie$oscarsData$osc : 0;

    // Calculate total metric (sum of both)
    var metric = (typeof ggNomination === 'number' ? ggNomination : 0) + (typeof oscarNomination === 'number' ? oscarNomination : 0);

    // Return new object with all original properties plus the new metric field
    return _objectSpread(_objectSpread({}, movie), {}, {
      nominations: {
        goldenGlobes: ggNomination,
        oscars: oscarNomination,
        total: metric
      },
      numNominations: metric // Adding the total as a top-level property for easy access
    });
  });
}
},{}],"viz4-scripts/viz4-viz.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.drawCircles = drawCircles;
exports.drawRef = drawRef;
function drawCircles(data, xScale, yScale, colorScale, width) {
  var courbesElement = d3.select(".courbes");
  console.log("je vais dessiner ", data);

  // Clear previous elements
  courbesElement.selectAll(".ensemble-points").remove();
  courbesElement.selectAll(".data-line").remove();
  courbesElement.selectAll(".legend-item").remove(); // Changed from myLabels
  courbesElement.selectAll(".category-group").remove();
  var categoryGroups = courbesElement.selectAll(".category-group").data(data).enter().append("g").attr("class", function (d) {
    return "category-group ".concat(d.category.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase());
  });
  var line = d3.line().x(function (d) {
    return xScale(d.year);
  }).y(function (d) {
    return yScale(d.average);
  });

  // Draw lines
  categoryGroups.append("path").attr("class", "data-line") // Sanitize class name
  .attr("d", function (d) {
    return line(d.data);
  }).attr("fill", "none").attr("stroke", function (d) {
    return colorScale(d.category);
  }).attr("stroke-width", 4)
  //.attr("pointer-events", "none")
  .on("mouseover", function (event, d) {
    // Select the parent group and all its elements
    var parentGroup = d3.select(this.parentNode);

    // Fade all other category groups
    d3.selectAll(".category-group").each(function () {
      if (this !== parentGroup.node()) {
        var currentOpacity = parseFloat(d3.select(this).style("opacity"));
        if (currentOpacity != 0) {
          d3.select(this).style("opacity", 0.35);
        }
      }
    });

    // Highlight the hovered group
    parentGroup.style("opacity", 1);
  }).on("mouseout", function (event, d) {
    // Restore opacity for all groups
    d3.selectAll(".category-group, .ensemble-points").each(function () {
      var currentOpacity = parseFloat(d3.select(this).style("opacity"));
      if (currentOpacity != 0) {
        d3.select(this).style("opacity", 1);
      }
    });
  });

  // Draw points
  categoryGroups.append('g').attr("class", function (d) {
    return "ensemble-points";
  }) // Sanitize class name
  .attr("fill", function (d) {
    return colorScale(d.category);
  }).selectAll(".data-point").data(function (d) {
    return d.data;
  }).enter().append("circle").attr("class", "data-point").attr("cx", function (d) {
    return xScale(d.year);
  }).attr("cy", function (d) {
    return yScale(d.average);
  }).attr("r", 5).attr("stroke", "white");

  // Add legend
  var legend = courbesElement.append("g").attr("class", "legend").attr("transform", "translate(".concat(width, ", 20)"));
  legend.selectAll(".legend-item").data(data).enter().append("g").attr("class", "legend-item").attr("transform", function (d, i) {
    return "translate(0, ".concat(i * 25, ")");
  }).append("text").text(function (d) {
    return d.category;
  }).attr("x", 20).attr("y", 9).style("fill", function (d) {
    return colorScale(d.category);
  }).style("font-size", "15px").style("font-weight", "bold") // Start bold (since curves are visible)
  .style("cursor", "pointer").on("click", hideShowCategory);
}
function hideShowCategory(event, d) {
  var categoryClass = d.category.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
  var currentOpacity = d3.selectAll(".".concat(categoryClass)).style("opacity");
  d3.selectAll(".".concat(categoryClass)).transition().style("opacity", currentOpacity == 1 ? 0 : 1).attr("pointer-events", currentOpacity == 1 ? "none" : "visible");
  d3.select(event.currentTarget).transition().style("font-weight", currentOpacity == 0 ? "bold" : "normal");
}
function drawRef(title, data, xScale, yScale, height) {
  var courbesElement = d3.select(".courbes");
  courbesElement.selectAll(".ref-marker, .ref-line").remove();
  var targetMovie = data.find(function (movie) {
    return movie.name === title;
  });
  if (!targetMovie) return;
  var xPos = xScale(targetMovie.year);
  var yPos = yScale(100); // Assuming 100 is your reference value

  // Add horizontal trace line (from y-axis to point)
  courbesElement.append("line").attr("class", "ref-line").attr("x1", 0) // Start at y-axis
  .attr("x2", xPos).attr("y1", yPos).attr("y2", yPos).attr("stroke", "black").attr("stroke-width", 2).attr("stroke-dasharray", "3,3") // Dashed line
  .attr("opacity", 0.7);
  courbesElement.append("line").attr("class", "ref-line").attr("x1", xPos) // Start at y-axis
  .attr("x2", xPos).attr("y1", yPos).attr("y2", height).attr("stroke", "black").attr("stroke-width", 2).attr("stroke-dasharray", "3,3") // Dashed line
  .attr("opacity", 0.7);
  courbesElement.append("circle").datum(targetMovie).attr("class", "ref-marker").attr("cx", xPos).attr("cy", yPos).attr("r", 5).attr("fill", "white").attr("stroke", "black").attr("stroke-width", 2);
}
},{}],"viz4-scripts/viz4-checkboxes.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkAll = checkAll;
exports.generateCheckBoxes = generateCheckBoxes;
function generateCheckBoxes(list) {
  var checkGroup = d3.select(".check-group");
  var options = checkGroup.selectAll(".check-option").data(list).enter().append("div").attr("class", "check-option").html(function (d) {
    return "\n        <input type=\"checkbox\" id=\"check-".concat(d, "\" name=\"category\" value=\"").concat(d, "\" checked>\n        <label for=\"check-").concat(d, "\">").concat(d.charAt(0).toUpperCase() + d.slice(1), "</label>\n    ");
  });
  options.select('input').on("change", function (event, d) {
    var isChecked = event.target.checked;
    console.log("Checked ? ", isChecked);
    var legendes = d3.selectAll(".legend-item");
    var legendesFiltrees = legendes.filter(function () {
      return d3.select(this).select("text").text().toLowerCase().includes(d);
    });
    console.log(legendesFiltrees);
    legendesFiltrees.each(function () {
      var fontweight = d3.select(this).select("text").style("font-weight");
      console.log("weight ? ", fontweight);
      if (fontweight == "normal" && isChecked || fontweight == "bold" && !isChecked) {
        d3.select(this).select("text").dispatch('click');
      }
    });
  });
}
function checkAll() {
  d3.selectAll(".check-option input[type='checkbox']").property("checked", true);
}
},{}],"viz4-scripts/viz4-tooltip.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getContents = getContents;
exports.setCircleHoverHandler = setCircleHoverHandler;
/**
 * Defines the contents of the tooltip. See CSS for tooltip styling.
 * The tooltip features the movie name, box office, total nominations,
 * rank, and release year.
 *
 * @param {object} d The data associated to the hovered element
 * @returns {string} The tooltip contents
 */
function getContents(d, colorScale) {
  console.log(d);
  var html = "<div class=\"tooltip-value\" style=\"\n      z-index: 6;\n      background: linear-gradient(90deg,rgb(145, 145, 145) 0%,rgba(166, 166, 166, 0.6) 100%);\n      padding: 12px;\n      border-radius: 6px;\n      color: white;\n      backdrop-filter: blur(5px);\n      box-shadow: 1px -1px 10px 0px rgba(0, 0, 0, 0.3);\n      margin-bottom: 15px;\n      \"\n  >  ";
  if (d.name !== undefined) {
    html += "<div style=\"margin: 4px 0;\">\n              <strong>\uD83D\uDCCB Titre:</strong> ".concat(d.name, "\n            </div>");
  }

  // Always show year
  html += "<div style=\"margin: 4px 0; filter: brightness(1.5);\">\n            <strong>\uD83D\uDCC5 Ann\xE9e:</strong> ".concat(d.year, "\n          </div>");

  // Conditional content based on data
  if (d.count !== undefined) {
    html += "<div style=\"margin: 4px 0;\">\n              <strong>\uD83C\uDFAC Nombre de films:</strong> ".concat(d.count, "\n            </div>");
  }
  if (d.average !== undefined) {
    html += "<div style=\"margin: 4px 0;\">\n              <strong>\u2B50 Moyenne:</strong> ".concat(d.average.toFixed(2), "%\n            </div>");
  }

  // Different detail display for different data types
  if (d.noms !== undefined) {
    html += "<div style=\"margin: 4px 0;\">\n              <strong>\uD83D\uDCCB Films:</strong> ".concat(d.noms, "\n            </div>");
  }

  // Close the div
  html += "</div>";
  return html;
}

/**
 * Sets up the hover event handler. The tooltip should show on on hover.
 *
 * @param {*} tip The tooltip
 */
function setCircleHoverHandler(g, tip) {
  // TODO : Set hover handler. The tooltip shows on
  // hover and the opacity goes up to 100% (from 70%)

  g.selectAll(".data-point, .ref-marker").on('mouseover', function (e, d) {
    d3.select(this).style('cursor', 'pointer').attr("r", 6);
    tip.show(d, this);
  }).on('mouseout', function (e, d) {
    d3.select(this).attr("r", 5);
    tip.hide(d, this);
  });
}
},{}],"index.js":[function(require,module,exports) {
"use strict";

var _process_golden_globes = require("./scripts/process_golden_globes");
var _process_oscars = require("./scripts/process_oscars");
var _process_additional_movie_data = require("./scripts/process_additional_movie_data");
var _process_imdb = require("./scripts/process_imdb");
var _preprocess_data = require("./scripts/preprocess_data");
var _helper = require("./scripts/helper.js");
var viz1Helper = _interopRequireWildcard(require("./viz1-scripts/viz1-helper.js"));
var viz1Legend = _interopRequireWildcard(require("./viz1-scripts/viz1-legend.js"));
var viz1Scales = _interopRequireWildcard(require("./viz1-scripts/viz1-scales.js"));
var viz1Tooltip = _interopRequireWildcard(require("./viz1-scripts/viz1-tooltip.js"));
var viz1Viz = _interopRequireWildcard(require("./viz1-scripts/viz1-viz.js"));
var _d3Tip = _interopRequireDefault(require("d3-tip"));
var viz3Process = _interopRequireWildcard(require("./viz3-scripts/viz3-preprocess.js"));
var viz3Helper = _interopRequireWildcard(require("./viz3-scripts/viz3-helper.js"));
var viz3Scales = _interopRequireWildcard(require("./viz3-scripts/viz3-scales.js"));
var viz3Legend = _interopRequireWildcard(require("./viz3-scripts/viz3-legend.js"));
var viz3Tooltip = _interopRequireWildcard(require("./viz3-scripts/viz3-tooltip.js"));
var viz3Example = _interopRequireWildcard(require("./viz3-scripts/viz3-example.js"));
var viz4Helper = _interopRequireWildcard(require("./viz4-scripts/viz4-helper.js"));
var viz4Search = _interopRequireWildcard(require("./viz4-scripts/viz4-search.js"));
var viz4Scales = _interopRequireWildcard(require("./viz4-scripts/viz4-scales.js"));
var viz4Process = _interopRequireWildcard(require("./viz4-scripts/viz4-process.js"));
var viz4Viz = _interopRequireWildcard(require("./viz4-scripts/viz4-viz.js"));
var viz4CheckBoxes = _interopRequireWildcard(require("./viz4-scripts/viz4-checkboxes.js"));
var viz4Tooltip = _interopRequireWildcard(require("./viz4-scripts/viz4-tooltip.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; } // 'use strict'
/**
 * @file This file is the entry-point for the the code for the Project of the course INF8808.
 * @author TODO
 * @version beta
 */ /* Visualisation 1 - Importations */ /* Visualisation 3 - Importations */ /* Visualisation 4 - Importations */
// import * as helper from './scripts/helper.js'
// import * as preproc from './scripts/preprocess_imbd_data.js'
// import * as viz from './scripts/viz.js'
// import * as legend from './scripts/legend.js'
// import * as hover from './scripts/hover.js'
// import * as util from './scripts/util.js'

// import * as d3Chromatic from 'd3-scale-chromatic'

/* Déplacer le sélecteur de métrique en haut à droite si on le dépasse sur la page */

document.addEventListener("DOMContentLoaded", function () {
  var chooseMetric = document.querySelector(".choose_metric");
  var offsetTop = chooseMetric.offsetTop + 650;
  window.addEventListener("scroll", function () {
    if (window.scrollY > offsetTop) {
      chooseMetric.classList.add("fixed");
    } else {
      chooseMetric.classList.remove("fixed");
    }
  });
});
(function (d3) {
  // let bounds
  // let svgSize
  // let graphSize

  // const margin = { top: 35, right: 200, bottom: 35, left: 200 }

  // const xScale = d3.scaleBand().padding(0.05)
  // const yScale = d3.scaleBand().padding(0.2)
  // const colorScale = d3.scaleSequential(d3Chromatic.interpolateYlGnBu)

  Promise.all([d3.csv('./golden_globe_awards.csv', d3.autoType), d3.csv('./IMDB_Top_250_Movies.csv', d3.autoType), d3.csv('./movie_dataset.csv', d3.autoType), d3.csv('./the_oscar_award.csv', d3.autoType)]).then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 4),
      goldenGlobes = _ref2[0],
      imdb = _ref2[1],
      movies = _ref2[2],
      oscars = _ref2[3];
    imdb = (0, _process_imdb.processMovieData)(imdb);
    var maxYear = imdb.reduce(function (max, movie) {
      return movie.year > max ? movie.year : max;
    }, Number.MIN_VALUE);
    imdb.forEach(function (movie) {
      if (movie.box_office && typeof movie.box_office !== 'string') movie.box_office = (0, _helper.adjustForInflation)(movie.box_office, movie.year, maxYear);
      if (movie.budget && typeof movie.budget !== 'string') movie.budget = (0, _helper.adjustForInflation)(movie.budget, movie.year, maxYear);
    });
    var movieNames = imdb.reduce(function (acc, movie) {
      if (!movie.name) return acc;
      var nameStr = String(movie.name);
      var cleanName = nameStr.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      if (!acc.includes(cleanName) && cleanName.trim() !== '') acc.push(cleanName);
      return acc;
    }, []);
    var oscarMovies = (0, _process_oscars.getOscarsMovieData)(oscars, movieNames);
    imdb = (0, _process_oscars.addOscarsData)(imdb, oscarMovies);
    var goldenGlobesMovies = (0, _process_golden_globes.getGoldenGlobesMovieData)(goldenGlobes, movieNames);
    imdb = (0, _process_golden_globes.addGoldenGlobesData)(imdb, goldenGlobesMovies);
    var additionalMovieData = (0, _process_additional_movie_data.getAdditionalMovieData)(movies, movieNames);
    imdb = (0, _process_additional_movie_data.addAdditionalMovieData)(imdb, additionalMovieData);
    (0, _helper.convertMovieNamesToString)(imdb);
    imdb = (0, _preprocess_data.calculateMovieProfits)(imdb);
    var contributorData = (0, _preprocess_data.getFilmContributorsData)(imdb);
    var genreIntervalData = (0, _preprocess_data.getGenreDataIntervals)(imdb);
    var genreData = (0, _preprocess_data.getMoviesByGenre)(imdb);
    var collaborationsData = (0, _preprocess_data.getTopCollaborations)(imdb);
    var certificateData = (0, _preprocess_data.getCertificateData)(imdb);
    var seasonalData = (0, _preprocess_data.getDataBySeason)(imdb);
    var movieLengthData = (0, _preprocess_data.getMovieLengthData)(imdb);
    var taglineWordData = (0, _preprocess_data.getTaglineWordsData)(imdb);
    var taglineLengthData = (0, _preprocess_data.getTaglineLengthData)(imdb);

    /* Visualisation 1 - Success scatter */

    var margin1 = {
      top: 75,
      right: 260,
      bottom: 100,
      left: 80
    };
    var svgSize1, graphSize1;

    /**
     *
     */
    function setSizing1() {
      svgSize1 = {
        width: 1000,
        height: 600
      };
      graphSize1 = {
        width: svgSize1.width - margin1.right - margin1.left,
        height: svgSize1.height - margin1.bottom - margin1.top
      };
      viz1Helper.setCanvasSize(svgSize1.width, svgSize1.height);
    }
    setSizing1();
    var svgViz1 = d3.select(".success-scatter-svg");
    var g1 = viz1Helper.generateG(svgViz1, margin1, "graph-g-viz1");
    var tip = (0, _d3Tip.default)().attr('class', 'd3-tip').html(function (d) {
      return viz1Tooltip.getContents(d);
    });
    g1.call(tip);
    viz1Helper.appendAxes(g1);
    viz1Helper.appendGraphLabels(g1);
    viz1Helper.placeTitle(g1, graphSize1.width);
    viz1Viz.positionLabels(g1, graphSize1.width, graphSize1.height);
    var radiusScale1 = viz1Scales.setRadiusScale(imdb);
    var colorScale1 = viz1Scales.setColorScale(imdb);
    var xScale1 = viz1Scales.setXScale(graphSize1.width, imdb);
    var yScale1 = viz1Scales.setYScale(graphSize1.height, imdb);
    viz1Helper.drawXAxis(g1, xScale1, graphSize1.height);
    viz1Helper.drawYAxis(g1, yScale1);
    var flatData = Object.values(imdb).flat();
    var years = flatData.map(function (d) {
      return d.year;
    });
    var minDate = d3.min(years);
    var maxDate = d3.max(years);
    viz1Legend.drawLegend(colorScale1, g1, graphSize1.width, graphSize1.height, minDate, maxDate);
    build1(g1, imdb, 0, radiusScale1, colorScale1, xScale1, yScale1);
    viz1Viz.setCircleHoverHandler(g1, tip);

    /**
     * This function builds the graph.
    * @param {object} g1 The D3 selection of the <g> element containing the circles
     * @param {object} data The data to be used
    * @param {number} transitionDuration The duration of the transition while placing the circles
    * @param {number} year The year to be displayed
    * @param {*} rScale1 The scale for the circles' radius
    * @param {*} colorScale1 The scale for the circles' color
     * @param {*} xScale1 The x scale for the graph
    * @param {*} yScale1 The y scale for the graph
    */
    function build1(g1, data, transitionDuration, rScale1, colorScale1, xScale1, yScale1) {
      viz1Viz.drawCircles(g1, data, rScale1, colorScale1);
      viz1Viz.moveCircles(g1, xScale1, yScale1, transitionDuration);
    }
    ;

    /* Visualisation 3 - Genres et tendances */

    var metricViz3 = "rating"; // "box_office", 
    var selectedFilterViz3 = "genre";
    var intervalLenght = 10;
    var numElemPerStack = 4;
    function buildViz3(metricViz3, selectedFilterViz3, intervalLenght, numElemPerStack) {
      var viz3 = d3.select(".tendance-timeline-svg");
      var legendDiv = d3.select(".legend-tendances");

      // Clear previous content
      viz3.selectAll(".axes").remove();
      viz3.selectAll(".bars").remove();
      legendDiv.selectAll("*").remove();

      // Preprocessing
      var viz3Data = viz3Process.getDataPerTimeInterval(imdb, intervalLenght, metricViz3); // if metric="rating" et on prend des intervalles de temps de 8 années
      var viz3MarketPerInterval = viz3Process.getMarketPerTimeInterval(viz3Data, selectedFilterViz3); //if selectedfilter = "genre"
      var viz3MarketPerIntervalSmall = viz3Process.reduceNumberOfLine(viz3MarketPerInterval, numElemPerStack); //seulement 4 genres par intervalle
      var intervalsDates = Object.keys(viz3MarketPerIntervalSmall["intervals"]);
      var stackedData = viz3Process.stackData(viz3MarketPerIntervalSmall);

      // setup graph scales
      var svgSizeViz3 = {
        width: 1000,
        height: 600
      };
      var marginViz3 = {
        top: 40,
        right: 40,
        bottom: 60,
        left: 100
      };
      var graphSizeViz3 = {
        width: svgSizeViz3.width - marginViz3.right - marginViz3.left,
        height: svgSizeViz3.height - marginViz3.bottom - marginViz3.top
      };
      viz3Helper.setCanvasSize(svgSizeViz3.width, svgSizeViz3.height);
      var viz3xScale = viz3Scales.setXScale(graphSizeViz3.width, intervalsDates);
      var viz3yScaleBoxOffice = viz3Scales.setYScale(graphSizeViz3.height);
      var axesViz3 = viz3.append("g").attr("class", "axes").attr("transform", "translate(".concat(marginViz3.left, ",").concat(marginViz3.top, ")"));

      // Dessin des axes
      viz3Helper.appendAxes(axesViz3);
      viz3Helper.drawXAxis(viz3xScale, graphSizeViz3.height, intervalsDates);
      viz3Helper.drawYAxis(viz3yScaleBoxOffice);

      // Ajout des labels d'axes
      viz3Helper.appendGraphLabels(axesViz3);
      viz3Helper.positionLabels(axesViz3, graphSizeViz3.width, graphSizeViz3.height);
      var customColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#393b79", "#637939", "#8c6d31", "#843c39", "#7b4173", "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5", "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5"];
      var colorScale = d3.scaleOrdinal().domain(viz3MarketPerIntervalSmall.presentCategory).range(customColors);
      viz3Legend.createLegend(viz3MarketPerIntervalSmall, legendDiv, colorScale);
      var g3 = viz3Helper.generateG(viz3, marginViz3, "graph-g-viz3");
      var tip3 = (0, _d3Tip.default)().attr('class', 'd3-tip').html(function (d) {
        return viz3Tooltip.getContents(d, colorScale);
      });
      g3.call(tip3);
      var series = d3.stack().keys(viz3MarketPerIntervalSmall.presentCategory)(stackedData);

      // Créer un groupe de base où dessiner les barres
      var barsGroup = viz3.append("g").attr("class", "bars").attr("transform", "translate(".concat(marginViz3.left, ",").concat(marginViz3.top, ")"));
      barsGroup.selectAll("g.layer").data(series).enter().append("g").attr("class", "layer").attr("fill", function (d) {
        return colorScale(d.key);
      }).selectAll("rect").data(function (d) {
        // On ajoute la catégorie à chaque élément
        return d.map(function (item) {
          return _objectSpread(_objectSpread({}, item), {}, {
            category: d.key
          });
        });
      }).enter().append("rect").attr('class', 'rect3').attr("x", function (d) {
        return viz3xScale(d.data.interval);
      }).attr("y", function (d) {
        return viz3yScaleBoxOffice(d[1]);
      }).attr("height", function (d) {
        return viz3yScaleBoxOffice(d[0]) - viz3yScaleBoxOffice(d[1]);
      }).attr("width", viz3xScale.bandwidth());

      // Hover d'un rectangle
      viz3Tooltip.setRectHoverHandler(viz3, tip3);

      // Exemple de lecture
      var randomRectData = viz3Example.selectRandomRectangle();
      var phraseEx = viz3Example.phraseExemple(randomRectData, colorScale);
      var exampleContainerViz3 = document.querySelector(".exampleViz3");
      exampleContainerViz3.innerHTML = phraseEx;

      // const textElementViz3 = document.createElement("p");
      // textElementViz3.textContent = "Exemple de lecture : " + phraseEx;
      // textElementViz3.classList.add("example-text")
      // textContainerViz3.appendChild(textElementViz3);
    }
    buildViz3(metricViz3, selectedFilterViz3, intervalLenght, numElemPerStack);

    // Gérer les changements d'option :
    var selectorMetric = document.getElementById('metric-select');
    selectorMetric.addEventListener('change', function () {
      buildViz3(selectorMetric.value, selectorCategory.value, parseInt(sliderMovieLenght.value, 10), parseInt(sliderMaxLine.value, 10));
    });
    var selectorCategory = document.getElementById('categorie-select');
    selectorCategory.addEventListener('change', function () {
      buildViz3(selectorMetric.value, selectorCategory.value, parseInt(sliderMovieLenght.value, 10), parseInt(sliderMaxLine.value, 10));
    });
    var sliderMovieLenght = document.getElementById('slider-movieLenght');
    var sliderMovieLenghtValue = document.getElementById('slider-movieLenght-value');
    sliderMovieLenght.addEventListener('input', function () {
      sliderMovieLenghtValue.textContent = sliderMovieLenght.value;
      buildViz3(selectorMetric.value, selectorCategory.value, parseInt(sliderMovieLenght.value, 10), parseInt(sliderMaxLine.value, 10));
    });
    var sliderMaxLine = document.getElementById('slider-maxLine');
    var sliderMaxLineValue = document.getElementById('slider-maxLine-value');
    sliderMaxLine.addEventListener('input', function () {
      sliderMaxLineValue.textContent = sliderMaxLine.value;
      buildViz3(selectorMetric.value, selectorCategory.value, parseInt(sliderMovieLenght.value, 10), parseInt(sliderMaxLine.value, 10));
    });

    /* Visualisation 4 - Impact des films */

    var margin4 = {
      top: 75,
      right: 200,
      bottom: 100,
      left: 80
    };
    var svgSize4, graphSize4;
    function setSizing() {
      svgSize4 = {
        width: 1000,
        height: 600
      };
      graphSize4 = {
        width: svgSize4.width - margin4.right - margin4.left,
        height: svgSize4.height - margin4.bottom - margin4.top
      };
      viz4Helper.setCanvasSize(svgSize4.width, svgSize4.height);
    }
    setSizing();
    var title;
    var ListOfFields = ["directors", "genre", "casts", "writers"];
    var viz4FixedImdb = viz4Process.addNumberOfNominations(imdb);
    var viz4xScale;
    var viz4yScaleBoxOffice;
    var viz4ColorScale;
    viz4CheckBoxes.generateCheckBoxes(ListOfFields);
    var viz4 = d3.select(".film-impact-svg");
    buildViz4(viz4FixedImdb);
    function buildViz4(viz4data) {
      viz4xScale = viz4Scales.setXScale(graphSize4.width, viz4data);
      viz4yScaleBoxOffice = viz4Scales.setYScaleBO(graphSize4.height, viz4data);
      var axes = viz4.append("g").attr("class", "axes").attr("transform", 'translate(' + margin4.left + ', ' + margin4.top + ')');
      var courbes = viz4.append("g").attr("class", "courbes").attr("transform", 'translate(' + margin4.left + ', ' + margin4.top + ')');
      viz4Helper.appendAxes(axes);
      viz4Helper.appendGraphLabels(axes);
      viz4Helper.positionLabels(axes, graphSize4.width, graphSize4.height);
      viz4Helper.drawXAxis(viz4xScale, graphSize4.height);
      viz4Helper.drawYAxis(viz4yScaleBoxOffice);
      viz4Search.initFilmList(viz4data);
    }
    function refreshViz4(viz4data, viz4mesureSucces) {
      console.log("Changement");
      viz4CheckBoxes.checkAll();
      var dataToShow = viz4Process.indexData(title, viz4data, viz4mesureSucces);
      var test = viz4Process.generateDataToDisplay(title, dataToShow, ListOfFields, 2);
      console.log("Test refresh : ", test);
      var viz4yScaleFlexible = viz4Scales.setYScaleMesureSucces(graphSize4.height, test, "average");
      viz4Helper.drawYAxis(viz4yScaleFlexible);
      viz4ColorScale = viz4Scales.setColorScale(test);
      console.log(viz4ColorScale);
      viz4Viz.drawCircles(test, viz4xScale, viz4yScaleFlexible, viz4ColorScale, graphSize4.width);
      viz4Viz.drawRef(title, dataToShow, viz4xScale, viz4yScaleFlexible, graphSize4.height);
      var tip4 = (0, _d3Tip.default)().attr('class', 'viz4-tip').html(function (d) {
        return viz4Tooltip.getContents(d, viz4ColorScale);
      });
      viz4.select(".courbes").call(tip4);
      viz4Tooltip.setCircleHoverHandler(viz4.select(".courbes"), tip4);
    }
    selectorMetric.addEventListener('change', function () {
      refreshViz4(viz4FixedImdb, selectorMetric.value);
    });
    document.addEventListener('viz4movieSelected', function (e) {
      console.log("Received movie:", e.detail.movie);
      title = e.detail.movie;
      var viz4MesureSucces = selectorMetric.value;
      refreshViz4(viz4FixedImdb, viz4MesureSucces);
    });

    // }, [])
    // d3.csv('./golden_globe_awards.csv', d3.autoType).then(function (data) {
    //   console.log(data)
    //   const neighborhoodNames = preproc.getNeighborhoodNames(data)
    //   data = preproc.filterYears(data, 2010, 2020)

    //   data = preproc.summarizeYearlyCounts(data)
    //   data = preproc.fillMissingData(data, neighborhoodNames, 2010, 2020, util.range)

    // viz.setColorScaleDomain(colorScale, data)

    // legend.initGradient(colorScale)
    // legend.initLegendBar()
    // legend.initLegendAxis()

    // const g = helper.generateG(margin)

    // helper.appendAxes(g)
    // viz.appendRects(data)

    // setSizing()
    // build()

    /**
     *   This function handles the graph's sizing.
     */
    // function setSizing () {
    //   bounds = d3.select('.graph').node().getBoundingClientRect()

    //   svgSize = {
    //     width: bounds.width,
    //     height: 550
    //   }

    //   graphSize = {
    //     width: svgSize.width - margin.right - margin.left,
    //     height: svgSize.height - margin.bottom - margin.top
    //   }

    //   helper.setCanvasSize(svgSize.width, svgSize.height)
    // }

    /**
     *   This function builds the graph.
     */
    // function build () {
    //   viz.updateXScale(xScale, data, graphSize.width, util.range)
    //   viz.updateYScale(yScale, neighborhoodNames, graphSize.height)

    //   viz.drawXAxis(xScale)
    //   viz.drawYAxis(yScale, graphSize.width)

    //   viz.rotateYTicks()

    //   viz.updateRects(xScale, yScale, colorScale)

    //   hover.setRectHandler(xScale, yScale, hover.rectSelected, hover.rectUnselected, hover.selectTicks, hover.unselectTicks)

    //   legend.draw(margin.left / 2, margin.top + 5, graphSize.height - 10, 15, 'url(#gradient)', colorScale)
    // }

    // window.addEventListener('resize', () => {
    //   setSizing()
    //   build()
    // })
  });
})(d3);
},{"./scripts/process_golden_globes":"scripts/process_golden_globes.js","./scripts/process_oscars":"scripts/process_oscars.js","./scripts/process_additional_movie_data":"scripts/process_additional_movie_data.js","./scripts/process_imdb":"scripts/process_imdb.js","./scripts/preprocess_data":"scripts/preprocess_data.js","./scripts/helper.js":"scripts/helper.js","./viz1-scripts/viz1-helper.js":"viz1-scripts/viz1-helper.js","./viz1-scripts/viz1-legend.js":"viz1-scripts/viz1-legend.js","./viz1-scripts/viz1-scales.js":"viz1-scripts/viz1-scales.js","./viz1-scripts/viz1-tooltip.js":"viz1-scripts/viz1-tooltip.js","./viz1-scripts/viz1-viz.js":"viz1-scripts/viz1-viz.js","d3-tip":"../node_modules/d3-tip/index.js","./viz3-scripts/viz3-preprocess.js":"viz3-scripts/viz3-preprocess.js","./viz3-scripts/viz3-helper.js":"viz3-scripts/viz3-helper.js","./viz3-scripts/viz3-scales.js":"viz3-scripts/viz3-scales.js","./viz3-scripts/viz3-legend.js":"viz3-scripts/viz3-legend.js","./viz3-scripts/viz3-tooltip.js":"viz3-scripts/viz3-tooltip.js","./viz3-scripts/viz3-example.js":"viz3-scripts/viz3-example.js","./viz4-scripts/viz4-helper.js":"viz4-scripts/viz4-helper.js","./viz4-scripts/viz4-search.js":"viz4-scripts/viz4-search.js","./viz4-scripts/viz4-scales.js":"viz4-scripts/viz4-scales.js","./viz4-scripts/viz4-process.js":"viz4-scripts/viz4-process.js","./viz4-scripts/viz4-viz.js":"viz4-scripts/viz4-viz.js","./viz4-scripts/viz4-checkboxes.js":"viz4-scripts/viz4-checkboxes.js","./viz4-scripts/viz4-tooltip.js":"viz4-scripts/viz4-tooltip.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}
module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "59589" + '/');
  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);
    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });
      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }
    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }
    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }
    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}
function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}
function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}
function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/src.e31bb0bc.js.map