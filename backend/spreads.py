# ============================================================
# spreads.py — 所有牌陣定義（標準排列 + 相對座標 -1 ~ 1）
# 各模式可選牌陣：
#   ai     → 全部牌陣（AI 自行推薦）
#   yesno  → 是非題單卡、是非題三卡、二選一
#   love   → 感情五卡陣、感情七卡陣、阻礙與建議
#   daily  → 今日運勢單卡（固定）
# ============================================================

from models import SpreadLayout, CardPosition

# ── 單卡占卜（1張）— AI 塔羅專用 ───────────────────────────
SINGLE = SpreadLayout(
    id="single",
    name_zh="單卡占卜",
    name_en="Single Card",
    card_count=1,
    mode="ai",
    description_zh="抽一張牌，直接洞察當下核心能量。",
    positions=[
        CardPosition(key="present", label_zh="當下", label_en="Present", x=0.0, y=0.0),
    ],
)

# ── 三卡占卜（3張）過去／現在／未來 — AI 塔羅專用 ──────────
THREE_CARD = SpreadLayout(
    id="three-card",
    name_zh="三卡占卜",
    name_en="Three Card Spread",
    card_count=3,
    mode="ai",
    description_zh="探索過去的影響、現在的狀況與未來的走向。",
    positions=[
        CardPosition(key="past",    label_zh="過去", label_en="Past",    x=-0.65, y=0.0),
        CardPosition(key="present", label_zh="現在", label_en="Present", x=0.0,   y=0.0),
        CardPosition(key="future",  label_zh="未來", label_en="Future",  x=0.65,  y=0.0),
    ],
)

# ── 五卡十字陣（5張）— AI 塔羅專用 ───────────────────────
FIVE_CROSS = SpreadLayout(
    id="five-cross",
    name_zh="五卡十字陣",
    name_en="Five Card Cross",
    card_count=5,
    mode="ai",
    description_zh="從過去、現在、未來、優勢與挑戰五個面向全方位解析。",
    positions=[
        CardPosition(key="past",    label_zh="過去", label_en="Past",      x=-0.65, y=0.0),
        CardPosition(key="present", label_zh="現在", label_en="Present",   x=0.0,   y=0.0),
        CardPosition(key="future",  label_zh="未來", label_en="Future",    x=0.65,  y=0.0),
        CardPosition(key="above",   label_zh="優勢", label_en="Strength",  x=0.0,   y=-0.6),
        CardPosition(key="below",   label_zh="挑戰", label_en="Challenge", x=0.0,   y=0.6),
    ],
)

# ── 七卡馬蹄陣（7張）— AI 塔羅專用 ───────────────────────
SEVEN_HORSESHOE = SpreadLayout(
    id="seven-horseshoe",
    name_zh="七卡馬蹄陣",
    name_en="Seven Card Horseshoe",
    card_count=7,
    mode="ai",
    description_zh="深入分析過去影響、現狀、隱藏因素、建議、外在影響、希望與最終結果。",
    positions=[
        CardPosition(key="past",     label_zh="過去",      label_en="Past",         x=-0.75, y=0.4),
        CardPosition(key="present",  label_zh="現在",      label_en="Present",      x=-0.45, y=0.1),
        CardPosition(key="hidden",   label_zh="隱藏因素",  label_en="Hidden",       x=-0.15, y=-0.1),
        CardPosition(key="advice",   label_zh="建議",      label_en="Advice",       x=0.15,  y=-0.1),
        CardPosition(key="external", label_zh="外在影響",  label_en="External",     x=0.45,  y=0.1),
        CardPosition(key="hopes",    label_zh="希望與恐懼",label_en="Hopes & Fears",x=0.75,  y=0.4),
        CardPosition(key="outcome",  label_zh="最終結果",  label_en="Outcome",      x=0.0,   y=0.65),
    ],
)

# ── 凱爾特十字陣（10張）— AI 塔羅專用 ────────────────────
CELTIC_CROSS = SpreadLayout(
    id="celtic-cross",
    name_zh="凱爾特十字陣",
    name_en="Celtic Cross",
    card_count=10,
    mode="ai",
    description_zh="最全面的塔羅牌陣，涵蓋現狀、挑戰、根源、過去、潛意識、未來、自我認知、環境、希望與最終結果。",
    positions=[
        CardPosition(key="present",     label_zh="現狀",     label_en="Present",       x=-0.25, y=0.0,  rotation=0),
        CardPosition(key="challenge",   label_zh="挑戰",     label_en="Challenge",     x=-0.25, y=0.0,  rotation=90),
        CardPosition(key="above",       label_zh="理想目標", label_en="Above",         x=-0.25, y=-0.42),
        CardPosition(key="below",       label_zh="根源",     label_en="Foundation",    x=-0.25, y=0.42),
        CardPosition(key="past",        label_zh="過去",     label_en="Past",          x=-0.62, y=0.0),
        CardPosition(key="future",      label_zh="未來",     label_en="Future",        x=0.12,  y=0.0),
        CardPosition(key="self",        label_zh="自我",     label_en="Self",          x=0.55,  y=0.6),
        CardPosition(key="environment", label_zh="環境",     label_en="Environment",   x=0.55,  y=0.2),
        CardPosition(key="hopes",       label_zh="希望與恐懼",label_en="Hopes & Fears",x=0.55,  y=-0.2),
        CardPosition(key="outcome",     label_zh="最終結果", label_en="Outcome",       x=0.55,  y=-0.6),
    ],
)

# ── 是非題單卡（1張）— 是否塔羅專用 ──────────────────────
YES_NO_SINGLE = SpreadLayout(
    id="yesno-single",
    name_zh="是非題單卡",
    name_en="Yes/No Single",
    card_count=1,
    mode="yesno",
    description_zh="直接抽一張牌，快速洞察是與否的能量方向。",
    positions=[
        CardPosition(key="answer", label_zh="答案", label_en="Answer", x=0.0, y=0.0),
    ],
)

# ── 是非題三卡（3張）— 是否塔羅專用 ──────────────────────
YES_NO_THREE = SpreadLayout(
    id="yesno-three",
    name_zh="是非題三卡",
    name_en="Yes/No Three Card",
    card_count=3,
    mode="yesno",
    description_zh="抽三張牌，從現狀、影響與最終能量判斷是與否。",
    positions=[
        CardPosition(key="situation", label_zh="現狀能量", label_en="Situation", x=-0.65, y=0.0),
        CardPosition(key="influence", label_zh="影響因素", label_en="Influence", x=0.0,   y=0.0),
        CardPosition(key="answer",    label_zh="答案能量", label_en="Answer",    x=0.65,  y=0.0),
    ],
)

# ── 二選一牌陣（6張）— 是否塔羅專用 ──────────────────────
TWO_CHOICES = SpreadLayout(
    id="two-choices",
    name_zh="二選一牌陣",
    name_en="Two Choices",
    card_count=6,
    mode="yesno",
    description_zh="為兩個選項各抽三張牌，從能量、挑戰與結果比較兩條路。",
    positions=[
        CardPosition(key="a_energy",    label_zh="選項A能量", label_en="Option A Energy",   x=-0.65, y=-0.35),
        CardPosition(key="a_challenge", label_zh="選項A挑戰", label_en="Option A Challenge", x=-0.65, y=0.0),
        CardPosition(key="a_outcome",   label_zh="選項A結果", label_en="Option A Outcome",   x=-0.65, y=0.35),
        CardPosition(key="b_energy",    label_zh="選項B能量", label_en="Option B Energy",   x=0.65,  y=-0.35),
        CardPosition(key="b_challenge", label_zh="選項B挑戰", label_en="Option B Challenge", x=0.65,  y=0.0),
        CardPosition(key="b_outcome",   label_zh="選項B結果", label_en="Option B Outcome",   x=0.65,  y=0.35),
    ],
)

# ── 感情五卡陣（5張）— 感情塔羅專用 ──────────────────────
LOVE_FIVE = SpreadLayout(
    id="love-five",
    name_zh="感情五卡陣",
    name_en="Love Five Card",
    card_count=5,
    mode="love",
    description_zh="探索你的感情能量、對方能量、關係現狀、阻礙與發展方向。",
    positions=[
        CardPosition(key="you",        label_zh="你的能量", label_en="You",        x=-0.65, y=0.0),
        CardPosition(key="partner",    label_zh="對方能量", label_en="Partner",    x=0.65,  y=0.0),
        CardPosition(key="connection", label_zh="關係現狀", label_en="Connection", x=0.0,   y=0.0),
        CardPosition(key="obstacle",   label_zh="關係阻礙", label_en="Obstacle",   x=0.0,   y=0.5),
        CardPosition(key="potential",  label_zh="發展潛力", label_en="Potential",  x=0.0,   y=-0.5),
    ],
)

# ── 感情七卡陣（7張）— 感情塔羅專用 ──────────────────────
LOVE_SEVEN = SpreadLayout(
    id="love-seven",
    name_zh="感情七卡陣",
    name_en="Love Seven Card",
    card_count=7,
    mode="love",
    description_zh="深入解析雙方感情，包含過去基礎、當下狀態、未來走向與建議。",
    positions=[
        CardPosition(key="past",       label_zh="感情基礎",  label_en="Foundation", x=0.0,   y=0.55),
        CardPosition(key="you",        label_zh="你的感受",  label_en="You",        x=-0.65, y=0.2),
        CardPosition(key="partner",    label_zh="對方感受",  label_en="Partner",    x=0.65,  y=0.2),
        CardPosition(key="connection", label_zh="當下連結",  label_en="Now",        x=0.0,   y=0.0),
        CardPosition(key="obstacle",   label_zh="主要障礙",  label_en="Obstacle",   x=-0.65, y=-0.35),
        CardPosition(key="advice",     label_zh="給你的建議",label_en="Advice",     x=0.65,  y=-0.35),
        CardPosition(key="outcome",    label_zh="感情走向",  label_en="Outcome",    x=0.0,   y=-0.55),
    ],
)

# ── 阻礙與建議（3張）— 感情塔羅專用 ──────────────────────
OBSTACLE_ADVICE = SpreadLayout(
    id="obstacle-advice",
    name_zh="阻礙與建議",
    name_en="Obstacle & Advice",
    card_count=3,
    mode="love",
    description_zh="直指當前感情阻礙、內在資源與最佳行動建議。",
    positions=[
        CardPosition(key="obstacle", label_zh="阻礙", label_en="Obstacle", x=-0.65, y=0.0),
        CardPosition(key="resource", label_zh="資源", label_en="Resource", x=0.0,   y=0.0),
        CardPosition(key="advice",   label_zh="建議", label_en="Advice",   x=0.65,  y=0.0),
    ],
)

# ── 今日運勢（1張）— 今日運勢專用 ────────────────────────
DAILY_SINGLE = SpreadLayout(
    id="daily-single",
    name_zh="今日運勢",
    name_en="Daily Card",
    card_count=1,
    mode="daily",
    description_zh="每日一牌，掌握今日能量與指引。",
    positions=[
        CardPosition(key="today", label_zh="今日能量", label_en="Today", x=0.0, y=0.0),
    ],
)

# ── 月運牌陣（12張）— AI 塔羅專用 ────────────────────────
MONTHLY = SpreadLayout(
    id="monthly",
    name_zh="月運牌陣",
    name_en="Monthly Spread",
    card_count=12,
    mode="ai",
    description_zh="為每個月抽一張牌，預覽全年十二個月的能量走向。",
    positions=[
        CardPosition(key="jan", label_zh="一月",   label_en="January",   x=0.0,   y=-0.75),
        CardPosition(key="feb", label_zh="二月",   label_en="February",  x=0.38,  y=-0.65),
        CardPosition(key="mar", label_zh="三月",   label_en="March",     x=0.65,  y=-0.38),
        CardPosition(key="apr", label_zh="四月",   label_en="April",     x=0.75,  y=0.0),
        CardPosition(key="may", label_zh="五月",   label_en="May",       x=0.65,  y=0.38),
        CardPosition(key="jun", label_zh="六月",   label_en="June",      x=0.38,  y=0.65),
        CardPosition(key="jul", label_zh="七月",   label_en="July",      x=0.0,   y=0.75),
        CardPosition(key="aug", label_zh="八月",   label_en="August",    x=-0.38, y=0.65),
        CardPosition(key="sep", label_zh="九月",   label_en="September", x=-0.65, y=0.38),
        CardPosition(key="oct", label_zh="十月",   label_en="October",   x=-0.75, y=0.0),
        CardPosition(key="nov", label_zh="十一月", label_en="November",  x=-0.65, y=-0.38),
        CardPosition(key="dec", label_zh="十二月", label_en="December",  x=-0.38, y=-0.65),
    ],
)

# ── 所有牌陣清單 ───────────────────────────────────────────
ALL_SPREADS: list[SpreadLayout] = [
    SINGLE,
    THREE_CARD,
    FIVE_CROSS,
    SEVEN_HORSESHOE,
    CELTIC_CROSS,
    YES_NO_SINGLE,
    YES_NO_THREE,
    TWO_CHOICES,
    LOVE_FIVE,
    LOVE_SEVEN,
    OBSTACLE_ADVICE,
    DAILY_SINGLE,
    MONTHLY,
]

# ── 按模式分組（嚴格對應各模式應顯示的牌陣）─────────────────
SPREADS_BY_MODE: dict[str, list[SpreadLayout]] = {
    # AI 塔羅：全部牌陣都可推薦
    "ai":    [s for s in ALL_SPREADS if s.mode in ("ai", "all")],
    # 是否塔羅：只有是非題相關3個
    "yesno": [YES_NO_SINGLE, YES_NO_THREE, TWO_CHOICES],
    # 感情塔羅：只有感情相關3個
    "love":  [LOVE_FIVE, LOVE_SEVEN, OBSTACLE_ADVICE],
    # 今日運勢：固定單卡
    "daily": [DAILY_SINGLE],
}

# 按 ID 快速查找
SPREAD_BY_ID: dict[str, SpreadLayout] = {s.id: s for s in ALL_SPREADS}
