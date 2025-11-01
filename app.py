import os
from flask import Flask, request, jsonify
from openai import OpenAI
from flask_cors import CORS
from scenarios import scenarios  # senin Kivy'deki Convince.py içindeki senaryolar

app = Flask(__name__)
CORS(app)

# Environment variable'dan API key al
API_KEY = os.environ.get("OPENAI_API_KEY")
if not API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set!")

client = OpenAI(api_key=API_KEY)

@app.route("/api/scenarios", methods=["GET"])
def get_scenarios():
    simplified_scenarios = []
    for sid, scenario in scenarios.items():
        simplified_scenarios.append({
            "id": sid,
            "name": scenario["Senaryo Adı"],
            "story": scenario["Hikaye"],
            "purpose": scenario["Amaç"],            # <-- EKLENDİ
            "system_prompt": scenario["System Prompt"]
        })
    return jsonify(simplified_scenarios)


@app.route("/api/ask", methods=["POST"])
def ask():
    data = request.json
    user_input = data.get("user_input")
    scenario_id = data.get("scenario_id")
    
    if user_input is None or scenario_id is None:
        return jsonify({"error": "Missing user_input or scenario_id"}), 400
    
    scenario = scenarios.get(scenario_id)
    if not scenario:
        return jsonify({"error": "Invalid scenario_id"}), 400

    try:
        chat_completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"Sen {scenario["Hikaye"]}'deki karaktersin. O karakter gibi bir ruh halinde ol ve o şekilde davran lütfen. {scenario["System Prompt"]}" },
                {"role": "user", "content": user_input}
            ]
        )
        answer = chat_completion.choices[0].message.content
        return jsonify({"answer": answer})
    
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        return jsonify({"error": "Soru cevaplanırken hata oluştu"}), 500


if __name__ == "__main__":
    app.run(debug=True)

