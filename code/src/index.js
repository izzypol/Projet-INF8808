// 'use strict'

import { addGoldenGlobesData, getGoldenGlobesMovieData } from './scripts/process_golden_globes'
import { addOscarsData, getOscarsMovieData } from './scripts/process_oscars'
import { addAdditionalMovieData, getAdditionalMovieData } from './scripts/process_additional_movie_data'
import { processMovieData } from './scripts/process_imdb'
import {
  getFilmContributorsData, getGenreDataIntervals,
  getTopCollaborations, getCertificateData, getDataBySeason, getMovieLengthData, getTaglineWordsData, getTaglineLengthData, calculateMovieProfits, getMoviesByGenre
} from './scripts/preprocess_data'

import { adjustForInflation, convertMovieNamesToString } from './scripts/helper.js'

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

  Promise.all([
    d3.csv('./golden_globe_awards.csv', d3.autoType),
    d3.csv('./IMDB_Top_250_Movies.csv', d3.autoType),
    d3.csv('./movie_dataset.csv', d3.autoType),
    d3.csv('./the_oscar_award.csv', d3.autoType)
  ]).then(function ([goldenGlobes, imdb, movies, oscars]) {
    imdb = processMovieData(imdb)
    const maxYear = imdb.reduce((max, movie) => movie.year > max ? movie.year : max, Number.MIN_VALUE)

    imdb.forEach(movie => {
      if (movie.box_office && typeof movie.box_office !== 'string') movie.box_office = adjustForInflation(movie.box_office, movie.year, maxYear)
      if (movie.budget && typeof movie.budget !== 'string') movie.budget = adjustForInflation(movie.budget, movie.year, maxYear)
    })

    const movieNames = imdb.reduce((acc, movie) => {
      if (!movie.name) return acc

      const nameStr = String(movie.name)
      const cleanName = nameStr.toLowerCase().replace(/[^a-z0-9\s]/g, '')

      if (!acc.includes(cleanName) && cleanName.trim() !== '') acc.push(cleanName)
      return acc
    }, [])

    const oscarMovies = getOscarsMovieData(oscars, movieNames)
    imdb = addOscarsData(imdb, oscarMovies)

    const goldenGlobesMovies = getGoldenGlobesMovieData(goldenGlobes, movieNames)
    imdb = addGoldenGlobesData(imdb, goldenGlobesMovies)

    const additionalMovieData = getAdditionalMovieData(movies, movieNames)
    imdb = addAdditionalMovieData(imdb, additionalMovieData)
    convertMovieNamesToString(movies)

    imdb = calculateMovieProfits(imdb)
    console.log(imdb)

    const contributorData = getFilmContributorsData(imdb)
    const genreIntervalData = getGenreDataIntervals(imdb)
    const genreData = getMoviesByGenre(imdb)
    console.log(genreData)

    const collaborationsData = getTopCollaborations(imdb)

    const certificateData = getCertificateData(imdb)
    const seasonalData = getDataBySeason(imdb)

    const movieLengthData = getMovieLengthData(imdb)
    console.log(movieLengthData)
    const taglineWordData = getTaglineWordsData(imdb)
    const taglineLengthData = getTaglineLengthData(imdb)

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
  })
})(d3)
