export function addLegend() {

    

    courbesElement
    .selectAll("myLabels")
    .data(data)
    .enter()
    .append('g')
    .append("text")
        .datum(function(d) { return {name: d.category, value: d.data[d.data.length - 1]}; }) // keep only the last value of each time series
        .attr("transform", function(d) { return "translate(" + xScale(d.value.year) + "," + yScale(d.value.average) + ")"; }) // Put the text at the position of the last point
        .attr("x", 12) // shift the text a bit more right
        .text(function(d) { return d.name; })
        .style("fill", function(d){ return colorScale(d.name) })
        .style("font-size", 15)
}