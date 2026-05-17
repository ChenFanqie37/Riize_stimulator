import type { GameState, PlayerAction, Trace, DelayedConsequence, Notification } from '../types/game'
import { propagateToApps, generateEvidenceFragment } from './eventEngine'
import { generateWeekNotifications } from './storyEngine'

export const playerActions: Record<string, PlayerAction> = {
  post_instagram_story: {
    id: 'post_instagram_story',
    label: '发Instagram Story',
    description: '发一条Instagram Story，可能是甜蜜暗示也可能是烟雾弹',
    riskPreview: '公开可见，可能被粉丝截图分析',
    immediateEffect: { popularity: 5, fanSuspicion: 3 },
    visibleTrace: {
      app: 'instagram',
      type: 'story_post',
      canBeDeleted: true,
      canBeScreenshotted: true
    },
    npcReaction: ['闺蜜可能注意到', '粉丝可能截图', '男朋友可能看到'],
    delayedConsequences: [],
    eventChainTags: ['ring_incident', 'fan_digging']
  },
  delete_post: {
    id: 'delete_post',
    label: '删除帖子',
    description: '删除一条有风险的社交媒体帖子',
    riskPreview: '删除本身也是一种信号，互联网不会遗忘',
    immediateEffect: { fanSuspicion: 5, evidenceCount: -1 },
    visibleTrace: {
      app: 'instagram',
      type: 'post_deletion',
      canBeDeleted: false,
      canBeScreenshotted: true
    },
    npcReaction: ['粉丝会注意到删除行为', '男朋友可能松口气'],
    delayedConsequences: [],
    eventChainTags: ['fan_digging', 'birthday_livestream']
  },
  call_boyfriend: {
    id: 'call_boyfriend',
    label: '打电话给他',
    description: '给他打一个电话，听听他的声音',
    riskPreview: '通话记录可能被查，深夜通话更可疑',
    immediateEffect: { affection: 5, mood: 5, stress: -3 },
    visibleTrace: {
      app: 'kakaoTalk',
      type: 'phone_call',
      canBeDeleted: false,
      canBeScreenshotted: false
    },
    npcReaction: ['男朋友会接（如果方便）', '经纪人可能注意到通话记录'],
    delayedConsequences: [],
    eventChainTags: ['hotel_incident']
  },
  request_meeting: {
    id: 'request_meeting',
    label: '请求见面',
    description: '约他出来见面',
    riskPreview: '见面风险极高，可能被跟踪',
    immediateEffect: { affection: 8, secrecy: -5, paparazziAttention: 5 },
    visibleTrace: {
      app: 'kakaoTalk',
      type: 'meeting_request',
      canBeDeleted: true,
      canBeScreenshotted: true
    },
    npcReaction: ['男朋友可能犹豫', '如果被看到后果严重'],
    delayedConsequences: [],
    eventChainTags: ['hotel_incident', 'ring_incident']
  },
  refuse_meeting: {
    id: 'refuse_meeting',
    label: '拒绝见面',
    description: '拒绝他的见面请求',
    riskPreview: '安全但伤害感情',
    immediateEffect: { affection: -8, secrecy: 5, mood: -5 },
    visibleTrace: {
      app: 'kakaoTalk',
      type: 'meeting_refusal',
      canBeDeleted: true,
      canBeScreenshotted: false
    },
    npcReaction: ['男朋友会失落', '可能引发冷战'],
    delayedConsequences: [],
    eventChainTags: []
  },
  search_self: {
    id: 'search_self',
    label: '搜索自己',
    description: '在Naver上搜索自己，看看有没有被扒',
    riskPreview: '搜索记录本身可能暴露焦虑',
    immediateEffect: { anxiety: 5 },
    visibleTrace: {
      app: 'naver',
      type: 'search',
      canBeDeleted: true,
      canBeScreenshotted: false
    },
    npcReaction: [],
    delayedConsequences: [],
    eventChainTags: ['fan_digging']
  },
  create_alt_account: {
    id: 'create_alt_account',
    label: '创建小号',
    description: '创建一个社交媒体小号来关注他',
    riskPreview: '小号可能被粉丝识破',
    immediateEffect: { secrecy: 5, fanSuspicion: -3 },
    visibleTrace: {
      app: 'instagram',
      type: 'account_creation',
      canBeDeleted: true,
      canBeScreenshotted: false
    },
    npcReaction: ['如果被发现小号，粉圈会炸'],
    delayedConsequences: [],
    eventChainTags: ['fan_digging']
  },
  request_cooling: {
    id: 'request_cooling',
    label: '请求冷静期',
    description: '主动提出暂时冷静一段时间',
    riskPreview: '保护双方但可能变成真正的疏远',
    immediateEffect: { affection: -10, trust: 5, secrecy: 10, careerPressure: -5, mood: -10 },
    visibleTrace: {
      app: 'kakaoTalk',
      type: 'cooling_request',
      canBeDeleted: true,
      canBeScreenshotted: true
    },
    npcReaction: ['男朋友会受伤但可能理解', '闺蜜会支持'],
    delayedConsequences: [],
    eventChainTags: []
  },
  demand_public: {
    id: 'demand_public',
    label: '要求公开关系',
    description: '向他提出公开关系的要求',
    riskPreview: '这是最大的赌博，他可能答应也可能分手',
    immediateEffect: { affection: -5, trust: -5, careerPressure: 15, secrecy: -20 },
    visibleTrace: {
      app: 'kakaoTalk',
      type: 'public_demand',
      canBeDeleted: true,
      canBeScreenshotted: true
    },
    npcReaction: ['男朋友会极度紧张', '如果拒绝会严重伤害感情'],
    delayedConsequences: [],
    eventChainTags: ['ring_incident', 'fan_digging']
  },
  use_identity_ability: {
    id: 'use_identity_ability',
    label: '使用身份特殊能力',
    description: '使用你当前身份的特殊能力',
    riskPreview: '每次使用都有代价',
    immediateEffect: { popularity: 5, secrecy: -3 },
    visibleTrace: {
      app: 'kakaoTalk',
      type: 'ability_use',
      canBeDeleted: false,
      canBeScreenshotted: false
    },
    npcReaction: ['效果取决于身份类型'],
    delayedConsequences: [],
    eventChainTags: []
  }
}

function applyStatChanges(state: GameState, changes: Record<string, number>): GameState {
  let s = { ...state }
  if (changes.affection !== undefined) {
    s = { ...s, maleLead: { ...s.maleLead, affection: Math.max(0, Math.min(100, s.maleLead.affection + changes.affection)) } }
  }
  if (changes.trust !== undefined) {
    s = { ...s, maleLead: { ...s.maleLead, trust: Math.max(0, Math.min(100, s.maleLead.trust + changes.trust)) } }
  }
  if (changes.mood !== undefined) {
    s = { ...s, player: { ...s.player, mood: Math.max(0, Math.min(100, s.player.mood + changes.mood)) } }
  }
  if (changes.secrecy !== undefined) {
    s = { ...s, risk: { ...s.risk, secrecy: Math.max(0, Math.min(100, s.risk.secrecy + changes.secrecy)) } }
  }
  if (changes.companyAlert !== undefined) {
    s = { ...s, risk: { ...s.risk, companyAlert: Math.max(0, Math.min(100, s.risk.companyAlert + changes.companyAlert)) } }
  }
  if (changes.fanSuspicion !== undefined) {
    s = { ...s, risk: { ...s.risk, fanSuspicion: Math.max(0, Math.min(100, s.risk.fanSuspicion + changes.fanSuspicion)) } }
  }
  if (changes.publicHeat !== undefined) {
    s = { ...s, risk: { ...s.risk, publicHeat: Math.max(0, Math.min(100, s.risk.publicHeat + changes.publicHeat)) } }
  }
  if (changes.careerPressure !== undefined) {
    s = { ...s, maleLead: { ...s.maleLead, careerPressure: Math.max(0, Math.min(100, s.maleLead.careerPressure + changes.careerPressure)) } }
  }
  if (changes.paparazziAttention !== undefined) {
    s = { ...s, risk: { ...s.risk, paparazziAttention: Math.max(0, Math.min(100, s.risk.paparazziAttention + changes.paparazziAttention)) } }
  }
  if (changes.evidenceCount !== undefined) {
    s = { ...s, risk: { ...s.risk, evidenceCount: Math.max(0, s.risk.evidenceCount + changes.evidenceCount) } }
  }
  if (changes.popularity !== undefined) {
    s = { ...s, player: { ...s.player, popularity: Math.max(0, Math.min(100, s.player.popularity + changes.popularity)) } }
  }
  if (changes.lifeStability !== undefined) {
    s = { ...s, player: { ...s.player, lifeStability: Math.max(0, Math.min(100, s.player.lifeStability + changes.lifeStability)) } }
  }
  if (changes.money !== undefined) {
    s = { ...s, player: { ...s.player, money: Math.max(0, s.player.money + changes.money) } }
  }
  if (changes.stress !== undefined) {
    s = { ...s, health: { ...s.health, stress: Math.max(0, Math.min(100, s.health.stress + changes.stress)) } }
  }
  if (changes.mentalHealth !== undefined) {
    s = { ...s, health: { ...s.health, mentalHealth: Math.max(0, Math.min(100, s.health.mentalHealth + changes.mentalHealth)) } }
  }
  if (changes.sleep !== undefined) {
    s = { ...s, health: { ...s.health, sleep: Math.max(0, Math.min(100, s.health.sleep + changes.sleep)) } }
  }
  if (changes.anxiety !== undefined) {
    s = { ...s, health: { ...s.health, stress: Math.max(0, Math.min(100, s.health.stress + changes.anxiety)) } }
  }
  if (changes.jealousy !== undefined) {
    s = { ...s, maleLead: { ...s.maleLead, emotionalState: 'jealous' } }
  }
  if (changes.actionPoints !== undefined) {
    s = { ...s, player: { ...s.player, actionPoints: Math.max(0, s.player.actionPoints + changes.actionPoints) } }
  }
  return s
}

export function performPlayerAction(
  actionId: string,
  payload: any,
  state: GameState
): { state: GameState; trace: Trace; feedback: string } {
  const action = playerActions[actionId]
  if (!action) {
    return {
      state,
      trace: {
        id: `trace_error_${Date.now()}`,
        type: 'error',
        description: `未知操作: ${actionId}`,
        round: state.week,
        appId: 'kakaoTalk',
        screenshotBeforeDelete: false,
        createdAt: Date.now()
      },
      feedback: '无效操作'
    }
  }
  let updatedState = applyStatChanges(state, action.immediateEffect)
  if (payload?.statChanges) {
    updatedState = applyStatChanges(updatedState, payload.statChanges)
  }
  const trace: Trace = {
    id: `trace_${actionId}_${Date.now()}`,
    type: action.visibleTrace.type,
    description: action.description,
    round: state.week,
    appId: action.visibleTrace.app,
    screenshotBeforeDelete: action.visibleTrace.canBeScreenshotted && Math.random() < 0.3,
    createdAt: Date.now()
  }
  updatedState = propagateToApps(updatedState, trace)
  const npcReactions: string[] = []
  for (const reaction of action.npcReaction) {
    if (Math.random() < 0.5) {
      npcReactions.push(reaction)
    }
  }
  if (npcReactions.length > 0) {
    const relevantNpc = updatedState.npcs.find(n => {
      if (action.visibleTrace.app === 'kakaoTalk' && n.id === 'manager') return true
      if (action.visibleTrace.app === 'instagram' && (n.id === 'fan_friend' || n.id === 'fan_leader')) return true
      if (n.id === 'bestie') return true
      return false
    })
    if (relevantNpc) {
      updatedState = {
        ...updatedState,
        npcs: updatedState.npcs.map(n =>
          n.id === relevantNpc.id
            ? { ...n, suspicion: Math.min(100, n.suspicion + 3), memoryTags: [...n.memoryTags, actionId] }
            : n
        )
      }
    }
  }
  const delayedConsequences: DelayedConsequence[] = []
  if (action.delayedConsequences && action.delayedConsequences.length > 0) {
    delayedConsequences.push(...action.delayedConsequences)
  } else {
    const hasDelayedEffect = Math.random() < 0.3
    if (hasDelayedEffect) {
      const triggerRound = state.week + Math.floor(Math.random() * 3) + 1
      const consequenceChanges: Record<string, number> = {}
      const effectKeys = Object.keys(action.immediateEffect)
      if (effectKeys.length > 0) {
        const randomKey = effectKeys[Math.floor(Math.random() * effectKeys.length)]
        consequenceChanges[randomKey] = -Math.abs(action.immediateEffect[randomKey])
      }
      delayedConsequences.push({
        id: `dc_${actionId}_${Date.now()}`,
        triggerRound,
        type: actionId,
        eventId: actionId,
        content: `${action.label}的后续影响`,
        statChanges: consequenceChanges,
        isTriggered: false
      })
    }
  }
  if (delayedConsequences.length > 0) {
    updatedState = {
      ...updatedState,
      delayedConsequences: [...updatedState.delayedConsequences, ...delayedConsequences]
    }
  }
  if (action.eventChainTags.length > 0) {
    updatedState = {
      ...updatedState,
      eventChains: updatedState.eventChains.map(chain => {
        if (action.eventChainTags.includes(chain.id) && !chain.isActive && !chain.isCompleted) {
          const shouldActivate = Math.random() < 0.15
          if (shouldActivate) {
            return { ...chain, isActive: true }
          }
        }
        return chain
      })
    }
  }
  const evidence = generateEvidenceFragment(updatedState, action.visibleTrace.app)
  if (evidence) {
    updatedState = {
      ...updatedState,
      evidenceFragments: [...updatedState.evidenceFragments, evidence],
      risk: {
        ...updatedState.risk,
        evidenceCount: updatedState.risk.evidenceCount + 1
      }
    }
  }
  const newNotifications = generateWeekNotifications(updatedState)
  updatedState = {
    ...updatedState,
    notifications: [...updatedState.notifications.slice(-20), ...newNotifications.slice(0, 2)]
  }
  updatedState = {
    ...updatedState,
    player: {
      ...updatedState.player,
      actionPoints: Math.max(0, updatedState.player.actionPoints - 1)
    },
    history: [
      ...updatedState.history,
      {
        id: `hist_${Date.now()}`,
        week: updatedState.week,
        day: updatedState.day,
        event: action.label,
        choice: payload?.choiceText || action.label,
        consequences: action.immediateEffect,
        memoryTags: [actionId, ...action.eventChainTags],
        createdAt: Date.now()
      }
    ]
  }
  const feedbackParts = [action.label]
  if (npcReactions.length > 0) {
    feedbackParts.push(`反应: ${npcReactions.join(', ')}`)
  }
  if (evidence) {
    feedbackParts.push('⚠️ 新的证据碎片出现')
  }
  if (trace.screenshotBeforeDelete) {
    feedbackParts.push('⚠️ 有人截图了')
  }
  return {
    state: updatedState,
    trace,
    feedback: feedbackParts.join(' | ')
  }
}
