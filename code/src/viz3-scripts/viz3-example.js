// Fonction pour sélectionner un rectangle au hasard et afficher ses infos

export function selectRandomRectangle() {
    // Sélectionner tous les rectangles de la visualisation 3
    const rectangles = d3.selectAll(".bars .rect3").nodes();

    if (rectangles.length === 0) {
        console.log("Aucun rectangle trouvé dans la visualisation 3.");
        return;
    }

    const filteredRectangles = rectangles.filter(rect => {
        const rectData = d3.select(rect).datum();
        return (rectData[1] - rectData[0]) > 0.1; // Condition
    });

    // Choisir un rectangle au hasard
    const randomIndex = Math.floor(Math.random() * filteredRectangles.length);
    const randomRect = filteredRectangles[randomIndex];


    randomRect.setAttribute("stroke", "black");
    randomRect.setAttribute("stroke-width", "2");
    randomRect.setAttribute("stroke-dasharray", "4,2");
    randomRect.parentNode.appendChild(randomRect);
    randomRect.parentNode.parentNode.appendChild(randomRect.parentNode);

    // Récupérer les données associées au rectangle
    const rectData = d3.select(randomRect).datum();

    return {
        category: rectData.category,
        interval: rectData.data.interval,
        proportion: `${((rectData[1] - rectData[0]) * 100).toFixed(2)}%`
    }
}


export function phraseExemple(dataExample, colorScale) {

    const partsOfInterval = dataExample.interval.replace("[", "").replace("]", "").split(",");
    const startYear = partsOfInterval[0].trim();
    const endYear = partsOfInterval[1].trim();


    const ExempleLecture = `
    <div class="exempleViz3">
        Exemple de Lecture : Entre <strong>${startYear}</strong> et <strong>${endYear}</strong>, la catégorie <strong style="color : ${colorScale(dataExample.category)}">${dataExample.category}</strong> représentait <strong>${dataExample.proportion}</strong> du marché.
    </div>`

    return ExempleLecture
}