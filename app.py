from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

MAX_SCORE = 5


@app.route("/")
def home():
    """Display the main school webpage."""
    return render_template("index.html")


def letter_grade(score):
    """Turn a 1-5 score into a simple letter grade."""
    grades = {1: "F", 2: "D", 3: "C", 4: "B", 5: "A"}
    return grades.get(score, "F")


@app.route("/grade-survey", methods=["POST"])
def grade_survey():
    """Receive an AI fluency score and return a recommendation."""
    data = request.get_json(silent=True) or {}

    try:
        score = int(data.get("score", 1))
    except (TypeError, ValueError):
        score = 1

    # Keep the value between 1 and 5
    score = max(1, min(score, MAX_SCORE))

    if score <= 2:
        level = "AI Explorer"
        summary = (
            "Your organisation is beginning its AI journey. Start with "
            "the fundamentals before scaling adoption."
        )
        recommendations = [
            "AI Fluency Foundations: core concepts, terminology and prompting basics",
            "AI Risk and Trust: responsible-use essentials and company guidelines",
        ]

    elif score <= 4:
        level = "AI Adopter"
        summary = (
            "Your organisation is actively adopting AI. Focus on "
            "strengthening practices across teams."
        )
        recommendations = [
            "AI at Work: practical workflows for functional teams",
            "AI Risk and Trust: output verification and quality checks",
            "AI Fluency Foundations: a shared baseline for every team",
        ]

    else:
        level = "AI Scaler"
        summary = (
            "Your organisation is scaling AI company-wide. Focus on "
            "governance and measuring impact."
        )
        recommendations = [
            "AI Risk and Trust: governance, risk controls and human oversight",
            "AI at Work: Redesigning workflows to scale what works",
        ]

    return jsonify(
        {
            "success": True,
            "score": score,
            "maximum_score": MAX_SCORE,
            "grade": letter_grade(score),
            "percentage": score * 20,
            "level": level,
            "summary": summary,
            "recommendations": recommendations,
        }
    )

@app.route('/contact')
def contact():
    return render_template('contact.html')


if __name__ == "__main__":
    app.run(debug=False, use_reloader=False)
