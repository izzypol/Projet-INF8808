export function createLegend(viz3MarketPerIntervalSmall, legendDiv, colorScale) {
    // Ajouter les noms associés aux couleurs dans la légende -> insérer dans legendDiv
    viz3MarketPerIntervalSmall.presentCategory.forEach(cat => {
        const item = legendDiv.append("div")
            .style("display", "flex")
            .style("align-items", "center");

        item.append("div")
            .style("width", "30px")
            .style("height", "15px")
            .style("background-color", colorScale(cat))
            .style("margin-right", "5px");

        item.append("span")
            .text(cat)
            .style("font-size", "12px")
    });
}