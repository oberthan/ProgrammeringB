// Global food data storage.
// Keys are date strings ("YYYY-MM-DD") mapping to arrays of {food, amount}.
let foodData = {};
const foodDataKey = "userSave";

let foodDatabase = {};

// Global mapping from date string to its barGroup selection.
const barGroups = {};

// Color scale for food items.
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Global current month/year.
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth(); // 0-indexed

// Save today's date as a string for highlighting.
const todayDateStr = new Date().toISOString().split("T")[0];

// Global variable for currently selected day.
let selectedDate = null;

// Layout parameters.
const cellWidth = 100;
const cellHeight = 120;
const headerHeight = 30; // For weekday names.
const padding = 5;

// Vertical bar chart parameters.
const barWidth = 8;
const barHeight = 80; // Total height available for the stacked bar.

// Get the SVG container.
const svg = d3.select("#calendar");

// Container group for the calendar content.
let calendarGroup = svg.append("g").attr("class", "calendar-group");

// Update the month label.
function updateMonthLabel() {
    const monthNames = [
        "Januar", "Februar", "Marts", "April", "Maj", "Juni",
        "Juli", "August", "September", "Oktober", "November", "December"
    ];
    d3.select("#monthLabel").text(`${monthNames[currentMonth]} ${currentYear}`);
}
updateMonthLabel();


function loadFoodDatabase(url) {
    ShowLoading(true, "Loading Database");
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[1];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            ShowLoading(false);
            console.log(jsonData);
            processFoodData(jsonData);
            renderCalendar(currentYear, currentMonth);
        })
        .catch(error => console.error("Error loading database:", error));
}

function processFoodData(jsonData) {
    // Assume each record in jsonData has keys such as FoodID, FoodName, and Nutrients.
    // Create a mapping from FoodID to nutrient data, e.g.:
    foodDatabase = jsonData;
    foodDatabase.shift();
    foodDatabase.shift();
    foodDatabase.shift();
/*    jsonData.forEach((record, i) => {
        // Standardize the food name (and FoodID) as needed.
        if (i>2) {
            foodDatabase[record['FoodID']] = record;
        }
    });*/
    // Create a list of items for the searchable dropdown.
    /*window.foodList = jsonData.map(record => ({
        id: record.FoodID,
        text: record.FoodName
    }));*/
    //initFoodDropdown(foodDatabase);
}
loadFoodDatabase('Frida_5.3_November2024_Dataset.xlsx');

function initFoodDropdown() {
    const search = d3.select("#foodName").property("value").toLowerCase();
    let foodOptions = document.querySelector(".food-options");
    foodOptions.innerHTML = "";

    foodDatabase.forEach((foodItem) => {
        let foedevareNavn = foodItem['FoedevareNavn'];
        if (foedevareNavn.toLowerCase().includes(search) || foodItem["FoodName"].toLowerCase().includes(search) ){
            console.log("Found one!", foodItem["FoodName"]);
            var el = document.createElement("div");
            el.textContent = foedevareNavn;
            el.onclick = function() {d3.select("#foodName").property("value", foedevareNavn);};
            foodOptions.append(el);
            //foodOptions.append(document.createElement("br"));
        }
    });
}
function displayNutrients(foodID) {
    const foodRecord = window.foodDatabase[foodID];
    if (!foodRecord) {
        console.error("No record found for FoodID:", foodID);
        return;
    }
    // Assume foodRecord.Nutrients is an object (or string) with nutrient info.
    // Display the nutrient data in your page (e.g., in an element with id "nutrientDisplay").
    const nutrientInfo = foodRecord.Nutrients;
    // Customize the display as needed:
    document.getElementById("nutrientDisplay").innerHTML = `
    <h3>${foodRecord.FoodName}</h3>
    <p>${JSON.stringify(nutrientInfo, null, 2)}</p>
  `;
}


// Function to update the vertical stacked bar for a day.
function updateVerticalBar(barGroup, data) {
    barGroup.selectAll("*").remove();
    const dayCell = d3.select(barGroup.node().parentNode);
    dayCell.selectAll("text").filter((x, y) =>y !== 0).remove();

    if (data.length === 0) return;
    // Calculate the total amount for the day.
    const totalAmount = d3.sum(data, d => d.amount);
    // Create stacked data with cumulative y-values.
    let cumulative = 0;
    const stackedData = data.map(d => {
        const y0 = cumulative;
        cumulative += d.amount;
        return { ...d, y0: y0, y1: cumulative };
    });

    // Data join on segments using food as the key.
    const segments = barGroup.selectAll("g.segment")
        .data(stackedData, d => d.food);

    // ENTER: Create new segments.
    const segEnter = segments.enter()
        .append("g")
        .attr("class", "segment");

    segEnter.append("rect")
        .attr("x", 0)
        .attr("width", barWidth)
        .attr("y", d => (cellHeight-2) * (d.y0 / totalAmount))
        .attr("height", d => (cellHeight-2) * (d.amount / totalAmount))
        .attr("fill", d => colorScale(d.food));

    data.forEach((d, i) => {
    dayCell.append("text")
        .attr("x", padding+5)
        .attr("y", padding+32+10*i)
        .attr("class", "day-text")
        .attr("fill", colorScale(d.food))
        .attr("font-weight", "bold")
        .text(foodDatabase.filter(it => it["FoodID"] === d.food)[0]["FoedevareNavn"]);
    });
}

// Main function to render the calendar.
function renderCalendar(year, month, dir = 1) {
    // Calculate days and layout.
    const firstDay = new Date(year, month, 1);
    // Use Monday as the first day of the week.
    const startWeekday = (firstDay.getDay() + 6) % 7;
    // Get number of days in month.
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const totalCells = 42;  // fixed grid of 6 weeks.
    const rows = Math.ceil(totalCells / 7);

    const svgWidth = cellWidth * 7;
    const svgHeight = headerHeight + rows * cellHeight;
    svg.attr("width", svgWidth).attr("height", svgHeight);

    // Clear previous mapping.
    for (const key in barGroups) {
        delete barGroups[key];
    }

    // Create a new group for the new calendar.
    const newGroup = svg.append("g")
        .attr("class", "calendar-group new")
        .style("opacity", 0)
        .attr("transform", `translate(0,${(cellHeight*5+headerHeight)*dir})`);

    // Draw weekday header (using Monday as first day).
    const weekDays = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
    weekDays.forEach((d, i) => {
        newGroup.append("text")
            .attr("x", i * cellWidth + cellWidth / 2)
            .attr("y", headerHeight / 2 + 5)
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .text(d);
    });

    const clipId = "clipCell";
    let defs = svg.select("defs");
    if (defs.empty()) {
        defs = svg.append("defs");


        // Append clipPath to the <defs> element of the SVG (create one if needed)


        //if (defs.select(`#${clipId}`).empty()) {

        defs.append("clipPath")
            .attr("id", clipId)
            .append("rect")
            .attr("x", -cellWidth + barWidth +3)
            .attr("y", 1)
            .attr("width", cellWidth - 4)
            .attr("height", cellHeight - 4)
            .attr("rx", 7)
            .attr("ry", 7);
    }

    // Create cells.
    for (let i = 0; i < totalCells; i++) {
        const col = i % 7;
        const row = Math.floor(i / 7);
        const x = col * cellWidth;
        const y = headerHeight + row * cellHeight;

        const cell = newGroup.append("g")
            .attr("transform", `translate(${x},${y})`);

        // Rounded rectangle for modern look.
        cell.append("rect")
            .attr("width", cellWidth - 2)
            .attr("height", cellHeight - 2)
            .attr("x", 1)
            .attr("y", 1)
            .attr("stroke", "#e0e0e0")
            .attr("rx", 8)
            .attr("ry", 8);

        // Only fill cells that represent actual days.
        if (i >= startWeekday && i < daysInMonth + startWeekday) {
            cell.select("rect")
                .classed("day-rect", true);
            const dayNum = i - startWeekday + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            //if (!foodData[dateStr]) foodData[dateStr] = [];

            // Highlight current day.
            if (dateStr === todayDateStr) {
                cell.classed("current-day", true);
            }

            // Create a group for the day content.
            const dayCell = cell.append("g")
                .attr("class", "day-cell");

            // When clicked, select this day and show the input panel.
            cell.on("click", () => {
                // Remove the highlight from any previously selected cell.
                d3.selectAll(".selected-day").classed("selected-day", false);

                // Highlight the clicked cell.
                cell.classed("selected-day", true);

                selectedDate = dateStr;
                d3.select("#selectedDateLabel").text(`Add food for ${dateStr}`);
                d3.select("#foodInput").style("display", "block");
            });

            // Display the day number.
            dayCell.append("text")
                .attr("x", padding + 5)
                .attr("y", padding + 12)
                .attr("class", "day-text")
                .attr("font-weight", dateStr === todayDateStr ? "bold" : "normal")
                .text(dayNum);


            // --- NEW: Define a clip path for this cell ---

            //}
            // --- End clip path definition ---

            // Draw the vertical stacked bar.
            const barGroup = dayCell.append("g")
                .attr("transform", `translate(${(cellWidth - barWidth-1)}, ${1})`)
                .attr("clip-path", `url(#${clipId})`);
            if (foodData[dateStr]) updateVerticalBar(barGroup, foodData[dateStr]);
            // Save the reference so we can update it later.
            barGroups[dateStr] = barGroup;

        }
        else{
            cell.select("rect")
                .classed("day-rect", true)
                .attr("id", "otherMonth");
        }
    }


    // Transition: fade in the new calendar.
    newGroup.transition()
        .duration(1600)
        .attr("transform", `translate(0,0)`)
        .style("opacity", 1)
        .on("end", () => {
            calendarGroup.remove();
            calendarGroup = newGroup.attr("class", "calendar-group");
        });

    // Fade out the old calendar.
    calendarGroup.transition()
        .duration(1600)
        .style("opacity", 0)

        .attr("transform",`translate(0,${(cellHeight*5-headerHeight)*-dir})`)
        .remove();
}
foodData = localStorage.getItem(foodDataKey);
foodData = foodData ? JSON.parse(foodData) : {};

d3.select("#prev").on("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    updateMonthLabel();
    renderCalendar(currentYear, currentMonth, -1);
});

d3.select("#next").on("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateMonthLabel();
    renderCalendar(currentYear, currentMonth);
});

// Handle food input submission.
d3.select("#submitFood").on("click", () => {
    if (!selectedDate) return;
    const food = d3.select("#foodName").property("value").trim();
    const amount = parseFloat(d3.select("#foodAmount").property("value"));
    const dbItem = foodDatabase.filter(item => item["FoedevareNavn"].trim() === food || item["FoodName"].trim() === food )[0];
    if (!food) {
        alert("Please enter a food name.");
        return;
    }
    else if(!dbItem){
        alert("Please choose a valid food name.");
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid positive number for the amount.");
        return;
    }
    if (!foodData[selectedDate]) foodData[selectedDate] = [];
    const fId = dbItem["FoodID"];
    const dayFoods = foodData[selectedDate];
    const existing = dayFoods.find(d => d.food === fId);
    if (existing) {
        existing.amount += amount;
    } else {
        dayFoods.push({ "food":fId, amount });
    }
    // Update the vertical bar for the selected day.
    if (barGroups[selectedDate]) {
        updateVerticalBar(barGroups[selectedDate], foodData[selectedDate]);
    }

    // Clear input fields and hide panel.
    d3.select("#foodName").property("value", "");
    d3.select("#foodAmount").property("value", "");
    d3.select("#foodInput").style("display", "none");
    selectedDate = null;

    localStorage.setItem(foodDataKey, JSON.stringify(foodData));
});

// Cancel button to hide the input panel.
d3.select("#cancelFood").on("click", () => {
    d3.select("#foodName").property("value", "");
    d3.select("#foodAmount").property("value", "");
    d3.select("#foodInput").style("display", "none");
    selectedDate = null;
});
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

    const width = +chartSvg.attr("width") || 400;
    const height = +chartSvg.attr("height") || 400;
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

    const width = +chartSvg.attr("width") || 400;
    const height = +chartSvg.attr("height") || 400;
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

    const width = +chartSvg.attr("width") || 400;
    const height = +chartSvg.attr("height") || 400;
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

    const width = +chartSvg.attr("width") || 400;
    const height = +chartSvg.attr("height") || 400;
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
    const width = +chartSvg.attr("width") || 400;
    const height = +chartSvg.attr("height") || 400;
    const radius = Math.min(width, height) / 2;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 20;
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

    const y = d3.scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
        .rangeRound([height - marginBottom, marginTop]);

    const color = d3.scaleOrdinal()
        .domain(series.map(d => d.key))
        .range(d3.schemeTableau10);

    // Construct an area shape.
    const area = d3.area()
        .x(d => x(d.data[0]))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    // Create the SVG container.
    chartSvg.attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // Add the y-axis, remove the domain line, add grid lines and a label.
    chartSvg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(height / 80))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Gram"));

    // Append a path for each series.
    chartSvg.append("g")
        .selectAll()
        .data(series)
        .join("path")
        .attr("fill", d => colorScale(d.key))
        .attr("d", area)
        .append("title")
        .text(d => d.key);

    // Append the horizontal axis atop the area.
    chartSvg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

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

// Initially draw the pie chart.
drawPieChart();

function ShowLoading(val, text = '') {
    let loaderContainer = document.getElementById("loadHolder");
    loaderContainer.style.display = val?"block":"none";

    let message = loaderContainer.children[1];
    message.innerHTML = text;
    if (text !== '') {message.style.paddingTop = "0.75em";}
    else {message.style.paddingTop = "0";}


}