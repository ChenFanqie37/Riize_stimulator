import type { PlayerIdentity } from '../types/game'

export interface IdentityData {
  id: PlayerIdentity
  nameZh: string
  description: string
  advantages: string[]
  disadvantages: string[]
  specialAbility: string
  specialAbilityDescription: string
  specialRisk: string
  specialRiskDescription: string
  startingMoney: number
  startingMood: number
  startingPopularity: number
  startingLifeStability: number
  encounterScenario: string
}

export const identities: IdentityData[] = [
  {
    id: 'student',
    nameZh: '留学生',
    description: '在首尔读大学的留学生，课业之余偶然闯入了他的世界。你的普通反而是最大的保护色——没人会怀疑一个普通留学生和爱豆有什么关系。',
    advantages: [
      '时间相对自由，可以配合他的行程',
      '学生身份是最好的掩护，不容易引起怀疑',
      '校园社交圈和娱乐圈天然隔离，风险较低',
      '可以借学习之名留在韩国'
    ],
    disadvantages: [
      '经济条件有限，约会开销是压力',
      '签证状态受学业影响，挂科=可能被迫回国',
      '社交圈太小，容易被孤立',
      '课业和恋爱难以平衡'
    ],
    specialAbility: '校园庇护',
    specialAbilityDescription: '当风险值上升时，可以触发"只是同学"的掩护事件，降低公众怀疑。每学期可使用一次，效果随学期递减。',
    specialRisk: '签证危机',
    specialRiskDescription: '如果连续两周mood低于30或lifeStability低于20，触发签证审查事件，可能被迫中断恋爱关系回国。',
    startingMoney: 30,
    startingMood: 60,
    startingPopularity: 10,
    startingLifeStability: 50,
    encounterScenario: '在弘大的咖啡店赶论文，他戴着口罩坐在角落，你们因为同一个插座搭了话。'
  },
  {
    id: 'fan',
    nameZh: '布栗子/海外粉丝',
    description: 'RIIZE的忠实粉丝，追过每一场签售，投过每一票。你比任何人都了解他——直到你发现，了解一个爱豆和爱一个人完全是两回事。',
    advantages: [
      '对他的行程了如指掌，不会错过见面机会',
      '粉丝身份让你有正当理由出现在他附近',
      '粉圈人脉可以获取情报',
      '你知道他的喜好，初期好感度加成'
    ],
    disadvantages: [
      '粉丝身份是最大的双刃剑——被发现=粉圈地震',
      '从粉丝到恋人的身份转变极其危险',
      '粉圈内部可能有人盯上你',
      '你的追星记录都是潜在证据'
    ],
    specialAbility: '粉丝直觉',
    specialAbilityDescription: '可以预感粉圈舆论走向，在扒皮事件发生前24小时获得预警。但使用后自身fanSuspicion+10。',
    specialRisk: '粉圈反噬',
    specialRiskDescription: '如果恋情暴露，你将从"幸运粉丝"变成"背叛者"，粉圈会扒出你所有追星记录，甚至人肉你的真实身份。',
    startingMoney: 40,
    startingMood: 70,
    startingPopularity: 20,
    startingLifeStability: 40,
    encounterScenario: '签售会上你们的眼神交汇比规定时间多了两秒，散场后他在出口"恰好"和你走了同一条路。'
  },
  {
    id: 'intern',
    nameZh: '娱乐公司实习生',
    description: '在同属一个集团旗下的子公司实习，偶尔能在公司走廊里遇到他。你比任何人都清楚这个行业的规则——也清楚打破规则的代价。',
    advantages: [
      '公司内部通行证，有合理理由出现在他附近',
      '了解行业规则，知道什么能做什么不能做',
      '可以获取公司内部信息（行程、通告等）',
      '职业发展前景可以成为留在韩国的理由'
    ],
    disadvantages: [
      '公司监控最严，一举一动都在眼皮底下',
      '实习转正的压力让你不敢有任何闪失',
      '如果被发现，丢掉的不只是恋爱还有职业生涯',
      '同事可能是眼线'
    ],
    specialAbility: '内部消息',
    specialAbilityDescription: '每周可以获取一条公司内部情报（行程变动、公司态度、危机预警），但每次使用companyAlert+5。',
    specialRisk: '职业死刑',
    specialRiskDescription: '如果恋情被公司发现，你将面临立即解雇+行业封杀。韩国娱乐圈的潜规则：实习生不配和爱豆谈恋爱。',
    startingMoney: 35,
    startingMood: 50,
    startingPopularity: 15,
    startingLifeStability: 55,
    encounterScenario: '加班到深夜，在便利店遇到同样加班结束的他。你们买的是同一个牌子的咖啡。'
  },
  {
    id: 'staff',
    nameZh: '音乐节目工作人员',
    description: '在打歌节目后台工作的staff，每周都能见到他。你们之间的距离只有一个后台通行证——和一条不可逾越的职业红线。',
    advantages: [
      '每周固定见面机会，不需要额外安排',
      '工作互动是天然的掩护',
      '可以照顾他的后台需求（递水、整理等）建立亲密感',
      '了解节目录制流程，知道什么时候最容易独处'
    ],
    disadvantages: [
      '工作场合的亲密最容易被同事发现',
      '职业伦理是巨大压力——你在利用职务之便',
      '节目组有监控，后台不是法外之地',
      '其他爱豆的粉丝也可能注意到你'
    ],
    specialAbility: '后台时刻',
    specialAbilityDescription: '每周打歌日可以触发一次独处事件，获得额外互动机会。但如果被其他staff看到，companyAlert+15。',
    specialRisk: '职业举报',
    specialRiskDescription: '如果同事察觉异常，可能被匿名举报到公司。一旦被举报，你将失去这份工作和他见面的唯一渠道。',
    startingMoney: 45,
    startingMood: 55,
    startingPopularity: 15,
    startingLifeStability: 60,
    encounterScenario: '打歌后台，他因为耳返问题焦躁不安，你是唯一注意到并递上备用耳返的人。'
  },
  {
    id: 'stylist',
    nameZh: '造型/妆发助理',
    description: '给RIIZE做造型的助理，你的手曾无数次穿过他的头发。最近距离的接触，最危险的暧昧——每一次触碰都在试探底线。',
    advantages: [
      '身体接触是工作的一部分，不会引起怀疑',
      '造型间是天然私密空间',
      '你可以改变他的形象——他依赖你的专业',
      '行程完全同步，不需要额外协调时间'
    ],
    disadvantages: [
      '其他成员和造型师都在旁边，几乎没有真正的独处时间',
      '工作关系让感情界限模糊，他可能分不清依赖和爱',
      '造型师圈子八卦传播速度极快',
      '你的职业发展绑定了他，分手=失业'
    ],
    specialAbility: '指尖密码',
    specialAbilityDescription: '造型过程中可以通过触碰传递隐秘信号，每次使用affection+5且不增加风险。但连续使用3次后会被其他staff注意到。',
    specialRisk: '职业绑定',
    specialRiskDescription: '你的工作完全依赖他所在组合。如果关系破裂，你不仅失去恋人，还必须面对每天给他的新女友做造型的地狱。',
    startingMoney: 40,
    startingMood: 55,
    startingPopularity: 20,
    startingLifeStability: 50,
    encounterScenario: '第一次给他做造型，你整理他刘海的时候他突然抓住了你的手腕，说了声"轻一点"。'
  },
  {
    id: 'translator',
    nameZh: '翻译/海外商务助理',
    description: '负责RIIZE海外活动的翻译，你的多语言能力让你成为团队不可或缺的一员。你翻译的每一个字都可能藏着只有你们懂的双关。',
    advantages: [
      '海外行程必须随行，有大量独处机会',
      '翻译身份让你可以控制信息流向',
      '海外环境远离韩国粉圈，风险较低',
      '专业能力让你有不可替代性'
    ],
    disadvantages: [
      '海外行程时差导致和国内朋友脱节',
      '你可能需要翻译他和别人的甜蜜互动',
      '商务场合的社交压力巨大',
      '你的护照和签证状态受工作绑定'
    ],
    specialAbility: '语言密码',
    specialAbilityDescription: '在公开场合可以用他听不懂的语言传递秘密信息，或在翻译中加入只有你们理解的暗语。每次使用affection+3，不增加风险。',
    specialRisk: '信息囚笼',
    specialRiskDescription: '你掌握着太多秘密——他的、公司的、其他成员的。如果关系恶化，你可能成为各方争夺或消除的信息源。',
    startingMoney: 55,
    startingMood: 50,
    startingPopularity: 15,
    startingLifeStability: 65,
    encounterScenario: '海外拍摄现场，你帮他翻译粉丝问题的时候，他在你耳边用不太标准的中文说了句"谢谢，你真好"。'
  },
  {
    id: 'volunteer',
    nameZh: '校园文化活动志愿者',
    description: '在学校文化祭志愿活动中遇到来参加校园活动的他，你们的交集本应只有那一天。但有些缘分，一天就够了。',
    advantages: [
      '校园环境天然安全，不容易被跟踪',
      '志愿者身份单纯，不会引起怀疑',
      '活动结束后有自然的联系方式交换理由',
      '校园恋爱感最强，最像普通情侣'
    ],
    disadvantages: [
      '见面机会极少，主要靠线上维系',
      '没有行业资源，遇到危机时求助无门',
      '他可能觉得你只是活动认识的普通人，初期亲密度低',
      '异地感强，容易产生信任危机'
    ],
    specialAbility: '校园约定',
    specialAbilityDescription: '可以约定在校园秘密见面，每次见面affection+8且风险极低。但每月只能触发一次，且需要提前一周预约。',
    specialRisk: '渐行渐远',
    specialRiskDescription: '因为见面机会少，关系容易进入"手机恋爱"状态。如果连续三周没有见面，affection每周-5，trust每周-3。',
    startingMoney: 25,
    startingMood: 65,
    startingPopularity: 5,
    startingLifeStability: 55,
    encounterScenario: '校园文化祭，他被你的摊位吸引，用不太流利的韩语问你推荐什么。你用更不流利的韩语回答了他。'
  },
  {
    id: 'parttime',
    nameZh: '咖啡店/便利店/花店兼职生',
    description: '在首尔打工维持生活的留学生，他的常去之地恰好是你的工作地点。每一次他推门进来，你的心跳都比收银机的声音还响。',
    advantages: [
      '固定地点见面，有自然的互动场景',
      '服务行业的职业素养是最好的演技训练',
      '可以记住他的喜好制造惊喜',
      '经济独立虽然辛苦但有底气'
    ],
    disadvantages: [
      '工作时间不自由，很难配合他的行程',
      '经济压力大，约会开销是负担',
      '同事和常客可能注意到你们的互动',
      '打工疲惫影响情绪和精力'
    ],
    specialAbility: '专属服务',
    specialAbilityDescription: '可以为他准备专属的"隐藏菜单"或特别服务，每次使用affection+6。但如果被其他顾客注意到，fanSuspicion+8。',
    specialRisk: '经济崩溃',
    specialRiskDescription: '如果因为恋爱影响打工出勤率，收入下降→生活不稳定→无法续签→被迫回国。经济是悬在头顶的达摩克利斯之剑。',
    startingMoney: 20,
    startingMood: 45,
    startingPopularity: 10,
    startingLifeStability: 35,
    encounterScenario: '凌晨的便利店，他戴着帽子和口罩进来买泡面，你认出了他手上的戒指。结账时他轻声说了句"别认出来"。'
  },
  {
    id: 'custom',
    nameZh: '自定义身份',
    description: '创造你自己的身份，书写你自己的相遇故事。自由度最高，但没有预设的优势保护。',
    advantages: [
      '完全自定义，可以设计最适合你的相遇方式',
      '没有预设的刻板印象，角色扮演自由度高',
      '可以针对特定成员设计最佳攻略路线'
    ],
    disadvantages: [
      '没有预设优势，一切从零开始',
      '没有特殊能力保护，风险完全自担',
      '需要自己平衡各项初始数值',
      '没有预设的剧情锚点，可能缺乏方向感'
    ],
    specialAbility: '命运改写',
    specialAbilityDescription: '游戏开始时可以重新分配一次初始属性点（总计不超过200点），且第一次危机事件可以选择回避。',
    specialRisk: '命运无常',
    specialRiskDescription: '没有身份保护意味着任何危机都是满额伤害。当风险值超过70时，所有负面事件的效果+30%。',
    startingMoney: 35,
    startingMood: 55,
    startingPopularity: 10,
    startingLifeStability: 45,
    encounterScenario: '由你自己书写。'
  }
]

export function getIdentityData(id: PlayerIdentity): IdentityData {
  return identities.find(i => i.id === id)!
}

export function getIdentityNameZh(id: PlayerIdentity): string {
  return getIdentityData(id).nameZh
}
