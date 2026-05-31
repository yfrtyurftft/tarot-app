# ============================================================
# main.py — FastAPI 主程式（穩定 SSE 修正版）
# ============================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models import (
    DrawRequest, DrawResponse,
    RecommendSpreadRequest, RecommendSpreadResponse,
    InterpretRequest,
    ChatRequest,
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

# SSE headers（強化穩定性）
SSE_HEADERS = {
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
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
    # ❗不要用 try/except 吃掉錯誤，讓 log 清楚
    return await recommend_spread(body.question, body.persona_id)


# ─────────────────────────────
# SSE: interpret
# ─────────────────────────────
@app.post("/api/interpret/stream")
async def api_interpret_stream(body: InterpretRequest):

    def generate():
        yield from stream_interpret(
            body.question,
            body.persona_id,
            body.cards,
            body.mode,
            body.spread_id,
        )

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers=SSE_HEADERS,
    )


# ─────────────────────────────
# SSE: chat
# ─────────────────────────────
@app.post("/api/chat/stream")
async def api_chat_stream(body: ChatRequest):

    def generate():
        yield from stream_chat(
            body.session_id,
            body.message,
            body.persona_id,
        )

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers=SSE_HEADERS,
    )


@app.get("/api/personas")
def get_personas():
    return [
        {"id": p.id, "name": p.name, "style": p.style, "tone": p.tone}
        for p in PERSONA_LIST
    ]


@app.get("/api/spreads")
def get_spreads(mode: str = "all"):
    spreads = ALL_SPREADS if mode == "all" else SPREADS_BY_MODE.get(mode, ALL_SPREADS)
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
    return [card.dict() for card in ALL_CARDS]