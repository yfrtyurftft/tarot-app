# ============================================================
# ai_handler.py — Gemini AI 處理器（支援 SSE 串流輸出｜修正版）
# ============================================================

import os
import uuid
import json
from typing import Generator
from dotenv import load_dotenv
import google.generativeai as genai

from models import (
    Persona, DrawnCard,
    RecommendSpreadResponse, InterpretResponse, ChatResponse,
)
from tarot_engine import format_cards_for_prompt
from spreads import SPREAD_BY_ID, ALL_SPREADS

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("請在 .env 中設定 GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
GEMINI_MODEL = "gemini-2.5-flash"

SESSION_STORE: dict[str, dict] = {}

# ============================================================
# ✅ 修正點：避免 Persona(...) 在 import 時 crash
# ============================================================

PERSONAS: dict[str, Persona] = {
    "mystic_witch": Persona.model_validate({
        "id": "mystic_witch",
        "name": "神秘女巫 莉拉",
        "style": "神秘、古老智慧、充滿象徵與隱喻",
        "tone": "低沉而神秘，像是在月光下輕聲訴說",
        "system_prompt": (
            "你是神秘女巫莉拉（Lyra），一位來自古老傳承的塔羅占卜師，有著數十年的占卜經驗。\n\n"
            "【說話風格】\n"
            "你說話像一個真實的人，而不是在寫報告或列清單。"
            "你用詩意的語言、自然意象（月亮、星辰、薄霧、森林、潮汐）來比喻人生的處境。"
            "你會直接對著眼前這個人說話，用「你」來稱呼他們。"
            "你的語氣有停頓感與情緒流動。\n\n"
            "【絕對禁止】\n"
            "- 禁止 Markdown\n"
            "- 禁止條列\n"
            "- 禁止報告式語氣\n"
        )
    }),

    "rational_analyst": Persona.model_validate({
        "id": "rational_analyst",
        "name": "理性分析師 卡爾",
        "style": "清晰理性、心理學視角、實用導向",
        "tone": "冷靜理性",
        "system_prompt": (
            "你是理性分析師卡爾。\n\n"
            "【說話風格】直接、清晰、心理學導向。\n"
            "【禁止】Markdown、條列、報告語氣。"
        )
    }),

    "gentle_healer": Persona.model_validate({
        "id": "gentle_healer",
        "name": "溫柔療癒師 蘿絲",
        "style": "溫暖療癒、情感支持",
        "tone": "溫柔",
        "system_prompt": (
            "你是溫柔療癒師蘿絲。\n\n"
            "【說話風格】溫柔、有同理心、陪伴感。\n"
            "【禁止】Markdown、條列、報告語氣。"
        )
    }),
}

PERSONA_LIST = list(PERSONAS.values())


def get_persona(persona_id: str) -> Persona:
    return PERSONAS.get(persona_id, PERSONAS["mystic_witch"])


MODE_CONTEXT: dict[str, str] = {
    "ai": "",
    "yesno": "請給出偏向性判斷，但用自然語氣表達。",
    "love": "從感情角度解讀。",
    "daily": "以今日能量方式解讀。",
}

# ============================================================
# 1. 推薦牌陣（非串流）
# ============================================================

async def recommend_spread(question: str, persona_id: str) -> RecommendSpreadResponse:
    persona = get_persona(persona_id)

    spread_options = "\n".join(
        [f"- {s.id}：{s.name_zh}（{s.card_count}張）— {s.description_zh}" for s in ALL_SPREADS]
    )

    prompt = f"""你是 {persona.name}。

問題：「{question}」

可用牌陣：
{spread_options}

請輸出 JSON：
{{
  "spread_id": "...",
  "explanation": "..."
}}"""

    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=persona.system_prompt
    )

    response = model.generate_content(prompt)
    raw = response.text.strip()

    try:
        data = json.loads(raw)
    except Exception:
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw.strip())

    spread = SPREAD_BY_ID.get(data["spread_id"]) or SPREAD_BY_ID["three-card"]

    return RecommendSpreadResponse(
        spread_id=data["spread_id"],
        spread_name=spread.name_zh,
        explanation=data.get("explanation", "")
    )

# ============================================================
# 2. SSE 解讀
# ============================================================

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
    session_id = str(uuid.uuid4())

    yield f"data: {json.dumps({'type': 'session', 'session_id': session_id}, ensure_ascii=False)}\n\n"

    user_prompt = f"""
問題：{question}
牌陣：{spread_name}
牌：
{cards_text}

{MODE_CONTEXT.get(mode, "")}
"""

    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=persona.system_prompt
    )

    chat = model.start_chat(history=[])

    response = chat.send_message(
        user_prompt,
        stream=True,
        generation_config=genai.GenerationConfig(max_output_tokens=700)
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

# ============================================================
# 3. chat SSE
# ============================================================

def stream_chat(session_id: str, message: str, persona_id: str):

    session = SESSION_STORE.get(session_id)
    persona = get_persona(persona_id)

    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=persona.system_prompt
    )

    chat = model.start_chat(history=session["history"] if session else [])

    if not session:
        message = f"（新對話）{message}"

    response = chat.send_message(
        message,
        stream=True,
        generation_config=genai.GenerationConfig(max_output_tokens=400)
    )

    for chunk in response:
        text = getattr(chunk, "text", "")
        if text:
            yield f"data: {json.dumps({'type': 'text', 'text': text}, ensure_ascii=False)}\n\n"

    if session:
        SESSION_STORE[session_id]["history"] = chat.history

    yield f"data: {json.dumps({'type': 'done'})}\n\n"