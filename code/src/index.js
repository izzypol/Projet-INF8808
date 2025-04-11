// 'use strict'

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

/* Visualisation 1 - Importations */
import * as viz2Process from './viz2-scripts/viz2-preprocess.js'
import * as viz2Helper from './viz2-scripts/viz2-helper.js'
import * as viz2Scales from './viz2-scripts/viz2-scales.js'
import * as viz2Viz from './viz2-scripts/viz2-viz.js'

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
    console.log(contributorData.directors)
    const countCollab = [];
    const collabs = countCollaborations(imdb)
    console.log(collabs)
    
    const directorMin2Movies = Object.entries(contributorData.directors).filter( d => d[1].nMovies >= 2).map(d=> d[0]);
    console.log(directorMin2Movies)
    for (const collab in collabs.actorDirectorCollabs){
      const c = collabs.actorDirectorCollabs[collab]; 
      if(directorMin2Movies.includes(c.director)){
        countCollab.push(c);
      }
    }
    
    console.log(countCollab)
    const genreData = getMoviesByGenre(imdb)
    const collaborationsData = getTopCollaborations(imdb)
    console.log(collaborationsData)
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
    const years = flatData.map(d => new Date(d.releaseDate).getFullYear());
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

    function buildViz2(roleSelectEl, metricSelectEl) {
      // Clear previous content
      const svg = d3.select(".team-heatmap-svg");
      const legendDiv = d3.select(".legend-team");
      svg.selectAll("*").remove();
      legendDiv.selectAll("*").remove();
    
      const role = 'actor'; // 'actor' or 'writer'
      const metric = 'box_office'; // 'box_office' or 'rating'
    
      const rawData = role === 'actor'
        ? collaborationsData.topActorDirectorCollabs.slice(0, 10)
        : collaborationsData.topWriterDirectorCollabs.slice(0, 10);
      
      console.log(rawData)
      const topY = d3.rollups(
        rawData,
        v => d3.mean(v, d => metric === 'box_office' ? d['avgBoxOffice'] : d['avgRating']),
        d => d[role]
      )
        .map(([actor, avg]) => ({ actor, avg }))

      const filteredData = rawData.filter(d => topY.map(d => d.actor).includes(d[role]));
      const directors = [...new Set(filteredData.map(d => d.director))]
    

      // setup graph scales
      const svgSizeViz2 = {
        width: 1000,
        height: 600
      }
      const marginViz2 = {
        top: 40,
        right: 20,
        bottom: 60,
        left: 160
      }
      const graphSizeViz2 = {
        width: svgSizeViz2.width - marginViz2.right - marginViz2.left,
        height: svgSizeViz2.height - marginViz2.bottom - marginViz2.top
      }

      viz2Helper.setCanvasSize(svgSizeViz2.width, svgSizeViz2.height);
      const xScale = viz2Scales.setXScale(graphSizeViz2.width, directors);
      const yScale = viz2Scales.setYScale(graphSizeViz2.height, topY);

      const width = svgSizeViz2.width + marginViz2.left + marginViz2.right;
      const height = svgSizeViz2.height + marginViz2.top + marginViz2.bottom;
      viz2Helper.setCanvasSize(width, height);
    
      const g = svg.append("g").attr("transform", `translate(${marginViz2.left},${marginViz2.top})`);
    
      const colorScale2 = viz2Scales.setColorScale(topY);

      viz2Helper.appendAxes(g);
      viz2Helper.drawXAxis(xScale);
      viz2Helper.drawYAxis(yScale, topY);

      // DATA VISUALIZATION: Create cells as squares with color
      const cellData = viz2Process.getCellData(directors, topY, filteredData);
      console.log(directors)
      console.log(topY)
      console.log(filteredData)
      // Generate data for the heatmap grid
     
      viz2Viz.drawSquares(g, cellData, xScale, yScale, colorScale2);
    
      // Row summary (avg metric) - colored bars on the left showing the average performance
      // const rowSums = d3.rollups(
      //   filteredData,
      //   v => d3.mean(v, d => d[metric]),
      //   d => d[role]
      // );
    
      // const rowSumScale = d3.scaleSequential()
      //   .interpolator(d3.interpolateYlOrRd)
      //   .domain([0, d3.max(rowSums, d => d[1])]);
    
      // // Add summary bars
      // g.selectAll(".row-summary")
      //   .data(rowSums)
      //   .enter()
      //   .append("rect")
      //   .attr("class", "row-summary")
      //   .attr("x", -175)
      //   .attr("y", d => yScale(d[0]))
      //   .attr("width", 160)
      //   .attr("height", yScale.bandwidth())
      //   .attr("fill", d => rowSumScale(d[1]))
      //   .attr("stroke", "#000")
      //   .attr("stroke-width", 1);
    
      // // Add summary text
      // g.selectAll(".row-summary-text")
      //   .data(rowSums)
      //   .enter()
      //   .append("text")
      //   .attr("class", "row-summary-text")
      //   .attr("x", -95)
      //   .attr("y", d => yScale(d[0]) + yScale.bandwidth() / 2 + 5)
      //   .style("text-anchor", "middle")
      //   .style("fill", "#000")
      //   .style("font-size", "12px")
      //   .text(d => `Moyenne totale ${role === 'actor' ? 'acteur' : 'scénariste'} ${topY.indexOf(d[0])+1}`);
    
      // // Add sidebar selector
      // const sidebar = svg.append("g")
      //   .attr("transform", `translate(${width + margin.left + 20}, ${margin.top})`);
    
      // sidebar.append("rect")
      //   .attr("x", 0)
      //   .attr("y", 0)
      //   .attr("width", 120)
      //   .attr("height", 100)
      //   .attr("fill", "#f5f5f5")
      //   .attr("stroke", "#ccc");
    
      // sidebar.append("text")
      //   .attr("x", 10)
      //   .attr("y", 25)
      //   .text("Acteurs")
      //   .attr("font-size", "14px")
      //   .attr("fill", role === 'actor' ? "#000" : "#999");
    
      // sidebar.append("text")
      //   .attr("x", 10)
      //   .attr("y", 50)
      //   .text("Scénaristes")
      //   .attr("font-size", "14px")
      //   .attr("fill", role === 'writer' ? "#000" : "#999");
    
      // sidebar.append("text")
      //   .attr("x", 10)
      //   .attr("y", 80)
      //   .text("Réalisateurs")
      //   .attr("font-size", "14px")
      //   .attr("font-weight", "bold");
      
      // Add a color legend
      // const legendWidth = 120;
      // const legendHeight = 20;
      
      // const legendX = width + margin.left + 20;
      // const legendY = margin.top + 150;
      
      // const defs = svg.append("defs");
      
      // const linearGradient = defs.append("linearGradient")
      //   .attr("id", "heatmap-gradient")
      //   .attr("x1", "0%")
      //   .attr("y1", "0%")
      //   .attr("x2", "100%")
      //   .attr("y2", "0%");
      
      // linearGradient.append("stop")
      //   .attr("offset", "0%")
      //   .attr("stop-color", colorScale.interpolator()(0));
      
      // linearGradient.append("stop")
      //   .attr("offset", "100%")
      //   .attr("stop-color", colorScale.interpolator()(1));
      
      // svg.append("rect")
      //   .attr("x", legendX)
      //   .attr("y", legendY)
      //   .attr("width", legendWidth)
      //   .attr("height", legendHeight)
      //   .style("fill", "url(#heatmap-gradient)");
      
      // svg.append("text")
      //   .attr("x", legendX)
      //   .attr("y", legendY - 10)
      //   .text("Faible")
      //   .style("font-size", "12px");
      
      // svg.append("text")
      //   .attr("x", legendX + legendWidth)
      //   .attr("y", legendY - 10)
      //   .style("text-anchor", "end")
      //   .text("Élevé")
      //   .style("font-size", "12px");
      
      // svg.append("text")
      //   .attr("x", legendX + (legendWidth / 2))
      //   .attr("y", legendY + legendHeight + 20)
      //   .style("text-anchor", "middle")
      //   .text(metric === 'box_office' ? "Box Office" : "Note IMDB")
      //   .style("font-size", "12px");
    }
    
    function buildViz2_V2() {
      const svgWidth = 800;
      const svgHeight = 600;
      const containerId = "team-heatmap";
    
      let currentData = null;
      let highlightEntity = null;
    
      const searchInput = document.getElementById("search-box");
      const collabSelect = document.getElementById("min-collab");
      const maxEntSelect = document.getElementById("max-entities");
    
      // Enhanced tooltip with more styling
      let tooltip = d3.select(".tooltip");
      if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(255, 255, 255, 0.95)")
          .style("border", "1px solid #ddd")
          .style("border-radius", "6px")
          .style("padding", "8px 12px")
          .style("font-size", "13px")
          .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
          .style("pointer-events", "none")
          .style("opacity", 0)
          .style("max-width", "300px")
          .style("transition", "opacity 0.2s");
      }
    
      // Function to generate detailed tooltip content
      const generateTooltipContent = (entity, type, data, index) => {
        const connections = [];
        
        // Find all connections for this entity
        data.matrix[index].forEach((count, i) => {
          if (count > 0 && i !== index) {
            connections.push({
              name: data.entities[i],
              type: data.types[i],
              count: count
            });
          }
        });
    
        // Sort connections by count (descending)
        connections.sort((a, b) => b.count - a.count);
    
        let content = `<div style="margin-bottom: 6px;">
                        <strong style="font-size: 14px; color: ${type === 'actor' ? '#4285F4' : '#EA4335'}">${entity}</strong><br>
                        <span style="color: #666">${type === 'actor' ? 'Actor' : 'Director'}</span>
                      </div>`;
    
        if (connections.length > 0) {
          content += `<div style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 6px;">
                        <div style="font-size: 12px; color: #555; margin-bottom: 4px;">Collaborations:</div>`;
          
          connections.forEach(conn => {
            content += `<div style="font-size: 11px; margin: 2px 0; display: flex; justify-content: space-between;">
                         <span>${conn.name} <span style="color: ${conn.type === 'actor' ? '#4285F4' : '#EA4335'}">(${conn.type})</span></span>
                         <span style="font-weight: bold; margin-left: 10px;">${conn.count}</span>
                       </div>`;
          });
          
          content += `</div>`;
        } else {
          content += `<div style="margin-top: 8px; color: #999; font-size: 11px;">No direct collaborations</div>`;
        }
    
        return content;
      };
    
      const processData = (rawData, maxEntities) => {
        // [Previous processData implementation remains exactly the same]
        // First get all actors from actorDirectorData
        const actorsFromDirectorData = [...new Set(rawData.map(c => c.actor))];
        
        // Filter actorActorData to only include actors that are in actorDirectorData
        const validActorActorCollabs = collabs.actorActorCollabs.filter(c => {
          return actorsFromDirectorData.includes(c.actor1) && actorsFromDirectorData.includes(c.actor2);
        });
        
        console.log(validActorActorCollabs)
        // Get all directors from actorDirectorData
        const directors = [...new Set(rawData.map(c => c.director))];
      
        // Calculate counts for actors and directors
        const actorCounts = {}, directorCounts = {};
        rawData.forEach(c => {
          actorCounts[c.actor] = (actorCounts[c.actor] || 0) + c.count;
          directorCounts[c.director] = (directorCounts[c.director] || 0) + c.count;
        });
      
        // Get top actors and directors
        const topActors = actorsFromDirectorData.sort((a, b) => actorCounts[b] - actorCounts[a]).slice(0, Math.ceil(maxEntities / 2));
        const topDirectors = directors.sort((a, b) => directorCounts[b] - directorCounts[a]).slice(0, Math.floor(maxEntities / 2));
        const allEntities = [...topActors, ...topDirectors];
        const allTypes = [...topActors.map(() => 'actor'), ...topDirectors.map(() => 'director')];
      
        // Create initial matrix with all potential entities
        const initialMatrix = Array.from({ length: allEntities.length }, () => Array(allEntities.length).fill(0));
        
        // Add actor-director connections from actorDirectorData
        rawData.forEach(({ actor, director, count }) => {
          const aIdx = allEntities.indexOf(actor), dIdx = allEntities.indexOf(director);
          if (aIdx !== -1 && dIdx !== -1) {
            initialMatrix[aIdx][dIdx] = count;
            initialMatrix[dIdx][aIdx] = count;
          }
        });
        
        // Add actor-actor connections from filtered actorActorData
        validActorActorCollabs.forEach(({ actor1, actor2, count }) => {
          const a1Idx = allEntities.indexOf(actor1), a2Idx = allEntities.indexOf(actor2);
          if (a1Idx !== -1 && a2Idx !== -1) {
            initialMatrix[a1Idx][a2Idx] = count;
            initialMatrix[a2Idx][a1Idx] = count;
          }
        });
      
        // Now filter out entities that have no connections
        const connectedIndices = new Set();
        
        // Find all indices that have at least one connection
        for (let i = 0; i < initialMatrix.length; i++) {
          for (let j = 0; j < initialMatrix[i].length; j++) {
            if (initialMatrix[i][j] > 0) {
              connectedIndices.add(i);
              connectedIndices.add(j);
            }
          }
        }
      
        // If no entities have connections, return empty data
        if (connectedIndices.size === 0) {
          return { matrix: [], entities: [], types: [] };
        }
      
        // Create new arrays with only connected entities
        const connectedEntities = [];
        const connectedTypes = [];
        const indexMap = {}; // Maps old indices to new indices
        
        Array.from(connectedIndices).sort((a, b) => a - b).forEach((oldIndex, newIndex) => {
          connectedEntities.push(allEntities[oldIndex]);
          connectedTypes.push(allTypes[oldIndex]);
          indexMap[oldIndex] = newIndex;
        });
      
        // Create new matrix with only connected entities
        const matrix = Array.from({ length: connectedEntities.length }, () => Array(connectedEntities.length).fill(0));
        
        // Populate the new matrix with connections
        for (let i = 0; i < initialMatrix.length; i++) {
          if (indexMap[i] === undefined) continue;
          for (let j = 0; j < initialMatrix[i].length; j++) {
            if (indexMap[j] === undefined) continue;
            if (initialMatrix[i][j] > 0) {
              matrix[indexMap[i]][indexMap[j]] = initialMatrix[i][j];
              matrix[indexMap[j]][indexMap[i]] = initialMatrix[i][j];
            }
          }
        }
      
        return { matrix, entities: connectedEntities, types: connectedTypes };
      };
    
      const filterDataByEntity = (entityName, entityType, rawData) => {
        if (entityType === 'actor') {
          // Find all directors this actor worked with
          const directorCollabs = rawData.actorDirectorCollabs
            .filter(c => c.actor === entityName);
          
          // Find all actors this actor worked with
          const actorCollabs = rawData.actorActorCollabs
            .filter(c => c.actor1 === entityName || c.actor2 === entityName)
            .map(c => c.actor1 === entityName ? c.actor2 : c.actor1);
          
          // Get unique directors and actors
          const directors = [...new Set(directorCollabs.map(c => c.director))];
          const actors = [...new Set(actorCollabs)];
          
          // Return filtered data including both actor-director and actor-actor collabs
          return {
            actorDirectorCollabs: directorCollabs,
            actorActorCollabs: rawData.actorActorCollabs.filter(c => 
              actors.includes(c.actor1) && actors.includes(c.actor2))
          };
        } else if (entityType === 'director') {
          // Find all actors this director worked with
          const actorCollabs = rawData.actorDirectorCollabs
            .filter(c => c.director === entityName);
          
          // Return filtered data
          return {
            actorDirectorCollabs: actorCollabs,
            actorActorCollabs: rawData.actorActorCollabs.filter(c => 
              actorCollabs.some(ad => ad.actor === c.actor1 || ad.actor === c.actor2))
          };
        }
        return rawData; // fallback
      };
      
      const renderChordDiagram = (data) => {
        // [Previous renderChordDiagram implementation remains the same until the tooltip part]
        // Important: Need to check for undefined data
        if (!data || !data.entities) return;
        
        // Remove previous SVG to avoid rendering issues
        d3.select(`#${containerId}`).select("svg").remove();
    
        const svg = d3.select(`#${containerId}`).append("svg")
          .attr("width", svgWidth)
          .attr("height", svgHeight);
    
        const outerRadius = Math.min(svgWidth, svgHeight) / 2 - 60;
        const innerRadius = outerRadius * 0.9;
    
        const g = svg.append("g")
          .attr("transform", `translate(${svgWidth / 2}, ${svgHeight / 2})`);
    
        const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);
        const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
        const ribbon = d3.ribbon().radius(innerRadius);
        const colorScale = d3.scaleOrdinal().domain(['actor', 'director']).range(['#4285F4', '#EA4335']);
        const chords = chord(data.matrix);
    
        // Helper function to find indices connected to the given entity
        const findConnectedIndices = (idx) => {
          if (idx === null) return [];
          const connected = new Set();
          chords.forEach(d => {
            if (d.source.index === idx) {
              connected.add(d.target.index);
            } else if (d.target.index === idx) {
              connected.add(d.source.index);
            }
          });
          return Array.from(connected);
        };
    
        // Function to update elements based on hover or click
        const updateHighlight = (hoverIdx = null) => {
          // Determine what's being highlighted (hover takes precedence over click)
          const activeIdx = hoverIdx !== null ? hoverIdx : highlightEntity;
          
          if (activeIdx === null) {
            // No highlighting - reset all elements to normal
            g.selectAll(".arc-path").style("opacity", 1);
            g.selectAll(".entity-label").style("font-weight", "normal").style("opacity", 1);
            g.selectAll(".ribbon-path").style("opacity", 0.65);
            return;
          }
          
          // Find connected entities
          const connectedIndices = findConnectedIndices(activeIdx);
          
          // Update arcs opacity
          g.selectAll(".arc-path")
            .style("opacity", d => {
              if (d.index === activeIdx) return 1; // Main highlighted entity
              if (connectedIndices.includes(d.index)) return 0.8; // Connected entities
              return 0.3; // Other entities
            });
          
          // Update text weight and opacity
          g.selectAll(".entity-label")
            .style("font-weight", d => {
              if (d.index === activeIdx) return "bold"; 
              if (connectedIndices.includes(d.index)) return "bold"; // Connected entities
              return "normal";
            })
            .style("opacity", d => {
              if (d.index === activeIdx) return 1; // Main highlighted entity
              if (connectedIndices.includes(d.index)) return 0.9; // Connected entities
              return 0.3; // Other entities
            });
          
          // Update ribbons opacity
          g.selectAll(".ribbon-path")
            .style("opacity", d => {
              // Highlight connections to/from the active entity
              if (d.source.index === activeIdx || d.target.index === activeIdx) return 0.8;
              return 0.1; // Dim other connections
            });
        };
    
        // Create groups
        const group = g.append("g")
          .selectAll("g")
          .data(chords.groups)
          .join("g");
    
        // Add arcs
        group.append("path")
          .attr("class", "arc-path")
          .attr("fill", d => colorScale(data.types[d.index]))
          .attr("d", arc)
          .style("opacity", 1)
          .on("mouseover", (event, d) => {
            updateHighlight(d.index);
            // Show enhanced tooltip with detailed information
            tooltip.html(generateTooltipContent(data.entities[d.index], data.types[d.index], data, d.index))
              .style("left", (event.pageX + 18) + "px")
              .style("top", (event.pageY - 18) + "px")
              .style("opacity", 1);
          })
          .on("mouseout", () => {
            updateHighlight(); // Fall back to highlightEntity (click-based)
            tooltip.style("opacity", 0);
          })
          .on("click", (event, d) => {
            const entityName = data.entities[d.index];
            const entityType = data.types[d.index];
            
            // Filter the raw data to only include connections to this entity
            const filteredRawData = filterDataByEntity(entityName, entityType, collabs);
            
            // Process the filtered data (using your existing processData function)
            const newData = processData(filteredRawData.actorDirectorCollabs, maxEntSelect.value);
            
            // Re-render the visualization with the filtered data
            renderChordDiagram(newData);
            
            // Update currentData to the filtered set
            currentData = newData;
            
            // Highlight the clicked entity
            highlightEntity = d.index;
            updateHighlight();
          });
    
        // Add labels
        group.append("text")
          .attr("class", "entity-label")
          .each(d => d.angle = (d.startAngle + d.endAngle) / 2)
          .attr("transform", d => 
            `rotate(${(d.angle * 180 / Math.PI - 90)})
             translate(${outerRadius + 5})
             ${d.angle > Math.PI ? "rotate(180)" : ""}`
          )
          .attr("dy", "0.35em")
          .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
          .text(d => data.entities[d.index])
          .style("font-size", "10px");
    
          
        
      g.append("g")
      .attr("fill-opacity", 0.65)
      .selectAll("path")
      .data(chords)
      .join("path")
      .attr("class", "ribbon-path")
      .attr("d", ribbon)
      .attr("fill", d => d3.interpolateRgb(
        colorScale(data.types[d.source.index]),
        colorScale(data.types[d.target.index])
      )(0.5))
      .on("mouseover", (event, d) => {
        // Highlight only this ribbon and its connected nodes
        g.selectAll(".ribbon-path")
          .style("opacity", ribbonD => {
            return (ribbonD.source.index === d.source.index && 
                    ribbonD.target.index === d.target.index) ? 1 : 0.1;
          });
        
        // Highlight connected nodes
        g.selectAll(".arc-path")
          .style("opacity", arcD => {
            return (arcD.index === d.source.index || 
                    arcD.index === d.target.index) ? 1 : 0.3;
          });
        
        // Highlight connected labels
        g.selectAll(".entity-label")
          .style("opacity", labelD => {
            return (labelD.index === d.source.index || 
                    labelD.index === d.target.index) ? 1 : 0.3;
          })
          .style("font-weight", labelD => {
            return (labelD.index === d.source.index || 
                    labelD.index === d.target.index) ? "bold" : "normal";
          });

        // Find the collaboration data
        let avgBoxOffice = null;
        let moviesList = [];
        const sourceType = data.types[d.source.index];
        const targetType = data.types[d.target.index];
        const sourceName = data.entities[d.source.index];
        const targetName = data.entities[d.target.index];
        
        if (sourceType === 'actor' && targetType === 'director') {
          const collab = collabs.actorDirectorCollabs.find(c => 
            c.actor === sourceName && c.director === targetName);
          if (collab) {
            avgBoxOffice = collab.avgBoxOffice;
            moviesList = collab.movies || [];
          }
        } else if (sourceType === 'actor' && targetType === 'actor') {
          const collab = collabs.actorActorCollabs.find(c => 
            (c.actor1 === sourceName && c.actor2 === targetName) ||
            (c.actor1 === targetName && c.actor2 === sourceName));
          if (collab) {
            avgBoxOffice = collab.avgBoxOffice;
            moviesList = collab.movies || [];
          }
        }
        
        let updatedMovieList = []
        imdb.map((movie) => {
          if(moviesList.includes(movie.name)){
            updatedMovieList.push(movie);
          }
        })
        
        const boxOfficeText = avgBoxOffice ? 
          `$${avgBoxOffice.toLocaleString()}` : 'N/A';

      // Create movies list HTML with profit data
      let moviesHTML = '';
      if (updatedMovieList.length > 0) {
        moviesHTML = `<div style="margin-top: 6px; border-top: 1px solid #eee; padding-top: 4px;">
          <div style="max-height: 120px; overflow-y: auto; font-size: 10px;">`;
        
        updatedMovieList.forEach(movie => {
          let profitDisplay = '';
          if (movie.profit !== undefined && movie.profit !== null) {
            const sign = movie.profit >= 0 ? '+' : '-';
            const color = movie.profit >= 0 ? '#2e7d32' : '#c62828';
            profitDisplay = `<span style="color: ${color}; margin-left: 5px;">
              ${sign}$${Math.abs(movie.profit).toLocaleString()}
            </span>`;
          }
          
          const yearDisplay = movie.year ? `<span style="color: #666;">(${movie.year})</span>` : '';
          
          moviesHTML += `
          <div style="display: flex; align-items: center; justify-content: space-between; margin: 4px 0; padding: 4px 0; ">
            <div style="font-weight: 500;">
              ${movie.name} ${yearDisplay}
            </div>
            ${profitDisplay}
          </div>`;
        });
        
        moviesHTML += `</div></div>`;
      }
        // Show tooltip for the connection
        tooltip.html(`
          <div style="margin-bottom: 4px;">
            <strong>Collaboration(s): ${d.source.value} </strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: ${sourceType === 'actor' ? '#4285F4' : '#EA4335'}">
              ${sourceName}
            </span>
            <span style="color: ${targetType === 'actor' ? '#4285F4' : '#EA4335'}">
              ${targetName}
            </span>
          </div>
          <div style="margin-top: 6px; border-top: 1px solid #eee; padding-top: 4px;">
            <div style="font-size: 11px;">
              <span style="color: #555;">Average Box Office:</span>
              <span style="font-weight: bold; margin-left: 5px;">${boxOfficeText}</span>
            </div>
          </div>
          ${moviesHTML}
        `)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 15) + "px")
        .style("opacity", 1);
      })
      .on("mouseout", () => {
        // Restore original highlighting (based on clicked entity if any)
        updateHighlight();
        tooltip.style("opacity", 0);
      });

        // Set initial highlight state
        updateHighlight();
      };
    
      function updateViz() {
        const minCollabVal = parseInt(collabSelect.value);
        const maxEntitiesVal = parseInt(maxEntSelect.value);
        const searchVal = searchInput.value.toLowerCase();
    
        const filteredData = collabs.actorDirectorCollabs.filter(c => c.count >= minCollabVal);
        console.log(filteredData)
        const data = processData(filteredData, maxEntitiesVal);
    
        currentData = data;
    
        highlightEntity = null;
        if (searchVal) {
          const idx = data.entities.findIndex(name => name.toLowerCase().includes(searchVal));
          highlightEntity = idx !== -1 ? idx : null;
        }
    
        renderChordDiagram(data);
      }
    
      searchInput.addEventListener("input", updateViz);
      collabSelect.addEventListener("change", updateViz);
      maxEntSelect.addEventListener("change", updateViz);
    
      updateViz();
    }
    
    document.addEventListener("DOMContentLoaded", buildViz2_V2);
    
    const role = document.getElementById("y-role-select");
    const metric = document.getElementById("metric-select-team");
    
    buildViz2_V2(role, metric);
    // // Event listeners for dropdown changes
    // document.getElementById("y-role-select").addEventListener("change", function() {
    //   buildViz2(this, document.getElementById("metric-select-team"));
    // });
    
    // document.getElementById("metric-select-team").addEventListener("change", function() {
    //   buildViz2(document.getElementById("y-role-select"), this);
    // });
    
    
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
      console.log("Phrase exemple : ", phraseEx);

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

    const margin = {
      top: 75,
      right: 200,
      bottom: 100,
      left: 80
    }

    let svgSize, graphSize

    function setSizing() {
      svgSize = {
        width: 1000,
        height: 600
      }

      graphSize = {
        width: svgSize.width - margin.right - margin.left,
        height: svgSize.height - margin.bottom - margin.top
      }

      viz4Helper.setCanvasSize(svgSize.width, svgSize.height)
    }

    setSizing();

    const viz4xScale = viz4Scales.setXScale(graphSize.width, imdb);
    const viz4yScaleBoxOffice = viz4Scales.setYScaleBO(graphSize.height, imdb);

    const viz4 = d3.select(".film-impact-svg");

    const axes = viz4.append("g").attr("class", "axes")
      .attr("transform", 'translate(' + margin.left + ', ' + margin.top + ')');
    const courbes = viz4.append("g").attr("class", "courbes")
      .attr("transform", 'translate(' + margin.left + ', ' + margin.top + ')');

    viz4Helper.appendAxes(axes);
    viz4Helper.appendGraphLabels(axes);
    viz4Helper.positionLabels(axes, graphSize.width, graphSize.height);

    viz4Helper.drawXAxis(viz4xScale, graphSize.height);
    viz4Helper.drawYAxis(viz4yScaleBoxOffice);

    let title;
    const ListOfFields = ["directors", "year", "genre"];

    const viz4ColorScale = viz4Scales.setColorScale(ListOfFields);

    document.addEventListener('viz4movieSelected', (e) => {
      console.log("Received movie:", e.detail.movie);
      title = e.detail.movie;
      // Update your visualization
      //const testProcess = viz4Process.getMoviesBySameField(title, imdb, "directors");
      //const testProcess2 = viz4Process.getMoviesBySameField(title, imdb, "year");
      //console.log("liste : ", testProcess);
      //viz4Viz.drawCircles(testProcess, viz4xScale, viz4yScaleBoxOffice);
      const test = viz4Process.generateDataToDisplay(title, imdb, ListOfFields);
      console.log("Test", test);
      viz4Viz.drawAllCategories(test, viz4xScale, viz4yScaleBoxOffice, viz4ColorScale);

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
