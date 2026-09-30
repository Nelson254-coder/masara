document.addEventListener("DOMContentLoaded", function () {
    const CONTACT_EMAIL = "fluentaiacademy254@gmail.com";

    const form = document.getElementById("aiAssessmentForm");
    const submitButton = document.getElementById("recommendationButton");
    const radioInputs = document.querySelectorAll('input[name="ai_maturity"]');

    const formMessage = document.getElementById("formMessage");
    const resultPanel = document.getElementById("resultPanel");
    const resultLevel = document.getElementById("resultLevel");
    const resultScore = document.getElementById("resultScore");
    const resultSummary = document.getElementById("resultSummary");
    const recommendationList = document.getElementById("recommendationList");
    const progressBar = document.getElementById("progressBar");
    const requestTraining = document.getElementById("requestTraining");

    if (!form || !submitButton) {
        return;
    }

    radioInputs.forEach(function (radio) {
        radio.addEventListener("change", function () {
            submitButton.disabled = false;

            if (formMessage) {
                formMessage.textContent = "";
            }

            document.querySelectorAll(".survey-option").forEach(function (option) {
                option.classList.remove("selected");
            });

            const selectedCard = radio.closest(".survey-option");

            if (selectedCard) {
                selectedCard.classList.add("selected");
            }
        });
    });

    function buildRequestLink(data) {
        const subject = "Training request: " + data.level;
        const body =
            "Hello FluentAI Academy,\n\n" +
            "Our AI fluency assessment result was " + data.level +
            " (" + data.score + "/" + data.maximum_score + ").\n" +
            "We would like to discuss training for our organisation.\n\n" +
            "Organisation name:\n" +
            "Number of employees:\n";

        return (
            "mailto:" + CONTACT_EMAIL +
            "?subject=" + encodeURIComponent(subject) +
            "&body=" + encodeURIComponent(body)
        );
    }

    submitButton.addEventListener("click", async function (event) {
        event.preventDefault();

        const selectedInput = document.querySelector(
            'input[name="ai_maturity"]:checked'
        );

        if (!selectedInput) {
            formMessage.textContent = "Please select one statement.";
            return;
        }

        const gradeUrl = form.dataset.gradeUrl || "/grade-survey";

        submitButton.disabled = true;
        submitButton.textContent = "Calculating...";

        try {
            const response = await fetch(gradeUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ score: Number(selectedInput.value) })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error("Request failed");
            }

            resultLevel.textContent = data.level;
            resultScore.textContent = data.score + "/" + data.maximum_score;
            resultSummary.textContent = data.summary;

            recommendationList.innerHTML = "";

            data.recommendations.forEach(function (recommendation) {
                const listItem = document.createElement("li");
                listItem.textContent = recommendation;
                recommendationList.appendChild(listItem);
            });

            if (progressBar) {
                progressBar.style.width = data.percentage + "%";
                progressBar.setAttribute("aria-valuenow", String(data.percentage));
            }

            if (requestTraining) {
                requestTraining.href = buildRequestLink(data);
            }

            resultPanel.hidden = false;
            resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (error) {
            formMessage.textContent =
                "We couldn't get your recommendation. Check your connection and try again.";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Get recommendation";
        }
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
    });
});