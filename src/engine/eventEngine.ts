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

function rid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

function currentRound(state: GameState): number {
  return (state.week - 1) * 7 + state.day
}

function applyDelayedStatChanges(state: GameState, changes: Record<string, number>): GameState {
  let updatedState = { ...state }
  for (const [key, value] of Object.entries(changes)) {
    if (!value) continue
    if (key === 'affection') {
      updatedState = { ...updatedState, maleLead: { ...updatedState.maleLead, affection: clamp(updatedState.maleLead.affection + value) } }
    } else if (key === 'trust') {
      updatedState = { ...updatedState, maleLead: { ...updatedState.maleLead, trust: clamp(updatedState.maleLead.trust + value) } }
    } else if (key === 'careerPressure') {
      updatedState = { ...updatedState, maleLead: { ...updatedState.maleLead, careerPressure: clamp(updatedState.maleLead.careerPressure + value) } }
    } else if (key === 'mood') {
      updatedState = { ...updatedState, player: { ...updatedState.player, mood: clamp(updatedState.player.mood + value) } }
    } else if (key === 'money') {
      updatedState = { ...updatedState, player: { ...updatedState.player, money: Math.max(0, updatedState.player.money + value) } }
    } else if (key === 'lifeStability') {
      updatedState = { ...updatedState, player: { ...updatedState.player, lifeStability: clamp(updatedState.player.lifeStability + value) } }
    } else if (key === 'popularity') {
      updatedState = { ...updatedState, player: { ...updatedState.player, popularity: clamp(updatedState.player.popularity + value) } }
    } else if (key === 'secrecy') {
      updatedState = { ...updatedState, risk: { ...updatedState.risk, secrecy: clamp(updatedState.risk.secrecy + value) } }
    } else if (key === 'companyAlert') {
      updatedState = { ...updatedState, risk: { ...updatedState.risk, companyAlert: clamp(updatedState.risk.companyAlert + value) } }
    } else if (key === 'fanSuspicion') {
      updatedState = { ...updatedState, risk: { ...updatedState.risk, fanSuspicion: clamp(updatedState.risk.fanSuspicion + value) } }
    } else if (key === 'publicHeat') {
      updatedState = { ...updatedState, risk: { ...updatedState.risk, publicHeat: clamp(updatedState.risk.publicHeat + value) } }
    } else if (key === 'paparazziAttention') {
      updatedState = { ...updatedState, risk: { ...updatedState.risk, paparazziAttention: clamp(updatedState.risk.paparazziAttention + value) } }
    } else if (key === 'evidenceCount') {
      updatedState = { ...updatedState, risk: { ...updatedState.risk, evidenceCount: Math.max(0, updatedState.risk.evidenceCount + value) } }
    } else if (key === 'stress' || key === 'anxiety') {
      updatedState = { ...updatedState, health: { ...updatedState.health, stress: clamp(updatedState.health.stress + value) } }
    } else if (key === 'mentalHealth') {
      updatedState = { ...updatedState, health: { ...updatedState.health, mentalHealth: clamp(updatedState.health.mentalHealth + value) } }
    } else if (key === 'sleep') {
      updatedState = { ...updatedState, health: { ...updatedState.health, sleep: clamp(updatedState.health.sleep + value) } }
    } else if (key in updatedState.hiddenRisk) {
      updatedState = {
        ...updatedState,
        hiddenRisk: {
          ...updatedState.hiddenRisk,
          [key]: clamp(updatedState.hiddenRisk[key as keyof GameState['hiddenRisk']] + value),
        },
      }
    }
  }
  return updatedState
}

function materializeDelayedConsequence(state: GameState, dc: DelayedConsequence): GameState {
  let updatedState = state
  const baseNotification = {
    id: rid('notif_delay'),
    isRead: false,
    createdAt: Date.now(),
  }

  if (dc.type === 'weverse_analysis') {
    const relatedEvidenceIds = updatedState.evidenceFragments.slice(-3).map((e) => e.id)
    updatedState = {
      ...updatedState,
      weverse: {
        ...updatedState.weverse,
        posts: [
          ...updatedState.weverse.posts,
          {
            id: rid('wv_delay'),
            type: 'analysis',
            author: 'time_line_zip',
            title: '시간 지나고 보니까 더 이상해',
            content: `${dc.content} 评论区开始有人对比时间点、地点和同款物品。有人说别造谣，也有人说“越看越不对”。`,
            heat: clamp(35 + updatedState.risk.fanSuspicion + updatedState.risk.evidenceCount * 4),
            comments: 96 + updatedState.risk.fanSuspicion,
            isPlayerAlt: false,
            relatedEvidenceIds,
            createdAt: Date.now(),
          },
        ],
      },
      notifications: [
        ...updatedState.notifications,
        { ...baseNotification, app: 'weverse', title: '延迟后果：分析帖出现', content: dc.content, urgency: 'high' },
      ],
    }
  } else if (dc.type === 'fan_timeline') {
    const timeline = generateFanTimeline({ ...updatedState, risk: { ...updatedState.risk, fanSuspicion: Math.max(updatedState.risk.fanSuspicion, 55) } })
    if (timeline) {
      updatedState = {
        ...updatedState,
        weverse: {
          ...updatedState.weverse,
          timeline: [...updatedState.weverse.timeline, timeline],
          posts: [
            ...updatedState.weverse.posts,
            {
              id: rid('wv_timeline'),
              type: 'timeline',
              author: 'archive_briize',
              title: '최근 한 달 타임라인 정리',
              content: `${dc.content} 我把能看到的公开信息整理了一下，不下结论，大家自己判断。`,
              heat: timeline.heat,
              comments: 140 + updatedState.risk.fanSuspicion,
              isPlayerAlt: false,
              relatedEvidenceIds: updatedState.evidenceFragments.slice(-5).map((e) => e.id),
              createdAt: Date.now(),
            },
          ],
        },
        notifications: [
          ...updatedState.notifications,
          { ...baseNotification, app: 'weverse', title: '粉丝扒皮时间线更新', content: dc.content, urgency: 'high' },
        ],
      }
    }
  } else if (dc.type === 'naver_news') {
    updatedState = {
      ...updatedState,
      naver: {
        ...updatedState.naver,
        news: [
          ...updatedState.naver.news,
          {
            id: rid('nv_delay'),
            title: `${updatedState.maleLead.stageName} 관련 열애설 재점화`,
            summary: `${dc.content} 多个粉丝社区出现整理帖后，相关搜索词开始上升。所属社暂未回应。`,
            source: '스포츠경향',
            heat: clamp(45 + updatedState.risk.publicHeat + updatedState.risk.fanSuspicion * 0.4),
            relatedSearchWords: [updatedState.maleLead.stageName, '열애설', '타임라인', '소속사'],
            createdAt: Date.now(),
          },
        ],
      },
      notifications: [
        ...updatedState.notifications,
        { ...baseNotification, app: 'naver', title: 'Naver 新闻跟进', content: dc.content, urgency: 'high' },
      ],
    }
  } else if (dc.type === 'company_warning') {
    updatedState = {
      ...updatedState,
      companyNotice: {
        ...updatedState.companyNotice,
        notices: [
          ...updatedState.companyNotice.notices,
          {
            id: rid('cn_delay'),
            level: updatedState.risk.companyAlert > 75 ? 'summon' : 'warning',
            title: updatedState.risk.companyAlert > 75 ? '면담 요청' : 'SNS 및 사적 동선 관리',
            content: `${dc.content} 公司要求回归期减少私人联系，避免任何可以被粉丝解读的公开痕迹。`,
            isRead: false,
            createdAt: Date.now(),
          },
        ],
      },
      notifications: [
        ...updatedState.notifications,
        { ...baseNotification, app: 'companyNotice', title: '公司风控介入', content: dc.content, urgency: 'high' },
      ],
    }
  } else if (dc.type === 'dispatch_tip') {
    updatedState = {
      ...updatedState,
      dispatch: {
        ...updatedState.dispatch,
        tips: [
          ...updatedState.dispatch.tips,
          {
            id: rid('dp_delay'),
            type: updatedState.risk.paparazziAttention > 65 ? 'countdown' : 'clue',
            content: dc.content,
            heatLevel: clamp(30 + updatedState.risk.paparazziAttention + updatedState.hiddenRisk.paparazziHeat),
            createdAt: Date.now(),
          },
        ],
      },
      notifications: [
        ...updatedState.notifications,
        { ...baseNotification, app: 'dispatch', title: 'Dispatch 线索板更新', content: dc.content, urgency: 'high' },
      ],
    }
  } else if (dc.type === 'boyfriend_followup') {
    updatedState = {
      ...updatedState,
      kakaoTalk: {
        ...updatedState.kakaoTalk,
        threads: updatedState.kakaoTalk.threads.map((thread) =>
          thread.id === 'thread_boyfriend'
            ? {
                ...thread,
                unreadCount: thread.unreadCount + 1,
                lastActive: '刚刚',
                messages: [
                  ...thread.messages,
                  {
                    id: rid('msg_delay'),
                    sender: 'boyfriend',
                    senderName: updatedState.maleLead.name,
                    textKo: dc.eventId.includes('silence') ? '봤어. 답은 못 하겠어.' : '아까 보낸 거... 못 본 척해줘.',
                    textZh: dc.eventId.includes('silence') ? '我看到了。但我没办法回复。' : '刚才发的那条……你当没看到吧。',
                    timestamp: Date.now(),
                    isRead: false,
                    isRecalled: dc.eventId.includes('break_ice'),
                    emotion: dc.eventId.includes('silence') ? 'avoidant' : 'vulnerable',
                    category: 'emotional',
                  },
                ],
              }
            : thread
        ),
      },
      notifications: [
        ...updatedState.notifications,
        { ...baseNotification, app: 'kakaoTalk', title: '他终于有反应了', content: dc.content, urgency: 'high' },
      ],
    }
  }

  updatedState = {
    ...updatedState,
    history: [
      ...updatedState.history,
      {
        id: rid('hist_delay'),
        week: updatedState.week,
        day: updatedState.day,
        event: '延迟后果',
        choice: dc.content,
        consequences: dc.statChanges,
        memoryTags: [dc.type, dc.eventId],
        createdAt: Date.now(),
      },
    ],
    maleLead: {
      ...updatedState.maleLead,
      memory: {
        ...updatedState.maleLead.memory,
        keyMemories: [...updatedState.maleLead.memory.keyMemories.slice(-18), `延迟后果：${dc.content}`],
      },
    },
  }
  return updatedState
}

export function processDelayedConsequences(state: GameState): { state: GameState; triggered: DelayedConsequence[] } {
  const triggered: DelayedConsequence[] = []
  const round = currentRound(state)
  const updatedConsequences = state.delayedConsequences.map(dc => {
    if (dc.isTriggered) return dc
    if (round >= dc.triggerRound) {
      triggered.push({ ...dc, isTriggered: true })
      return { ...dc, isTriggered: true }
    }
    return dc
  })
  let updatedState = { ...state, delayedConsequences: updatedConsequences }
  for (const dc of triggered) {
    updatedState = applyDelayedStatChanges(updatedState, dc.statChanges)
    updatedState = materializeDelayedConsequence(updatedState, dc)
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
