# ============================================================
# tarot_data.py — 78 張完整塔羅牌庫
# 圖片使用本機路徑 /cards/[id].jpg
# 執行 download_cards.py 後圖片會存在 frontend/public/cards/
# ============================================================

from typing import List
from models import TarotCard

def img(card_id: str) -> str:
    """回傳本機圖片路徑，由 Next.js public 資料夾提供"""
    return f"/cards/{card_id}.jpg"

MAJOR_ARCANA: List[TarotCard] = [
    TarotCard(id="fool",             name_zh="愚人",     name_en="The Fool",           meaning_upright="新開始、冒險、自由精神、天真、無限可能",       meaning_reversed="魯莽、冒失、逃避責任、缺乏方向",         image=img("fool"),             arcana="major", number=0),
    TarotCard(id="magician",         name_zh="魔術師",   name_en="The Magician",       meaning_upright="意志力、技能、專注、創造力、行動力",           meaning_reversed="操縱、欺騙、技能未發揮、優柔寡斷",       image=img("magician"),         arcana="major", number=1),
    TarotCard(id="high_priestess",   name_zh="女祭司",   name_en="The High Priestess", meaning_upright="直覺、神秘、內在智慧、潛意識、靜默",           meaning_reversed="隱藏秘密、缺乏直覺、表面資訊",           image=img("high_priestess"),   arcana="major", number=2),
    TarotCard(id="empress",          name_zh="女皇",     name_en="The Empress",        meaning_upright="豐盛、生育力、大自然、創造、母性",             meaning_reversed="依賴、創造受阻、過度保護",               image=img("empress"),          arcana="major", number=3),
    TarotCard(id="emperor",          name_zh="皇帝",     name_en="The Emperor",        meaning_upright="權威、結構、控制、父性、穩定",                 meaning_reversed="獨裁、缺乏彈性、控制慾強",               image=img("emperor"),          arcana="major", number=4),
    TarotCard(id="hierophant",       name_zh="教皇",     name_en="The Hierophant",     meaning_upright="傳統、宗教、道德規範、精神指引、制度",         meaning_reversed="打破傳統、挑戰規範、非正統",             image=img("hierophant"),       arcana="major", number=5),
    TarotCard(id="lovers",           name_zh="戀人",     name_en="The Lovers",         meaning_upright="愛情、選擇、和諧、價值觀、連結",               meaning_reversed="不和諧、錯誤選擇、價值觀衝突",           image=img("lovers"),           arcana="major", number=6),
    TarotCard(id="chariot",          name_zh="戰車",     name_en="The Chariot",        meaning_upright="意志力、勝利、決心、掌控、前進",               meaning_reversed="失控、侵略性、缺乏方向",                 image=img("chariot"),          arcana="major", number=7),
    TarotCard(id="strength",         name_zh="力量",     name_en="Strength",           meaning_upright="內在力量、勇氣、耐心、慈悲、自我控制",         meaning_reversed="軟弱、自我懷疑、缺乏自信",               image=img("strength"),         arcana="major", number=8),
    TarotCard(id="hermit",           name_zh="隱士",     name_en="The Hermit",         meaning_upright="內省、尋求真相、獨處、指引、智慧",             meaning_reversed="孤立、退縮、拒絕幫助",                   image=img("hermit"),           arcana="major", number=9),
    TarotCard(id="wheel_of_fortune", name_zh="命運之輪", name_en="Wheel of Fortune",   meaning_upright="命運、循環、好運、轉折點、業力",               meaning_reversed="壞運氣、抗拒改變、阻礙循環",             image=img("wheel_of_fortune"), arcana="major", number=10),
    TarotCard(id="justice",          name_zh="正義",     name_en="Justice",            meaning_upright="公平、真相、因果、法律、平衡",                 meaning_reversed="不公正、不誠實、逃避責任",               image=img("justice"),          arcana="major", number=11),
    TarotCard(id="hanged_man",       name_zh="倒吊人",   name_en="The Hanged Man",     meaning_upright="暫停、放手、新視角、犧牲、等待",               meaning_reversed="拖延、抗拒、無謂犧牲",                   image=img("hanged_man"),       arcana="major", number=12),
    TarotCard(id="death",            name_zh="死神",     name_en="Death",              meaning_upright="轉變、結束與開始、蛻變、放下",                 meaning_reversed="抗拒改變、停滯不前、腐敗",               image=img("death"),            arcana="major", number=13),
    TarotCard(id="temperance",       name_zh="節制",     name_en="Temperance",         meaning_upright="平衡、節制、耐心、調和、目的性",               meaning_reversed="失衡、過度、缺乏耐心",                   image=img("temperance"),       arcana="major", number=14),
    TarotCard(id="devil",            name_zh="惡魔",     name_en="The Devil",          meaning_upright="束縛、上癮、物質主義、陰暗面、執迷",           meaning_reversed="解脫束縛、重獲自由、覺醒",               image=img("devil"),            arcana="major", number=15),
    TarotCard(id="tower",            name_zh="塔",       name_en="The Tower",          meaning_upright="突然改變、混亂、啟示、破壞舊結構",             meaning_reversed="避免災難、延遲崩塌、內部動盪",           image=img("tower"),            arcana="major", number=16),
    TarotCard(id="star",             name_zh="星星",     name_en="The Star",           meaning_upright="希望、靈感、平靜、更新、靈性",                 meaning_reversed="絕望、失去信念、灰心",                   image=img("star"),             arcana="major", number=17),
    TarotCard(id="moon",             name_zh="月亮",     name_en="The Moon",           meaning_upright="幻覺、恐懼、潛意識、直覺、迷惑",               meaning_reversed="釋放恐懼、事實浮現、清晰",               image=img("moon"),             arcana="major", number=18),
    TarotCard(id="sun",              name_zh="太陽",     name_en="The Sun",            meaning_upright="喜悅、成功、活力、樂觀、童真",                 meaning_reversed="暫時的不快樂、悲觀、缺乏活力",           image=img("sun"),              arcana="major", number=19),
    TarotCard(id="judgement",        name_zh="審判",     name_en="Judgement",          meaning_upright="反思、覺醒、寬恕、轉化、內在呼喚",             meaning_reversed="自我懷疑、拒絕覺醒、過去陰影",           image=img("judgement"),        arcana="major", number=20),
    TarotCard(id="world",            name_zh="世界",     name_en="The World",          meaning_upright="完成、整合、成就、旅行、圓滿",                 meaning_reversed="未完成、延遲、缺乏終結",                 image=img("world"),            arcana="major", number=21),
]

WANDS: List[TarotCard] = [
    TarotCard(id="wands_ace",    name_zh="權杖一", name_en="Ace of Wands",      meaning_upright="新的創意、靈感迸發、熱情、勇氣",   meaning_reversed="延遲、缺乏動力、創意受阻", image=img("wands_ace"),    arcana="minor", suit="wands", number=1),
    TarotCard(id="wands_02",     name_zh="權杖二", name_en="Two of Wands",      meaning_upright="規劃未來、決策、大膽冒險、展望", meaning_reversed="恐懼未知、計劃失當、猶豫", image=img("wands_02"),     arcana="minor", suit="wands", number=2),
    TarotCard(id="wands_03",     name_zh="權杖三", name_en="Three of Wands",    meaning_upright="展望、進取、擴展、先見之明",       meaning_reversed="挫折、延遲、缺乏遠見",     image=img("wands_03"),     arcana="minor", suit="wands", number=3),
    TarotCard(id="wands_04",     name_zh="權杖四", name_en="Four of Wands",     meaning_upright="慶祝、和諧、家庭、社群、穩定",     meaning_reversed="家庭不和、缺乏支持",       image=img("wands_04"),     arcana="minor", suit="wands", number=4),
    TarotCard(id="wands_05",     name_zh="權杖五", name_en="Five of Wands",     meaning_upright="競爭、衝突、挑戰、分歧、活躍",     meaning_reversed="避免衝突、內在衝突",       image=img("wands_05"),     arcana="minor", suit="wands", number=5),
    TarotCard(id="wands_06",     name_zh="權杖六", name_en="Six of Wands",      meaning_upright="勝利、成功、認可、自信、進展",     meaning_reversed="延遲成功、缺乏自信",       image=img("wands_06"),     arcana="minor", suit="wands", number=6),
    TarotCard(id="wands_07",     name_zh="權杖七", name_en="Seven of Wands",    meaning_upright="挑戰、防守立場、堅持、優勢",       meaning_reversed="退縮、不堪重負",           image=img("wands_07"),     arcana="minor", suit="wands", number=7),
    TarotCard(id="wands_08",     name_zh="權杖八", name_en="Eight of Wands",    meaning_upright="快速行動、速度、進展、消息",       meaning_reversed="延遲、挫折、溝通不良",     image=img("wands_08"),     arcana="minor", suit="wands", number=8),
    TarotCard(id="wands_09",     name_zh="權杖九", name_en="Nine of Wands",     meaning_upright="韌性、守護、勇氣、堅持",           meaning_reversed="偏執、防禦、不願妥協",     image=img("wands_09"),     arcana="minor", suit="wands", number=9),
    TarotCard(id="wands_10",     name_zh="權杖十", name_en="Ten of Wands",      meaning_upright="負擔、責任過重、壓力、努力",       meaning_reversed="釋放重擔、委派、疲憊",     image=img("wands_10"),     arcana="minor", suit="wands", number=10),
    TarotCard(id="wands_page",   name_zh="權杖侍者",name_en="Page of Wands",   meaning_upright="探索、熱情、創意、自由精神",       meaning_reversed="缺乏方向、衝動",           image=img("wands_page"),   arcana="minor", suit="wands", number=11),
    TarotCard(id="wands_knight", name_zh="權杖騎士",name_en="Knight of Wands", meaning_upright="行動、冒險、衝勁、熱情、大膽",     meaning_reversed="魯莽、急躁、缺乏計劃",     image=img("wands_knight"), arcana="minor", suit="wands", number=12),
    TarotCard(id="wands_queen",  name_zh="權杖王后",name_en="Queen of Wands",  meaning_upright="自信、勇敢、獨立、熱情、魅力",     meaning_reversed="自私、嫉妒、不安全感",     image=img("wands_queen"),  arcana="minor", suit="wands", number=13),
    TarotCard(id="wands_king",   name_zh="權杖國王",name_en="King of Wands",   meaning_upright="領導力、遠見、誠實、有魅力",       meaning_reversed="衝動、獨裁、無情",         image=img("wands_king"),   arcana="minor", suit="wands", number=14),
]

CUPS: List[TarotCard] = [
    TarotCard(id="cups_ace",    name_zh="聖杯一", name_en="Ace of Cups",      meaning_upright="新的愛情、情感開始、直覺、靈性",   meaning_reversed="情感壓抑、不安全感、空虛", image=img("cups_ace"),    arcana="minor", suit="cups", number=1),
    TarotCard(id="cups_02",     name_zh="聖杯二", name_en="Two of Cups",      meaning_upright="夥伴關係、相互吸引、連結、和諧",   meaning_reversed="失衡關係、溝通失調",       image=img("cups_02"),     arcana="minor", suit="cups", number=2),
    TarotCard(id="cups_03",     name_zh="聖杯三", name_en="Three of Cups",    meaning_upright="慶祝、友誼、社群、喜悅、合作",     meaning_reversed="過度放縱、孤立",           image=img("cups_03"),     arcana="minor", suit="cups", number=3),
    TarotCard(id="cups_04",     name_zh="聖杯四", name_en="Four of Cups",     meaning_upright="沉思、冷漠、重新評估、錯失良機",   meaning_reversed="新的動力、重新投入",       image=img("cups_04"),     arcana="minor", suit="cups", number=4),
    TarotCard(id="cups_05",     name_zh="聖杯五", name_en="Five of Cups",     meaning_upright="失落、悲傷、後悔、失望、哀悼",     meaning_reversed="接受、走出悲傷",           image=img("cups_05"),     arcana="minor", suit="cups", number=5),
    TarotCard(id="cups_06",     name_zh="聖杯六", name_en="Six of Cups",      meaning_upright="懷舊、童年回憶、天真、給予",       meaning_reversed="停留過去、不切實際",       image=img("cups_06"),     arcana="minor", suit="cups", number=6),
    TarotCard(id="cups_07",     name_zh="聖杯七", name_en="Seven of Cups",    meaning_upright="幻想、選擇、夢想、誘惑、迷惑",     meaning_reversed="清晰、做出選擇、面對現實", image=img("cups_07"),     arcana="minor", suit="cups", number=7),
    TarotCard(id="cups_08",     name_zh="聖杯八", name_en="Eight of Cups",    meaning_upright="放棄、尋求更多意義、離開、轉變",   meaning_reversed="猶豫放棄、停滯",           image=img("cups_08"),     arcana="minor", suit="cups", number=8),
    TarotCard(id="cups_09",     name_zh="聖杯九", name_en="Nine of Cups",     meaning_upright="心願成真、滿足、感恩、情感豐足",   meaning_reversed="自滿、物質主義",           image=img("cups_09"),     arcana="minor", suit="cups", number=9),
    TarotCard(id="cups_10",     name_zh="聖杯十", name_en="Ten of Cups",      meaning_upright="家庭幸福、和諧、圓滿、永恆之愛",   meaning_reversed="家庭失和、破碎夢想",       image=img("cups_10"),     arcana="minor", suit="cups", number=10),
    TarotCard(id="cups_page",   name_zh="聖杯侍者",name_en="Page of Cups",   meaning_upright="創意訊息、直覺、靈性、溫柔",       meaning_reversed="情感不成熟",               image=img("cups_page"),   arcana="minor", suit="cups", number=11),
    TarotCard(id="cups_knight", name_zh="聖杯騎士",name_en="Knight of Cups", meaning_upright="浪漫、魅力、追求夢想、直覺",       meaning_reversed="情緒化、不切實際",         image=img("cups_knight"), arcana="minor", suit="cups", number=12),
    TarotCard(id="cups_queen",  name_zh="聖杯王后",name_en="Queen of Cups",  meaning_upright="關懷、直覺、情感成熟、同理心",     meaning_reversed="情緒不穩、依賴",           image=img("cups_queen"),  arcana="minor", suit="cups", number=13),
    TarotCard(id="cups_king",   name_zh="聖杯國王",name_en="King of Cups",   meaning_upright="情感成熟、慈悲、外交手腕、平衡",   meaning_reversed="情感操縱、逃避",           image=img("cups_king"),   arcana="minor", suit="cups", number=14),
]

SWORDS: List[TarotCard] = [
    TarotCard(id="swords_ace",    name_zh="寶劍一", name_en="Ace of Swords",      meaning_upright="真相、清晰、突破、溝通、勝利",     meaning_reversed="混亂、殘酷的真相",         image=img("swords_ace"),    arcana="minor", suit="swords", number=1),
    TarotCard(id="swords_02",     name_zh="寶劍二", name_en="Two of Swords",      meaning_upright="僵局、難以抉擇、避免衝突",         meaning_reversed="優柔寡斷、資訊過載",       image=img("swords_02"),     arcana="minor", suit="swords", number=2),
    TarotCard(id="swords_03",     name_zh="寶劍三", name_en="Three of Swords",    meaning_upright="心碎、悲傷、失落、痛苦",           meaning_reversed="走出悲傷、寬恕、康復",     image=img("swords_03"),     arcana="minor", suit="swords", number=3),
    TarotCard(id="swords_04",     name_zh="寶劍四", name_en="Four of Swords",     meaning_upright="休息、恢復、靜心、冥想",           meaning_reversed="不安、無法休息",           image=img("swords_04"),     arcana="minor", suit="swords", number=4),
    TarotCard(id="swords_05",     name_zh="寶劍五", name_en="Five of Swords",     meaning_upright="衝突、失敗、不誠實、自私",         meaning_reversed="和解、走出衝突",           image=img("swords_05"),     arcana="minor", suit="swords", number=5),
    TarotCard(id="swords_06",     name_zh="寶劍六", name_en="Six of Swords",      meaning_upright="過渡、離開困境、旅行、前進",       meaning_reversed="無法離開、持續混亂",       image=img("swords_06"),     arcana="minor", suit="swords", number=6),
    TarotCard(id="swords_07",     name_zh="寶劍七", name_en="Seven of Swords",    meaning_upright="欺騙、狡猾、策略、秘密行動",       meaning_reversed="被揭穿、良知發現",         image=img("swords_07"),     arcana="minor", suit="swords", number=7),
    TarotCard(id="swords_08",     name_zh="寶劍八", name_en="Eight of Swords",    meaning_upright="束縛、限制、自我監禁、無助",       meaning_reversed="解脫、重獲自由",           image=img("swords_08"),     arcana="minor", suit="swords", number=8),
    TarotCard(id="swords_09",     name_zh="寶劍九", name_en="Nine of Swords",     meaning_upright="焦慮、惡夢、恐懼、擔憂",           meaning_reversed="希望、釋放焦慮",           image=img("swords_09"),     arcana="minor", suit="swords", number=9),
    TarotCard(id="swords_10",     name_zh="寶劍十", name_en="Ten of Swords",      meaning_upright="痛苦結局、背叛、失敗、觸底",       meaning_reversed="復甦、走出困境",           image=img("swords_10"),     arcana="minor", suit="swords", number=10),
    TarotCard(id="swords_page",   name_zh="寶劍侍者",name_en="Page of Swords",   meaning_upright="好奇、敏銳、溝通、警覺",           meaning_reversed="魯莽、口舌是非",           image=img("swords_page"),   arcana="minor", suit="swords", number=11),
    TarotCard(id="swords_knight", name_zh="寶劍騎士",name_en="Knight of Swords", meaning_upright="行動果斷、野心、直接、衝勁",       meaning_reversed="衝動、魯莽",               image=img("swords_knight"), arcana="minor", suit="swords", number=12),
    TarotCard(id="swords_queen",  name_zh="寶劍王后",name_en="Queen of Swords",  meaning_upright="清晰思維、獨立、直接、冷靜",       meaning_reversed="殘忍、冷酷、過度批判",     image=img("swords_queen"),  arcana="minor", suit="swords", number=13),
    TarotCard(id="swords_king",   name_zh="寶劍國王",name_en="King of Swords",   meaning_upright="智識、清晰、權威、倫理、分析",     meaning_reversed="獨裁、操縱、殘忍",         image=img("swords_king"),   arcana="minor", suit="swords", number=14),
]

PENTACLES: List[TarotCard] = [
    TarotCard(id="pentacles_ace",    name_zh="五角星一", name_en="Ace of Pentacles",      meaning_upright="新的財務機會、物質豐盛、潛力",   meaning_reversed="錯失機會、財務不穩",   image=img("pentacles_ace"),    arcana="minor", suit="pentacles", number=1),
    TarotCard(id="pentacles_02",     name_zh="五角星二", name_en="Two of Pentacles",      meaning_upright="平衡、適應、時間管理、靈活",     meaning_reversed="失衡、混亂、財務壓力", image=img("pentacles_02"),     arcana="minor", suit="pentacles", number=2),
    TarotCard(id="pentacles_03",     name_zh="五角星三", name_en="Three of Pentacles",    meaning_upright="團隊合作、學習、技能、計劃",     meaning_reversed="缺乏合作、懶散",       image=img("pentacles_03"),     arcana="minor", suit="pentacles", number=3),
    TarotCard(id="pentacles_04",     name_zh="五角星四", name_en="Four of Pentacles",     meaning_upright="保守、控制、財務安全、節儉",     meaning_reversed="吝嗇、囤積",           image=img("pentacles_04"),     arcana="minor", suit="pentacles", number=4),
    TarotCard(id="pentacles_05",     name_zh="五角星五", name_en="Five of Pentacles",     meaning_upright="財務困難、貧困、絕望、孤立",     meaning_reversed="財務好轉、精神支持",   image=img("pentacles_05"),     arcana="minor", suit="pentacles", number=5),
    TarotCard(id="pentacles_06",     name_zh="五角星六", name_en="Six of Pentacles",      meaning_upright="給予、接受、慷慨、分享、平衡",   meaning_reversed="自私、負債、不平等",   image=img("pentacles_06"),     arcana="minor", suit="pentacles", number=6),
    TarotCard(id="pentacles_07",     name_zh="五角星七", name_en="Seven of Pentacles",    meaning_upright="長期投資、耐心、評估、反思",     meaning_reversed="缺乏長期規劃、不耐煩", image=img("pentacles_07"),     arcana="minor", suit="pentacles", number=7),
    TarotCard(id="pentacles_08",     name_zh="五角星八", name_en="Eight of Pentacles",    meaning_upright="努力工作、技能提升、專注",       meaning_reversed="缺乏技能、懶惰",       image=img("pentacles_08"),     arcana="minor", suit="pentacles", number=8),
    TarotCard(id="pentacles_09",     name_zh="五角星九", name_en="Nine of Pentacles",     meaning_upright="物質豐盛、獨立、自給自足",       meaning_reversed="財務依賴、過度揮霍",   image=img("pentacles_09"),     arcana="minor", suit="pentacles", number=9),
    TarotCard(id="pentacles_10",     name_zh="五角星十", name_en="Ten of Pentacles",      meaning_upright="財富、家庭遺產、長期成功",       meaning_reversed="財務失敗、家庭問題",   image=img("pentacles_10"),     arcana="minor", suit="pentacles", number=10),
    TarotCard(id="pentacles_page",   name_zh="五角星侍者",name_en="Page of Pentacles",   meaning_upright="學習、雄心、可靠、機會",         meaning_reversed="缺乏計劃、懶散",       image=img("pentacles_page"),   arcana="minor", suit="pentacles", number=11),
    TarotCard(id="pentacles_knight", name_zh="五角星騎士",name_en="Knight of Pentacles", meaning_upright="努力、可靠、耐心、謹慎",         meaning_reversed="懶惰、固執",           image=img("pentacles_knight"), arcana="minor", suit="pentacles", number=12),
    TarotCard(id="pentacles_queen",  name_zh="五角星王后",name_en="Queen of Pentacles",  meaning_upright="務實、愛心、財務安全、養育",     meaning_reversed="自私、嫉妒",           image=img("pentacles_queen"),  arcana="minor", suit="pentacles", number=13),
    TarotCard(id="pentacles_king",   name_zh="五角星國王",name_en="King of Pentacles",   meaning_upright="財富、生意、領導力、成功",       meaning_reversed="貪婪、固執、物質主義", image=img("pentacles_king"),   arcana="minor", suit="pentacles", number=14),
]

ALL_CARDS: List[TarotCard] = MAJOR_ARCANA + WANDS + CUPS + SWORDS + PENTACLES
CARD_BY_ID: dict[str, TarotCard] = {card.id: card for card in ALL_CARDS}
