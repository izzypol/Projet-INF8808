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
exports.cleanMovieName = cleanMovieName;
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
exports.createYearIntervals = createYearIntervals;
exports.getCertificateData = getCertificateData;
exports.getDataBySeason = getDataBySeason;
exports.getFilmContributorsData = getFilmContributorsData;
exports.getGenreDataIntervals = getGenreDataIntervals;
exports.getMovieLengthData = getMovieLengthData;
exports.getTopCollaborations = getTopCollaborations;
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
 * Helper functions for metrics calculations
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
  createMetricsObject: function createMetricsObject() {
    var metricsObject = {};
    this.standardMetrics.forEach(function (metric) {
      metricsObject["total".concat(metric.property.charAt(0).toUpperCase() + metric.property.slice(1))] = 0;
      metricsObject["".concat(metric.property, "Count")] = 0;
      metricsObject["avg".concat(metric.property.charAt(0).toUpperCase() + metric.property.slice(1))] = 0;
    });
    return metricsObject;
  },
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
  calculateAverages: function calculateAverages(currObject) {
    this.standardMetrics.forEach(function (metric) {
      var totalProp = "total".concat(metric.property.charAt(0).toUpperCase() + metric.property.slice(1));
      var countProp = "".concat(metric.property, "Count");
      var avgProp = "avg".concat(metric.property.charAt(0).toUpperCase() + metric.property.slice(1));
      currObject[avgProp] = currObject[countProp] > 0 ? currObject[totalProp] / currObject[countProp] : 0;
    });
    return currObject;
  },
  cleanupMetricsProperties: function cleanupMetricsProperties(currObject) {
    this.standardMetrics.forEach(function (metric) {
      var totalProp = "total".concat(metric.property.charAt(0).toUpperCase() + metric.property.slice(1));
      var countProp = "".concat(metric.property, "Count");
      delete currObject[totalProp];
      delete currObject[countProp];
    });
    return currObject;
  },
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
function createYearIntervals(movies) {
  var minYear = movies.reduce(function (min, movie) {
    return movie.year < min ? movie.year : min;
  }, Number.MAX_VALUE);
  var maxYear = movies.reduce(function (max, movie) {
    return movie.year > max ? movie.year : max;
  }, Number.MIN_VALUE);
  var firstDecade = Math.floor(minYear / 10) * 10;
  var lastDecade = Math.floor(maxYear / 10) * 10;
  var intervals = [];
  for (var decade = firstDecade; decade <= lastDecade; decade += 10) {
    var decadeYears = decade + 9;
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
 * @param {number} limit Number of top collaborations to return (default 20)
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
function getMovieLengthData(movies) {
  var minRuntime = Number.MAX_VALUE;
  var maxRuntime = 0;
  movies.forEach(function (movie) {
    var runtime = parseRuntime(movie.run_time);
    if (runtime) {
      minRuntime = Math.min(minRuntime, runtime);
      maxRuntime = Math.max(maxRuntime, runtime);
    }
  });
  var firstInterval = Math.floor(minRuntime / 10) * 10;
  var lastInterval = Math.floor(maxRuntime / 10) * 10;
  console.log(minRuntime);
  console.log(maxRuntime);
  var intervals = [];
  for (var minutes = firstInterval; minutes <= lastInterval; minutes += 10) {
    intervals.push(_objectSpread({
      startMinutes: minutes,
      endMinutes: minutes + 9,
      label: "".concat(minutes, "s"),
      movies: [],
      nMovies: 0,
      genres: []
    }, MetricsHelper.createMetricsObject()));
  }
  movies.forEach(function (movie) {
    var movieRuntime = parseRuntime(movie.run_time);
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
function parseRuntime(runtimeString) {
  if (!runtimeString || typeof runtimeString !== 'string') return null;
  var totalMins = 0;
  var hoursMatch = runtimeString.match(/(\d+)h/);
  var minutesMatch = runtimeString.match(/(\d+)m/);
  if (hoursMatch && hoursMatch[1]) totalMins += parseInt(hoursMatch[1], 10) * 60;
  if (minutesMatch && minutesMatch[1]) totalMins += parseInt(minutesMatch[1], 10);
  return totalMins > 0 ? totalMins : null;
}
},{}],"index.js":[function(require,module,exports) {
"use strict";

var _process_golden_globes = require("./scripts/process_golden_globes");
var _process_oscars = require("./scripts/process_oscars");
var _process_additional_movie_data = require("./scripts/process_additional_movie_data");
var _process_imdb = require("./scripts/process_imdb");
var _preprocess_data = require("./scripts/preprocess_data");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; } // 'use strict'
// import * as helper from './scripts/helper.js'
// import * as preproc from './scripts/preprocess_imbd_data.js'
// import * as viz from './scripts/viz.js'
// import * as legend from './scripts/legend.js'
// import * as hover from './scripts/hover.js'
// import * as util from './scripts/util.js'

// import * as d3Chromatic from 'd3-scale-chromatic'

/**
 * @file This file is the entry-point for the the code for TP3 for the course INF8808.
 * @author Olivia Gélinas
 * @version v1.0.0
 */

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
    var contributorData = (0, _preprocess_data.getFilmContributorsData)(imdb);
    var genreData = (0, _preprocess_data.getGenreDataIntervals)(imdb);
    var collaborationsData = (0, _preprocess_data.getTopCollaborations)(imdb);
    var certificateData = (0, _preprocess_data.getCertificateData)(imdb);
    var seasonalData = (0, _preprocess_data.getDataBySeason)(imdb);
    var movieLengthData = (0, _preprocess_data.getMovieLengthData)(imdb);
    console.log(imdb);
    console.log(movieLengthData);

    // const seasonalReleaseData = getDataBySeason(imdb)

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
},{"./scripts/process_golden_globes":"scripts/process_golden_globes.js","./scripts/process_oscars":"scripts/process_oscars.js","./scripts/process_additional_movie_data":"scripts/process_additional_movie_data.js","./scripts/process_imdb":"scripts/process_imdb.js","./scripts/preprocess_data":"scripts/preprocess_data.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "59990" + '/');
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