// 'use strict'
/**
 * @file This file is the entry-point for the the code for the Project of the course INF8808.
 * @author TODO
 * @version beta
 */


import { addGoldenGlobesData, getGoldenGlobesMovieData } from './scripts/process_golden_globes'
import { addOscarsData, getOscarsMovieData } from './scripts/process_oscars'
import { addAdditionalMovieData, getAdditionalMovieData } from './scripts/process_additional_movie_data'
import { processMovieData } from './scripts/process_imdb'
import {
  getFilmContributorsData, getGenreDataIntervals,
  getTopCollaborations, getCertificateData, getDataBySeason, getMovieLengthData, getTaglineWordsData, getTaglineLengthData, calculateMovieProfits, getMoviesByGenre, countCollaborations
} from './scripts/preprocess_data'

import { adjustForInflation, convertMovieNamesToString } from './scripts/helper.js'

/* Visualisation 1 - Importations */

import * as viz1Helper from './viz1-scripts/viz1-helper.js'
import * as viz1Legend from './viz1-scripts/viz1-legend.js'
import * as viz1Scales from './viz1-scripts/viz1-scales.js'
import * as viz1Tooltip from './viz1-scripts/viz1-tooltip.js'
import * as viz1Viz from './viz1-scripts/viz1-viz.js'

import d3Tip from 'd3-tip'

/* Visualisation 2 - Importations */
import * as viz2Process from './viz2-scripts/viz2-preprocess.js'
import * as viz2Helper from './viz2-scripts/viz2-helper.js'
import * as viz2Scales from './viz2-scripts/viz2-scales.js'
import * as viz2Viz from './viz2-scripts/viz2-viz.js'
import * as viz2Tooltip from './viz2-scripts/viz2-tooltip.js'
import * as viz2Search from './viz2-scripts/viz2-search.js'
/* Visualisation 3 - Importations */
import * as viz3Process from './viz3-scripts/viz3-preprocess.js'
import * as viz3Helper from './viz3-scripts/viz3-helper.js'
import * as viz3Scales from './viz3-scripts/viz3-scales.js'
import * as viz3Legend from './viz3-scripts/viz3-legend.js'
import * as viz3Tooltip from './viz3-scripts/viz3-tooltip.js'
import * as viz3Example from './viz3-scripts/viz3-example.js'


/* Visualisation 4 - Importations */

import * as viz4Helper from './viz4-scripts/viz4-helper.js'
import * as viz4Search from './viz4-scripts/viz4-search.js'
import * as viz4Scales from './viz4-scripts/viz4-scales.js'
import * as viz4Process from './viz4-scripts/viz4-process.js'
import * as viz4Viz from './viz4-scripts/viz4-viz.js'
import * as viz4CheckBoxes from './viz4-scripts/viz4-checkboxes.js'
import * as viz4Tooltip from './viz4-scripts/viz4-tooltip.js'

import * as d3 from 'd3'


// import * as helper from './scripts/helper.js'
// import * as preproc from './scripts/preprocess_imbd_data.js'
// import * as viz from './scripts/viz.js'
// import * as legend from './scripts/legend.js'
// import * as hover from './scripts/hover.js'
// import * as util from './scripts/util.js'

// import * as d3Chromatic from 'd3-scale-chromatic'



/* Déplacer le sélecteur de métrique en haut à droite si on le dépasse sur la page */

document.addEventListener("DOMContentLoaded", () => {
  const chooseMetric = document.querySelector(".choose_metric");
  const offsetTop = chooseMetric.offsetTop + 650;

  window.addEventListener("scroll", () => {

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
  
    const Allcollababorations = countCollaborations(imdb)
    const contributorData = getFilmContributorsData(imdb)
    const genreIntervalData = getGenreDataIntervals(imdb)
    const genreData = getMoviesByGenre(imdb)

    const certificateData = getCertificateData(imdb)
    const seasonalData = getDataBySeason(imdb)

    const movieLengthData = getMovieLengthData(imdb)
    const taglineWordData = getTaglineWordsData(imdb)
    const taglineLengthData = getTaglineLengthData(imdb)


    /* Visualisation 1 - Success scatter */

    const margin1 = {
      top: 75,
      right: 260,
      bottom: 100,
      left: 80
    }

    let svgSize1, graphSize1

    /**
     *
     */
    function setSizing1() {
      svgSize1 = {
        width: 1000,
        height: 600
      }

      graphSize1 = {
        width: svgSize1.width - margin1.right - margin1.left,
        height: svgSize1.height - margin1.bottom - margin1.top
      }

      viz1Helper.setCanvasSize(svgSize1.width, svgSize1.height)
    }

    setSizing1();

    const svgViz1 = d3.select(".success-scatter-svg");
    const g1 = viz1Helper.generateG(svgViz1, margin1, "graph-g-viz1")

    const tip = d3Tip().attr('class', 'd3-tip').html(function (d) { return viz1Tooltip.getContents(d) })
    g1.call(tip)

    viz1Helper.appendAxes(g1)
    viz1Helper.appendGraphLabels(g1)
    viz1Helper.placeTitle(g1, graphSize1.width)

    viz1Viz.positionLabels(g1, graphSize1.width, graphSize1.height)


    const radiusScale1 = viz1Scales.setRadiusScale(imdb)
    const colorScale1 = viz1Scales.setColorScale(imdb)
    const xScale1 = viz1Scales.setXScale(graphSize1.width, imdb)
    const yScale1 = viz1Scales.setYScale(graphSize1.height, imdb)

    viz1Helper.drawXAxis(g1, xScale1, graphSize1.height)
    viz1Helper.drawYAxis(g1, yScale1)

    const flatData = Object.values(imdb).flat();
    const years = flatData.map(d => d.year);
    const minDate = d3.min(years);
    const maxDate = d3.max(years);
    viz1Legend.drawLegend(colorScale1, g1, graphSize1.width, graphSize1.height, minDate, maxDate)

    build1(g1, imdb, 0, radiusScale1, colorScale1, xScale1, yScale1)

    viz1Viz.setCircleHoverHandler(g1, tip)

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
      viz1Viz.drawCircles(g1, data, rScale1, colorScale1)
      viz1Viz.moveCircles(g1, xScale1, yScale1, transitionDuration)
    };


    /* Visualisation 2 - Équipe du film */

    function buildViz2_V2() {
      const margin2 = {
        top: 320,
        right: 320,
        bottom: 60,
        left: 450
      }
      
      const svgWidth = 850;
      const svgHeight = 650;
    
      viz2Helper.setCanvasSize(svgWidth, svgHeight);
    
      let currentData = null;
      let highlightEntity = null;
      let selectedEntityName = null;
      let selectedEntityType = null;
    
      const searchInput = document.getElementById("search-box");
      const collabSelect = document.getElementById("min-collab");
      const maxEntSelect = document.getElementById("max-entities");
      
      const svgViz2 = d3.select(".collaboration-chord-svg");
    
      const tooltip = viz2Tooltip.createTooltip();
      const dropdownContainer = viz2Search.createDropdownContainer();
      const dropdown = dropdownContainer.dropdown;
      
      function updateViz(newEntityName = null) {
        svgViz2.selectAll("*").remove();
        
        const g2 = viz2Helper.generateG(svgViz2, margin2, "graph-g-viz2");
        
        if (newEntityName !== null) {
          selectedEntityName = newEntityName;
          searchInput.value = newEntityName;
        }
        
        const minCollabVal = parseInt(collabSelect.value);
        const maxEntitiesVal = parseInt(maxEntSelect.value);
        const AllcollababorationsFiltered = Allcollababorations.filter(c => c.count >= minCollabVal);
        
        let data;
        
        if (selectedEntityName) {
          const filteredCollabsByEntity = viz2Process.filterDataByEntity(selectedEntityName, AllcollababorationsFiltered);
          data = viz2Process.processData(filteredCollabsByEntity, maxEntitiesVal, AllcollababorationsFiltered, selectedEntityName);
          
          const idx = data.entities.findIndex(name => name === selectedEntityName);
          highlightEntity = idx !== -1 ? idx : null;
        } else {
          const filteredCollabsByType = AllcollababorationsFiltered.filter(c => 
            (c.connectionType === 'actor/director' || c.connectionType === 'writer/director')
          );
          
          data = viz2Process.processData(filteredCollabsByType, maxEntitiesVal, AllcollababorationsFiltered);
          
          const searchVal = searchInput.value.toLowerCase();
          highlightEntity = null;
          if (searchVal) {
            const idx = data.entities.findIndex(name => name.toLowerCase().includes(searchVal));
            highlightEntity = idx !== -1 ? idx : null;
          }
        }
        
        currentData = data;

        if (!data || !data.entities || data.entities.length === 0) {
          viz2Viz.displayNoDataMessage(svgViz2, svgWidth, svgHeight);
          return;
        }

        const outerRadius = Math.min(svgWidth, svgHeight) / 2 - 90;
        const innerRadius = outerRadius * 0.9;

        const chord = viz2Scales.createChordScales();
        const arc = viz2Scales.createArcScales(innerRadius, outerRadius);
        const ribbon = viz2Scales.createRibbonScales(innerRadius);
        const colorScale = viz2Scales.createColorScale();
        const chords = chord(data.matrix);
        
          
        const group = g2.append("g")
        .selectAll("g")
        .data(chords.groups)
        .join("g");

        viz2Viz.drawArcs(data, g2, chords, group, arc, colorScale, tooltip, handleEntitySelect);
          
        viz2Viz.drawLabels(group, outerRadius, data);

        viz2Viz.drawRibbons(g2, chords, ribbon, colorScale, data, tooltip, AllcollababorationsFiltered, imdb);

        viz2Viz.updateHighlight(g2, chords, highlightEntity);
       
        dropdown.style("display", "none");
      }
      
      const handleEntitySelect = (entityName, entityType) => {
        updateViz(entityName, entityType);
      };
      
      searchInput.addEventListener("input", function() {
        const searchTerm = this.value.trim();
        
        if (searchTerm.length > 0) {
          const AllcollababorationsFiltered = Allcollababorations.filter(c => c.count >= collabSelect.value);
          viz2Search.updateDropdownSuggestions(searchTerm, AllcollababorationsFiltered, dropdown, handleEntitySelect);
        } else {
          dropdown.style("display", "none");
          selectedEntityName = null;
          selectedEntityType = null;
          updateViz();
        }
      });
      
      document.addEventListener("click", function(event) {
        if (!event.target.closest("#search-container")) {
          dropdown.style("display", "none");
        }
      });
      
      dropdown.on("click", function(event) {
        event.stopPropagation();
      });
    
      collabSelect.addEventListener("change", () => updateViz());
      maxEntSelect.addEventListener("change", () => updateViz());
      
      const resetButton = document.getElementById('reset-button');
      if (resetButton) {
        resetButton.addEventListener("click", () => {
          searchInput.value = '';
          collabSelect.value = 2;
          maxEntSelect.value = 20;
          selectedEntityName = null;
          selectedEntityType = null;
          
          updateViz();
        });
      }
    
      updateViz();
    }
    
    document.addEventListener("DOMContentLoaded", buildViz2_V2);
    
    const role = document.getElementById("y-role-select");
    const metric = document.getElementById("metric-select-team");
    
    buildViz2_V2(role, metric);
   
    

    /* Visualisation 3 - Genres et tendances */

    let metricViz3 = "rating"; // "box_office", 
    let selectedFilterViz3 = "genre";
    let intervalLenght = 10;
    let numElemPerStack = 4;


    function buildViz3(metricViz3, selectedFilterViz3, intervalLenght, numElemPerStack) {

      const viz3 = d3.select(".tendance-timeline-svg");
      const legendDiv = d3.select(".legend-tendances");

      // Clear previous content
      viz3.selectAll(".axes").remove();
      viz3.selectAll(".bars").remove();
      legendDiv.selectAll("*").remove();


      // Preprocessing
      const viz3Data = viz3Process.getDataPerTimeInterval(imdb, intervalLenght, metricViz3);  // if metric="rating" et on prend des intervalles de temps de 8 années
      const viz3MarketPerInterval = viz3Process.getMarketPerTimeInterval(viz3Data, selectedFilterViz3) //if selectedfilter = "genre"
      const viz3MarketPerIntervalSmall = viz3Process.reduceNumberOfLine(viz3MarketPerInterval, numElemPerStack); //seulement 4 genres par intervalle
      const intervalsDates = Object.keys(viz3MarketPerIntervalSmall["intervals"]);
      const stackedData = viz3Process.stackData(viz3MarketPerIntervalSmall);





      // setup graph scales
      const svgSizeViz3 = {
        width: 1000,
        height: 600
      }
      const marginViz3 = {
        top: 40,
        right: 40,
        bottom: 60,
        left: 100
      }
      const graphSizeViz3 = {
        width: svgSizeViz3.width - marginViz3.right - marginViz3.left,
        height: svgSizeViz3.height - marginViz3.bottom - marginViz3.top
      }
      viz3Helper.setCanvasSize(svgSizeViz3.width, svgSizeViz3.height);
      const viz3xScale = viz3Scales.setXScale(graphSizeViz3.width, intervalsDates);
      const viz3yScaleBoxOffice = viz3Scales.setYScale(graphSizeViz3.height);


      const axesViz3 = viz3.append("g").attr("class", "axes")
        .attr("transform", `translate(${marginViz3.left},${marginViz3.top})`);



      // Dessin des axes
      viz3Helper.appendAxes(axesViz3);
      viz3Helper.drawXAxis(viz3xScale, graphSizeViz3.height, intervalsDates);
      viz3Helper.drawYAxis(viz3yScaleBoxOffice);


      // Ajout des labels d'axes
      viz3Helper.appendGraphLabels(axesViz3);
      viz3Helper.positionLabels(axesViz3, graphSizeViz3.width, graphSizeViz3.height);


      const customColors = [
        "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
        "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
        "#393b79", "#637939", "#8c6d31", "#843c39", "#7b4173",
        "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
        "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5"
      ];
      const colorScale = d3.scaleOrdinal()
        .domain(viz3MarketPerIntervalSmall.presentCategory)
        .range(customColors);


      viz3Legend.createLegend(viz3MarketPerIntervalSmall, legendDiv, colorScale);


      const g3 = viz3Helper.generateG(viz3, marginViz3, "graph-g-viz3")
      const tip3 = d3Tip().attr('class', 'd3-tip').html(function (d) { return viz3Tooltip.getContents(d, colorScale) })
      g3.call(tip3)

      const series = d3.stack()
        .keys(viz3MarketPerIntervalSmall.presentCategory)(stackedData);

      // Créer un groupe de base où dessiner les barres
      const barsGroup = viz3.append("g")
        .attr("class", "bars")
        .attr("transform", `translate(${marginViz3.left},${marginViz3.top})`);

      barsGroup.selectAll("g.layer")
        .data(series)
        .enter()
        .append("g")
        .attr("class", "layer")
        .attr("fill", d => colorScale(d.key))
        .selectAll("rect")
        .data(d => {
          // On ajoute la catégorie à chaque élément
          return d.map(item => ({
            ...item,
            category: d.key
          }));
        })
        .enter()
        .append("rect")
        .attr('class', 'rect3')
        .attr("x", d => viz3xScale(d.data.interval))
        .attr("y", d => viz3yScaleBoxOffice(d[1]))
        .attr("height", d => viz3yScaleBoxOffice(d[0]) - viz3yScaleBoxOffice(d[1]))
        .attr("width", viz3xScale.bandwidth())


      // Hover d'un rectangle
      viz3Tooltip.setRectHoverHandler(viz3, tip3)

      // Exemple de lecture
      const randomRectData = viz3Example.selectRandomRectangle();
      const phraseEx = viz3Example.phraseExemple(randomRectData, colorScale);

      const exampleContainerViz3 = document.querySelector(".exampleViz3");

      exampleContainerViz3.innerHTML = phraseEx;

      // const textElementViz3 = document.createElement("p");
      // textElementViz3.textContent = "Exemple de lecture : " + phraseEx;
      // textElementViz3.classList.add("example-text")
      // textContainerViz3.appendChild(textElementViz3);

    }

    buildViz3(metricViz3, selectedFilterViz3, intervalLenght, numElemPerStack);




    // Gérer les changements d'option :
    const selectorMetric = document.getElementById('metric-select');
    selectorMetric.addEventListener('change', () => {
      buildViz3(selectorMetric.value, selectorCategory.value, parseInt(sliderMovieLenght.value, 10), parseInt(sliderMaxLine.value, 10));
    });

    const selectorCategory = document.getElementById('categorie-select');
    selectorCategory.addEventListener('change', () => {
      buildViz3(selectorMetric.value, selectorCategory.value, parseInt(sliderMovieLenght.value, 10), parseInt(sliderMaxLine.value, 10));
    });


    const sliderMovieLenght = document.getElementById('slider-movieLenght');
    const sliderMovieLenghtValue = document.getElementById('slider-movieLenght-value');

    sliderMovieLenght.addEventListener('input', () => {
      sliderMovieLenghtValue.textContent = sliderMovieLenght.value;
      buildViz3(selectorMetric.value, selectorCategory.value, parseInt(sliderMovieLenght.value, 10), parseInt(sliderMaxLine.value, 10));
    });


    const sliderMaxLine = document.getElementById('slider-maxLine');
    const sliderMaxLineValue = document.getElementById('slider-maxLine-value');

    sliderMaxLine.addEventListener('input', () => {
      sliderMaxLineValue.textContent = sliderMaxLine.value;
      buildViz3(selectorMetric.value, selectorCategory.value, parseInt(sliderMovieLenght.value, 10), parseInt(sliderMaxLine.value, 10));
    });



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

    let title;
    const ListOfFields = ["directors", "genre", "casts", "writers"];

    let viz4FixedImdb = viz4Process.addNumberOfNominations(imdb)

    let viz4xScale;
    let viz4yScaleBoxOffice;
    let viz4ColorScale;
    
    viz4CheckBoxes.generateCheckBoxes(ListOfFields);

    const viz4 = d3.select(".film-impact-svg");
    

    buildViz4(viz4FixedImdb);
    
    function buildViz4(viz4data) {

      viz4xScale = viz4Scales.setXScale(graphSize4.width, viz4data);
      viz4yScaleBoxOffice = viz4Scales.setEmptyYScale(graphSize4.height);

      const axes = viz4.append("g").attr("class", "axes")
        .attr("transform", 'translate(' + margin4.left + ', ' + margin4.top + ')');
      const courbes = viz4.append("g").attr("class", "courbes")
        .attr("transform", 'translate(' + margin4.left + ', ' + margin4.top + ')');

      viz4Helper.appendAxes(axes);
      viz4Helper.appendGraphLabels(axes);
      viz4Helper.positionLabels(axes, graphSize4.width, graphSize4.height);

      viz4Helper.drawXAxis(viz4xScale, graphSize4.height);
      viz4Helper.drawYAxis(viz4yScaleBoxOffice);

      viz4Search.initFilmList(viz4data);
    }

  function refreshViz4 (viz4data, viz4mesureSucces) {
      console.log("Changement");

      viz4CheckBoxes.checkAll();

      const dataToShow = viz4Process.indexData(title, viz4data, viz4mesureSucces);

      const test = viz4Process.generateDataToDisplay(title, dataToShow, ListOfFields, 2);
      console.log("Test refresh : ", test);

      const viz4yScaleFlexible = viz4Scales.setYScaleMesureSucces(graphSize4.height, test, "average");
      viz4Helper.drawYAxis(viz4yScaleFlexible);
      viz4Helper.resetYLabel(viz4, viz4mesureSucces);
      viz4ColorScale = viz4Scales.setColorScale(test);

      console.log(viz4ColorScale);
      viz4Viz.drawCircles(test, viz4xScale, viz4yScaleFlexible, viz4ColorScale, graphSize4.width);
      
      viz4Viz.drawRef(title, dataToShow, viz4xScale, viz4yScaleFlexible, graphSize4.height);

      const tip4 = d3Tip().attr('class', 'viz4-tip').html(function (d) { return viz4Tooltip.getContents(d, viz4mesureSucces) });
      viz4.select(".courbes").call(tip4);
      viz4Tooltip.setCircleHoverHandler(viz4.select(".courbes"), tip4);
    }

  selectorMetric.addEventListener('change', () => {
     refreshViz4(viz4FixedImdb, selectorMetric.value);
   });

  document.addEventListener('viz4movieSelected', (e) => {
    console.log("Received movie:", e.detail.movie);
    title = e.detail.movie;
    const viz4MesureSucces = selectorMetric.value;
    
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
  })
})(d3)
