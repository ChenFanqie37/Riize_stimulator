import { useState, useCallback } from 'react'
import { X, Heart, Shield, Clock, Gift, Camera, AlertTriangle, Star, ChevronRight, MapPin, Sparkles } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { GalleryPhoto, EvidenceFragment, ChatMessage } from '@/types/game'
import { TranslateText } from '../Common/TranslateText'

type DateType = 'cafe' | 'riverwalk' | 'nightdrive' | 'privatedinner' | 'movie' | 'amusement'
type DatePhase = 'request' | 'prepare' | 'execute' | 'result'
type OutfitChoice = 'casual' | 'dressup' | 'disguise'
type GiftChoice = 'none' | 'small' | 'handmade'
type TimeChoice = 'morning' | 'afternoon' | 'evening'
type SceneType = 'arrival_greeting' | 'conversation' | 'activity' | 'intimate_moment' | 'unexpected_event' | 'departure'

interface DateTypeConfig {
  id: DateType
  name: string
  icon: string
  risk: number
  affectionBonus: number
  secrecyImpact: number
  description: string
  riskLabel: string
  riskColor: string
}

interface DateScene {
  type: SceneType
  narrative: string
  boyfriendKo: string
  boyfriendZh: string
  choices: DateChoice[]
}

interface DateChoice {
  id: string
  text: string
  affection: number
  trust: number
  secrecy: number
  mood: number
  riskTag?: string
}

const dateTypes: DateTypeConfig[] = [
  {
    id: 'cafe',
    name: '咖啡厅约会',
    icon: '☕',
    risk: 1,
    affectionBonus: 5,
    secrecyImpact: -2,
    description: '安静的咖啡厅角落，低声交谈，偶尔的眼神交汇',
    riskLabel: '低风险',
    riskColor: '#22c55e',
  },
  {
    id: 'riverwalk',
    name: '江边散步',
    icon: '🌊',
    risk: 2,
    affectionBonus: 8,
    secrecyImpact: -5,
    description: '汉江边的晚风，并肩漫步，偶尔的肢体接触',
    riskLabel: '中低风险',
    riskColor: '#06b6d4',
  },
  {
    id: 'nightdrive',
    name: '深夜兜风',
    icon: '🌙',
    risk: 3,
    affectionBonus: 12,
    secrecyImpact: -3,
    description: '深夜的首尔街头，只有你们两个人的世界',
    riskLabel: '中风险',
    riskColor: '#f97316',
  },
  {
    id: 'privatedinner',
    name: '私密晚餐',
    icon: '🕯️',
    risk: 2,
    affectionBonus: 10,
    secrecyImpact: -4,
    description: '包间里的烛光晚餐，暧昧的氛围在空气中弥漫',
    riskLabel: '中低风险',
    riskColor: '#06b6d4',
  },
  {
    id: 'movie',
    name: '电影约会',
    icon: '🎬',
    risk: 3,
    affectionBonus: 7,
    secrecyImpact: -6,
    description: '黑暗中的电影院，偷偷牵着的手',
    riskLabel: '中风险',
    riskColor: '#f97316',
  },
  {
    id: 'amusement',
    name: '游乐园约会',
    icon: '🎡',
    risk: 5,
    affectionBonus: 15,
    secrecyImpact: -10,
    description: '人声鼎沸的游乐园，像普通情侣一样约会',
    riskLabel: '高风险',
    riskColor: '#ef4444',
  },
]

const outfitConfigs: Record<OutfitChoice, { label: string; affection: number; riskMod: number; desc: string }> = {
  casual: { label: '休闲装', affection: 0, riskMod: 0, desc: '舒适自然，不会引人注意' },
  dressup: { label: '精致打扮', affection: 3, riskMod: 1, desc: '精心搭配，他会注意到' },
  disguise: { label: '低调伪装', affection: -2, riskMod: -2, desc: '帽子口罩，安全第一' },
}

const giftConfigs: Record<GiftChoice, { label: string; affection: number; trust: number; fanSuspicion: number; desc: string }> = {
  none: { label: '无', affection: 0, trust: 0, fanSuspicion: 0, desc: '不带礼物' },
  small: { label: '小礼物', affection: 2, trust: 0, fanSuspicion: 5, desc: '一份小心意，被发现可能引起怀疑' },
  handmade: { label: '手工礼物', affection: 5, trust: 3, fanSuspicion: 0, desc: '亲手制作，满满心意' },
}

const timeConfigs: Record<TimeChoice, { label: string; riskMod: number; bonusMod: number; desc: string }> = {
  morning: { label: '上午', riskMod: -1, bonusMod: -2, desc: '人少安静，低风险' },
  afternoon: { label: '下午', riskMod: 0, bonusMod: 0, desc: '正常时段，中风险' },
  evening: { label: '晚上', riskMod: 2, bonusMod: 3, desc: '氛围好但风险高' },
}

const randomEvents = [
  { id: 'fan_pass', name: '粉丝路过', probability: 0.15, secrecy: -5, fanSuspicion: 8, narrative: '一个戴着应援棒的粉丝从远处走过，你们迅速分开……' },
  { id: 'recognized', name: '认出你们', probability: 0.08, secrecy: -15, fanSuspicion: 20, narrative: '有人指着你俩窃窃私语，空气瞬间凝固……' },
  { id: 'flash', name: '偷拍闪光灯', probability: 0.05, secrecy: -20, fanSuspicion: 25, narrative: '远处一道闪光灯亮起——有人偷拍！' },
  { id: 'friend_meet', name: '朋友偶遇', probability: 0.12, secrecy: -3, fanSuspicion: 2, narrative: '他的队友突然出现在同一家店，尴尬的打招呼……' },
  { id: 'company_call', name: '公司来电', probability: 0.1, secrecy: 0, fanSuspicion: 0, careerPressure: 5, narrative: '他的手机响了——经纪人来电。他的表情瞬间严肃起来……' },
]

function generateScenes(dateType: DateType): DateScene[] {
  const scenePool: Record<DateType, DateScene[]> = {
    cafe: [
      {
        type: 'arrival_greeting',
        narrative: '你推开咖啡厅的门，他已经坐在角落的位置等你了。看到你的瞬间，他的眼睛亮了起来。',
        boyfriendKo: '여기 앉아, 기다렸어.',
        boyfriendZh: '坐这里，我等你好久了。',
        choices: [
          { id: 'smile_sit', text: '微笑着坐到他身边', affection: 3, trust: 1, secrecy: -1, mood: 3 },
          { id: 'shy_wave', text: '害羞地打声招呼', affection: 1, trust: 2, secrecy: 0, mood: 1 },
          { id: 'check_surroundings', text: '先环顾四周确认安全', affection: -1, trust: -1, secrecy: 3, mood: -1 },
        ],
      },
      {
        type: 'conversation',
        narrative: '咖啡的香气弥漫在空气中，他轻轻搅动着杯子，似乎有话想说。',
        boyfriendKo: '요즘... 많이 힘들지? 나 때문에.',
        boyfriendZh: '最近……很辛苦吧？因为我。',
        choices: [
          { id: 'comfort', text: '握住他的手说"没关系"', affection: 5, trust: 3, secrecy: -2, mood: 4 },
          { id: 'honest', text: '诚实说出你的感受', affection: 2, trust: 5, secrecy: 0, mood: 1 },
          { id: 'deflect', text: '转移话题聊轻松的事', affection: -1, trust: -2, secrecy: 2, mood: 2 },
        ],
      },
      {
        type: 'intimate_moment',
        narrative: '他伸手帮你擦掉嘴角的奶油，指尖的温度让你心跳加速。',
        boyfriendKo: '바보, 여기 묻었잖아.',
        boyfriendZh: '笨蛋，这里沾到了。',
        choices: [
          { id: 'lean_closer', text: '顺势靠近他', affection: 6, trust: 2, secrecy: -3, mood: 5 },
          { id: 'pull_back', text: '害羞地躲开', affection: 2, trust: 1, secrecy: 1, mood: 2 },
          { id: 'joke', text: '开玩笑说"你故意的吧"', affection: 4, trust: 2, secrecy: 0, mood: 4 },
        ],
      },
      {
        type: 'departure',
        narrative: '咖啡厅要打烊了，他依依不舍地看着你。',
        boyfriendKo: '벌써 이렇게 됐네... 조심히 가.',
        boyfriendZh: '已经这个时间了……路上小心。',
        choices: [
          { id: 'hug_goodbye', text: '在角落里拥抱告别', affection: 5, trust: 2, secrecy: -4, mood: 4 },
          { id: 'wave_goodbye', text: '远远地挥手告别', affection: 1, trust: 1, secrecy: 2, mood: 1 },
          { id: 'next_date', text: '约定下次见面的时间', affection: 3, trust: 3, secrecy: -1, mood: 3 },
        ],
      },
    ],
    riverwalk: [
      {
        type: 'arrival_greeting',
        narrative: '汉江边的晚风轻轻吹过，他已经在约定的长椅旁等你了。',
        boyfriendKo: '왔구나. 바람 좀 춥지 않아?',
        boyfriendZh: '你来了。风有点冷吧？',
        choices: [
          { id: 'close_to_him', text: '走到他身边靠紧一点', affection: 4, trust: 2, secrecy: -2, mood: 3 },
          { id: 'say_fine', text: '说"不冷"但偷偷靠近', affection: 3, trust: 1, secrecy: -1, mood: 2 },
          { id: 'keep_distance', text: '保持距离站着', affection: -1, trust: 0, secrecy: 3, mood: -1 },
        ],
      },
      {
        type: 'activity',
        narrative: '你们沿着江边慢慢走着，路灯把两个人的影子拉得很长。',
        boyfriendKo: '이렇게 같이 걷는 거... 진짜 좋다.',
        boyfriendZh: '像这样一起散步……真的很好。',
        choices: [
          { id: 'hold_hands', text: '悄悄牵起他的手', affection: 7, trust: 3, secrecy: -5, mood: 5 },
          { id: 'link_arms', text: '挽住他的胳膊', affection: 5, trust: 2, secrecy: -4, mood: 4 },
          { id: 'walk_side', text: '只是并肩走着', affection: 1, trust: 1, secrecy: 1, mood: 2 },
        ],
      },
      {
        type: 'intimate_moment',
        narrative: '他突然停下脚步，转身看着你，月光映在他的脸上。',
        boyfriendKo: '너만 보여. 다른 건 다 필요 없어.',
        boyfriendZh: '我只看得见你。其他都不重要。',
        choices: [
          { id: 'kiss', text: '踮起脚尖吻他', affection: 10, trust: 3, secrecy: -8, mood: 8 },
          { id: 'hug', text: '扑进他怀里', affection: 7, trust: 4, secrecy: -5, mood: 6 },
          { id: 'look_away', text: '害羞地移开视线', affection: 3, trust: 2, secrecy: 0, mood: 3 },
        ],
      },
      {
        type: 'departure',
        narrative: '夜深了，江边的人渐渐散去，他送你到路口。',
        boyfriendKo: '진짜 가야 해? 좀만 더...',
        boyfriendZh: '真的要走了吗？再一会儿……',
        choices: [
          { id: 'stay_longer', text: '再待一会儿', affection: 5, trust: 2, secrecy: -3, mood: 4 },
          { id: 'reluctant_leave', text: '不舍地道别', affection: 3, trust: 2, secrecy: 1, mood: 2 },
          { id: 'promise_tomorrow', text: '说明天再联系', affection: 2, trust: 3, secrecy: 2, mood: 1 },
        ],
      },
    ],
    nightdrive: [
      {
        type: 'arrival_greeting',
        narrative: '深夜十一点，他的车停在街角。你拉开车门坐进去，仿佛进入了另一个世界。',
        boyfriendKo: '안전벨트 매. 어디 갈까?',
        boyfriendZh: '系好安全带。去哪里好呢？',
        choices: [
          { id: 'surprise_me', text: '"你决定就好，去哪都行"', affection: 3, trust: 4, secrecy: 1, mood: 3 },
          { id: 'suggest_place', text: '提议去南山塔看夜景', affection: 4, trust: 2, secrecy: -2, mood: 4 },
          { id: 'just_drive', text: '"就这样开吧，不想下车"', affection: 5, trust: 3, secrecy: 0, mood: 5 },
        ],
      },
      {
        type: 'conversation',
        narrative: '车窗外是首尔璀璨的夜景，他一只手握着方向盘，另一只手自然地搭在中央扶手上。',
        boyfriendKo: '이런 시간... 너랑 같이 있을 때 제일 편해.',
        boyfriendZh: '这样的时间……和你在一起的时候最放松。',
        choices: [
          { id: 'hold_hand', text: '把手覆在他的手上', affection: 6, trust: 3, secrecy: 0, mood: 5 },
          { id: 'lean_seat', text: '靠在副驾上看着他', affection: 4, trust: 2, secrecy: 0, mood: 4 },
          { id: 'ask_work', text: '问他最近工作的事', affection: 1, trust: 4, secrecy: 1, mood: 1 },
        ],
      },
      {
        type: 'intimate_moment',
        narrative: '车停在路边，城市安静得只剩下你们两个人的呼吸声。',
        boyfriendKo: '이 순간이 영원했으면 좋겠다.',
        boyfriendZh: '希望这个瞬间能永远持续。',
        choices: [
          { id: 'kiss_car', text: '吻上去', affection: 10, trust: 3, secrecy: -2, mood: 8 },
          { id: 'lean_forehead', text: '额头抵着额头', affection: 7, trust: 5, secrecy: 0, mood: 6 },
          { id: 'silent_moment', text: '安静地享受这一刻', affection: 4, trust: 4, secrecy: 1, mood: 5 },
        ],
      },
      {
        type: 'departure',
        narrative: '车停在你家楼下，他熄了火，不想让你走。',
        boyfriendKo: '들어가... 연락해.',
        boyfriendZh: '进去吧……记得联系我。',
        choices: [
          { id: 'reluctant_go', text: '依依不舍地下车回头看他', affection: 4, trust: 2, secrecy: 0, mood: 3 },
          { id: 'quick_goodbye', text: '快速道别快步上楼', affection: 0, trust: 1, secrecy: 2, mood: 0 },
          { id: 'window_wave', text: '上楼后在窗户向他挥手', affection: 3, trust: 2, secrecy: -1, mood: 4 },
        ],
      },
    ],
    privatedinner: [
      {
        type: 'arrival_greeting',
        narrative: '餐厅的包间灯光柔和，他已经点好了菜等你。看到你进来，他站起身。',
        boyfriendKo: '앉아. 다 네 좋아하는 거 시켰어.',
        boyfriendZh: '坐吧。都是你爱吃的。',
        choices: [
          { id: 'touched', text: '感动地说"你记得"', affection: 5, trust: 3, secrecy: 0, mood: 4 },
          { id: 'tease', text: '打趣说"这么贴心，是不是做了亏心事"', affection: 3, trust: 1, secrecy: 0, mood: 4 },
          { id: 'sit_close', text: '坐到他旁边而不是对面', affection: 4, trust: 2, secrecy: -2, mood: 3 },
        ],
      },
      {
        type: 'conversation',
        narrative: '烛光映在他的脸上，他放下筷子认真地看着你。',
        boyfriendKo: '우리... 언제까지 이렇게 숨겨야 할까?',
        boyfriendZh: '我们……要这样躲躲藏藏到什么时候？',
        choices: [
          { id: 'reassure', text: '安慰他说"总会有办法的"', affection: 3, trust: 4, secrecy: 1, mood: 2 },
          { id: 'honest_worry', text: '坦白你的担忧', affection: 1, trust: 5, secrecy: 2, mood: -1 },
          { id: 'avoid_topic', text: '岔开话题', affection: -2, trust: -3, secrecy: 3, mood: -1 },
        ],
      },
      {
        type: 'intimate_moment',
        narrative: '他隔着桌子握住了你的手，拇指轻轻摩挲着你的手背。',
        boyfriendKo: '손... 차다. 내가 따뜻하게 해줄게.',
        boyfriendZh: '手……好凉。让我给你暖暖。',
        choices: [
          { id: 'interlock', text: '十指相扣', affection: 7, trust: 3, secrecy: -2, mood: 6 },
          { id: 'pull_gently', text: '轻轻把手抽回来（怕被人看到）', affection: -2, trust: -2, secrecy: 4, mood: -1 },
          { id: 'both_hands', text: '用双手包住他的手', affection: 5, trust: 4, secrecy: -1, mood: 5 },
        ],
      },
      {
        type: 'departure',
        narrative: '晚餐结束了，他坚持要送你。',
        boyfriendKo: '문 앞까지 데려다줄게. 안 되면 차라리 못 보내.',
        boyfriendZh: '我送你到门口。不然我不放心让你走。',
        choices: [
          { id: 'accept_escort', text: '让他送你', affection: 4, trust: 3, secrecy: -3, mood: 3 },
          { id: 'refuse_kindly', text: '温柔地拒绝（怕被看到）', affection: -1, trust: -1, secrecy: 3, mood: 0 },
          { id: 'split_ways', text: '提议分开走再汇合', affection: 1, trust: 1, secrecy: 2, mood: 1 },
        ],
      },
    ],
    movie: [
      {
        type: 'arrival_greeting',
        narrative: '电影院的灯光暗下来，他在黑暗中找到了你的座位。',
        boyfriendKo: '여기. 팝콘 네가 좋아하는 거.',
        boyfriendZh: '这里。爆米花是你喜欢的口味。',
        choices: [
          { id: 'share_armrest', text: '共享一个扶手', affection: 3, trust: 1, secrecy: -1, mood: 3 },
          { id: 'take_popcorn', text: '拿爆米花时碰到他的手', affection: 4, trust: 1, secrecy: 0, mood: 3 },
          { id: 'sit_apart', text: '保持适当距离', affection: -1, trust: 0, secrecy: 3, mood: 0 },
        ],
      },
      {
        type: 'activity',
        narrative: '电影演到感人处，他在黑暗中悄悄握住了你的手。',
        boyfriendKo: '...무서워?',
        boyfriendZh: '……害怕吗？',
        choices: [
          { id: 'hold_tight', text: '紧紧回握', affection: 6, trust: 2, secrecy: -2, mood: 5 },
          { id: 'lean_shoulder', text: '把头靠在他肩上', affection: 7, trust: 2, secrecy: -3, mood: 6 },
          { id: 'whisper_joke', text: '小声说"你才害怕吧"', affection: 4, trust: 2, secrecy: 0, mood: 4 },
        ],
      },
      {
        type: 'unexpected_event',
        narrative: '电影散场，灯光亮起的瞬间，你发现旁边坐着的是他的粉丝！',
        boyfriendKo: '아... 일단 자연스럽게 나가자.',
        boyfriendZh: '啊……先自然地出去吧。',
        choices: [
          { id: 'pretend_stranger', text: '假装不认识他', affection: -3, trust: -2, secrecy: 8, mood: -2 },
          { id: 'walk_ahead', text: '先走一步在门口等', affection: -1, trust: 0, secrecy: 5, mood: -1 },
          { id: 'act_normal', text: '装作普通朋友一起走', affection: 1, trust: 1, secrecy: 2, mood: 0 },
        ],
      },
      {
        type: 'departure',
        narrative: '安全离开电影院后，他在街角拉住了你。',
        boyfriendKo: '미안... 이렇게밖에 못 해서.',
        boyfriendZh: '对不起……只能做到这样。',
        choices: [
          { id: 'understand', text: '说"我理解，没关系的"', affection: 3, trust: 4, secrecy: 2, mood: 2 },
          { id: 'reassure_love', text: '说"和你在一起就够了"', affection: 5, trust: 3, secrecy: 0, mood: 4 },
          { id: 'silent_hug', text: '什么都不说，只是抱住他', affection: 6, trust: 3, secrecy: -2, mood: 5 },
        ],
      },
    ],
    amusement: [
      {
        type: 'arrival_greeting',
        narrative: '游乐园门口人山人海，他戴着帽子和口罩，只露出眼睛。',
        boyfriendKo: '사람 많다... 괜찮을까?',
        boyfriendZh: '人好多……没问题吧？',
        choices: [
          { id: 'reassure_fun', text: '拉着他说"来都来了！"', affection: 3, trust: 1, secrecy: -2, mood: 4 },
          { id: 'suggest_quiet', text: '提议去人少的项目', affection: 1, trust: 2, secrecy: 2, mood: 2 },
          { id: 'worry', text: '犹豫要不要进去', affection: -1, trust: 0, secrecy: 3, mood: -1 },
        ],
      },
      {
        type: 'activity',
        narrative: '过山车上，他紧张地握紧了扶手，但另一只手一直在找你的手。',
        boyfriendKo: '윽... ! 내 손 잡아!',
        boyfriendZh: '呃……！抓住我的手！',
        choices: [
          { id: 'scream_together', text: '尖叫着一起握紧', affection: 6, trust: 3, secrecy: -3, mood: 6 },
          { id: 'laugh', text: '笑他胆子小', affection: 4, trust: 2, secrecy: -1, mood: 5 },
          { id: 'calm_hold', text: '冷静地握住他的手', affection: 5, trust: 3, secrecy: -2, mood: 4 },
        ],
      },
      {
        type: 'unexpected_event',
        narrative: '在旋转木马前拍照时，有人举着相机对准了你们的方向！',
        boyfriendKo: '저기... 플래시였어? 빨리 가자.',
        boyfriendZh: '那边……是闪光灯吗？快走。',
        choices: [
          { id: 'run_away', text: '拉着他赶紧离开', affection: 2, trust: 2, secrecy: 5, mood: -2 },
          { id: 'act_casual', text: '装作普通朋友自然走开', affection: 1, trust: 1, secrecy: 3, mood: 0 },
          { id: 'confront', text: '想去找那个人理论', affection: 3, trust: -1, secrecy: -8, mood: -3 },
        ],
      },
      {
        type: 'intimate_moment',
        narrative: '摩天轮升到最高点，整个首尔的夜景在脚下展开。小小的空间里只有你们两个人。',
        boyfriendKo: '여기서는... 아무도 못 보잖아.',
        boyfriendZh: '在这里……谁也看不到我们。',
        choices: [
          { id: 'kiss_ferris', text: '在最高处吻他', affection: 10, trust: 3, secrecy: 0, mood: 8 },
          { id: 'confession', text: '说"我喜欢你"', affection: 8, trust: 5, secrecy: 0, mood: 7 },
          { id: 'photo_together', text: '偷偷拍一张合照', affection: 5, trust: 2, secrecy: -5, mood: 5 },
        ],
      },
      {
        type: 'departure',
        narrative: '游乐园的灯光渐渐远去，他牵着你的手不肯松开。',
        boyfriendKo: '오늘... 진짜 행복했어. 고마워.',
        boyfriendZh: '今天……真的很幸福。谢谢你。',
        choices: [
          { id: 'same_feeling', text: '说"我也是"', affection: 4, trust: 3, secrecy: 0, mood: 4 },
          { id: 'next_time', text: '说"下次还来"', affection: 3, trust: 2, secrecy: -1, mood: 3 },
          { id: 'sweet_goodbye', text: '在他耳边轻声说晚安', affection: 5, trust: 2, secrecy: -1, mood: 5 },
        ],
      },
    ],
  }

  return scenePool[dateType]
}

const postDateMessages: Record<DateType, { ko: string; zh: string }> = {
  cafe: { ko: '오늘 커피 맛있었어? 나는 네가 더 맛있었는데 ㅋㅋ 잘 자 ❤️', zh: '今天咖啡好喝吗？我觉得你更甜 哈哈 晚安 ❤️' },
  riverwalk: { ko: '강바람이 좀 추웠나? 다음엔 내 옷 입혀줄게. 보고 싶어.', zh: '江风有点冷吧？下次把我的外套给你穿。想你了。' },
  nightdrive: { ko: '오늘 밤... 잠 안 올 것 같아. 네 생각만 나서.', zh: '今晚……好像睡不着了。满脑子都是你。' },
  privatedinner: { ko: '오늘 밥 맛있었어? 다음엔 내가 직접 해줄게.', zh: '今天饭好吃吗？下次我亲手给你做。' },
  movie: { ko: '영화 재미있었어? 나는 네 손 잡는 게 더 재밌었는데 ㅎㅎ', zh: '电影好看吗？我觉得牵你的手更有意思 呵呵' },
  amusement: { ko: '오늘 진짜 최고였어! 다음에 또 가자, 약속!', zh: '今天真的太棒了！下次再去，说好了！' },
}

interface DateSystemProps {
  isOpen: boolean
  onClose: () => void
}

export default function DateSystem({ isOpen, onClose }: DateSystemProps) {
  const maleLead = useGameStore((s) => s.maleLead)
  const player = useGameStore((s) => s.player)
  const risk = useGameStore((s) => s.risk)
  const updateStats = useGameStore((s) => s.updateStats)
  const updateBoyfriendMemory = useGameStore((s) => s.updateBoyfriendMemory)
  const addEvidence = useGameStore((s) => s.addEvidence)
  const addHistoryEntry = useGameStore((s) => s.addHistoryEntry)
  const receiveMessage = useGameStore((s) => s.receiveMessage)

  const [phase, setPhase] = useState<DatePhase>('request')
  const [selectedDateType, setSelectedDateType] = useState<DateType | null>(null)
  const [outfit, setOutfit] = useState<OutfitChoice>('casual')
  const [gift, setGift] = useState<GiftChoice>('none')
  const [timeSlot, setTimeSlot] = useState<TimeChoice>('afternoon')
  const [scenes, setScenes] = useState<DateScene[]>([])
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0)
  const [accumulatedStats, setAccumulatedStats] = useState({ affection: 0, trust: 0, secrecy: 0, mood: 0 })
  const [triggeredEvents, setTriggeredEvents] = useState<string[]>([])
  const [dateScore, setDateScore] = useState(0)
  const [spotted, setSpotted] = useState(false)
  const [photosAdded, setPhotosAdded] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const resetDate = useCallback(() => {
    setPhase('request')
    setSelectedDateType(null)
    setOutfit('casual')
    setGift('none')
    setTimeSlot('afternoon')
    setScenes([])
    setCurrentSceneIdx(0)
    setAccumulatedStats({ affection: 0, trust: 0, secrecy: 0, mood: 0 })
    setTriggeredEvents([])
    setDateScore(0)
    setSpotted(false)
    setPhotosAdded(false)
    setShowResult(false)
  }, [])

  const handleClose = () => {
    resetDate()
    onClose()
  }

  const handleConfirmRequest = () => {
    if (!selectedDateType) return
    setPhase('prepare')
  }

  const handleStartDate = () => {
    if (!selectedDateType) return
    const generatedScenes = generateScenes(selectedDateType)
    setScenes(generatedScenes)
    setCurrentSceneIdx(0)
    setPhase('execute')
  }

  const handleChoice = (choice: DateChoice) => {
    const newStats = {
      affection: accumulatedStats.affection + choice.affection,
      trust: accumulatedStats.trust + choice.trust,
      secrecy: accumulatedStats.secrecy + choice.secrecy,
      mood: accumulatedStats.mood + choice.mood,
    }
    setAccumulatedStats(newStats)

    if (selectedDateType) {
      const dateConfig = dateTypes.find((d) => d.id === selectedDateType)!
      const timeConfig = timeConfigs[timeSlot]
      const eventChance = dateConfig.risk * 0.05 + (timeConfig.riskMod > 0 ? 0.05 : 0)
      const roll = Math.random()
      if (roll < eventChance) {
        const eligibleEvents = randomEvents.filter((e) => Math.random() < e.probability * 3)
        if (eligibleEvents.length > 0) {
          const event = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)]
          setTriggeredEvents((prev) => [...prev, event.name])
          if (event.secrecy < -10) setSpotted(true)
          newStats.secrecy += event.secrecy
          setAccumulatedStats({ ...newStats })
        }
      }
    }

    const nextIdx = currentSceneIdx + 1
    if (nextIdx >= scenes.length) {
      finishDate(newStats)
    } else {
      setCurrentSceneIdx(nextIdx)
    }
  }

  const finishDate = (finalStats: { affection: number; trust: number; secrecy: number; mood: number }) => {
    if (!selectedDateType) return
    const dateConfig = dateTypes.find((d) => d.id === selectedDateType)!
    const outfitConfig = outfitConfigs[outfit]
    const giftConfig = giftConfigs[gift]
    const timeConfig = timeConfigs[timeSlot]

    const totalAffection = finalStats.affection + dateConfig.affectionBonus + outfitConfig.affection + giftConfig.affection + timeConfig.bonusMod
    const totalTrust = finalStats.trust + giftConfig.trust
    const totalSecrecy = finalStats.secrecy + dateConfig.secrecyImpact + (outfitConfig.riskMod * -3) + (timeConfig.riskMod * -3)
    const totalMood = finalStats.mood

    const score = Math.max(0, Math.min(100, 50 + totalAffection * 2 + totalTrust + totalMood - Math.abs(totalSecrecy)))
    setDateScore(Math.round(score))

    const statChanges: Record<string, number> = {}
    if (totalAffection !== 0) statChanges.affection = totalAffection
    if (totalTrust !== 0) statChanges.trust = totalTrust
    if (totalSecrecy !== 0) statChanges.secrecy = totalSecrecy
    if (totalMood !== 0) statChanges.mood = totalMood
    if (spotted) {
      statChanges.fanSuspicion = 15
      statChanges.publicHeat = 10
    }
    if (giftConfig.fanSuspicion > 0 && spotted) {
      statChanges.fanSuspicion = (statChanges.fanSuspicion || 0) + giftConfig.fanSuspicion
    }

    updateStats(statChanges)

    const dateTypeName = dateConfig.name
    updateBoyfriendMemory({
      keyMemories: [...maleLead.memory.keyMemories, `第${useGameStore.getState().week}周${dateTypeName}：${spotted ? '被发现了！' : '顺利结束'}`],
    })

    addHistoryEntry({
      week: useGameStore.getState().week,
      day: useGameStore.getState().day,
      event: dateTypeName,
      choice: `好感${totalAffection > 0 ? '+' : ''}${totalAffection} 信任${totalTrust > 0 ? '+' : ''}${totalTrust} 保密${totalSecrecy > 0 ? '+' : ''}${totalSecrecy}`,
      consequences: statChanges,
      memoryTags: [dateTypeName, spotted ? '被发现' : '安全'],
    })

    if (spotted) {
      const evidence: EvidenceFragment = {
        id: `ev_${Date.now()}`,
        title: `${dateTypeName}目击证据`,
        source: '约会',
        riskLevel: dateConfig.risk,
        description: `在${dateTypeName}中被目击，可能存在照片证据`,
        discoveredByFans: true,
        canDelete: Math.random() > 0.5,
        relatedEventChainId: '',
        createdAt: Date.now(),
      }
      addEvidence(evidence)
    }

    if (dateConfig.risk >= 3 && Math.random() > 0.4) {
      setPhotosAdded(true)
    }

    const postMsg = postDateMessages[selectedDateType]
    const replyMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'boyfriend',
      senderName: maleLead.name,
      textKo: postMsg.ko,
      textZh: postMsg.zh,
      timestamp: Date.now(),
      isRead: false,
      isRecalled: false,
      emotion: 'sweet',
    }
    receiveMessage('thread_boyfriend', replyMsg)

    setPhase('result')
  }

  if (!isOpen) return null

  const currentScene = scenes[currentSceneIdx] as DateScene | undefined

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div
        className="relative w-full h-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(10, 10, 26, 0.97)',
          border: '1px solid rgba(255,45,120,0.15)',
          boxShadow: '0 0 60px rgba(255,45,120,0.1), 0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Heart size={16} style={{ color: '#ff2d78' }} />
            {phase === 'request' && '发起约会'}
            {phase === 'prepare' && '约会准备'}
            {phase === 'execute' && '约会进行中'}
            {phase === 'result' && '约会结算'}
          </h2>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={14} className="text-white/70" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {phase === 'request' && (
            <div className="p-5">
              <div className="mb-4">
                <p className="text-white/50 text-xs mb-3">选择约会类型</p>
                <div className="grid grid-cols-2 gap-3">
                  {dateTypes.map((dt) => (
                    <button
                      key={dt.id}
                      onClick={() => setSelectedDateType(dt.id)}
                      className="p-3 rounded-xl text-left transition-all duration-200"
                      style={{
                        background: selectedDateType === dt.id
                          ? 'rgba(255,45,120,0.15)'
                          : 'rgba(255,255,255,0.03)',
                        border: selectedDateType === dt.id
                          ? '1px solid rgba(255,45,120,0.4)'
                          : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{dt.icon}</span>
                        <span className="text-white text-sm font-medium">{dt.name}</span>
                      </div>
                      <p className="text-white/40 text-[10px] mb-2">{dt.description}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            background: `${dt.riskColor}15`,
                            color: dt.riskColor,
                            border: `1px solid ${dt.riskColor}30`,
                          }}
                        >
                          {dt.riskLabel}
                        </span>
                        <span className="text-[10px] text-pink-400">❤️+{dt.affectionBonus}</span>
                        <span className="text-[10px] text-green-400">🔒{dt.secrecyImpact}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDateType && (
                <div
                  className="px-4 py-3 rounded-xl mb-4"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.15)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-red-400 text-xs font-medium">风险预览</span>
                  </div>
                  <p className="text-white/50 text-xs">
                    当前恋情保密度: {risk.secrecy}% | 粉丝怀疑度: {risk.fanSuspicion}%
                  </p>
                  <p className="text-white/40 text-[10px] mt-1">
                    保密度低于30%可能触发Dispatch曝光
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmRequest}
                  disabled={!selectedDateType}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, #ff2d78, #ff6b9d)',
                    color: 'white',
                    boxShadow: '0 0 15px rgba(255,45,120,0.3)',
                  }}
                >
                  确认约会
                </button>
              </div>
            </div>
          )}

          {phase === 'prepare' && selectedDateType && (
            <div className="p-5">
              <div className="mb-5">
                <p className="text-white/50 text-xs mb-3 flex items-center gap-1.5">
                  <Sparkles size={12} style={{ color: '#ff6b9d' }} />
                  穿搭选择（影响好感度）
                </p>
                <div className="flex gap-2">
                  {(Object.entries(outfitConfigs) as [OutfitChoice, typeof outfitConfigs[OutfitChoice]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setOutfit(key)}
                      className="flex-1 p-3 rounded-xl text-center transition-all"
                      style={{
                        background: outfit === key ? 'rgba(255,45,120,0.12)' : 'rgba(255,255,255,0.03)',
                        border: outfit === key ? '1px solid rgba(255,45,120,0.3)' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span className="text-white text-sm font-medium block">{cfg.label}</span>
                      <span className="text-white/40 text-[10px] block mt-1">{cfg.desc}</span>
                      {cfg.affection !== 0 && (
                        <span className={`text-[10px] block mt-1 ${cfg.affection > 0 ? 'text-pink-400' : 'text-gray-400'}`}>
                          ❤️{cfg.affection > 0 ? '+' : ''}{cfg.affection}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="text-white/50 text-xs mb-3 flex items-center gap-1.5">
                  <Gift size={12} style={{ color: '#c084fc' }} />
                  是否带礼物
                </p>
                <div className="flex gap-2">
                  {(Object.entries(giftConfigs) as [GiftChoice, typeof giftConfigs[GiftChoice]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setGift(key)}
                      className="flex-1 p-3 rounded-xl text-center transition-all"
                      style={{
                        background: gift === key ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.03)',
                        border: gift === key ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span className="text-white text-sm font-medium block">{cfg.label}</span>
                      <span className="text-white/40 text-[10px] block mt-1">{cfg.desc}</span>
                      {cfg.affection !== 0 && (
                        <span className="text-[10px] text-pink-400 block mt-1">❤️+{cfg.affection}</span>
                      )}
                      {cfg.trust !== 0 && (
                        <span className="text-[10px] text-blue-400 block mt-0.5">💙+{cfg.trust}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="text-white/50 text-xs mb-3 flex items-center gap-1.5">
                  <Clock size={12} style={{ color: '#06b6d4' }} />
                  见面时间
                </p>
                <div className="flex gap-2">
                  {(Object.entries(timeConfigs) as [TimeChoice, typeof timeConfigs[TimeChoice]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setTimeSlot(key)}
                      className="flex-1 p-3 rounded-xl text-center transition-all"
                      style={{
                        background: timeSlot === key ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.03)',
                        border: timeSlot === key ? '1px solid rgba(6,182,212,0.3)' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span className="text-white text-sm font-medium block">{cfg.label}</span>
                      <span className="text-white/40 text-[10px] block mt-1">{cfg.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPhase('request')}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  返回
                </button>
                <button
                  onClick={handleStartDate}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #ff2d78, #ff6b9d)',
                    color: 'white',
                    boxShadow: '0 0 15px rgba(255,45,120,0.3)',
                  }}
                >
                  出发约会
                </button>
              </div>
            </div>
          )}

          {phase === 'execute' && currentScene && (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                {scenes.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1 flex-1 rounded-full transition-all"
                    style={{
                      background: idx < currentSceneIdx
                        ? '#ff2d78'
                        : idx === currentSceneIdx
                          ? 'rgba(255,45,120,0.5)'
                          : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>

              <div
                className="px-4 py-3 rounded-xl mb-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-white/80 text-sm leading-relaxed">{currentScene.narrative}</p>
              </div>

              <div
                className="px-4 py-3 rounded-xl mb-4"
                style={{
                  background: 'rgba(255,45,120,0.06)',
                  border: '1px solid rgba(255,45,120,0.12)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-[#FEE500] flex items-center justify-center text-[10px] font-bold text-[#3C3C3C]">
                    {maleLead.name.charAt(0)}
                  </div>
                  <span className="text-white/50 text-xs">{maleLead.name}</span>
                </div>
                <TranslateText ko={currentScene.boyfriendKo} zh={currentScene.boyfriendZh} koStyle={{ fontSize: '14px', color: 'white' }} zhStyle={{ color: '#ccc' }} />
              </div>

              {triggeredEvents.length > 0 && (
                <div
                  className="px-3 py-2 rounded-lg mb-4"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  <p className="text-red-400 text-xs font-medium">⚠️ 突发事件：{triggeredEvents[triggeredEvents.length - 1]}</p>
                </div>
              )}

              <div className="space-y-2">
                {currentScene.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice)}
                    className="w-full p-3 rounded-xl text-left transition-all hover:scale-[1.01]"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <span className="text-white text-sm">{choice.text}</span>
                    <div className="flex items-center gap-3 mt-1.5">
                      {choice.affection !== 0 && (
                        <span className={`text-[10px] ${choice.affection > 0 ? 'text-pink-400' : 'text-gray-500'}`}>
                          ❤️{choice.affection > 0 ? '+' : ''}{choice.affection}
                        </span>
                      )}
                      {choice.trust !== 0 && (
                        <span className={`text-[10px] ${choice.trust > 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                          💙{choice.trust > 0 ? '+' : ''}{choice.trust}
                        </span>
                      )}
                      {choice.secrecy !== 0 && (
                        <span className={`text-[10px] ${choice.secrecy > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          🔒{choice.secrecy > 0 ? '+' : ''}{choice.secrecy}
                        </span>
                      )}
                      {choice.mood !== 0 && (
                        <span className={`text-[10px] ${choice.mood > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                          ✨{choice.mood > 0 ? '+' : ''}{choice.mood}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/5">
                <span className="text-[10px] text-white/30 flex items-center gap-1">
                  <Heart size={10} /> {accumulatedStats.affection}
                </span>
                <span className="text-[10px] text-white/30 flex items-center gap-1">
                  <Shield size={10} /> {accumulatedStats.trust}
                </span>
                <span className="text-[10px] text-white/30 flex items-center gap-1">
                  🔒 {accumulatedStats.secrecy}
                </span>
                <span className="text-[10px] text-white/30 flex items-center gap-1">
                  ✨ {accumulatedStats.mood}
                </span>
              </div>
            </div>
          )}

          {phase === 'result' && (
            <div className="p-5">
              <div className="flex flex-col items-center mb-5">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-3"
                  style={{
                    background: `conic-gradient(#ff2d78 ${(dateScore / 100) * 360}deg, rgba(255,255,255,0.06) ${(dateScore / 100) * 360}deg)`,
                  }}
                >
                  <div
                    className="w-18 h-18 rounded-full flex items-center justify-center"
                    style={{ background: '#0a0a1a', width: 72, height: 72 }}
                  >
                    <span className="text-white text-2xl font-bold">{dateScore}</span>
                  </div>
                </div>
                <span className="text-white/50 text-xs">约会评分</span>
                {dateScore >= 80 && <span className="text-pink-400 text-xs mt-1">完美约会！💕</span>}
                {dateScore >= 50 && dateScore < 80 && <span className="text-yellow-400 text-xs mt-1">不错的约会 ✨</span>}
                {dateScore < 50 && <span className="text-gray-400 text-xs mt-1">有些遗憾的约会</span>}
              </div>

              <div
                className="px-4 py-3 rounded-xl mb-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-white/50 text-xs mb-2">属性变化</p>
                <div className="grid grid-cols-2 gap-2">
                  {accumulatedStats.affection !== 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs">好感度</span>
                      <span className={`text-xs font-medium ${accumulatedStats.affection > 0 ? 'text-pink-400' : 'text-gray-500'}`}>
                        {accumulatedStats.affection > 0 ? '+' : ''}{accumulatedStats.affection}
                      </span>
                    </div>
                  )}
                  {accumulatedStats.trust !== 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs">信任度</span>
                      <span className={`text-xs font-medium ${accumulatedStats.trust > 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                        {accumulatedStats.trust > 0 ? '+' : ''}{accumulatedStats.trust}
                      </span>
                    </div>
                  )}
                  {accumulatedStats.secrecy !== 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs">保密度</span>
                      <span className={`text-xs font-medium ${accumulatedStats.secrecy > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {accumulatedStats.secrecy > 0 ? '+' : ''}{accumulatedStats.secrecy}
                      </span>
                    </div>
                  )}
                  {accumulatedStats.mood !== 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs">心情</span>
                      <span className={`text-xs font-medium ${accumulatedStats.mood > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {accumulatedStats.mood > 0 ? '+' : ''}{accumulatedStats.mood}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {spotted && (
                <div
                  className="px-4 py-3 rounded-xl mb-4"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-red-400 text-xs font-medium">被发现！</span>
                  </div>
                  <p className="text-white/50 text-xs">约会过程中被目击，可能产生新的证据碎片</p>
                </div>
              )}

              {triggeredEvents.length > 0 && (
                <div
                  className="px-4 py-3 rounded-xl mb-4"
                  style={{
                    background: 'rgba(249,115,22,0.08)',
                    border: '1px solid rgba(249,115,22,0.15)',
                  }}
                >
                  <p className="text-orange-400 text-xs font-medium mb-1">突发状况</p>
                  {triggeredEvents.map((ev, idx) => (
                    <p key={idx} className="text-white/40 text-xs">• {ev}</p>
                  ))}
                </div>
              )}

              {photosAdded && (
                <div
                  className="px-4 py-3 rounded-xl mb-4"
                  style={{
                    background: 'rgba(168,85,247,0.08)',
                    border: '1px solid rgba(168,85,247,0.15)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Camera size={14} className="text-purple-400" />
                    <span className="text-purple-400 text-xs">约会照片已添加到相册</span>
                  </div>
                </div>
              )}

              <div
                className="px-4 py-3 rounded-xl mb-4"
                style={{
                  background: 'rgba(255,45,120,0.06)',
                  border: '1px solid rgba(255,45,120,0.12)',
                }}
              >
                <p className="text-white/50 text-xs mb-2">他的约会后消息</p>
                <TranslateText
                  ko={selectedDateType ? postDateMessages[selectedDateType].ko : ''}
                  zh={selectedDateType ? postDateMessages[selectedDateType].zh : ''}
                  koStyle={{ fontSize: '13px' }}
                />
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, #ff2d78, #ff6b9d)',
                  color: 'white',
                  boxShadow: '0 0 15px rgba(255,45,120,0.3)',
                }}
              >
                结束
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
