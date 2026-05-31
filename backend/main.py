# ============================================================
# main.py — FastAPI 主程式（加入 SSE 串流端點）
# ============================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models import (
    DrawRequest, DrawResponse,
    RecommendSpreadRequest, RecommendSpreadResponse,
    InterpretRequest, InterpretResponse,
    ChatRequest, ChatResponse,
)
from tarot_engine import draw_cards
from ai_handler import (
    recommend_spread,
    stream_interpret,
    stream_chat,
    PERSONA_LIST,
)
from spreads import ALL_SPREADS, SPREADS_BY_MODE
from tarot_data import ALL_CARDS

app = FastAPI(
    title="塔羅 AI 占卜 API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SSE 回應標頭（關閉緩衝，讓串流即時送出）
SSE_HEADERS = {
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
    "Access-Control-Allow-Origin": "*",
}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/draw", response_model=DrawResponse)
def api_draw(body: DrawRequest):
    try:
        return draw_cards(body.spread_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/recommend-spread", response_model=RecommendSpreadResponse)
async def api_recommend_spread(body: RecommendSpreadRequest):
    try:
        return await recommend_spread(body.question, body.persona_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 推薦牌陣失敗：{str(e)}")


# ── 串流：AI 解讀（SSE）────────────────────────────────────
@app.post("/api/interpret/stream")
async def api_interpret_stream(body: InterpretRequest):
    """
    SSE 串流端點，逐字回傳 AI 解讀
    格式：data: {"type": "session"|"text"|"done", ...}
    """
    def generate():
        yield from stream_interpret(
            body.question,
            body.persona_id,
            body.cards,
            body.mode,
            body.spread_id,
        )
    try:
        return StreamingResponse(generate(), media_type="text/event-stream", headers=SSE_HEADERS)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 解讀失敗：{str(e)}")


# ── 串流：聊天（SSE）───────────────────────────────────────
@app.post("/api/chat/stream")
async def api_chat_stream(body: ChatRequest):
    """
    SSE 串流端點，逐字回傳聊天回覆
    格式：data: {"type": "text"|"done", ...}
    """
    def generate():
        yield from stream_chat(body.session_id, body.message, body.persona_id)
    try:
        return StreamingResponse(generate(), media_type="text/event-stream", headers=SSE_HEADERS)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"聊天失敗：{str(e)}")


@app.get("/api/personas")
def get_personas():
    return [{"id": p.id, "name": p.name, "style": p.style, "tone": p.tone} for p in PERSONA_LIST]


@app.get("/api/spreads")
def get_spreads(mode: str = "all"):
    spreads = ALL_SPREADS if mode == "all" else SPREADS_BY_MODE.get(mode, ALL_SPREADS)
    return [
        {
            "id": s.id, "name_zh": s.name_zh, "name_en": s.name_en,
            "card_count": s.card_count, "description_zh": s.description_zh,
            "positions": [p.dict() for p in s.positions],
        }
        for s in spreads
    ]


@app.get("/api/cards")
def get_cards():
    return [card.dict() for card in ALL_CARDS]
