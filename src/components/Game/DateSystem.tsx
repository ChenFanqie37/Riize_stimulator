import { useState, useCallback } from 'react'
import { X, Heart, Shield, Clock, Gift, Camera, AlertTriangle, Star, ChevronRight, MapPin, Sparkles } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { CalendarEvent, DelayedConsequence, EvidenceFragment, GalleryPhoto, ChatMessage, Notification, Trace } from '@/types/game'
import { generateCustomDatePlan, type CustomDatePlan } from '@/engine/gemini'
import { TranslateText } from '../Common/TranslateText'

type DateType = 'cafe' | 'riverwalk' | 'nightdrive' | 'privatedinner' | 'movie' | 'amusement' | 'backdoor' | 'hotel' | 'airport' | 'studio' | 'home' | 'brandparty' | 'convenience' | 'musicshow' | 'rooftop' | 'custom'
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
  {
    id: 'backdoor',
    name: '练习室后门',
    icon: '🚪',
    risk: 4,
    affectionBonus: 11,
    secrecyImpact: -8,
    description: '非公开通道的十分钟，门禁、CCTV、经纪人都可能留下痕迹',
    riskLabel: '高压',
    riskColor: '#ef4444',
  },
  {
    id: 'hotel',
    name: '酒店门后夜',
    icon: '🏨',
    risk: 6,
    affectionBonus: 18,
    secrecyImpact: -14,
    description: '门在身后合上，镜头停在门外；第二天只剩未接来电和香水味',
    riskLabel: '爆炸风险',
    riskColor: '#dc2626',
  },
  {
    id: 'airport',
    name: '机场转机',
    icon: '✈️',
    risk: 5,
    affectionBonus: 13,
    secrecyImpact: -12,
    description: '海外转机的一小时，站姐镜头、航班记录和同款帽子都很危险',
    riskLabel: '高风险',
    riskColor: '#ef4444',
  },
  {
    id: 'studio',
    name: '录音室夜宵',
    icon: '🎧',
    risk: 3,
    affectionBonus: 10,
    secrecyImpact: -5,
    description: '凌晨录音室的外卖袋、歌词纸和语音备忘录会变成甜蜜证据',
    riskLabel: '中高风险',
    riskColor: '#f97316',
  },
  {
    id: 'home',
    name: '公寓藏匿',
    icon: '🏠',
    risk: 4,
    affectionBonus: 16,
    secrecyImpact: -9,
    description: '窗帘拉上的安全屋，楼下私生和邻居快递都可能出卖你们',
    riskLabel: '高压',
    riskColor: '#ef4444',
  },
  {
    id: 'brandparty',
    name: '品牌派对偷见',
    icon: '🥂',
    risk: 5,
    affectionBonus: 12,
    secrecyImpact: -11,
    description: '名流、媒体和同场女艺人都在，越刺激越容易出圈',
    riskLabel: '高风险',
    riskColor: '#ef4444',
  },
  {
    id: 'convenience',
    name: '深夜便利店',
    icon: '🧃',
    risk: 3,
    affectionBonus: 8,
    secrecyImpact: -6,
    description: '一袋拉面和同款饮料，便利店 CCTV 比粉丝更诚实',
    riskLabel: '中风险',
    riskColor: '#f97316',
  },
  {
    id: 'musicshow',
    name: '打歌后台擦肩',
    icon: '🎤',
    risk: 5,
    affectionBonus: 12,
    secrecyImpact: -12,
    description: '待机室、走廊、站姐返图和工作人员视线挤在一起，最像偷情现场',
    riskLabel: '高风险',
    riskColor: '#ef4444',
  },
  {
    id: 'rooftop',
    name: '宿舍天台',
    icon: '🌃',
    risk: 4,
    affectionBonus: 14,
    secrecyImpact: -8,
    description: '楼顶风很大，成员可能突然上来，楼下也可能有人架镜头',
    riskLabel: '高压',
    riskColor: '#ef4444',
  },
  {
    id: 'custom',
    name: '自定义约会',
    icon: '✍',
    risk: 3,
    affectionBonus: 8,
    secrecyImpact: -6,
    description: '描述你想要的约会，系统会实时生成路线、选项和曝光判定',
    riskLabel: '现场判定',
    riskColor: '#a855f7',
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
  { id: 'saseng_tail', name: '私生跟车', probability: 0.09, secrecy: -18, fanSuspicion: 18, paparazziAttention: 12, narrative: '后视镜里那辆车第三次出现，他的手指敲在方向盘上，声音一下子冷下来。' },
  { id: 'cctv_capture', name: 'CCTV 留影', probability: 0.11, secrecy: -12, fanSuspicion: 12, companyAlert: 10, narrative: '电梯门合上的瞬间，你看见角落里的 CCTV 正对着你们。' },
  { id: 'same_item_photo', name: '同款入镜', probability: 0.14, secrecy: -8, fanSuspicion: 15, narrative: '你手上的小物件不小心入镜，正好和他昨天直播里出现的一模一样。' },
  { id: 'manager_nearby', name: '经纪人附近', probability: 0.07, secrecy: -6, fanSuspicion: 0, companyAlert: 18, careerPressure: 8, narrative: '经纪人的车停在街对面，他把帽檐压低，半晌没有说话。' },
  { id: 'live_hint', name: '直播口误', probability: 0.08, secrecy: -6, fanSuspicion: 16, publicHeat: 6, narrative: '他晚上的直播里差点说出今天的地点，粉丝立刻开始剪切片。' },
  { id: 'friend_story', name: '朋友误发 Story', probability: 0.07, secrecy: -10, fanSuspicion: 14, publicHeat: 8, narrative: '同行朋友发了一秒背景 Story，删除得很快，但截图已经流出。' },
  { id: 'taxi_receipt', name: '出租车小票', probability: 0.09, secrecy: -7, fanSuspicion: 8, paparazziAttention: 8, narrative: '出租车小票夹在外卖袋里，时间和目的地都太具体。' },
  { id: 'couple_scent', name: '同款香味', probability: 0.06, secrecy: -5, fanSuspicion: 10, narrative: '工作人员说他身上有陌生香水味，粉丝把品牌扒了出来。' },
  { id: 'staff_gossip', name: '工作人员八卦', probability: 0.08, secrecy: -9, companyAlert: 12, insiderLeakRisk: 10, narrative: '后台有人在茶水间提到“他最近总是绕路”，消息像小火苗一样窜出去。' },
  { id: 'fan_cam_overlap', name: '饭拍重合', probability: 0.1, secrecy: -13, fanSuspicion: 18, publicHeat: 6, narrative: '两段饭拍角度一拼，你们擦肩而过的路线刚好能对上。' },
  { id: 'phone_light', name: '手机亮屏', probability: 0.09, secrecy: -6, fanSuspicion: 9, narrative: '他手机亮了一下，锁屏上的昵称只露出一个字，却足够让人发疯。' },
  { id: 'teammate_cover', name: '队友帮忙打掩护', probability: 0.1, secrecy: 5, fanSuspicion: -4, trust: 3, narrative: '队友突然插进来把话题带走，像是早就知道该怎么救场。' },
]

const fallbackDateProfiles: Partial<Record<DateType, {
  place: string
  hook: string
  arrivalKo: string
  arrivalZh: string
  intimate: string
  danger: string
  goodbyeKo: string
  goodbyeZh: string
}>> = {
  backdoor: {
    place: '练习室后门',
    hook: '后门的灯忽明忽暗，门禁响起一声轻响，他把你拉进监控死角。',
    arrivalKo: '딱 십 분만. 나 진짜 보고 싶었어.',
    arrivalZh: '就十分钟。我真的很想你。',
    intimate: '他还穿着练习服，额角有汗，靠近时像把舞台上所有光都带到了你面前。',
    danger: '楼上传来脚步声，经纪人的声音隔着门传下来。',
    goodbyeKo: '나 올라가야 해. 근데 놓기 싫다.',
    goodbyeZh: '我得上去了。可是舍不得松手。',
  },
  hotel: {
    place: '酒店房间',
    hook: '电梯数字一层层往上跳，你们谁都没有说话，只有房卡在他指尖轻轻响。',
    arrivalKo: '오늘은 아무도 모르게 있어줘.',
    arrivalZh: '今晚就谁也别知道，只陪我待一会儿。',
    intimate: '门在身后合上，镜头停在凌乱的外套和亮着的手机屏幕上；之后的部分只留在门后的第二天。',
    danger: '楼下大厅出现了熟悉的站姐镜头，房间服务记录也会留下时间。',
    goodbyeKo: '아침에 먼저 나갈게. 너는 천천히 나와.',
    goodbyeZh: '早上我先走。你慢一点出来。',
  },
  airport: {
    place: '机场转机区',
    hook: '候机屏不断刷新，他戴着口罩从人群里绕到你身后。',
    arrivalKo: '여기서 만나는 거 미쳤지. 근데 좋아.',
    arrivalZh: '在这里见面太疯了。可是我喜欢。',
    intimate: '他把自己的帽子扣到你头上，指尖擦过耳侧，像在拥挤人群里盖下一个只有你们懂的章。',
    danger: '远处粉丝的长焦扫过来，航班时间和登机口很容易被拼在一起。',
    goodbyeKo: '탑승하면 바로 문자해. 내가 계속 볼게.',
    goodbyeZh: '登机就给我发消息。我会一直看手机。',
  },
  studio: {
    place: '录音室',
    hook: '凌晨的录音室只亮着一盏灯，他把耳机分给你一边。',
    arrivalKo: '이 부분, 너 생각하면서 불렀어.',
    arrivalZh: '这一段，我是想着你唱的。',
    intimate: '他压低声音在你耳边哼了未公开的旋律，尾音轻得像在撒娇。',
    danger: '桌上的歌词纸写着日期和你的昵称，如果被拍到就是新的暗号证据。',
    goodbyeKo: '이 노래 나오면 너 먼저 생각날 거야.',
    goodbyeZh: '这首歌发行的时候，我第一个会想到你。',
  },
  home: {
    place: '公寓',
    hook: '你拉上窗帘，楼下的私生还在徘徊，他在玄关很轻地抱住你。',
    arrivalKo: '여기 있으면 조금 숨 쉴 수 있어.',
    arrivalZh: '在这里，我好像才能喘口气。',
    intimate: '沙发边的灯暗下来，你们把手机都扣在桌上，世界终于被关在门外。',
    danger: '快递电话、邻居脚步、楼下车灯，每一样都可能让这个安全屋变成证据点。',
    goodbyeKo: '나 너무 오래 있었지... 그래도 후회 안 해.',
    goodbyeZh: '我是不是待太久了……但我不后悔。',
  },
  brandparty: {
    place: '品牌派对',
    hook: '香槟塔旁全是镜头，他穿过人群时，只用余光看了你一眼。',
    arrivalKo: '눈 마주치지 마. 나 웃을 것 같아.',
    arrivalZh: '别跟我对视。我怕我会笑出来。',
    intimate: '走廊尽头的短暂停留像偷来的胜利，你们离得很近，却谁也不能先伸手。',
    danger: '媒体、女艺人、品牌工作人员都在场，任何同框都会被剪成热帖。',
    goodbyeKo: '끝나고 전화할게. 오늘 너 진짜 예뻤어.',
    goodbyeZh: '结束后给你打电话。你今天真的很漂亮。',
  },
  convenience: {
    place: '便利店',
    hook: '凌晨两点的便利店只剩微波炉声，他把最后一盒草莓牛奶塞给你。',
    arrivalKo: '이런 거라도 같이 하니까 데이트 같네.',
    arrivalZh: '就算只是这样一起，也像约会。',
    intimate: '他用外套挡住你们交叠的手，笑得像做坏事成功的小孩。',
    danger: '便利店 CCTV、收据时间和同款饮料，粉丝最会把这种小东西拼成大故事。',
    goodbyeKo: '다음엔 라면도 같이 먹자. 몰래.',
    goodbyeZh: '下次一起吃拉面吧。偷偷地。',
  },
  musicshow: {
    place: '打歌后台',
    hook: '待机室门口人来人往，他从队伍末尾回头看了你一眼，像什么都没发生。',
    arrivalKo: '여기서 티 내면 진짜 끝이야. 그래도 봐서 좋다.',
    arrivalZh: '在这里露馅就真的完了。可是能看见你真好。',
    intimate: '他递给你一瓶没开封的水，指尖碰到的那一下比拥抱还危险。',
    danger: '站姐预览图刷出来，走廊尽头有半截侧影，角度刚好对着你刚才站的位置。',
    goodbyeKo: '무대 끝나고 연락할게. 지금은 모르는 척해.',
    goodbyeZh: '舞台结束后联系你。现在先装作不认识。',
  },
  rooftop: {
    place: '宿舍天台',
    hook: '天台风很大，他穿着帽衫站在灯影外，听见门响才转过身。',
    arrivalKo: '여긴 아무도 안 오겠지... 아마도.',
    arrivalZh: '这里应该没人会来吧……大概。',
    intimate: '城市灯光在下面闪，他把帽檐压到你头上，笑得像终于偷到一点自由。',
    danger: '楼梯间传来成员的笑声，楼下马路有一辆车停得太久。',
    goodbyeKo: '춥다. 내일 감기 걸리면 내가 책임질게.',
    goodbyeZh: '冷吧。明天感冒的话我负责。',
  },
}

const tailoredFallbackChoiceTexts: Partial<Record<DateType, Partial<Record<DateScene['type'], string[]>>>> = {
  backdoor: {
    arrival_greeting: ['先贴着墙听脚步声，再把他拉进监控死角', '把工作人员证件翻到背面，装作只是路过', '低声笑他胆子大，连门禁声都不怕'],
    intimate_moment: ['摸掉他额角的汗，问他刚才是不是一直在找你', '把手机扣进外套口袋，专心听他喘匀呼吸', '隔着练习服牵一下手，提醒他五分钟后必须回去'],
    unexpected_event: ['立刻把门缝留开，装成工作人员交接', '不退，反而替他整理衣领赌没人敢进来', '从安全通道分开，十分钟后用暗号报平安'],
    departure: ['拍下门禁灯的反光，只存进隐藏相册', '互删后台定位和通行记录截图', '约好下次换一个更靠近舞台的死角'],
  },
  hotel: {
    arrival_greeting: ['在电梯里隔半步站着，只让袖口碰到他', '接过房卡却不看楼层，等他先按按钮', '故意问他现在后悔还来不来得及'],
    intimate_moment: ['把窗帘拉严，让城市灯光只剩一条缝', '把手机扣下，把今晚留在门后', '替他摘掉帽子，再提醒明早分开离开'],
    unexpected_event: ['让客房服务先走，等走廊安静再开门', '把灯调暗，赌大厅那台镜头拍不到楼层', '你先进浴室躲开，他去应付门外声音'],
    departure: ['留一张香水瓶旁的照片，只发给自己小号', '分批退房，删除叫车记录', '约定明天谁都不主动，但谁都别真的忍住'],
  },
  airport: {
    arrival_greeting: ['在登机牌背后写一句暗号递给他', '替他压低帽檐，装作只是粉丝擦肩', '隔着人群对视三秒，谁先笑谁输'],
    intimate_moment: ['把他的帽子扣到自己头上，再立刻还回去', '在免税店货架后短暂牵手', '替他检查口罩边缘，顺手碰一下耳侧'],
    unexpected_event: ['混进排队人群，让行李箱挡住半边身影', '继续并肩走，赌长焦只拍到背影', '一个去洗手间，一个去登机口，十分钟后汇合'],
    departure: ['拍下同一班航班屏幕，藏进相册', '删掉机场 Wi-Fi 记录和定位', '约好落地后用一个表情当平安暗号'],
  },
  studio: {
    arrival_greeting: ['戴上他递来的耳机，先听那句未公开旋律', '把外卖袋放到桌下，假装只是工作人员送餐', '问他歌词里那句是不是写给你'],
    intimate_moment: ['隔着一副耳机听同一段副歌', '让他在收音灯熄灭后才靠近', '把歌词纸反扣，避免你的名字被拍到'],
    unexpected_event: ['立刻按下静音键，装成录音事故', '把外卖袋挡到镜头前，继续听他说完', '你躲进控制室，他去开门拿文件'],
    departure: ['拍一张混音台灯光，不露任何人', '撕掉写着日期的歌词草稿', '约好歌曲公开那天再提今晚'],
  },
  home: {
    arrival_greeting: ['先确认窗帘拉严，再让他进门', '把拖鞋踢给他，假装这不是第一次', '站在玄关不动，等他先抱上来'],
    intimate_moment: ['把两部手机都扣在茶几上，让世界暂时失联', '关掉客厅大灯，只留冰箱的光', '替他把外套挂好，再提醒外卖别写真名'],
    unexpected_event: ['让快递放门口，等脚步声远了再取', '拉他躲到玄关阴影里，赌邻居没看清', '你去阳台，他坐回沙发装成独处'],
    departure: ['拍下他喝过的杯子，藏进隐藏相册', '清掉外卖地址和门禁访客记录', '约好下次直接买双专属拖鞋'],
  },
  brandparty: {
    arrival_greeting: ['隔着香槟塔对视，不让镜头抓到同框', '假装看展品，从他身后错身而过', '把胸针方向调成你们约好的暗号'],
    intimate_moment: ['在媒体墙拐角停三秒，谁也不先伸手', '替他挡住闪光灯，像只是礼貌经过', '用杯沿碰一下他的杯沿，马上分开'],
    unexpected_event: ['立刻加入别人合照，把同框切散', '不躲，反而让他和女艺人说话做烟雾弹', '从工作人员通道分头离场'],
    departure: ['拍一张只露香槟杯的照片，文案写得很暧昧', '删掉邀请函二维码和座位图', '约好散场后打电话，谁也别在现场回头'],
  },
  convenience: {
    arrival_greeting: ['拿走最后一盒草莓牛奶，等他开口抢', '站在泡面架前装偶遇', '让收银小票挡住你们同时伸出的手'],
    intimate_moment: ['用外套挡住两个人交叠的手', '分一口热泡面，笑他被烫到还装没事', '把同款饮料转到背面，别让标签入镜'],
    unexpected_event: ['低头假装各自刷手机，让 CCTV 只拍到侧脸', '继续站一起，赌凌晨没人认真看监控', '你先出门，他绕到后巷再走'],
    departure: ['拍下同一张小票但裁掉时间', '把包装袋分开扔进不同垃圾桶', '约好下次升级成深夜车里吃拉面'],
  },
  musicshow: {
    arrival_greeting: ['在待机室门口只点一下头，像完全不熟', '把应援贴纸藏进袖口给他看一眼', '趁工作人员转身，把水递到他手边'],
    intimate_moment: ['隔着未开封的水瓶碰到指尖', '在走廊尽头听他小声哼今天的安可', '替他擦掉妆边亮片，马上退开'],
    unexpected_event: ['立刻混进工作人员队列，拿文件夹挡脸', '继续从他身边擦过，赌站姐只顾拍正脸', '他回待机室，你绕去舞台侧门'],
    departure: ['保存一张舞台侧影，只露灯牌颜色', '删掉后台通行证照片', '约好下次在彩排前多偷三分钟'],
  },
  rooftop: {
    arrival_greeting: ['先锁好天台门，再走向灯影外的他', '把帽衫帽子扣到他头上，笑他像逃课', '站在风口不动，等他把你拉过去'],
    intimate_moment: ['把手塞进他袖口里取暖', '让城市灯光替你们遮住表情', '靠在水箱后面，提醒他别笑太大声'],
    unexpected_event: ['躲到楼梯间，等成员的笑声下去', '继续站在栏杆边，赌楼下车里没人架镜头', '你先下两层，他从另一侧电梯离开'],
    departure: ['拍下同一片夜景，不拍人', '擦掉门把手上的口红和指纹', '约好下次带热饮上来，像真的有以后'],
  },
  custom: {
    arrival_greeting: ['按你写的约会设定先试探现场风险', '让他先选择暗号和碰面点', '故意把主动权交给他，看现场会怎么变'],
    intimate_moment: ['把关键动作留给这次自定义路线自然生成', '选择更暧昧的推进，但接受更高曝光风险', '收住一点，让后果留到下一天发酵'],
    unexpected_event: ['根据现场给出的危机立刻补救', '反其道而行，制造更强的话题钩子', '分头撤离，把线索拆成两段'],
    departure: ['保存一张符合本次设定的纪念照片', '清掉本次自定义约会的关键痕迹', '把下一次约会写成更大胆的暗号'],
  },
}

function tailorFallbackChoices<T extends { text: string }>(dateType: DateType, sceneType: DateScene['type'], choices: T[]): T[] {
  const texts = tailoredFallbackChoiceTexts[dateType]?.[sceneType]
  if (!texts) return choices
  return choices.map((choice, index) => ({
    ...choice,
    text: texts[index] || choice.text,
  }))
}

function generateFallbackScenes(dateType: DateType): DateScene[] {
  const profile = fallbackDateProfiles[dateType] || {
    place: '秘密地点',
    hook: '你们在一个不会被公开行程写进表格的地方见面，空气里都是紧张和甜味。',
    arrivalKo: '왔어? 나 계속 기다렸어.',
    arrivalZh: '来了？我一直在等你。',
    intimate: '他靠近时压低了声音，像把全世界都挡在你们身后。',
    danger: '远处有人拿起手机，你们同时安静下来。',
    goodbyeKo: '조심히 가. 오늘 일은 우리만 알자.',
    goodbyeZh: '路上小心。今天的事只有我们知道。',
  }

  return [
    {
      type: 'arrival_greeting',
      narrative: profile.hook,
      boyfriendKo: profile.arrivalKo,
      boyfriendZh: profile.arrivalZh,
      choices: tailorFallbackChoices(dateType, 'arrival_greeting', [
        { id: `${dateType}_rush_hug`, text: '先抱住他，什么都不问', affection: 7, trust: 2, secrecy: -4, mood: 5 },
        { id: `${dateType}_scan`, text: '确认周围没有镜头再靠近', affection: 1, trust: 2, secrecy: 4, mood: -1 },
        { id: `${dateType}_tease`, text: '低声说“你胆子越来越大了”', affection: 5, trust: 1, secrecy: -2, mood: 4 },
      ]),
    },
    {
      type: 'intimate_moment',
      narrative: profile.intimate,
      boyfriendKo: '너랑 있으면 내가 좀 이상해져.',
      boyfriendZh: '和你在一起的时候，我会变得有点不像自己。',
      choices: tailorFallbackChoices(dateType, 'intimate_moment', [
        { id: `${dateType}_closer`, text: '贴近他，让他把话说完', affection: 9, trust: 3, secrecy: -5, mood: 7 },
        { id: `${dateType}_black_screen`, text: '把手机扣下，留给门后的第二天', affection: 12, trust: 4, secrecy: -8, mood: 8, riskTag: 'adult_fade' },
        { id: `${dateType}_hold_back`, text: '忍住冲动，提醒他别失控', affection: -1, trust: 4, secrecy: 5, mood: -1 },
      ]),
    },
    {
      type: 'unexpected_event',
      narrative: profile.danger,
      boyfriendKo: '잠깐만. 우리 지금 움직이면 더 티 나.',
      boyfriendZh: '等一下。我们现在动反而更明显。',
      choices: tailorFallbackChoices(dateType, 'unexpected_event', [
        { id: `${dateType}_freeze`, text: '装作陌生人，各自低头看手机', affection: -2, trust: 1, secrecy: 7, mood: -2 },
        { id: `${dateType}_bold`, text: '继续靠在他身边，赌他们不敢拍', affection: 8, trust: 1, secrecy: -10, mood: 6 },
        { id: `${dateType}_split`, text: '分开十分钟后再汇合', affection: 0, trust: 3, secrecy: 5, mood: 0 },
      ]),
    },
    {
      type: 'departure',
      narrative: `${profile.place}的时间到了，甜蜜没有消失，只是开始变成证据。`,
      boyfriendKo: profile.goodbyeKo,
      boyfriendZh: profile.goodbyeZh,
      choices: tailorFallbackChoices(dateType, 'departure', [
        { id: `${dateType}_save_photo`, text: '偷偷拍一张只给自己看的照片', affection: 4, trust: 1, secrecy: -6, mood: 5 },
        { id: `${dateType}_delete_traces`, text: '当场互删定位和聊天预览', affection: -1, trust: 2, secrecy: 6, mood: -1 },
        { id: `${dateType}_promise`, text: '约定下次更疯一点', affection: 6, trust: 2, secrecy: -4, mood: 6 },
      ]),
    },
  ]
}

function generateScenes(dateType: DateType): DateScene[] {
  const scenePool: Partial<Record<DateType, DateScene[]>> = {
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

  return scenePool[dateType] || generateFallbackScenes(dateType)
}

const postDateMessages: Record<DateType, { ko: string; zh: string }> = {
  cafe: { ko: '오늘 커피 맛있었어? 나는 네가 더 맛있었는데 ㅋㅋ 잘 자 ❤️', zh: '今天咖啡好喝吗？我觉得你更甜 哈哈 晚安 ❤️' },
  riverwalk: { ko: '강바람이 좀 추웠나? 다음엔 내 옷 입혀줄게. 보고 싶어.', zh: '江风有点冷吧？下次把我的外套给你穿。想你了。' },
  nightdrive: { ko: '오늘 밤... 잠 안 올 것 같아. 네 생각만 나서.', zh: '今晚……好像睡不着了。满脑子都是你。' },
  privatedinner: { ko: '오늘 밥 맛있었어? 다음엔 내가 직접 해줄게.', zh: '今天饭好吃吗？下次我亲手给你做。' },
  movie: { ko: '영화 재미있었어? 나는 네 손 잡는 게 더 재밌었는데 ㅎㅎ', zh: '电影好看吗？我觉得牵你的手更有意思 呵呵' },
  amusement: { ko: '오늘 진짜 최고였어! 다음에 또 가자, 약속!', zh: '今天真的太棒了！下次再去，说好了！' },
  backdoor: { ko: '아까 문 닫히는 소리 아직도 생각나. 조심히 들어갔어?', zh: '刚才门关上的声音我还在想。你安全到家了吗？' },
  hotel: { ko: '아침까지 네 향 남아있었어. 오늘은 먼저 연락하지 마, 내가 할게.', zh: '到早上都还留着你的香味。今天先别主动联系，我来找你。' },
  airport: { ko: '비행기 타면 바로 문자해. 사람 많았는데도 너만 보였어.', zh: '上飞机就给我发消息。明明人那么多，我只看见你。' },
  studio: { ko: '방금 녹음한 거 너한테 제일 먼저 들려주고 싶어.', zh: '刚录完的那段，我最想第一个放给你听。' },
  home: { ko: '오늘 거실 불빛 생각나서 잠이 안 와. 너무 좋았어.', zh: '一直想起今天客厅的灯光，睡不着。太好了。' },
  brandparty: { ko: '오늘 눈 마주치면 들킬 것 같아서 참느라 죽는 줄.', zh: '今天差点因为和你对视露馅，我忍得快疯了。' },
  convenience: { ko: '딸기우유 보니까 또 너 생각났어. 다음엔 라면까지.', zh: '看到草莓牛奶又想起你了。下次再一起吃拉面。' },
  musicshow: { ko: '무대에서 너 있는 쪽 안 보려고 했는데 실패했어.', zh: '舞台上本来想忍住不看你那边，但失败了。' },
  rooftop: { ko: '옥상 바람 생각나. 네 손 차가웠던 것도.', zh: '一直想起天台的风，还有你冰冰的手。' },
  custom: { ko: '오늘 일은 우리만 알자. 근데 나 계속 생각날 것 같아.', zh: '今天的事只有我们知道。但我可能会一直想。' },
}

function estimateCustomRisk(idea: string): { risk: number; label: string; reason: string } {
  const text = idea.toLowerCase()
  let risk = 3
  if (/酒店|hotel|机场|airport|后台|待机|公司|练习室|宿舍|公寓|车|car|品牌|派对|演唱会|签售|打歌/.test(text)) risk = 5
  if (/公开|人很多|粉丝|站姐|私生|狗仔|直播|同款|合照|亲|过夜/.test(text)) risk = Math.max(risk, 5)
  if (/家里|天台|深夜|便利店|电影|包间|录音室/.test(text)) risk = Math.max(risk, 4)
  if (/只聊天|线上|电话|语音|日记/.test(text)) risk = Math.min(risk, 2)
  const label = risk >= 6 ? '爆炸风险' : risk >= 5 ? '高风险' : risk >= 4 ? '高压' : risk >= 3 ? '中风险' : '低风险'
  const reason = risk >= 5
    ? '这个设定会留下公开动线、镜头或第三方目击，粉丝很容易拼线索。'
    : risk >= 3
      ? '这个设定甜度够高，但同款、时间和小范围目击仍然危险。'
      : '这个设定主要风险来自聊天记录和情绪痕迹。'
  return { risk, label, reason }
}

interface DateSystemProps {
  isOpen: boolean
  onClose: () => void
}

export default function DateSystem({ isOpen, onClose }: DateSystemProps) {
  const maleLead = useGameStore((s) => s.maleLead)
  const player = useGameStore((s) => s.player)
  const risk = useGameStore((s) => s.risk)
  const clueLedger = useGameStore((s) => s.clueLedger)
  const fandomStage = useGameStore((s) => s.fandomStage)
  const paparazziStage = useGameStore((s) => s.paparazziStage)
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
  const [customIdea, setCustomIdea] = useState('')
  const [customPlan, setCustomPlan] = useState<CustomDatePlan | null>(null)
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false)
  const [customError, setCustomError] = useState('')

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
    setCustomIdea('')
    setCustomPlan(null)
    setIsGeneratingCustom(false)
    setCustomError('')
  }, [])

  const handleClose = () => {
    resetDate()
    onClose()
  }

  const handleConfirmRequest = () => {
    if (!selectedDateType) return
    setPhase('prepare')
  }

  const handleStartDate = async () => {
    if (!selectedDateType) return
    if (selectedDateType === 'custom') {
      if (!customIdea.trim()) {
        setCustomError('先写下你想要的约会内容。')
        return
      }
      setIsGeneratingCustom(true)
      setCustomError('')
      const estimate = estimateCustomRisk(customIdea)
      try {
        const plan = await generateCustomDatePlan({
          idea: customIdea,
          boyfriendName: maleLead.name,
          boyfriendStageName: maleLead.stageName,
          boyfriendPersona: maleLead.hiddenPersona,
          relationshipStage: maleLead.relationshipStage,
          affection: maleLead.affection,
          trust: maleLead.trust,
          week: useGameStore.getState().week,
          day: useGameStore.getState().day,
          secrecy: risk.secrecy,
          fanSuspicion: risk.fanSuspicion,
          companyAlert: risk.companyAlert,
          fandomStage,
          paparazziStage,
          recentClues: clueLedger.slice(-6).map((c) => c.description),
        })
        setCustomPlan(plan)
        setScenes(plan.scenes)
      } catch {
        const fallbackPlan: CustomDatePlan = {
          title: '自定义秘密约会',
          risk: estimate.risk,
          affectionBonus: 8 + estimate.risk,
          secrecyImpact: -estimate.risk * 2,
          riskLabel: estimate.label,
          riskReason: estimate.reason,
          scenes: generateFallbackScenes('custom'),
          afterMessageKo: postDateMessages.custom.ko,
          afterMessageZh: postDateMessages.custom.zh,
          delayedConsequence: `${customIdea.slice(0, 20)}这次约会的细节被粉丝从时间线里重新翻出来。`,
        }
        setCustomPlan(fallbackPlan)
        setScenes(fallbackPlan.scenes)
        setCustomError('LLM 暂时不可用，已用本地判定生成约会路线。')
      } finally {
        setIsGeneratingCustom(false)
      }
    } else {
      const generatedScenes = generateScenes(selectedDateType)
      setScenes(generatedScenes)
    }
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
          updateStats({
            fanSuspicion: event.fanSuspicion || 0,
            publicHeat: event.publicHeat || 0,
            companyAlert: event.companyAlert || 0,
            careerPressure: event.careerPressure || 0,
            paparazziAttention: event.paparazziAttention || 0,
            trust: event.trust || 0,
            insiderLeakRisk: event.insiderLeakRisk || 0,
          })
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
    const baseDateConfig = dateTypes.find((d) => d.id === selectedDateType)!
    const dateConfig = selectedDateType === 'custom' && customPlan
      ? {
          ...baseDateConfig,
          name: customPlan.title || baseDateConfig.name,
          risk: customPlan.risk,
          affectionBonus: customPlan.affectionBonus,
          secrecyImpact: customPlan.secrecyImpact,
          riskLabel: customPlan.riskLabel,
          description: customPlan.riskReason,
        }
      : baseDateConfig
    const outfitConfig = outfitConfigs[outfit]
    const giftConfig = giftConfigs[gift]
    const timeConfig = timeConfigs[timeSlot]

    const totalAffection = finalStats.affection + dateConfig.affectionBonus + outfitConfig.affection + giftConfig.affection + timeConfig.bonusMod
    const totalTrust = finalStats.trust + giftConfig.trust
    const totalSecrecy = finalStats.secrecy + dateConfig.secrecyImpact + (outfitConfig.riskMod * -3) + (timeConfig.riskMod * -3)
    const totalMood = finalStats.mood
    const isSpotted = spotted || finalStats.secrecy <= -14 || (dateConfig.risk >= 5 && Math.random() < 0.42)
    if (isSpotted && !spotted) setSpotted(true)

    const score = Math.max(0, Math.min(100, 50 + totalAffection * 2 + totalTrust + totalMood - Math.abs(totalSecrecy)))
    setDateScore(Math.round(score))

    const statChanges: Record<string, number> = {}
    if (totalAffection !== 0) statChanges.affection = totalAffection
    if (totalTrust !== 0) statChanges.trust = totalTrust
    if (totalSecrecy !== 0) statChanges.secrecy = totalSecrecy
    if (totalMood !== 0) statChanges.mood = totalMood
    statChanges.paparazziAttention = Math.max(1, Math.ceil(dateConfig.risk * 1.8))
    statChanges.companyAlert = Math.max(0, dateConfig.risk - 2)
    if (isSpotted) {
      statChanges.fanSuspicion = 12 + dateConfig.risk * 3
      statChanges.publicHeat = 8 + dateConfig.risk * 2
      statChanges.companyAlert = (statChanges.companyAlert || 0) + 8
    }
    if (giftConfig.fanSuspicion > 0 && isSpotted) {
      statChanges.fanSuspicion = (statChanges.fanSuspicion || 0) + giftConfig.fanSuspicion
    }

    updateStats(statChanges)

    const dateTypeName = dateConfig.name
    updateBoyfriendMemory({
      keyMemories: [...maleLead.memory.keyMemories, `第${useGameStore.getState().week}周${dateTypeName}：${isSpotted ? '被发现了！' : '顺利结束'}`],
    })

    addHistoryEntry({
      week: useGameStore.getState().week,
      day: useGameStore.getState().day,
      event: dateTypeName,
      choice: `好感${totalAffection > 0 ? '+' : ''}${totalAffection} 信任${totalTrust > 0 ? '+' : ''}${totalTrust} 保密${totalSecrecy > 0 ? '+' : ''}${totalSecrecy}`,
      consequences: statChanges,
      memoryTags: [dateTypeName, isSpotted ? '被发现' : '安全'],
    })

    if (isSpotted) {
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

    const shouldAddPhoto = isSpotted || (dateConfig.risk >= 3 && Math.random() > 0.25)
    if (shouldAddPhoto) {
      setPhotosAdded(true)
    }
    const snapshot = useGameStore.getState()
    const round = (snapshot.week - 1) * 7 + snapshot.day
    const calendarEvent: CalendarEvent = {
      id: `cal_date_${Date.now()}`,
      title: `${dateTypeName}${isSpotted ? '（疑似被目击）' : ''}`,
      date: `W${snapshot.week}-D${snapshot.day}`,
      time: timeConfigs[timeSlot].label,
      type: 'shared',
      isHighRisk: dateConfig.risk >= 3,
      isCompleted: true,
    }
    const trace: Trace = {
      id: `trace_date_${Date.now()}`,
      type: 'date_result',
      description: `${dateTypeName}结束：${isSpotted ? '被看见，开始产生外部证据。' : '暂时安全，但留下了相册和日程痕迹。'}`,
      round,
      appId: 'calendar',
      screenshotBeforeDelete: isSpotted,
      createdAt: Date.now(),
    }
    const photo: GalleryPhoto | null = shouldAddPhoto ? {
      id: `photo_date_${Date.now()}`,
      title: `${dateTypeName}后的照片`,
      description: isSpotted
        ? '一张本来只想留给自己的照片，背景和时间却足够被粉丝放大。'
        : '只有你们知道含义的照片。甜蜜，但仍然是可被发现的痕迹。',
      riskLevel: dateConfig.risk >= 5 ? 'high' : dateConfig.risk >= 3 ? 'medium' : 'low',
      source: 'date',
      isHidden: !isSpotted,
      isDeleted: false,
      isDiscoveredByFans: isSpotted,
      relatedEventChainId: isSpotted ? 'fan_digging' : undefined,
      createdAt: Date.now(),
    } : null
    const delayedConsequences: DelayedConsequence[] = [
      {
        id: `dc_date_fan_${Date.now()}`,
        triggerRound: round + 1,
        type: 'fan_timeline',
        eventId: `${selectedDateType}_aftershock`,
        content: selectedDateType === 'custom' && customPlan ? customPlan.delayedConsequence : `${dateTypeName}留下的时间线开始被粉丝复盘。`,
        statChanges: { fanSuspicion: 5 + dateConfig.risk, publicHeat: isSpotted ? 4 : 1 },
        isTriggered: false,
      },
    ]
    if (dateConfig.risk >= 4 || isSpotted) {
      delayedConsequences.push({
        id: `dc_date_dispatch_${Date.now()}`,
        triggerRound: round + 2,
        type: 'dispatch_tip',
        eventId: `${selectedDateType}_route`,
        content: `${dateTypeName}附近出现重复动线，狗仔开始交叉验证车牌、CCTV 和粉丝路透。`,
        statChanges: { paparazziAttention: 6 + dateConfig.risk, paparazziHeat: 6 + dateConfig.risk * 2, companyAlert: 4 },
        isTriggered: false,
      })
    }
    const notification: Notification = {
      id: `notif_date_${Date.now()}`,
      app: isSpotted ? 'weverse' : 'gallery',
      title: isSpotted ? '约会目击开始发酵' : '约会痕迹已保存',
      content: isSpotted ? '粉丝和狗仔都会从这次约会里拿到东西。' : '相册和日程已经留下甜蜜但危险的痕迹。',
      urgency: isSpotted ? 'high' : 'medium',
      isRead: false,
      createdAt: Date.now(),
    }
    useGameStore.setState((state) => {
      const hiddenRiskChanges = {
        paparazziHeat: dateConfig.risk * 4 + (isSpotted ? 14 : 3),
        lovestagramScore: dateConfig.risk * 3 + (totalAffection > 10 ? 5 : 0),
        coupleItemScore: gift !== 'none' || outfit === 'dressup' ? 6 : 1,
        timelineOverlap: dateConfig.risk * 4 + (timeSlot === 'evening' ? 4 : 0),
        insiderLeakRisk: dateConfig.id === 'backdoor' || dateConfig.id === 'studio' || dateConfig.id === 'brandparty' ? 8 : 2,
      }
      const hiddenRisk = { ...state.hiddenRisk }
      for (const [key, value] of Object.entries(hiddenRiskChanges)) {
        const riskKey = key as keyof typeof hiddenRisk
        hiddenRisk[riskKey] = Math.max(0, Math.min(100, hiddenRisk[riskKey] + value))
      }
      return {
        calendar: { ...state.calendar, events: [...state.calendar.events, calendarEvent] },
        gallery: photo ? { ...state.gallery, photos: [...state.gallery.photos, photo] } : state.gallery,
        traces: [...state.traces, trace],
        hiddenRisk,
        delayedConsequences: [...state.delayedConsequences, ...delayedConsequences],
        notifications: [...state.notifications, notification],
        weverse: isSpotted ? {
          ...state.weverse,
          posts: [
            ...state.weverse.posts,
            {
              id: `wv_date_${Date.now()}`,
              type: 'analysis',
              author: 'late_night_zip',
              title: '어제 목격담 이거 맞아?',
              content: `${dateTypeName}附近出现疑似目击。还没有清晰照片，但地点、时间和${state.maleLead.stageName}的空白行程对上了。`,
              heat: Math.min(100, 45 + state.risk.fanSuspicion + dateConfig.risk * 6),
              comments: 180 + dateConfig.risk * 40,
              isPlayerAlt: false,
              relatedEvidenceIds: state.evidenceFragments.slice(-4).map((e) => e.id),
              createdAt: Date.now(),
            },
          ],
        } : state.weverse,
        dispatch: dateConfig.risk >= 4 ? {
          ...state.dispatch,
          tips: [
            ...state.dispatch.tips,
            {
              id: `dp_date_${Date.now()}`,
              type: isSpotted ? 'blur_photo' : 'clue',
              content: isSpotted ? `${dateTypeName}附近流出一张模糊背影，正在确认身份。` : `${dateTypeName}动线被记录，暂时还缺决定性照片。`,
              heatLevel: Math.min(100, 30 + state.risk.paparazziAttention + dateConfig.risk * 8),
              createdAt: Date.now(),
            },
          ],
        } : state.dispatch,
      }
    })

    const postMsg = selectedDateType === 'custom' && customPlan
      ? { ko: customPlan.afterMessageKo, zh: customPlan.afterMessageZh }
      : postDateMessages[selectedDateType]
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

              {selectedDateType === 'custom' && (
                <div className="mb-5">
                  <p className="text-white/50 text-xs mb-2">自定义约会描述</p>
                  <textarea
                    value={customIdea}
                    onChange={(e) => {
                      setCustomIdea(e.target.value)
                      setCustomError('')
                    }}
                    placeholder="例如：想在打歌结束后的地下停车场见他十分钟，他戴着帽子，我故意把同款戒指露出来..."
                    className="w-full h-24 px-3 py-2 rounded-xl text-sm outline-none resize-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                    }}
                  />
                  <div
                    className="mt-2 px-3 py-2 rounded-lg"
                    style={{
                      background: 'rgba(168,85,247,0.08)',
                      border: '1px solid rgba(168,85,247,0.15)',
                    }}
                  >
                    <p className="text-purple-200 text-[10px]">
                      LLM 会按地点公开程度、CCTV、粉丝密度、公司动线、同款和延迟后果判定风险。
                    </p>
                    {customIdea.trim() && (
                      <p className="text-white/45 text-[10px] mt-1">
                        本地预判：{estimateCustomRisk(customIdea).label} · {estimateCustomRisk(customIdea).reason}
                      </p>
                    )}
                    {customError && <p className="text-orange-300 text-[10px] mt-1">{customError}</p>}
                  </div>
                </div>
              )}

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
                  disabled={isGeneratingCustom}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #ff2d78, #ff6b9d)',
                    color: 'white',
                    boxShadow: '0 0 15px rgba(255,45,120,0.3)',
                  }}
                >
                  {isGeneratingCustom ? '生成中...' : '出发约会'}
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
                  ko={selectedDateType === 'custom' && customPlan ? customPlan.afterMessageKo : selectedDateType ? postDateMessages[selectedDateType].ko : ''}
                  zh={selectedDateType === 'custom' && customPlan ? customPlan.afterMessageZh : selectedDateType ? postDateMessages[selectedDateType].zh : ''}
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
