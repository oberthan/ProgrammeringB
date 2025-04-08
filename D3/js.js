
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
const cellWidth = window.innerWidth * 0.27/7;
const cellHeight = cellWidth*1.2;
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


async function loadFoodDatabase(url) {
    let localDatabase = localStorage.getItem("localDatabase");
    if (localDatabase){
        foodDatabase = JSON.parse(localDatabase);
        ShowLoading(false);
        renderCalendar(currentYear, currentMonth);
    }else {

        ShowLoading(true, "Loading Database");
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(data => {
                const workbook = XLSX.read(data, {type: 'array'});
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
}
function saveFoodDatabase(){
    localStorage.setItem("localDatabase", JSON.stringify(foodDatabase));
}
function saveFooddata() {
    localStorage.setItem(foodDataKey, JSON.stringify(foodData));
}

function processFoodData(jsonData) {
    foodDatabase = jsonData;
    foodDatabase.shift();
    foodDatabase.shift();
    foodDatabase.shift();
}

foodData = localStorage.getItem(foodDataKey);
foodData = foodData ? JSON.parse(foodData) : {};

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

                setCRUDList()
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

drawPieChart();
