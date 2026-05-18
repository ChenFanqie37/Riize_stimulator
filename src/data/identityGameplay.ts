import type { AppName, PlayerIdentity } from '@/types/game'

export type IdentityChoiceTone = 'sweet' | 'danger' | 'control' | 'quiet' | 'work'

export interface IdentityIncidentScript {
  id: string
  label: string
  detail: string
  app: AppName
  tone: IdentityChoiceTone
  statChanges: Record<string, number>
  historyChoice: string
  notificationTitle: string
  notificationContent: string
  artifact:
    | { type: 'note'; title: string; content: string }
    | { type: 'calendar'; title: string; time: string; isHighRisk: boolean }
    | { type: 'company'; level: 'gentle' | 'warning' | 'summon'; title: string; content: string }
    | { type: 'weverse'; title: string; content: string }
    | { type: 'naver'; title: string; summary: string }
    | { type: 'gallery'; title: string; description: string; riskLevel: 'low' | 'medium' | 'high'; source: string }
}

export const identityIncidentScripts: Record<PlayerIdentity, IdentityIncidentScript> = {
  fan: {
    id: 'fan_radar',
    label: '用粉籍反查风向',
    detail: '打开 Weverse 小号，把粉圈危险词先捞出来，再决定要不要装无辜。',
    app: 'weverse',
    tone: 'control',
    statChanges: { fanSuspicion: -3, publicHeat: 2, rumorCredibility: 3, insiderLeakRisk: 3 },
    historyChoice: '用粉籍反查舆论风向',
    notificationTitle: '粉圈风向已记录',
    notificationContent: '你提前知道她们在扒“时间线”和“同款”，但小号活动也留下了痕迹。',
    artifact: {
      type: 'weverse',
      title: '【风向】今晚别急着锤，关键词先存',
      content: '现在危险词是时间线、同款、下班路线。分析党还没拿到实锤，控评可以先压“别造谣”，但别刷太整齐。',
    },
  },
  student: {
    id: 'student_alibi',
    label: '做一份校园不在场证明',
    detail: '打开备忘录，把课表、图书馆打卡和朋友证词整理成可用挡箭牌。',
    app: 'notes',
    tone: 'quiet',
    statChanges: { secrecy: 5, fanSuspicion: -2, lifeStability: -1, mood: -1 },
    historyChoice: '用校园行程做不在场证明',
    notificationTitle: '校园口径已整理',
    notificationContent: '普通学生身份变成了遮掩：她们很难把你和艺人行程直接钉死。',
    artifact: {
      type: 'note',
      title: '校园口径',
      content: '今天如果有人问：下午在图书馆，晚上和同学讨论作业。不要提便利店、车、后台、同款。',
    },
  },
  intern: {
    id: 'intern_schedule',
    label: '查内部排期压风险',
    detail: '打开公司通知，确认经纪人和成员动线，代价是公司会留下你的查询痕迹。',
    app: 'companyNotice',
    tone: 'work',
    statChanges: { secrecy: 4, trust: 2, companyAlert: 5, insiderLeakRisk: 4 },
    historyChoice: '用实习权限查内部排期',
    notificationTitle: '内部排期已同步',
    notificationContent: '你拿到了非公开通道调整，但你的账号查询记录也会进入公司系统。',
    artifact: {
      type: 'company',
      level: 'gentle',
      title: '内部动线提醒',
      content: '今日后台 B 通道临时封闭，艺人动线改走 C 区。非相关人员请勿反复查询同一成员排期。',
    },
  },
  staff: {
    id: 'staff_route',
    label: '用后台流程改动线',
    detail: '打开日程，把你们可能重合的走廊改成“工作交接”。',
    app: 'calendar',
    tone: 'work',
    statChanges: { secrecy: 5, companyAlert: 4, timelineOverlap: -4, trust: 1 },
    historyChoice: '用工作人员流程改动线',
    notificationTitle: '后台动线已重排',
    notificationContent: '你把一次危险重合伪装成工作交接，但同事可能开始记住你。',
    artifact: {
      type: 'calendar',
      title: '后台交接：C 区临时确认',
      time: '18:40',
      isHighRisk: true,
    },
  },
  stylist: {
    id: 'stylist_decoy',
    label: '改造型制造烟雾弹',
    detail: '打开相册，保存一张造型记录，把同款线索改成工作素材。',
    app: 'gallery',
    tone: 'work',
    statChanges: { coupleItemScore: -5, companyAlert: 3, affection: 2, fanSuspicion: -2 },
    historyChoice: '用造型记录稀释同款证据',
    notificationTitle: '造型烟雾弹已生成',
    notificationContent: '同款变成了工作素材，但造型组会更容易注意到你的手。',
    artifact: {
      type: 'gallery',
      title: '造型间备份图',
      description: '一张能解释同款配饰来源的工作照片。它能压粉丝猜测，也会留下后台痕迹。',
      riskLevel: 'medium',
      source: 'styling',
    },
  },
  translator: {
    id: 'translator_keyword',
    label: '改关键词翻译口径',
    detail: '打开 Naver，用翻译和搜索词把热度导向“海外活动误读”。',
    app: 'naver',
    tone: 'control',
    statChanges: { publicHeat: -3, fanSuspicion: -2, lovestagramScore: 2, trust: 2 },
    historyChoice: '用翻译口径改关键词',
    notificationTitle: '搜索口径已改写',
    notificationContent: '你把暧昧线索翻成了活动误读，但他知道你在替他挡。',
    artifact: {
      type: 'naver',
      title: '海外活动翻译误读引发粉丝讨论',
      summary: '部分海外饭拍字幕被误读为私人暗号，相关关键词开始转向“翻译偏差”和“活动流程”。',
    },
  },
  volunteer: {
    id: 'volunteer_registration',
    label: '补活动登记遮住动线',
    detail: '打开日历，把一次危险出现改写成志愿者补登记。',
    app: 'calendar',
    tone: 'quiet',
    statChanges: { secrecy: 4, fanSuspicion: -2, trust: -1, lifeStability: 1 },
    historyChoice: '用志愿者登记遮住动线',
    notificationTitle: '活动登记已补齐',
    notificationContent: '你的出现变得合理，但“只是活动认识”的距离感也更强。',
    artifact: {
      type: 'calendar',
      title: '志愿者补登记：场地收尾',
      time: '20:10',
      isHighRisk: false,
    },
  },
  parttime: {
    id: 'parttime_receipt',
    label: '制造消费记录烟雾',
    detail: '打开备忘录，把收银小票和常客记录做成“他只是来店里”。',
    app: 'notes',
    tone: 'quiet',
    statChanges: { secrecy: 4, fanSuspicion: -3, money: 2, mood: -1 },
    historyChoice: '用兼职消费记录制造烟雾',
    notificationTitle: '消费记录已整理',
    notificationContent: '他来过这件事变得合理，但你也更难解释自己为什么记得那么清楚。',
    artifact: {
      type: 'note',
      title: '店内口径',
      content: '如果有人问：他只是普通客人。推荐饮料是店内新品，不是专属暗号。小票时间不要外传。',
    },
  },
  custom: {
    id: 'custom_rules',
    label: '按自定义身份写口径',
    detail: '打开备忘录，把今天的身份说法写成统一版本。',
    app: 'notes',
    tone: 'quiet',
    statChanges: { secrecy: 4, mood: 2, fanSuspicion: -1 },
    historyChoice: '按自定义身份整理危机口径',
    notificationTitle: '自定义身份口径已保存',
    notificationContent: '你把今天的行动重新包装成符合身份的解释。',
    artifact: {
      type: 'note',
      title: '今日身份口径',
      content: '把“为什么会在那里”“为什么认识他”“为什么时间对得上”写成同一个答案。所有 app 都用这一版。',
    },
  },
}

export function getIdentityIncidentScript(identity: PlayerIdentity): IdentityIncidentScript {
  return identityIncidentScripts[identity] || identityIncidentScripts.custom
}
