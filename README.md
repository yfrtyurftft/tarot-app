# 🔮 塔羅 AI 占卜 Web App

結合 Google Gemini 2.5 Flash AI 的全功能塔羅占卜應用。

---

## 🌐 線上網址

| 服務 | 網址 |
|------|------|
| 前端（Vercel） | https://tarot-app-ten-dun.vercel.app |
| 後端（Railway） | https://tarot-appbackend-production.up.railway.app |

---

## 📁 專案結構

```
tarot-app/
├── README.md
├── compress_cards.py      ← 圖片壓縮工具（本機用，不推上 GitHub）
│
├── backend/               ← Python + FastAPI + Gemini AI
│   ├── models.py          資料型別定義
│   ├── tarot_data.py      78 張塔羅牌庫（圖片路徑 /cards/[id].jpg）
│   ├── spreads.py         13 種牌陣定義
│   ├── tarot_engine.py    抽牌引擎（Fisher-Yates）
│   ├── ai_handler.py      Gemini AI + 3位人設 + SSE 串流
│   ├── main.py            FastAPI 路由入口
│   ├── requirements.txt   Python 套件清單
│   ├── .env               🔑 API 金鑰（不可上傳！）
│   └── .env.example       金鑰範本
│
└── frontend/              ← Next.js 16 + TypeScript + Tailwind CSS
    ├── package.json
    ├── .env.local         🔑 後端 URL（不可上傳！）
    ├── .env.local.example 後端 URL 範本
    ├── public/
    │   └── cards/         🖼 78 張本機塔羅牌圖片（壓縮後 30-60KB）
    └── src/
        ├── app/
        │   ├── layout.tsx        根 Layout（含 Preloader）
        │   ├── globals.css       全域樣式 + 星空背景
        │   ├── page.tsx          AI 塔羅（首頁）
        │   ├── yesno/page.tsx    是否塔羅
        │   ├── love/page.tsx     感情塔羅
        │   └── daily/page.tsx    今日運勢
        ├── components/tarot/
        │   ├── Navbar.tsx        導航列
        │   ├── StepIndicator.tsx 步驟進度
        │   ├── PersonaSelector   占卜師選擇
        │   ├── SpreadSelector    牌陣選擇
        │   ├── QuestionInput     問題輸入
        │   ├── ConfirmSpread     確認 AI 推薦牌陣
        │   ├── CardDeck.tsx      抽牌互動（78 張水平展開）
        │   ├── CardSpread.tsx    牌陣佈局展示
        │   ├── ResultView.tsx    占卜結果
        │   ├── ChatWindow.tsx    聊天視窗（SSE 串流）
        │   └── Preloader.tsx     背景預載圖片 + 喚醒後端
        ├── store/
        │   └── useTarotStore.ts  Zustand 全域狀態管理
        ├── lib/
        │   └── api.ts            API 呼叫（含 SSE 串流）
        ├── types/
        │   └── tarot.ts          TypeScript 型別定義
        └── i18n/
            └── zh-TW.ts          繁體中文字串
```

---

## 🎴 功能說明

| 模式 | 流程 |
|------|------|
| AI 塔羅 | 輸入問題 → 選占卜師 → AI 推薦牌陣 → 抽牌 → 串流解讀 → 聊天 |
| 是否塔羅 | 選牌陣 → 選占卜師 → 輸入問題 → 抽牌 → 串流解讀 → 聊天 |
| 感情塔羅 | 選牌陣 → 選占卜師 → 輸入問題 → 抽牌 → 串流解讀 → 聊天 |
| 今日運勢 | 選占卜師 → 抽牌 → 串流解讀 → 聊天 |

### 🤖 AI 占卜師人設

| 人設 | 風格 |
|------|------|
| 神秘女巫 莉拉 | 神秘詩意、月亮星辰意象 |
| 理性分析師 卡爾 | 心理學視角、邏輯清晰 |
| 溫柔療癒師 蘿絲 | 情感支持、溫暖陪伴 |

### 🃏 支援的牌陣（13 種）

| 模式 | 牌陣 |
|------|------|
| AI 塔羅 | 單卡、三卡、五卡十字、七卡馬蹄、凱爾特十字（10張）、月運（12張） |
| 是否塔羅 | 是非單卡、是非三卡、二選一（6張） |
| 感情塔羅 | 感情五卡、感情七卡、阻礙與建議 |
| 今日運勢 | 今日單卡 |

---

## 🚀 本地開發

### 後端

```bash
cd backend
cp .env.example .env
# 編輯 .env，填入 GEMINI_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload
# 後端啟動於 http://localhost:8000
```

### 前端

```bash
cd frontend
cp .env.local.example .env.local
# 確認 NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
# 前端啟動於 http://localhost:3000
```

---

## 🖼 塔羅牌圖片設定

本專案使用爬蟲抓取的**本機圖片**（Rider-Waite 公有領域圖片），存放於 `frontend/public/cards/`。

### 圖片命名規則

程式使用 `/cards/[id].jpg` 格式，例如：

```
fool.jpg · magician.jpg · high_priestess.jpg
wands_ace.jpg · wands_02.jpg ... wands_king.jpg
cups_ace.jpg · swords_ace.jpg · pentacles_ace.jpg
```

### 圖片壓縮

```bash
# 壓縮圖片（200-400KB → 30-60KB，載入速度提升 5-8 倍）
pip install Pillow
python compress_cards.py
```

> ⚠️ `compress_cards.py` 只在本機執行，不需要推上 GitHub。

---

## ☁️ 雲端部署

### 後端 → Railway

1. 在 [Railway](https://railway.app) 建立新專案，選擇 GitHub repo 的 `backend` 資料夾
2. 新增環境變數：`GEMINI_API_KEY=你的金鑰`
3. Start Command：`uvicorn main:app --host 0.0.0.0 --port $PORT`
4. 部署後取得 URL（如 `https://tarot-backend.railway.app`）

### 前端 → Vercel

1. 在 [Vercel](https://vercel.com) 匯入 GitHub repo，Root Directory 設為 `frontend`
2. 新增環境變數：`NEXT_PUBLIC_API_URL=https://tarot-backend.railway.app`
3. Framework Preset：Next.js → 部署

### 防止冷啟動 → UptimeRobot

1. 在 [UptimeRobot](https://uptimerobot.com) 免費註冊
2. 新增 HTTP 監控：URL 填入 `https://your-backend.railway.app/health`
3. 監控間隔：每 5 分鐘
4. 效果：後端永遠保持喚醒，首次呼叫不需等待 30-60 秒

---

## 🔌 API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET  | /health | 健康檢查（UptimeRobot 使用） |
| POST | /api/draw | 抽牌（Fisher-Yates） |
| POST | /api/recommend-spread | AI 推薦牌陣（AI 塔羅模式） |
| POST | /api/interpret/stream | **SSE 串流** AI 解讀 |
| POST | /api/chat/stream | **SSE 串流** 聊天回覆 |
| GET  | /api/personas | 占卜師人設清單 |
| GET  | /api/spreads | 牌陣清單（可依 mode 篩選） |
| GET  | /api/cards | 完整 78 張牌庫 |

---

## ⚙️ 技術堆疊

| 層級 | 技術 |
|------|------|
| 前端框架 | Next.js 16 (App Router) + TypeScript |
| 樣式 | Tailwind CSS + 自訂 CSS 動畫 |
| 動畫 | Framer Motion |
| 狀態管理 | Zustand |
| 後端框架 | Python + FastAPI |
| AI 模型 | Google Gemini 2.5 Flash |
| AI 輸出 | SSE 串流（逐字顯示） |
| 圖片 | 本機 Rider-Waite 公有領域圖片 |
| 前端部署 | Vercel（自動 CI/CD） |
| 後端部署 | Railway（自動 CI/CD） |
| 監控 | UptimeRobot（防止冷啟動） |
