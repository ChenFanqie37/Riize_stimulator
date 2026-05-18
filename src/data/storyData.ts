import type { PlayerIdentity } from '../types/game'

export interface StoryChoice {
  id: string
  text: string
  affectionChange: number
  trustChange: number
  description: string
}

export interface IdentityStoryOpening {
  identity: PlayerIdentity
  title: string
  openingNarrative: string[]
  firstMessageKo: string
  firstMessageZh: string
  firstChoices: StoryChoice[]
  coreTension: string
}

export interface StoryEventChoice {
  id: string
  text: string
  riskPreview: string
  statChanges: Record<string, number>
}

export interface StoryEvent {
  id: string
  title: string
  description: string
  effects: Record<string, number>
  choices: StoryEventChoice[]
}

export interface IdentityEvents {
  identity: PlayerIdentity
  sweetEvents: StoryEvent[]
  crisisEvents: StoryEvent[]
  explosionEvents: StoryEvent[]
  darkEvents: StoryEvent[]
}

export interface IdentityEnding {
  id: string
  type: 'HE' | 'NE' | 'BE' | 'SE' | 'GE'
  title: string
  condition: string
  description: string
}

export interface IdentityEndings {
  identity: PlayerIdentity
  endings: IdentityEnding[]
}

export const identityStoryOpenings: IdentityStoryOpening[] = [
  {
    identity: 'fan',
    title: '粉丝身份 · 签售会那封信',
    openingNarrative: [
      '签售会那天你排了很久的队。',
      '前面每个人都只拿到标准的「你好，谢谢你支持我，我会努力的」。',
      '轮到你时，你把一封信递过去。',
      '信里没有露骨表白，只写了一句：',
      '"希望你不只是被所有人喜欢，而是也能喜欢你自己的生活。"',
      '他愣了一下，抬头看了你一眼。',
      '然后在你专辑的角落，多画了一颗很小的星星。',
      '一周后，你的Instagram小号收到一条私信。头像是风景照，名字是乱码。'
    ],
    firstMessageKo: '팬싸인회에서 그 편지... 네가 쓴 거야?',
    firstMessageZh: '签售会上那封信……是你写的吗？',
    firstChoices: [
      { id: 'fan_1a', text: '我不会说的。你要相信我吗？', affectionChange: 5, trustChange: 5, description: '信任+5，感情+5，曝光风险不变，男友态度「试探中」' },
      { id: 'fan_1b', text: '你是真心找我的，还是只是好奇粉丝长什么样？', affectionChange: 2, trustChange: 0, description: '信任+0，感情+2，对话气氛变冷，男友第一次被问住' },
      { id: 'fan_1c', text: '我知道你是谁，但我不会靠近你。除非你自己想。', affectionChange: 8, trustChange: 3, description: '感情+8，信任+3，男友开始真正记住你' },
      { id: 'fan_1d', text: '你到底是谁？不要骗我。', affectionChange: -2, trustChange: -5, description: '信任-5，感情-2，对话几乎中断（但后续他会再找理由联系你）' }
    ],
    coreTension: '你是最了解他舞台的人，也是最容易被他伤害的人。'
  },
  {
    identity: 'intern',
    title: '经纪人身份 · 深夜加班',
    openingNarrative: [
      '你和他一起跑行程已经两年。',
      '他台前台后什么样，你比粉丝清楚一百倍。',
      '你知道他腰痛时会硬撑，上台前会紧张到反复喝水，得了一位会半夜一个人弹钢琴。',
      '一直以来你们都保持距离。',
      '直到那天——',
      '颁奖礼结束后，他一个人坐在保姆车里，没有下车。',
      '你敲了敲车窗。',
      '"还不回去吗？"',
      '他说："拿了大赏，但没有一个人可以打电话。"',
      '你不知道哪根筋不对，坐到了副驾驶。',
      '车里很安静。',
      '很久之后他说："你能不能……不要辞职？"'
    ],
    firstMessageKo: '오늘 고마워. 매니저로서가 아니라.',
    firstMessageZh: '今天谢谢你。不是经纪人的那种。',
    firstChoices: [
      { id: 'intern_1a', text: '我是你经纪人，这是我的工作。', affectionChange: 2, trustChange: 5, description: '感情+2，信任+5，压力不变，关系「模糊界限」' },
      { id: 'intern_1b', text: '那是什么？', affectionChange: 8, trustChange: 3, description: '感情+8，信任+3，对话危险升温' },
      { id: 'intern_1c', text: '你喝多了，回去睡吧。', affectionChange: -3, trustChange: 0, description: '感情-3，信任+0，他开始试探但被推开' },
      { id: 'intern_1d', text: '……（已读不回）', affectionChange: -5, trustChange: -2, description: '第二天他会在行程中突然冷淡一整天' }
    ],
    coreTension: '职业伦理 vs 长期陪伴后的依赖。'
  },
  {
    identity: 'stylist',
    title: '造型师身份 · 化妆间的那只手',
    openingNarrative: [
      '回归期每天只睡三小时。',
      '凌晨四点的化妆间只有你们两个人。',
      '他闭着眼睛任你摆弄头发。',
      '你小声说："今天皮肤状态不好，遮瑕要多一点。"',
      '他没有睁眼，但突然握住了你的手腕。',
      '"别动。"',
      '"怎、怎么了？"',
      '"五分钟就好。就这样。"'
    ],
    firstMessageKo: '분장실 일... 미안해.',
    firstMessageZh: '化妆间的事……对不起。',
    firstChoices: [
      { id: 'stylist_1a', text: '没关系，我理解你压力大。', affectionChange: 3, trustChange: 4, description: '感情+3，信任+4，压力-2' },
      { id: 'stylist_1b', text: '你到底是什么意思？', affectionChange: 5, trustChange: 2, description: '感情+5，信任+2，关系进入「暧昧拉扯」' },
      { id: 'stylist_1c', text: '下次不要再这样了。', affectionChange: -2, trustChange: 6, description: '感情-2，信任+6，他会变得更小心翼翼' },
      { id: 'stylist_1d', text: '……（不回复）', affectionChange: -1, trustChange: 1, description: '第二天他会一直偷偷看你反应' }
    ],
    coreTension: '身体距离最近的职业，最容易越界。'
  },
  {
    identity: 'staff',
    title: '同行艺人身份 · 合作舞台之后',
    openingNarrative: [
      '年末合作舞台把你们凑在了一起。',
      '彩排时你们几乎不说话，各自经纪人盯得很紧。',
      '正式演出的那一刻，他在台上牵了你的手。',
      '粉丝尖叫。',
      '你知道那不是舞台设计。',
      '演出结束后：',
      '后台走廊很乱。',
      '他路过你身边时，用只有你们两个人听得到的声音说：',
      '"刚才……不是表演。"'
    ],
    firstMessageKo: '몇 호실이야?',
    firstMessageZh: '你在几号房？',
    firstChoices: [
      { id: 'staff_1a', text: '你想干嘛？', affectionChange: 8, trustChange: -2, description: '感情+8，信任-2（太危险）' },
      { id: 'staff_1b', text: '别这样，会被拍到。', affectionChange: 2, trustChange: 5, description: '感情+2，信任+5，压力+8' },
      { id: 'staff_1c', text: '有机会的话……节目结束后聊聊吧。', affectionChange: 5, trustChange: 4, description: '感情+5，信任+4，曝光风险+5' },
      { id: 'staff_1d', text: '……（不回复）', affectionChange: -2, trustChange: -1, description: '第二天他会在媒体采访里故意提到你' }
    ],
    coreTension: '势均力敌，但谁也输不起。'
  },
  {
    identity: 'volunteer',
    title: '练习生身份 · 后楼梯的烟味',
    openingNarrative: [
      '你们公司大楼有一层很少有人去的楼梯间。',
      '你练到凌晨偷偷去那里哭。',
      '那天转角撞到了一个人。',
      '他穿着卫衣，没有化妆，手里夹着一根没点的烟。',
      '"……前辈好。"',
      '"哭了？"',
      '"没有。"',
      '"练习生？"',
      '"……嗯。"',
      '他看了你一眼，把那根烟塞回口袋。',
      '"出道之前，不要被任何人抓到把柄。尤其是……和我说话。"'
    ],
    firstMessageKo: '그날 계단에서 있었던 일... 잊었어?',
    firstMessageZh: '那天楼梯间的事……忘记了吗？',
    firstChoices: [
      { id: 'volunteer_1a', text: '没有，记得很清楚。', affectionChange: 6, trustChange: 2, description: '感情+6，信任+2，公司警觉度+3' },
      { id: 'volunteer_1b', text: '前辈不用担心我。', affectionChange: 2, trustChange: 5, description: '感情+2，信任+5，关系更冷但更安全' },
      { id: 'volunteer_1c', text: '你喜欢我吗？', affectionChange: 8, trustChange: -5, description: '感情+8，信任-5，他会被吓退一周' },
      { id: 'volunteer_1d', text: '……（不回复）', affectionChange: -1, trustChange: 1, description: '一周后他会假装"路过你的练习室"' }
    ],
    coreTension: '你的事业在他手里，他的一句话就能毁掉你。'
  },
  {
    identity: 'student',
    title: '素人身份 · 他不知道我知道',
    openingNarrative: [
      '你真的不追星。',
      '他在你打工的店里第一次出现时，你只觉得他长得好看。',
      '他点冰美式，你给错了热拿铁。',
      '他笑着说："没关系。"',
      '第二次见面：',
      '他被人跟踪，躲进了你店里。',
      '你帮忙关上了门。',
      '他摘下口罩，眼睛里还有一点慌。',
      '"你不知道我是谁吧？"',
      '你其实已经偷偷搜过了。',
      '但你摇了摇头。',
      '"嗯，不知道。"'
    ],
    firstMessageKo: '오늘 고마워. 만약 내가... 보통 사람이 아니라면, 화날까?',
    firstMessageZh: '今天谢谢你。如果我说……我不是普通人，你会生气吗？',
    firstChoices: [
      { id: 'student_1a', text: '我早就知道了。', affectionChange: 3, trustChange: -5, description: '信任-5，感情+3（他最怕被拆穿）' },
      { id: 'student_1b', text: '不管你是谁，我认识的是咖啡店的那个人。', affectionChange: 8, trustChange: 6, description: '感情+8，信任+6，经典素人线名场面' },
      { id: 'student_1c', text: '你是不是在骗我？', affectionChange: -2, trustChange: 2, description: '感情-2，信任+2' },
      { id: 'student_1d', text: '……（不回复）', affectionChange: -1, trustChange: 0, description: '第二天他会亲自来店里找你' }
    ],
    coreTension: '最浪漫，也最容易被粉圈人肉。'
  },
  {
    identity: 'translator',
    title: '制作人身份 · 录音室那晚',
    openingNarrative: [
      '公司安排你给他写一首回归主打。',
      '录音室里他状态很差，唱了十几遍都不对。',
      '你把所有人赶出去，只留下两个人。',
      '"你在想什么？"',
      '"没什么。"',
      '"那你在骗谁？"',
      '他突然摘掉耳机看着你。',
      '"你写歌的时候……想过站在台上的人是我吗？"'
    ],
    firstMessageKo: '녹음실 일... 너무 생각하지 마.',
    firstMessageZh: '录音室的事……你别多想。',
    firstChoices: [
      { id: 'translator_1a', text: '我没有多想。但你是不是有？', affectionChange: 7, trustChange: 2, description: '感情+7，信任+2' },
      { id: 'translator_1b', text: '你是歌手，我是制作人。就这样。', affectionChange: -3, trustChange: 5, description: '感情-3，信任+5，压力+4' },
      { id: 'translator_1c', text: '你写词的时候，不也把我写进去了吗？', affectionChange: 9, trustChange: 1, description: '感情+9，信任+1，曝光风险+4' },
      { id: 'translator_1d', text: '……（已读不回）', affectionChange: -2, trustChange: 0, description: '第二天他会把新歌词发给你，写着「写给制作人」' }
    ],
    coreTension: '创作与感情绑定，分不清是因为爱还是因为歌。'
  },
  {
    identity: 'parttime',
    title: '财阀身份 · 谈判桌上的意外',
    openingNarrative: [
      '你代表资方和他公司谈一场大型巡演的投资。',
      '会议室里他很安静，全程只说了一句"谢谢代表"。',
      '会议结束后你在走廊抽烟。',
      '他经过你身边，停了一下。',
      '"你会抽烟？"',
      '"关你什么事。"',
      '"没什么。只是觉得……你和他们不一样。"'
    ],
    firstMessageKo: '대표님, 오늘 회의 수고하셨어요. 혹시... 협력 파트너가 아닌 것으로 밥 한 끼 할 수 있을까요?',
    firstMessageZh: '代表nim，今天会议辛苦了。能不能……不以合作方的身份吃一顿饭？',
    firstChoices: [
      { id: 'parttime_1a', text: '你是想谈工作，还是想谈别的？', affectionChange: 5, trustChange: -2, description: '感情+5，信任-2，权力感+8' },
      { id: 'parttime_1b', text: '好啊，你请客。', affectionChange: 7, trustChange: 4, description: '感情+7，信任+4，公司讨好度+5' },
      { id: 'parttime_1c', text: '你知道我是谁家女儿吗？', affectionChange: -3, trustChange: 0, description: '感情-3，信任+0（提醒阶级差距）' },
      { id: 'parttime_1d', text: '……（不回复）', affectionChange: -1, trustChange: -1, description: '第二天他会让经纪人主动联系你' }
    ],
    coreTension: '有钱有权，但分不清他是真心还是利用。'
  },
  {
    identity: 'custom',
    title: '素人身份 · 他不知道我知道',
    openingNarrative: [
      '你真的不追星。',
      '他在你打工的店里第一次出现时，你只觉得他长得好看。',
      '他点冰美式，你给错了热拿铁。',
      '他笑着说："没关系。"',
      '第二次见面：',
      '他被人跟踪，躲进了你店里。',
      '你帮忙关上了门。',
      '他摘下口罩，眼睛里还有一点慌。',
      '"你不知道我是谁吧？"',
      '你其实已经偷偷搜过了。',
      '但你摇了摇头。',
      '"嗯，不知道。"'
    ],
    firstMessageKo: '오늘 고마워. 만약 내가... 보통 사람이 아니라면, 화날까?',
    firstMessageZh: '今天谢谢你。如果我说……我不是普通人，你会生气吗？',
    firstChoices: [
      { id: 'custom_1a', text: '我早就知道了。', affectionChange: 3, trustChange: -5, description: '信任-5，感情+3（他最怕被拆穿）' },
      { id: 'custom_1b', text: '不管你是谁，我认识的是咖啡店的那个人。', affectionChange: 8, trustChange: 6, description: '感情+8，信任+6，经典素人线名场面' },
      { id: 'custom_1c', text: '你是不是在骗我？', affectionChange: -2, trustChange: 2, description: '感情-2，信任+2' },
      { id: 'custom_1d', text: '……（不回复）', affectionChange: -1, trustChange: 0, description: '第二天他会亲自来店里找你' }
    ],
    coreTension: '最浪漫，也最容易被粉圈人肉。'
  }
]

export const identityEvents: IdentityEvents[] = [
  {
    identity: 'fan',
    sweetEvents: [
      {
        id: 'fan_sweet_1',
        title: '签售会特殊对待',
        description: '这次签售他多看了你三秒。旁边粉丝开始交头接耳。',
        effects: { fanSuspicion: 10, affection: 5 },
        choices: [
          { id: 'fan_s1_a', text: '低调离开', riskPreview: '安全但错过', statChanges: { fanSuspicion: -5, affection: -2 } },
          { id: 'fan_s1_b', text: '多停留一会儿', riskPreview: '甜蜜但危险', statChanges: { affection: 5, fanSuspicion: 8 } },
          { id: 'fan_s1_c', text: '假装不认识', riskPreview: '最安全', statChanges: { secrecy: 3, affection: -1 } }
        ]
      },
      {
        id: 'fan_sweet_2',
        title: '小号深夜私信',
        description: '他用小号发来：「今天舞台有一首歌是想着你唱的。」',
        effects: { affection: 8, publicHeat: 5 },
        choices: [
          { id: 'fan_s2_a', text: '感动回复', riskPreview: '甜蜜但留下记录', statChanges: { affection: 8, evidenceCount: 1 } },
          { id: 'fan_s2_b', text: '质疑真假', riskPreview: '理性但扫兴', statChanges: { affection: -3, trust: 2 } },
          { id: 'fan_s2_c', text: '截图保存', riskPreview: '留证据但增加风险', statChanges: { mood: 5, evidenceCount: 1 } }
        ]
      },
      {
        id: 'fan_sweet_3',
        title: '演唱会眼神对视',
        description: '万人场馆里，他的目光停在你所在的方向。',
        effects: { affection: 6, fanSuspicion: 15 },
        choices: [
          { id: 'fan_s3_a', text: '当作巧合', riskPreview: '安全但错过', statChanges: { affection: -2, fanSuspicion: -5 } },
          { id: 'fan_s3_b', text: '偷偷回应手势', riskPreview: '浪漫但危险', statChanges: { affection: 8, fanSuspicion: 10 } },
          { id: 'fan_s3_c', text: '低头避开', riskPreview: '保护双方', statChanges: { secrecy: 5, affection: -3 } }
        ]
      }
    ],
    crisisEvents: [
      {
        id: 'fan_crisis_1',
        title: '站姐调查',
        description: '站姐开始扒签售会上那个「被特殊对待的粉丝」是谁。',
        effects: { fanSuspicion: 25, careerPressure: 15 },
        choices: [
          { id: 'fan_c1_a', text: '删除账号', riskPreview: '消除痕迹但失去互动', statChanges: { fanSuspicion: -10, affection: -5, evidenceCount: -2 } },
          { id: 'fan_c1_b', text: '硬刚', riskPreview: '勇敢但危险', statChanges: { fanSuspicion: 5, mood: 5 } },
          { id: 'fan_c1_c', text: '找男友帮忙', riskPreview: '增加他的压力', statChanges: { careerPressure: 10, affection: 3, trust: 2 } }
        ]
      },
      {
        id: 'fan_crisis_2',
        title: '粉圈审判帖',
        description: '匿名论坛出现：「某签售姐是不是和○○○有关系？」',
        effects: { careerPressure: 20, trust: -5 },
        choices: [
          { id: 'fan_c2_a', text: '潜水看帖', riskPreview: '了解敌情但焦虑', statChanges: { mood: -10, fanSuspicion: 0 } },
          { id: 'fan_c2_b', text: '发帖澄清', riskPreview: '正面回应但暴露更多', statChanges: { fanSuspicion: 5, publicHeat: 5 } },
          { id: 'fan_c2_c', text: '找站姐私聊', riskPreview: '直接沟通但可能被截图', statChanges: { fanSuspicion: -5, evidenceCount: 1 } }
        ]
      },
      {
        id: 'fan_crisis_3',
        title: '私生警告',
        description: '私生饭给你发私信：「我知道你是谁。离他远点。」',
        effects: { careerPressure: 30, mood: -20 },
        choices: [
          { id: 'fan_c3_a', text: '报警', riskPreview: '法律途径但公开化', statChanges: { publicHeat: 10, mood: 5 } },
          { id: 'fan_c3_b', text: '告诉男友', riskPreview: '增加他的压力', statChanges: { affection: 3, careerPressure: 10 } },
          { id: 'fan_c3_c', text: '无视', riskPreview: '可能升级', statChanges: { mood: -5 } }
        ]
      }
    ],
    explosionEvents: [
      {
        id: 'fan_explosion_1',
        title: '私生跟踪到家',
        description: '私生饭跟到你兼职的地方，拍了照片发到论坛。',
        effects: { mood: -30, careerPressure: 40, companyAlert: 15 },
        choices: [
          { id: 'fan_e1_a', text: '搬家', riskPreview: '安全但代价大', statChanges: { money: -15, secrecy: 15, mood: -5 } },
          { id: 'fan_e1_b', text: '报警', riskPreview: '法律保护但公开', statChanges: { publicHeat: 10, mood: 5 } },
          { id: 'fan_e1_c', text: '联系公司', riskPreview: '公司介入但失去控制', statChanges: { companyAlert: 20, secrecy: -10 } }
        ]
      },
      {
        id: 'fan_explosion_2',
        title: '签售会录音泄露',
        description: '你和他在签售会的对话被人录下来传到网上。',
        effects: { publicHeat: 40, companyAlert: 30 },
        choices: [
          { id: 'fan_e2_a', text: '否认', riskPreview: '可能被更多证据打脸', statChanges: { fanSuspicion: 5, trust: -5 } },
          { id: 'fan_e2_b', text: '承认是朋友', riskPreview: '部分承认但留下疑点', statChanges: { fanSuspicion: -5, publicHeat: 5 } },
          { id: 'fan_e2_c', text: '让公司公关', riskPreview: '专业但失去话语权', statChanges: { companyAlert: 15, publicHeat: -10 } }
        ]
      }
    ],
    darkEvents: [
      {
        id: 'fan_dark_1',
        title: '男友否认认识你',
        description: '直播时有粉丝问「签售会的那个女生是谁」，他说：「粉丝我都记不住。」',
        effects: { affection: -20, trust: -30, careerPressure: 35 },
        choices: [
          { id: 'fan_d1_a', text: '分手', riskPreview: '最决绝', statChanges: { affection: -30, mood: -30 } },
          { id: 'fan_d1_b', text: '质问他', riskPreview: '要一个解释', statChanges: { affection: -5, trust: -10, careerPressure: 5 } },
          { id: 'fan_d1_c', text: '沉默', riskPreview: '内伤但维持', statChanges: { mood: -20, mentalHealth: -10 } },
          { id: 'fan_d1_d', text: '黑化', riskPreview: '反击', statChanges: { mood: 5, trust: -20, publicHeat: 15 } }
        ]
      }
    ]
  },
  {
    identity: 'intern',
    sweetEvents: [
      {
        id: 'intern_sweet_1',
        title: '保姆车独处',
        description: '深夜行程结束后，保姆车里只剩你们。',
        effects: { affection: 6, careerPressure: -5 },
        choices: [
          { id: 'intern_s1_a', text: '靠在他肩上', riskPreview: '甜蜜但越界', statChanges: { affection: 8, secrecy: -5 } },
          { id: 'intern_s1_b', text: '保持距离', riskPreview: '安全但冷淡', statChanges: { affection: -2, secrecy: 5 } },
          { id: 'intern_s1_c', text: '聊工作', riskPreview: '安全但无趣', statChanges: { trust: 3, affection: 1 } }
        ]
      },
      {
        id: 'intern_sweet_2',
        title: '海外行程的酒店走廊',
        description: '海外行程你住他隔壁。凌晨他敲门：「睡不着。」',
        effects: { affection: 8, publicHeat: 15 },
        choices: [
          { id: 'intern_s2_a', text: '开门', riskPreview: '温暖但危险', statChanges: { affection: 10, secrecy: -10, paparazziAttention: 10 } },
          { id: 'intern_s2_b', text: '拒绝', riskPreview: '安全但让他失落', statChanges: { affection: -5, secrecy: 5 } },
          { id: 'intern_s2_c', text: '去他房间', riskPreview: '极度危险', statChanges: { affection: 15, secrecy: -20, paparazziAttention: 20 } }
        ]
      },
      {
        id: 'intern_sweet_3',
        title: '他生病时你照顾',
        description: '他发高烧，你在宿舍照顾他一整晚。',
        effects: { affection: 10, trust: 8 },
        choices: [
          { id: 'intern_s3_a', text: '留下照顾', riskPreview: '温暖但被发现风险', statChanges: { affection: 10, trust: 8, companyAlert: 5 } },
          { id: 'intern_s3_b', text: '叫队友来', riskPreview: '安全但疏远', statChanges: { affection: -3, trust: 2 } },
          { id: 'intern_s3_c', text: '通知公司', riskPreview: '职业但冰冷', statChanges: { companyAlert: 10, affection: -5, trust: 5 } }
        ]
      }
    ],
    crisisEvents: [
      {
        id: 'intern_crisis_1',
        title: '同事怀疑',
        description: '另一个经纪人说：「你们是不是太近了？」',
        effects: { companyAlert: 15, careerPressure: 10 },
        choices: [
          { id: 'intern_c1_a', text: '否认', riskPreview: '硬刚但可能被盯上', statChanges: { companyAlert: 5, secrecy: 3 } },
          { id: 'intern_c1_b', text: '承认是朋友', riskPreview: '部分承认', statChanges: { companyAlert: 10, trust: 2 } },
          { id: 'intern_c1_c', text: '转移话题', riskPreview: '拖延但没解决', statChanges: { companyAlert: 3, careerPressure: 5 } }
        ]
      },
      {
        id: 'intern_crisis_2',
        title: '公司内部调查',
        description: '公司派人私下问其他同事：「他和那个经纪人的关系正常吗？」',
        effects: { companyAlert: 25, careerPressure: 20 },
        choices: [
          { id: 'intern_c2_a', text: '更小心', riskPreview: '安全但辛苦', statChanges: { secrecy: 10, mood: -10 } },
          { id: 'intern_c2_b', text: '主动找老板谈', riskPreview: '坦诚但交出把柄', statChanges: { companyAlert: 15, trust: 5 } },
          { id: 'intern_c2_c', text: '让男友帮忙', riskPreview: '增加他的压力', statChanges: { careerPressure: 15, affection: 3 } }
        ]
      },
      {
        id: 'intern_crisis_3',
        title: '你被调岗',
        description: '公司以「工作需要」为由把你调去带其他艺人。',
        effects: { affection: -15, careerPressure: 25 },
        choices: [
          { id: 'intern_c3_a', text: '接受', riskPreview: '安全但痛苦', statChanges: { affection: -10, lifeStability: 5 } },
          { id: 'intern_c3_b', text: '拒绝', riskPreview: '刚烈但可能被开除', statChanges: { companyAlert: 15, mood: 5 } },
          { id: 'intern_c3_c', text: '找男友帮忙', riskPreview: '他出面但更暴露', statChanges: { careerPressure: 10, affection: 5, companyAlert: 10 } }
        ]
      }
    ],
    explosionEvents: [
      {
        id: 'intern_explosion_1',
        title: '酒店被拍',
        description: '你和他在海外酒店被粉丝拍到同框。',
        effects: { publicHeat: 35, companyAlert: 30 },
        choices: [
          { id: 'intern_e1_a', text: '公关解释是工作', riskPreview: '合理但需要配合', statChanges: { publicHeat: -10, companyAlert: 5 } },
          { id: 'intern_e1_b', text: '承认', riskPreview: '勇敢但代价大', statChanges: { affection: 10, publicHeat: 20, companyAlert: 20 } },
          { id: 'intern_e1_c', text: '沉默', riskPreview: '让舆论发酵', statChanges: { publicHeat: 10, fanSuspicion: 15 } }
        ]
      },
      {
        id: 'intern_explosion_2',
        title: '同事告密',
        description: '你的同事向公司举报你们的关系。',
        effects: { companyAlert: 45, careerPressure: 35 },
        choices: [
          { id: 'intern_e2_a', text: '解释', riskPreview: '辩解但证据确凿', statChanges: { companyAlert: 10, trust: -5 } },
          { id: 'intern_e2_b', text: '辞职', riskPreview: '体面退出', statChanges: { affection: -5, lifeStability: -15 } },
          { id: 'intern_e2_c', text: '让男友保你', riskPreview: '他出面但更危险', statChanges: { affection: 10, careerPressure: 20, companyAlert: 15 } }
        ]
      }
    ],
    darkEvents: [
      {
        id: 'intern_dark_1',
        title: '他为了事业放弃你',
        description: '他选择事业，你被解雇，业界都知道「她和艺人搞在一起」。',
        effects: { affection: -30, trust: -40 },
        choices: [
          { id: 'intern_d1_a', text: '离开韩娱圈', riskPreview: '重新开始', statChanges: { lifeStability: -20, mood: -15 } },
          { id: 'intern_d1_b', text: '复仇', riskPreview: '以牙还牙', statChanges: { mood: 5, publicHeat: 20, trust: -20 } },
          { id: 'intern_d1_c', text: '沉默', riskPreview: '独自承受', statChanges: { mood: -30, mentalHealth: -15 } }
        ]
      }
    ]
  },
  {
    identity: 'stylist',
    sweetEvents: [
      {
        id: 'stylist_sweet_1',
        title: '化妆间牵手',
        description: '凌晨化妆间只有你们。他突然握住你的手。',
        effects: { affection: 7, careerPressure: -3 },
        choices: [
          { id: 'stylist_s1_a', text: '回握', riskPreview: '甜蜜但越界', statChanges: { affection: 8, secrecy: -5 } },
          { id: 'stylist_s1_b', text: '抽手', riskPreview: '安全但冷淡', statChanges: { affection: -3, secrecy: 5 } },
          { id: 'stylist_s1_c', text: '开玩笑', riskPreview: '化解尴尬', statChanges: { affection: 2, trust: 3 } }
        ]
      },
      {
        id: 'stylist_sweet_2',
        title: '他睡着在你肩上',
        description: '化妆时他太累，靠在你肩上睡着。',
        effects: { affection: 6, trust: 5 },
        choices: [
          { id: 'stylist_s2_a', text: '让他靠着', riskPreview: '温暖但可能被发现', statChanges: { affection: 8, trust: 5, companyAlert: 5 } },
          { id: 'stylist_s2_b', text: '叫醒', riskPreview: '职业但残忍', statChanges: { affection: -3, careerPressure: 3 } },
          { id: 'stylist_s2_c', text: '拍照', riskPreview: '留证据极其危险', statChanges: { evidenceCount: 2, affection: -5 } }
        ]
      },
      {
        id: 'stylist_sweet_3',
        title: '送你回家',
        description: '行程结束他让司机绕路送你回家。',
        effects: { affection: 8, publicHeat: 8 },
        choices: [
          { id: 'stylist_s3_a', text: '接受', riskPreview: '甜蜜但留下行踪', statChanges: { affection: 8, paparazziAttention: 5 } },
          { id: 'stylist_s3_b', text: '拒绝', riskPreview: '安全但让他失落', statChanges: { affection: -5, secrecy: 5 } },
          { id: 'stylist_s3_c', text: '让他下车自己走', riskPreview: '折中', statChanges: { affection: 3, secrecy: 3 } }
        ]
      }
    ],
    crisisEvents: [
      {
        id: 'stylist_crisis_1',
        title: '同事撞见',
        description: '另一个造型师突然进化妆间，你们差点被发现。',
        effects: { companyAlert: 15, careerPressure: 12 },
        choices: [
          { id: 'stylist_c1_a', text: '镇定解释', riskPreview: '专业应对', statChanges: { companyAlert: -5, trust: 3 } },
          { id: 'stylist_c1_b', text: '慌张', riskPreview: '更加可疑', statChanges: { companyAlert: 10, affection: -3 } },
          { id: 'stylist_c1_c', text: '提前想好借口', riskPreview: '有备无患', statChanges: { secrecy: 5, companyAlert: 0 } }
        ]
      },
      {
        id: 'stylist_crisis_2',
        title: '直播事故',
        description: '他直播时，你的手出现在镜头里。',
        effects: { fanSuspicion: 20, careerPressure: 15 },
        choices: [
          { id: 'stylist_c2_a', text: '当作没发生', riskPreview: '赌粉丝不在意', statChanges: { fanSuspicion: 10, publicHeat: 5 } },
          { id: 'stylist_c2_b', text: '让经纪人解释', riskPreview: '专业但承认异常', statChanges: { companyAlert: 10, fanSuspicion: -5 } },
          { id: 'stylist_c2_c', text: '删回放', riskPreview: '消除证据但引起怀疑', statChanges: { fanSuspicion: 5, evidenceCount: -1 } }
        ]
      },
      {
        id: 'stylist_crisis_3',
        title: '礼物被发现',
        description: '他送你的项链被其他造型师看到：「这是名牌吧？谁送的？」',
        effects: { companyAlert: 12, careerPressure: 10 },
        choices: [
          { id: 'stylist_c3_a', text: '说自己买的', riskPreview: '合理但需要证明', statChanges: { secrecy: 3, companyAlert: -3 } },
          { id: 'stylist_c3_b', text: '说是朋友送的', riskPreview: '模糊但可疑', statChanges: { companyAlert: 5, secrecy: 2 } },
          { id: 'stylist_c3_c', text: '转移话题', riskPreview: '回避但没解决', statChanges: { companyAlert: 3, mood: -5 } }
        ]
      }
    ],
    explosionEvents: [
      {
        id: 'stylist_explosion_1',
        title: '化妆间监控',
        description: '公司突然在化妆间装监控，你们不敢再有亲密举动。',
        effects: { careerPressure: 25, affection: -5 },
        choices: [
          { id: 'stylist_e1_a', text: '在外面约会', riskPreview: '转移阵地但风险更高', statChanges: { paparazziAttention: 10, affection: 5 } },
          { id: 'stylist_e1_b', text: '减少接触', riskPreview: '安全但疏远', statChanges: { affection: -10, secrecy: 10 } },
          { id: 'stylist_e1_c', text: '偷偷避开监控', riskPreview: '聪明但如果被发现更糟', statChanges: { secrecy: 5, companyAlert: 10 } }
        ]
      },
      {
        id: 'stylist_explosion_2',
        title: '他醉酒表白',
        description: '杀青宴他喝醉，在化妆间对你说：「我喜欢你，不是随便说说的。」',
        effects: { affection: 15, careerPressure: 20 },
        choices: [
          { id: 'stylist_e2_a', text: '接受', riskPreview: '勇敢但危险', statChanges: { affection: 15, trust: 10, companyAlert: 10 } },
          { id: 'stylist_e2_b', text: '当他醉话', riskPreview: '安全但伤他心', statChanges: { affection: -5, trust: -3 } },
          { id: 'stylist_e2_c', text: '说你也有感觉', riskPreview: '双向奔赴', statChanges: { affection: 20, trust: 15, secrecy: -10 } }
        ]
      }
    ],
    darkEvents: [
      {
        id: 'stylist_dark_1',
        title: '他否认你的才华',
        description: '采访中他说：「造型都是团队功劳，我不太参与。」明明是你熬了多少夜。',
        effects: { affection: -15, trust: -20 },
        choices: [
          { id: 'stylist_d1_a', text: '委屈', riskPreview: '独自承受', statChanges: { mood: -20, mentalHealth: -10 } },
          { id: 'stylist_d1_b', text: '私下质问他', riskPreview: '要一个解释', statChanges: { affection: -5, trust: -10, careerPressure: 5 } },
          { id: 'stylist_d1_c', text: '辞职', riskPreview: '离开这个环境', statChanges: { lifeStability: -15, mood: -10 } }
        ]
      }
    ]
  },
  {
    identity: 'staff',
    sweetEvents: [
      {
        id: 'staff_sweet_1',
        title: '合作舞台彩排',
        description: '音乐节目合作舞台，彩排时他多牵了一秒。',
        effects: { affection: 6, publicHeat: 10 },
        choices: [
          { id: 'staff_s1_a', text: '配合', riskPreview: '甜蜜但被看到', statChanges: { affection: 5, fanSuspicion: 8 } },
          { id: 'staff_s1_b', text: '回避', riskPreview: '安全但冷淡', statChanges: { affection: -3, secrecy: 5 } },
          { id: 'staff_s1_c', text: '私下说他', riskPreview: '沟通但暴露', statChanges: { affection: 3, trust: 2 } }
        ]
      },
      {
        id: 'staff_sweet_2',
        title: '颁奖礼座位相邻',
        description: '颁奖礼你们被安排坐在一起，他在桌下碰了碰你的手。',
        effects: { affection: 7, publicHeat: 15 },
        choices: [
          { id: 'staff_s2_a', text: '回应', riskPreview: '甜蜜但危险', statChanges: { affection: 8, secrecy: -8 } },
          { id: 'staff_s2_b', text: '装作没感觉', riskPreview: '安全但让他失落', statChanges: { affection: -3, secrecy: 5 } },
          { id: 'staff_s2_c', text: '紧张', riskPreview: '真实反应', statChanges: { affection: 2, mood: 5 } }
        ]
      },
      {
        id: 'staff_sweet_3',
        title: '直播中的暗号',
        description: '他直播时比了一个只有你们知道的手势。',
        effects: { affection: 8, fanSuspicion: 12 },
        choices: [
          { id: 'staff_s3_a', text: '也做手势', riskPreview: '甜蜜但暴露', statChanges: { affection: 10, fanSuspicion: 15 } },
          { id: 'staff_s3_b', text: '无视', riskPreview: '安全但扫兴', statChanges: { affection: -2, fanSuspicion: -3 } },
          { id: 'staff_s3_c', text: '私信问他', riskPreview: '留下记录', statChanges: { affection: 5, evidenceCount: 1 } }
        ]
      }
    ],
    crisisEvents: [
      {
        id: 'staff_crisis_1',
        title: '营业CP争议',
        description: '公司推你们组营业CP，粉丝开始磕糖，但你们是真的。',
        effects: { careerPressure: 15, affection: 3 },
        choices: [
          { id: 'staff_c1_a', text: '配合营业', riskPreview: '安全掩护但暧昧模糊', statChanges: { fanSuspicion: -5, affection: 5 } },
          { id: 'staff_c1_b', text: '拒绝', riskPreview: '真实但引起怀疑', statChanges: { companyAlert: 10, affection: -3 } },
          { id: 'staff_c1_c', text: '半推半就', riskPreview: '模糊地带', statChanges: { fanSuspicion: 5, careerPressure: 5 } }
        ]
      },
      {
        id: 'staff_crisis_2',
        title: '唯粉互撕',
        description: '你的粉丝和他粉丝因为合作舞台开战。',
        effects: { careerPressure: 20, affection: -5 },
        choices: [
          { id: 'staff_c2_a', text: '沉默', riskPreview: '不介入但焦虑', statChanges: { mood: -10, careerPressure: 5 } },
          { id: 'staff_c2_b', text: '安抚粉丝', riskPreview: '出面但暴露立场', statChanges: { fanSuspicion: 10, popularity: 5 } },
          { id: 'staff_c2_c', text: '私下互相吐槽', riskPreview: '增进感情', statChanges: { affection: 5, trust: 3, mood: 5 } }
        ]
      },
      {
        id: 'staff_crisis_3',
        title: '资源竞争',
        description: '你们同时被考虑同一个代言/角色。',
        effects: { trust: -10, careerPressure: 25 },
        choices: [
          { id: 'staff_c3_a', text: '公平竞争', riskPreview: '理性但可能伤感情', statChanges: { affection: -5, trust: 5 } },
          { id: 'staff_c3_b', text: '让给他', riskPreview: '大度但委屈', statChanges: { affection: 5, mood: -10, popularity: -5 } },
          { id: 'staff_c3_c', text: '要求他让给你', riskPreview: '自私但直接', statChanges: { affection: -10, trust: -5 } }
        ]
      }
    ],
    explosionEvents: [
      {
        id: 'staff_explosion_1',
        title: '同框被拍',
        description: 'Dispatch拍到你们私下见面。',
        effects: { publicHeat: 50, companyAlert: 40 },
        choices: [
          { id: 'staff_e1_a', text: '否认', riskPreview: '可能被更多证据打脸', statChanges: { publicHeat: 5, trust: -5 } },
          { id: 'staff_e1_b', text: '承认是朋友', riskPreview: '部分承认', statChanges: { publicHeat: 10, fanSuspicion: 10 } },
          { id: 'staff_e1_c', text: '商量公开', riskPreview: '最勇敢也最危险', statChanges: { affection: 15, trust: 10, publicHeat: 30 } }
        ]
      },
      {
        id: 'staff_explosion_2',
        title: '两家公司对质',
        description: '双方公司坐在一起谈「你们的关系怎么处理」。',
        effects: { careerPressure: 40, affection: -10 },
        choices: [
          { id: 'staff_e2_a', text: '坚持在一起', riskPreview: '勇敢但代价大', statChanges: { affection: 10, trust: 10, careerPressure: 20 } },
          { id: 'staff_e2_b', text: '妥协分手', riskPreview: '安全但心碎', statChanges: { affection: -20, mood: -30, careerPressure: -10 } },
          { id: 'staff_e2_c', text: '隐婚', riskPreview: '秘密但长期压力', statChanges: { secrecy: -20, trust: 15, careerPressure: 10 } }
        ]
      }
    ],
    darkEvents: [
      {
        id: 'staff_dark_1',
        title: '他用你炒作',
        description: '你发现他的团队故意放你们的绯闻炒热度。',
        effects: { trust: -40, affection: -25 },
        choices: [
          { id: 'staff_d1_a', text: '分手', riskPreview: '最决绝', statChanges: { affection: -30, mood: -20 } },
          { id: 'staff_d1_b', text: '对炒', riskPreview: '以牙还牙', statChanges: { publicHeat: 20, popularity: 10 } },
          { id: 'staff_d1_c', text: '曝光', riskPreview: '撕破脸', statChanges: { publicHeat: 30, trust: -20, careerPressure: 20 } }
        ]
      }
    ]
  },
  {
    identity: 'volunteer',
    sweetEvents: [
      {
        id: 'volunteer_sweet_1',
        title: '楼梯间偶遇',
        description: '凌晨练习完又在楼梯间遇到他。',
        effects: { affection: 6 },
        choices: [
          { id: 'volunteer_s1_a', text: '打招呼', riskPreview: '温暖但危险', statChanges: { affection: 5, companyAlert: 3 } },
          { id: 'volunteer_s1_b', text: '避开', riskPreview: '安全但错过', statChanges: { affection: -3, secrecy: 5 } },
          { id: 'volunteer_s1_c', text: '多聊几句', riskPreview: '甜蜜但增加风险', statChanges: { affection: 8, companyAlert: 5 } }
        ]
      },
      {
        id: 'volunteer_sweet_2',
        title: '他看你练习',
        description: '他来公司办事，路过练习室看了你很久。',
        effects: { affection: 5, careerPressure: -5 },
        choices: [
          { id: 'volunteer_s2_a', text: '继续练习', riskPreview: '专注但无互动', statChanges: { affection: -2, careerPressure: -3 } },
          { id: 'volunteer_s2_b', text: '和他说话', riskPreview: '甜蜜但被发现', statChanges: { affection: 8, companyAlert: 5 } },
          { id: 'volunteer_s2_c', text: '紧张出错', riskPreview: '可爱但尴尬', statChanges: { affection: 3, mood: -3 } }
        ]
      },
      {
        id: 'volunteer_sweet_3',
        title: '偷偷送吃的',
        description: '他让经纪人给你送吃的，说是「前辈请的」。',
        effects: { affection: 7, companyAlert: 5 },
        choices: [
          { id: 'volunteer_s3_a', text: '收下', riskPreview: '甜蜜但留下痕迹', statChanges: { affection: 5, mood: 5 } },
          { id: 'volunteer_s3_b', text: '拒绝', riskPreview: '安全但让他失落', statChanges: { affection: -3, secrecy: 3 } },
          { id: 'volunteer_s3_c', text: '问是不是他', riskPreview: '直接但暴露', statChanges: { affection: 3, companyAlert: 5 } }
        ]
      }
    ],
    crisisEvents: [
      {
        id: 'volunteer_crisis_1',
        title: '监控拍到',
        description: '公司监控拍到你们在走廊说话。',
        effects: { companyAlert: 20 },
        choices: [
          { id: 'volunteer_c1_a', text: '解释是前辈指导', riskPreview: '合理但可疑', statChanges: { companyAlert: -5, trust: 2 } },
          { id: 'volunteer_c1_b', text: '沉默', riskPreview: '不解释更可疑', statChanges: { companyAlert: 10, mood: -10 } },
          { id: 'volunteer_c1_c', text: '让他帮忙', riskPreview: '他出面但更暴露', statChanges: { careerPressure: 10, affection: 3 } }
        ]
      },
      {
        id: 'volunteer_crisis_2',
        title: '同期练习生怀疑',
        description: '其他练习生问：「你和○○○前辈很熟吗？」',
        effects: { companyAlert: 12, careerPressure: 15 },
        choices: [
          { id: 'volunteer_c2_a', text: '否认', riskPreview: '安全但可能被拆穿', statChanges: { companyAlert: -3, secrecy: 5 } },
          { id: 'volunteer_c2_b', text: '说是偶像', riskPreview: '模糊回答', statChanges: { companyAlert: 0, trust: 2 } },
          { id: 'volunteer_c2_c', text: '转移话题', riskPreview: '回避但引起更多好奇', statChanges: { companyAlert: 5, mood: -5 } }
        ]
      },
      {
        id: 'volunteer_crisis_3',
        title: '恋爱禁止条款警告',
        description: '公司开大会强调：「练习生恋爱直接开除。」',
        effects: { careerPressure: 25 },
        choices: [
          { id: 'volunteer_c3_a', text: '更小心', riskPreview: '安全但辛苦', statChanges: { secrecy: 10, mood: -10 } },
          { id: 'volunteer_c3_b', text: '考虑分手', riskPreview: '理性但痛苦', statChanges: { affection: -10, mood: -15 } },
          { id: 'volunteer_c3_c', text: '告诉男友', riskPreview: '共同面对', statChanges: { affection: 5, trust: 5, careerPressure: 5 } }
        ]
      }
    ],
    explosionEvents: [
      {
        id: 'volunteer_explosion_1',
        title: '被部长叫去谈话',
        description: '「有人反映你和○○○关系不正常。解释一下。」',
        effects: { careerPressure: 40 },
        choices: [
          { id: 'volunteer_e1_a', text: '否认', riskPreview: '硬刚但证据可能存在', statChanges: { companyAlert: 10, trust: -3 } },
          { id: 'volunteer_e1_b', text: '承认是朋友', riskPreview: '部分承认', statChanges: { companyAlert: 15, affection: -5 } },
          { id: 'volunteer_e1_c', text: '哭', riskPreview: '示弱但可能被利用', statChanges: { mood: -20, companyAlert: 5 } }
        ]
      },
      {
        id: 'volunteer_explosion_2',
        title: '出道和爱情二选一',
        description: '公司给你选择：分手，就让你出道。',
        effects: { careerPressure: 50 },
        choices: [
          { id: 'volunteer_e2_a', text: '分手出道', riskPreview: '事业优先', statChanges: { affection: -25, mood: -30, popularity: 20 } },
          { id: 'volunteer_e2_b', text: '放弃出道', riskPreview: '爱情优先但代价巨大', statChanges: { affection: 20, lifeStability: -30, mood: -15 } },
          { id: 'volunteer_e2_c', text: '表面分手', riskPreview: '最危险但两全', statChanges: { secrecy: -15, affection: 5, trust: 5 } }
        ]
      }
    ],
    darkEvents: [
      {
        id: 'volunteer_dark_1',
        title: '他否认认识你',
        description: '公司问他的时候，他说：「不熟，只是前后辈。」',
        effects: { affection: -30, trust: -40 },
        choices: [
          { id: 'volunteer_d1_a', text: '理解', riskPreview: '他也是为了保护', statChanges: { mood: -15, trust: 5 } },
          { id: 'volunteer_d1_b', text: '心碎', riskPreview: '独自承受', statChanges: { mood: -30, mentalHealth: -15 } },
          { id: 'volunteer_d1_c', text: '黑化', riskPreview: '反击', statChanges: { mood: 5, trust: -20, publicHeat: 15 } }
        ]
      }
    ]
  },
  {
    identity: 'student',
    sweetEvents: [
      {
        id: 'student_sweet_1',
        title: '第一次去他家',
        description: '他带你去宿舍/家，说「你是第一个来这里的人」。',
        effects: { affection: 10, trust: 8 },
        choices: [
          { id: 'student_s1_a', text: '感动', riskPreview: '甜蜜但增加依赖', statChanges: { affection: 10, trust: 5 } },
          { id: 'student_s1_b', text: '紧张', riskPreview: '真实反应', statChanges: { affection: 3, mood: 5 } },
          { id: 'student_s1_c', text: '问他真的吗', riskPreview: '确认但可能扫兴', statChanges: { affection: 2, trust: 3 } }
        ]
      },
      {
        id: 'student_sweet_2',
        title: '深夜电话',
        description: '演出结束后他打给你：「今天好累，想听你的声音。」',
        effects: { affection: 7 },
        choices: [
          { id: 'student_s2_a', text: '说想他', riskPreview: '甜蜜但增加依赖', statChanges: { affection: 8, mood: 5 } },
          { id: 'student_s2_b', text: '让他早点睡', riskPreview: '关心但冷淡', statChanges: { affection: -2, trust: 3 } },
          { id: 'student_s2_c', text: '撒娇', riskPreview: '可爱但留下语音', statChanges: { affection: 10, evidenceCount: 1 } }
        ]
      },
      {
        id: 'student_sweet_3',
        title: '他素颜见你',
        description: '他说「我只有在你面前不用化妆」。',
        effects: { affection: 8, trust: 10 },
        choices: [
          { id: 'student_s3_a', text: '说素颜也帅', riskPreview: '甜蜜', statChanges: { affection: 8, mood: 5 } },
          { id: 'student_s3_b', text: '开玩笑', riskPreview: '轻松氛围', statChanges: { affection: 3, trust: 2 } },
          { id: 'student_s3_c', text: '感动', riskPreview: '真诚', statChanges: { affection: 5, trust: 5, mood: 5 } }
        ]
      }
    ],
    crisisEvents: [
      {
        id: 'student_crisis_1',
        title: '朋友泄密',
        description: '你朋友知道后发朋友圈炫耀，被人截图。',
        effects: { publicHeat: 25, careerPressure: 20 },
        choices: [
          { id: 'student_c1_a', text: '让朋友删掉', riskPreview: '紧急处理', statChanges: { publicHeat: -5, mood: -5 } },
          { id: 'student_c1_b', text: '和朋友绝交', riskPreview: '决绝但伤感情', statChanges: { mood: -10, lifeStability: -5 } },
          { id: 'student_c1_c', text: '慌张', riskPreview: '无所作为', statChanges: { mood: -15, publicHeat: 5 } }
        ]
      },
      {
        id: 'student_crisis_2',
        title: '家人反对',
        description: '你家人在新闻上看到他，说「不要和艺人来往」。',
        effects: { careerPressure: 20, affection: -3 },
        choices: [
          { id: 'student_c2_a', text: '隐瞒', riskPreview: '拖延但压力累积', statChanges: { mood: -10, lifeStability: -5 } },
          { id: 'student_c2_b', text: '解释', riskPreview: '沟通但可能更反对', statChanges: { affection: 3, lifeStability: -3 } },
          { id: 'student_c2_c', text: '公开', riskPreview: '勇敢但可能决裂', statChanges: { lifeStability: -15, affection: 5 } }
        ]
      },
      {
        id: 'student_crisis_3',
        title: '你不会韩娱规则',
        description: '你不小心点赞了他的帖子，被粉丝截图。',
        effects: { fanSuspicion: 15, careerPressure: 10 },
        choices: [
          { id: 'student_c3_a', text: '取消点赞', riskPreview: '减少痕迹但已截图', statChanges: { fanSuspicion: -3, mood: -5 } },
          { id: 'student_c3_b', text: '解释说手滑', riskPreview: '合理但可疑', statChanges: { fanSuspicion: 0, mood: -3 } },
          { id: 'student_c3_c', text: '不在意', riskPreview: '淡定但风险自增', statChanges: { fanSuspicion: 5, mood: 0 } }
        ]
      }
    ],
    explosionEvents: [
      {
        id: 'student_explosion_1',
        title: '他被拍到去你家',
        description: '狗仔拍到他去你住处的照片。',
        effects: { publicHeat: 40, companyAlert: 30 },
        choices: [
          { id: 'student_e1_a', text: '说是朋友', riskPreview: '合理但需要配合', statChanges: { publicHeat: -5, fanSuspicion: 5 } },
          { id: 'student_e1_b', text: '沉默', riskPreview: '让舆论发酵', statChanges: { publicHeat: 10, fanSuspicion: 15 } },
          { id: 'student_e1_c', text: '承认', riskPreview: '勇敢但代价巨大', statChanges: { affection: 15, publicHeat: 30, companyAlert: 20 } }
        ]
      },
      {
        id: 'student_explosion_2',
        title: '公司找你谈话',
        description: '「你是外国人，离开韩国吧。条件你开。」',
        effects: { careerPressure: 40 },
        choices: [
          { id: 'student_e2_a', text: '离开', riskPreview: '安全但心碎', statChanges: { affection: -20, mood: -30, lifeStability: 10 } },
          { id: 'student_e2_b', text: '拒绝', riskPreview: '刚烈但对抗公司', statChanges: { companyAlert: 20, mood: 5, affection: 10 } },
          { id: 'student_e2_c', text: '让男友处理', riskPreview: '他出面但更暴露', statChanges: { careerPressure: 15, affection: 5, companyAlert: 10 } }
        ]
      }
    ],
    darkEvents: [
      {
        id: 'student_dark_1',
        title: '他被公司强迫否认',
        description: '公司发声明：「○○○不认识该中国女性。」',
        effects: { affection: -30, trust: -35 },
        choices: [
          { id: 'student_d1_a', text: '沉默', riskPreview: '独自承受', statChanges: { mood: -30, mentalHealth: -15 } },
          { id: 'student_d1_b', text: '发证据', riskPreview: '反击但撕破脸', statChanges: { publicHeat: 30, trust: -20, affection: -10 } },
          { id: 'student_d1_c', text: '回国', riskPreview: '离开一切', statChanges: { mood: -20, lifeStability: -10 } }
        ]
      }
    ]
  },
  {
    identity: 'translator',
    sweetEvents: [
      {
        id: 'translator_sweet_1',
        title: '录音室深夜',
        description: '录音室只剩你们，他唱到沙哑还在坚持。你递上水，他握住了你的手。',
        effects: { affection: 7, trust: 5 },
        choices: [
          { id: 'translator_s1_a', text: '让他握着', riskPreview: '温暖但越界', statChanges: { affection: 8, secrecy: -5 } },
          { id: 'translator_s1_b', text: '抽手继续工作', riskPreview: '职业但冷淡', statChanges: { affection: -3, trust: 3 } },
          { id: 'translator_s1_c', text: '说"先休息吧"', riskPreview: '关心但回避', statChanges: { affection: 3, careerPressure: -5 } }
        ]
      },
      {
        id: 'translator_sweet_2',
        title: '歌词里的暗号',
        description: '他新歌的歌词里有一句只有你懂的隐喻。你问他，他笑了。',
        effects: { affection: 8, publicHeat: 5 },
        choices: [
          { id: 'translator_s2_a', text: '说听懂了', riskPreview: '甜蜜但留下记录', statChanges: { affection: 10, evidenceCount: 1 } },
          { id: 'translator_s2_b', text: '装作不知道', riskPreview: '安全但错过', statChanges: { affection: -2, secrecy: 3 } },
          { id: 'translator_s2_c', text: '也写一句回去', riskPreview: '浪漫但危险', statChanges: { affection: 12, evidenceCount: 2 } }
        ]
      },
      {
        id: 'translator_sweet_3',
        title: '他为你弹钢琴',
        description: '录音间隙，他坐在钢琴前弹了一首没发表过的曲子，说"这首是给你的"。',
        effects: { affection: 10, trust: 8 },
        choices: [
          { id: 'translator_s3_a', text: '安静听完', riskPreview: '深情但沉默', statChanges: { affection: 8, mood: 10 } },
          { id: 'translator_s3_b', text: '坐到他旁边', riskPreview: '亲密但危险', statChanges: { affection: 12, secrecy: -8 } },
          { id: 'translator_s3_c', text: '录音', riskPreview: '留证据', statChanges: { evidenceCount: 2, affection: -3 } }
        ]
      }
    ],
    crisisEvents: [
      {
        id: 'translator_crisis_1',
        title: '版权争议',
        description: '有人质疑你写的歌是不是他真的参与创作，怀疑代笔。',
        effects: { companyAlert: 15, careerPressure: 20 },
        choices: [
          { id: 'translator_c1_a', text: '出示创作记录', riskPreview: '证明但暴露亲密', statChanges: { companyAlert: 10, trust: 5 } },
          { id: 'translator_c1_b', text: '让他出面澄清', riskPreview: '他出面但更可疑', statChanges: { careerPressure: 10, affection: 3 } },
          { id: 'translator_c1_c', text: '沉默', riskPreview: '让舆论发酵', statChanges: { publicHeat: 10, mood: -10 } }
        ]
      },
      {
        id: 'translator_crisis_2',
        title: '其他制作人追求',
        description: '另一个知名制作人对你的才华很欣赏，频繁约你合作。',
        effects: { affection: -5, trust: -3 },
        choices: [
          { id: 'translator_c2_a', text: '拒绝', riskPreview: '忠诚但错失机会', statChanges: { affection: 5, popularity: -5 } },
          { id: 'translator_c2_b', text: '接受合作', riskPreview: '事业但让他吃醋', statChanges: { affection: -8, popularity: 10 } },
          { id: 'translator_c2_c', text: '告诉他', riskPreview: '坦诚但增加不安', statChanges: { trust: 5, affection: 2 } }
        ]
      },
      {
        id: 'translator_crisis_3',
        title: '录音室被撞见',
        description: '公司高管突然来录音室，看到你们靠得很近。',
        effects: { companyAlert: 20, careerPressure: 15 },
        choices: [
          { id: 'translator_c3_a', text: '镇定解释在工作', riskPreview: '专业应对', statChanges: { companyAlert: -5, trust: 3 } },
          { id: 'translator_c3_b', text: '慌张', riskPreview: '更加可疑', statChanges: { companyAlert: 10, affection: -3 } },
          { id: 'translator_c3_c', text: '提前想好借口', riskPreview: '有备无患', statChanges: { secrecy: 5, companyAlert: 0 } }
        ]
      }
    ],
    explosionEvents: [
      {
        id: 'translator_explosion_1',
        title: '歌词泄露',
        description: '你写给他的未发表歌词被泄露，里面有明显的私人情感。',
        effects: { publicHeat: 35, companyAlert: 25 },
        choices: [
          { id: 'translator_e1_a', text: '说是创作想象', riskPreview: '合理但没人信', statChanges: { publicHeat: -5, fanSuspicion: 10 } },
          { id: 'translator_e1_b', text: '承认是写给他的', riskPreview: '坦诚但暴露', statChanges: { affection: 10, publicHeat: 15 } },
          { id: 'translator_e1_c', text: '让公司公关', riskPreview: '专业但失去话语权', statChanges: { companyAlert: 15, publicHeat: -10 } }
        ]
      },
      {
        id: 'translator_explosion_2',
        title: '他被要求换制作人',
        description: '公司要求他下一首主打换别的制作人，理由是"风格需要"。',
        effects: { affection: -10, careerPressure: 30 },
        choices: [
          { id: 'translator_e2_a', text: '接受', riskPreview: '职业但痛苦', statChanges: { affection: -5, lifeStability: 5 } },
          { id: 'translator_e2_b', text: '让他争取', riskPreview: '他出面但更暴露', statChanges: { careerPressure: 15, affection: 10, companyAlert: 10 } },
          { id: 'translator_e2_c', text: '私下继续合作', riskPreview: '秘密但危险', statChanges: { secrecy: -15, affection: 8, trust: 5 } }
        ]
      }
    ],
    darkEvents: [
      {
        id: 'translator_dark_1',
        title: '他否认你的创作',
        description: '采访中他说：「歌词都是我自己写的，制作人只是帮忙编曲。」',
        effects: { affection: -20, trust: -30 },
        choices: [
          { id: 'translator_d1_a', text: '质问他', riskPreview: '要一个解释', statChanges: { affection: -5, trust: -10, careerPressure: 5 } },
          { id: 'translator_d1_b', text: '沉默', riskPreview: '独自承受', statChanges: { mood: -25, mentalHealth: -10 } },
          { id: 'translator_d1_c', text: '曝光真相', riskPreview: '撕破脸', statChanges: { publicHeat: 30, trust: -20, careerPressure: 20 } }
        ]
      }
    ]
  },
  {
    identity: 'parttime',
    sweetEvents: [
      {
        id: 'parttime_sweet_1',
        title: '私人晚餐',
        description: '他真的请你去了一家很隐秘的餐厅，没有保镖没有经纪人。',
        effects: { affection: 8, trust: 5 },
        choices: [
          { id: 'parttime_s1_a', text: '享受约会', riskPreview: '甜蜜但危险', statChanges: { affection: 10, secrecy: -8 } },
          { id: 'parttime_s1_b', text: '提醒他注意安全', riskPreview: '理性但扫兴', statChanges: { affection: -2, trust: 5 } },
          { id: 'parttime_s1_c', text: '你买单', riskPreview: '权力反转', statChanges: { affection: 5, money: -10 } }
        ]
      },
      {
        id: 'parttime_sweet_2',
        title: '他送你回家',
        description: '晚餐后他坚持送你回家，在车里他说：「和你在一起的时候，我不用做任何人。」',
        effects: { affection: 10, trust: 8 },
        choices: [
          { id: 'parttime_s2_a', text: '说"我也是"', riskPreview: '双向奔赴', statChanges: { affection: 12, trust: 8 } },
          { id: 'parttime_s2_b', text: '沉默微笑', riskPreview: '内敛但温暖', statChanges: { affection: 5, mood: 10 } },
          { id: 'parttime_s2_c', text: '开玩笑说"你欠我一顿"', riskPreview: '轻松氛围', statChanges: { affection: 3, trust: 2 } }
        ]
      },
      {
        id: 'parttime_sweet_3',
        title: '他向你借钱',
        description: '他低声说想做一个独立项目但公司不支持，问你能不能投资。这是试探还是真心？',
        effects: { affection: 5, trust: -5 },
        choices: [
          { id: 'parttime_s3_a', text: '答应投资', riskPreview: '信任但可能被利用', statChanges: { affection: 10, money: -20, trust: 5 } },
          { id: 'parttime_s3_b', text: '拒绝', riskPreview: '保护自己但伤感情', statChanges: { affection: -8, trust: -3 } },
          { id: 'parttime_s3_c', text: '说"先让我看看计划书"', riskPreview: '理性折中', statChanges: { affection: 2, trust: 5 } }
        ]
      }
    ],
    crisisEvents: [
      {
        id: 'parttime_crisis_1',
        title: '家族反对',
        description: '你家人知道你在和一个爱豆来往，觉得有失身份。',
        effects: { careerPressure: 20, lifeStability: -10 },
        choices: [
          { id: 'parttime_c1_a', text: '坚持自己的选择', riskPreview: '独立但对抗家族', statChanges: { affection: 8, lifeStability: -15 } },
          { id: 'parttime_c1_b', text: '暂时隐瞒', riskPreview: '安全但压力累积', statChanges: { mood: -10, secrecy: 5 } },
          { id: 'parttime_c1_c', text: '让家人见他', riskPreview: '正面解决但可能更糟', statChanges: { lifeStability: -5, affection: 5 } }
        ]
      },
      {
        id: 'parttime_crisis_2',
        title: '公司讨好你',
        description: '他的公司发现你的背景后，开始对你特别热情，明显是想利用你的资本。',
        effects: { companyAlert: 15, trust: -5 },
        choices: [
          { id: 'parttime_c2_a', text: '利用这个优势', riskPreview: '权力但交易化', statChanges: { companyAlert: -10, trust: -10 } },
          { id: 'parttime_c2_b', text: '保持距离', riskPreview: '独立但失去筹码', statChanges: { trust: 5, companyAlert: 5 } },
          { id: 'parttime_c2_c', text: '告诉他你的顾虑', riskPreview: '坦诚但增加他的压力', statChanges: { affection: 5, trust: 5, careerPressure: 10 } }
        ]
      },
      {
        id: 'parttime_crisis_3',
        title: '被拍到出入高档场所',
        description: '你和他在私人会所被拍到，虽然没拍到脸，但衣着被认出。',
        effects: { publicHeat: 25, fanSuspicion: 20 },
        choices: [
          { id: 'parttime_c3_a', text: '说是商务应酬', riskPreview: '合理但需要配合', statChanges: { publicHeat: -5, fanSuspicion: -5 } },
          { id: 'parttime_c3_b', text: '不在意', riskPreview: '财阀底气但风险自增', statChanges: { publicHeat: 5, fanSuspicion: 10 } },
          { id: 'parttime_c3_c', text: '让家族公关处理', riskPreview: '专业但家族介入', statChanges: { publicHeat: -15, lifeStability: -5 } }
        ]
      }
    ],
    explosionEvents: [
      {
        id: 'parttime_explosion_1',
        title: '资本与爱情的抉择',
        description: '你的家族企业和他公司发生商业冲突，你必须选择立场。',
        effects: { affection: -15, careerPressure: 35 },
        choices: [
          { id: 'parttime_e1_a', text: '站在他这边', riskPreview: '爱情优先但对抗家族', statChanges: { affection: 20, trust: 15, lifeStability: -20 } },
          { id: 'parttime_e1_b', text: '站在家族这边', riskPreview: '理性但伤感情', statChanges: { affection: -25, trust: -15, lifeStability: 10 } },
          { id: 'parttime_e1_c', text: '试图调解', riskPreview: '两全但困难', statChanges: { careerPressure: 15, affection: 5, trust: 5 } }
        ]
      },
      {
        id: 'parttime_explosion_2',
        title: '他承认利用你',
        description: '吵架时他说漏嘴：「一开始确实是因为你的背景才接近你的。」',
        effects: { affection: -25, trust: -35 },
        choices: [
          { id: 'parttime_e2_a', text: '分手', riskPreview: '最决绝', statChanges: { affection: -30, mood: -25 } },
          { id: 'parttime_e2_b', text: '问他现在呢', riskPreview: '给机会但需要答案', statChanges: { affection: -5, trust: -10, careerPressure: 10 } },
          { id: 'parttime_e2_c', text: '说"我也是"', riskPreview: '以毒攻毒', statChanges: { trust: -20, mood: 5 } }
        ]
      }
    ],
    darkEvents: [
      {
        id: 'parttime_dark_1',
        title: '你用资本控制他',
        description: '你用投资威胁他的公司，让他不能离开你。你赢了，但你也输了。',
        effects: { affection: -30, trust: -40 },
        choices: [
          { id: 'parttime_d1_a', text: '继续控制', riskPreview: '赢了但空洞', statChanges: { affection: -20, mood: -10, lifeStability: 10 } },
          { id: 'parttime_d1_b', text: '放手', riskPreview: '痛苦但正确', statChanges: { affection: 10, trust: 10, mood: -20 } },
          { id: 'parttime_d1_c', text: '寻求帮助', riskPreview: '承认问题', statChanges: { mentalHealth: 5, mood: -5 } }
        ]
      }
    ]
  },
  {
    identity: 'custom',
    sweetEvents: [
      {
        id: 'custom_sweet_1',
        title: '第一次去他家',
        description: '他带你去宿舍/家，说「你是第一个来这里的人」。',
        effects: { affection: 10, trust: 8 },
        choices: [
          { id: 'custom_s1_a', text: '感动', riskPreview: '甜蜜但增加依赖', statChanges: { affection: 10, trust: 5 } },
          { id: 'custom_s1_b', text: '紧张', riskPreview: '真实反应', statChanges: { affection: 3, mood: 5 } },
          { id: 'custom_s1_c', text: '问他真的吗', riskPreview: '确认但可能扫兴', statChanges: { affection: 2, trust: 3 } }
        ]
      },
      {
        id: 'custom_sweet_2',
        title: '深夜电话',
        description: '演出结束后他打给你：「今天好累，想听你的声音。」',
        effects: { affection: 7 },
        choices: [
          { id: 'custom_s2_a', text: '说想他', riskPreview: '甜蜜但增加依赖', statChanges: { affection: 8, mood: 5 } },
          { id: 'custom_s2_b', text: '让他早点睡', riskPreview: '关心但冷淡', statChanges: { affection: -2, trust: 3 } },
          { id: 'custom_s2_c', text: '撒娇', riskPreview: '可爱但留下语音', statChanges: { affection: 10, evidenceCount: 1 } }
        ]
      },
      {
        id: 'custom_sweet_3',
        title: '他素颜见你',
        description: '他说「我只有在你面前不用化妆」。',
        effects: { affection: 8, trust: 10 },
        choices: [
          { id: 'custom_s3_a', text: '说素颜也帅', riskPreview: '甜蜜', statChanges: { affection: 8, mood: 5 } },
          { id: 'custom_s3_b', text: '开玩笑', riskPreview: '轻松氛围', statChanges: { affection: 3, trust: 2 } },
          { id: 'custom_s3_c', text: '感动', riskPreview: '真诚', statChanges: { affection: 5, trust: 5, mood: 5 } }
        ]
      }
    ],
    crisisEvents: [
      {
        id: 'custom_crisis_1',
        title: '朋友泄密',
        description: '你朋友知道后发朋友圈炫耀，被人截图。',
        effects: { publicHeat: 25, careerPressure: 20 },
        choices: [
          { id: 'custom_c1_a', text: '让朋友删掉', riskPreview: '紧急处理', statChanges: { publicHeat: -5, mood: -5 } },
          { id: 'custom_c1_b', text: '和朋友绝交', riskPreview: '决绝但伤感情', statChanges: { mood: -10, lifeStability: -5 } },
          { id: 'custom_c1_c', text: '慌张', riskPreview: '无所作为', statChanges: { mood: -15, publicHeat: 5 } }
        ]
      },
      {
        id: 'custom_crisis_2',
        title: '家人反对',
        description: '你家人在新闻上看到他，说「不要和艺人来往」。',
        effects: { careerPressure: 20, affection: -3 },
        choices: [
          { id: 'custom_c2_a', text: '隐瞒', riskPreview: '拖延但压力累积', statChanges: { mood: -10, lifeStability: -5 } },
          { id: 'custom_c2_b', text: '解释', riskPreview: '沟通但可能更反对', statChanges: { affection: 3, lifeStability: -3 } },
          { id: 'custom_c2_c', text: '公开', riskPreview: '勇敢但可能决裂', statChanges: { lifeStability: -15, affection: 5 } }
        ]
      },
      {
        id: 'custom_crisis_3',
        title: '你不会韩娱规则',
        description: '你不小心点赞了他的帖子，被粉丝截图。',
        effects: { fanSuspicion: 15, careerPressure: 10 },
        choices: [
          { id: 'custom_c3_a', text: '取消点赞', riskPreview: '减少痕迹但已截图', statChanges: { fanSuspicion: -3, mood: -5 } },
          { id: 'custom_c3_b', text: '解释说手滑', riskPreview: '合理但可疑', statChanges: { fanSuspicion: 0, mood: -3 } },
          { id: 'custom_c3_c', text: '不在意', riskPreview: '淡定但风险自增', statChanges: { fanSuspicion: 5, mood: 0 } }
        ]
      }
    ],
    explosionEvents: [
      {
        id: 'custom_explosion_1',
        title: '他被拍到去你家',
        description: '狗仔拍到他去你住处的照片。',
        effects: { publicHeat: 40, companyAlert: 30 },
        choices: [
          { id: 'custom_e1_a', text: '说是朋友', riskPreview: '合理但需要配合', statChanges: { publicHeat: -5, fanSuspicion: 5 } },
          { id: 'custom_e1_b', text: '沉默', riskPreview: '让舆论发酵', statChanges: { publicHeat: 10, fanSuspicion: 15 } },
          { id: 'custom_e1_c', text: '承认', riskPreview: '勇敢但代价巨大', statChanges: { affection: 15, publicHeat: 30, companyAlert: 20 } }
        ]
      },
      {
        id: 'custom_explosion_2',
        title: '公司找你谈话',
        description: '「你是外国人，离开韩国吧。条件你开。」',
        effects: { careerPressure: 40 },
        choices: [
          { id: 'custom_e2_a', text: '离开', riskPreview: '安全但心碎', statChanges: { affection: -20, mood: -30, lifeStability: 10 } },
          { id: 'custom_e2_b', text: '拒绝', riskPreview: '刚烈但对抗公司', statChanges: { companyAlert: 20, mood: 5, affection: 10 } },
          { id: 'custom_e2_c', text: '让男友处理', riskPreview: '他出面但更暴露', statChanges: { careerPressure: 15, affection: 5, companyAlert: 10 } }
        ]
      }
    ],
    darkEvents: [
      {
        id: 'custom_dark_1',
        title: '他被公司强迫否认',
        description: '公司发声明：「○○○不认识该中国女性。」',
        effects: { affection: -30, trust: -35 },
        choices: [
          { id: 'custom_d1_a', text: '沉默', riskPreview: '独自承受', statChanges: { mood: -30, mentalHealth: -15 } },
          { id: 'custom_d1_b', text: '发证据', riskPreview: '反击但撕破脸', statChanges: { publicHeat: 30, trust: -20, affection: -10 } },
          { id: 'custom_d1_c', text: '回国', riskPreview: '离开一切', statChanges: { mood: -20, lifeStability: -10 } }
        ]
      }
    ]
  }
]

export const identityEndings: IdentityEndings[] = [
  {
    identity: 'fan',
    endings: [
      { id: 'fan_he', type: 'HE', title: '从粉丝到爱人', condition: 'affection>85, trust>70, fanSuspicion<40', description: '多年后你们公开。当年的粉丝群里有人说：「原来嫂子是当初那个签售姐……难怪。」' },
      { id: 'fan_ne', type: 'NE', title: '脱粉回坑', condition: 'affection>60且<80, fanSuspicion过高', description: '你脱粉了。不再去签售，不再刷音源。半年后你刷到他的新歌，歌词里有一句：「那个签售会上给我写信的人，还幸福吗？」' },
      { id: 'fan_be', type: 'BE', title: '被粉圈吃掉', condition: 'fanSuspicion>80, companyAlert高, 男友沉默', description: '你被全网人肉，被迫退学/辞职。他的公司发声明：「该粉丝系私生饭，与我司艺人无关。」' },
      { id: 'fan_se1', type: 'SE', title: '站姐复仇', condition: '被粉丝攻击后选择反击，掌握粉圈黑料', description: '你曝光了大站姐的集资黑幕。粉圈地震。你不在乎了。' },
      { id: 'fan_se2', type: 'SE', title: '偶像的愧疚', condition: 'hiddenPersona=true_love, 外界压力导致分手', description: '多年后他退伍，在一个小访谈里说：「我曾经喜欢过一个粉丝。希望她现在过得好。」' }
    ]
  },
  {
    identity: 'intern',
    endings: [
      { id: 'intern_he', type: 'HE', title: '从经纪人到妻子', condition: 'affection>85, trust>80, 公司接受, 事业转型', description: '他转型演员/成立个人工作室，你成为他的合伙人兼妻子。' },
      { id: 'intern_ne', type: 'NE', title: '离开但祝福', condition: 'affection>60, 职业压力过高', description: '你辞职离开公司。最后一条KakaoTalk他说：「谢谢你做我的经纪人，也谢谢你爱过我。」' },
      { id: 'intern_be', type: 'BE', title: '职业毁灭', condition: '恋情曝光且公司放弃', description: '你被行业拉黑。他继续活动，绝口不提你。' },
      { id: 'intern_se1', type: 'SE', title: '危机公关女王', condition: '多次成功处理危机，公司依赖你', description: '你成为业内最牛的危机公关。他后来结婚了，新娘不是你。你们在会议室握手：「合作愉快。」' },
      { id: 'intern_se2', type: 'SE', title: '互相成就', condition: 'affection>80, 双方事业成功', description: '你成为金牌经纪人，他是top艺人。你们不公开，但圈内都知道。' }
    ]
  },
  {
    identity: 'stylist',
    endings: [
      { id: 'stylist_he', type: 'HE', title: '他的专属造型师', condition: 'affection>85, trust>75, 成立个人工作室', description: '你成为他的私人造型师，也是他的妻子。你们一起走时装周。' },
      { id: 'stylist_ne', type: 'NE', title: '最美的作品', condition: 'affection>60, 行业机会出现', description: '你去纽约发展，成为国际知名造型师。他后来结婚，新娘穿的不是你设计的衣服。' },
      { id: 'stylist_be', type: 'BE', title: '化妆间的秘密', condition: '恋情曝光且被行业排斥', description: '你和他的关系成为行业谈资。没人再找你工作。你离开首尔。' },
      { id: 'stylist_se1', type: 'SE', title: '幕后女王', condition: 'affection<40, 事业极成功', description: '你成为顶级造型师，给无数顶流做造型。他也在你手下工作过。你们的关系？工作而已。' },
      { id: 'stylist_se2', type: 'SE', title: '爱情与事业两全', condition: 'affection>80, 双方成熟处理', description: '你们不公开，但圈内都知道。你是他的造型师，也是他的爱人。每次他上台前，整理领带的都是你。' }
    ]
  },
  {
    identity: 'staff',
    endings: [
      { id: 'staff_he', type: 'HE', title: '顶流情侣', condition: 'affection>85, 双方人气稳定, 公司支持', description: '你们公开，成为韩娱第一公开情侣。一起代言，一起走红毯。' },
      { id: 'staff_ne', type: 'NE', title: '各自为王', condition: 'affection>50且<70, 事业优先', description: '和平分手，专注事业。后来你们在颁奖礼上同台，相视一笑。' },
      { id: 'staff_be', type: 'BE', title: '双输', condition: '恋情曝光且处理失败, 两家公司放弃', description: '你们都被雪藏，粉丝脱粉，资源全丢。最后连电话都不敢打。' },
      { id: 'staff_se1', type: 'SE', title: '秘密夫妻', condition: 'affection>90, trust>85, 对外否认但私下结婚', description: '你们在国外登记，圈内只有少数人知道。台上是前后辈，台下是夫妻。' },
      { id: 'staff_se2', type: 'SE', title: '对家变冤家', condition: 'affection<30, 但多次合作', description: '你们成为最著名的「对家」，粉丝互相攻击。但你知道，有些夜晚不是这样。' }
    ]
  },
  {
    identity: 'volunteer',
    endings: [
      { id: 'volunteer_he', type: 'HE', title: '出道后公开', condition: 'affection>85, 成功出道, 公司默许', description: '你出道成功后公开恋情，被称为「最励志情侣」。' },
      { id: 'volunteer_ne', type: 'NE', title: '各自出道', condition: 'affection>50且<70, 都成功出道但错过', description: '你出道了，他也更红了。你们渐行渐远。' },
      { id: 'volunteer_be', type: 'BE', title: '牺牲的爱情', condition: '出道失败, 恋情也没保住', description: '你被开除，他也被公司管控。最后你们连再见都没说。' },
      { id: 'volunteer_se1', type: 'SE', title: '练习生嫂子传奇', condition: 'affection<30, 但你成为顶级爱豆', description: '你出道后比他更红。他在后台叫你「前辈」。' },
      { id: 'volunteer_se2', type: 'SE', title: '从地下到地上', condition: 'affection>90, 共同扛过所有压力', description: '你出道后你们公开，一起面对舆论。他说：「那时候你是练习生，现在你是我的骄傲。」' }
    ]
  },
  {
    identity: 'student',
    endings: [
      { id: 'student_he', type: 'HE', title: '韩剧女主角', condition: 'affection>90, trust>85, 处理好所有危机', description: '你们结婚，你成为「那个中国嫂子」。粉丝从骂到接受。' },
      { id: 'student_ne', type: 'NE', title: '浪漫回忆', condition: 'affection>60, 但现实不允许', description: '你回国了。偶尔还会想起弘大咖啡店那个戴口罩的男人。' },
      { id: 'student_be', type: 'BE', title: '圈外人的代价', condition: '舆论压力过大, 他没保护你', description: '你被全网网暴后回国，再也没关注过K-POP。' },
      { id: 'student_se1', type: 'SE', title: '异国重逢', condition: '分手后多年在海外重逢', description: '你在国内过得很好。某天在机场，他认出了你。你们对视了三秒，然后各自走向不同的登机口。' }
    ]
  },
  {
    identity: 'translator',
    endings: [
      { id: 'translator_he', type: 'HE', title: '最佳拍档', condition: 'affection>85, trust>80, 创作与爱情并存', description: '你们成为韩娱最著名的创作搭档，也是恋人。每首 hit 歌背后都有你们的故事。' },
      { id: 'translator_ne', type: 'NE', title: '只留下旋律', condition: 'affection>60, 但分不清爱与创作', description: '你离开了韩国音乐圈。多年后你听到他新歌的旋律，那是你们一起写的最后一首。' },
      { id: 'translator_be', type: 'BE', title: '灵感枯竭', condition: '恋情破裂后无法再创作', description: '分手后你再也写不出一首歌。他换了新制作人，风格完全不同。你的才华，好像只为他存在。' },
      { id: 'translator_se1', type: 'SE', title: '金牌制作人', condition: 'affection<40, 但事业极成功', description: '你成为韩国最抢手的制作人，给所有顶流写歌。包括他。每次录音室里，你们只谈音乐。' }
    ]
  },
  {
    identity: 'parttime',
    endings: [
      { id: 'parttime_he', type: 'HE', title: '权力与爱情', condition: 'affection>90, trust>85, 真心确认', description: '他用行动证明他爱的是你这个人，不是你的资本。你们成为韩娱最有权势的夫妻。' },
      { id: 'parttime_ne', type: 'NE', title: '各取所需', condition: 'affection>50且<70, 利益绑定', description: '你们维持着微妙的关系——他需要你的资源，你需要他的名气。不是爱情，但也不算交易。' },
      { id: 'parttime_be', type: 'BE', title: '资本的囚徒', condition: '用资本控制他, 感情彻底破裂', description: '你赢了。他离不开你，但也不爱你。你们住在同一栋豪宅里，比陌生人还远。' },
      { id: 'parttime_se1', type: 'SE', title: '放手', condition: '主动退出, 成全他的自由', description: '你撤回了所有投资，放他自由。他后来在采访里说：「有一个人，她教会我什么是真正的自由。」' }
    ]
  },
  {
    identity: 'custom',
    endings: [
      { id: 'custom_he', type: 'HE', title: '韩剧女主角', condition: 'affection>90, trust>85, 处理好所有危机', description: '你们结婚，你成为「那个中国嫂子」。粉丝从骂到接受。' },
      { id: 'custom_ne', type: 'NE', title: '浪漫回忆', condition: 'affection>60, 但现实不允许', description: '你回国了。偶尔还会想起弘大咖啡店那个戴口罩的男人。' },
      { id: 'custom_be', type: 'BE', title: '圈外人的代价', condition: '舆论压力过大, 他没保护你', description: '你被全网网暴后回国，再也没关注过K-POP。' },
      { id: 'custom_se1', type: 'SE', title: '异国重逢', condition: '分手后多年在海外重逢', description: '你在国内过得很好。某天在机场，他认出了你。你们对视了三秒，然后各自走向不同的登机口。' }
    ]
  }
]

export function getIdentityStory(identity: PlayerIdentity): IdentityStoryOpening | undefined {
  return identityStoryOpenings.find(s => s.identity === identity)
}

export function getIdentityEvents(identity: PlayerIdentity): IdentityEvents | undefined {
  return identityEvents.find(e => e.identity === identity)
}

export function getIdentityEndings(identity: PlayerIdentity): IdentityEnding[] {
  const found = identityEndings.find(e => e.identity === identity)
  return found ? found.endings : []
}
