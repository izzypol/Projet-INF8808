import * as d3 from 'd3'
import { generateEntityTooltipContent, generateConnectionTooltipContent } from './viz2-tooltip.js'

/**
 * Display a message when no data is available
 * @param {d3.Selection} svg - The D3 selection for the SVG element
 * @param {number} width - The width of the SVG element
 * @param {number} height - The height of the SVG element
 */
export function displayNoDataMessage(svg, width, height) {
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-size", "16px")
    .style("fill", "#666")
    .text("Aucune donnée disponible. Essayez avec un autre entité ou ajustez les filtres.");
}

/**
 * Find indices connected to the given entity
 * @param {number} idx - The index of the entity to find connections for
 * @param {Array} chords - The chord data
 * @returns {Array} An array of indices connected to the given entity
 */
export function findConnectedIndices(idx, chords) {
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
}

/**
 * Update the highlighting of elements in the chord diagram
 * @param {Object} g - The D3 group selection
 * @param {Array} chords - The chord data
 * @param {number} highlightEntity - The index of the entity to highlight
 * @param {number} hoverIdx - The index of the hovered entity (optional)
 */
export function updateHighlight(g, chords, highlightEntity, hoverIdx = null) {
  const activeIdx = hoverIdx !== null ? hoverIdx : highlightEntity;
  
  if (activeIdx === null) {
    g.selectAll(".arc-path").style("opacity", 1);
    g.selectAll(".entity-label").style("font-weight", "normal").style("opacity", 1);
    g.selectAll(".ribbon-path").style("opacity", 0.65);
    return;
  }
  
  const connectedIndices = findConnectedIndices(activeIdx, chords);
  
  g.selectAll(".arc-path")
    .style("opacity", d => {
      if (d.index === activeIdx) return 1;
      if (connectedIndices.includes(d.index)) return 0.8;
      return 0.3;
    });
  
  g.selectAll(".entity-label")
    .style("font-weight", d => {
      if (d.index === activeIdx) return "bold";
      if (connectedIndices.includes(d.index)) return "bold";
      return "normal";
    })
    .style("opacity", d => {
      if (d.index === activeIdx) return 1;
      if (connectedIndices.includes(d.index)) return 0.9;
      return 0.3;
    });
  
  g.selectAll(".ribbon-path")
    .style("opacity", d => {
      if (d.source.index === activeIdx || d.target.index === activeIdx) return 0.8;
      return 0.1;
    });
}

/**
 * Create entity labels for the chord diagram
 * @param {d3.Selection} group - The D3 selection for the group element
 * @param {number} outerRadius - The outer radius of the chord diagram
 * @param {Object} data - The data object containing entity information
 */
export function drawLabels(group, outerRadius, data) {
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
}

/**
 * Create ribbons for the chord diagram
 * @param {d3.Selection} g - The D3 selection for the group element
 * @param {Array} chords - The chord data
 * @param {d3.Ribbon} ribbon - The ribbon generator
 * @param {d3.ScaleOrdinal} colorScale - The color scale for the ribbons
 * @param {Object} data - The data object containing entity information
 * @param {d3.Selection} tooltip - The D3 selection for the tooltip element
 */
export function drawRibbons(g, chords, ribbon, colorScale, data, tooltip, collabs, imdb) {
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
      g.selectAll(".ribbon-path")
        .style("opacity", ribbonD => {
          return (ribbonD.source.index === d.source.index && 
                  ribbonD.target.index === d.target.index) ? 1 : 0.1;
        });
      
      g.selectAll(".arc-path")
        .style("opacity", arcD => {
          return (arcD.index === d.source.index || 
                  arcD.index === d.target.index) ? 1 : 0.3;
        });
      
      g.selectAll(".entity-label")
        .style("opacity", labelD => {
          return (labelD.index === d.source.index || 
                  labelD.index === d.target.index) ? 1 : 0.3;
        })
        .style("font-weight", labelD => {
          return (labelD.index === d.source.index || 
                  labelD.index === d.target.index) ? "bold" : "normal";
        });

      const tooltipContent = generateConnectionTooltipContent(data, d, collabs, imdb);
      tooltip.html(tooltipContent)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 15) + "px")
        .style("opacity", 1);
    })
    .on("mouseout", () => {
      updateHighlight(g, chords, null);
      tooltip.style("opacity", 0);
    });
}

/**
 * Draw arcs for the chord diagram
 * @param {Object} data - The data object containing entity information
 * @param {d3.Selection} g - The D3 selection for the group element
 * @param {Array} chords - The chord data
 * @param {d3.Selection} group - The D3 selection for the group element
 * @param {d3.Arc} arc - The arc generator
 * @param {d3.ScaleOrdinal} colorScale - The color scale for the arcs
 * @param {d3.Selection} tooltip - The D3 selection for the tooltip element
 * @param {Function} handleEntitySelect - The function to handle entity selection
 */
export function drawArcs(data, g, chords, group, arc, colorScale, tooltip, handleEntitySelect) {
  group.append("path")
  .attr("class", "arc-path")
  .attr("fill", d => colorScale(data.types[d.index]))
  .attr("d", arc)
  .style("opacity", 1)
  .on("mouseover", (event, d) => {
    updateHighlight(g, chords, null, d.index);
    
    const tooltipContent = generateEntityTooltipContent(
      data.entities[d.index], 
      data.types[d.index], 
      data, 
      d.index
    );
    
    tooltip.html(tooltipContent)
      .style("left", (event.pageX + 18) + "px")
      .style("top", (event.pageY - 18) + "px")
      .style("opacity", 1);
  })
  .on("mouseout", () => {
    updateHighlight(g, chords, null);
    tooltip.style("opacity", 0);
  })
  .on("click", (event, d) => {
    const entityName = data.entities[d.index];
    const entityType = data.types[d.index];
    
    handleEntitySelect(entityName, entityType);
  }); 
}