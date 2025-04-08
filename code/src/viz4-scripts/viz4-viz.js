export function drawCircles (data, xScale, yScale, colorScale) {

    const courbesElement = d3.select(".courbes"); 

    courbesElement.selectAll("circle").remove();

    courbesElement.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.year))
    .attr("cy", d => yScale(d.box_office))
    .attr("r", 2)
    .attr("fill", "red")
    .attr("stroke", "white");
    //.attr("cy", d => yScale(d.box_office));

//     const line = d3.line()
//   .x(d => xScale(d.year))
//   .y(d => yScale(d.box_office))
//   .curve(d3.curveCatmullRom.alpha(0.5));

    // courbesElement.append("path")
    // .datum(data.sort((a, b) => a.year < b.year))  // Bind entire array
    // .attr("class", "data-line")
    // .attr("d", line)
    // .attr("fill", "none")
    // .attr("stroke", "steelblue")
    // .attr("stroke-width", 2);
}