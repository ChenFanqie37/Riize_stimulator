import type {
  AppName,
  CalendarEvent,
  CallLog,
  ChatMessage,
  CompanyNotice,
  DelayedConsequence,
  DispatchTip,
  EvidenceFragment,
  GalleryPhoto,
  GameState,
  InstagramPost,
  NoteEntry,
  Notification,
  PlayerAction,
  Trace,
  WeversePost,
} from '../types/game'
import { calculatePostRisk, createClueFromPost, evaluateFandomCycle, evaluatePaparazziProgress } from './clueEngine'
import { generateFallbackSocialComments, toInstagramComments } from './socialAgents'

const dayMs = 24 * 60 * 60 * 1000

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

function balancedSecrecyDelta(current: number, value: number): number {
  if (value >= 0) return value
  const ratio = current < 35 ? 0.45 : 0.65
  return Math.max(-8, Math.ceil(value * ratio))
}

function rid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function currentRound(state: GameState): number {
  return (state.week - 1) * 7 + state.day
}

function appName(app: string): AppName {
  return app as AppName
}

export const playerActions: Record<string, PlayerAction> = {
  post_instagram_story: {
    id: 'post_instagram_story',
    label: '发 Instagram Story',
    description: '发一条只有他和你能看懂的限时动态。',
    riskPreview: '可能让他上头，也可能被粉丝截图拼时间线。',
    immediateEffect: { affection: 2, fanSuspicion: 2, publicHeat: 1, secrecy: -2 },
    visibleTrace: { app: 'instagram', type: 'player_story', canBeDeleted: true, canBeScreenshotted: true },
    npcReaction: ['boyfriend', 'fans', 'company', 'paparazzi'],
    delayedConsequences: [],
    eventChainTags: ['ring_incident', 'fan_digging'],
  },
  delete_suspicious_post: {
    id: 'delete_suspicious_post',
    label: '删除可疑动态',
    description: '删除一条风险最高的帖子或 Story。',
    riskPreview: '如果已经有人截图，删掉反而像心虚。',
    immediateEffect: { secrecy: 4 },
    visibleTrace: { app: 'instagram', type: 'deleted_instagram_story', canBeDeleted: false, canBeScreenshotted: true },
    npcReaction: ['fans', 'boyfriend', 'company'],
    delayedConsequences: [],
    eventChainTags: ['fan_digging'],
  },
  delete_post: {
    id: 'delete_post',
    label: '删除可疑动态',
    description: '删除一条风险最高的帖子或 Story。',
    riskPreview: '如果已经有人截图，删掉反而像心虚。',
    immediateEffect: { secrecy: 4 },
    visibleTrace: { app: 'instagram', type: 'deleted_instagram_story', canBeDeleted: false, canBeScreenshotted: true },
    npcReaction: ['fans', 'boyfriend', 'company'],
    delayedConsequences: [],
    eventChainTags: ['fan_digging'],
  },
  call_boyfriend: {
    id: 'call_boyfriend',
    label: '给他打电话',
    description: '拨出一通电话，留下通话记录和情绪余波。',
    riskPreview: '深夜通话会很甜，但可能被经纪人或行程状态捕捉。',
    immediateEffect: { mood: 1 },
    visibleTrace: { app: 'kakaoTalk', type: 'phone_call', canBeDeleted: false, canBeScreenshotted: false },
    npcReaction: ['boyfriend', 'manager'],
    delayedConsequences: [],
    eventChainTags: ['hotel_incident'],
  },
  request_meet: {
    id: 'request_meet',
    label: '约他见面',
    description: '发出见面邀约，进入高收益高风险约会窗口。',
    riskPreview: '约会是恋情曝光的主要来源：车牌、CCTV、路透、私生都可能出现。',
    immediateEffect: { affection: 2, secrecy: -2, paparazziAttention: 2 },
    visibleTrace: { app: 'kakaoTalk', type: 'meeting_request', canBeDeleted: true, canBeScreenshotted: true },
    npcReaction: ['boyfriend', 'company', 'paparazzi'],
    delayedConsequences: [],
    eventChainTags: ['hotel_incident', 'fan_digging'],
  },
  request_meeting: {
    id: 'request_meeting',
    label: '约他见面',
    description: '发出见面邀约，进入高收益高风险约会窗口。',
    riskPreview: '约会是恋情曝光的主要来源：车牌、CCTV、路透、私生都可能出现。',
    immediateEffect: { affection: 2, secrecy: -2, paparazziAttention: 2 },
    visibleTrace: { app: 'kakaoTalk', type: 'meeting_request', canBeDeleted: true, canBeScreenshotted: true },
    npcReaction: ['boyfriend', 'company', 'paparazzi'],
    delayedConsequences: [],
    eventChainTags: ['hotel_incident', 'fan_digging'],
  },
  refuse_meet: {
    id: 'refuse_meet',
    label: '拒绝见面',
    description: '拒绝一次见面，把关系从上头边缘拉回安全区。',
    riskPreview: '短期更安全，但不同人设会产生不同情绪债。',
    immediateEffect: { affection: -3, trust: 1, secrecy: 5, mood: -1 },
    visibleTrace: { app: 'kakaoTalk', type: 'meeting_refusal', canBeDeleted: true, canBeScreenshotted: false },
    npcReaction: ['boyfriend', 'bestie'],
    delayedConsequences: [],
    eventChainTags: [],
  },
  refuse_meeting: {
    id: 'refuse_meeting',
    label: '拒绝见面',
    description: '拒绝一次见面，把关系从上头边缘拉回安全区。',
    riskPreview: '短期更安全，但不同人设会产生不同情绪债。',
    immediateEffect: { affection: -3, trust: 1, secrecy: 5, mood: -1 },
    visibleTrace: { app: 'kakaoTalk', type: 'meeting_refusal', canBeDeleted: true, canBeScreenshotted: false },
    npcReaction: ['boyfriend', 'bestie'],
    delayedConsequences: [],
    eventChainTags: [],
  },
  search_self: {
    id: 'search_self',
    label: '搜索自己名字',
    description: '在 Naver 搜索自己、他、恋爱传闻和同款。',
    riskPreview: '你会更早发现线索，也会更容易焦虑和上头。',
    immediateEffect: { anxiety: 4, mood: -2 },
    visibleTrace: { app: 'naver', type: 'search_history', canBeDeleted: true, canBeScreenshotted: false },
    npcReaction: ['fans'],
    delayedConsequences: [],
    eventChainTags: ['fan_digging'],
  },
  alt_account_control: {
    id: 'alt_account_control',
    label: '开小号控评',
    description: '用小号下场引导 Weverse 评论风向。',
    riskPreview: '低热度时有效；热度高时，小号本身会变成证据。',
    immediateEffect: { fanSuspicion: -3, mood: -1, secrecy: -1 },
    visibleTrace: { app: 'weverse', type: 'alt_account_comment', canBeDeleted: true, canBeScreenshotted: true },
    npcReaction: ['fans', 'fan_leader'],
    delayedConsequences: [],
    eventChainTags: ['fan_digging'],
  },
  create_alt_account: {
    id: 'create_alt_account',
    label: '开小号控评',
    description: '用小号下场引导 Weverse 评论风向。',
    riskPreview: '低热度时有效；热度高时，小号本身会变成证据。',
    immediateEffect: { fanSuspicion: -3, mood: -1, secrecy: -1 },
    visibleTrace: { app: 'weverse', type: 'alt_account_comment', canBeDeleted: true, canBeScreenshotted: true },
    npcReaction: ['fans', 'fan_leader'],
    delayedConsequences: [],
    eventChainTags: ['fan_digging'],
  },
  request_calm: {
    id: 'request_calm',
    label: '要求冷静几天',
    description: '把 KakaoTalk 推入冷静期，换取短期安全。',
    riskPreview: '真心型会破冰，回避型可能顺势消失。',
    immediateEffect: { affection: -5, trust: 2, secrecy: 8, careerPressure: -4, mood: -4 },
    visibleTrace: { app: 'kakaoTalk', type: 'cooling_request', canBeDeleted: true, canBeScreenshotted: true },
    npcReaction: ['boyfriend', 'bestie'],
    delayedConsequences: [],
    eventChainTags: [],
  },
  request_cooling: {
    id: 'request_cooling',
    label: '要求冷静几天',
    description: '把 KakaoTalk 推入冷静期，换取短期安全。',
    riskPreview: '真心型会破冰，回避型可能顺势消失。',
    immediateEffect: { affection: -5, trust: 2, secrecy: 8, careerPressure: -4, mood: -4 },
    visibleTrace: { app: 'kakaoTalk', type: 'cooling_request', canBeDeleted: true, canBeScreenshotted: true },
    npcReaction: ['boyfriend', 'bestie'],
    delayedConsequences: [],
    eventChainTags: [],
  },
  demand_public: {
    id: 'demand_public',
    label: '让他公开',
    description: '把“我们到底要躲到什么时候”丢进聊天框。',
    riskPreview: '这是最大赌局，会写入男友记忆，后续聊天不会忘。',
    immediateEffect: { affection: -3, trust: -2, careerPressure: 12, secrecy: -15, companyAlert: 8 },
    visibleTrace: { app: 'kakaoTalk', type: 'public_demand', canBeDeleted: true, canBeScreenshotted: true },
    npcReaction: ['boyfriend', 'company', 'fans'],
    delayedConsequences: [],
    eventChainTags: ['fan_digging', 'ring_incident'],
  },
  use_identity_ability: {
    id: 'use_identity_ability',
    label: '使用身份特殊能力',
    description: '根据身份使用一次特殊能力，并留下对应手机痕迹。',
    riskPreview: '身份越靠近韩娱系统，收益越高，代价也越具体。',
    immediateEffect: { actionPoints: -1 },
    visibleTrace: { app: 'notes', type: 'identity_ability', canBeDeleted: false, canBeScreenshotted: false },
    npcReaction: ['bestie', 'company', 'fans'],
    delayedConsequences: [],
    eventChainTags: [],
  },
  evening_shift: {
    id: 'evening_shift',
    label: '接便利店晚班',
    description: '去便利店或咖啡店接一段晚班，把线下预算先补回来。',
    riskPreview: '稳定赚钱，但疲惫会影响状态。',
    immediateEffect: { money: 16, lifeStability: 5, mood: -4, stress: 7 },
    visibleTrace: { app: 'calendar', type: 'part_time_shift', canBeDeleted: false, canBeScreenshotted: false },
    npcReaction: ['bestie', 'boyfriend'],
    delayedConsequences: [],
    eventChainTags: ['money_recovery'],
  },
  translation_gig: {
    id: 'translation_gig',
    label: '接翻译急单',
    description: '接一个采访字幕、品牌资料或海外粉丝沟通急单。',
    riskPreview: '来钱快，但熬夜和行业接触会增加疲惫。',
    immediateEffect: { money: 22, lifeStability: 3, sleep: -8, stress: 8 },
    visibleTrace: { app: 'notes', type: 'translation_gig', canBeDeleted: false, canBeScreenshotted: false },
    npcReaction: ['bestie', 'company'],
    delayedConsequences: [],
    eventChainTags: ['money_recovery', 'work_trace'],
  },
  resell_goods: {
    id: 'resell_goods',
    label: '整理周边回血',
    description: '整理重复专辑、小卡或周边，换一点现金。',
    riskPreview: '交易记录和同担聊天可能被注意到。',
    immediateEffect: { money: 12, fanSuspicion: 2, mood: -2 },
    visibleTrace: { app: 'weverse', type: 'goods_resell', canBeDeleted: true, canBeScreenshotted: true },
    npcReaction: ['fans', 'bestie'],
    delayedConsequences: [],
    eventChainTags: ['money_recovery', 'fan_digging'],
  },
}

function applyStatChanges(state: GameState, changes: Record<string, number>): GameState {
  let s = { ...state }
  const updateRisk = (key: keyof GameState['risk'], value: number) => {
    const delta = key === 'secrecy' ? balancedSecrecyDelta(s.risk.secrecy, value) : value
    s = { ...s, risk: { ...s.risk, [key]: clamp((s.risk[key] as number) + delta) } }
  }
  const updatePlayer = (key: keyof GameState['player'], value: number, max = 100) => {
    const current = s.player[key]
    if (typeof current === 'number') {
      s = { ...s, player: { ...s.player, [key]: Math.max(0, Math.min(max, current + value)) } }
    }
  }
  const updateLead = (key: keyof GameState['maleLead'], value: number) => {
    const current = s.maleLead[key]
    if (typeof current === 'number') {
      s = { ...s, maleLead: { ...s.maleLead, [key]: clamp(current + value) } }
    }
  }
  const updateHealth = (key: keyof GameState['health'], value: number) => {
    s = { ...s, health: { ...s.health, [key]: clamp(s.health[key] + value) } }
  }
  const updateHiddenRisk = (key: keyof GameState['hiddenRisk'], value: number) => {
    s = { ...s, hiddenRisk: { ...s.hiddenRisk, [key]: clamp(s.hiddenRisk[key] + value) } }
  }

  for (const [key, value] of Object.entries(changes)) {
    if (!value) continue
    if (key === 'affection') updateLead('affection', value)
    else if (key === 'trust') updateLead('trust', value)
    else if (key === 'careerPressure') updateLead('careerPressure', value)
    else if (key === 'mood') updatePlayer('mood', value)
    else if (key === 'money') updatePlayer('money', value, Number.POSITIVE_INFINITY)
    else if (key === 'popularity') updatePlayer('popularity', value)
    else if (key === 'lifeStability') updatePlayer('lifeStability', value)
    else if (key === 'actionPoints') updatePlayer('actionPoints', value, 10)
    else if (key === 'secrecy') updateRisk('secrecy', value)
    else if (key === 'companyAlert') updateRisk('companyAlert', value)
    else if (key === 'publicHeat') updateRisk('publicHeat', value)
    else if (key === 'fanSuspicion') updateRisk('fanSuspicion', value)
    else if (key === 'paparazziAttention') updateRisk('paparazziAttention', value)
    else if (key === 'evidenceCount') s = { ...s, risk: { ...s.risk, evidenceCount: Math.max(0, s.risk.evidenceCount + value) } }
    else if (key === 'stress' || key === 'anxiety') updateHealth('stress', value)
    else if (key === 'mentalHealth') updateHealth('mentalHealth', value)
    else if (key === 'sleep') updateHealth('sleep', value)
    else if (key === 'paparazziHeat') updateHiddenRisk('paparazziHeat', value)
    else if (key === 'lovestagramScore') updateHiddenRisk('lovestagramScore', value)
    else if (key === 'coupleItemScore') updateHiddenRisk('coupleItemScore', value)
    else if (key === 'timelineOverlap') updateHiddenRisk('timelineOverlap', value)
    else if (key === 'possessiveness') updateHiddenRisk('possessiveness', value)
    else if (key === 'rumorCredibility') updateHiddenRisk('rumorCredibility', value)
    else if (key === 'insiderLeakRisk') updateHiddenRisk('insiderLeakRisk', value)
  }
  return s
}

function appendNotification(state: GameState, app: AppName, title: string, content: string, urgency: Notification['urgency'] = 'medium'): GameState {
  const notification: Notification = {
    id: rid('notif'),
    app,
    title,
    content,
    urgency,
    isRead: false,
    createdAt: Date.now(),
  }
  return { ...state, notifications: [...state.notifications, notification] }
}

function appendTrace(state: GameState, trace: Trace): GameState {
  return { ...state, traces: [...state.traces, trace] }
}

function appendHistory(state: GameState, event: string, choice: string, consequences: Record<string, number>, memoryTags: string[]): GameState {
  return {
    ...state,
    history: [
      ...state.history,
      {
        id: rid('hist'),
        week: state.week,
        day: state.day,
        event,
        choice,
        consequences,
        memoryTags,
        createdAt: Date.now(),
      },
    ],
  }
}

function appendMessage(state: GameState, message: ChatMessage, threadId = 'thread_boyfriend'): GameState {
  return {
    ...state,
    kakaoTalk: {
      ...state.kakaoTalk,
      threads: state.kakaoTalk.threads.map((thread) =>
        thread.id === threadId
          ? { ...thread, messages: [...thread.messages, message], unreadCount: thread.unreadCount + (message.sender === 'player' ? 0 : 1), lastActive: '刚刚' }
          : thread
      ),
    },
  }
}

function boyfriendMessage(state: GameState, ko: string, zh: string, emotion: ChatMessage['emotion'] = 'sweet', category: ChatMessage['category'] = 'sweet'): GameState {
  return appendMessage(state, {
    id: rid('msg'),
    sender: 'boyfriend',
    senderName: state.maleLead.name,
    textKo: ko,
    textZh: zh,
    timestamp: Date.now(),
    isRead: false,
    isRecalled: false,
    emotion,
    category,
  })
}

function playerMessage(state: GameState, ko: string, zh: string): GameState {
  return appendMessage(state, {
    id: rid('msg_player'),
    sender: 'player',
    senderName: state.player.name || '我',
    textKo: ko,
    textZh: zh,
    timestamp: Date.now(),
    isRead: true,
    isRecalled: false,
    emotion: 'neutral',
  })
}

function recalledMessage(state: GameState, ko: string, zh: string): GameState {
  const dangerousMsg: ChatMessage = {
    id: rid('msg_recalled'),
    sender: 'boyfriend',
    senderName: state.maleLead.name,
    textKo: ko,
    textZh: zh,
    timestamp: Date.now(),
    isRead: false,
    isRecalled: true,
    emotion: 'anxious',
    category: 'warning',
  }
  return appendMessage(state, dangerousMsg)
}

function appendWeverse(state: GameState, post: Omit<WeversePost, 'id' | 'createdAt'>): GameState {
  return {
    ...state,
    weverse: {
      ...state.weverse,
      posts: [...state.weverse.posts, { ...post, id: rid('wv'), createdAt: Date.now() }],
    },
  }
}

function buildCommentList(state: GameState, platform: 'instagram' | 'weverse' | 'naver', content: string, title?: string, riskScore = 0) {
  return toInstagramComments(generateFallbackSocialComments({
    platform,
    title,
    content,
    riskScore,
    heat: state.risk.publicHeat,
    fanSuspicion: state.risk.fanSuspicion,
    publicHeat: state.risk.publicHeat,
    stageName: state.maleLead.stageName,
  }))
}

function appendInstagramPost(state: GameState, post: Omit<InstagramPost, 'id' | 'createdAt'>): GameState {
  return {
    ...state,
    instagram: {
      ...state.instagram,
      posts: [...state.instagram.posts, { ...post, id: rid('ig'), createdAt: Date.now() }],
    },
  }
}

function appendNaver(state: GameState, news: Omit<GameState['naver']['news'][number], 'id' | 'createdAt'>): GameState {
  return {
    ...state,
    naver: {
      ...state.naver,
      news: [...state.naver.news, { ...news, id: rid('nv'), createdAt: Date.now() }],
    },
  }
}

function appendCompanyNotice(state: GameState, notice: Omit<CompanyNotice, 'id' | 'createdAt' | 'isRead'>): GameState {
  return {
    ...state,
    companyNotice: {
      ...state.companyNotice,
      notices: [...state.companyNotice.notices, { ...notice, id: rid('cn'), isRead: false, createdAt: Date.now() }],
    },
  }
}

function appendDispatch(state: GameState, tip: Omit<DispatchTip, 'id' | 'createdAt'>): GameState {
  return {
    ...state,
    dispatch: {
      ...state.dispatch,
      tips: [...state.dispatch.tips, { ...tip, id: rid('dp'), createdAt: Date.now() }],
    },
  }
}

function appendPhoto(state: GameState, photo: Omit<GalleryPhoto, 'id' | 'createdAt'>): GameState {
  return {
    ...state,
    gallery: {
      ...state.gallery,
      photos: [...state.gallery.photos, { ...photo, id: rid('photo'), createdAt: Date.now() }],
    },
  }
}

function appendCalendar(state: GameState, event: Omit<CalendarEvent, 'id'>): GameState {
  return {
    ...state,
    calendar: {
      ...state.calendar,
      events: [...state.calendar.events, { ...event, id: rid('cal') }],
    },
  }
}

function appendNote(state: GameState, note: Omit<NoteEntry, 'id' | 'createdAt'>): GameState {
  return {
    ...state,
    notes: {
      ...state.notes,
      entries: [...state.notes.entries, { ...note, id: rid('note'), createdAt: Date.now() }],
    },
  }
}

function addEvidence(state: GameState, evidence: Omit<EvidenceFragment, 'id' | 'createdAt'>): GameState {
  return {
    ...state,
    evidenceFragments: [...state.evidenceFragments, { ...evidence, id: rid('ev'), createdAt: Date.now() }],
    risk: { ...state.risk, evidenceCount: state.risk.evidenceCount + 1 },
  }
}

function schedule(state: GameState, delayDays: number, type: string, eventId: string, content: string, statChanges: Record<string, number>): GameState {
  const consequence: DelayedConsequence = {
    id: rid('dc'),
    triggerRound: currentRound(state) + delayDays,
    type,
    eventId,
    content,
    statChanges,
    isTriggered: false,
  }
  return { ...state, delayedConsequences: [...state.delayedConsequences, consequence] }
}

function refreshStages(state: GameState): GameState {
  const fandomStage = evaluateFandomCycle(state.hiddenRisk, state.risk.evidenceCount)
  const paparazziStage = evaluatePaparazziProgress(state.hiddenRisk)
  return { ...state, fandomStage, paparazziStage }
}

function updateMemory(state: GameState, memory: string, extra?: Partial<GameState['maleLead']['memory']>): GameState {
  return {
    ...state,
    maleLead: {
      ...state.maleLead,
      memory: {
        ...state.maleLead.memory,
        ...extra,
        keyMemories: [...state.maleLead.memory.keyMemories.slice(-18), memory],
      },
    },
  }
}

function buildTrace(action: PlayerAction, state: GameState, description?: string): Trace {
  return {
    id: rid('trace'),
    type: action.visibleTrace.type,
    description: description || action.description,
    round: currentRound(state),
    appId: action.visibleTrace.app,
    screenshotBeforeDelete: action.visibleTrace.canBeScreenshotted && Math.random() < Math.min(0.65, 0.18 + state.risk.fanSuspicion / 180),
    createdAt: Date.now(),
  }
}

function activateEventChains(state: GameState, tags: string[]): GameState {
  if (!tags.length) return state
  return {
    ...state,
    eventChains: state.eventChains.map((chain) => {
      if (!tags.includes(chain.id) || chain.isActive || chain.isCompleted) return chain
      const shouldActivate = state.risk.fanSuspicion > 25 || state.risk.evidenceCount > 1 || Math.random() < 0.35
      return shouldActivate ? { ...chain, isActive: true } : chain
    }),
  }
}

function performPostInstagramStory(action: PlayerAction, state: GameState, payload: any): { state: GameState; feedback: string } {
  const template = payload?.template || 'ambiguous'
  const caption =
    payload?.caption ||
    (template === 'smokescreen'
      ? '오늘은 친구랑. 아무 일도 없었어\n今天和朋友在一起。什么都没有发生。'
      : template === 'emotional'
        ? '사람들이 모르는 밤도 있어\n也有别人不知道的夜晚。'
        : '오늘은 비밀로 해줘\n今天替我保密。')
  const visibility = payload?.visibility || (template === 'provocative' ? 'public' : 'close_friends')
  const imageTags =
    template === 'smokescreen' ? ['cafe', 'food'] :
    template === 'normal' ? ['selfie', 'cafe'] :
    template === 'emotional' ? ['night', 'mood'] :
    ['night', 'couple', 'mood']
  const { riskScore, hiddenRiskChanges } = calculatePostRisk(caption, imageTags, visibility, state.hiddenRisk)
  const suspiciousView = state.risk.fanSuspicion > 35 || riskScore > 35
  const screenshottedBy = suspiciousView && Math.random() < 0.45 ? ['unknown_042', 'starlight_hd'] : []
  const post: InstagramPost = {
    id: rid('ig_story'),
    author: 'player',
    authorName: state.player.name || 'me',
    contentType: 'story',
    text: caption,
    imageTags,
    location: imageTags.includes('night') ? '서울 밤거리' : undefined,
    visibility,
    riskScore,
    likes: 0,
    comments: [],
    views: Math.floor(28 + state.player.popularity * 1.4 + riskScore * 1.8),
    isDeleted: false,
    isScreenshotted: screenshottedBy.length > 0,
    screenshottedBy,
    boyfriendViewed: true,
    createdAt: Date.now(),
    expiresAt: Date.now() + dayMs,
  }
  let s: GameState = {
    ...state,
    instagram: { ...state.instagram, stories: [...state.instagram.stories, post] },
  }
  s = applyStatChanges(s, {
    ...action.immediateEffect,
    publicHeat: riskScore > 40 ? 4 : 1,
    fanSuspicion: Math.ceil(riskScore / 16),
    secrecy: -Math.ceil(riskScore / 25),
    ...hiddenRiskChanges,
  })
  const clues = createClueFromPost(caption, imageTags, 'instagram', state.day, state.week, visibility)
  s = {
    ...s,
    clueLedger: [
      ...s.clueLedger,
      ...clues.map((clue) => ({
        ...clue,
        id: rid('clue'),
        createdAt: Date.now(),
        discovered: false,
        linkedClueIds: [],
      } as GameState['clueLedger'][number])),
    ],
  }
  const trace = buildTrace(action, s, `第${s.week}周第${s.day}天发出 Story：「${caption.split('\n')[1] || caption.split('\n')[0]}」`)
  s = appendTrace(s, trace)
  s = addEvidence(s, {
    title: '限时动态截图风险',
    source: 'Instagram Story',
    riskLevel: Math.max(1, Math.ceil(riskScore / 20)),
    description: screenshottedBy.length > 0
      ? '未知账号在你删除前保存了这条 Story 截图。'
      : '这条 Story 的文案、时间和背景可能在未来被重新拼起来。',
    discoveredByFans: false,
    canDelete: false,
    relatedEventChainId: 'fan_digging',
  })
  s = boyfriendMessage(
    s,
    riskScore > 40 ? '봤어. 너 일부러 그런 거지?' : '스토리 봤어. 우리만 아는 거지?',
    riskScore > 40 ? '我看到了。你是故意的吧？' : '我看到 Story 了。是只有我们知道的意思吧？',
    riskScore > 40 ? 'jealous' : 'sweet',
  )
  if (riskScore >= 30 || s.risk.fanSuspicion >= 30) {
    s = appendWeverse(s, {
      type: riskScore > 45 ? 'analysis' : 'sugar',
      author: riskScore > 45 ? 'timeline_unnie' : 'briize_moon',
      title: riskScore > 45 ? '이 시간대 너무 겹치지 않아?' : '그냥 감성 스토리겠지?',
      content: riskScore > 45
        ? `刚才那个 Story 时间点太巧了。${s.maleLead.stageName}今晚行程结束后也在附近，别说我过度解读，我只是把时间线放在这里。`
        : `有人也看到那条月亮 Story 吗？可能只是氛围照啦，但最近这种暗号感真的有点多。`,
      heat: clamp(25 + riskScore + s.risk.fanSuspicion),
      comments: Math.floor(20 + riskScore * 1.8),
      isPlayerAlt: false,
      relatedEvidenceIds: [],
    })
  }
  if (s.risk.companyAlert > 50 || riskScore > 55) {
    s = appendCompanyNotice(s, {
      level: s.risk.companyAlert > 75 ? 'warning' : 'gentle',
      title: 'SNS 게시물 관리 요청',
      content: '请注意个人社交平台内容。删除不代表影响已经消除，回归期任何暧昧文案都会被放大。',
    })
  }
  if (s.hiddenRisk.paparazziHeat > 45 || riskScore > 60) {
    s = appendDispatch(s, {
      type: 'clue',
      content: '匿名投稿：某成员相关时间线中出现一条可疑 Story，文案与深夜路线高度吻合，已纳入证据板。',
      heatLevel: clamp(25 + s.hiddenRisk.paparazziHeat),
    })
  }
  s = schedule(s, 2, 'weverse_analysis', 'story_screenshot', '你以为快拍会消失，但有人在 Weverse 贴出了截图。', { fanSuspicion: 6, publicHeat: 3 })
  s = schedule(s, 3, 'fan_timeline', 'story_timeline', '粉丝开始把 Story 时间和他的行程空白拼成时间线。', { fanSuspicion: 8, publicHeat: 4 })
  s = schedule(s, 5, 'company_warning', 'story_company', '公司开始要求减少所有暧昧社媒行为。', { companyAlert: 8, careerPressure: 4 })
  s = appendNotification(s, 'instagram', 'Story 已发布', '他已查看，一个陌生账号也点进来看过。', suspiciousView ? 'high' : 'medium')
  s = activateEventChains(s, action.eventChainTags)
  s = refreshStages(s)
  const feedback = `你发出了这条 Story。${post.boyfriendViewed ? '他很快看过了' : '他还没看'}；${screenshottedBy.length ? '一个陌生账号保存了截图。' : '暂时没有明显搬运。'}这条动态会消失，但痕迹已经写进世界。`
  return { state: s, feedback }
}

function performDeleteSuspicious(action: PlayerAction, state: GameState): { state: GameState; feedback: string } {
  const candidates = [...state.instagram.stories, ...state.instagram.posts]
    .filter((post) => !post.isDeleted && post.author === 'player')
    .sort((a, b) => b.riskScore - a.riskScore)
  if (candidates.length === 0) {
    const fallback = appendNotification(state, 'instagram', '没有可删除内容', '你翻了一遍主页，暂时没有能处理的可疑动态。', 'low')
    return { state: fallback, feedback: '没有找到可疑动态。' }
  }
  const target = candidates[0]
  const wasScreenshotted = target.isScreenshotted || target.screenshottedBy.length > 0 || state.risk.fanSuspicion > 45
  let s: GameState = {
    ...state,
    instagram: {
      ...state.instagram,
      posts: state.instagram.posts.map((post) => post.id === target.id ? { ...post, isDeleted: true, isScreenshotted: post.isScreenshotted || wasScreenshotted } : post),
      stories: state.instagram.stories.map((story) => story.id === target.id ? { ...story, isDeleted: true, isScreenshotted: story.isScreenshotted || wasScreenshotted } : story),
    },
  }
  s = applyStatChanges(s, wasScreenshotted ? { fanSuspicion: 7, publicHeat: 4, secrecy: 2 } : { fanSuspicion: -4, publicHeat: -2, secrecy: 6 })
  s = appendTrace(s, { ...buildTrace(action, s, `删除了 ${target.contentType === 'story' ? 'Story' : '帖子'}：「${target.text.split('\n')[1] || target.text.split('\n')[0]}」`), screenshotBeforeDelete: wasScreenshotted })
  s = updateMemory(s, `你删过一条可疑动态：${target.text.slice(0, 24)}`, { playerDeletedPhotoForHim: true })
  s = boyfriendMessage(
    s,
    wasScreenshotted ? '이미 캡처됐으면... 삭제해도 끝난 건 아니야.' : '잘했어. 무서워서가 아니라, 우리 지키려고 그런 거잖아.',
    wasScreenshotted ? '如果已经被截图了……删掉也不代表结束。' : '做得好。不是因为害怕，是为了保护我们，对吧。',
    wasScreenshotted ? 'anxious' : 'guilty',
    'warning',
  )
  if (wasScreenshotted) {
    s = appendWeverse(s, {
      type: 'analysis',
      author: 'screenshot_keeper',
      title: '방금 삭제한 거 봤어?',
      content: '刚刚是不是删了？我没来得及看全，但有人截图了吗？删了反而更像有事。',
      heat: clamp(45 + state.risk.fanSuspicion),
      comments: 120 + state.risk.fanSuspicion,
      isPlayerAlt: false,
      relatedEvidenceIds: [],
    })
    s = addEvidence(s, {
      title: '删帖前截图',
      source: 'Instagram',
      riskLevel: 4,
      description: '粉丝保存了你删除前的 Story，并开始讨论“删了就是心虚”。',
      discoveredByFans: true,
      canDelete: false,
      relatedEventChainId: 'fan_digging',
    })
  }
  s = appendNotification(s, 'instagram', '动态已删除', wasScreenshotted ? '删除成功，但有人可能已经截图。' : '删除成功，短期热度有所下降。', wasScreenshotted ? 'high' : 'medium')
  s = refreshStages(s)
  return { state: s, feedback: wasScreenshotted ? '你删掉了动态，但粉丝开始问“她刚刚是不是删了？”。' : '你删掉了动态，暂时没有明显截图流出。' }
}

function performCallBoyfriend(action: PlayerAction, state: GameState): { state: GameState; feedback: string } {
  const persona = state.maleLead.hiddenPersona
  const riskPenalty = state.risk.companyAlert > 70 || state.maleLead.careerPressure > 70 ? 25 : 0
  const personaBonus =
    persona === 'true_love' ? 24 :
    persona === 'secret_trauma' && state.timeOfDay === 'night' ? 18 :
    persona === 'avoidant' ? -18 :
    persona === 'career_freak' ? -10 :
    persona === 'playboy' ? 5 :
    0
  const answerScore = state.maleLead.affection * 0.45 + state.maleLead.trust * 0.25 + personaBonus - riskPenalty
  const status: CallLog['status'] = answerScore > 52 ? 'answered' : answerScore > 36 ? 'missed' : 'rejected'
  const duration = status === 'answered'
    ? state.timeOfDay === 'night' ? '27:18' : '06:42'
    : '0:00'
  const tone = status === 'answered' ? (state.timeOfDay === 'night' ? 'vulnerable' : 'sweet') : status === 'missed' ? 'silent' : 'cold'
  const callLog: CallLog = {
    id: rid('call'),
    with: state.maleLead.name,
    time: `${state.week}-${state.day} ${state.timeOfDay}`,
    duration,
    status,
    emotionalTone: tone,
  }
  let s: GameState = {
    ...state,
    kakaoTalk: { ...state.kakaoTalk, callLogs: [callLog, ...state.kakaoTalk.callLogs] },
  }
  if (status === 'answered') {
    s = applyStatChanges(s, { affection: 4, trust: 3, mood: 3, sleep: state.timeOfDay === 'night' ? -6 : 0, paparazziAttention: state.timeOfDay === 'night' ? 3 : 0 })
    s = boyfriendMessage(
      s,
      state.timeOfDay === 'night' ? '목소리 들으니까 좀 살 것 같아. 끊지 마.' : '전화해줘서 고마워. 잠깐이라도 좋다.',
      state.timeOfDay === 'night' ? '听到你的声音好像又活过来了。别挂。' : '谢谢你打来。哪怕只有一会儿也很好。',
      state.timeOfDay === 'night' ? 'vulnerable' : 'sweet',
      'call_record',
    )
    if (duration !== '06:42') {
      s = schedule(s, 1, 'weverse_analysis', 'late_call_tired', '第二天粉丝发现他直播时明显睡眠不足。', { fanSuspicion: 4, careerPressure: 3 })
    }
  } else if (status === 'missed') {
    s = applyStatChanges(s, { mood: -4, stress: 4, trust: -1 })
    s = appendMessage(s, {
      id: rid('msg_call_missed'),
      sender: 'boyfriend',
      senderName: state.maleLead.name,
      textKo: '',
      textZh: '未接来电',
      timestamp: Date.now(),
      isRead: false,
      isRecalled: false,
      emotion: 'avoidant',
      category: 'call_record',
    })
  } else {
    s = applyStatChanges(s, { affection: -3, trust: -4, mood: -5, stress: 6 })
    s = boyfriendMessage(s, '지금은 안 돼.', '现在不行。', 'cold', 'warning')
  }
  s = appendTrace(s, buildTrace(action, s, `给他打电话：${status === 'answered' ? `接通 ${duration}` : status === 'missed' ? '未接' : '拒接'}`))
  if (state.risk.companyAlert > 65 && status === 'answered') {
    s = appendCompanyNotice(s, {
      level: 'warning',
      title: '개인 통화 기록 확인 요청',
      content: '直播和公开行程前后请减少私人通话。经纪人会核对成员手机使用记录。',
    })
    s = applyStatChanges(s, { companyAlert: 4 })
  }
  s = appendNotification(s, 'kakaoTalk', '通话记录已生成', status === 'answered' ? `你们通话 ${duration}，这会留在记录里。` : status === 'missed' ? '他没有接。已读不回感开始发酵。' : '他拒接了电话。', status === 'answered' ? 'medium' : 'high')
  return { state: refreshStages(s), feedback: status === 'answered' ? `电话接通了，通话 ${duration}。` : status === 'missed' ? '电话没接通，KakaoTalk 留下了未接记录。' : '他拒接了，你们之间的空气冷了一截。' }
}

function performRequestMeet(action: PlayerAction, state: GameState): { state: GameState; feedback: string } {
  let s = applyStatChanges(state, action.immediateEffect)
  s = playerMessage(s, '오늘 잠깐 볼 수 있어?', '今天能见一会儿吗？')
  const highRisk = s.risk.companyAlert > 70 || s.risk.fanSuspicion > 65 || s.maleLead.careerPressure > 80
  if (highRisk) {
    s = recalledMessage(s, '보고 싶어. 근데 오늘은 너무 위험해.', '想见你。但今天太危险了。')
    s = boyfriendMessage(s, '일단 장소만 보내지 마. 내가 생각해볼게.', '先别发地点。我想一下。', 'anxious', 'warning')
  } else {
    s = boyfriendMessage(s, '잠깐이면 가능해. 사람 없는 데로 와.', '短暂见一下面可以。去没有人的地方。', 'sweet')
  }
  s = appendCalendar(s, {
    title: highRisk ? '待定：秘密见面窗口' : '秘密见面窗口',
    date: `W${s.week}-D${s.day}`,
    time: s.timeOfDay === 'night' ? '23:40' : '18:30',
    type: 'shared',
    isHighRisk: true,
    isCompleted: false,
  })
  s = updateMemory(s, `你主动约他见面，当前风险${highRisk ? '偏高' : '可控'}。`, { promisedToMeet: true })
  s = schedule(s, 2, 'dispatch_tip', 'meeting_window', '狗仔注意到他的行程空白和你的社交活跃时间重合。', { paparazziAttention: 5, paparazziHeat: 5 })
  s = appendTrace(s, buildTrace(action, s, '你在 KakaoTalk 里约他见面。'))
  s = appendNotification(s, 'calendar', '见面窗口已加入日程', '接下来选择约会地点时，甜度越高，痕迹越重。', 'high')
  return { state: refreshStages(s), feedback: highRisk ? '你发出了邀约，但他先撤回了一句危险的话。约会窗口已出现。' : '他答应短暂见面。约会窗口已加入日程。' }
}

function performRefuseMeet(action: PlayerAction, state: GameState): { state: GameState; feedback: string } {
  let s = applyStatChanges(state, action.immediateEffect)
  s = playerMessage(s, '오늘은 못 볼 것 같아. 위험해.', '今天可能不能见。太危险了。')
  const persona = state.maleLead.hiddenPersona
  const reply = persona === 'true_love'
    ? ['알겠어. 서운하지만 네가 무서운 게 더 싫어.', '知道了。会失落，但我更不想你害怕。']
    : persona === 'avoidant'
      ? ['응. 알겠어.', '嗯，知道了。']
      : persona === 'narcissist'
        ? ['네가 먼저 보자고 해놓고.', '明明是你先说想见的。']
        : ['조심하는 게 맞지. 그래도 보고 싶다.', '小心是对的。可是还是想见你。']
  s = boyfriendMessage(s, reply[0], reply[1], persona === 'avoidant' ? 'avoidant' : 'guilty')
  s = appendTrace(s, buildTrace(action, s, '你拒绝了一次见面。'))
  s = updateMemory(s, '你曾经因为太危险拒绝见面。', { emotionalDebt: state.maleLead.memory.emotionalDebt + (persona === 'avoidant' ? 1 : 3) })
  return { state: refreshStages(s), feedback: '你拒绝了见面，风险下降，但聊天框明显冷了一点。' }
}

function performSearchSelf(action: PlayerAction, state: GameState): { state: GameState; feedback: string } {
  const queries = [
    state.player.name || '疑似女友',
    `${state.maleLead.stageName} 연애`,
    `${state.maleLead.stageName} 여친`,
    `${state.maleLead.stageName} 커플템`,
  ]
  let s: GameState = {
    ...state,
    naver: {
      ...state.naver,
      searchHistory: [...state.naver.searchHistory, ...queries].slice(-18),
    },
  }
  s = applyStatChanges(s, action.immediateEffect)
  const closeToTruth = s.risk.fanSuspicion > 50 || s.risk.evidenceCount > 2
  if (closeToTruth) {
    s = appendNaver(s, {
      title: `${s.maleLead.stageName} 열애설 관련 검색량 증가`,
      summary: `相关搜索词正在上升。论坛正在讨论${s.maleLead.name}近期是否有固定见面对象，但目前还没有决定性证据。`,
      source: '검색 트렌드',
      heat: clamp(30 + s.risk.fanSuspicion),
      relatedSearchWords: [s.maleLead.stageName, '열애설', '커플템', '타임라인'],
    })
    s = schedule(s, 1, 'fan_timeline', 'search_self_aftershock', '你搜索过的词条开始反向提示粉丝正在接近真相。', { fanSuspicion: 5, mood: -3 })
  }
  s = appendTrace(s, buildTrace(action, s, `Naver 搜索：${queries.join(' / ')}`))
  s = {
    ...s,
    player: {
      ...s.player,
      mentalTags: Array.from(new Set([...s.player.mentalTags, closeToTruth ? 'suspicious' : 'insecure'])).slice(-4) as GameState['player']['mentalTags'],
    },
  }
  s = appendNotification(s, 'naver', '搜索完成', closeToTruth ? '你看到了几条很接近真相的搜索结果。' : '暂时没有直接指向你的结果。', closeToTruth ? 'high' : 'medium')
  return { state: refreshStages(s), feedback: closeToTruth ? '你搜到了接近真相的帖子，心理标签新增“怀疑”。' : '暂时没有搜到实锤，但你开始不安。' }
}

function performAltControl(action: PlayerAction, state: GameState): { state: GameState; feedback: string } {
  const isFanLikeIdentity = ['fan', 'staff', 'stylist'].includes(state.player.identity)
  const successChance = (isFanLikeIdentity ? 0.68 : 0.48) - state.risk.fanSuspicion / 220
  const success = Math.random() < successChance
  let s = appendWeverse(state, {
    type: success ? 'control' : 'analysis',
    author: success ? 'briize_clean_09' : 'new_account_514',
    title: success ? '루머 확산 그만하자' : '이 계정 매번 나타나는 거 이상하지 않아?',
    content: success
      ? '别给黑子递刀。只是同款和时间点，大家专注回归好吗？他最近状态已经很累了。'
      : '这个洗地小号怎么每次都刚好出现？注册时间也很新，发言全在替那个时间线说话。',
    heat: success ? clamp(25 + state.risk.fanSuspicion * 0.4) : clamp(45 + state.risk.fanSuspicion),
    comments: success ? 88 : 260,
    isPlayerAlt: true,
    relatedEvidenceIds: [],
  })
  s = applyStatChanges(s, success ? { fanSuspicion: -6, publicHeat: -4, mood: -2, secrecy: -1 } : { fanSuspicion: 10, publicHeat: 6, mood: -5, secrecy: -4 })
  s = appendTrace(s, { ...buildTrace(action, s, '你用小号在 Weverse 下场控评。'), screenshotBeforeDelete: !success })
  if (!success) {
    s = addEvidence(s, {
      title: '小号发言记录',
      source: 'Weverse',
      riskLevel: 3,
      description: '粉丝开始怀疑这个小号每次都出现在同一类帖子下。',
      discoveredByFans: true,
      canDelete: true,
      relatedEventChainId: 'fan_digging',
    })
    s = schedule(s, 2, 'weverse_analysis', 'alt_account_thread', '有人整理了你的小号发言记录。', { fanSuspicion: 8, publicHeat: 4 })
  }
  s = appendNotification(s, 'weverse', success ? '控评暂时有效' : '小号被反扒', success ? '热度短暂下降，但你消耗了很多精力。' : '有人开始整理这个小号的发言轨迹。', success ? 'medium' : 'high')
  return { state: refreshStages(s), feedback: success ? '小号控评短期成功，热帖热度下降。' : '控评失败，小号本身成了新的线索。' }
}

function performRequestCalm(action: PlayerAction, state: GameState): { state: GameState; feedback: string } {
  let s = applyStatChanges(state, action.immediateEffect)
  s = { ...s, relationshipStatus: 'cooling_off' }
  s = playerMessage(s, '며칠만 좀 조용히 지내자.', '我们冷静几天吧。')
  s = updateMemory(s, '你要求冷静几天。', {
    playerColdWarCount: state.maleLead.memory.playerColdWarCount + 1,
    unresolvedIssues: Array.from(new Set([...state.maleLead.memory.unresolvedIssues, 'cooling_off'])),
  })
  const persona = state.maleLead.hiddenPersona
  if (persona === 'avoidant') {
    s = boyfriendMessage(s, '그래. 네가 원하면.', '好。既然你想这样。', 'avoidant', 'warning')
    s = schedule(s, 3, 'boyfriend_followup', 'avoidant_silence', '他顺势消失了几天，只在凌晨看过你的 Story。', { affection: -4, trust: -3, mood: -4 })
  } else {
    s = recalledMessage(s, '가지 마.', '别走。')
    s = schedule(s, 2, 'boyfriend_followup', 'cooling_break_ice', '冷静期第二天，他发来一条又撤回的消息。', { affection: 2, trust: -1 })
  }
  s = appendTrace(s, buildTrace(action, s, 'KakaoTalk 进入冷静期。'))
  s = appendNotification(s, 'kakaoTalk', '冷静期开始', '他消息频率会下降，已读不回概率上升。', 'high')
  return { state: refreshStages(s), feedback: '你要求冷静几天，KakaoTalk 进入冷静期。' }
}

function performDemandPublic(action: PlayerAction, state: GameState): { state: GameState; feedback: string } {
  let s = applyStatChanges(state, action.immediateEffect)
  const askedTimes = state.maleLead.memory.playerAskedForPublic + 1
  s = playerMessage(s, '우리 언제까지 이렇게 숨어야 해?', '我们到底要躲到什么时候？')
  const persona = state.maleLead.hiddenPersona
  const reply = askedTimes > 1
    ? ['또 그 얘기야... 나도 피하는 거 아니야.', '又是这个话题啊……我也不是在逃。']
    : persona === 'true_love'
      ? ['공개하고 싶지. 근데 네가 다칠까 봐 무서워.', '当然想公开。可是我怕你受伤。']
      : persona === 'career_freak'
        ? ['지금은 절대 안 돼. 이건 내 꿈만의 문제가 아니야.', '现在绝对不行。这不只是我的梦想的问题。']
        : persona === 'avoidant'
          ? ['...', '……']
          : persona === 'narcissist'
            ? ['공개하면 네가 감당할 수 있어?', '公开之后你承担得起吗？']
            : ['나도 모르겠어. 근데 오늘은 답 못 해.', '我也不知道。但今天我给不了答案。']
  s = boyfriendMessage(s, reply[0], reply[1], persona === 'avoidant' ? 'avoidant' : 'anxious', 'warning')
  s = updateMemory(s, `你第${askedTimes}次要求公开关系。`, {
    playerAskedForPublic: askedTimes,
    unresolvedIssues: Array.from(new Set([...state.maleLead.memory.unresolvedIssues, 'public_relationship'])),
    emotionalDebt: state.maleLead.memory.emotionalDebt + 6,
  })
  s = appendTrace(s, buildTrace(action, s, '你要求他公开关系。'))
  if (state.risk.companyAlert > 55 || askedTimes > 1) {
    s = appendCompanyNotice(s, {
      level: 'summon',
      title: '개인 이슈 면담 요청',
      content: '近期成员情绪与社交行为异常。请相关人员准备说明，必要时暂停私人联系。',
    })
  }
  s = schedule(s, 2, 'company_warning', 'public_pressure', '公开话题让公司开始收紧他的私人手机使用。', { companyAlert: 8, careerPressure: 6, mood: -3 })
  s = appendNotification(s, 'kakaoTalk', '公开压力已记录', askedTimes > 1 ? '他记得你不是第一次提这个。' : '这是关系的关键转折。', 'high')
  return { state: refreshStages(s), feedback: askedTimes > 1 ? '你又一次提公开，他没有装作第一次听见。' : '你提出公开关系，男友记忆已记录这个压力点。' }
}

function performIdentityAbility(action: PlayerAction, state: GameState): { state: GameState; feedback: string } {
  let s = applyStatChanges(state, action.immediateEffect)
  const identity = state.player.identity
  const weekDay = `W${state.week}-D${state.day}`
  let feedback = '你使用了身份特殊能力。'

  if (identity === 'fan') {
    s = appendWeverse(s, {
      type: 'control',
      author: 'old_briize_archive',
      title: '오늘 팬덤 분위기 정리',
      content: '今天粉圈风向：分析党还没拿到实锤，控评派正在压热度。危险词是“时间线”和“同款”。',
      heat: 35,
      comments: 96,
      isPlayerAlt: true,
      relatedEvidenceIds: [],
    })
    s = applyStatChanges(s, { fanSuspicion: -4, insiderLeakRisk: 4 })
    feedback = '粉丝直觉发动：你提前读到了粉圈危险词，但小号活动也变多了。'
  } else if (identity === 'intern' || identity === 'staff') {
    s = appendCalendar(s, { title: '内部行程：非公开通道调整', date: weekDay, time: '18:00', type: 'boyfriend', isHighRisk: true, isCompleted: false })
    s = appendCompanyNotice(s, { level: 'gentle', title: '출입 동선 변경 안내', content: '今日后台动线临时调整。非相关人员请勿进入艺人待机区。' })
    s = applyStatChanges(s, { companyAlert: 4, trust: 2 })
    feedback = '你拿到了内部动线，约会窗口更清楚，但公司也更容易注意到通行记录。'
  } else if (identity === 'stylist') {
    s = appendPhoto(s, {
      title: '造型记录：袖口暗号',
      description: '你把他袖口的别针换成了只有你们知道的位置。物料里看不明显，但粉丝可能会放大。',
      riskLevel: 'medium',
      source: 'backstage',
      isHidden: false,
      isDeleted: false,
      isDiscoveredByFans: false,
      relatedEventChainId: 'ring_incident',
    })
    s = applyStatChanges(s, { affection: 5, coupleItemScore: 4, companyAlert: 3 })
    feedback = '指尖密码发动：他懂了你的暗号，但造型细节也可能变成同款线索。'
  } else if (identity === 'translator') {
    s = appendNote(s, {
      title: '语言暗号',
      content: '你在翻译稿里留下一个只有他听得懂的词，他在采访中停顿了半秒。',
      type: 'plan',
    })
    s = applyStatChanges(s, { affection: 4, trust: 3, lovestagramScore: 3 })
    feedback = '语言密码发动：公开场合里，你们完成了一次只有彼此懂的对视。'
  } else if (identity === 'parttime') {
    s = appendPhoto(s, {
      title: '隐藏菜单收据',
      description: '你给他准备了只属于他的隐藏菜单。收据时间很危险，但甜得让人想保存。',
      riskLevel: 'medium',
      source: 'date',
      isHidden: false,
      isDeleted: false,
      isDiscoveredByFans: false,
      relatedEventChainId: 'fan_digging',
    })
    s = applyStatChanges(s, { affection: 6, fanSuspicion: 3, money: 3 })
    feedback = '专属服务发动：他记住了那杯饮料，收据也留在了相册里。'
  } else {
    s = appendNote(s, {
      title: '自我保护计划',
      content: '你给今天的自己写下三条规则：不发定位，不连发消息，不让恋爱吞掉生活。',
      type: 'plan',
    })
    s = applyStatChanges(s, { lifeStability: 5, mentalHealth: 4, mood: 2 })
    feedback = '你把自己从上头边缘拉回来了一点。'
  }
  s = appendTrace(s, buildTrace(action, s, feedback))
  s = appendNotification(s, 'notes', '身份能力留下了痕迹', feedback, 'medium')
  return { state: refreshStages(s), feedback }
}

function performMoneyAction(action: PlayerAction, state: GameState): { state: GameState; feedback: string } {
  let s = applyStatChanges(state, action.immediateEffect)
  const weekDay = `W${state.week}-D${state.day}`
  let feedback = action.label

  if (action.id === 'evening_shift') {
    s = appendCalendar(s, {
      title: '便利店晚班',
      date: weekDay,
      time: '22:00',
      type: 'player',
      isHighRisk: false,
      isCompleted: true,
    })
    s = boyfriendMessage(s, '', '别站太久。下班给我发一句，我看得到就回。', 'sweet', 'sweet')
    feedback = '你接了便利店晚班，钱补回一点。下班时他发来一句很短的提醒。'
  } else if (action.id === 'translation_gig') {
    s = appendNote(s, {
      title: '翻译急单',
      content: '采访字幕和品牌资料挤在同一个窗口里。你熬夜做完，发现其中一段采访刚好和他的海外行程有关。',
      type: 'plan',
    })
    s = appendNotification(s, 'notes', '急单完成', '钱到账了，但睡眠被偷走一大块。', 'low')
    feedback = '你接了翻译急单，钱来得快，也更靠近他的行业半径。'
  } else if (action.id === 'resell_goods') {
    s = appendWeverse(s, {
      type: 'control',
      author: state.appAccounts.weverse.displayName,
      title: '出几张重复小卡',
      content: '只走同城面交，不议价。你尽量把账号痕迹藏得很干净。',
      heat: 18,
      comments: 12,
      isPlayerAlt: true,
      relatedEvidenceIds: [],
    })
    s = appendNotification(s, 'weverse', '周边回血中', '同担聊天记录也算一种痕迹，别聊太多私事。', 'low')
    feedback = '你整理周边回血，钱不多，但足够撑过下一次短线下。'
  }

  s = appendTrace(s, buildTrace(action, s, feedback))
  return { state: refreshStages(s), feedback }
}

function performCrisisStrategy(actionId: string, state: GameState, payload?: any): { state: GameState; feedback: string } {
  const strategy = actionId.replace('crisis_', '')
  let s = state
  let feedback = '危机策略已执行。'

  if (strategy === 'play_dead') {
    s = applyStatChanges(s, { publicHeat: -10, fanSuspicion: -4, affection: -6, trust: -4, mood: -5 })
    s = { ...s, relationshipStatus: 'cooling_off' }
    feedback = '你选择装死，热度短暂下降，但他会感到被推开。'
  } else if (strategy === 'delete_evidence') {
    return performDeleteSuspicious(playerActions.delete_suspicious_post, state)
  } else if (strategy === 'boyfriend_explain') {
    s = applyStatChanges(s, { publicHeat: -8, fanSuspicion: -6, companyAlert: 12, careerPressure: 10 })
    s = boyfriendMessage(s, '내가 어떻게든 정리해볼게. 대신 너는 지금 아무 말도 하지 마.', '我会想办法处理。但你现在不要说任何话。', 'protective' as any, 'warning')
    s = appendInstagramPost(s, {
      author: 'boyfriend',
      authorName: s.maleLead.stageName,
      contentType: 'post',
      text: '오늘도 무대 준비 중. 이상한 얘기보다 좋은 모습으로 답할게요.\n今天也在准备舞台。比起奇怪的话，我会用更好的样子回应。',
      imageTags: ['studio', 'stage'],
      visibility: 'public',
      riskScore: 18,
      likes: 12000 + s.player.popularity * 80,
      comments: buildCommentList(s, 'instagram', '今天也在准备舞台。比起奇怪的话，我会用更好的样子回应。', undefined, 18),
      views: 80000 + s.risk.publicHeat * 1200,
      isDeleted: false,
      isScreenshotted: false,
      screenshottedBy: [],
      boyfriendViewed: false,
    })
    s = appendWeverse(s, {
      type: 'control',
      author: 'official_mood_zip',
      title: '방금 올린 글은 답변일까?',
      content: `${s.maleLead.stageName}发了“用舞台回应”的帖子。粉丝一边说专注回归，一边讨论这是不是在否认恋爱传闻。`,
      heat: clamp(45 + s.risk.publicHeat),
      comments: 210,
      commentList: buildCommentList(s, 'weverse', '艺人发了用舞台回应的帖子，评论区讨论这是澄清还是控评。', '방금 올린 글은 답변일까?', 18),
      isPlayerAlt: false,
      relatedEvidenceIds: [],
    })
    feedback = '你让他解释，他接过了压力，公司警觉随之上升。'
  } else if (strategy === 'smoke_bomb') {
    s = applyStatChanges(s, { fanSuspicion: -7, publicHeat: -4, rumorCredibility: 8, trust: -3 })
    s = appendWeverse(s, {
      type: 'conspiracy',
      author: 'confused_thread',
      title: '타임라인 안 맞는데?',
      content: '新图时间线好像对不上。也可能不是恋爱，是公司拿来挡别的新闻？越看越怪。',
      heat: 44,
      comments: 188,
      isPlayerAlt: false,
      relatedEvidenceIds: [],
    })
    feedback = '烟雾弹成功搅乱时间线，但如果被识破会反噬。'
  } else if (strategy === 'buy_paparazzi') {
    s = applyStatChanges(s, { money: -25, paparazziAttention: -16, paparazziHeat: -18, publicHeat: -5, companyAlert: 6, insiderLeakRisk: 12, stress: 8 })
    s = appendDispatch(s, {
      type: 'dm_threat',
      content: '爆料号私信回复：今晚的模糊图可以暂缓，但下一次如果拍到正脸，价格会翻倍。',
      heatLevel: clamp(28 + s.hiddenRisk.paparazziHeat),
    })
    s = appendNote(s, {
      title: 'D社封口记录',
      content: '你花钱压下了一组停车场模糊图。它暂时救了你们，也让对方知道你会付钱。',
      type: 'crisis',
    })
    s = schedule(s, 3, 'dispatch_blackmail', 'paid_paparazzi', '曾经被压下的狗仔线又回来了，对方开始索要更清晰的“封口费”。', { paparazziAttention: 10, paparazziHeat: 14, money: -10, stress: 8 })
    feedback = '你买通了狗仔，图暂时没发，但这条线以后会变成勒索风险。'
  } else if (strategy === 'buy_hotsearch') {
    const decoys = [
      { artist: '某人气男演员', clue: '深夜同车', words: ['男演员', '深夜同车', '否认恋情'] },
      { artist: '某女团主唱', clue: '同款戒指', words: ['女团主唱', '同款戒指', '绯闻'] },
      { artist: '新剧CP', clue: '片场互动过密', words: ['新剧CP', '片场互动', '热搜'] },
      { artist: 'solo歌手', clue: '生日派对目击', words: ['solo歌手', '生日派对', '目击'] },
    ]
    const decoy = decoys[currentRound(s) % decoys.length]
    s = applyStatChanges(s, { money: -18, publicHeat: -10, fanSuspicion: -6, rumorCredibility: 6, mood: 2, stress: 4 })
    const generatedDecoy = payload?.decoy
    const naverTitle = generatedDecoy?.title || `${decoy.artist} ${decoy.clue} 의혹 확산`
    const naverSummary = generatedDecoy?.summary || `娱乐社区突然出现${decoy.artist}相关热帖，关键词从${s.maleLead.stageName}的时间线转向“${decoy.clue}”。不少路人开始去围观别人的瓜。`
    const weverseTitle = generatedDecoy?.weverseTitle || '갑자기 다른 열애설이 뜬 거 이상하지 않아?'
    const weverseContent = generatedDecoy?.weverseContent || `突然有别人的绯闻冲上热搜，${s.maleLead.stageName}相关词掉下去了。有人说是巧合，也有人怀疑这是买热搜挡枪。`
    const relatedSearchWords = generatedDecoy?.relatedSearchWords?.length ? generatedDecoy.relatedSearchWords : decoy.words
    s = appendNaver(s, {
      title: naverTitle,
      summary: naverSummary,
      source: '실시간 이슈',
      heat: 88,
      relatedSearchWords,
      commentList: buildCommentList(s, 'naver', naverSummary, naverTitle, 12),
    })
    s = appendWeverse(s, {
      type: 'conspiracy',
      author: 'trend_watcher',
      title: weverseTitle,
      content: weverseContent,
      heat: 67,
      comments: 340,
      commentList: buildCommentList(s, 'weverse', weverseContent, weverseTitle, 20),
      isPlayerAlt: false,
      relatedEvidenceIds: [],
    })
    feedback = '你买了别人的热搜，注意力被带走，但“买榜挡枪”的阴谋论也开始出现。'
  } else if (strategy === 'teammate_fanservice') {
    s = applyStatChanges(s, { publicHeat: -9, fanSuspicion: -7, careerPressure: 6, trust: 2, companyAlert: 3, popularity: 2 })
    s = appendInstagramPost(s, {
      author: 'teammate',
      authorName: `${s.maleLead.stageName} x 팀메이트`,
      contentType: 'reel',
      text: '연습 끝. 오늘도 같이 버텼다.\n练习结束。今天也一起撑过来了。',
      imageTags: ['studio', 'backstage', 'team'],
      visibility: 'public',
      riskScore: 10,
      likes: 18000 + s.risk.publicHeat * 300,
      comments: buildCommentList(s, 'instagram', '练习结束。今天也一起撑过来了。队友互动片段被粉丝剪成CP向。', '队友营业挡枪', 10),
      views: 120000 + s.risk.publicHeat * 1500,
      isDeleted: false,
      isScreenshotted: false,
      screenshottedBy: [],
      boyfriendViewed: false,
    })
    s = appendWeverse(s, {
      type: 'sugar',
      author: 'teamchemistry_zip',
      title: '오늘 유닛 케미 미쳤다',
      content: `队友互动片段开始扩散，评论区转去嗑舞台chemistry。恋爱词被短暂压下，但队友粉内部也有人不满“别拿成员挡枪”。`,
      heat: 74,
      comments: 410,
      commentList: buildCommentList(s, 'weverse', '队友互动片段开始扩散，粉丝转去嗑舞台chemistry，也有人不满拿成员挡枪。', '오늘 유닛 케미 미쳤다', 8),
      isPlayerAlt: false,
      relatedEvidenceIds: [],
    })
    s = boyfriendMessage(s, '오늘은 멤버랑 좀 붙어 있을게. 네 얘기 덮으려고 그런 거 알지.', '今天我会和队友多互动一点。你知道我是为了把你的事盖过去。', 'guilty', 'warning')
    feedback = '他用队友营业挡枪，恋爱词短暂降温，但队友粉和公司都会看见这一步。'
  } else if (strategy === 'control_narrative') {
    return performAltControl(playerActions.alt_account_control, state)
  } else if (strategy === 'confront') {
    s = applyStatChanges(s, { publicHeat: 25, companyAlert: 18, secrecy: -25, mood: 8, fanSuspicion: 10 })
    s = appendNaver(s, {
      title: '온라인 커뮤니티 정면 반박글 등장',
      summary: '疑似当事人正面回应网络传闻，相关讨论急速升温。部分网友支持其反击侵犯隐私行为，粉圈则进一步分裂。',
      source: '커뮤니티 이슈',
      heat: 82,
      relatedSearchWords: [s.maleLead.stageName, '정면반박', '열애설'],
    })
    feedback = '你选择正面硬刚，爽感很强，世界也立刻盯上了你。'
  } else if (strategy === 'ask_manager') {
    s = applyStatChanges(s, { companyAlert: 16, careerPressure: -8, trust: 4, secrecy: 4 })
    s = appendCompanyNotice(s, { level: 'summon', title: '면담 일정 확정', content: '下午三点，公司附近咖啡厅。请不要让艺人本人先介入。' })
    feedback = '你求助经纪人，公司愿意压热度，也从此掌握更多把柄。'
  } else if (strategy === 'preserve_evidence') {
    s = applyStatChanges(s, { publicHeat: 4, fanSuspicion: 4, mentalHealth: -2 })
    s = appendPhoto(s, {
      title: '危机截图备份',
      description: '你保存了热帖、评论和公司通知。它们暂时帮不了你，但未来可能改变黑化/反制结局。',
      riskLevel: 'high',
      source: 'screenshot',
      isHidden: true,
      isDeleted: false,
      isDiscoveredByFans: false,
    })
    feedback = '你保存了证据，没有解决当前危机，但给未来留了一张牌。'
  }
  s = appendTrace(s, {
    id: rid('trace'),
    type: actionId,
    description: feedback,
    round: currentRound(s),
    appId: 'kakaoTalk',
    screenshotBeforeDelete: false,
    createdAt: Date.now(),
  })
  s = appendHistory(s, '危机处理', feedback, {}, [actionId])
  s = appendNotification(s, 'kakaoTalk', '危机策略执行完毕', feedback, 'high')
  return { state: refreshStages(s), feedback }
}

export function performPlayerAction(
  actionId: string,
  payload: any,
  state: GameState
): { state: GameState; trace: Trace; feedback: string } {
  if (actionId.startsWith('crisis_')) {
    const result = performCrisisStrategy(actionId, state, payload)
    const trace = result.state.traces[result.state.traces.length - 1] || {
      id: rid('trace'),
      type: actionId,
      description: result.feedback,
      round: currentRound(result.state),
      appId: 'kakaoTalk',
      screenshotBeforeDelete: false,
      createdAt: Date.now(),
    }
    return { ...result, trace }
  }

  const action = playerActions[actionId]
  if (!action) {
    const trace: Trace = {
      id: rid('trace_error'),
      type: 'error',
      description: `未知操作: ${actionId}`,
      round: currentRound(state),
      appId: 'kakaoTalk',
      screenshotBeforeDelete: false,
      createdAt: Date.now(),
    }
    return { state: appendTrace(state, trace), trace, feedback: `无效操作：${actionId}` }
  }

  let result: { state: GameState; feedback: string }
  if (actionId === 'post_instagram_story') result = performPostInstagramStory(action, state, payload)
  else if (actionId === 'delete_suspicious_post' || actionId === 'delete_post') result = performDeleteSuspicious(action, state)
  else if (actionId === 'call_boyfriend') result = performCallBoyfriend(action, state)
  else if (actionId === 'request_meet' || actionId === 'request_meeting') result = performRequestMeet(action, state)
  else if (actionId === 'refuse_meet' || actionId === 'refuse_meeting') result = performRefuseMeet(action, state)
  else if (actionId === 'search_self') result = performSearchSelf(action, state)
  else if (actionId === 'alt_account_control' || actionId === 'create_alt_account') result = performAltControl(action, state)
  else if (actionId === 'request_calm' || actionId === 'request_cooling') result = performRequestCalm(action, state)
  else if (actionId === 'demand_public') result = performDemandPublic(action, state)
  else if (actionId === 'use_identity_ability') result = performIdentityAbility(action, state)
  else if (actionId === 'evening_shift' || actionId === 'translation_gig' || actionId === 'resell_goods') result = performMoneyAction(action, state)
  else {
    let updatedState = applyStatChanges(state, action.immediateEffect)
    const trace = buildTrace(action, updatedState)
    updatedState = appendTrace(updatedState, trace)
    result = { state: updatedState, feedback: action.label }
  }

  const spentActionPoint = actionId === 'use_identity_ability' ? 0 : -1
  let finalState = applyStatChanges(result.state, { actionPoints: spentActionPoint })
  finalState = activateEventChains(finalState, action.eventChainTags)
  finalState = appendHistory(finalState, action.label, payload?.choiceText || action.label, action.immediateEffect, [actionId, ...action.eventChainTags])
  finalState = refreshStages(finalState)
  const trace = finalState.traces[finalState.traces.length - 1] || buildTrace(action, finalState)
  return { state: finalState, trace, feedback: result.feedback }
}
