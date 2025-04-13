import * as d3 from 'd3'
import { generateEntityTooltipContent, generateConnectionTooltipContent } from './viz2-tooltip.js'

/**
 * Renders the chord diagram.
 *
 * @param {object} data The processed data for the chord diagram
 * @param {number} svgWidth The width of the SVG
 * @param {number} svgHeight The height of the SVG
 * @param {string} containerId The ID of the container element
 * @param {number} highlightEntity The index of the highlighted entity, or null
 * @param {object} tooltip The tooltip element
 * @param {function} handleEntitySelect The function to handle entity selection
 * @param {object} collabs The collaborations data
 * @param {object} imdb The IMDB data
 */
export function renderChordDiagram(data, svgWidth, svgHeight, margin, containerId, highlightEntity, tooltip, handleEntitySelect, collabs, imdb) {
  // Check for undefined data
  if (!data || !data.entities) return;
  
  // Remove previous SVG to avoid rendering issues
  d3.select(`#${containerId}`).select("svg").remove();

  const svg = d3.select(`#${containerId}`).append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const outerRadius = Math.min(svgWidth, svgHeight) / 2 - 90;
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
      
      // Generate tooltip content with the imported function
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
      updateHighlight(); // Fall back to highlightEntity (click-based)
      tooltip.style("opacity", 0);
    })
    .on("click", (event, d) => {
      const entityName = data.entities[d.index];
      const entityType = data.types[d.index];
      
      // Use the common entity select handler
      handleEntitySelect(entityName, entityType);
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

  // Add ribbons
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

      // Generate tooltip content with the imported function
      const tooltipContent = generateConnectionTooltipContent(data, d, collabs, imdb);
      tooltip.html(tooltipContent)
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
}