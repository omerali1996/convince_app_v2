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
            "purpose": scenario["Amaç"],            # purpose döndürülüyor
            "system_prompt": scenario["System Prompt"],
            "summary": scenario["Özet"]
        })
    return jsonify(simplified_scenarios)


@app.route("/api/ask", methods=["POST"])
def ask():
    data = request.json
    user_input = data.get("user_input")
    scenario_id = data.get("scenario_id")
    history = data.get("history", [])  # <- opsiyonel history (frontend gönderirse hatırlar)

    if user_input is None or scenario_id is None:
        return jsonify({"error": "Missing user_input or scenario_id"}), 400

    scenario = scenarios.get(scenario_id)
    if not scenario:
        return jsonify({"error": "Invalid scenario_id"}), 400

    try:
        # Güvenli metin birleştirme (f-string içinde tırnak çakışması yaşamamak için)
        story_text = scenario["Hikaye"]
        system_prompt_text = scenario["System Prompt"]

        system_content = (
            "Sen bu hikayedeki X'sin. Nasıl davranman gerektiği ana prompt içinde verilmiştir.\n"
            f"Hikaye: {story_text}\n"
            f"Ana prompt: {system_prompt_text}"
        )

        messages = [{"role": "system", "content": system_content}]

        # History geldiyse OpenAI formatına çevir ve ekle
        if history:
            # İstersen son N mesaj ile sınırlayabilirsin:
            # history = history[-20:]
            for m in history:
                if m.get("sender") == "user":
                    messages.append({"role": "user", "content": m.get("text", "")})
                else:
                    messages.append({"role": "assistant", "content": m.get("text", "")})

        # Son kullanıcı mesajını ekle
        messages.append({"role": "user", "content": user_input})

        chat_completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        answer = chat_completion.choices[0].message.content
        return jsonify({"answer": answer})

    except Exception as e:
        print(f"OpenAI API Error: {e}")
        return jsonify({"error": "Soru cevaplanırken hata oluştu"}), 500


if __name__ == "__main__":
    app.run(debug=True)


