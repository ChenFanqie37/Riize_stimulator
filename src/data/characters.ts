import type { RIIZEMember, BoyfriendPersona, NPC } from '../types/game'

export interface MemberData {
  memberId: RIIZEMember
  nameZh: string
  stageName: string
  birthYear: number
  position: string
  persona: string
  hiddenPersonaPool: BoyfriendPersona[]
  romanceDangerZone: string
  initialAffection: number
  initialTrust: number
  chatStyle: string
  jealousyLevel: number
  careerObsession: number
  emoji: string
  avatar: string
}

export const riizeMembers: MemberData[] = [
  {
    memberId: 'shotaro',
    nameZh: '将太郎',
    stageName: 'SHOTARO',
    birthYear: 2000,
    position: '主舞/领唱',
    persona: '温柔到让人误以为对谁都一样的暖男，笑容是他的铠甲。擅长用肢体语言表达情感，但真正的心意藏在细节里。对粉丝极其体贴，对恋人却常常因为"不想让任何人受伤"而犹豫不决。',
    hiddenPersonaPool: ['true_love', 'central_ac', 'avoidant'],
    romanceDangerZone: '他的温柔是双刃剑——你以为你是特别的，直到你发现他对每个人都那么好。当你终于忍不住质问时，他会用最温柔的方式让你觉得自己在无理取闹。',
    initialAffection: 15,
    initialTrust: 20,
    chatStyle: '用很多emoji，语气温柔但回复慢，经常发语音说"想听你的声音"',
    jealousyLevel: 3,
    careerObsession: 5,
    emoji: '🦊',
    avatar: '🦊'
  },
  {
    memberId: 'eunseok',
    nameZh: '宋银硕',
    stageName: 'EUNSEOK',
    birthYear: 2001,
    position: '领舞/门面',
    persona: '外表冷酷内心细腻的矛盾体，嘴上说着不在意，眼神却一直在追踪你的位置。毒舌是他的保护色，但深夜的kakaoTalk暴露了真实的柔软。占有欲极强却从不承认。',
    hiddenPersonaPool: ['avoidant', 'narcissist', 'secret_trauma'],
    romanceDangerZone: '他的冷淡会逼疯你，但当你真的要走的时候，他会用最卑微的方式挽留。问题是——第二天他又变回那个冷冰冰的宋银硕，让你怀疑昨晚的一切是不是幻觉。',
    initialAffection: 10,
    initialTrust: 15,
    chatStyle: '短句为主，偶尔突然发一大段话又秒撤回，深夜消息比白天多三倍',
    jealousyLevel: 8,
    careerObsession: 6,
    emoji: '🐱',
    avatar: '🐱'
  },
  {
    memberId: 'sungchan',
    nameZh: '郑成灿',
    stageName: 'SUNGCHAN',
    birthYear: 2001,
    position: '主Rap/门面',
    persona: '完美主义者的温柔陷阱。看起来是最佳男友模板——体贴、上进、有规划。但他的"完美"是有代价的：你永远在他的时间表里排第二，第一永远是事业。他会给你最好的，但不会给你全部。',
    hiddenPersonaPool: ['career_freak', 'true_love', 'central_ac'],
    romanceDangerZone: '他会在你面前规划你们的未来，让你觉得一切都在掌控中。但当你发现他的未来蓝图里根本没有你的位置时，那种被精心设计的幻觉崩塌比直接被抛弃更痛。',
    initialAffection: 12,
    initialTrust: 25,
    chatStyle: '条理清晰，喜欢用列表，会提前确认约会时间地点，但临时取消率30%',
    jealousyLevel: 5,
    careerObsession: 9,
    emoji: '🐻',
    avatar: '🐻'
  },
  {
    memberId: 'wonbin',
    nameZh: '朴元彬',
    stageName: 'WONBIN',
    birthYear: 2002,
    position: '领舞/视觉中心',
    persona: '人间致命吸引力的代名词。不需要刻意做什么，存在本身就是一场心动。但他的致命魅力是公共财产——你永远在和全世界分享他。他给你的甜蜜，明天就会出现在粉丝的剪辑里。',
    hiddenPersonaPool: ['playboy', 'central_ac', 'secret_trauma'],
    romanceDangerZone: '他的每一个眼神都能让你沦陷，但那些眼神不属于你一个人。当你在粉丝视频里看到他对别人露出同样的笑容时，你会开始怀疑自己到底是不是特别的那个。',
    initialAffection: 18,
    initialTrust: 12,
    chatStyle: '发自拍频率极高，不怎么看消息但会突然出现说"想你了"，喜欢用表情包代替文字',
    jealousyLevel: 6,
    careerObsession: 4,
    emoji: '🐰',
    avatar: '🐰'
  },
  {
    memberId: 'sohee',
    nameZh: '李炤熙',
    stageName: 'SOHEE',
    birthYear: 2003,
    position: '主唱',
    persona: '看起来是最好拿捏的忙内，实际上是情感操控的天才。用无辜的眼神和撒娇让你心软，但他的需求永远排在第一位。你以为你在照顾他，其实你一直在被他牵着走。',
    hiddenPersonaPool: ['narcissist', 'playboy', 'true_love'],
    romanceDangerZone: '他会让你觉得自己是全世界最重要的人——在他需要你的时候。但当他不需要你的时候，你的消息可以已读不回三天。最可怕的是，他每次回来都能让你原谅他。',
    initialAffection: 20,
    initialTrust: 10,
    chatStyle: '撒娇语音消息轰炸，"姐姐/姐姐~"频率极高，深夜emo长文，已读不回后突然出现',
    jealousyLevel: 7,
    careerObsession: 5,
    emoji: '🐹',
    avatar: '🐹'
  },
  {
    memberId: 'anton',
    nameZh: '李灿荣',
    stageName: 'ANTON',
    birthYear: 2004,
    position: '主唱/忙内',
    persona: '混血忙内的双面人生。在镜头前是乖巧可爱的忙内，私下却是有着超越年龄成熟感的观察者。他的沉默比任何言语都更有杀伤力——你永远不知道他在想什么，但你知道他在看着你。',
    hiddenPersonaPool: ['secret_trauma', 'avoidant', 'true_love'],
    romanceDangerZone: '他太年轻了，年轻到让你觉得一切都可以被原谅。但他的沉默里藏着你看不见的深渊。当你终于走进他的内心，你会发现那里的伤痕比你想象的深得多——而你可能不是那个能治愈他的人。',
    initialAffection: 14,
    initialTrust: 18,
    chatStyle: '很少主动发消息，但回复质量极高，偶尔发英文歌歌词，沉默时比说话更可怕',
    jealousyLevel: 4,
    careerObsession: 7,
    emoji: '🐶',
    avatar: '🐶'
  }
]

export interface NPCTemplate {
  id: string
  role: string
  nameZh: string
  defaultName: string
  description: string
  defaultIntimacy: number
  defaultSuspicion: number
  defaultTrust: number
  avatar: string
  functionInGame: string
  dialogueStyle: string
}

export const npcTemplates: NPCTemplate[] = [
  {
    id: 'bestie',
    role: '闺蜜/室友',
    nameZh: '闺蜜/室友',
    defaultName: '闺蜜',
    description: '和你合租的闺蜜，是你在韩国最亲近的人。她知道你所有的秘密，也总是在你做傻事的时候试图拉你一把——虽然你经常不听。',
    defaultIntimacy: 70,
    defaultSuspicion: 10,
    defaultTrust: 65,
    avatar: '👩',
    functionInGame: '情感支持、现实提醒、偶尔的通风报信。当你被恋爱冲昏头脑时，她是唯一的清醒剂。',
    dialogueStyle: '直球吐槽为主，"你是不是疯了"是口头禅，但关键时刻永远站在你这边'
  },
  {
    id: 'fan_friend',
    role: '布栗子追星搭子',
    nameZh: '布栗子追星搭子',
    defaultName: '敏贞',
    description: '同为RIIZE粉丝的朋友，追星经验丰富，对粉圈生态了如指掌。她不知道你和爱豆在谈恋爱——而她正是那个最可能扒出真相的人。',
    defaultIntimacy: 45,
    defaultSuspicion: 20,
    defaultTrust: 40,
    avatar: '🌟',
    functionInGame: '粉圈情报来源、追星活动同伴、潜在的最大威胁。她掌握的粉丝分析能力可能成为你的噩梦。',
    dialogueStyle: '追星术语密集，分析能力惊人，"我跟你讲这个瓜超大的"是开场白'
  },
  {
    id: 'childhood_friend',
    role: '青梅竹马',
    nameZh: '青梅竹马',
    defaultName: '俊赫',
    description: '从小一起长大的男生，目前在首尔读研。他一直喜欢你，但你只把他当朋友。当你和爱豆的关系出现问题时，他总是第一个出现。',
    defaultIntimacy: 55,
    defaultSuspicion: 5,
    defaultTrust: 60,
    avatar: '🧑',
    functionInGame: '安全港湾、情感备选项、男朋友的嫉妒触发器。他的存在让恋爱关系多了一层张力。',
    dialogueStyle: '温和但坚定，从不说破自己的心意，"需要我的时候随时打电话"是标配'
  },
  {
    id: 'mom',
    role: '妈妈',
    nameZh: '妈妈',
    defaultName: '妈妈',
    description: '远在中国的妈妈，每周视频通话。她不知道你在韩国和一个爱豆谈恋爱，只知道你说"学业很忙"。她的直觉很准，你越来越心虚。',
    defaultIntimacy: 80,
    defaultSuspicion: 15,
    defaultTrust: 75,
    avatar: '👩‍🦳',
    functionInGame: '亲情锚点、道德压力来源、现实检验。每次和她通话都是一次灵魂拷问。',
    dialogueStyle: '唠叨中带着关心，"你最近是不是瘦了""有没有好好吃饭"，直觉惊人'
  },
  {
    id: 'dad',
    role: '爸爸',
    nameZh: '爸爸',
    defaultName: '爸爸',
    description: '沉默寡言的父亲，不善于表达感情，但会默默打钱。如果他知道你在和一个韩国爱豆谈恋爱，大概会直接买机票飞过来。',
    defaultIntimacy: 60,
    defaultSuspicion: 10,
    defaultTrust: 70,
    avatar: '👨‍🦳',
    functionInGame: '经济后盾（有限）、家庭压力来源、沉默的爱。他的一个电话比任何人的质问都沉重。',
    dialogueStyle: '话少但每句都有分量，"钱够不够""注意安全"，偶尔冒出一句让你泪崩的话'
  },
  {
    id: 'manager',
    role: '经纪人',
    nameZh: '经纪人',
    defaultName: '金代理',
    description: 'RIIZE的负责经纪人，职业素养极高，对成员的私生活有着雷达般的敏锐。他/她可能已经注意到了什么，只是在等一个确认。',
    defaultIntimacy: 10,
    defaultSuspicion: 40,
    defaultTrust: 15,
    avatar: '👔',
    functionInGame: '公司监控的代理人、关系暴露的最大威胁之一、偶尔的意外盟友（如果他觉得保护成员=保护你）。',
    dialogueStyle: '公事公办，措辞精准，"有些事情你应该知道分寸"是警告信号'
  },
  {
    id: 'collab_partner',
    role: '圈内合作对象',
    nameZh: '圈内合作对象',
    defaultName: '秀妍',
    description: '和RIIZE有合作的女艺人，漂亮、专业、和你的男朋友在工作中有大量接触。她可能只是正常社交，但在你眼里每一个互动都是威胁。',
    defaultIntimacy: 15,
    defaultSuspicion: 30,
    defaultTrust: 20,
    avatar: '💃',
    functionInGame: '嫉妒触发器、社交压力来源、潜在的情敌或盟友。她的每一条Instagram动态都是一次心跳加速。',
    dialogueStyle: '礼貌而疏离，社交场合滴水不漏，"我们只是工作关系"——但你信吗？'
  },
  {
    id: 'fan_leader',
    role: '粉圈关键人物',
    nameZh: '粉圈关键人物',
    defaultName: '恩雅',
    description: 'RIIZE粉圈的大粉/站姐，拥有数万粉丝，分析能力堪比侦探。她可能已经在拼凑某些碎片了——而你正是那个缺失的关键拼图。',
    defaultIntimacy: 5,
    defaultSuspicion: 50,
    defaultTrust: 5,
    avatar: '🔍',
    functionInGame: '粉圈舆论的操控者、扒皮事件的核心推动者、你的最大潜在敌人。她的一条帖子可以引爆一切。',
    dialogueStyle: '分析型发言，数据说话，"姐妹们我觉得有情况"是核弹级预告'
  }
]

export function createNPCFromTemplate(template: NPCTemplate, customName?: string): NPC {
  return {
    id: template.id,
    role: template.role,
    name: customName || template.defaultName,
    intimacy: template.defaultIntimacy,
    suspicion: template.defaultSuspicion,
    trust: template.defaultTrust,
    memoryTags: [],
    avatar: template.avatar
  }
}

export function getMemberData(memberId: RIIZEMember): MemberData {
  return riizeMembers.find(m => m.memberId === memberId)!
}

export function getRandomPersona(memberId: RIIZEMember): BoyfriendPersona {
  const member = getMemberData(memberId)
  const pool = member.hiddenPersonaPool
  return pool[Math.floor(Math.random() * pool.length)]
}
