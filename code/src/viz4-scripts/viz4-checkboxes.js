export function generateCheckBoxes(list) {

    const checkGroup = d3.select(".check-group");

    const options = checkGroup.selectAll(".check-option")
    .data(list)
    .enter()
    .append("div")
    .attr("class", "check-option")
    .html(d => `
        <input type="checkbox" id="check-${d}" name="category" value="${d}" checked>
        <label for="check-${d}">${d.charAt(0).toUpperCase() + d.slice(1)}</label>
    `);

    options.select('input')
        .on("change", function(event, d) {
            const isChecked = event.target.checked;

            console.log("Checked ? ", isChecked);

            const legendes = d3.selectAll(".legend-item");

            const legendesFiltrees = legendes.filter(function() {
                return d3.select(this).select("text").text().toLowerCase().includes(d);
              });

              console.log(legendesFiltrees);

            legendesFiltrees.each(function() {
                const fontweight = d3.select(this).select("text").style("font-weight");

                console.log("weight ? ", fontweight);
                
                if (((fontweight == "normal") && isChecked) || ((fontweight == "bold") && !isChecked)){ 
                    d3.select(this).select("text").dispatch('click');
                }
            });
        });
}

export function checkAll() {
    d3.selectAll(".check-option input[type='checkbox']")
        .property("checked", true);
}