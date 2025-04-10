/* ============================
      Chart Navigation & Rendering
      ============================ */
// Placeholder functions for chart drawing.
function drawPieChart() {
    const chartcontainer = d3.select(".charts-container");
    chartcontainer.selectAll("svg").remove();
    // Use foodData to create a summary; here we use dummy data.
    // For example, sum the total amounts per food across all days.
    const summary = {};
    for (const date in foodData) {
        foodData[date].forEach(d => {
            summary[d.food] = Number(summary[d.food] || 0) + Number(d.amount);
        });
    }

    pieChartMass(chartcontainer, summary);
    pieChartEnergy(chartcontainer, summary);
}
function pieChartMass(chartcontainer, summary){
    const data = Object.entries(summary).map(([food, amount]) => ({food, amount}));

    let chartSvg = chartcontainer.append("svg");

    let chartsContainer = document.querySelector(".charts-container");
    let heightContainer = chartsContainer.offsetHeight;

    console.log(`Mass: ${heightContainer}`);


    const width = chartSvg.attr("width") || 800;
    const height = chartSvg.attr("height") || heightContainer - document.querySelector(".chart-tabs").offsetHeight-30;
    const radius = Math.min(width, height) / 2;
    const g = chartSvg
        .attr("width", width)
        .attr("height", height)
        .attr("style", `max-width: 50%; height: ${height}; float: left;`)
        .attr("viewBox", [0, 0, width, height])
        .append("g")
        .attr("transform", `translate(${width/2}, ${height/2 - 60})`);

    const pie = d3.pie().value(d => d.amount)(data);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    g.selectAll("path")
        .data(pie)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(Number(d.data.food)))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .append("title")
        .text(d => `${foodDatabase.find(f => f["FoodID"] == d.data.food).FoedevareNavn}\n${d.data.amount} g`);

}

function pieChartEnergy(chartcontainer, summary){
    const data = Object.entries(summary).map(([food, amount]) => ({food, amount, foodName: foodDatabase.find(f => f["FoodID"] == food)["FoedevareNavn"], foodEnergy: foodDatabase.find(f => f["FoodID"] == food)["Energi (kJ)"]}));

    let chartSvg = chartcontainer.append("svg");
    

    let chartsContainer = document.querySelector(".charts-container");
    let heightContainer = chartsContainer.offsetHeight;
    console.log(`Energy: ${heightContainer}`);

    // let updatedData = Object.entries(data).map(([food, amount]) => ({food, amount, foodName: foodDatabase.find(f => f["FoodID"] == food)["FoedevareNavn"], foodEnergy: foodDatabase.find(f => f["FoodID"] == food)["Energi (kJ)"]}));

    const width = chartSvg.attr("width") || 800;
    const height = chartSvg.attr("height") || heightContainer - document.querySelector(".chart-tabs").offsetHeight-30;
    const radius = Math.min(width, height) / 2;
    const g = chartSvg
        .attr("width", width)
        .attr("height", height)
        .attr("style", `max-width: 50%; height: ${height}; float: left;`)
        .attr("viewBox", [0, 0, width, height])
        .append("g")
        .attr("transform", `translate(${width/2}, ${height/2 - 60})`);

    chartSvg
        .append("text")
        .attr("transform", `translate(${width/2}, ${height/2 + radius}`)
        .text(`I alt: ${Object.values(data).reduce((a, b) => a.foodEnergy + b.foodEnergy, 0)}`)

    const pie = d3.pie().value(d => d.amount*d.foodEnergy/100)(data);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    g.selectAll("path")
        .data(pie)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(Number(d.data.food)))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .append("title")
        .text(d => `${d.data.foodName}\n${Math.round(d.data.amount*d.data.foodEnergy/100)} kJ`);

}


function FoodCategoryChart(){
    const chartcontainer = d3.select(".charts-container");
    chartcontainer.selectAll("svg").remove();

    let chartSvg = chartcontainer.append("svg");

    let chartsContainer = document.querySelector(".charts-container");
    let heightContainer = chartsContainer.offsetHeight;

    // Specify the chart’s dimensions.
    const width = chartSvg.attr("width") || 800;
    const height = chartSvg.attr("height") || heightContainer - document.querySelector(".chart-tabs").offsetHeight-30;
    const marginTop = 10;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 40;



//    const data = Object.entries(summary).map(([food, amount]) => ({food, amount}));

    const transformed = [];

    for (const date in foodData) {
        // Iterate over each food entry for the given date
        foodData[date].forEach(item => {
            // Find the food record in the foodDatabase by matching FoodID with the stored food id
            const foodRecord = foodDatabase.find(f => f["FoodID"] === item.food);
            if (foodRecord) {
                // Create a new object with the required properties
                transformed.push({
                    date: date,
                    FoodGroup: foodRecord.FoedevareGruppe,
                    amount: item.amount
                });

            } else {
                // Optionally handle the case where a food id isn't found in the database
                console.warn(`Food with ID ${item.food} not found in the database.`);
            }
        });
    }

    transformed.forEach(d => {
        d.date = new Date(d.date);
    });

    // Determine the series that need to be stacked.
    const series = d3.stack()
        .keys(d3.union(transformed.map(d => d.FoodGroup))) // distinct series keys, in input order
        .value(([, D], key) => {
            const entry = D.get(key);
            return entry ? entry.amount : 0;
        })
        (d3.index(transformed, d => d.date, d => d.FoodGroup));


    // Prepare the scales for positional and color encodings.
    const x = d3.scaleUtc()
        .domain(d3.extent(transformed, d => d.date))
        .range([marginLeft, width - marginRight]);


    /*const x = d3.scaleBand()
        .domain(d3.extent(transformed, d => d.date))
        .range([marginLeft, width - marginRight])
        .padding(0.1);*/

    const y = d3.scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
        .rangeRound([height - marginBottom, marginTop]);

    // A function to format the value in the tooltip.
    //const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

    // Create the SVG container.
    chartSvg.attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", `max-width: 100%; height: ${height};`);

    // Append a path for each series.
    chartSvg.append("g")
        .selectAll()
        .data(series)
        .join("g")
        .attr("fill", d => colorScale(d.key))
        .selectAll("rect")
        .data(D => D.map(d => (d.key = D.key, d)))
        .join("rect")
        .attr("x", d => x(d.data[0]))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", 20)
        .append("title")
        .text(d => `${d.data[0].toDateString()}\n${d.key}`);

    // Append the horizontal axis atop the area.
    chartSvg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call(g => g.selectAll(".domain").remove());

    // Append the vertical axis
    chartSvg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(null, "s"))
        .call(g => g.selectAll(".domain").remove());

}


// Chart navigation: when a tab is clicked, draw the corresponding chart.
d3.selectAll(".chart-tabs button").on("click", function() {
    d3.selectAll(".chart-tabs button").classed("active", false);
    d3.select(this).classed("active", true);
    const chartType = d3.select(this).attr("data-chart");
    if (chartType === "pie") {
        drawPieChart();
    } else if (chartType === "foodCategory"){
        FoodCategoryChart()
    }

});
