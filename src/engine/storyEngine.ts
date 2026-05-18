import type {
  GameState,
  Notification,
  GameEvent,
  NarrativePhase,
  RelationshipStage,
  AppName
} from '../types/game'

const weathers = ['晴', '多云', '阴', '小雨', '大雨', '雪', '雾', '大风']
const notificationTemplates: { app: AppName; title: string; contentFn: (state: GameState) => string; urgency: 'low' | 'medium' | 'high'; condition?: (state: GameState) => boolean }[] = [
  {
    app: 'kakaoTalk',
    title: '新消息',
    contentFn: (s) => `${s.maleLead.name}给你发了一条消息`,
    urgency: 'medium',
    condition: (s) => s.maleLead.affection >= 20
  },
  {
    app: 'instagram',
    title: '新动态',
    contentFn: (s) => `${s.maleLead.stageName}发了一条Instagram story`,
    urgency: 'low',
    condition: (s) => s.week >= 2
  },
  {
    app: 'weverse',
    title: '粉丝讨论',
    contentFn: (s) => `有粉丝在讨论${s.maleLead.stageName}最近的异常行为`,
    urgency: 'medium',
    condition: (s) => s.risk.fanSuspicion >= 30
  },
  {
    app: 'naver',
    title: '热搜提醒',
    contentFn: (s) => `${s.maleLead.stageName}相关话题登上Naver热搜`,
    urgency: 'high',
    condition: (s) => s.risk.publicHeat >= 40
  },
  {
    app: 'companyNotice',
    title: '公司通知',
    contentFn: (s) => `SM娱乐发布了关于艺人管理的新通知`,
    urgency: 'high',
    condition: (s) => s.risk.companyAlert >= 30
  },
  {
    app: 'dispatch',
    title: 'D社预告',
    contentFn: (s) => `Dispatch发布了新的预告，似乎与${s.maleLead.stageName}有关`,
    urgency: 'high',
    condition: (s) => s.risk.paparazziAttention >= 50
  },
  {
    app: 'kakaoTalk',
    title: '闺蜜消息',
    contentFn: (s) => `你的闺蜜发来消息："你最近是不是有什么事瞒着我？"`,
    urgency: 'medium',
    condition: (s) => s.risk.secrecy <= 60 && s.npcs.some(n => n.id === 'bestie' && n.suspicion >= 30)
  },
  {
    app: 'calendar',
    title: '行程提醒',
    contentFn: (s) => `${s.maleLead.stageName}明天有公开行程`,
    urgency: 'low'
  },
  {
    app: 'health',
    title: '健康提醒',
    contentFn: (s) => `你的压力指数过高，建议休息`,
    urgency: 'medium',
    condition: (s) => s.health.stress >= 60
  },
  {
    app: 'weverse',
    title: '大粉分析帖',
    contentFn: (s) => `粉圈大粉发帖分析${s.maleLead.stageName}的时间线异常`,
    urgency: 'high',
    condition: (s) => s.risk.fanSuspicion >= 50
  },
  {
    app: 'instagram',
    title: '标记提醒',
    contentFn: (s) => `有人在照片中标记了你`,
    urgency: 'medium',
    condition: (s) => s.risk.fanSuspicion >= 40
  },
  {
    app: 'kakaoTalk',
    title: '经纪人消息',
    contentFn: (s) => `经纪人发来消息："我们需要谈谈"`,
    urgency: 'high',
    condition: (s) => s.risk.companyAlert >= 50
  }
]

export function generateWeekNotifications(state: GameState): Notification[] {
  const notifications: Notification[] = []
  const eligible = notificationTemplates.filter(t => !t.condition || t.condition(state))
  const count = Math.min(Math.floor(Math.random() * 6) + 3, eligible.length)
  const shuffled = [...eligible].sort(() => Math.random() - 0.5)
  for (let i = 0; i < count; i++) {
    const template = shuffled[i]
    notifications.push({
      id: `notif_${state.week}_${Date.now()}_${i}`,
      app: template.app,
      title: template.title,
      content: template.contentFn(state),
      urgency: template.urgency,
      isRead: false,
      createdAt: Date.now() + i * 60000
    })
  }
  return notifications
}

export function generateMainEvent(state: GameState): GameEvent | null {
  const { week, maleLead, risk, player } = state
  if (week <= 1) return null
  const eventChance = Math.min(0.3 + week * 0.05, 0.8)
  if (Math.random() > eventChance) return null
  const roll = Math.random()
  if (risk.fanSuspicion >= 60 && roll < 0.3) {
    return {
      id: `main_fan_${week}`,
      type: 'fan',
      title: '粉圈风暴预警',
      description: `粉丝的怀疑已经达到了危险的程度。有人在Weverse上发布了详细的时间线分析帖，将${maleLead.stageName}的行踪和一个神秘账号关联起来。你需要决定如何应对。`,
      choices: [
        { id: `mf_${week}_1`, text: '用小号引导舆论方向', riskPreview: '可能暴露小号', statChanges: { fanSuspicion: -10, secrecy: -5 } },
        { id: `mf_${week}_2`, text: '让男朋友注意言行', riskPreview: '增加他的压力', statChanges: { careerPressure: 10, fanSuspicion: -5 } },
        { id: `mf_${week}_3`, text: '暂时减少一切互动', riskPreview: '安全但伤害感情', statChanges: { affection: -8, secrecy: 10, fanSuspicion: -8 } }
      ]
    }
  }
  if (risk.companyAlert >= 50 && roll < 0.5) {
    return {
      id: `main_company_${week}`,
      type: 'company',
      title: '公司约谈',
      description: `经纪人约你单独谈话。他的表情很严肃："最近网上有些传言，公司需要确认一些事情。"你知道，被公司盯上意味着什么。`,
      choices: [
        { id: `mc_${week}_1`, text: '否认一切，装作不知情', riskPreview: '如果证据确凿会更糟', statChanges: { companyAlert: 5, secrecy: 5 } },
        { id: `mc_${week}_2`, text: '部分承认，请求保密', riskPreview: '交出部分控制权', statChanges: { companyAlert: 10, trust: 5, secrecy: -10 } },
        { id: `mc_${week}_3`, text: '反问经纪人为什么怀疑', riskPreview: '试探对方底线', statChanges: { companyAlert: -5, secrecy: 3 } }
      ]
    }
  }
  if (maleLead.affection >= 60 && roll < 0.7) {
    return {
      id: `main_romance_${week}`,
      type: 'romance',
      title: '深夜告白',
      description: `凌晨两点，${maleLead.name}发来一条很长的消息："我一直在想，这样的日子还要过多久……我真的很想光明正大地牵着你的手。"然后又补了一句："抱歉，喝多了，你当没看到吧。"`,
      choices: [
        { id: `mr_${week}_1`, text: '"我不想当没看到"', riskPreview: '坦诚面对', statChanges: { affection: 15, trust: 10, mood: 10 } },
        { id: `mr_${week}_2`, text: '"我们再等等好吗？"', riskPreview: '理性但让他失落', statChanges: { affection: -3, trust: 5, careerPressure: -5 } },
        { id: `mr_${week}_3`, text: '明天再聊，先休息', riskPreview: '回避问题', statChanges: { affection: -5, mood: -5 } }
      ]
    }
  }
  if (player.mood <= 30 && roll < 0.85) {
    return {
      id: `main_mood_${week}`,
      type: 'daily',
      title: '情绪崩溃',
      description: `你坐在出租屋里，手机屏幕的光映着疲惫的脸。所有的压力——秘密恋情、经济压力、粉圈威胁——像潮水一样涌来。你开始怀疑这一切值不值得。`,
      choices: [
        { id: `mm_${week}_1`, text: '给闺蜜打电话倾诉', riskPreview: '多一个人知道', statChanges: { mood: 10, secrecy: -5, mentalHealth: 10 } },
        { id: `mm_${week}_2`, text: '一个人扛着，写日记', riskPreview: '安全但孤独', statChanges: { mood: -5, mentalHealth: -5 } },
        { id: `mm_${week}_3`, text: '给他发消息说想他了', riskPreview: '甜蜜但增加依赖', statChanges: { affection: 8, mood: 5, mentalHealth: -3 } }
      ]
    }
  }
  return null
}

export function processWeekStart(state: GameState): Partial<GameState> {
  const newWeather = weathers[Math.floor(Math.random() * weathers.length)]
  const weeklyDeduction = 5 + Math.floor(state.week * 0.5)
  const newMoney = Math.max(0, state.player.money - weeklyDeduction)
  const scheduleTypes = ['打歌节目', '综艺节目', '海外行程', '拍摄', '练习', '休息', '粉丝签售', '品牌活动']
  const boyfriendSchedule = scheduleTypes[Math.floor(Math.random() * scheduleTypes.length)]
  const careerStateMap: Record<string, string> = {
    '打歌节目': '回归期',
    '综艺节目': '宣传期',
    '海外行程': '海外活动',
    '拍摄': '拍摄中',
    '练习': '准备期',
    '休息': '休假期',
    '粉丝签售': '粉丝活动',
    '品牌活动': '商务活动'
  }
  const fanHeatChange = Math.floor(Math.random() * 10) - 3
  const newPublicHeat = Math.max(0, Math.min(100, state.risk.publicHeat + fanHeatChange))
  return {
    weather: newWeather,
    player: {
      ...state.player,
      money: newMoney,
      actionPoints: 4
    },
    risk: {
      ...state.risk,
      publicHeat: newPublicHeat
    },
    calendar: {
      ...state.calendar,
      events: [
        ...state.calendar.events,
        {
          id: `cal_${state.week}_bf`,
          title: `${state.maleLead.stageName}: ${boyfriendSchedule}`,
          date: `第${state.week}周`,
          time: '全天',
          type: 'boyfriend' as const,
          isHighRisk: ['海外行程', '拍摄', '品牌活动'].includes(boyfriendSchedule),
          isCompleted: false
        }
      ]
    },
    maleLead: {
      ...state.maleLead,
      careerPressure: Math.min(100, state.maleLead.careerPressure + (careerStateMap[boyfriendSchedule] === '回归期' ? 10 : 5)),
      emotionalState: careerStateMap[boyfriendSchedule] || '正常'
    }
  }
}

export function processWeekEnd(state: GameState): Partial<GameState> {
  const affectionDelta = state.maleLead.affection >= 50 ? 2 : -1
  const trustDelta = state.maleLead.trust >= 50 ? 1 : -1
  const moodDelta = state.player.mood >= 50 ? 1 : -2
  const secrecyDelta = state.risk.secrecy >= 50 ? 1 : -2
  const newAffection = Math.max(0, Math.min(100, state.maleLead.affection + affectionDelta))
  const newTrust = Math.max(0, Math.min(100, state.maleLead.trust + trustDelta))
  const newMood = Math.max(0, Math.min(100, state.player.mood + moodDelta))
  const newSecrecy = Math.max(0, Math.min(100, state.risk.secrecy + secrecyDelta))
  const updatedNpcs = state.npcs.map(npc => {
    let intimacyChange = 0
    let suspicionChange = 0
    if (npc.id === 'bestie') {
      intimacyChange = 2
      suspicionChange = state.risk.secrecy < 50 ? 5 : 0
    } else if (npc.id === 'fan_friend') {
      suspicionChange = state.risk.fanSuspicion > 40 ? 5 : 0
    } else if (npc.id === 'manager') {
      suspicionChange = state.risk.companyAlert > 40 ? 5 : 0
    } else if (npc.id === 'fan_leader') {
      suspicionChange = state.risk.fanSuspicion > 50 ? 8 : 0
    }
    return {
      ...npc,
      intimacy: Math.max(0, Math.min(100, npc.intimacy + intimacyChange)),
      suspicion: Math.max(0, Math.min(100, npc.suspicion + suspicionChange))
    }
  })
  return {
    maleLead: {
      ...state.maleLead,
      affection: newAffection,
      trust: newTrust
    },
    player: {
      ...state.player,
      mood: newMood
    },
    risk: {
      ...state.risk,
      secrecy: newSecrecy
    },
    npcs: updatedNpcs,
    health: {
      ...state.health,
      stress: Math.max(0, Math.min(100, state.health.stress + (state.player.mood < 30 ? 10 : -5))),
      sleep: Math.max(0, Math.min(100, state.health.sleep + (state.player.mood > 60 ? 5 : -5))),
      mentalHealth: Math.max(0, Math.min(100, state.health.mentalHealth + (state.player.mood > 50 ? 2 : -3)))
    }
  }
}

export function checkSpecialTriggers(state: GameState): GameEvent | null {
  const { player, maleLead, risk } = state
  if (player.mood < 20) {
    return {
      id: `special_mood_${state.week}`,
      type: 'crisis',
      title: '情绪崩溃边缘',
      description: '你的心情已经跌到了谷底。连续的压力让你几乎无法正常生活，每一条消息都像是在提醒你这段关系的代价。你需要做出选择。',
      choices: [
        { id: 'sp_mood_1', text: '向他求助', riskPreview: '依赖但温暖', statChanges: { affection: 5, mood: 10, mentalHealth: 5 } },
        { id: 'sp_mood_2', text: '找心理咨询', riskPreview: '专业帮助但花钱', statChanges: { money: -10, mentalHealth: 15, mood: 5 } },
        { id: 'sp_mood_3', text: '独自承受', riskPreview: '坚强但危险', statChanges: { mood: -5, mentalHealth: -10 } }
      ]
    }
  }
  if (risk.secrecy < 30) {
    return {
      id: `special_secrecy_${state.week}`,
      type: 'crisis',
      title: '秘密即将暴露',
      description: '你们的秘密关系已经快要藏不住了。太多人开始注意到异常，证据碎片正在被拼凑。如果不采取行动，一切将在下一周曝光。',
      choices: [
        { id: 'sp_sec_1', text: '紧急转入地下模式', riskPreview: '安全但痛苦', statChanges: { secrecy: 15, affection: -10, mood: -15 } },
        { id: 'sp_sec_2', text: '主动制造烟雾弹', riskPreview: '聪明但有风险', statChanges: { secrecy: 10, fanSuspicion: -5, evidenceCount: -1 } },
        { id: 'sp_sec_3', text: '和他商量对策', riskPreview: '共同面对', statChanges: { trust: 8, careerPressure: 10, secrecy: 5 } }
      ]
    }
  }
  if (player.popularity > 60) {
    return {
      id: `special_pop_${state.week}`,
      type: 'growth',
      title: '你开始被注意到了',
      description: '你在社交媒体上的存在感越来越强，有人开始好奇你是谁。这可能是好事——也可能让你成为下一个被扒皮的目标。',
      choices: [
        { id: 'sp_pop_1', text: '降低社交媒体活跃度', riskPreview: '安全但失去影响力', statChanges: { popularity: -10, fanSuspicion: -8 } },
        { id: 'sp_pop_2', text: '利用关注度建立正面形象', riskPreview: '大胆但有效', statChanges: { popularity: 10, lifeStability: 5, fanSuspicion: 5 } },
        { id: 'sp_pop_3', text: '保持现状', riskPreview: '不作为', statChanges: { fanSuspicion: 3 } }
      ]
    }
  }
  if (player.money < 25) {
    return {
      id: `special_money_${state.week}`,
      type: 'economy',
      title: '经济危机',
      description: '你的余额已经低到会影响行程选择。线下、礼物、交通和临时住宿都要钱，你需要先把生活接住。',
      choices: [
        { id: 'sp_mon_1', text: '接便利店晚班', riskPreview: '辛苦但稳定', statChanges: { money: 16, lifeStability: 5, mood: -4, stress: 7 } },
        { id: 'sp_mon_2', text: '接翻译/字幕急单', riskPreview: '来钱快但熬夜', statChanges: { money: 22, lifeStability: 3, sleep: -8, stress: 8 } },
        { id: 'sp_mon_3', text: '整理周边回血', riskPreview: '可能被粉圈熟人看到', statChanges: { money: 12, fanSuspicion: 2, mood: -2 } }
      ]
    }
  }
  if (risk.companyAlert > 80) {
    return {
      id: `special_company_${state.week}`,
      type: 'company',
      title: '公司最后通牒',
      description: `SM娱乐已经掌握了足够的证据。公司高层给了${maleLead.name}一个选择：立刻结束关系，或者面临解约。这不是威胁，这是最后通牒。`,
      choices: [
        { id: 'sp_comp_1', text: '暂时分手保护他', riskPreview: '牺牲感情', statChanges: { affection: -20, trust: 10, careerPressure: -15, secrecy: 20 } },
        { id: 'sp_comp_2', text: '转入完全地下', riskPreview: '危险但继续', statChanges: { secrecy: 15, companyAlert: -10, mood: -15, careerPressure: 5 } },
        { id: 'sp_comp_3', text: '准备公开', riskPreview: '最危险的选择', statChanges: { affection: 15, trust: 15, careerPressure: 30, publicHeat: 40, secrecy: -40 } }
      ]
    }
  }
  if (maleLead.careerPressure > 90) {
    return {
      id: `special_career_${state.week}`,
      type: 'work',
      title: '他的崩溃边缘',
      description: `${maleLead.name}的事业压力已经到了极限。他开始失眠，练习时频繁出错，队友也注意到了他的异常。你的存在是他唯一的慰藉，也是他最大的压力源。`,
      choices: [
        { id: 'sp_career_1', text: '主动减少联系让他专注事业', riskPreview: '体贴但让他孤独', statChanges: { affection: -8, careerPressure: -10, trust: 5 } },
        { id: 'sp_career_2', text: '默默支持，做他坚强的后盾', riskPreview: '温暖但需要耐心', statChanges: { affection: 10, trust: 8, mood: -5 } },
        { id: 'sp_career_3', text: '建议他寻求专业帮助', riskPreview: '理性但可能让他觉得你推开他', statChanges: { careerPressure: -5, affection: -3, trust: 3 } }
      ]
    }
  }
  return null
}

export function determineNarrativePhase(week: number): NarrativePhase {
  if (week <= 4) return '起'
  if (week <= 10) return '承'
  if (week <= 16) return '转'
  return '合'
}

export function determineRelationshipStage(affection: number): RelationshipStage {
  if (affection < 10) return 'stranger'
  if (affection < 25) return 'impression'
  if (affection < 40) return 'interest'
  if (affection < 55) return 'ambiguous'
  if (affection < 70) return 'confirmed'
  if (affection < 85) return 'passionate'
  return 'trial'
}
