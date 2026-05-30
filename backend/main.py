# ============================================================
# main.py — FastAPI 主程式
# API 路由：抽卡、推薦牌陣、解讀、聊天、查詢資料
# ============================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    DrawRequest,
    DrawResponse,
    RecommendSpreadRequest,
    RecommendSpreadResponse,
    InterpretRequest,
    InterpretResponse,
    ChatRequest,
    ChatResponse,
)
from tarot_engine import draw_cards
from ai_handler import (
    recommend_spread,
    interpret_cards,
    continue_chat,
    PERSONA_LIST,
)
from spreads import ALL_SPREADS, SPREADS_BY_MODE
from tarot_data import ALL_CARDS

# ── FastAPI 應用初始化 ─────────────────────────────────────
app = FastAPI(
    title="塔羅 AI 占卜 API",
    description="支援多模式塔羅占卜的後端服務，使用 Google Gemini AI",
    version="1.0.0",
)

# ── CORS 設定（允許前端連線）──────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # 本地開發
        "https://tarot-app-ten-dun.vercel.app",    # Vercel 部署
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── 健康檢查 ───────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "塔羅占卜 API 運行中"}


# ── 1. 抽卡 ────────────────────────────────────────────────
@app.post("/api/draw", response_model=DrawResponse)
def api_draw(body: DrawRequest):
    """
    根據牌陣 ID 抽取對應數量的牌。
    使用 Fisher-Yates shuffle，50% 逆位機率。
    """
    try:
        return draw_cards(body.spread_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── 2. AI 推薦牌陣（AI 塔羅模式專用）────────────────────
@app.post("/api/recommend-spread", response_model=RecommendSpreadResponse)
async def api_recommend_spread(body: RecommendSpreadRequest):
    """
    根據使用者問題，讓 AI 推薦最合適的牌陣。
    僅 AI 塔羅模式使用。
    """
    try:
        return await recommend_spread(
            question=body.question,
            persona_id=body.persona_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 推薦牌陣失敗：{str(e)}")


# ── 3. AI 解讀抽卡結果 ─────────────────────────────────────
@app.post("/api/interpret", response_model=InterpretResponse)
async def api_interpret(body: InterpretRequest):
    """
    將抽卡結果傳給 AI 進行解讀。
    支援四種模式：ai / yesno / love / daily
    回傳解讀文字與 session_id（供後續聊天使用）。
    """
    try:
        return await interpret_cards(
            question=body.question,
            persona_id=body.persona_id,
            cards=body.cards,
            mode=body.mode,
            spread_id=body.spread_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 解讀失敗：{str(e)}")


# ── 4. 繼續聊天 ────────────────────────────────────────────
@app.post("/api/chat", response_model=ChatResponse)
async def api_chat(body: ChatRequest):
    """
    在既有的占卜 session 中繼續與 AI 對話。
    AI 會記住先前的占卜上下文。
    """
    try:
        return await continue_chat(
            session_id=body.session_id,
            message=body.message,
            persona_id=body.persona_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 聊天失敗：{str(e)}")


# ── 5. 查詢資料 API ────────────────────────────────────────

@app.get("/api/personas")
def get_personas():
    """取得所有占卜師人設清單"""
    return [
        {
            "id": p.id,
            "name": p.name,
            "style": p.style,
            "tone": p.tone,
        }
        for p in PERSONA_LIST
    ]


@app.get("/api/spreads")
def get_spreads(mode: str = "all"):
    """
    取得牌陣清單。
    mode 可指定：ai / yesno / love / daily / all
    """
    if mode == "all":
        spreads = ALL_SPREADS
    else:
        spreads = SPREADS_BY_MODE.get(mode, ALL_SPREADS)

    return [
        {
            "id": s.id,
            "name_zh": s.name_zh,
            "name_en": s.name_en,
            "card_count": s.card_count,
            "description_zh": s.description_zh,
            "positions": [p.dict() for p in s.positions],
        }
        for s in spreads
    ]


@app.get("/api/cards")
def get_cards():
    """取得完整 78 張牌庫資料"""
    return [card.dict() for card in ALL_CARDS]
