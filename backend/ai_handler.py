# ============================================================
# ai_handler.py — Gemini AI 處理器（穩定 production 版）
# 修正 JSON crash + Gemini 截斷 + SSE 安全性
# ============================================================

import os
import uuid
import json
import re
from typing import Generator, Dict, Any
from dotenv import load_dotenv
import google.generativeai as genai

from models import Persona, DrawnCard, RecommendSpreadResponse
from tarot_engine import format_cards_for_prompt
from spreads import SPREAD_BY_ID, ALL_SPREADS

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("請在 .env 中設定 GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
GEMINI_MODEL = "gemini-2.5-flash"

SESSION_STORE: dict[str, dict] = {}

# ─────────────────────────────────────────────
# Personas（保持原樣）
# ─────────────────────────────────────────────
PERSONAS: dict[str, Persona] = {
    "mystic_witch": Persona(...),
    "rational_analyst": Persona(...),
    "gentle_healer": Persona(...),
}

def get_persona(persona_id: str) -> Persona:
    return PERSONAS.get(persona_id, PERSONAS["mystic_witch"])


# ─────────────────────────────────────────────
# MODE CONTEXT（保持原樣）
# ─────────────────────────────────────────────
MODE_CONTEXT: Dict[str, str] = {
    "ai": "",
    "yesno": "請給出傾向但不要直接說是或否。",
    "love": "感情角度解讀。",
    "daily": "今日運勢語氣。",
}


# ─────────────────────────────────────────────
# 🔧 SAFE JSON PARSER（核心修復）
# ─────────────────────────────────────────────
def safe_parse_json(raw: str) -> Dict[str, Any]:
    raw = raw.strip()

    # 去 markdown code block
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    # 抓 JSON object
    match = re.search(r"\{.*\}", raw, re.S)
    if not match:
        raise ValueError(f"No JSON found: {raw}")

    return json.loads(match.group())


# ─────────────────────────────────────────────
# 🧠 RECOMMEND SPREAD（穩定版）
# ─────────────────────────────────────────────
def recommend_spread(question: str, persona_id: str) -> RecommendSpreadResponse:
    persona = get_persona(persona_id)

    spread_options = "\n".join(
        [f"- {s.id}：{s.name_zh}（{s.card_count}張）— {s.description_zh}" for s in ALL_SPREADS]
    )

    prompt = f"""
你是 {persona.name}，選擇最適合的塔羅牌陣。

問題：「{question}」

可用牌陣：
{spread_options}

請只輸出 JSON：
{{
  "spread_id": "...",
  "explanation": "一句自然解釋"
}}
"""

    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=persona.system_prompt
    )

    # 🔥 關鍵：增加 token，避免截斷 JSON
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            max_output_tokens=800,
            temperature=0.4
        )
    )

    raw = response.text or ""

    try:
        data = safe_parse_json(raw)
    except Exception:
        # 🔁 retry once（production safety）
        response2 = model.generate_content(prompt)
        data = safe_parse_json(response2.text or "")

    spread = SPREAD_BY_ID.get(data.get("spread_id", "three-card"))
    if not spread:
        spread = SPREAD_BY_ID["three-card"]

    return RecommendSpreadResponse(
        spread_id=spread.id,
        spread_name=spread.name_zh,
        explanation=data.get("explanation", ""),
    )


# ─────────────────────────────────────────────
# 📡 SSE INTERPRET（穩定版）
# ─────────────────────────────────────────────
def stream_interpret(
    question: str,
    persona_id: str,
    cards: list[DrawnCard],
    mode: str,
    spread_id: str,
) -> Generator[str, None, None]:

    persona = get_persona(persona_id)
    spread = SPREAD_BY_ID.get(spread_id)
    spread_name = spread.name_zh if spread else "塔羅牌陣"

    cards_text = format_cards_for_prompt(cards)
    mode_ctx = MODE_CONTEXT.get(mode, "")

    session_id = str(uuid.uuid4())

    yield f"data: {json.dumps({'type': 'session', 'session_id': session_id}, ensure_ascii=False)}\n\n"

    user_prompt = f"""
問題：{question}
牌陣：{spread_name}

{cards_text}

{mode_ctx}

請用自然段落解讀，不要列表。
"""

    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=persona.system_prompt
    )

    chat = model.start_chat(history=[])

    response = chat.send_message(
        user_prompt,
        stream=True,
        generation_config=genai.GenerationConfig(
            max_output_tokens=1200   # 🔥 修正截斷
        )
    )

    for chunk in response:
        text = getattr(chunk, "text", "")
        if text:
            yield f"data: {json.dumps({'type': 'text', 'text': text}, ensure_ascii=False)}\n\n"

    SESSION_STORE[session_id] = {
        "history": chat.history,
        "persona_id": persona_id,
        "question": question,
        "mode": mode,
    }

    yield f"data: {json.dumps({'type': 'done'})}\n\n"


# ─────────────────────────────────────────────
# 💬 CHAT STREAM（穩定版）
# ─────────────────────────────────────────────
def stream_chat(session_id: str, message: str, persona_id: str) -> Generator[str, None, None]:

    session = SESSION_STORE.get(session_id)
    persona = get_persona(persona_id)

    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=persona.system_prompt
    )

    chat = model.start_chat(history=session["history"] if session else [])

    if not session:
        message = f"（新對話）{message}"

    wrapped = f"{message}\n請用自然語氣回答，不要條列。"

    response = chat.send_message(
        wrapped,
        stream=True,
        generation_config=genai.GenerationConfig(
            max_output_tokens=800
        )
    )

    for chunk in response:
        text = getattr(chunk, "text", "")
        if text:
            yield f"data: {json.dumps({'type': 'text', 'text': text}, ensure_ascii=False)}\n\n"

    if session:
        SESSION_STORE[session_id]["history"] = chat.history

    yield f"data: {json.dumps({'type': 'done'})}\n\n"