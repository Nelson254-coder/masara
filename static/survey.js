document.addEventListener("DOMContentLoaded", function () {
    console.log("Survey JavaScript has loaded.");

    const form = document.getElementById("aiAssessmentForm");
    const submitButton = document.getElementById(
        "recommendationButton"
    );

    const radioInputs = document.querySelectorAll(
        'input[name="ai_maturity"]'
    );

    const formMessage = document.getElementById("formMessage");
    const resultPanel = document.getElementById("resultPanel");
    const resultGrade = document.getElementById("resultGrade");
    const resultScore = document.getElementById("resultScore");
    const resultSummary = document.getElementById("resultSummary");
    const recommendationList = document.getElementById(
        "recommendationList"
    );
    const progressBar = document.getElementById("progressBar");

    if (!form) {
        console.error("Could not find #aiAssessmentForm.");
        return;
    }

    if (!submitButton) {
        console.error("Could not find #recommendationButton.");
        return;
    }

    radioInputs.forEach(function (radio) {
        radio.addEventListener("change", function () {
            console.log("Selected score:", radio.value);

            submitButton.disabled = false;

            if (formMessage) {
                formMessage.textContent = "";
            }

            document
                .querySelectorAll(".survey-option")
                .forEach(function (option) {
                    option.classList.remove("selected");
                });

            const selectedCard = radio.closest(".survey-option");

            if (selectedCard) {
                selectedCard.classList.add("selected");
            }
        });
    });

    submitButton.addEventListener("click", async function (event) {
        event.preventDefault();
        event.stopPropagation();

        const selectedInput = document.querySelector(
            'input[name="ai_maturity"]:checked'
        );

        if (!selectedInput) {
            if (formMessage) {
                formMessage.textContent =
                    "Please select one survey statement.";
            }

            return;
        }

        const gradeUrl =
            form.dataset.gradeUrl || "/grade-survey";

        submitButton.disabled = true;
        submitButton.textContent = "Calculating...";

        try {
            const response = await fetch(gradeUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    score: Number(selectedInput.value)
                })
            });

            const contentType =
                response.headers.get("content-type") || "";

            if (!contentType.includes("application/json")) {
                throw new Error(
                    "The Flask endpoint returned HTML instead of JSON."
                );
            }

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to grade the survey."
                );
            }

            resultGrade.textContent = data.grade;
            resultScore.textContent =
                `${data.score}/${data.maximum_score}`;
            resultSummary.textContent = data.summary;

            recommendationList.innerHTML = "";

            data.recommendations.forEach(function (recommendation) {
                const listItem = document.createElement("li");
                listItem.textContent = recommendation;
                recommendationList.appendChild(listItem);
            });

            if (progressBar) {
                progressBar.style.width =
                    `${data.percentage}%`;

                progressBar.setAttribute(
                    "aria-valuenow",
                    String(data.percentage)
                );
            }

            resultPanel.hidden = false;

            resultPanel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        } catch (error) {
            console.error("Survey error:", error);

            if (formMessage) {
                formMessage.textContent = error.message;
            }
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Get recommendation";
        }
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
    });
});
