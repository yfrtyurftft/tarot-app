// ============================================================
// i18n/zh-TW.ts — 繁體中文字串
// 所有 UI 文字集中管理，key-based 多語言架構
// ============================================================

export const zhTW = {
  nav: {
    ai:     'AI 塔羅占卜',
    yesno:  '是否塔羅占卜',
    love:   '感情塔羅占卜',
    daily:  '今日運勢',
  },
  steps: {
    SELECT_SPREAD:   '選擇牌陣',
    SELECT_PERSONA:  '選擇占卜師',
    INPUT_QUESTION:  '輸入問題',
    CONFIRM_SPREAD:  '確認牌陣',
    DRAW:            '抽牌',
    RESULT:          '占卜結果',
    CHAT:            '繼續問答',
  },
  spread: {
    title:       '選擇牌陣',
    subtitle:    '請選擇適合你問題的占卜牌陣',
    cards:       '張牌',
    confirm:     '使用此牌陣',
  },
  persona: {
    title:       '選擇占卜師',
    subtitle:    '每位占卜師有獨特的解讀風格',
    select:      '選擇',
    style:       '風格',
    tone:        '語氣',
  },
  question: {
    title:         'AI 塔羅占卜',
    subtitle:      '讓 AI 分析你的問題，推薦最適合的牌陣',
    placeholder:   '請輸入你想占卜的問題，例如：我該轉職嗎？',
    submit:        '讓 AI 分析',
    loading:       'AI 正在分析你的問題...',
    yesnoTitle:    '是否塔羅占卜',
    yesnoSubtitle: '針對你的決策問題給出明確的是否指引',
    loveTitle:     '感情塔羅占卜',
    loveSubtitle:  '探索你的愛情狀態與感情走向',
    yesnoHint:     '請輸入一個決策問題，例如：我應該接受這份工作嗎？',
    loveHint:      '請輸入你的感情問題，例如：他對我有好感嗎？',
  },
  confirmSpread: {
    title:        'AI 為你推薦了這個牌陣',
    useThis:      '使用此牌陣',
    recommend:    '重新推薦',
    recommending: 'AI 正在重新分析...',
  },
  draw: {
    title:       '開始抽牌',
    subtitle:    '冥想你的問題，點擊牌背抽取你的塔羅牌',
    dailyHint:   '靜下心來，感受今日的能量，點擊牌背',
    remaining:   '還需抽取',
    done:        '張牌',
    interpreting:'AI 正在解讀你的牌陣...',
    allDrawn:    '所有牌已抽完',
    viewResult:  '查看解讀',
  },
  result: {
    title:       '占卜結果',
    yourCards:   '你抽到的牌',
    upright:     '正位',
    reversed:    '逆位',
    interpretation: 'AI 解讀',
    askMore:     '還有疑問？繼續問我',
    openChat:    '開啟聊天視窗',
    reset:       '重新占卜',
  },
  chat: {
    title:       '與占卜師繼續問答',
    placeholder: '輸入你的問題...',
    send:        '送出',
    loading:     '占卜師思考中...',
    you:         '你',
  },
  common: {
    back:        '返回',
    next:        '下一步',
    loading:     '載入中...',
    error:       '發生錯誤，請稍後再試',
    retry:       '重試',
  },
  personaTheme: {
    mystic_witch:    { emoji: '🌙', color: 'from-violet-900 to-indigo-900' },
    rational_analyst:{ emoji: '🔮', color: 'from-slate-800 to-blue-900'  },
    gentle_healer:   { emoji: '🌸', color: 'from-rose-900 to-pink-900'   },
  },
} as const

export type I18nKey = typeof zhTW
