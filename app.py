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
            "AI Fluency Foundations: core concepts and terminology",
            "Prompting basics and everyday use cases",
            "Responsible-use essentials and company guidelines",
        ]

    elif score <= 4:
        level = "AI Adopter"
        summary = (
            "Your organisation is actively adopting AI. Focus on "
            "strengthening practices across teams."
        )
        recommendations = [
            "AI at Work: practical workflows for functional teams",
            "Output verification and quality checks",
            "Team guidelines for responsible adoption",
        ]

    else:
        level = "AI Scaler"
        summary = (
            "Your organisation is scaling AI company-wide. Focus on "
            "governance and measuring impact."
        )
        recommendations = [
            "AI Leadership and Governance program",
            "AI champions and risk controls",
            "Performance measurement and organisation-wide scaling",
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
