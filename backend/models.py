# ============================================================
# models.py — Pydantic 資料模型（前後端共用結構）
# ============================================================

from pydantic import BaseModel
from typing import Optional, List


# ── 塔羅牌 ────────────────────────────────────────────────
class TarotCard(BaseModel):
    id: str
    name_zh: str
    name_en: str
    meaning_upright: str    # 正位含義
    meaning_reversed: str   # 逆位含義
    image: str              # 本地圖片路徑
    arcana: str             # "major" | "minor"
    suit: Optional[str] = None   # "wands" | "cups" | "swords" | "pentacles"
    number: Optional[int] = None


# ── 牌陣位置 ───────────────────────────────────────────────
class CardPosition(BaseModel):
    key: str          # 位置識別碼（如 "past"）
    label_zh: str     # 中文標籤（如「過去」）
    label_en: str     # 英文標籤
    x: float          # 相對座標 -1 ~ 1
    y: float          # 相對座標 -1 ~ 1
    rotation: Optional[float] = 0.0  # 牌的旋轉角度（度）


# ── 牌陣佈局 ───────────────────────────────────────────────
class SpreadLayout(BaseModel):
    id: str
    name_zh: str
    name_en: str
    card_count: int
    positions: List[CardPosition]
    mode: str  # "ai" | "yesno" | "love" | "all"
    description_zh: str = ""


# ── 已抽的牌 ───────────────────────────────────────────────
class DrawnCard(BaseModel):
    card_id: str
    is_reversed: bool
    position: CardPosition


# ── 占卜師人設 ─────────────────────────────────────────────
class Persona(BaseModel):
    id: str
    name: str           # 人設名稱
    style: str          # 占卜風格描述
    tone: str           # 語氣特色
    system_prompt: str  # AI System Prompt


# ── API 請求 / 回應模型 ────────────────────────────────────

class DrawRequest(BaseModel):
    spread_id: str


class DrawResponse(BaseModel):
    cards: List[DrawnCard]


class RecommendSpreadRequest(BaseModel):
    question: str
    persona_id: str


class RecommendSpreadResponse(BaseModel):
    spread_id: str
    spread_name: str
    explanation: str  # AI 對推薦牌陣的解釋


class InterpretRequest(BaseModel):
    question: str
    persona_id: str
    cards: List[DrawnCard]
    mode: str  # "ai" | "yesno" | "love" | "daily"
    spread_id: str


class InterpretResponse(BaseModel):
    answer: str
    session_id: str


class ChatRequest(BaseModel):
    session_id: str
    message: str
    persona_id: str


class ChatResponse(BaseModel):
    answer: str
