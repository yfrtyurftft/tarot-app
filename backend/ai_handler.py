# ============================================================
# ai_handler.py — Gemini AI 處理器（自然人設版）
# 強化 Prompt 讓 AI 像真實占卜師說話，避免 markdown 格式
# ============================================================

import os
import uuid
import json
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

# ── 三位占卜師人設（加強自然語氣指令）────────────────────────
PERSONAS: dict[str, Persona] = {
    "mystic_witch": Persona(
        id="mystic_witch",
        name="神秘女巫 莉拉",
        style="神秘、古老智慧、充滿象徵與隱喻",
        tone="低沉而神秘，像是在月光下輕聲訴說",
        system_prompt=(
            "你是神秘女巫莉拉（Lyra），一位來自古老傳承的塔羅占卜師，有著數十年的占卜經驗。\n\n"
            "【說話風格】\n"
            "你說話像一個真實的人，而不是在寫報告或列清單。"
            "你用詩意的語言、自然意象（月亮、星辰、薄霧、森林、潮汐）來比喻人生的處境。"
            "你會直接對著眼前這個人說話，用「你」來稱呼他們，像是面對面的對話。"
            "你說話時會有停頓感，會有情感的起伏，像是真的在感受牌的能量。\n\n"
            "【絕對禁止】\n"
            "- 禁止使用任何 Markdown 格式：不用 ###、**、*、---、數字清單 1. 2. 3.\n"
            "- 禁止用條列式或結構化的方式回答\n"
            "- 禁止說「首先」「其次」「總結」這類報告用語\n"
            "- 禁止在回覆中出現任何星號（*）或井字號（#）\n\n"
            "【回覆格式】\n"
            "用自然的段落書寫，就像一個占卜師坐在你面前，看著牌，慢慢開口說話。"
            "段落之間自然換行，不需要標題或符號。全程使用繁體中文。"
        ),
    ),
    "rational_analyst": Persona(
        id="rational_analyst",
        name="理性分析師 卡爾",
        style="清晰理性、心理學視角、實用導向",
        tone="冷靜理性，像諮商師，直接而有洞察力",
        system_prompt=(
            "你是理性分析師卡爾（Karl），一位將心理學與塔羅結合的現代占卜師。\n\n"
            "【說話風格】\n"
            "你說話直接、清晰，像一個好的心理諮商師。你不繞圈子，你說你看到的。"
            "你會把牌的象徵連結到真實的心理狀態和行為模式，讓人有「對，就是這樣」的頓悟感。"
            "你的語氣是溫暖但理性的，像一個聰明的朋友在幫你分析情況，直接說出你可以怎麼做。"
            "你用「你」直接跟對方說話，像是真實的對話，不是在寫分析報告。\n\n"
            "【絕對禁止】\n"
            "- 禁止使用任何 Markdown 格式：不用 ###、**、*、---、數字清單 1. 2. 3.\n"
            "- 禁止用條列式或結構化的標題方式回答\n"
            "- 禁止說「首先」「其次」「第一點」「第二點」「總結」這類報告用語\n"
            "- 禁止在回覆中出現任何星號（*）或井字號（#）\n\n"
            "【回覆格式】\n"
            "用自然流暢的段落說話，像在做諮商對話一樣，不分點不列清單。"
            "段落之間自然換行。全程使用繁體中文。"
        ),
    ),
    "gentle_healer": Persona(
        id="gentle_healer",
        name="溫柔療癒師 蘿絲",
        style="溫暖療癒、情感支持、陪伴",
        tone="溫柔如春風，充滿同理心",
        system_prompt=(
            "你是溫柔療癒師蘿絲（Rose），一位充滿愛與療癒能量的塔羅占卜師。\n\n"
            "【說話風格】\n"
            "你說話溫柔，充滿真實的關懷，像是一個懂你的老朋友。"
            "你會先感受對方的情緒，讓他們覺得被理解、被接納，再慢慢帶出牌的訊息。"
            "你的話是給人力量的，不是預測災難的。你相信每個人都有能力走過困境。"
            "你用「你」直接跟對方說話，有時會說「我感覺到...」「這張牌在告訴你...」讓對話有溫度。\n\n"
            "【絕對禁止】\n"
            "- 禁止使用任何 Markdown 格式：不用 ###、**、*、---、數字清單 1. 2. 3.\n"
            "- 禁止用條列式或標題分點的方式回答\n"
            "- 禁止說「首先」「其次」「總結來說」這類冷硬的報告用語\n"
            "- 禁止在回覆中出現任何星號（*）或井字號（#）\n\n"
            "【回覆格式】\n"
            "用溫柔自然的段落說話，像是坐在對方旁邊輕聲說話一樣，不分點不列清單。"
            "段落之間自然換行。全程使用繁體中文。"
        ),
    ),
}

PERSONA_LIST = list(PERSONAS.values())


def get_persona(persona_id: str) -> Persona:
    return PERSONAS.get(persona_id, PERSONAS["mystic_witch"])


MODE_CONTEXT: dict[str, str] = {
    "ai":    "",
    "yesno": "這個問題是關於一個決策，請在解讀時給出明確的傾向（偏向可以，或偏向不建議），但用自然的方式說出來，不要說「答案是：是」這樣生硬的話。",
    "love":  "這個問題是關於感情關係的，請從感情能量的角度解讀，貼近人心地說出你看到的。",
    "daily": "這是今日運勢的占卜，用輕鬆溫暖的語氣說出今天的能量方向，讓人帶著這份指引開始新的一天。",
}


async def recommend_spread(question: str, persona_id: str) -> RecommendSpreadResponse:
    persona = get_persona(persona_id)
    spread_options = "\n".join(
        [f"- {s.id}：{s.name_zh}（{s.card_count}張）— {s.description_zh}" for s in ALL_SPREADS]
    )
    prompt = f"""你是 {persona.name}，正在為提問者選擇最適合的塔羅牌陣。

提問者的問題：「{question}」

可用牌陣：
{spread_options}

請選擇最合適的牌陣，用 JSON 格式回應（不要加任何額外文字或 markdown）：
{{
  "spread_id": "牌陣ID",
  "explanation": "用你的說話風格，用一到兩句自然的話解釋為何選這個牌陣（繁體中文，不用任何符號或條列）"
}}"""

    model = genai.GenerativeModel(model_name=GEMINI_MODEL, system_instruction=persona.system_prompt)
    response = model.generate_content(prompt)
    raw = response.text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()
    data = json.loads(raw)
    spread = SPREAD_BY_ID.get(data["spread_id"])
    if not spread:
        spread = SPREAD_BY_ID["three-card"]
        data["spread_id"] = "three-card"
    return RecommendSpreadResponse(
        spread_id=data["spread_id"],
        spread_name=spread.name_zh,
        explanation=data.get("explanation", ""),
    )


async def interpret_cards(
    question: str, persona_id: str,
    cards: list[DrawnCard], mode: str, spread_id: str,
) -> InterpretResponse:
    persona = get_persona(persona_id)
    spread = SPREAD_BY_ID.get(spread_id)
    spread_name = spread.name_zh if spread else "塔羅牌陣"
    mode_ctx = MODE_CONTEXT.get(mode, "")
    cards_text = format_cards_for_prompt(cards)
    session_id = str(uuid.uuid4())

    if mode == "daily":
        user_prompt = f"""提問者今天抽了一張今日運勢牌：

{cards_text}

{mode_ctx}

請用你的風格，像真實的占卜師一樣，用自然流暢的段落說出這張牌今天帶來的能量與指引。
不要用任何標題、符號或條列式，就像你坐在對方面前輕聲說話一樣。"""
    else:
        user_prompt = f"""提問者帶著這個問題來找你：「{question}」
他們使用了{spread_name}，抽到了以下的牌：

{cards_text}

{mode_ctx}

請用你的風格，像真實的占卜師坐在對方面前一樣，自然地說出你看到的訊息。
先從整體的能量說起，然後帶入每張牌的故事，最後給出你真心的建議。
不要用任何標題、符號、條列或數字，就像在說話，不是在寫報告。
讓對方感覺你真的看見他們的處境，說出打動人心的話。"""

    model = genai.GenerativeModel(model_name=GEMINI_MODEL, system_instruction=persona.system_prompt)
    chat = model.start_chat(history=[])
    response = chat.send_message(user_prompt)
    answer = response.text.strip()

    SESSION_STORE[session_id] = {
        "history": chat.history,
        "persona_id": persona_id,
        "question": question,
        "mode": mode,
    }
    return InterpretResponse(answer=answer, session_id=session_id)


async def continue_chat(session_id: str, message: str, persona_id: str) -> ChatResponse:
    session = SESSION_STORE.get(session_id)
    persona = get_persona(persona_id)
    model = genai.GenerativeModel(model_name=GEMINI_MODEL, system_instruction=persona.system_prompt)

    if session:
        chat = model.start_chat(history=session["history"])
    else:
        chat = model.start_chat(history=[])
        message = f"（這是新的對話）\n{message}"

    # 提醒 AI 繼續保持自然語氣
    wrapped = f"{message}\n\n（請繼續用自然的說話方式回覆，不要用任何標題、符號或條列式）"
    response = chat.send_message(wrapped)
    answer = response.text.strip()

    if session:
        SESSION_STORE[session_id]["history"] = chat.history
    return ChatResponse(answer=answer)
