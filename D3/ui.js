
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

// Initially draw the pie chart.

function ShowLoading(val, text = '') {
    let loaderContainer = document.getElementById("loadHolder");
    loaderContainer.style.display = val?"block":"none";

    let message = loaderContainer.children[1];
    message.innerHTML = text;
    if (text !== '') {message.style.paddingTop = "0.75em";}
    else {message.style.paddingTop = "0";}


}