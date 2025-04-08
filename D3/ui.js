
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

    saveFooddata();
    setCRUDList()
});

// Cancel button to hide the input panel.
d3.select("#cancelFood").on("click", () => {
    d3.select("#foodName").property("value", "");
    d3.select("#foodAmount").property("value", "");
    d3.select("#foodInput").style("display", "none");
    selectedDate = null;
});

// Initially draw the pie chart.

function ShowLoading(val, text = '') {
    let loaderContainer = document.getElementById("loadHolder");
    loaderContainer.style.display = val?"block":"none";

    let message = loaderContainer.children[1];
    message.innerHTML = text;
    if (text !== '') {message.style.paddingTop = "0.75em";}
    else {message.style.paddingTop = "0";}


}

function setCRUDList() {
    let fooda = foodData[selectedDate];

    let listDiv = document.querySelector(".current-day-foods");
    listDiv.innerHTML = '';

    fooda.forEach(d => {
        let element = document.createElement("div");
        listDiv.append(element);
        let f = foodDatabase.find(f => f["FoodID"] === d.food)
        element.innerText = f.FoedevareNavn.split(",")[0];
        element.classList.add('food-on-list');

            let dividerElement = document.createElement("div");
            dividerElement.style.border = "1px solid #ececec"
            element.append(dividerElement);
            dividerElement.style.position = "absolute";
            dividerElement.style.top = "8%";
            dividerElement.style.right = "100px";
            dividerElement.style.height = "80%";

            let amountElement = document.createElement("div");
            element.append(amountElement);
            amountElement.classList.add('food-list-control');

                let input = document.createElement("input");
                amountElement.append(input);
                input.type = "number";
                input.value = d.amount;
                input.addEventListener("change", function(event) {
                    d.amount = event.target.value;

                    if (d.amount == 0){
                        fooda.splice(fooda.indexOf(d), 1);
                        setCRUDList()
                    }

                    saveFooddata();
                    renderCalendar(currentYear, currentMonth);
                });
                input.style.width = "50%";
                input.style.height = "70%";
                input.style.border = "none";
                input.style.backgroundColor = "#f6f6f6";
                input.style.padding = "5%";
                input.style.margin = "5px";

                let deleteDiv = document.createElement("div");
                amountElement.append(deleteDiv);
                deleteDiv.classList.add('food-list-control');
                deleteDiv.style.backgroundColor = "#ff4a4a";
                deleteDiv.style.borderRadius = "5px";
                deleteDiv.style.margin = "5px";
                deleteDiv.style.width = "25%";
                deleteDiv.style.height = "100%";
                deleteDiv.addEventListener("click", function(event) {
                    fooda.splice(fooda.indexOf(d), 1);
                    setCRUDList()
                    saveFooddata();
                    renderCalendar(currentYear, currentMonth);
                });
                deleteDiv.innerText = "X";
                deleteDiv.style.textAlign = "center";
                deleteDiv.style.color = "white";

    })
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
