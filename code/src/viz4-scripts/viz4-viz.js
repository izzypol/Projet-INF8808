export function drawCircles(data, xScale, yScale, colorScale, width) {
    const courbesElement = d3.select(".courbes"); 

    // Clear previous elements
    courbesElement.selectAll(".ensemble-points").remove();
    courbesElement.selectAll(".data-line").remove();
    courbesElement.selectAll(".legend-item").remove(); // Changed from myLabels

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
                d3.selectAll(".data-line").each(function() {
                    const currentOpacity = parseFloat(d3.select(this).style("opacity"));
                    if (currentOpacity != 0) {
                      d3.select(this).style("opacity", 0.35);
                    }
                  });
                d3.select(this).style("opacity", 1);
                //console.log(d);
            })
            .on("mouseout", function(event, d) {
                d3.selectAll(".data-line, .ensemble-points").each(function() {
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
                .attr("stroke", "white")
                .on("click", function(event, d) {
                    console.log(d);
                });

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
            .on("click", function(event, d) {
                const categoryClass = d.category.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
                const currentOpacity = d3.selectAll(`.${categoryClass}`).style("opacity");
                d3.selectAll(`.${categoryClass}`)
                    .transition()
                    .style("opacity", currentOpacity == 1 ? 0 : 1)
                    .attr("pointer-events", currentOpacity == 1 ? "none" : "visible");
                d3.select(this)
                    .transition()
                    .style("font-weight", currentOpacity == 0 ? "bold" : "normal");
            });
}

export function drawRef(title, data, xScale, yScale, height) {
    const courbesElement = d3.select(".courbes"); 

    courbesElement.selectAll(".ref-marker, .ref-line").remove();

    console.log("Orig : ", data);

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
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3") // Dashed line
        .attr("opacity", 0.7);

    courbesElement.append("line")
        .attr("class", "ref-line")
        .attr("x1", xPos) // Start at y-axis
        .attr("x2", xPos)
        .attr("y1", yPos)
        .attr("y2", height)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3") // Dashed line
        .attr("opacity", 0.7);

    console.log("target : ", targetMovie);

    courbesElement.append("circle")
            .datum(targetMovie)
            .attr("class", "ref-marker")
            .attr("cx", xPos)
            .attr("cy", yPos)
            .attr("r", 5)
            .attr("fill", "black")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .on("click", function(event, d) {
                console.log(d);
            });
}