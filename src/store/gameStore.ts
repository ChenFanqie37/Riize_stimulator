import { create } from 'zustand'
import type {
  GameState,
  AppName,
  ChatMessage,
  ChatThread,
  CallLog,
  InstagramPost,
  Notification,
  Trace,
  DelayedConsequence,
  EventChain,
  EvidenceFragment,
  FanTimelineEntry,
  HistoryEntry,
  RelationshipStatus,
  RIIZEMember,
  PlayerIdentity,
  PlotPreference,
  BoyfriendPersona,
  NarrativePhase,
  Clue,
  HiddenRisk,
  FandomStage,
  PaparazziStage,
  DelayedEcho,
  GameEvent,
  AppAccount,
  NarrativeTurn,
  NarrativeChoiceId,
  PendingStoryHook
} from '../types/game'
import { riizeMembers, npcTemplates, createNPCFromTemplate, getRandomPersona, getMemberData } from '../data/characters'
import { eventChains } from '../data/events'
import { getInitialSocialContent, getTriggeredContent } from '../data/initialSocialContent'
import { getIdentityStory } from '../data/storyData'
import { performPlayerAction } from '../engine/actionEngine'
import { processDelayedConsequences, generateFanTimeline, checkCrisisLevel } from '../engine/eventEngine'
import {
  generateWeekNotifications,
  generateMainEvent,
  processWeekStart,
  processWeekEnd,
  checkSpecialTriggers,
  determineNarrativePhase,
  determineRelationshipStage
} from '../engine/storyEngine'
import { evaluateFandomCycle, evaluatePaparazziProgress, getCompanyReaction } from '../engine/clueEngine'

const dayWeathers = ['晴', '多云', '阴', '小雨', '大雨', '雾', '大风']
const accountApps: AppName[] = ['kakaoTalk', 'instagram', 'weverse', 'naver', 'companyNotice', 'dispatch', 'offline', 'calendar', 'gallery', 'notes', 'health']

function buildAppAccounts(playerName = '你', identity: PlayerIdentity = 'student'): Record<AppName, AppAccount> {
  const safeName = playerName || '你'
  const slug = safeName.toLowerCase().replace(/\s+/g, '_') || 'secret'
  const identityLabel: Record<PlayerIdentity, string> = {
    student: '普通学生',
    fan: '粉圈潜水号',
    intern: '公司实习生',
    staff: '后台工作人员',
    stylist: '造型相关人员',
    translator: '翻译/口译账号',
    volunteer: '活动志愿者',
    parttime: '兼职账号',
    custom: '自定义身份',
  }
  return {
    kakaoTalk: {
      app: 'kakaoTalk',
      displayName: safeName,
      handle: `${safeName}的Kakao`,
      avatar: safeName.charAt(0) || '我',
      persona: '私人聊天号',
      accountType: 'private',
      followers: 18,
      riskNote: '最甜，也最容易留下已读、撤回和通话记录。',
      isAnonymous: false,
    },
    instagram: {
      app: 'instagram',
      displayName: `${safeName}`,
      handle: `@${slug}_film`,
      avatar: safeName.charAt(0) || 'I',
      persona: identityLabel[identity],
      accountType: 'main',
      followers: identity === 'fan' ? 1280 : 238,
      riskNote: 'Story、定位、同款和密友圈都会被截图。',
      isAnonymous: false,
    },
    weverse: {
      app: 'weverse',
      displayName: '深夜的站台',
      handle: `@night_platform_${slug.slice(0, 4)}`,
      avatar: '站',
      persona: '粉圈小号',
      accountType: 'alt',
      followers: 42,
      riskNote: '适合控评和嗑糖，但小号发言轨迹会被反扒。',
      isAnonymous: true,
    },
    naver: {
      app: 'naver',
      displayName: '无痕搜索',
      handle: `${slug}_search`,
      avatar: 'N',
      persona: '搜索账号',
      accountType: 'anonymous',
      followers: 0,
      riskNote: '搜索历史会暴露你最怕被证实的关键词。',
      isAnonymous: true,
    },
    companyNotice: {
      app: 'companyNotice',
      displayName: identity === 'staff' || identity === 'intern' || identity === 'stylist' ? safeName : '访客通行证',
      handle: identity === 'staff' || identity === 'intern' || identity === 'stylist' ? `SM-${slug}` : 'temporary-pass',
      avatar: '证',
      persona: identityLabel[identity],
      accountType: 'official',
      followers: 0,
      riskNote: '公司不会嗑糖，只会看动线、门禁和风险。',
      isAnonymous: false,
    },
    dispatch: {
      app: 'dispatch',
      displayName: '线索旁观者',
      handle: `tip-${slug}`,
      avatar: 'D',
      persona: '匿名线索浏览',
      accountType: 'anonymous',
      followers: 0,
      riskNote: '你看得越多，越知道狗仔在拼哪块图。',
      isAnonymous: true,
    },
    offline: {
      app: 'offline',
      displayName: `${safeName}的线下号`,
      handle: `@offline_${slug.slice(0, 6)}`,
      avatar: '线',
      persona: '追线下/行程观察',
      accountType: 'alt',
      followers: identity === 'fan' ? 320 : 38,
      riskNote: '越靠近非公开路线，越容易被站姐、私生或公司记住脸。',
      isAnonymous: true,
    },
    calendar: {
      app: 'calendar',
      displayName: `${safeName}的日程`,
      handle: `${slug}-calendar`,
      avatar: '日',
      persona: '私人日程',
      accountType: 'private',
      followers: 0,
      riskNote: '共享约会、公开行程和空白时间会互相咬合。',
      isAnonymous: false,
    },
    gallery: {
      app: 'gallery',
      displayName: `${safeName}的相册`,
      handle: `${slug}-gallery`,
      avatar: '相',
      persona: '本机相册',
      accountType: 'private',
      followers: 0,
      riskNote: '照片元数据、背景反光和截图缓存都可能成为证据。',
      isAnonymous: false,
    },
    notes: {
      app: 'notes',
      displayName: `${safeName}的备忘录`,
      handle: `${slug}-notes`,
      avatar: '记',
      persona: '秘密计划本',
      accountType: 'private',
      followers: 0,
      riskNote: '秘密线索和自救计划都会写在这里。',
      isAnonymous: false,
    },
    health: {
      app: 'health',
      displayName: `${safeName}的状态`,
      handle: `${slug}-health`,
      avatar: '心',
      persona: '压力记录',
      accountType: 'private',
      followers: 0,
      riskNote: '紧张感会反过来影响冲动选择。',
      isAnonymous: false,
    },
  }
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

function balancedSecrecyDelta(current: number, value: number): number {
  if (value >= 0) return value
  const ratio = current < 35 ? 0.45 : 0.65
  return Math.max(-8, Math.ceil(value * ratio))
}

function currentRound(state: GameState): number {
  return (state.week - 1) * 7 + state.day
}

function timeOfDayFromHour(hour: number): GameState['timeOfDay'] {
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  if (hour < 22) return 'evening'
  return 'night'
}

function actionTimeCost(actionId: string): number {
  if (actionId.includes('call')) return 2
  if (actionId.includes('search') || actionId.includes('delete')) return 1
  if (actionId.includes('crisis')) return 4
  if (actionId.includes('offline')) return 6
  if (actionId.includes('meet')) return 6
  return 3
}

const socialAngles = {
  weverseLight: [
    { title: '요즘 분위기 좀 달라졌나?', author: 'soft_briize', content: (s: GameState) => `${s.maleLead.stageName}最近状态有点不一样，是不是心情很好？评论区一半在嗑糖，一半在说别乱猜。` },
    { title: '오늘 표정 왜 이렇게 풀렸어?', author: 'stage_mood_zip', content: (s: GameState) => `今天舞台结束那个低头笑真的不像营业。有人说是累了，有人说是想到谁了。` },
    { title: '친구들아 이거 과몰입이야?', author: 'late_night_soft', content: (s: GameState) => `我知道可能是我脑补，但${s.maleLead.stageName}最近看手机的频率真的变高了。` },
    { title: '그냥 행복해 보이면 된 거 아냐', author: 'protective_briize', content: (s: GameState) => `不管是不是有事，至少他看起来比前阵子轻松。别急着扒，先让人喘口气吧。` },
  ],
  weverseHard: [
    { title: '오늘도 타임라인 이상한 부분 정리', author: 'timeline_hunter', content: (s: GameState) => `粉丝把今天的公开行程、上线时间和疑似同款重新拼了一遍。还没有实锤，但讨论已经开始变得具体。` },
    { title: '같은 장소 다른 시간? 정리해봄', author: 'map_archive', content: (s: GameState) => `地点不是重点，重点是两个账号的空白时间刚好卡在一起。评论区已经有人开始找路透。` },
    { title: '삭제가 제일 수상한데', author: 'screenshot_keeper', content: (s: GameState) => `最奇怪的是删得太快。截图还在，时间也在，删了反而说明有人提醒过。` },
    { title: '커플템 의심 모음', author: 'same_item_zip', content: (s: GameState) => `同款不止一个：配饰、饮料、拍照角度，还有直播里一闪而过的颜色。单看都没事，放一起就很妙。` },
    { title: '목격담 뜬 거 봤어?', author: 'witness_board', content: (s: GameState) => `有人说在非公开动线附近看到${s.maleLead.stageName}，不保真，但时间点和今天行程空白对得上。` },
  ],
  naver: [
    { title: (s: GameState) => `${s.maleLead.stageName} 관련 커뮤니티 글 확산`, summary: (s: GameState) => `粉丝社区的整理帖开始扩散，关键词包括“同款”“时间线”“非公开行程”。所属社暂未正式回应。`, source: '온라인 이슈' },
    { title: (s: GameState) => `${s.maleLead.stageName}, 실시간 검색어 재진입`, summary: (s: GameState) => `相关搜索词重新进入榜单，部分网友认为只是粉丝过度解读，也有人要求公司说明。`, source: '실시간 트렌드' },
    { title: (s: GameState) => `아이돌 사생활 논쟁 재점화`, summary: (s: GameState) => `围绕偶像私生活与粉丝知情权的讨论升温，事件焦点仍是几条未被证实的时间线。`, source: '엔터토픽' },
    { title: (s: GameState) => `${s.maleLead.stageName} 팬덤 내부 의견 갈려`, summary: (s: GameState) => `应援粉、理智粉、考古粉和路人围绕疑似恋爱线索出现分歧，社区热度继续上升。`, source: '팬덤뷰' },
  ],
  dispatch: [
    (s: GameState) => `疑似私生账号开始蹲守${s.maleLead.stageName}常出现的路线，正在交叉比对车牌和时间。`,
    (s: GameState) => `D社线索板出现新标签：深夜动线、同款配饰、后台目击，暂缺正脸。`,
    (s: GameState) => `有人向爆料箱提交模糊背影照，地点靠近非公开通道，正在等待第二张图。`,
    (s: GameState) => `狗仔开始盯公开行程后的空白两小时，重点比对停车场和宿舍附近。`,
  ],
}

function pickUnused<T extends { title?: string | ((state: GameState) => string) }>(items: T[], state: GameState, existingTitles: string[]): T {
  const unused = items.filter((item) => {
    const title = typeof item.title === 'function' ? item.title(state) : item.title
    return !title || !existingTitles.includes(title)
  })
  const pool = unused.length ? unused : items
  return pool[currentRound(state) % pool.length]
}

function applyDailyStatChanges(state: GameState, changes: Record<string, number>): GameState {
  let next = { ...state }
  for (const [key, value] of Object.entries(changes)) {
    if (!value) continue
    if (key === 'affection') next = { ...next, maleLead: { ...next.maleLead, affection: clamp(next.maleLead.affection + value) } }
    else if (key === 'trust') next = { ...next, maleLead: { ...next.maleLead, trust: clamp(next.maleLead.trust + value) } }
    else if (key === 'careerPressure') next = { ...next, maleLead: { ...next.maleLead, careerPressure: clamp(next.maleLead.careerPressure + value) } }
    else if (key === 'mood') next = { ...next, player: { ...next.player, mood: clamp(next.player.mood + value) } }
    else if (key === 'money') next = { ...next, player: { ...next.player, money: Math.max(0, next.player.money + value) } }
    else if (key === 'lifeStability') next = { ...next, player: { ...next.player, lifeStability: clamp(next.player.lifeStability + value) } }
    else if (key === 'popularity') next = { ...next, player: { ...next.player, popularity: clamp(next.player.popularity + value) } }
    else if (key in next.risk) {
      const riskKey = key as keyof GameState['risk']
      const delta = riskKey === 'secrecy' ? balancedSecrecyDelta(next.risk.secrecy, value) : value
      next = { ...next, risk: { ...next.risk, [key]: riskKey === 'evidenceCount' ? Math.max(0, next.risk.evidenceCount + value) : clamp((next.risk[riskKey] as number) + delta) } }
    }
    else if (key === 'stress' || key === 'anxiety') next = { ...next, health: { ...next.health, stress: clamp(next.health.stress + value) } }
    else if (key === 'mentalHealth') next = { ...next, health: { ...next.health, mentalHealth: clamp(next.health.mentalHealth + value) } }
    else if (key === 'sleep') next = { ...next, health: { ...next.health, sleep: clamp(next.health.sleep + value) } }
    else if (key in next.hiddenRisk) next = { ...next, hiddenRisk: { ...next.hiddenRisk, [key]: clamp(next.hiddenRisk[key as keyof GameState['hiddenRisk']] + value) } }
  }
  return next
}

type ConflictKind = 'weverse' | 'naver' | 'company' | 'dispatch' | 'boyfriend_message' | 'bestie_message'

interface ConflictBeat {
  id: string
  kind: ConflictKind
  focus?: PlotPreference[]
  condition?: (state: GameState) => boolean
  title: (state: GameState) => string
  content: (state: GameState) => string
  author?: string | ((state: GameState) => string)
  postType?: GameState['weverse']['posts'][number]['type']
  noticeLevel?: GameState['companyNotice']['notices'][number]['level']
  dispatchType?: GameState['dispatch']['tips'][number]['type']
  urgency: Notification['urgency']
  statChanges: Record<string, number>
  notificationTitle?: (state: GameState) => string
  notificationContent?: (state: GameState) => string
}

const conflictBeats: ConflictBeat[] = [
  {
    id: 'fan_sugar_soft',
    kind: 'weverse',
    focus: ['A', 'C'],
    postType: 'sugar',
    author: '深夜嗑糖号',
    title: (s) => `【嫂子文学】${s.maleLead.stageName}今天那个低头笑到底给谁看`,
    content: (s) => `采访里有人提到“最近心情很好”，${s.maleLead.stageName}突然低头笑了一下。评论区一半在说别脑补，一半已经开始写同人了。你知道她们没猜全，但猜到一点点就很刺激。`,
    urgency: 'medium',
    statChanges: { fanSuspicion: 5, publicHeat: 2, lovestagramScore: 5, affection: 1 },
    notificationTitle: () => '粉丝开始嗑你们的暗线',
    notificationContent: () => '还只是糖帖，但有人开始把他的笑和你的动态放在一起看。',
  },
  {
    id: 'timeline_stitch',
    kind: 'weverse',
    focus: ['B', 'C'],
    postType: 'analysis',
    author: '时间线考古组',
    title: (s) => `【时间线】${s.maleLead.stageName}昨晚空白两小时和某账号上线重合`,
    content: () => '有人把直播结束、保姆车离场、疑似小号上线、便利店小票时间全部拼在一起。没有锤，但评论区已经从“别造谣”变成“这个点也太巧了”。',
    urgency: 'high',
    statChanges: { fanSuspicion: 8, publicHeat: 4, timelineOverlap: 8, evidenceCount: 1 },
    notificationTitle: () => '粉圈时间线更新',
    notificationContent: () => '考古帖开始具体到时间点，你们的空白被拿出来反复看。',
  },
  {
    id: 'company_route_check',
    kind: 'company',
    focus: ['D', 'C'],
    noticeLevel: 'warning',
    title: () => '非公开动线核查',
    content: (s) => `经纪组开始复盘${s.maleLead.stageName}今日录制后动线，重点核对后台访客证、停车场出口和工作人员陪同名单。`,
    urgency: 'high',
    statChanges: { companyAlert: 8, careerPressure: 5, secrecy: -4, insiderLeakRisk: 4 },
    notificationTitle: () => '公司开始查动线',
    notificationContent: () => '这不是粉丝猜测，是公司风控真的动了。',
  },
  {
    id: 'dispatch_shadow',
    kind: 'dispatch',
    focus: ['B', 'D'],
    dispatchType: 'clue',
    title: () => '狗仔线索板刷新',
    content: (s) => `爆料箱出现新关键词：${s.maleLead.stageName}、深夜动线、同款配饰、非公开通道。暂时没有正脸，但已经有人在等第二张图。`,
    urgency: 'high',
    statChanges: { paparazziAttention: 8, paparazziHeat: 8, stress: 3, publicHeat: 2 },
    notificationTitle: () => '狗仔开始盯空白时间',
    notificationContent: () => '他们还没有锤，但已经知道该盯哪里了。',
  },
  {
    id: 'boyfriend_almost_slip',
    kind: 'boyfriend_message',
    focus: ['A', 'C'],
    title: (s) => `${s.maleLead.name}差点发错`,
    content: () => '刚才差点把那张发出去。你是不是故意让我一直想你？别回太快，先装作我们什么都没有。',
    urgency: 'medium',
    statChanges: { affection: 4, possessiveness: 3, secrecy: -3, lovestagramScore: 4 },
    notificationTitle: (s) => `${s.maleLead.name}撤回边缘`,
    notificationContent: () => '他想藏，又忍不住想让你知道自己被偏爱。',
  },
  {
    id: 'bestie_warning',
    kind: 'bestie_message',
    focus: ['B', 'D'],
    title: (s) => `${s.player.bestieName || '闺蜜'}发来提醒`,
    content: () => '我刷到一个帖子，里面截图虽然糊，但地点和时间太像了。你别先爽，先告诉我那天你到底有没有和他见面。',
    urgency: 'high',
    statChanges: { fanSuspicion: 3, companyAlert: 2, stress: 4, mood: -2 },
    notificationTitle: () => '闺蜜发现粉圈异动',
    notificationContent: () => '她比你冷静，也更知道这件事哪里危险。',
  },
  {
    id: 'same_item_spread',
    kind: 'weverse',
    focus: ['B', 'C'],
    postType: 'timeline',
    author: '同款雷达',
    title: (s) => `【同款】${s.maleLead.stageName}今天的配饰和某人照片里的一样`,
    content: () => '单看是巧合，放在一起就是故事：同款手链、同色帽子、相似拍照角度，还有一个几乎重合的深夜上线时间。',
    urgency: 'high',
    statChanges: { fanSuspicion: 10, coupleItemScore: 9, publicHeat: 4, evidenceCount: 1 },
    notificationTitle: () => '同款帖开始扩散',
    notificationContent: () => '粉丝最会看细节，而你们偏偏留下了细节。',
  },
  {
    id: 'staff_gossip',
    kind: 'company',
    focus: ['D', 'C'],
    noticeLevel: 'summon',
    title: () => '后台访客名单异常',
    content: (s) => `工作人员群里有人问${s.maleLead.stageName}录制后是否临时改过休息室路线。语气很轻，但经纪组已经把那条消息置顶了。`,
    urgency: 'high',
    statChanges: { companyAlert: 9, careerPressure: 6, insiderLeakRisk: 8, secrecy: -5 },
    notificationTitle: () => '工作人员开始传话',
    notificationContent: () => '公司内部的风比粉圈更快，也更冷。',
  },
  {
    id: 'deleted_story_screen',
    kind: 'weverse',
    focus: ['C', 'B'],
    postType: 'analysis',
    author: '截图保存员',
    title: () => '【删了更怪】刚才那条Story到底是谁拍的',
    content: (s) => `${s.maleLead.stageName}的Story秒删之后，截图已经在小群里转了三轮。画面里没有你，但玻璃反光和背景音乐都被拿出来逐帧看。`,
    urgency: 'high',
    statChanges: { fanSuspicion: 9, lovestagramScore: 7, publicHeat: 5, evidenceCount: 1 },
    notificationTitle: () => '秒删截图被保存',
    notificationContent: () => '删除没有让事情消失，只让它更像证据。',
  },
  {
    id: 'fanwar_cover',
    kind: 'naver',
    focus: ['C'],
    condition: (s) => s.risk.publicHeat >= 18 || s.risk.fanSuspicion >= 24,
    title: (s) => `${s.maleLead.stageName}恋爱线索引发粉圈分裂`,
    content: () => '应援粉、理智粉、考古粉和看热闹的路人开始互相攻击。有人说这是恶意剪辑，也有人说公司越沉默越像默认。',
    urgency: 'high',
    statChanges: { publicHeat: 8, fanSuspicion: 5, rumorCredibility: 5, mood: 2 },
    notificationTitle: () => '舆论开始出圈',
    notificationContent: () => '粉丝越吵，热度越高，你越能感觉到自己站在风口。',
  },
  {
    id: 'boyfriend_public_impulse',
    kind: 'boyfriend_message',
    focus: ['A', 'C'],
    condition: (s) => s.maleLead.affection >= 35,
    title: (s) => `${s.maleLead.name}的占有欲`,
    content: () => '有时候真的想直接说你是我的。算了，我知道不能说。今晚见面的时候你补偿我一下。',
    urgency: 'medium',
    statChanges: { affection: 5, possessiveness: 5, companyAlert: 2, secrecy: -4 },
    notificationTitle: (s) => `${s.maleLead.name}想公开又忍住了`,
    notificationContent: () => '越不能说，越像把关系捂在掌心里发烫。',
  },
  {
    id: 'private_like_slip',
    kind: 'dispatch',
    focus: ['B'],
    title: () => '小号点赞轨迹异常',
    content: (s) => `线索板有人记录到一个长期关注${s.maleLead.stageName}相关帖的小号，点赞时间总和某私人账号高度重合。还不是证据，但足够让人继续挖。`,
    urgency: 'medium',
    statChanges: { lovestagramScore: 6, fanSuspicion: 6, paparazziAttention: 4, rumorCredibility: 4 },
    notificationTitle: () => '小号轨迹被盯上',
    notificationContent: () => '你越想匿名，越会留下另一种规律。',
  },
]

function conflictPressure(state: GameState): number {
  const pace = {
    slow_burn: -0.05,
    standard: 0.12,
    high_pressure: 0.3,
    growth: 0.06,
    ensemble: 0.16,
  }[state.player.storyPace]
  const plot = {
    A: 0.08,
    B: 0.18,
    C: 0.26,
    D: 0.2,
  }[state.player.plotPreference]
  const fan = state.player.fanLevel === 'hard_fan' || state.player.fanLevel === 'solo_stan'
    ? 0.12
    : state.player.fanLevel === 'returning'
      ? 0.08
      : 0
  const risk = (state.risk.fanSuspicion + state.risk.companyAlert + state.risk.publicHeat + state.risk.paparazziAttention) / 400 * 0.26
  return Math.min(0.96, 0.38 + pace + plot + fan + risk)
}

function conflictBeatCount(state: GameState): number {
  const pressure = conflictPressure(state)
  let count = 1
  if (currentRound(state) > 7 && Math.random() < pressure * 0.55) count += 1
  if ((state.player.storyPace === 'high_pressure' || state.player.plotPreference === 'C') && Math.random() < pressure * 0.45) count += 1
  if (state.risk.fanSuspicion > 65 && state.risk.companyAlert > 50 && Math.random() < 0.25) count += 1
  return Math.min(3, count)
}

function pickConflictBeat(state: GameState, usedIds: Set<string>): ConflictBeat {
  let pool = conflictBeats.filter((beat) => !usedIds.has(beat.id) && (!beat.condition || beat.condition(state)))
  const focused = pool.filter((beat) => beat.focus?.includes(state.player.plotPreference))
  if (focused.length && Math.random() < 0.7) pool = focused
  if (!pool.length) pool = conflictBeats.filter((beat) => !usedIds.has(beat.id))
  if (!pool.length) pool = conflictBeats
  return pool[(currentRound(state) + Math.floor(Math.random() * pool.length)) % pool.length]
}

function appendConflictMessage(state: GameState, threadId: string, message: ChatMessage): GameState {
  return {
    ...state,
    kakaoTalk: {
      ...state.kakaoTalk,
      threads: state.kakaoTalk.threads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              unreadCount: thread.unreadCount + 1,
              lastActive: '刚刚',
              messages: [...thread.messages, message],
            }
          : thread
      ),
    },
  }
}

function materializeConflictBeat(state: GameState, beat: ConflictBeat): GameState {
  const occurredAt = Date.now()
  let next = applyDailyStatChanges(state, beat.statChanges)
  const title = beat.title(next)
  const content = beat.content(next)
  const author = typeof beat.author === 'function' ? beat.author(next) : beat.author

  if (beat.kind === 'weverse') {
    next = {
      ...next,
      weverse: {
        ...next.weverse,
        posts: [
          ...next.weverse.posts,
          {
            id: uid('wv_conflict'),
            type: beat.postType || 'analysis',
            author: author || '匿名布栗子',
            title,
            content,
            heat: clamp(34 + next.risk.fanSuspicion + next.risk.publicHeat * 0.4),
            comments: 80 + Math.floor(next.risk.fanSuspicion * 2.2),
            isPlayerAlt: false,
            relatedEvidenceIds: next.evidenceFragments.slice(-4).map((e) => e.id),
            createdAt: occurredAt,
          },
        ],
      },
    }
  } else if (beat.kind === 'naver') {
    next = {
      ...next,
      naver: {
        ...next.naver,
        news: [
          ...next.naver.news,
          {
            id: uid('nv_conflict'),
            title,
            summary: content,
            source: '娱乐热议',
            heat: clamp(38 + next.risk.publicHeat + next.risk.fanSuspicion * 0.4),
            relatedSearchWords: [next.maleLead.stageName, '恋爱线索', '粉圈争议', '公司回应'],
            createdAt: occurredAt,
          },
        ],
      },
    }
  } else if (beat.kind === 'company') {
    next = {
      ...next,
      companyNotice: {
        ...next.companyNotice,
        notices: [
          ...next.companyNotice.notices,
          {
            id: uid('cn_conflict'),
            level: beat.noticeLevel || 'warning',
            title,
            content,
            isRead: false,
            createdAt: occurredAt,
          },
        ],
      },
    }
  } else if (beat.kind === 'dispatch') {
    next = {
      ...next,
      dispatch: {
        ...next.dispatch,
        tips: [
          ...next.dispatch.tips,
          {
            id: uid('dp_conflict'),
            type: beat.dispatchType || 'clue',
            content,
            heatLevel: clamp(30 + next.risk.paparazziAttention + next.hiddenRisk.paparazziHeat),
            createdAt: occurredAt,
          },
        ],
      },
    }
  } else if (beat.kind === 'boyfriend_message') {
    next = appendConflictMessage(next, 'thread_boyfriend', {
      id: uid('msg_conflict_bf'),
      sender: 'boyfriend',
      senderName: next.maleLead.name,
      textKo: '',
      textZh: content,
      timestamp: occurredAt,
      isRead: false,
      isRecalled: false,
      emotion: 'anxious',
      category: next.risk.fanSuspicion > 55 ? 'warning' : 'sweet',
    })
  } else if (beat.kind === 'bestie_message') {
    const bestieName = next.player.bestieName || '闺蜜'
    next = appendConflictMessage(next, 'thread_bestie', {
      id: uid('msg_conflict_bestie'),
      sender: 'npc',
      senderName: bestieName,
      textKo: '',
      textZh: content,
      timestamp: occurredAt,
      isRead: false,
      isRecalled: false,
      emotion: 'anxious',
      category: 'warning',
    })
  }

  const app: AppName = beat.kind === 'weverse'
    ? 'weverse'
    : beat.kind === 'naver'
      ? 'naver'
      : beat.kind === 'company'
        ? 'companyNotice'
        : beat.kind === 'dispatch'
          ? 'dispatch'
          : 'kakaoTalk'

  return {
    ...next,
    notifications: [
      ...next.notifications,
      {
        id: uid('notif_conflict'),
        app,
        title: beat.notificationTitle ? beat.notificationTitle(next) : title,
        content: beat.notificationContent ? beat.notificationContent(next) : content,
        urgency: beat.urgency,
        isRead: false,
        createdAt: occurredAt,
      },
    ],
    history: [
      ...next.history,
      {
        id: uid('hist_conflict'),
        week: next.week,
        day: next.day,
        event: '冲突推进',
        choice: title,
        consequences: beat.statChanges,
        memoryTags: ['conflict_pulse', beat.id, beat.kind],
        createdAt: occurredAt,
      },
    ],
  }
}

function applyConflictPulse(state: GameState): GameState {
  let next = state
  const usedIds = new Set<string>()
  for (let i = 0; i < conflictBeatCount(state); i += 1) {
    const beat = pickConflictBeat(next, usedIds)
    usedIds.add(beat.id)
    next = materializeConflictBeat(next, beat)
  }
  return {
    ...next,
    fandomStage: evaluateFandomCycle(next.hiddenRisk, next.risk.evidenceCount),
    paparazziStage: evaluatePaparazziProgress(next.hiddenRisk),
  }
}

function materializeStoryEventPreview(state: GameState, event: GameEvent | null): GameState {
  if (!event) return state
  return {
    ...state,
    notifications: [
      ...state.notifications,
      {
        id: uid('notif_story'),
        app: event.type === 'company' ? 'companyNotice' : event.type === 'fan' || event.type === 'crisis' ? 'weverse' : 'notes',
        title: event.title,
        content: event.description,
        urgency: event.type === 'crisis' || event.type === 'company' || event.type === 'fan' ? 'high' : 'medium',
        isRead: false,
        createdAt: Date.now(),
      },
    ],
    notes: {
      ...state.notes,
      entries: [
        ...state.notes.entries,
        {
          id: uid('note_event'),
          title: event.title,
          content: event.description,
          type: event.type === 'crisis' ? 'crisis' : 'diary',
          createdAt: Date.now(),
        },
      ],
    },
    history: [
      ...state.history,
      {
        id: uid('hist_event'),
        week: state.week,
        day: state.day,
        event: '正文节点',
        choice: event.title,
        consequences: {},
        memoryTags: [event.type, `chapter_${event.chapter || state.currentChapter}`],
        createdAt: Date.now(),
      },
    ],
  }
}

function applyDailyPulse(state: GameState): GameState {
  const fandomStage = evaluateFandomCycle(state.hiddenRisk, state.risk.evidenceCount)
  const paparazziStage = evaluatePaparazziProgress(state.hiddenRisk)
  const urgency: Notification['urgency'] = fandomStage === 'expose_post' || fandomStage === 'public_controversy' || fandomStage === 'confirmed_crisis' ? 'high' : 'medium'
  let next: GameState = {
    ...state,
    fandomStage,
    paparazziStage,
    weather: dayWeathers[Math.floor(Math.random() * dayWeathers.length)],
  }

  if (fandomStage !== 'none' || next.risk.fanSuspicion >= 28) {
    const heat = clamp(24 + next.risk.fanSuspicion + next.risk.evidenceCount * 5)
    const weversePool = fandomStage === 'familiar' ? socialAngles.weverseLight : socialAngles.weverseHard
    const weverseAngle = pickUnused(weversePool, next, next.weverse.posts.map((p) => p.title))
    next = {
      ...next,
      weverse: {
        ...next.weverse,
        posts: [
          ...next.weverse.posts,
          {
            id: uid('wv_daily'),
            type: fandomStage === 'familiar' ? 'sugar' : 'analysis',
            author: weverseAngle.author,
            title: weverseAngle.title,
            content: weverseAngle.content(next),
            heat,
            comments: 40 + Math.floor(heat * 1.8),
            isPlayerAlt: false,
            relatedEvidenceIds: next.evidenceFragments.slice(-4).map((e) => e.id),
            createdAt: Date.now(),
          },
        ],
      },
      notifications: [
        ...next.notifications,
        {
          id: uid('notif_wv_daily'),
          app: 'weverse',
          title: fandomStage === 'familiar' ? '粉丝开始眼熟你们的暗号' : '粉圈又更新了时间线',
          content: fandomStage === 'familiar' ? '讨论还很轻，但有人开始记住你的发文习惯。' : '新的分析帖出现，评论区正在互相补证据。',
          urgency,
          isRead: false,
          createdAt: Date.now(),
        },
      ],
    }
  }

  if (next.risk.publicHeat >= 42 || fandomStage === 'public_controversy' || fandomStage === 'confirmed_crisis') {
    const naverAngle = pickUnused(socialAngles.naver, next, next.naver.news.map((n) => n.title))
    next = {
      ...next,
      naver: {
        ...next.naver,
        news: [
          ...next.naver.news,
          {
            id: uid('nv_daily'),
            title: naverAngle.title(next),
            summary: naverAngle.summary(next),
            source: naverAngle.source,
            heat: clamp(35 + next.risk.publicHeat + next.risk.fanSuspicion * 0.35),
            relatedSearchWords: [next.maleLead.stageName, '열애설', '커플템', '타임라인'],
            createdAt: Date.now(),
          },
        ],
      },
      notifications: [
        ...next.notifications,
        {
          id: uid('notif_nv_daily'),
          app: 'naver',
          title: 'Naver 相关搜索上升',
          content: '相关词条开始往外扩散，粉圈内部讨论正在出圈。',
          urgency: 'high',
          isRead: false,
          createdAt: Date.now(),
        },
      ],
    }
  }

  const companyReaction = getCompanyReaction(next.risk.companyAlert, next.player.identity, fandomStage, next.week % 4 === 0)
  if (companyReaction && (next.risk.companyAlert >= 55 || Math.random() < 0.55)) {
    next = applyDailyStatChanges(next, companyReaction.statChanges)
    next = {
      ...next,
      companyNotice: {
        ...next.companyNotice,
        notices: [
          ...next.companyNotice.notices,
          {
            id: uid('cn_daily'),
            level: companyReaction.level as GameState['companyNotice']['notices'][number]['level'],
            title: 'SNS 및 사적 동선 관리',
            content: companyReaction.message,
            isRead: false,
            createdAt: Date.now(),
          },
        ],
      },
      notifications: [
        ...next.notifications,
        {
          id: uid('notif_cn_daily'),
          app: 'companyNotice',
          title: '公司风控更新',
          content: companyReaction.message,
          urgency: 'high',
          isRead: false,
          createdAt: Date.now(),
        },
      ],
    }
  }

  if (paparazziStage !== 'observing' || next.risk.paparazziAttention >= 45) {
    const dispatchContent = socialAngles.dispatch[currentRound(next) % socialAngles.dispatch.length](next)
    next = {
      ...next,
      dispatch: {
        ...next.dispatch,
        tips: [
          ...next.dispatch.tips,
          {
            id: uid('dp_daily'),
            type: paparazziStage === 'preview' || paparazziStage === 'expose' ? 'countdown' : 'clue',
            content: paparazziStage === 'preview' || paparazziStage === 'expose'
              ? `D社线索板出现倒计时：某男团成员的深夜动线已经被连续记录。`
              : dispatchContent,
            heatLevel: clamp(30 + next.risk.paparazziAttention + next.hiddenRisk.paparazziHeat),
            createdAt: Date.now(),
          },
        ],
      },
      notifications: [
        ...next.notifications,
        {
          id: uid('notif_dp_daily'),
          app: 'dispatch',
          title: '狗仔线索板有新动静',
          content: '你们的线下动线正在变得危险。',
          urgency: 'high',
          isRead: false,
          createdAt: Date.now(),
        },
      ],
    }
  }

  if (next.maleLead.affection >= 45 && Math.random() < 0.5) {
    next = {
      ...next,
      kakaoTalk: {
        ...next.kakaoTalk,
        threads: next.kakaoTalk.threads.map((thread) =>
          thread.id === 'thread_boyfriend'
            ? {
                ...thread,
                unreadCount: thread.unreadCount + 1,
                lastActive: '刚刚',
                messages: [
                  ...thread.messages,
                  {
                    id: uid('msg_daily'),
                    sender: 'boyfriend',
                    senderName: next.maleLead.name,
                    textKo: next.risk.fanSuspicion > 65 ? '오늘은 네가 먼저 연락하지 마. 내가 할게.' : '일어났어? 어제 생각나서 그냥.',
                    textZh: next.risk.fanSuspicion > 65 ? '今天你先别主动联系。我来找你。' : '醒了吗？只是突然想起昨天。',
                    timestamp: Date.now(),
                    isRead: false,
                    isRecalled: false,
                    emotion: next.risk.fanSuspicion > 65 ? 'anxious' : 'sweet',
                    category: next.risk.fanSuspicion > 65 ? 'warning' : 'sweet',
                  },
                ],
              }
            : thread
        ),
      },
      notifications: [
        ...next.notifications,
        {
          id: uid('notif_kt_daily'),
          app: 'kakaoTalk',
          title: `${next.maleLead.name}发来消息`,
          content: next.risk.fanSuspicion > 65 ? '他开始主动管理你们的联系节奏。' : '他没有忘记昨天。',
          urgency: next.risk.fanSuspicion > 65 ? 'high' : 'medium',
          isRead: false,
          createdAt: Date.now(),
        },
      ],
    }
  }

  next = applyConflictPulse(next)

  return {
    ...next,
    history: [
      ...next.history,
      {
        id: uid('hist_daily'),
        week: next.week,
        day: next.day,
        event: '每日舆论脉冲',
        choice: `粉圈:${fandomStage} 狗仔:${paparazziStage}`,
        consequences: {},
        memoryTags: ['daily_pulse', fandomStage, paparazziStage],
        createdAt: Date.now(),
      },
    ],
  }
}

const initialState: GameState = {
  phase: 'cover',
  week: 1,
  day: 1,
  hour: 8,
  timeOfDay: 'morning',
  weather: '晴',
  player: {
    name: '',
    bestieName: '',
    age: 20,
    identity: 'student',
    fanLevel: 'casual',
    storyPace: 'standard',
    plotPreference: 'A',
    money: 80,
    mood: 60,
    popularity: 10,
    lifeStability: 50,
    actionPoints: 4,
    mentalTags: []
  },
  maleLead: {
    memberId: 'shotaro',
    name: '将太郎',
    stageName: 'SHOTARO',
    affection: 15,
    trust: 20,
    careerPressure: 30,
    relationshipStage: 'stranger',
    hiddenPersona: 'true_love',
    emotionalState: 'neutral',
    memory: {
      playerAskedForPublic: 0,
      playerDeletedPhotoForHim: false,
      lastFightReason: '',
      unresolvedIssues: [],
      emotionalDebt: 0,
      promisedToMeet: false,
      playerProtectInCrisis: false,
      playerColdWarCount: 0,
      keyMemories: []
    }
  },
  risk: {
    secrecy: 80,
    companyAlert: 5,
    publicHeat: 5,
    fanSuspicion: 5,
    paparazziAttention: 5,
    evidenceCount: 0
  },
  npcs: npcTemplates.map(t => createNPCFromTemplate(t)),
  kakaoTalk: {
    threads: [],
    callLogs: []
  },
  instagram: {
    posts: [],
    stories: [],
    dms: []
  },
  pendingInstagramDraft: null,
  weverse: {
    posts: [],
    timeline: []
  },
  naver: {
    news: [],
    searchHistory: []
  },
  companyNotice: {
    notices: []
  },
  dispatch: {
    tips: []
  },
  calendar: {
    events: []
  },
  gallery: {
    photos: []
  },
  notes: {
    entries: []
  },
  health: {
    sleep: 70,
    stress: 20,
    mentalHealth: 70
  },
  eventChains: eventChains.map(ec => ({ ...ec })),
  delayedConsequences: [],
  evidenceFragments: [],
  traces: [],
  history: [],
  memoryTags: [],
  currentChapter: 1,
  narrativePhase: '起',
  relationshipStatus: 'normal',
  notifications: [],
  appAccounts: buildAppAccounts(),
  currentApp: null,
  currentChatThreadId: null,
  saves: [],
  isTyping: false,
  typingDuration: 0,
  pendingCall: null,
  showMessageBanner: null,
  hiddenRisk: {
    paparazziHeat: 0,
    lovestagramScore: 0,
    coupleItemScore: 0,
    timelineOverlap: 0,
    possessiveness: 15,
    rumorCredibility: 0,
    insiderLeakRisk: 0,
  },
  clueLedger: [],
  fandomStage: 'none' as FandomStage,
  paparazziStage: 'observing' as PaparazziStage,
  delayedEchoes: [],
  activeNarrativeTurn: null,
  narrativeLog: [],
  pendingStoryHooks: [],
}

interface GameStore extends GameState {
  setPhase: (phase: GameState['phase']) => void
  createGame: (options: {
    playerName: string
    bestieName: string
    playerAge: number
    identity: PlayerIdentity
    fanLevel: GameState['player']['fanLevel']
    storyPace: GameState['player']['storyPace']
    plotPreference: GameState['player']['plotPreference']
    memberId: RIIZEMember
    customBoyfriendName?: string
  }) => void
  advanceWeek: () => void
  advanceDay: () => void
  advanceTime: (hours: number) => void
  sendMessage: (threadId: string, textKo: string, textZh: string) => void
  receiveMessage: (threadId: string, message: ChatMessage) => void
  postInstagram: (post: InstagramPost) => void
  deleteInstagramPost: (postId: string) => void
  addNotification: (notification: Notification) => void
  markNotificationRead: (notificationId: string) => void
  openApp: (app: AppName) => void
  closeApp: () => void
  openChat: (threadId: string) => void
  updateStats: (changes: Record<string, number>) => void
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'createdAt'>) => void
  addTrace: (trace: Omit<Trace, 'id' | 'createdAt'>) => void
  addDelayedConsequence: (consequence: Omit<DelayedConsequence, 'id'>) => void
  triggerDelayedConsequences: () => void
  updateEventChain: (chainId: string, updates: Partial<EventChain>) => void
  addEvidence: (evidence: EvidenceFragment) => void
  addFanTimeline: (entry: FanTimelineEntry) => void
  updateBoyfriendMemory: (updates: Partial<GameState['maleLead']['memory']>) => void
  saveGame: (name: string) => void
  loadGame: (saveId: string) => void
  deleteSave: (saveId: string) => void
  getSaves: () => void
  setRelationshipStatus: (status: RelationshipStatus) => void
  performAction: (actionId: string, payload?: any) => string
  answerCall: () => void
  rejectCall: () => void
  dismissBanner: () => void
  triggerIncomingCall: (callerName: string, callerAvatar: string) => void
  triggerMessageBanner: (threadId: string, senderName: string, preview: string, avatar: string) => void
  deleteThread: (threadId: string) => void
  setBestieName: (name: string) => void
  triggerSocialEvent: (platform: string, trigger: string) => void
  addClue: (clue: Omit<Clue, 'id' | 'createdAt' | 'discovered' | 'linkedClueIds'>) => void
  discoverClue: (clueId: string, discoveredBy: 'fans' | 'company' | 'paparazzi') => void
  updateHiddenRisk: (changes: Partial<HiddenRisk>) => void
  evaluateFandomStage: () => FandomStage
  evaluatePaparazziStage: () => PaparazziStage
  addDelayedEcho: (echo: DelayedEcho) => void
  processDelayedEchoes: () => void
  setActiveNarrativeTurn: (turn: NarrativeTurn | null) => void
  commitNarrativeChoice: (turnId: string, choiceId: NarrativeChoiceId, nextTurn: NarrativeTurn, freeInput?: string) => void
  addPendingStoryHook: (hook: Omit<PendingStoryHook, 'id' | 'createdAt'>) => void
  clearPendingStoryHooks: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  createGame: (options) => {
    const memberData = getMemberData(options.memberId)
    const boyfriendName = options.customBoyfriendName || memberData.nameZh
    const persona = getRandomPersona(options.memberId)
    const identityData = {
      student: { money: 78, mood: 60, popularity: 10, lifeStability: 50 },
      fan: { money: 82, mood: 70, popularity: 20, lifeStability: 40 },
      intern: { money: 76, mood: 50, popularity: 15, lifeStability: 55 },
      staff: { money: 84, mood: 55, popularity: 15, lifeStability: 60 },
      stylist: { money: 80, mood: 55, popularity: 20, lifeStability: 50 },
      translator: { money: 90, mood: 50, popularity: 15, lifeStability: 65 },
      volunteer: { money: 72, mood: 65, popularity: 5, lifeStability: 55 },
      parttime: { money: 68, mood: 45, popularity: 10, lifeStability: 35 },
      custom: { money: 80, mood: 55, popularity: 10, lifeStability: 45 }
    }
    const stats = identityData[options.identity]
    const storyOpening = getIdentityStory(options.identity)
    const initialBoyfriendMessages: ChatMessage[] = []
    if (storyOpening) {
      initialBoyfriendMessages.push({
        id: `msg_${Date.now()}_bf`,
        sender: 'boyfriend',
        senderName: boyfriendName,
        textKo: storyOpening.firstMessageKo,
        textZh: storyOpening.firstMessageZh,
        timestamp: Date.now() - 60000,
        isRead: false,
        isRecalled: false,
        emotion: 'anxious',
        category: 'sweet'
      })
    }

    const initialBestieMessages: ChatMessage[] = [{
      id: `msg_${Date.now()}_bestie`,
      sender: 'npc',
      senderName: options.bestieName || '闺蜜',
      textKo: '',
      textZh: `姐妹！你和${boyfriendName}怎么样了？快跟我说说！🤭`,
      timestamp: Date.now() - 30000,
      isRead: false,
      isRecalled: false,
      emotion: 'sweet',
      category: 'sweet'
    }]

    const boyfriendThread: ChatThread = {
      id: 'thread_boyfriend',
      participantName: boyfriendName,
      participantAvatar: memberData.avatar,
      messages: initialBoyfriendMessages,
      unreadCount: initialBoyfriendMessages.filter(m => !m.isRead).length,
      isPinned: true,
      isOnline: true,
      lastActive: '刚刚',
      relationship: '暗生情愫'
    }
    const bestieThread: ChatThread = {
      id: 'thread_bestie',
      participantName: options.bestieName || '闺蜜',
      participantAvatar: '👩',
      messages: initialBestieMessages,
      unreadCount: 1,
      isPinned: false,
      isOnline: true,
      lastActive: '5分钟前',
      relationship: '闺蜜'
    }
    const socialContent = getInitialSocialContent(boyfriendName, memberData.stageName)
    const highDramaStart = options.storyPace === 'high_pressure' || options.plotPreference === 'C'
    const clueHeavyStart = options.plotPreference === 'B' || options.fanLevel === 'hard_fan' || options.fanLevel === 'solo_stan'
    const companySensitiveIdentity = options.identity === 'intern' || options.identity === 'staff' || options.identity === 'stylist' || options.identity === 'translator'
    const startingRisk = {
      secrecy: highDramaStart ? 74 : 78,
      companyAlert: companySensitiveIdentity ? 14 : 10,
      publicHeat: highDramaStart ? 12 : 8,
      fanSuspicion: clueHeavyStart ? 16 : 12,
      paparazziAttention: highDramaStart ? 12 : 8,
      evidenceCount: 0,
    }
    const startingHiddenRisk = {
      paparazziHeat: highDramaStart ? 8 : 3,
      lovestagramScore: clueHeavyStart ? 10 : 5,
      coupleItemScore: 4,
      timelineOverlap: clueHeavyStart ? 9 : 5,
      possessiveness: 18,
      rumorCredibility: highDramaStart ? 8 : 3,
      insiderLeakRisk: companySensitiveIdentity ? 9 : 4,
    }
    set({
      phase: 'playing',
      week: 1,
      day: 1,
      hour: 8,
      timeOfDay: 'morning',
      weather: '晴',
      player: {
        name: options.playerName,
        bestieName: options.bestieName || '',
        age: options.playerAge,
        identity: options.identity,
        fanLevel: options.fanLevel,
        storyPace: options.storyPace,
        plotPreference: options.plotPreference,
        money: stats.money,
        mood: stats.mood,
        popularity: stats.popularity,
        lifeStability: stats.lifeStability,
        actionPoints: 4,
        mentalTags: []
      },
      maleLead: {
        memberId: options.memberId,
        name: boyfriendName,
        stageName: memberData.stageName,
        affection: 32,
        trust: 28,
        careerPressure: 30,
        relationshipStage: 'interest',
        hiddenPersona: persona,
        emotionalState: 'neutral',
        memory: {
          playerAskedForPublic: 0,
          playerDeletedPhotoForHim: false,
          lastFightReason: '',
          unresolvedIssues: [],
          emotionalDebt: 0,
          promisedToMeet: false,
          playerProtectInCrisis: false,
          playerColdWarCount: 0,
          keyMemories: []
        }
      },
      risk: startingRisk,
      npcs: npcTemplates.map(t => createNPCFromTemplate(t)),
      kakaoTalk: {
        threads: [boyfriendThread, bestieThread],
        callLogs: []
      },
      instagram: socialContent.instagram,
      pendingInstagramDraft: null,
      weverse: socialContent.weverse,
      naver: socialContent.naver,
      companyNotice: socialContent.companyNotice,
      dispatch: socialContent.dispatch,
      appAccounts: buildAppAccounts(options.playerName, options.identity),
      notifications: generateWeekNotifications({
        ...initialState,
        player: { ...initialState.player, name: options.playerName, money: stats.money, mood: stats.mood, popularity: stats.popularity, lifeStability: stats.lifeStability },
        maleLead: {
          ...initialState.maleLead,
          memberId: options.memberId,
          name: boyfriendName,
          stageName: memberData.stageName,
          affection: 32,
          trust: 28,
          hiddenPersona: persona
        },
        risk: startingRisk,
        hiddenRisk: startingHiddenRisk,
      }),
      health: { ...initialState.health },
      calendar: { events: [] },
      gallery: { photos: [] },
      notes: { entries: [] },
      eventChains: eventChains.map(ec => ({ ...ec })),
      delayedConsequences: [],
      evidenceFragments: [],
      traces: [],
      history: [],
      memoryTags: [],
      hiddenRisk: startingHiddenRisk,
      clueLedger: [],
      fandomStage: 'none' as FandomStage,
      paparazziStage: 'observing' as PaparazziStage,
      delayedEchoes: [],
      activeNarrativeTurn: null,
      narrativeLog: [],
      pendingStoryHooks: storyOpening
        ? [{
            id: uid('hook_opening'),
            source: 'story',
            title: storyOpening.title,
            detail: `${storyOpening.coreTension} ${storyOpening.openingNarrative.slice(-2).join('')}`,
            weight: 5,
            createdAt: Date.now(),
          }]
        : [],
    })
  },

  advanceWeek: () => {
    const state = get()
    const weekEndUpdates = processWeekEnd(state)
    const newWeek = state.week + 1
    const newPhase = determineNarrativePhase(newWeek)
    const newRelationshipStage = determineRelationshipStage(state.maleLead.affection)
    const weekBase = { ...state, ...weekEndUpdates, week: newWeek, day: 1, hour: 8, timeOfDay: 'morning' as const }
    const weekStartUpdates = processWeekStart(weekBase)
    const mergedState: GameState = {
      ...weekBase,
      ...weekStartUpdates,
      player: {
        ...weekBase.player,
        ...(weekEndUpdates.player || {}),
        ...(weekStartUpdates.player || {}),
        actionPoints: 4
      },
      maleLead: {
        ...weekBase.maleLead,
        ...(weekEndUpdates.maleLead || {}),
        ...(weekStartUpdates.maleLead || {}),
        relationshipStage: newRelationshipStage
      },
      risk: {
        ...weekBase.risk,
        ...(weekEndUpdates.risk || {}),
        ...(weekStartUpdates.risk || {})
      },
      health: {
        ...weekBase.health,
        ...(weekEndUpdates.health || {}),
        ...(weekStartUpdates.health || {})
      },
      npcs: weekEndUpdates.npcs || weekBase.npcs,
      calendar: weekStartUpdates.calendar || weekBase.calendar,
      week: newWeek,
      day: 1,
      hour: 8,
      timeOfDay: 'morning',
      narrativePhase: newPhase,
      currentChapter: Math.floor(newWeek / 4) + 1
    }
    const { state: afterDelayed } = processDelayedConsequences(mergedState)
    const mainEvent = generateMainEvent(afterDelayed)
    const specialEvent = checkSpecialTriggers(afterDelayed)
    const newNotifications = generateWeekNotifications(afterDelayed)
    const fanTimeline = generateFanTimeline(afterDelayed)
    const nextState = applyDailyPulse(materializeStoryEventPreview(afterDelayed, specialEvent || mainEvent))
    set({
      ...nextState,
      week: newWeek,
      day: 1,
      timeOfDay: 'morning',
      narrativePhase: newPhase,
      player: {
        ...nextState.player,
        actionPoints: 4
      },
      maleLead: {
        ...nextState.maleLead,
        relationshipStage: newRelationshipStage
      },
      notifications: [...nextState.notifications, ...newNotifications],
      weverse: {
        ...nextState.weverse,
        timeline: fanTimeline ? [...nextState.weverse.timeline, fanTimeline] : nextState.weverse.timeline
      },
      currentChapter: Math.floor(newWeek / 4) + 1
    })
  },

  advanceDay: () => {
    const state = get()
    const newDay = state.day + 1
    if (newDay > 7) {
      get().advanceWeek()
      return
    }
    const nextDayState: GameState = {
      ...state,
      day: newDay,
      hour: 8,
      timeOfDay: 'morning',
      player: {
        ...state.player,
        actionPoints: 4
      }
    }
    const { state: afterDelayed } = processDelayedConsequences(nextDayState)
    const mainEvent = generateMainEvent(afterDelayed)
    const specialEvent = checkSpecialTriggers(afterDelayed)
    const dailyNotifications = generateWeekNotifications(afterDelayed).slice(0, 3)
    const fanTimeline = generateFanTimeline(afterDelayed)
    const nextState = applyDailyPulse(materializeStoryEventPreview(afterDelayed, specialEvent || mainEvent))
    set({
      ...nextState,
      notifications: [...nextState.notifications, ...dailyNotifications],
      weverse: {
        ...nextState.weverse,
        timeline: fanTimeline ? [...nextState.weverse.timeline, fanTimeline] : nextState.weverse.timeline
      }
    })
  },

  advanceTime: (hours) => {
    const state = get()
    const safeHours = Math.max(0, Math.floor(hours || 0))
    if (safeHours === 0) return

    const totalHour = (state.hour ?? 8) + safeHours
    const dayJumps = Math.floor(totalHour / 24)
    const nextHour = totalHour % 24

    for (let i = 0; i < dayJumps; i += 1) {
      get().advanceDay()
    }

    set({
      hour: nextHour,
      timeOfDay: timeOfDayFromHour(nextHour),
    })
  },

  sendMessage: (threadId, textKo, textZh) => {
    const state = get()
    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'player',
      senderName: state.player.name,
      textKo,
      textZh,
      timestamp: Date.now(),
      isRead: false,
      isRecalled: false,
      emotion: 'neutral'
    }
    set({
      kakaoTalk: {
        ...state.kakaoTalk,
        threads: state.kakaoTalk.threads.map(t =>
          t.id === threadId
            ? { ...t, messages: [...t.messages, message] }
            : t
        )
      },
      pendingStoryHooks: [
        ...state.pendingStoryHooks,
        {
          id: uid('hook_chat'),
          source: 'kakaoTalk' as const,
          title: threadId === 'thread_boyfriend' ? '你给他发了消息' : '你向闺蜜吐露近况',
          detail: textZh || textKo,
          weight: threadId === 'thread_boyfriend' ? 4 : 2,
          createdAt: Date.now(),
        },
      ].slice(-12),
    })
  },

  receiveMessage: (threadId, message) => {
    const state = get()
    set({
      kakaoTalk: {
        ...state.kakaoTalk,
        threads: state.kakaoTalk.threads.map(t =>
          t.id === threadId
            ? {
                ...t,
                messages: [...t.messages, message],
                unreadCount: t.unreadCount + 1
              }
            : t
        )
      }
    })
  },

  postInstagram: (post) => {
    const state = get()
    const targetList = post.contentType === 'story' ? 'stories' : 'posts'
    set({
      instagram: {
        ...state.instagram,
        [targetList]: [...state.instagram[targetList], post]
      },
      pendingStoryHooks: [
        ...state.pendingStoryHooks,
        {
          id: uid('hook_ig'),
          source: 'instagram' as const,
          title: `你发布了${post.contentType === 'story' ? 'Story' : '帖子'}`,
          detail: `${post.text} ${post.imageTags.join('/')}`,
          weight: post.riskScore > 50 ? 5 : 3,
          createdAt: Date.now(),
        },
      ].slice(-12),
    })
  },

  deleteInstagramPost: (postId) => {
    const state = get()
    set({
      instagram: {
        ...state.instagram,
        posts: state.instagram.posts.map(p =>
          p.id === postId ? { ...p, isDeleted: true } : p
        ),
        stories: state.instagram.stories.map(s =>
          s.id === postId ? { ...s, isDeleted: true } : s
        )
      },
      risk: {
        ...state.risk,
        fanSuspicion: Math.min(100, state.risk.fanSuspicion + 3)
      }
    })
  },

  addNotification: (notification) => {
    const state = get()
    set({
      notifications: [...state.notifications, notification]
    })
  },

  markNotificationRead: (notificationId) => {
    const state = get()
    set({
      notifications: state.notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    })
  },

  openApp: (app) => {
    const state = get()
    set({
      currentApp: app,
      notifications: state.notifications.map((notification) =>
        notification.app === app ? { ...notification, isRead: true } : notification
      ),
    })
  },

  closeApp: () => set({ currentApp: null }),

  openChat: (threadId) => {
    if (!threadId) {
      set({ currentChatThreadId: '' })
      return
    }
    const state = get()
    const threads = state.kakaoTalk.threads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          unreadCount: 0,
          messages: t.messages.map(m => ({ ...m, isRead: true }))
        }
      }
      return t
    })
    set({
      currentChatThreadId: threadId,
      kakaoTalk: { ...state.kakaoTalk, threads }
    })
  },

  updateStats: (changes) => {
    const state = get()
    let updated = { ...state }
    if (changes.affection !== undefined) {
      updated = { ...updated, maleLead: { ...updated.maleLead, affection: Math.max(0, Math.min(100, updated.maleLead.affection + changes.affection)) } }
    }
    if (changes.trust !== undefined) {
      updated = { ...updated, maleLead: { ...updated.maleLead, trust: Math.max(0, Math.min(100, updated.maleLead.trust + changes.trust)) } }
    }
    if (changes.mood !== undefined) {
      updated = { ...updated, player: { ...updated.player, mood: Math.max(0, Math.min(100, updated.player.mood + changes.mood)) } }
    }
    if (changes.secrecy !== undefined) {
      const delta = balancedSecrecyDelta(updated.risk.secrecy, changes.secrecy)
      updated = { ...updated, risk: { ...updated.risk, secrecy: Math.max(0, Math.min(100, updated.risk.secrecy + delta)) } }
    }
    if (changes.companyAlert !== undefined) {
      updated = { ...updated, risk: { ...updated.risk, companyAlert: Math.max(0, Math.min(100, updated.risk.companyAlert + changes.companyAlert)) } }
    }
    if (changes.fanSuspicion !== undefined) {
      updated = { ...updated, risk: { ...updated.risk, fanSuspicion: Math.max(0, Math.min(100, updated.risk.fanSuspicion + changes.fanSuspicion)) } }
    }
    if (changes.publicHeat !== undefined) {
      updated = { ...updated, risk: { ...updated.risk, publicHeat: Math.max(0, Math.min(100, updated.risk.publicHeat + changes.publicHeat)) } }
    }
    if (changes.careerPressure !== undefined) {
      updated = { ...updated, maleLead: { ...updated.maleLead, careerPressure: Math.max(0, Math.min(100, updated.maleLead.careerPressure + changes.careerPressure)) } }
    }
    if (changes.paparazziAttention !== undefined) {
      updated = { ...updated, risk: { ...updated.risk, paparazziAttention: Math.max(0, Math.min(100, updated.risk.paparazziAttention + changes.paparazziAttention)) } }
    }
    if (changes.evidenceCount !== undefined) {
      updated = { ...updated, risk: { ...updated.risk, evidenceCount: Math.max(0, updated.risk.evidenceCount + changes.evidenceCount) } }
    }
    if (changes.popularity !== undefined) {
      updated = { ...updated, player: { ...updated.player, popularity: Math.max(0, Math.min(100, updated.player.popularity + changes.popularity)) } }
    }
    if (changes.lifeStability !== undefined) {
      updated = { ...updated, player: { ...updated.player, lifeStability: Math.max(0, Math.min(100, updated.player.lifeStability + changes.lifeStability)) } }
    }
    if (changes.money !== undefined) {
      updated = { ...updated, player: { ...updated.player, money: Math.max(0, updated.player.money + changes.money) } }
    }
    if (changes.actionPoints !== undefined) {
      updated = { ...updated, player: { ...updated.player, actionPoints: Math.max(0, updated.player.actionPoints + changes.actionPoints) } }
    }
    if (changes.stress !== undefined || changes.anxiety !== undefined) {
      const delta = (changes.stress || 0) + (changes.anxiety || 0)
      updated = { ...updated, health: { ...updated.health, stress: Math.max(0, Math.min(100, updated.health.stress + delta)) } }
    }
    if (changes.mentalHealth !== undefined) {
      updated = { ...updated, health: { ...updated.health, mentalHealth: Math.max(0, Math.min(100, updated.health.mentalHealth + changes.mentalHealth)) } }
    }
    if (changes.sleep !== undefined) {
      updated = { ...updated, health: { ...updated.health, sleep: Math.max(0, Math.min(100, updated.health.sleep + changes.sleep)) } }
    }
    const hiddenRiskKeys: (keyof HiddenRisk)[] = ['paparazziHeat', 'lovestagramScore', 'coupleItemScore', 'timelineOverlap', 'possessiveness', 'rumorCredibility', 'insiderLeakRisk']
    for (const key of hiddenRiskKeys) {
      if (changes[key] !== undefined) {
        updated = {
          ...updated,
          hiddenRisk: {
            ...updated.hiddenRisk,
            [key]: Math.max(0, Math.min(100, updated.hiddenRisk[key] + changes[key])),
          },
        }
      }
    }
    updated = {
      ...updated,
      fandomStage: evaluateFandomCycle(updated.hiddenRisk, updated.risk.evidenceCount),
      paparazziStage: evaluatePaparazziProgress(updated.hiddenRisk),
    }
    set(updated)
  },

  addHistoryEntry: (entry) => {
    const state = get()
    set({
      history: [
        ...state.history,
        {
          ...entry,
          id: `hist_${Date.now()}`,
          createdAt: Date.now()
        }
      ]
    })
  },

  addTrace: (trace) => {
    const state = get()
    set({
      traces: [
        ...state.traces,
        {
          ...trace,
          id: `trace_${Date.now()}`,
          createdAt: Date.now()
        }
      ]
    })
  },

  addDelayedConsequence: (consequence) => {
    const state = get()
    set({
      delayedConsequences: [
        ...state.delayedConsequences,
        {
          ...consequence,
          id: `dc_${Date.now()}`
        }
      ]
    })
  },

  triggerDelayedConsequences: () => {
    const state = get()
    const { state: updatedState } = processDelayedConsequences(state)
    set(updatedState)
  },

  updateEventChain: (chainId, updates) => {
    const state = get()
    set({
      eventChains: state.eventChains.map(ec =>
        ec.id === chainId ? { ...ec, ...updates } : ec
      )
    })
  },

  addEvidence: (evidence) => {
    const state = get()
    set({
      evidenceFragments: [...state.evidenceFragments, evidence],
      risk: {
        ...state.risk,
        evidenceCount: state.risk.evidenceCount + 1
      }
    })
  },

  addFanTimeline: (entry) => {
    const state = get()
    set({
      weverse: {
        ...state.weverse,
        timeline: [...state.weverse.timeline, entry]
      }
    })
  },

  updateBoyfriendMemory: (updates) => {
    const state = get()
    set({
      maleLead: {
        ...state.maleLead,
        memory: {
          ...state.maleLead.memory,
          ...updates
        }
      }
    })
  },

  saveGame: (name) => {
    const state = get()
    const id = `save_${Date.now()}`
    const { saves, isTyping, typingDuration, ...gameState } = state
    const saveData = {
      id,
      name,
      timestamp: Date.now(),
      week: state.week,
      day: state.day,
      maleLeadName: state.maleLead.name,
      screenshot: '',
    }
    try {
      localStorage.setItem(`riize_save_${id}`, JSON.stringify(gameState))
      const indexRaw = localStorage.getItem('riize_saves_index')
      const index: typeof saves = indexRaw ? JSON.parse(indexRaw) : []
      if (index.length >= 10) {
        const oldest = index.shift()
        if (oldest) {
          localStorage.removeItem(`riize_save_${oldest.id}`)
        }
      }
      const updatedIndex = [...index, saveData]
      localStorage.setItem('riize_saves_index', JSON.stringify(updatedIndex))
      set({ saves: updatedIndex })
    } catch {
      set({ saves: [...state.saves, saveData] })
    }
  },

  loadGame: (saveId) => {
    try {
      const raw = localStorage.getItem(`riize_save_${saveId}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        const currentSaves = get().saves
        const normalizedBestieName = parsed.player?.bestieName === '智恩' ? '' : (parsed.player?.bestieName || '')
        const displayBestieName = normalizedBestieName || '闺蜜'
        const normalizedKakaoTalk = parsed.kakaoTalk
          ? {
              ...parsed.kakaoTalk,
              threads: parsed.kakaoTalk.threads?.map((thread: ChatThread) =>
                thread.id === 'thread_bestie'
                  ? {
                      ...thread,
                      participantName: thread.participantName === '智恩' ? displayBestieName : thread.participantName,
                      messages: thread.messages.map((message) =>
                        message.senderName === '智恩' ? { ...message, senderName: displayBestieName } : message
                      ),
                    }
                  : thread
              ) || [],
            }
          : initialState.kakaoTalk
        set({
          ...parsed,
          hour: typeof parsed.hour === 'number' ? parsed.hour : 8,
          timeOfDay: parsed.timeOfDay || timeOfDayFromHour(typeof parsed.hour === 'number' ? parsed.hour : 8),
          player: parsed.player ? { ...parsed.player, bestieName: normalizedBestieName } : initialState.player,
          kakaoTalk: normalizedKakaoTalk,
          hiddenRisk: parsed.hiddenRisk || initialState.hiddenRisk,
          pendingInstagramDraft: parsed.pendingInstagramDraft || null,
          clueLedger: parsed.clueLedger || [],
          fandomStage: parsed.fandomStage || 'none',
          paparazziStage: parsed.paparazziStage || 'observing',
          delayedEchoes: parsed.delayedEchoes || [],
          appAccounts: parsed.appAccounts || buildAppAccounts(parsed.player?.name, parsed.player?.identity),
          activeNarrativeTurn: parsed.activeNarrativeTurn || null,
          narrativeLog: parsed.narrativeLog || [],
          pendingStoryHooks: parsed.pendingStoryHooks || [],
          saves: currentSaves,
          isTyping: false,
          typingDuration: 0,
        })
      }
    } catch {}
  },

  deleteSave: (saveId) => {
    const state = get()
    try {
      localStorage.removeItem(`riize_save_${saveId}`)
      const updatedSaves = state.saves.filter((s) => s.id !== saveId)
      localStorage.setItem('riize_saves_index', JSON.stringify(updatedSaves))
      set({ saves: updatedSaves })
    } catch {}
  },

  getSaves: () => {
    try {
      const indexRaw = localStorage.getItem('riize_saves_index')
      if (indexRaw) {
        const index = JSON.parse(typeof indexRaw === 'string' ? indexRaw : '[]') as GameState['saves']
        set({ saves: index })
      }
    } catch {}
  },

  setRelationshipStatus: (status) => set({ relationshipStatus: status }),

  performAction: (actionId, payload) => {
    const state = get()
    const result = performPlayerAction(actionId, payload || {}, state)
    set({
      ...result.state,
      pendingStoryHooks: [
        ...result.state.pendingStoryHooks,
        {
          id: uid('hook_action'),
          source: 'story' as const,
          title: '你执行了行动',
          detail: result.feedback,
          weight: actionId.includes('crisis') ? 5 : 3,
          createdAt: Date.now(),
        },
      ].slice(-12),
    })
    get().advanceTime(payload?.timeCost ?? actionTimeCost(actionId))
    return result.feedback
  },

  answerCall: () => {
    const state = get()
    if (!state.pendingCall) return
    const callLog: CallLog = {
      id: `call_${Date.now()}`,
      with: state.pendingCall.callerName,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      duration: '0:00',
      status: 'answered',
      emotionalTone: 'sweet',
    }
    set({
      pendingCall: null,
      kakaoTalk: {
        ...state.kakaoTalk,
        callLogs: [callLog, ...state.kakaoTalk.callLogs],
      },
      maleLead: {
        ...state.maleLead,
        affection: Math.min(100, state.maleLead.affection + 3),
        trust: Math.min(100, state.maleLead.trust + 2),
      },
    })
  },

  rejectCall: () => {
    const state = get()
    if (!state.pendingCall) return
    const callLog: CallLog = {
      id: `call_${Date.now()}`,
      with: state.pendingCall.callerName,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      duration: '0:00',
      status: 'rejected',
      emotionalTone: 'cold',
    }
    set({
      pendingCall: null,
      kakaoTalk: {
        ...state.kakaoTalk,
        callLogs: [callLog, ...state.kakaoTalk.callLogs],
      },
      maleLead: {
        ...state.maleLead,
        affection: Math.max(0, state.maleLead.affection - 3),
      },
    })
  },

  dismissBanner: () => set({ showMessageBanner: null }),

  triggerIncomingCall: (callerName, callerAvatar) => {
    set({
      pendingCall: {
        callerName,
        callerAvatar,
        isRinging: true,
      },
    })
  },

  triggerMessageBanner: (threadId, senderName, preview, avatar) => {
    const state = get()
    if (state.currentChatThreadId === threadId) return
    set({
      showMessageBanner: {
        threadId,
        senderName,
        preview,
        avatar,
      },
    })
  },

  deleteThread: (threadId) => {
    const state = get()
    set({
      kakaoTalk: {
        ...state.kakaoTalk,
        threads: state.kakaoTalk.threads.filter((t) => t.id !== threadId),
      },
    })
  },

  setBestieName: (name) => {
    const state = get()
    set({
      player: {
        ...state.player,
        bestieName: name,
      },
      kakaoTalk: {
        ...state.kakaoTalk,
        threads: state.kakaoTalk.threads.map((t) =>
          t.id === 'thread_bestie'
            ? { ...t, participantName: name }
            : t
        ),
      },
    })
  },

  triggerSocialEvent: (platform, trigger) => {
    const state = get()
    const result = getTriggeredContent(trigger, state)
    if (!result) return
    if (result.platform === 'instagram') {
      const post = result.content as InstagramPost
      const targetList = post.contentType === 'story' ? 'stories' : 'posts'
      set({
        instagram: {
          ...state.instagram,
          [targetList]: [...state.instagram[targetList], post]
        }
      })
    } else if (result.platform === 'weverse') {
      set({
        weverse: {
          ...state.weverse,
          posts: [...state.weverse.posts, result.content]
        }
      })
    } else if (result.platform === 'naver') {
      set({
        naver: {
          ...state.naver,
          news: [...state.naver.news, result.content]
        }
      })
    } else if (result.platform === 'companyNotice') {
      set({
        companyNotice: {
          ...state.companyNotice,
          notices: [...state.companyNotice.notices, result.content]
        }
      })
    } else if (result.platform === 'dispatch') {
      set({
        dispatch: {
          ...state.dispatch,
          tips: [...state.dispatch.tips, result.content]
        }
      })
    }
  },

  addClue: (clue) => {
    const state = get()
    const newClue: Clue = {
      ...clue,
      id: `clue_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
      discovered: false,
      linkedClueIds: [],
    }
    set({ clueLedger: [...state.clueLedger, newClue] })
  },

  discoverClue: (clueId, discoveredBy) => {
    const state = get()
    set({
      clueLedger: state.clueLedger.map(c =>
        c.id === clueId ? { ...c, discovered: true, discoveredBy } : c
      ),
    })
  },

  updateHiddenRisk: (changes) => {
    const state = get()
    const updated = { ...state.hiddenRisk }
    for (const [key, value] of Object.entries(changes)) {
      if (key in updated) {
        (updated as any)[key] = Math.max(0, Math.min(100, (updated as any)[key] + value))
      }
    }
    set({ hiddenRisk: updated })
  },

  evaluateFandomStage: () => {
    const state = get()
    const hr = state.hiddenRisk
    const score = hr.lovestagramScore
      + hr.coupleItemScore * 0.8
      + hr.timelineOverlap * 0.9
      + state.risk.evidenceCount * 6
    let stage: FandomStage = 'none'
    if (score > 180) stage = 'confirmed_crisis'
    else if (score > 135) stage = 'public_controversy'
    else if (score > 95) stage = 'expose_post'
    else if (score > 55) stage = 'small_talk'
    else if (score > 25) stage = 'familiar'
    if (stage !== state.fandomStage) {
      set({ fandomStage: stage })
    }
    return stage
  },

  evaluatePaparazziStage: () => {
    const state = get()
    const ph = state.hiddenRisk.paparazziHeat
    const to = state.hiddenRisk.timelineOverlap
    let stage: PaparazziStage = 'observing'
    if (ph >= 90) stage = 'expose'
    else if (ph >= 75) stage = 'preview'
    else if (ph >= 50 && to >= 30) stage = 'cross_referencing'
    else if (ph >= 30 && to >= 30) stage = 'following'
    if (stage !== state.paparazziStage) {
      set({ paparazziStage: stage })
    }
    return stage
  },

  addDelayedEcho: (echo) => {
    const state = get()
    set({ delayedEchoes: [...state.delayedEchoes, echo] })
  },

  processDelayedEchoes: () => {
    const state = get()
    const currentDay = (state.week - 1) * 7 + state.day
    const updated = state.delayedEchoes.map(e => {
      if (e.triggered) return e
      const echoDay = Math.floor(currentDay)
      if (echoDay >= e.afterDays) {
        return { ...e, triggered: true }
      }
      return e
    })
    set({ delayedEchoes: updated })
  },

  setActiveNarrativeTurn: (turn) => {
    set({ activeNarrativeTurn: turn })
  },

  commitNarrativeChoice: (turnId, choiceId, nextTurn, freeInput) => {
    const before = get()
    const turn = before.activeNarrativeTurn?.id === turnId
      ? before.activeNarrativeTurn
      : before.narrativeLog.find((item) => item.id === turnId)
    const choice = turn?.choices.find((item) => item.id === choiceId)
    if (choice) {
      get().updateStats(choice.statChanges)
      get().advanceTime(choice.timeCost || 2)
    }

    const state = get()
    const resolvedTurn: NarrativeTurn | null = turn
      ? { ...turn, status: 'resolved', resolvedChoiceId: choiceId }
      : null
    const riskRaised = Boolean(choice && ((choice.statChanges.fanSuspicion || 0) > 0 || (choice.statChanges.publicHeat || 0) > 0 || (choice.statChanges.companyAlert || 0) > 0))
    const relationshipRaised = Boolean(choice && ((choice.statChanges.affection || 0) > 0 || (choice.statChanges.trust || 0) > 0))
    const historyChoice = choiceId === 'D' && freeInput ? freeInput : choice?.text || `选项 ${choiceId}`
    const createdAt = Date.now()
    const appEcho = nextTurn.bodyLines[0] || nextTurn.title

    set({
      activeNarrativeTurn: nextTurn,
      narrativeLog: [
        ...state.narrativeLog,
        ...(resolvedTurn ? [resolvedTurn] : []),
        nextTurn,
      ].slice(-40),
      pendingStoryHooks: state.pendingStoryHooks.slice(-8),
      ...(riskRaised
        ? {
            weverse: {
              ...state.weverse,
              posts: [
                ...state.weverse.posts,
                {
                  id: uid('wv_narrative'),
                  type: 'analysis' as const,
                  author: 'timeline_room',
                  title: '방금 흐름 바뀐 거 봤어?',
                  content: appEcho,
                  heat: Math.min(100, 32 + state.risk.fanSuspicion + state.risk.publicHeat),
                  comments: 40 + Math.floor(state.risk.fanSuspicion * 1.5),
                  isPlayerAlt: false,
                  relatedEvidenceIds: state.evidenceFragments.slice(-3).map((item) => item.id),
                  createdAt,
                },
              ],
            },
          }
        : {}),
      ...(relationshipRaised
        ? {
            kakaoTalk: {
              ...state.kakaoTalk,
              threads: state.kakaoTalk.threads.map((thread) =>
                thread.id === 'thread_boyfriend'
                  ? {
                      ...thread,
                      unreadCount: thread.unreadCount + 1,
                      lastActive: '刚刚',
                      messages: [
                        ...thread.messages,
                        {
                          id: uid('msg_narrative'),
                          sender: 'boyfriend' as const,
                          senderName: state.maleLead.name,
                          textKo: '',
                          textZh: appEcho.length > 80 ? `${appEcho.slice(0, 78)}…` : appEcho,
                          timestamp: createdAt,
                          isRead: false,
                          isRecalled: false,
                          emotion: 'sweet' as const,
                          category: 'sweet' as const,
                        },
                      ],
                    }
                  : thread
              ),
            },
          }
        : {}),
      notifications: [
        ...state.notifications,
        {
          id: uid('notif_narrative'),
          app: riskRaised ? 'weverse' : relationshipRaised ? 'kakaoTalk' : 'notes',
          title: riskRaised ? '余波开始发酵' : relationshipRaised ? '关系推进' : '正文已推进',
          content: nextTurn.bodyLines[0] || nextTurn.title,
          urgency: riskRaised ? 'medium' : 'low',
          isRead: false,
          createdAt,
        },
      ],
      history: [
        ...state.history,
        {
          id: uid('hist_narrative'),
          week: state.week,
          day: state.day,
          event: turn?.title || '正文推进',
          choice: historyChoice,
          consequences: choice?.statChanges || {},
          memoryTags: ['narrative_choice', `choice_${choiceId}`, ...nextTurn.memoryTags],
          createdAt,
        },
      ],
    })
  },

  addPendingStoryHook: (hook) => {
    const state = get()
    set({
      pendingStoryHooks: [
        ...state.pendingStoryHooks,
        {
          ...hook,
          id: uid('hook'),
          createdAt: Date.now(),
        },
      ].slice(-12),
    })
  },

  clearPendingStoryHooks: () => set({ pendingStoryHooks: [] }),
}))
