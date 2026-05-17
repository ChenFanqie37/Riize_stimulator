import type { Clue, ClueType, ClueVisibleTo, HiddenRisk, FandomStage, PaparazziStage, AppName } from '../types/game'

const locationKeywords: Record<string, string[]> = {
  'hanriver': ['汉江', '한강', '江边', '河边', '桥'],
  'gangnam': ['江南', '강남', '清潭', '驿三'],
  'hongdae': ['弘大', '홍대', '合井'],
  'itaewon': ['梨泰院', '이태원'],
  'practice_room': ['练习室', '연습실', '公司', '소속사'],
  'airport': ['机场', '공항', '仁川', '김포'],
  'hotel': ['酒店', '호텔', '旅馆'],
  'convenience_store': ['便利店', '편의점', 'CU', 'GS25'],
  'cafe': ['咖啡', '카페', '咖啡厅'],
}

const itemKeywords: Record<string, string[]> = {
  'earphones': ['耳机', '이어폰', 'AirPods'],
  'ring': ['戒指', '반지', '指环'],
  'hoodie': ['帽衫', '후드', '卫衣', '连帽'],
  'cup': ['杯子', '컵', '咖啡杯', '杯套'],
  'perfume': ['香水', '향수'],
  'shoes': ['鞋', '신발', '运动鞋'],
  'phone_case': ['手机壳', '폰케이스'],
  'bag': ['包', '가방', '背包'],
}

function matchKeywords(text: string, keywordMap: Record<string, string[]>): string[] {
  const matches: string[] = []
  const lower = text.toLowerCase()
  for (const [key, words] of Object.entries(keywordMap)) {
    for (const word of words) {
      if (lower.includes(word.toLowerCase())) {
        matches.push(key)
        break
      }
    }
  }
  return matches
}

export function createClueFromPost(
  postText: string,
  imageTags: string[],
  sourceApp: AppName,
  day: number,
  week: number,
  visibility: string
): Partial<Clue>[] {
  const clues: Partial<Clue>[] = []
  const locations = matchKeywords(postText, locationKeywords)
  const items = matchKeywords(postText, itemKeywords)

  if (locations.length > 0) {
    clues.push({
      day,
      week,
      sourceApp,
      clueType: 'location',
      visibleTo: visibility === 'public' ? ['fans', 'paparazzi', 'boyfriend'] as ClueVisibleTo[] : ['boyfriend'] as ClueVisibleTo[],
      tags: locations,
      severity: visibility === 'public' ? 3 : 1,
      description: `地点线索: ${locations.join(', ')}`,
    })
  }

  if (items.length > 0) {
    clues.push({
      day,
      week,
      sourceApp,
      clueType: 'item',
      visibleTo: visibility === 'public' ? ['fans', 'company', 'boyfriend'] as ClueVisibleTo[] : ['boyfriend'] as ClueVisibleTo[],
      tags: items,
      severity: visibility === 'public' ? 3 : 1,
      description: `同款线索: ${items.join(', ')}`,
    })
  }

  if (postText.length > 0 && visibility === 'public') {
    const isAmbiguous = /风|夜|想|躲|吵|安静|只有|秘密|你/.test(postText)
    if (isAmbiguous) {
      clues.push({
        day,
        week,
        sourceApp,
        clueType: 'caption',
        visibleTo: ['fans', 'boyfriend'] as ClueVisibleTo[],
        tags: ['ambiguous-caption'],
        severity: 2,
        description: `文案线索: "${postText.slice(0, 30)}"`,
      })
    }
  }

  if (imageTags.some(t => ['night', 'couple', 'selfie'].includes(t))) {
    clues.push({
      day,
      week,
      sourceApp,
      clueType: 'background',
      visibleTo: ['fans', 'paparazzi'] as ClueVisibleTo[],
      tags: imageTags.filter(t => ['night', 'couple', 'selfie'].includes(t)),
      severity: 2,
      description: `图片线索: ${imageTags.join(', ')}`,
    })
  }

  return clues
}

export function calculatePostRisk(
  postText: string,
  imageTags: string[],
  visibility: string,
  hiddenRisk: HiddenRisk
): { riskScore: number; hiddenRiskChanges: Partial<HiddenRisk> } {
  let riskScore = 0
  const changes: Partial<HiddenRisk> = {}
  const locations = matchKeywords(postText, locationKeywords)
  const items = matchKeywords(postText, itemKeywords)

  if (visibility === 'public') {
    riskScore += 20
    if (locations.length > 0) {
      riskScore += 15
      changes.timelineOverlap = 8
      changes.lovestagramScore = 6
    }
    if (items.length > 0) {
      riskScore += 12
      changes.coupleItemScore = 12
      changes.lovestagramScore = 5
    }
    if (/夜|晚|深夜|凌晨/.test(postText)) {
      riskScore += 10
      changes.paparazziHeat = 5
    }
    if (imageTags.includes('couple')) {
      riskScore += 20
      changes.lovestagramScore = 15
      changes.coupleItemScore = 10
    }
    if (imageTags.includes('selfie') && locations.length > 0) {
      riskScore += 15
      changes.timelineOverlap = 10
    }
  } else if (visibility === 'close_friends') {
    riskScore += 5
    changes.insiderLeakRisk = 3
  }

  if (hiddenRisk.lovestagramScore > 50) riskScore += 10
  if (hiddenRisk.coupleItemScore > 40) riskScore += 10
  if (hiddenRisk.timelineOverlap > 40) riskScore += 10

  riskScore = Math.min(100, riskScore)

  return { riskScore, hiddenRiskChanges: changes }
}

export function evaluateFandomCycle(hiddenRisk: HiddenRisk, evidenceCount: number): FandomStage {
  const score = hiddenRisk.lovestagramScore
    + hiddenRisk.coupleItemScore * 0.8
    + hiddenRisk.timelineOverlap * 0.9
    + evidenceCount * 6
  if (score > 180) return 'confirmed_crisis'
  if (score > 135) return 'public_controversy'
  if (score > 95) return 'expose_post'
  if (score > 55) return 'small_talk'
  if (score > 25) return 'familiar'
  return 'none'
}

export function evaluatePaparazziProgress(hiddenRisk: HiddenRisk): PaparazziStage {
  const ph = hiddenRisk.paparazziHeat
  const to = hiddenRisk.timelineOverlap
  if (ph >= 90) return 'expose'
  if (ph >= 75) return 'preview'
  if (ph >= 50 && to >= 30) return 'cross_referencing'
  if (ph >= 30 && to >= 30) return 'following'
  return 'observing'
}

export function getFandomStageLabel(stage: FandomStage): string {
  const labels: Record<FandomStage, string> = {
    none: '无感',
    familiar: '眼熟',
    small_talk: '小范围讨论',
    expose_post: '扒皮长帖',
    public_controversy: '出圈争议',
    confirmed_crisis: '实锤危机',
  }
  return labels[stage]
}

export function getPaparazziStageLabel(stage: PaparazziStage): string {
  const labels: Record<PaparazziStage, string> = {
    observing: '观察中',
    following: '跟踪',
    cross_referencing: '交叉验证',
    preview: '预告',
    expose: '爆料',
  }
  return labels[stage]
}

export function getCompanyReaction(
  companyAlert: number,
  playerIdentity: string,
  fandomStage: FandomStage,
  isComebackWeek: boolean
): { level: string; message: string; statChanges: Record<string, number> } | null {
  if (companyAlert < 40) return null

  if (isComebackWeek && companyAlert > 50) {
    return {
      level: 'warning',
      message: '回归期不要出事。所有非公开行程暂停接触，手机由经纪人代管。',
      statChanges: { companyAlert: 10, careerPressure: 15 },
    }
  }

  if (companyAlert > 85) {
    return {
      level: 'silence',
      message: '紧急措施：暂停一切私人联系。这不是惩罚，是保护。',
      statChanges: { companyAlert: 5, secrecy: -10, mood: -15 },
    }
  }

  if (companyAlert > 70) {
    return {
      level: 'summon',
      message: '明天来公司一趟。带上你的手机和通行证。',
      statChanges: { companyAlert: 5, lifeStability: -10 },
    }
  }

  if (fandomStage === 'small_talk' || fandomStage === 'expose_post') {
    return {
      level: 'gentle',
      message: '不是不相信你，是这里每个人都可能被拍。注意一下。',
      statChanges: { companyAlert: 10, secrecy: -5 },
    }
  }

  if (playerIdentity === 'staff' || playerIdentity === 'stylist' || playerIdentity === 'intern') {
    return {
      level: 'contract',
      message: '你的保密协议第7条，需要我再念一遍吗？',
      statChanges: { companyAlert: 8, lifeStability: -8 },
    }
  }

  return {
    level: 'warning',
    message: '最近注意一下公开场合的行为。品牌合约在谈，不要节外生枝。',
    statChanges: { companyAlert: 5 },
  }
}

export const dateLocationRisks: Record<string, {
  sweetness: number
  cctvRisk: number
  fanDensity: number
  companySensitivity: number
  paparazziRisk: number
  description: string
}> = {
  practice_room_back: {
    sweetness: 60,
    cctvRisk: 70,
    fanDensity: 20,
    companySensitivity: 90,
    paparazziRisk: 30,
    description: '练习室后门十分钟',
  },
  convenience_store: {
    sweetness: 50,
    cctvRisk: 80,
    fanDensity: 30,
    companySensitivity: 40,
    paparazziRisk: 40,
    description: '深夜便利店',
  },
  car: {
    sweetness: 70,
    cctvRisk: 40,
    fanDensity: 10,
    companySensitivity: 60,
    paparazziRisk: 60,
    description: '车内短暂停留',
  },
  hanriver: {
    sweetness: 75,
    cctvRisk: 30,
    fanDensity: 50,
    companySensitivity: 50,
    paparazziRisk: 50,
    description: '汉江散步',
  },
  overseas_transit: {
    sweetness: 80,
    cctvRisk: 50,
    fanDensity: 40,
    companySensitivity: 70,
    paparazziRisk: 70,
    description: '海外转机一小时',
  },
  hotel: {
    sweetness: 90,
    cctvRisk: 60,
    fanDensity: 20,
    companySensitivity: 95,
    paparazziRisk: 80,
    description: '酒店房间',
  },
  cafe: {
    sweetness: 55,
    cctvRisk: 50,
    fanDensity: 60,
    companySensitivity: 30,
    paparazziRisk: 35,
    description: '咖啡厅',
  },
  movie: {
    sweetness: 60,
    cctvRisk: 40,
    fanDensity: 40,
    companySensitivity: 35,
    paparazziRisk: 45,
    description: '深夜电影',
  },
}

export const enhancedEvents = [
  {
    id: 'ig_hanriver_wind_001',
    title: '今天风很大',
    trigger: { app: 'Instagram', action: 'post_story', tags: ['night', 'hanriver'] },
    clues: [
      { clueType: 'location' as ClueType, tags: ['HanRiver'], severity: 2 as const, visibleTo: ['fans', 'paparazzi'] as ClueVisibleTo[] },
      { clueType: 'caption' as ClueType, tags: ['wind', 'ambiguous'], severity: 1 as const, visibleTo: ['fans', 'boyfriend'] as ClueVisibleTo[] },
    ],
    immediateEffects: { lovestagramScore: 8, timelineOverlap: 6 },
    delayedEchoes: [
      { afterDays: 1, app: 'KakaoTalk', eventId: 'boyfriend_warns_delete_story' },
      { afterDays: 3, app: 'Weverse', eventId: 'fans_notice_wind_phrase' },
      { afterDays: 7, app: 'Dispatch', eventId: 'route_abnormal_preview', condition: 'paparazziHeat > 50' },
    ],
  },
  {
    id: 'same_item_earphones_002',
    title: '同款耳机',
    trigger: { app: 'Instagram', action: 'post_photo', tags: ['earphones', 'selfie'] },
    clues: [
      { clueType: 'item' as ClueType, tags: ['earphones', 'couple-item'], severity: 3 as const, visibleTo: ['fans', 'company'] as ClueVisibleTo[] },
    ],
    immediateEffects: { coupleItemScore: 15, fandomSuspicion: 8 },
    delayedEchoes: [
      { afterDays: 2, app: 'Weverse', eventId: 'same_item_thread' },
      { afterDays: 4, app: 'CompanyNotice', eventId: 'stylist_warns_accessory' },
    ],
  },
  {
    id: 'late_night_emotional_003',
    title: '深夜情绪发文',
    trigger: { app: 'Instagram', action: 'post_story', tags: ['night', 'mood'] },
    clues: [
      { clueType: 'caption' as ClueType, tags: ['emotional', 'late-night'], severity: 2 as const, visibleTo: ['fans', 'boyfriend'] as ClueVisibleTo[] },
    ],
    immediateEffects: { lovestagramScore: 5, possessiveness: 5 },
    delayedEchoes: [
      { afterDays: 1, app: 'KakaoTalk', eventId: 'boyfriend_calls_instead_of_texting' },
      { afterDays: 4, app: 'Weverse', eventId: 'fans_connect_emotional_posts' },
    ],
  },
]
