/**
 * Generates the SVG element g which will contain the data visualisation.
 *
 * @param {object} margin The desired margins around the graph
 * @returns {*} The d3 Selection for the created g element
 */
export function margeG (g, margin) {
    g.attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')')
  }
  
  /**
   * Sets the size of the SVG canvas containing the graph.
   *
   * @param {number} width The desired width
   * @param {number} height The desired height
   */
  export function setCanvasSize (width, height) {
    d3.select('.team-heatmap-svg')
      .attr('width', width)
      .attr('height', height)
  }
  
  /**
   * Appends an SVG g element which will contain the axes.
   *
   * @param {*} g The d3 Selection of the graph's g SVG element
   */
  export function appendAxes (g) {
    g.append('g')
      .attr('class', 'x2 axis')
  
    g.append('g')
      .attr('class', 'y2 axis')
  }
  /**
   * Appends the labels for the the y axis and the title of the graph.
   *
   * @param {*} g The d3 Selection of the graph's g SVG element
   */
  export function appendGraphLabels (g) {
    g.append('text')
      .text('%')
      .attr('class', 'y axis-text')
      .attr('transform', 'rotate(-90)')
      .attr('font-size', 12)
  
    g.append('text')
      .text('Année')
      .attr('class', 'x axis-text')
      .attr('font-size', 12)
  }

  /**
 * Positions the x axis label and y axis label.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} width The width of the graph
 * @param {number} height The height of the graph
 */
export function positionLabels (g, width, height) {
    // TODO : Position axis labels
    g.select('.x.axis-text')
      .attr('transform', 'translate(' + width/2 + ', '+ (height+50) +')');    // On décale le label x à la moitié de la largeur
  
    g.select('.y.axis-text')
      .attr('transform', 'translate(-50, ' + height/2 + ')rotate(-90)');      // On décale le label x à la moitié de la hauteur
  }
  
  /**
   * Draws the X axis at the bottom of the diagram.
   *
   * @param {*} xScale The scale to use to draw the axis
   * @param {number} height The height of the graphic
   */
  export function drawXAxis (xScale) {
    
    const xAxis = d3.select('.x2.axis')
      .call(d3.axisTop(xScale));

    xAxis.selectAll("text")
      .style("text-anchor", "start")
      .attr("dx", "0.8em")
      .attr("dy", "-0.5em")
      .attr("transform", "rotate(-45)");
    xAxis.selectAll(".tick text")
      .text((d, i) => `Réal ${i+1}`);
    xAxis.selectAll(".tick line").remove();  // for y-axis

  }
  
  /**
   * Draws the Y axis to the left of the diagram.
   *
   * @param {*} yScale The scale to use to draw the axis
   */
  export function drawYAxis (yScale, topY) {
    const yAxis = d3.select('.y2.axis')
      .call(d3.axisLeft(yScale));

    yAxis.selectAll(".tick line").remove();  // for y-axis

    // Label actors as "Acteur 1", "Acteur 2", etc.
    const yTicks = yAxis.selectAll(".tick")
    .data(topY)
    .join("g"); // Ensure we have a group to append shapes

    // Update text
    yTicks.select("text")
    .text((d) => d.actor)
    .attr("dx", "-5em")
    .attr("font-size", "12px"); 

       // // Add rectangles next to the actor names
      // yTicks.append("rect")
      // .attr("x", -50) // Adjust this value to position the rectangle left or right of text
      // .attr("y", -20) // Adjust vertically to align with text
      // .attr("width", 140)
      // .attr("height", 40)
      // .attr("rx", 6)  // horizontal radius for rounded corners
      // .attr("ry", 6) // vertical radius for rounded corners
      // .attr("fill", (d) => colorScale2(d.avg))
      // .attr("stroke", "black")           // border color
      // .attr("stroke-width", 3);          // border thickness
      
            // Append a text label on top of the rectangle
      // yTicks.append("text")
      // .attr("dx", "2rem") // position relative to the rectangle's x
      // .attr("fill", "black") // or "white", depending on contrast
      // .attr("font-size", "12px") // Push text a bit right if needed
      // .text(d => d3.format(".2s")(d["avg"])); // formats numbers like 1.2k, 3.4M
        // Create row headers for averages
      // g.append("text")
      //   .attr("x", -140)
      //   .attr("y", -30)
      //   .style("font-weight", "bold")
      //   .text("Total");
    
  }