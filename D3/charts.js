/* ============================
      Chart Navigation & Rendering
      ============================ */
// Placeholder functions for chart drawing.
function drawPieChart() {
    const chartSvg = d3.select("#chartArea");
    chartSvg.selectAll("*").remove();
    // Use foodData to create a summary; here we use dummy data.
    // For example, sum the total amounts per food across all days.
    const summary = {};
    for (const date in foodData) {
        foodData[date].forEach(d => {
            summary[d.food] = (summary[d.food] || 0) + d.amount;
        });
    }
    const data = Object.entries(summary).map(([food, amount]) => ({food, amount}));

    const width = chartSvg.attr("width");
    const height = chartSvg.attr("height");
    const radius = Math.min(width, height) / 2;
    const g = chartSvg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);

    const pie = d3.pie().value(d => d.amount)(data);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    g.selectAll("path")
        .data(pie)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(Number(d.data.food)))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);
}

function drawBarChart() {
    const chartSvg = d3.select("#chartArea");
    chartSvg.selectAll("*").remove();
    // Example: Create a bar chart of total amounts per food.
    const summary = {};
    for (const date in foodData) {
        foodData[date].forEach(d => {
            summary[d.food] = (summary[d.food] || 0) + d.amount;
        });
    }
    const data = Object.entries(summary).map(([food, amount]) => ({food, amount}));

    const width = chartSvg.attr("width") || 400;
    const height = chartSvg.attr("height") || 400;
    const margin = {top: 20, right: 20, bottom: 30, left: 40};

    chartSvg.attr("width", width).attr("height", height);

    const x = d3.scaleBand()
        .domain(data.map(d => d.food))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.amount)]).nice()
        .range([height - margin.bottom, margin.top]);

    const g = chartSvg.append("g");

    g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.food))
        .attr("y", d => y(d.amount))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.amount))
        .attr("fill", d => colorScale(d.food));

    g.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}

/*// ------------------
    Multiple linecharts in the same chart:
    https://observablehq.com/@d3/multi-line-chart/2
 */// -----------------
function drawLineChart() {
    const chartSvg = d3.select("#chartArea");
    chartSvg.selectAll("*").remove();
    // Example: Create a line chart over days for a single food.
    // For demonstration, we'll assume a fixed food name.
    const foodName = "Apple";
    const data = [];
    // Build an array of {date: Date, amount: number} for each day in foodData.
    for (const date in foodData) {
        const dayTotal = foodData[date].reduce((sum, d) => {
            return d.food.toLowerCase() === foodName.toLowerCase() ? sum + d.amount : sum;
        }, 0);
        if (dayTotal > 0) {
            data.push({ date: new Date(date), amount: dayTotal });

        }
    }
    data.sort((a, b) => a.date - b.date);

    const width = chartSvg.attr("width") || 400;
    const height = chartSvg.attr("height") || 400;
    const margin = {top: 20, right: 20, bottom: 30, left: 40};

    chartSvg.attr("width", width).attr("height", height);

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.amount)]).nice()
        .range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.amount));

    const g = chartSvg.append("g");

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#007BFF")
        .attr("stroke-width", 2)
        .attr("d", line);

    g.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}

function nutrientsChart() {
    const chartSvg = d3.select("#chartArea");
    chartSvg.selectAll("*").remove();
    // Use foodData to create a summary; here we use dummy data.
    // For example, sum the total amounts per food across all days.
    const summary = {};
    for (const date in foodData) {
        foodData[date].forEach(d => {
            summary[d.food] = (summary[d.food] || 0) + d.amount;
        });
    }
    const data = Object.entries(summary).map(([food, amount]) => ({food, amount}));

    const width = chartSvg.attr("width") || 400;
    const height = chartSvg.attr("height") || 400;
    const radius = Math.min(width, height) / 2;
    const g = chartSvg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);

    const pie = d3.pie().value(d => d.amount)(data);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    g.selectAll("path")
        .data(pie)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(Number(d.data.food)))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);
}

function FoodCategoryChart(){
    const chartSvg = d3.select("#chartArea");
    chartSvg.selectAll("*").remove();

    // Specify the chart’s dimensions.
    const width = chartSvg.attr("width") || 800;
    const height = chartSvg.attr("height") || 800;
    const marginTop = 10;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 40;



//    const data = Object.entries(summary).map(([food, amount]) => ({food, amount}));

    const transformed = [];

    console.log(foodData);
    for (const date in foodData) {
        // Iterate over each food entry for the given date
        foodData[date].forEach(item => {
            // Find the food record in the foodDatabase by matching FoodID with the stored food id
            const foodRecord = foodDatabase.find(f => f["FoodID"] === item.food);
            if (foodRecord) {
                // Create a new object with the required properties
                transformed.push({
                    date: date,
                    FoodGroup: foodRecord.FoodGroup,
                    amount: item.amount
                });
                console.log(transformed[transformed.length-1]);
            } else {
                // Optionally handle the case where a food id isn't found in the database
                console.warn(`Food with ID ${item.food} not found in the database.`);
            }
        });
    }
    console.log(transformed);

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
        .attr("style", "max-width: 100%; height: auto;");

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
    } else if (chartType === "bar") {
        drawBarChart();
    } else if (chartType === "line") {
        drawLineChart();
    } else if (chartType === "nutrients"){
        nutrientsChart()
    } else if (chartType === "foodCategory"){
        FoodCategoryChart()
    }

});
