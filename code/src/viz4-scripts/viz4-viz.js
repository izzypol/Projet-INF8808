export function drawCircles (data, xScale, yScale, couleur) {

    const courbesElement = d3.select(".courbes"); 

    //courbesElement.selectAll("circle").remove();

    const succesMesure = "box_office";

    console.log("drawCirc : ", data);

    courbesElement.selectAll("circle")
    //.data(data.filter(d => typeof d[succesMesure] === 'number'))
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.year))
    .attr("cy", d => yScale(d.average))
    .attr("r", 5)
    .attr("fill", couleur)
    .attr("stroke", "white")
    .on("click", function(event, d) {
        console.log(d);
    });
    //.attr("cy", d => yScale(d.box_office));

    const line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.average));

    courbesElement.append("path")
    .datum(data.sort((a, b) => a.year < b.year))  // Bind entire array
    .attr("class", "data-line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", couleur)
    .attr("stroke-width", 2)
    .attr("pointer-events", "none");
}

export function drawAllCategories(allCat, xScale, yScale, colorScale) {

    const courbesElement = d3.select(".courbes"); 

    courbesElement.selectAll("circle").remove();
    courbesElement.selectAll(".data-line").remove();

    allCat.forEach(elt => drawCircles(elt.data, xScale, yScale, colorScale(elt.category)));
}