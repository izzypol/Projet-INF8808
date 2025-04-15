/** Draws the circles and lines associated with the given data
 * 
 * @param {*} data
 * @param {d3.Scale} xScale
 * @param {d3.Scale} yScale
 * @param {d3.Scale} colorScale
 * @param {number} width
 * @returns {void}
 */
export function drawCircles(data, xScale, yScale, colorScale, width) {
    const courbesElement = d3.select(".courbes"); 

    console.log("je vais dessiner ", data);

    // Clear previous elements
    courbesElement.selectAll(".ensemble-points").remove();
    courbesElement.selectAll(".data-line").remove();
    courbesElement.selectAll(".legend-item").remove();
    courbesElement.selectAll(".category-group").remove();
    courbesElement.selectAll(".error-message").remove();

    // Error message if empty data
    if (!data || data.length === 0 || data.every(d => !d.data || d.data.length === 0)) {
        courbesElement.append("text")
            .attr("class", "error-message")
            .attr("x", width/2)
            .attr("y", 100)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("fill", "gray")
            .text("Données indisponibles pour cette mesure de succès");
        return;
    }

    const categoryGroups = courbesElement.selectAll(".category-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", d => `category-group ${d.category.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase()}`);

    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.average));

    // Draw lines
    categoryGroups
        .append("path")
            .attr("class", "data-line") // Sanitize class name
            .attr("d", d => line(d.data))
            .attr("fill", "none")
            .attr("stroke", d => colorScale(d.category))
            .attr("stroke-width", 4)
            //.attr("pointer-events", "none")
            .on("mouseover", function(event, d) {
                // Select the parent group and all its elements
                const parentGroup = d3.select(this.parentNode);
                
                // Fade all other category groups
                d3.selectAll(".category-group").each(function() {
                    if (this !== parentGroup.node()) {
                        const currentOpacity = parseFloat(d3.select(this).style("opacity"));
                        if (currentOpacity != 0) {
                            d3.select(this).style("opacity", 0.35);
                        }
                    }
                });
                
                // Highlight the hovered group
                parentGroup.style("opacity", 1);
            })
            .on("mouseout", function(event, d) {
                // Restore opacity for all groups
                d3.selectAll(".category-group, .ensemble-points").each(function() {
                    const currentOpacity = parseFloat(d3.select(this).style("opacity"));
                    if (currentOpacity != 0) {
                        d3.select(this).style("opacity", 1);
                    }
                });
            });
          

    // Draw points
    categoryGroups
        .append('g')
        .attr("class", d => "ensemble-points") // Sanitize class name
            .attr("fill", d => colorScale(d.category))
        .selectAll(".data-point")
            .data(d => d.data)
            .enter()
            .append("circle")
                .attr("class", "data-point")
                .attr("cx", d => xScale(d.year))
                .attr("cy", d => yScale(d.average))
                .attr("r", 5)
                .attr("stroke", "white");

    // Add legend
    const legend = courbesElement.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width}, 20)`);

    legend.selectAll(".legend-item")
        .data(data)
        .enter()
        .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 25})`)
        .append("text")
            .text(d => d.category)
            .attr("x", 20)
            .attr("y", 9)
            .style("fill", d => colorScale(d.category))
            .style("font-size", "15px")
            .style("font-weight", "bold") // Start bold (since curves are visible)
            .style("cursor", "pointer")
            .on("click", hideShowCategory);
}

/** Hide or show the given element depending of current state
 * @param {MouseEvent} event
 * @param {Object} d
 * @returns {void}
 */
function hideShowCategory(event, d) {
    const categoryClass = d.category.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
    const currentOpacity = d3.selectAll(`.${categoryClass}`).style("opacity");
    d3.selectAll(`.${categoryClass}`)
        .transition()
        .style("opacity", currentOpacity == 1 ? 0 : 1)
        .attr("pointer-events", currentOpacity == 1 ? "none" : "visible");
    d3.select(event.currentTarget)
        .transition()
        .style("font-weight", currentOpacity == 0 ? "bold" : "normal");
}

/** Draw the point corresponding to the reference movie in a different way
 * @param {string} title
 * @param {Array<Object>} data
 * @param {d3.Scale} xScale
 * @param {d3.Scale} yScale
 * @param {number} height
 * @returns {void}
 */
export function drawRef(title, data, xScale, yScale, height) {
    const courbesElement = d3.select(".courbes"); 

    courbesElement.selectAll(".ref-marker, .ref-line").remove();

    const targetMovie = data.find(movie => movie.name === title);
    if (!targetMovie) return;

    const xPos = xScale(targetMovie.year);
    const yPos = yScale(100); // Assuming 100 is your reference value

    // Add horizontal trace line (from y-axis to point)
    courbesElement.append("line")
        .attr("class", "ref-line")
        .attr("x1", 0) // Start at y-axis
        .attr("x2", xPos)
        .attr("y1", yPos)
        .attr("y2", yPos)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3") // Dashed line
        .attr("opacity", 0.7);

    courbesElement.append("line")
        .attr("class", "ref-line")
        .attr("x1", xPos) // Start at y-axis
        .attr("x2", xPos)
        .attr("y1", yPos)
        .attr("y2", height)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3") // Dashed line
        .attr("opacity", 0.7);

    courbesElement.append("circle")
            .datum(targetMovie)
            .attr("class", "ref-marker")
            .attr("cx", xPos)
            .attr("cy", yPos)
            .attr("r", 5)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2);
}