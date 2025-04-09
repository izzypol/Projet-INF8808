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


/* Visualisation 3 - Importations */
import * as viz3Process from './viz3-scripts/viz3-preprocess.js'



/* Visualisation 4 - Importations */

import * as viz4Helper from './viz4-scripts/viz4-helper.js'
import * as viz4Search from './viz4-scripts/viz4-search.js'
import * as viz4Scales from './viz4-scripts/viz4-scales.js'
import * as viz4Process from './viz4-scripts/viz4-process.js'
import * as viz4Viz from './viz4-scripts/viz4-viz.js'

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
    convertMovieNamesToString(imdb)

    imdb = calculateMovieProfits(imdb)
    console.log(imdb)

    const contributorData = getFilmContributorsData(imdb)
    const genreIntervalData = getGenreDataIntervals(imdb)
    const genreData = getMoviesByGenre(imdb)
    // console.log(genreData)

    const collaborationsData = getTopCollaborations(imdb)

    const certificateData = getCertificateData(imdb)
    const seasonalData = getDataBySeason(imdb)

    const movieLengthData = getMovieLengthData(imdb)
    const taglineWordData = getTaglineWordsData(imdb)
    const taglineLengthData = getTaglineLengthData(imdb)


    /* Visualisation 3 - Genres et tendances */

    viz3Process.getDataPerTimeInterval(imdb, 15, "rating");



    /* Visualisation 4 - Impact des films */

    const margin4 = {
      top: 75,
      right: 200,
      bottom: 100,
      left: 80
    }

    let svgSize4, graphSize4

    function setSizing() {
      svgSize4 = {
        width: 1000,
        height: 600
      }

      graphSize4 = {
        width: svgSize4.width - margin4.right - margin4.left,
        height: svgSize4.height - margin4.bottom - margin4.top
      }

      viz4Helper.setCanvasSize(svgSize4.width, svgSize4.height)
    }

    setSizing();

    const viz4xScale = viz4Scales.setXScale(graphSize4.width, imdb);
    const viz4yScaleBoxOffice = viz4Scales.setYScaleBO(graphSize4.height, imdb);

    const viz4 = d3.select(".film-impact-svg");

    const axes = viz4.append("g").attr("class", "axes")
      .attr("transform", 'translate(' + margin4.left + ', ' + margin4.top + ')');
    const courbes = viz4.append("g").attr("class", "courbes")
      .attr("transform", 'translate(' + margin4.left + ', ' + margin4.top + ')');

    viz4Helper.appendAxes(axes);
    viz4Helper.appendGraphLabels(axes);
    viz4Helper.positionLabels(axes, graphSize4.width, graphSize4.height);

    viz4Helper.drawXAxis(viz4xScale, graphSize4.height);
    viz4Helper.drawYAxis(viz4yScaleBoxOffice);

    let title;
    const ListOfFields = ["directors", "genre", "casts", "writers"];

    const viz4ColorScale = viz4Scales.setColorScale(ListOfFields);

    //viz4Process.indexData("1917", imdb, "box_office");

    document.addEventListener('viz4movieSelected', (e) => {
      console.log("Received movie:", e.detail.movie);
      title = e.detail.movie;
      // Update your visualization
      //const testProcess = viz4Process.getMoviesBySameField(title, imdb, "directors");
      //const testProcess2 = viz4Process.getMoviesBySameField(title, imdb, "year");
      //console.log("liste : ", testProcess);
      //viz4Viz.drawCircles(testProcess, viz4xScale, viz4yScaleBoxOffice);
      const dataToShow = viz4Process.indexData(title, imdb, "box_office");

      const test = viz4Process.generateDataToDisplay(title, dataToShow, ListOfFields);
      console.log("Test : ", test);

      const viz4yScaleFlexible = viz4Scales.setYScaleMesureSucces(graphSize4.height, test, "average");
      viz4Helper.drawYAxis(viz4yScaleFlexible);

      viz4Viz.drawCircles(test, viz4xScale, viz4yScaleFlexible, viz4ColorScale, graphSize4.width);
      
    });

    viz4.append("circle");

    viz4Search.initFilmList(imdb);

    buildViz4(certificateData);

    function buildViz4(data) {
      //console.log(data);
    }

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
