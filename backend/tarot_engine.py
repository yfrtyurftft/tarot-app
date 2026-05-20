# ============================================================
# tarot_engine.py — 抽卡引擎（Fisher-Yates shuffle + 逆位判斷）
# ============================================================

import random
from models import DrawnCard, DrawResponse, SpreadLayout
from tarot_data import ALL_CARDS, CARD_BY_ID
from spreads import SPREAD_BY_ID


def draw_cards(spread_id: str) -> DrawResponse:
    """
    根據牌陣 ID 抽取對應數量的牌。
    - 使用 Fisher-Yates shuffle 確保不重複
    - 每張牌有 50% 機率為逆位
    """
    spread: SpreadLayout = SPREAD_BY_ID.get(spread_id)
    if not spread:
        raise ValueError(f"找不到牌陣：{spread_id}")

    # Fisher-Yates shuffle：複製並打亂牌庫
    deck = ALL_CARDS.copy()
    for i in range(len(deck) - 1, 0, -1):
        j = random.randint(0, i)
        deck[i], deck[j] = deck[j], deck[i]

    # 抽取對應數量的牌
    selected = deck[: spread.card_count]

    drawn_cards = []
    for card, position in zip(selected, spread.positions):
        drawn_cards.append(
            DrawnCard(
                card_id=card.id,
                is_reversed=random.random() < 0.5,  # 50% 逆位機率
                position=position,
            )
        )

    return DrawResponse(cards=drawn_cards)


def format_cards_for_prompt(drawn_cards: list[DrawnCard]) -> str:
    """
    將抽卡結果格式化為 AI Prompt 可讀的文字。
    """
    lines = []
    for i, drawn in enumerate(drawn_cards, 1):
        card = CARD_BY_ID.get(drawn.card_id)
        if not card:
            continue
        orientation = "逆位" if drawn.is_reversed else "正位"
        meaning = card.meaning_reversed if drawn.is_reversed else card.meaning_upright
        lines.append(
            f"{i}. 【{drawn.position.label_zh}】{card.name_zh}（{card.name_en}）— {orientation}\n"
            f"   含義：{meaning}"
        )
    return "\n".join(lines)
