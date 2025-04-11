export function drawSquares (g, data, xScale, yScale, colorScale) {

    g.selectAll(".heatmap-cell")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "heatmap-cell")
        .attr("x", d => xScale(d.director))
        .attr("y", d => yScale(d.person))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => {
          if(d.value) return colorScale(d.value);
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
          if (d.value === null) return;
          
          // Create tooltip
          d3.selectAll(".tooltip").remove();
          const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid #ddd")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("pointer-events", "none")
            .style("z-index", 1000);
          
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          
          // Format tooltip content
          const films = d.movies.length > 0 ? d.movies.map(m => m.name).join(", ") : "Aucun film";
          const formattedMetric = metric === 'box_office' 
            ? `Box-office moyen: $${d3.format(",.0f")(d.value)}`
            : `Note moyenne: ${d3.format(".1f")(d.value)}`;
          
          tooltip.html(`
            <strong>${d.person} × ${d.director}</strong><br/>
            Collaborations: ${d.movies.length}<br/>
            ${formattedMetric}<br/>
            Films: ${films}
          `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          d3.selectAll(".tooltip").remove();
        });
}