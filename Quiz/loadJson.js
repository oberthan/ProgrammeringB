let quizItem;
let currentLvl = 0;
let container = document.querySelector(".container");

fetch('./Questions/Questions.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        quizItem = data;
        setupQuiz();
    })
    .catch(error => console.error("Failed to fetch quiz data:", error));

function setupQuiz() {
    if (!quizItem) {
        console.error("Quiz data is not available.");
        return;
    }

    // Clear the current content of the form
    container.innerHTML = '';

    // Create quiz questions and choices
    quizItem['levels'][currentLvl].forEach((item) => {
        let questionText = document.createElement("p");
        questionText.textContent = item['question'];
        questionText.classList.add('question');
        container.appendChild(questionText);

        item["choices"].forEach(choice => {
            let input = document.createElement("input");
            input.type = "radio";
            input.name = item['question_name'];
            input.value = choice;
            input.classList.add('choices');
            container.appendChild(input);

            let label = document.createElement("label");
            label.textContent = choice;
            container.appendChild(label);

            // Optional: add a line break for clarity
            container.appendChild(document.createElement("br"));
        });
        container.appendChild(document.createElement("br"));
    });

    // Create a container for the buttons
    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    // Create the "Previous Level" button (positioned absolutely to the left)
    if (currentLvl > 0) {
        let prevButton = document.createElement("button");
        prevButton.type = "button";
        prevButton.textContent = "Previous Level";
        prevButton.addEventListener("click", function () {
            if (currentLvl > 0) {
                currentLvl--;
                setupQuiz();
            } else {
                console.log("Already at the first level.");
            }
        });
        buttonContainer.appendChild(prevButton);
    }

    // Create the "Submit" button (centered)
    let submit = document.createElement("input");
    submit.type = "submit";
    submit.value = "Submit";

    // Append the buttons to the button container

    buttonContainer.appendChild(submit);

    // Append the button container to the form
    container.appendChild(buttonContainer);
}

// Handle form submission
container.addEventListener("submit", function(event) {
    event.preventDefault();

    let correct = 0;
    let amount = quizItem['levels'][currentLvl].length;
    quizItem['levels'][currentLvl].forEach((item) => {
        let formData = new FormData(container);
        let chosen = formData.get(item['question_name']);
        let b64 = btoa(chosen);
        console.log(chosen);
        if (b64 === item['answer']){
            correct++;
        }
    });
    console.log(`${correct} / ${amount}`);

    if (correct === amount || correct === 0) {
        currentLvl++;
        if (currentLvl < quizItem['levels'].length) {
            setupQuiz();
        }
    }
});