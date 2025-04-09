export function drawCircles(data, xScale, yScale, colorScale, width) {
    const courbesElement = d3.select(".courbes"); 

    // Clear previous elements
    courbesElement.selectAll(".ensemble-points").remove();
    courbesElement.selectAll(".data-line").remove();
    courbesElement.selectAll(".legend-item").remove(); // Changed from myLabels

    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.average));

    // Draw lines
    courbesElement.selectAll(".data-line")
        .data(data)
        .enter()
        .append("path")
            .attr("class", d => `data-line ${d.category.replace(/\s+/g, '-')}`) // Sanitize class name
            .attr("d", d => line(d.data))
            .attr("fill", "none")
            .attr("stroke", d => colorScale(d.category))
            .attr("stroke-width", 4)
            .attr("pointer-events", "none");

    // Draw points
    courbesElement.selectAll(".ensemble-points")
        .data(data)
        .enter()
        .append('g')
        .attr("class", d => `ensemble-points ${d.category.replace(/\s+/g, '-')}`) // Sanitize class name
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
            .attr("dy", "0.35em")
            .style("fill", d => colorScale(d.category))
            .style("font-size", "15px")
            .style("font-weight", "bold") // Start bold (since curves are visible)
            .style("cursor", "pointer")
            .on("click", function(event, d) {
                const categoryClass = d.category.replace(/\s+/g, '-');
                const currentOpacity = d3.selectAll(`.${categoryClass}`).style("opacity");
                d3.selectAll(`.${categoryClass}`)
                    .transition()
                    .style("opacity", currentOpacity == 1 ? 0 : 1);
                d3.select(this)
                    .transition()
                    .style("font-weight", currentOpacity == 0 ? "bold" : "normal");
            });
}