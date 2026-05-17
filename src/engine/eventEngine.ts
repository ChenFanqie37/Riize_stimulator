import type {
  GameState,
  DelayedConsequence,
  Trace,
  EventChain,
  EvidenceFragment,
  FanTimelineEntry,
  InstagramPost,
  CrisisLevel
} from '../types/game'

export function processDelayedConsequences(state: GameState): { state: GameState; triggered: DelayedConsequence[] } {
  const triggered: DelayedConsequence[] = []
  const updatedConsequences = state.delayedConsequences.map(dc => {
    if (dc.isTriggered) return dc
    if (state.week >= dc.triggerRound) {
      triggered.push({ ...dc, isTriggered: true })
      return { ...dc, isTriggered: true }
    }
    return dc
  })
  let updatedState = { ...state, delayedConsequences: updatedConsequences }
  for (const dc of triggered) {
    const changes = dc.statChanges
    if (changes.affection !== undefined) {
      updatedState = {
        ...updatedState,
        maleLead: {
          ...updatedState.maleLead,
          affection: Math.max(0, Math.min(100, updatedState.maleLead.affection + changes.affection))
        }
      }
    }
    if (changes.trust !== undefined) {
      updatedState = {
        ...updatedState,
        maleLead: {
          ...updatedState.maleLead,
          trust: Math.max(0, Math.min(100, updatedState.maleLead.trust + changes.trust))
        }
      }
    }
    if (changes.mood !== undefined) {
      updatedState = {
        ...updatedState,
        player: {
          ...updatedState.player,
          mood: Math.max(0, Math.min(100, updatedState.player.mood + changes.mood))
        }
      }
    }
    if (changes.secrecy !== undefined) {
      updatedState = {
        ...updatedState,
        risk: {
          ...updatedState.risk,
          secrecy: Math.max(0, Math.min(100, updatedState.risk.secrecy + changes.secrecy))
        }
      }
    }
    if (changes.companyAlert !== undefined) {
      updatedState = {
        ...updatedState,
        risk: {
          ...updatedState.risk,
          companyAlert: Math.max(0, Math.min(100, updatedState.risk.companyAlert + changes.companyAlert))
        }
      }
    }
    if (changes.fanSuspicion !== undefined) {
      updatedState = {
        ...updatedState,
        risk: {
          ...updatedState.risk,
          fanSuspicion: Math.max(0, Math.min(100, updatedState.risk.fanSuspicion + changes.fanSuspicion))
        }
      }
    }
    if (changes.publicHeat !== undefined) {
      updatedState = {
        ...updatedState,
        risk: {
          ...updatedState.risk,
          publicHeat: Math.max(0, Math.min(100, updatedState.risk.publicHeat + changes.publicHeat))
        }
      }
    }
    if (changes.careerPressure !== undefined) {
      updatedState = {
        ...updatedState,
        maleLead: {
          ...updatedState.maleLead,
          careerPressure: Math.max(0, Math.min(100, updatedState.maleLead.careerPressure + changes.careerPressure))
        }
      }
    }
  }
  return { state: updatedState, triggered }
}

export function propagateToApps(state: GameState, trace: Trace): GameState {
  let updatedState = { ...state }
  updatedState = {
    ...updatedState,
    traces: [...updatedState.traces, trace]
  }
  if (trace.appId === 'instagram') {
    const weversePost = {
      id: `wv_prop_${Date.now()}`,
      type: 'analysis' as const,
      author: '匿名粉丝',
      title: `关于${updatedState.maleLead.stageName}最新动态的分析`,
      content: `有粉丝注意到${updatedState.maleLead.stageName}的Instagram有新动态，正在分析中...`,
      heat: Math.floor(updatedState.risk.fanSuspicion * 0.5),
      comments: Math.floor(Math.random() * 50) + 10,
      isPlayerAlt: false,
      relatedEvidenceIds: [],
      createdAt: Date.now()
    }
    updatedState = {
      ...updatedState,
      weverse: {
        ...updatedState.weverse,
        posts: [...updatedState.weverse.posts, weversePost]
      }
    }
    if (updatedState.risk.fanSuspicion >= 40) {
      const naverNews = {
        id: `nv_prop_${Date.now()}`,
        title: `${updatedState.maleLead.stageName}社交动态引发粉丝热议`,
        summary: `${updatedState.maleLead.stageName}的Instagram动态引发粉丝广泛讨论，相关话题在社交平台持续发酵。`,
        source: '娱乐新闻',
        heat: Math.floor(updatedState.risk.publicHeat * 0.6),
        relatedSearchWords: [updatedState.maleLead.stageName, 'Instagram', '恋爱传闻'],
        createdAt: Date.now()
      }
      updatedState = {
        ...updatedState,
        naver: {
          ...updatedState.naver,
          news: [...updatedState.naver.news, naverNews]
        }
      }
    }
    if (updatedState.risk.publicHeat >= 50) {
      const companyNotice = {
        id: `cn_prop_${Date.now()}`,
        level: 'warning' as const,
        title: '社交媒体管理提醒',
        content: '请所有艺人注意社交媒体使用规范，避免发布可能引发误解的内容。',
        isRead: false,
        createdAt: Date.now()
      }
      updatedState = {
        ...updatedState,
        companyNotice: {
          ...updatedState.companyNotice,
          notices: [...updatedState.companyNotice.notices, companyNotice]
        },
        risk: {
          ...updatedState.risk,
          companyAlert: Math.min(100, updatedState.risk.companyAlert + 5)
        }
      }
    }
  }
  if (trace.appId === 'kakaoTalk') {
    const memoryEntry = `[第${updatedState.week}周] ${trace.description}`
    updatedState = {
      ...updatedState,
      maleLead: {
        ...updatedState.maleLead,
        memory: {
          ...updatedState.maleLead.memory,
          keyMemories: [...updatedState.maleLead.memory.keyMemories.slice(-19), memoryEntry]
        }
      }
    }
  }
  if (trace.appId === 'weverse') {
    if (updatedState.risk.fanSuspicion >= 50) {
      updatedState = {
        ...updatedState,
        risk: {
          ...updatedState.risk,
          publicHeat: Math.min(100, updatedState.risk.publicHeat + 3),
          fanSuspicion: Math.min(100, updatedState.risk.fanSuspicion + 2)
        }
      }
    }
  }
  return updatedState
}

export function checkEventChainProgress(state: GameState): EventChain | null {
  for (const chain of state.eventChains) {
    if (!chain.isActive || chain.isCompleted) continue
    const currentStage = chain.stages[chain.currentStage]
    if (!currentStage) continue
    const condition = currentStage.triggerCondition
    try {
      const evalContext: Record<string, number> = {
        affection: state.maleLead.affection,
        trust: state.maleLead.trust,
        mood: state.player.mood,
        secrecy: state.risk.secrecy,
        companyAlert: state.risk.companyAlert,
        fanSuspicion: state.risk.fanSuspicion,
        publicHeat: state.risk.publicHeat,
        careerPressure: state.maleLead.careerPressure,
        paparazziAttention: state.risk.paparazziAttention,
        evidenceCount: state.risk.evidenceCount,
        week: state.week,
        popularity: state.player.popularity,
        lifeStability: state.player.lifeStability,
        money: state.player.money
      }
      const keys = Object.keys(evalContext)
      const values = Object.values(evalContext)
      const fn = new Function(...keys, `return ${condition}`)
      if (fn(...values)) {
        return chain
      }
    } catch {
      continue
    }
  }
  return null
}

export function generateEvidenceFragment(state: GameState, source: string): EvidenceFragment | null {
  if (state.risk.fanSuspicion < 20 && state.risk.paparazziAttention < 20) return null
  const evidenceChance = (state.risk.fanSuspicion + state.risk.paparazziAttention) / 200
  if (Math.random() > evidenceChance) return null
  const riskLevel = Math.floor((state.risk.fanSuspicion + state.risk.paparazziAttention) / 2)
  const titles: Record<string, string> = {
    instagram: 'Instagram截图证据',
    kakaoTalk: '聊天记录截图',
    weverse: '粉丝分析帖',
    naver: '新闻报道存档',
    dispatch: '偷拍照片',
    calendar: '行程重合记录',
    gallery: '照片元数据'
  }
  const descriptions: Record<string, string> = {
    instagram: '有人在Instagram上发现了可疑的互动痕迹',
    kakaoTalk: '聊天记录被截图并在粉圈传播',
    weverse: '粉丝的分析帖中包含了对你们关系的推测',
    naver: '新闻报道中出现了暗示性的信息',
    dispatch: 'D社获得了模糊的偷拍照片',
    calendar: '你们的行程存在高度重合',
    gallery: '照片的EXIF数据暴露了位置信息'
  }
  return {
    id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: titles[source] || '未知来源证据',
    source,
    riskLevel,
    description: descriptions[source] || '新的证据碎片被发现',
    discoveredByFans: state.risk.fanSuspicion >= 50,
    canDelete: source === 'instagram' || source === 'kakaoTalk',
    relatedEventChainId: state.eventChains.find(c => c.isActive)?.id || '',
    createdAt: Date.now()
  }
}

export function generateFanTimeline(state: GameState): FanTimelineEntry | null {
  if (state.risk.fanSuspicion < 50) return null
  const timelineChance = (state.risk.fanSuspicion - 50) / 50
  if (Math.random() > timelineChance) return null
  const entries = []
  const eventCount = Math.floor(Math.random() * 3) + 2
  const timeSlots = ['3天前', '1周前', '2周前', '3周前', '1个月前']
  const contentTemplates = [
    `${state.maleLead.stageName}在Weverse上线时间与某账号高度重合`,
    `发现同款物品：${state.maleLead.stageName}和神秘人使用相同品牌的物品`,
    `位置重合：${state.maleLead.stageName}的Instagram story背景与某地点匹配`,
    `行为异常：${state.maleLead.stageName}近期在直播中频繁看手机`,
    `第三方证据：有人在${state.maleLead.stageName}常去的地点目击到可疑人物`,
    `时间线对比：${state.maleLead.stageName}的行程空白期与某人的社交活跃期吻合`
  ]
  for (let i = 0; i < eventCount; i++) {
    entries.push({
      time: timeSlots[i] || `${i + 1}周前`,
      content: contentTemplates[Math.floor(Math.random() * contentTemplates.length)]
    })
  }
  return {
    id: `ft_${Date.now()}`,
    title: `${state.maleLead.stageName}时间线异常分析`,
    entries,
    heat: Math.floor(state.risk.fanSuspicion * 0.7),
    createdAt: Date.now()
  }
}

export function calculateRiskScore(post: Partial<InstagramPost>): number {
  let score = 0
  if (post.imageTags && post.imageTags.length > 0) {
    const riskyTags = ['couple', 'date', 'love', 'together', 'matching', '同款', '约会', '情侣']
    const tagRisk = post.imageTags.filter(tag =>
      riskyTags.some(risky => tag.toLowerCase().includes(risky))
    ).length
    score += tagRisk * 15
  }
  if (post.location && post.location.trim() !== '') {
    score += 10
  }
  if (post.visibility === 'public') {
    score += 15
  } else if (post.visibility === 'friends') {
    score += 5
  }
  if (post.contentType === 'story') {
    score += 5
  } else if (post.contentType === 'post') {
    score += 10
  } else if (post.contentType === 'reel') {
    score += 20
  }
  if (post.text) {
    const riskyWords = ['love', 'miss', 'together', 'date', 'boyfriend', '想', '爱', '约会', '一起']
    const wordRisk = riskyWords.filter(w => post.text!.toLowerCase().includes(w)).length
    score += wordRisk * 8
  }
  if (post.author === 'player') {
    score += 10
  }
  return Math.max(0, Math.min(100, score))
}

export function checkCrisisLevel(state: GameState): CrisisLevel {
  const { risk, maleLead, player } = state
  const crisisScore =
    (100 - risk.secrecy) * 0.2 +
    risk.companyAlert * 0.2 +
    risk.fanSuspicion * 0.2 +
    risk.publicHeat * 0.15 +
    risk.paparazziAttention * 0.15 +
    (100 - player.mood) * 0.05 +
    maleLead.careerPressure * 0.05
  if (crisisScore >= 80) return 5
  if (crisisScore >= 60) return 4
  if (crisisScore >= 40) return 3
  if (crisisScore >= 20) return 2
  return 1
}
