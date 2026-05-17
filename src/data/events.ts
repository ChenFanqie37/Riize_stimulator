import type { EventChain, GameEvent, EventChoice } from '../types/game'

export const eventChains: EventChain[] = [
  {
    id: 'ring_incident',
    title: '戒指事件',
    currentStage: 0,
    totalStages: 4,
    isActive: false,
    isCompleted: false,
    stages: [
      {
        title: '无名指的秘密',
        description: '他在直播中无意间露出了无名指上的戒指——那不是公司配饰，是你送的情侣对戒。弹幕瞬间炸了，"那个戒指是什么？""是情侣戒吗？？？"刷屏。',
        triggerCondition: 'affection >= 60 && relationshipStage >= "confirmed"',
        choices: [
          {
            id: 'ring_1a',
            text: '立刻让他摘掉，假装什么都没发生',
            riskPreview: '低风险但伤害感情',
            statChanges: { affection: -5, trust: -3, fanSuspicion: 5 },
            nextStage: 1,
            tags: ['protective', 'deny']
          },
          {
            id: 'ring_1b',
            text: '让他自己处理，你相信他',
            riskPreview: '中等风险但维护信任',
            statChanges: { trust: 5, fanSuspicion: 10, publicHeat: 5 },
            nextStage: 1,
            tags: ['trust', 'risk']
          },
          {
            id: 'ring_1c',
            text: '在Weverse发帖转移注意力',
            riskPreview: '需要消耗行动点',
            statChanges: { fanSuspicion: -5, actionPoints: -1 },
            nextStage: 1,
            tags: ['strategic', 'fan_management']
          }
        ],
        consequences: { fanSuspicion: 10, publicHeat: 5 }
      },
      {
        title: '粉圈考古',
        description: '大粉开始考古，有人翻出了你之前在Instagram发的照片——你手上也有同款戒指。虽然照片已经删除，但截图在粉圈群聊里疯传。',
        triggerCondition: 'fanSuspicion >= 30',
        choices: [
          {
            id: 'ring_2a',
            text: '彻底注销Instagram账号',
            riskPreview: '消除证据但引起更多怀疑',
            statChanges: { fanSuspicion: 5, evidenceCount: -2, mood: -10 },
            nextStage: 2,
            tags: ['panic', 'destroy_evidence']
          },
          {
            id: 'ring_2b',
            text: '发声明说是朋友送的',
            riskPreview: '暂时平息但留下隐患',
            statChanges: { fanSuspicion: -10, trust: -5, evidenceCount: 1 },
            nextStage: 2,
            tags: ['lie', 'delay']
          },
          {
            id: 'ring_2c',
            text: '让男朋友在直播中解释是家人送的',
            riskPreview: '需要他配合，增加他的压力',
            statChanges: { affection: -3, careerPressure: 10, fanSuspicion: -15 },
            nextStage: 2,
            tags: ['cooperate', 'pressure_him']
          }
        ],
        consequences: { fanSuspicion: 15, evidenceCount: 2 }
      },
      {
        title: 'D社线索',
        description: 'Dispatch发了一条暧昧的预告："某新人男团成员的戒指故事，比你们想的更精彩。"配图是模糊的手部特写。倒计时开始了。',
        triggerCondition: 'publicHeat >= 30 && evidenceCount >= 2',
        choices: [
          {
            id: 'ring_3a',
            text: '主动联系D社谈判',
            riskPreview: '极度危险，可能被反噬',
            statChanges: { paparazziAttention: 20, secrecy: -15, publicHeat: 10 },
            nextStage: 3,
            tags: ['desperate', 'negotiate']
          },
          {
            id: 'ring_3b',
            text: '和男朋友商量对策，统一口径',
            riskPreview: '最稳妥但需要高度信任',
            statChanges: { trust: 8, affection: 5, careerPressure: 5 },
            nextStage: 3,
            tags: ['teamwork', 'trust']
          },
          {
            id: 'ring_3c',
            text: '暂时断联，等风头过去',
            riskPreview: '保护双方但伤害感情',
            statChanges: { affection: -15, trust: -10, secrecy: 10, mood: -20 },
            nextStage: 3,
            tags: ['sacrifice', 'cold_turkey']
          }
        ],
        consequences: { paparazziAttention: 15, publicHeat: 10 }
      },
      {
        title: '真相时刻',
        description: '戒指事件到了最终关头。公司已经介入，粉丝的拼图即将完成。你必须做出最终选择——这段关系，何去何从？',
        triggerCondition: 'week >= 8',
        choices: [
          {
            id: 'ring_4a',
            text: '公开承认恋情',
            riskPreview: '勇敢但代价巨大',
            statChanges: { affection: 20, trust: 15, careerPressure: 30, publicHeat: 50, secrecy: -50 },
            tags: ['brave', 'public', 'consequence']
          },
          {
            id: 'ring_4b',
            text: '共同否认，转入地下',
            riskPreview: '安全但压抑',
            statChanges: { affection: -5, trust: 5, secrecy: 20, mood: -15 },
            tags: ['deny', 'underground', 'survive']
          },
          {
            id: 'ring_4c',
            text: '提出分手，保护他的事业',
            riskPreview: '最痛但最安全',
            statChanges: { affection: -30, mood: -40, careerPressure: -20, secrecy: 30 },
            tags: ['sacrifice', 'breakup', 'protect']
          }
        ],
        consequences: { careerPressure: 20, publicHeat: 15 }
      }
    ]
  },
  {
    id: 'hotel_incident',
    title: '深夜酒店事件',
    currentStage: 0,
    totalStages: 3,
    isActive: false,
    isCompleted: false,
    stages: [
      {
        title: '凌晨两点',
        description: '他海外行程结束的深夜，给你发了一条kakaoTalk："能出来吗？我就在你附近的酒店。"配了一张酒店大堂的照片。凌晨两点，一个爱豆在酒店——这个邀请本身就充满了危险。',
        triggerCondition: 'affection >= 40 && relationshipStage >= "ambiguous"',
        choices: [
          {
            id: 'hotel_1a',
            text: '去见他',
            riskPreview: '高风险高回报',
            statChanges: { affection: 15, trust: 10, paparazziAttention: 15, secrecy: -10 },
            nextStage: 1,
            tags: ['brave', 'romantic', 'risky']
          },
          {
            id: 'hotel_1b',
            text: '拒绝，太危险了',
            riskPreview: '安全但让他失望',
            statChanges: { affection: -8, trust: 5, secrecy: 5 },
            nextStage: 1,
            tags: ['cautious', 'safe']
          },
          {
            id: 'hotel_1c',
            text: '让他来你这里',
            riskPreview: '转移风险到你身上',
            statChanges: { affection: 10, trust: 8, paparazziAttention: 20, secrecy: -15 },
            nextStage: 1,
            tags: ['protective', 'risky']
          }
        ],
        consequences: { paparazziAttention: 10 }
      },
      {
        title: '走廊里的脚步声',
        description: '无论你做了什么选择，第二天酒店走廊的监控录像成了悬在头顶的炸弹。有人——可能是酒店员工，可能是其他住客——拍到了什么。',
        triggerCondition: 'paparazziAttention >= 25',
        choices: [
          {
            id: 'hotel_2a',
            text: '联系酒店要求删除监控',
            riskPreview: '可能有效但留下记录',
            statChanges: { secrecy: 5, evidenceCount: -1, companyAlert: 10 },
            nextStage: 2,
            tags: ['proactive', 'cover_up']
          },
          {
            id: 'hotel_2b',
            text: '装作什么都没发生',
            riskPreview: '赌没人注意到',
            statChanges: { anxiety: 10, secrecy: -5 },
            nextStage: 2,
            tags: ['gamble', 'ignore']
          },
          {
            id: 'hotel_2c',
            text: '和男朋友坦白你的恐惧',
            riskPreview: '增进感情但增加他的压力',
            statChanges: { affection: 5, trust: 10, careerPressure: 8, mood: -5 },
            nextStage: 2,
            tags: ['honest', 'vulnerable']
          }
        ],
        consequences: { evidenceCount: 2, paparazziAttention: 10 }
      },
      {
        title: '午夜来电',
        description: '经纪人深夜打来电话："有人卖了一段酒店监控视频给媒体，画面里有他，还有一个人看不清。公司需要他给出解释。他说是你。"',
        triggerCondition: 'evidenceCount >= 3 && companyAlert >= 30',
        choices: [
          {
            id: 'hotel_3a',
            text: '站出来承认，和他一起面对',
            riskPreview: '最勇敢的选择，代价最大',
            statChanges: { affection: 20, trust: 20, careerPressure: 25, publicHeat: 40, secrecy: -40 },
            tags: ['brave', 'face_it']
          },
          {
            id: 'hotel_3b',
            text: '让他否认，你从不出现在叙事里',
            riskPreview: '保护自己但让他独自承受',
            statChanges: { affection: -10, trust: -5, careerPressure: 15, secrecy: 10 },
            tags: ['self_preserve', 'abandon']
          },
          {
            id: 'hotel_3c',
            text: '制造不在场证明',
            riskPreview: '如果被拆穿后果更严重',
            statChanges: { secrecy: 15, trust: -8, evidenceCount: -1, companyAlert: 10 },
            tags: ['lie', 'cover_up', 'risky']
          }
        ],
        consequences: { companyAlert: 20, publicHeat: 15 }
      }
    ]
  },
  {
    id: 'fan_digging',
    title: '粉丝扒皮事件',
    currentStage: 0,
    totalStages: 4,
    isActive: false,
    isCompleted: false,
    stages: [
      {
        title: '时间线异常',
        description: '粉圈大粉发帖："有没有人注意到，每次XX在Weverse上线的时候，某个账号也同时在线？"你的小号被盯上了。粉丝们开始绘制时间线对比图。',
        triggerCondition: 'fanSuspicion >= 25',
        choices: [
          {
            id: 'dig_1a',
            text: '立刻修改小号使用习惯',
            riskPreview: '降低风险但限制互动',
            statChanges: { fanSuspicion: -5, affection: -3, secrecy: 5 },
            nextStage: 1,
            tags: ['cautious', 'adjust']
          },
          {
            id: 'dig_1b',
            text: '注销小号，换新号',
            riskPreview: '暂时安全但失去历史互动',
            statChanges: { fanSuspicion: -10, affection: -5, evidenceCount: -2 },
            nextStage: 1,
            tags: ['reset', 'clean_slate']
          },
          {
            id: 'dig_1c',
            text: '故意制造假时间线混淆视听',
            riskPreview: '聪明但如果被识破更糟',
            statChanges: { fanSuspicion: -8, secrecy: 8, evidenceCount: 1 },
            nextStage: 1,
            tags: ['strategic', 'misdirection']
          }
        ],
        consequences: { fanSuspicion: 10 }
      },
      {
        title: '照片比对',
        description: '有人发现你Instagram照片里的背景和他的自拍背景高度相似——同一面墙，同一扇窗。虽然你早就删了，但互联网没有遗忘。',
        triggerCondition: 'fanSuspicion >= 40 && evidenceCount >= 2',
        choices: [
          {
            id: 'dig_2a',
            text: '声称是网红打卡地，很多人都去过',
            riskPreview: '合理但需要证据支持',
            statChanges: { fanSuspicion: -5, evidenceCount: -1 },
            nextStage: 2,
            tags: ['excuse', 'plausible_deniability']
          },
          {
            id: 'dig_2b',
            text: '让闺蜜帮忙作证你们当时一起去的',
            riskPreview: '需要闺蜜配合',
            statChanges: { fanSuspicion: -10, secrecy: 5 },
            nextStage: 2,
            tags: ['ally', 'alibi']
          },
          {
            id: 'dig_2c',
            text: '直接和男朋友商量对策',
            riskPreview: '增加他的焦虑',
            statChanges: { affection: -2, careerPressure: 8, trust: 5 },
            nextStage: 2,
            tags: ['teamwork', 'pressure']
          }
        ],
        consequences: { fanSuspicion: 10, evidenceCount: 1 }
      },
      {
        title: '人肉搜索',
        description: '你的真实身份被扒出来了。姓名、学校、社交账号全部曝光。粉圈群聊里，你的照片被传阅，你的每一条动态都被逐字分析。',
        triggerCondition: 'fanSuspicion >= 60',
        choices: [
          {
            id: 'dig_3a',
            text: '关闭所有社交账号，消失一段时间',
            riskPreview: '保护自己但无法和他联系',
            statChanges: { mood: -25, affection: -10, fanSuspicion: -15, secrecy: 15 },
            nextStage: 3,
            tags: ['hide', 'survival']
          },
          {
            id: 'dig_3b',
            text: '发声明否认一切',
            riskPreview: '可能被更多证据打脸',
            statChanges: { fanSuspicion: 5, publicHeat: 10, trust: -5 },
            nextStage: 3,
            tags: ['deny', 'confront']
          },
          {
            id: 'dig_3c',
            text: '求助男朋友和公司处理',
            riskPreview: '把控制权交给公司',
            statChanges: { companyAlert: 20, careerPressure: 15, affection: 5 },
            nextStage: 3,
            tags: ['surrender', 'company_control']
          }
        ],
        consequences: { publicHeat: 20, fanSuspicion: 15, mood: -15 }
      },
      {
        title: '审判日',
        description: '粉圈已经形成了完整的证据链。你的存在不再是秘密，而是等待引爆的定时炸弹。最终的选择时刻到来了。',
        triggerCondition: 'fanSuspicion >= 75 && evidenceCount >= 4',
        choices: [
          {
            id: 'dig_4a',
            text: '和男朋友一起公开面对',
            riskPreview: '最勇敢也最危险',
            statChanges: { affection: 15, trust: 15, careerPressure: 30, publicHeat: 50, secrecy: -50 },
            tags: ['brave', 'public']
          },
          {
            id: 'dig_4b',
            text: '你退出，让他继续他的事业',
            riskPreview: '最痛但最安全的选择',
            statChanges: { affection: -25, mood: -35, careerPressure: -15, secrecy: 25 },
            tags: ['sacrifice', 'exit']
          },
          {
            id: 'dig_4c',
            text: '反击——曝光粉圈侵犯隐私的行为',
            riskPreview: '以攻为守，但可能引火烧身',
            statChanges: { publicHeat: 25, fanSuspicion: -10, popularity: 15, mood: 5 },
            tags: ['counter_attack', 'legal']
          }
        ],
        consequences: { publicHeat: 25, careerPressure: 15 }
      }
    ]
  },
  {
    id: 'ex_ambiguity',
    title: '前任暧昧事件',
    currentStage: 0,
    totalStages: 3,
    isActive: false,
    isCompleted: false,
    stages: [
      {
        title: '那条Instagram',
        description: '一个女艺人在Instagram上发了一张和他的合照，配文"好久不见❤️"。评论区全是CP粉在嗑，而你的手机屏幕在发抖。',
        triggerCondition: 'affection >= 50 && relationshipStage >= "confirmed"',
        choices: [
          {
            id: 'ex_1a',
            text: '直接质问他',
            riskPreview: '坦诚但可能引发争吵',
            statChanges: { affection: -5, trust: 5, mood: -10 },
            nextStage: 1,
            tags: ['confront', 'honest']
          },
          {
            id: 'ex_1b',
            text: '忍住不说，自己消化',
            riskPreview: '避免冲突但内伤',
            statChanges: { mood: -15, mentalHealth: -5, affection: -3 },
            nextStage: 1,
            tags: ['suppress', 'internalize']
          },
          {
            id: 'ex_1c',
            text: '也发一条含蓄的Instagram回应',
            riskPreview: '暗战升级',
            statChanges: { affection: -2, publicHeat: 5, jealousy: 10 },
            nextStage: 1,
            tags: ['passive_aggressive', 'social_media_war']
          }
        ],
        consequences: { jealousy: 10, mood: -5 }
      },
      {
        title: '他选了她？',
        description: '公司安排他和那个女艺人合作新歌，MV里有亲密戏份。他说是工作，但你知道他们有过去。他深夜还在和她讨论"编曲细节"。',
        triggerCondition: 'jealousy >= 30',
        choices: [
          {
            id: 'ex_2a',
            text: '要求他拒绝这个合作',
            riskPreview: '不合理但表明态度',
            statChanges: { affection: -10, careerPressure: 15, trust: -5 },
            nextStage: 2,
            tags: ['ultimatum', 'unreasonable']
          },
          {
            id: 'ex_2b',
            text: '支持他的工作，但表达你的不安',
            riskPreview: '成熟但需要他回应',
            statChanges: { trust: 8, affection: 5, careerPressure: -5 },
            nextStage: 2,
            tags: ['mature', 'communicate']
          },
          {
            id: 'ex_2c',
            text: '冷战，等他自己意识到',
            riskPreview: '可能等来更糟的结果',
            statChanges: { affection: -8, trust: -5, mood: -15 },
            nextStage: 2,
            tags: ['cold_war', 'passive']
          }
        ],
        consequences: { jealousy: 10, careerPressure: 5 }
      },
      {
        title: '深夜的真相',
        description: '他终于坦白——那个女艺人确实是他出道前的初恋，但早就结束了。问题是，她似乎想重新开始，而他不知道该怎么处理。他选择了告诉你真相，但真相本身也是一种伤害。',
        triggerCondition: 'trust >= 40',
        choices: [
          {
            id: 'ex_3a',
            text: '相信他，一起面对',
            riskPreview: '需要强大的内心',
            statChanges: { affection: 10, trust: 15, mood: 5 },
            tags: ['trust', 'face_together']
          },
          {
            id: 'ex_3b',
            text: '给他时间处理，但设定期限',
            riskPreview: '理性但可能变成倒计时',
            statChanges: { trust: 5, affection: -3, anxiety: 10 },
            tags: ['deadline', 'rational']
          },
          {
            id: 'ex_3c',
            text: '分手，你不想当备选项',
            riskPreview: '决绝但可能后悔',
            statChanges: { affection: -20, mood: -30, trust: -10, mentalHealth: -10 },
            tags: ['breakup', 'self_respect']
          }
        ],
        consequences: { jealousy: 5, trust: 5 }
      }
    ]
  },
  {
    id: 'birthday_livestream',
    title: '生日直播翻车事件',
    currentStage: 0,
    totalStages: 3,
    isActive: false,
    isCompleted: false,
    stages: [
      {
        title: '生日惊喜变惊吓',
        description: '他生日当天开直播和粉丝互动，你偷偷订了蛋糕送到公司。没想到他在直播中拆开了蛋糕，卡片上你的字迹清晰可见——"给我最特别的人"。',
        triggerCondition: 'affection >= 55 && relationshipStage >= "confirmed"',
        choices: [
          {
            id: 'bday_1a',
            text: '祈祷他不会在直播中读出卡片',
            riskPreview: '听天由命',
            statChanges: { anxiety: 15, fanSuspicion: 10 },
            nextStage: 1,
            tags: ['panic', 'passive']
          },
          {
            id: 'bday_1b',
            text: '立刻发kakaoTalk让他别读卡片',
            riskPreview: '他可能来不及看到',
            statChanges: { fanSuspicion: 5, anxiety: 10 },
            nextStage: 1,
            tags: ['urgent', 'damage_control']
          },
          {
            id: 'bday_1c',
            text: '无所谓，反正没署真名',
            riskPreview: '如果字迹被认出呢？',
            statChanges: { anxiety: 5, secrecy: -5 },
            nextStage: 1,
            tags: ['gamble', 'confident']
          }
        ],
        consequences: { fanSuspicion: 15, publicHeat: 5 }
      },
      {
        title: '弹幕风暴',
        description: '他虽然没读卡片，但弹幕已经炸了——"那个字迹好眼熟""蛋糕店是XX区的，有人能查到订单吗？""他笑得好甜，一定是特别的人送的"。粉丝的侦探能力超出你的想象。',
        triggerCondition: 'fanSuspicion >= 35',
        choices: [
          {
            id: 'bday_2a',
            text: '联系蛋糕店要求删除订单记录',
            riskPreview: '可能已经来不及',
            statChanges: { evidenceCount: -1, secrecy: 5, anxiety: 10 },
            nextStage: 2,
            tags: ['cover_up', 'proactive']
          },
          {
            id: 'bday_2b',
            text: '让闺蜜假装是她送的',
            riskPreview: '需要闺蜜配合且逻辑自洽',
            statChanges: { fanSuspicion: -10, secrecy: 8 },
            nextStage: 2,
            tags: ['alibi', 'ally']
          },
          {
            id: 'bday_2c',
            text: '什么都不做，等热度自然消退',
            riskPreview: '可能越烧越旺',
            statChanges: { fanSuspicion: 10, anxiety: 15 },
            nextStage: 2,
            tags: ['wait', 'risk']
          }
        ],
        consequences: { fanSuspicion: 10, evidenceCount: 1 }
      },
      {
        title: '蛋糕店的监控',
        description: '有粉丝真的去蛋糕店问了，甚至找到了店里的监控录像。画面里你订蛋糕的身影清晰可见。如果这段视频流出，一切就结束了。',
        triggerCondition: 'evidenceCount >= 3 && fanSuspicion >= 50',
        choices: [
          {
            id: 'bday_3a',
            text: '提前在社交媒体上承认送了蛋糕，但说是粉丝应援',
            riskPreview: '需要完美的叙事',
            statChanges: { fanSuspicion: -15, publicHeat: 5, secrecy: 5 },
            tags: ['reframe', 'spin']
          },
          {
            id: 'bday_3b',
            text: '让公司出面处理蛋糕店',
            riskPreview: '公司介入=公司知道',
            statChanges: { companyAlert: 25, fanSuspicion: -10, evidenceCount: -2 },
            tags: ['company', 'nuclear_option']
          },
          {
            id: 'bday_3c',
            text: '和男朋友坦白一切，共同面对',
            riskPreview: '最诚实但最脆弱',
            statChanges: { affection: 8, trust: 10, careerPressure: 15 },
            tags: ['honest', 'together']
          }
        ],
        consequences: { publicHeat: 10, evidenceCount: 1 }
      }
    ]
  }
]

export const individualEvents: GameEvent[] = [
  {
    id: 'daily_01',
    type: 'daily',
    title: '凌晨的kakaoTalk',
    description: '凌晨3点，他发来一条消息："睡不着。"然后又立刻撤回了。你看到了。',
    choices: [
      { id: 'd01_a', text: '假装没看到', riskPreview: '安全但错过机会', statChanges: { affection: -2, mood: -5 } },
      { id: 'd01_b', text: '回复他"我也没睡"', riskPreview: '温暖但暴露你也没睡', statChanges: { affection: 5, mood: 3, sleep: -5 } },
      { id: 'd01_c', text: '发一个语音消息唱他喜欢的歌', riskPreview: '甜蜜但留下语音记录', statChanges: { affection: 10, mood: 5, evidenceCount: 1 } }
    ]
  },
  {
    id: 'daily_02',
    type: 'daily',
    title: '便利店偶遇',
    description: '你在便利店买宵夜，他戴着帽子和口罩走进来。你们对视了一秒。他微微点了下头，走向了另一个货架。',
    choices: [
      { id: 'd02_a', text: '假装不认识，正常购物', riskPreview: '最安全', statChanges: { secrecy: 3, mood: -3 } },
      { id: 'd02_b', text: '偷偷跟在他后面，在收银台"偶遇"', riskPreview: '自然但可能被认出', statChanges: { affection: 3, fanSuspicion: 5, mood: 5 } },
      { id: 'd02_c', text: '给他发消息"草莓牛奶在第三排"', riskPreview: '甜蜜但留下聊天记录', statChanges: { affection: 8, evidenceCount: 1 } }
    ]
  },
  {
    id: 'daily_03',
    type: 'daily',
    title: '他的Instagram story',
    description: '他发了一条Instagram story，是一杯咖啡的特写。但你注意到杯子上的字——那是你常去的那家店才有的手写体。',
    choices: [
      { id: 'd03_a', text: '截图保存', riskPreview: '留证据但增加风险', statChanges: { mood: 5, evidenceCount: 1 } },
      { id: 'd03_b', text: '私信他"那家店我也喜欢"', riskPreview: '甜蜜但留下DM记录', statChanges: { affection: 5, evidenceCount: 1 } },
      { id: 'd03_c', text: '不在意，可能只是巧合', riskPreview: '理性但错过暗号', statChanges: { mood: -2 } }
    ]
  },
  {
    id: 'romance_01',
    type: 'romance',
    title: '雨天的伞',
    description: '突然下暴雨，你被困在公司楼下。一把伞从身后伸过来——是他。"我送你。"雨声很大，大到可以盖过心跳。',
    choices: [
      { id: 'r01_a', text: '接受，靠他近一点', riskPreview: '浪漫但可能被看到', statChanges: { affection: 12, mood: 15, paparazziAttention: 8, secrecy: -5 } },
      { id: 'r01_b', text: '拒绝，等雨停', riskPreview: '安全但让他失落', statChanges: { affection: -5, secrecy: 5, mood: -5 } },
      { id: 'r01_c', text: '接受但保持距离', riskPreview: '折中方案', statChanges: { affection: 5, mood: 8, paparazziAttention: 3 } }
    ]
  },
  {
    id: 'romance_02',
    type: 'romance',
    title: '他写的歌词',
    description: '他发来一段歌词："在所有人面前我不能看你的方向，但我的心早已越过了人海。"没有解释，只有这一段。',
    choices: [
      { id: 'r02_a', text: '回复"我也在越过人海"', riskPreview: '双向奔赴', statChanges: { affection: 15, trust: 8, mood: 10 } },
      { id: 'r02_b', text: '回复"这首歌会发表吗？"', riskPreview: '理性但扫兴', statChanges: { affection: -3, careerPressure: 5 } },
      { id: 'r02_c', text: '不回复，把歌词记在笔记本里', riskPreview: '内敛但深情', statChanges: { affection: 5, mood: 8, mentalHealth: 3 } }
    ]
  },
  {
    id: 'romance_03',
    type: 'romance',
    title: '第一次牵手',
    description: '深夜的汉江边，只有你们两个人。他伸出手，没有说话。路灯把你们的影子拉得很长。',
    choices: [
      { id: 'r03_a', text: '握住他的手', riskPreview: '确认关系的关键一步', statChanges: { affection: 20, trust: 10, mood: 20, relationshipStage: 1 } },
      { id: 'r03_b', text: '犹豫，然后轻轻碰了一下又缩回', riskPreview: '暧昧升级', statChanges: { affection: 10, mood: 12, anxiety: 5 } },
      { id: 'r03_c', text: '"我们不应该这样"', riskPreview: '理智但残忍', statChanges: { affection: -15, mood: -10, trust: -5 } }
    ]
  },
  {
    id: 'work_01',
    type: 'work',
    title: '加班到深夜',
    description: '他通告排到凌晨，你也有自己的工作/学业要处理。你们在kakaoTalk上互相打气，但疲惫让对话变得敷衍。',
    choices: [
      { id: 'w01_a', text: '坚持聊到他收工', riskPreview: '暖心但透支精力', statChanges: { affection: 8, trust: 5, sleep: -10, stress: 10 } },
      { id: 'w01_b', text: '让他早点休息，你也去睡', riskPreview: '理性但少了温度', statChanges: { affection: -2, sleep: 5, stress: -5 } },
      { id: 'w01_c', text: '给他点一份夜宵外卖', riskPreview: '贴心但留下外卖记录', statChanges: { affection: 10, evidenceCount: 1, money: -5 } }
    ]
  },
  {
    id: 'work_02',
    type: 'work',
    title: '他的新代言',
    description: '他接了一个大牌代言，工作强度翻倍。你们已经一周没有好好说话了。他发来消息："对不起，最近真的太忙了。"',
    choices: [
      { id: 'w02_a', text: '"没关系，我理解"', riskPreview: '懂事但委屈', statChanges: { affection: 3, mood: -5, mentalHealth: -3 } },
      { id: 'w02_b', text: '"我也很忙，但我会想你"', riskPreview: '坦诚且温暖', statChanges: { affection: 8, mood: 5, trust: 5 } },
      { id: 'w02_c', text: '不回复，让他也尝尝等待的滋味', riskPreview: '幼稚但解气', statChanges: { affection: -5, trust: -3, mood: -3 } }
    ]
  },
  {
    id: 'fan_01',
    type: 'fan',
    title: '签售会上的眼神',
    description: '你在签售会上，轮到你的时候，他抬头看了你一眼。那个眼神比给其他粉丝的多停留了0.5秒——但旁边的站姐注意到了。',
    choices: [
      { id: 'f01_a', text: '假装是普通粉丝互动', riskPreview: '最安全', statChanges: { fanSuspicion: 3, affection: 2 } },
      { id: 'f01_b', text: '在专辑里夹一张小纸条', riskPreview: '浪漫但极其危险', statChanges: { affection: 12, fanSuspicion: 15, evidenceCount: 2 } },
      { id: 'f01_c', text: '快速完成互动，减少异常', riskPreview: '理性', statChanges: { fanSuspicion: -2, affection: -2 } }
    ]
  },
  {
    id: 'fan_02',
    type: 'fan',
    title: '粉圈骂战',
    description: 'Weverse上有人发帖质疑他最近的状态，说"是不是谈恋爱了"。粉丝分成两派吵起来了，有人开始翻旧账。',
    choices: [
      { id: 'f02_a', text: '用小号参与辩论，引导舆论', riskPreview: '干预但可能暴露', statChanges: { fanSuspicion: 8, publicHeat: -5, evidenceCount: 1 } },
      { id: 'f02_b', text: '不参与，默默观察', riskPreview: '安全但焦虑', statChanges: { anxiety: 10, fanSuspicion: 0 } },
      { id: 'f02_c', text: '告诉男朋友让他注意言行', riskPreview: '增加他的压力', statChanges: { careerPressure: 8, affection: -2, trust: 3 } }
    ]
  },
  {
    id: 'company_01',
    type: 'company',
    title: '公司的恋爱禁令',
    description: '公司发布了内部通知：严禁艺人恋爱，违者合约处罚。通知没有指名道姓，但你知道这是说给谁听的。',
    choices: [
      { id: 'c01_a', text: '主动提出暂时保持距离', riskPreview: '保护他但伤害感情', statChanges: { affection: -10, trust: 5, careerPressure: -5, secrecy: 10 } },
      { id: 'c01_b', text: '假装没看到通知', riskPreview: '危险但维持现状', statChanges: { affection: 3, companyAlert: 10, anxiety: 15 } },
      { id: 'c01_c', text: '和他商量对策', riskPreview: '共同面对', statChanges: { trust: 8, affection: 5, careerPressure: 5 } }
    ]
  },
  {
    id: 'company_02',
    type: 'company',
    title: '经纪人的暗示',
    description: '经纪人单独找你谈话，说"有些事情，年轻人要懂得分寸"。他没有明说，但意思很清楚——他知道了一些什么。',
    choices: [
      { id: 'c02_a', text: '否认一切', riskPreview: '硬刚但可能激怒他', statChanges: { companyAlert: 5, trust: -3, secrecy: 5 } },
      { id: 'c02_b', text: '承认但请求保密', riskPreview: '坦诚但交出把柄', statChanges: { companyAlert: 15, trust: 5, secrecy: -10 } },
      { id: 'c02_c', text: '装傻，转移话题', riskPreview: '拖延但没解决问题', statChanges: { companyAlert: 8, anxiety: 10 } }
    ]
  },
  {
    id: 'economy_01',
    type: 'economy',
    title: '钱包告急',
    description: '月底了，账户余额只剩5万韩元。他约你周末见面，但你连一杯咖啡都请不起。',
    choices: [
      { id: 'e01_a', text: '如实告诉他你的经济状况', riskPreview: '坦诚但可能伤自尊', statChanges: { affection: 5, trust: 8, mood: -5, money: 0 } },
      { id: 'e01_b', text: '找借口推掉约会', riskPreview: '避免尴尬但让他失落', statChanges: { affection: -5, mood: -8, money: 0 } },
      { id: 'e01_c', text: '借钱赴约', riskPreview: '维持面子但债务增加', statChanges: { affection: 3, mood: -3, money: -10, lifeStability: -5 } }
    ]
  },
  {
    id: 'economy_02',
    type: 'economy',
    title: '意外收入',
    description: '你收到了一笔意外的兼职收入，刚好够买他提到过想要的那款耳机。但这也意味着你这个月的生活费要紧巴巴了。',
    choices: [
      { id: 'e02_a', text: '买给他当礼物', riskPreview: '甜蜜但经济压力', statChanges: { affection: 12, mood: 8, money: -20, lifeStability: -8 } },
      { id: 'e02_b', text: '存起来保障生活', riskPreview: '理性但少了浪漫', statChanges: { money: 10, lifeStability: 10, mood: -3 } },
      { id: 'e02_c', text: '买一个小礼物+存一部分', riskPreview: '折中', statChanges: { affection: 5, money: -5, lifeStability: 3, mood: 3 } }
    ]
  },
  {
    id: 'crisis_01',
    type: 'crisis',
    title: 'D社预告',
    description: 'Dispatch发了一条神秘的预告："明天的独家，关于某新人男团成员的深夜故事。"配图是模糊的首尔夜景。你的直觉告诉你，这和你有关。',
    choices: [
      { id: 'cr01_a', text: '和男朋友紧急商量对策', riskPreview: '最理性', statChanges: { trust: 5, careerPressure: 10, anxiety: 20 } },
      { id: 'cr01_b', text: '立刻删除所有可疑痕迹', riskPreview: '可能已经来不及', statChanges: { evidenceCount: -2, anxiety: 25, secrecy: 5 } },
      { id: 'cr01_c', text: '联系律师了解法律选项', riskPreview: '专业但昂贵', statChanges: { money: -15, secrecy: 8, anxiety: -5 } }
    ]
  },
  {
    id: 'crisis_02',
    type: 'crisis',
    title: '队友知道了',
    description: '他的一个队友发现了你们的关系。他保证不会说出去，但你知道秘密一旦多一个人知道，风险就翻倍。',
    choices: [
      { id: 'cr02_a', text: '信任队友，让他帮忙打掩护', riskPreview: '多一个盟友但多一个风险点', statChanges: { secrecy: -5, trust: 5, evidenceCount: 1 } },
      { id: 'cr02_b', text: '更加小心，减少一切可疑行为', riskPreview: '安全但辛苦', statChanges: { secrecy: 10, mood: -8, affection: -3 } },
      { id: 'cr02_c', text: '让男朋友和队友谈清楚底线', riskPreview: '明确界限', statChanges: { careerPressure: 5, trust: 3, secrecy: 3 } }
    ]
  },
  {
    id: 'growth_01',
    type: 'growth',
    title: '学会韩语',
    description: '你报了一个韩语班，想用他的母语和他说"我爱你"。学习很辛苦，但每学会一个新词，你都会发给他看。',
    choices: [
      { id: 'g01_a', text: '坚持学习，每天打卡', riskPreview: '长期投资', statChanges: { affection: 8, trust: 5, mood: 5, popularity: 3 } },
      { id: 'g01_b', text: '让他教你，增加互动', riskPreview: '甜蜜但需要时间', statChanges: { affection: 12, mood: 10, actionPoints: -1 } },
      { id: 'g01_c', text: '学了几天就放弃了', riskPreview: '让他失望', statChanges: { affection: -5, mood: -3 } }
    ]
  },
  {
    id: 'growth_02',
    type: 'growth',
    title: '找到自己的方向',
    description: '你不能只做"某人的女朋友"。你开始认真思考自己的未来——学业、事业、独立。他注意到了你的变化。',
    choices: [
      { id: 'g02_a', text: '全力投入自己的发展', riskPreview: '独立但可能疏远', statChanges: { lifeStability: 15, mood: 10, affection: -5, popularity: 5 } },
      { id: 'g02_b', text: '和他分享你的计划，寻求支持', riskPreview: '共同成长', statChanges: { trust: 10, affection: 8, lifeStability: 8, mood: 8 } },
      { id: 'g02_c', text: '把恋爱放一边，先搞定自己', riskPreview: '理性但可能错过', statChanges: { lifeStability: 20, affection: -10, mood: -5 } }
    ]
  },
  {
    id: 'music_01',
    type: 'music',
    title: '他的新歌',
    description: 'RIIZE发布了新歌，你在听的时候发现歌词里有只有你们才懂的暗号。他写了一首歌给你，但全世界都以为那只是情歌。',
    choices: [
      { id: 'm01_a', text: '私信告诉他你听懂了', riskPreview: '甜蜜但留下记录', statChanges: { affection: 15, trust: 8, evidenceCount: 1, mood: 15 } },
      { id: 'm01_b', text: '在Weverse发一条含蓄的感想', riskPreview: '公开但隐晦', statChanges: { affection: 5, fanSuspicion: 5, mood: 8 } },
      { id: 'm01_c', text: '独自听了一整夜，不告诉他', riskPreview: '内敛但深情', statChanges: { mood: 10, mentalHealth: 5, affection: 3 } }
    ]
  },
  {
    id: 'music_02',
    type: 'music',
    title: '练习室的门外',
    description: '你路过他的练习室，听到他在反复练习一段旋律。透过门缝，你看到他一个人对着镜子，表情是你从未见过的认真和脆弱。',
    choices: [
      { id: 'm02_a', text: '悄悄推门进去，给他递一瓶水', riskPreview: '温暖但打断他', statChanges: { affection: 8, trust: 5, careerPressure: -3 } },
      { id: 'm02_b', text: '在门外安静地听完，然后离开', riskPreview: '尊重但错过', statChanges: { mood: 8, mentalHealth: 3, affection: 3 } },
      { id: 'm02_c', text: '发消息说"加油，我在"', riskPreview: '支持但留下记录', statChanges: { affection: 5, evidenceCount: 1, mood: 5 } }
    ]
  },
  {
    id: 'daily_04',
    type: 'daily',
    title: '手机壁纸',
    description: '你不小心把和他的合照设成了手机壁纸，闺蜜看到了。她问："这是谁？你们什么时候……"',
    choices: [
      { id: 'd04_a', text: '坦白告诉闺蜜', riskPreview: '多一个人知道', statChanges: { mood: 5, secrecy: -8, trust: 3 } },
      { id: 'd04_b', text: '说是网上找的粉丝P图', riskPreview: '谎言但安全', statChanges: { secrecy: 5, mood: -5, mentalHealth: -3 } },
      { id: 'd04_c', text: '岔开话题不回答', riskPreview: '回避但引起怀疑', statChanges: { secrecy: 3, mood: -3 } }
    ]
  },
  {
    id: 'daily_05',
    type: 'daily',
    title: '同款卫衣',
    description: '你和他穿了同款不同色的卫衣出门，被路人拍了照片发到网上。虽然不是同框，但粉圈已经开始对比了。',
    choices: [
      { id: 'd05_a', text: '以后再也不穿那件卫衣', riskPreview: '安全但委屈', statChanges: { mood: -5, fanSuspicion: -3 } },
      { id: 'd05_b', text: '故意和闺蜜也穿同款混淆', riskPreview: '聪明但麻烦', statChanges: { fanSuspicion: -8, mood: 3, actionPoints: -1 } },
      { id: 'd05_c', text: '不在意，同款多了去了', riskPreview: '淡定但风险自增', statChanges: { fanSuspicion: 5, mood: 0 } }
    ]
  },
  {
    id: 'romance_04',
    type: 'romance',
    title: '他的生日愿望',
    description: '他生日那天，在许愿的时候偷偷看了你一眼。后来他告诉你，他的愿望和你有关。',
    choices: [
      { id: 'r04_a', text: '"我的愿望也和你有关"', riskPreview: '双向奔赴', statChanges: { affection: 18, trust: 10, mood: 15 } },
      { id: 'r04_b', text: '"不许说出来，说出来就不灵了"', riskPreview: '可爱但回避', statChanges: { affection: 8, mood: 10 } },
      { id: 'r04_c', text: '"你的愿望应该是事业顺利"', riskPreview: '理性但扫兴', statChanges: { affection: -3, careerPressure: 5, mood: -3 } }
    ]
  },
  {
    id: 'collab_01',
    type: 'collab',
    title: '合作舞台',
    description: 'RIIZE和某女团合作特别舞台，他和女团成员的互动被粉丝疯狂剪辑。你的时间线上全是他们的CP视频。',
    choices: [
      { id: 'cl01_a', text: '不看，关掉手机', riskPreview: '逃避但保护心情', statChanges: { mood: -5, jealousy: 5, mentalHealth: 3 } },
      { id: 'cl01_b', text: '看完后告诉他你吃醋了', riskPreview: '坦诚但可能让他为难', statChanges: { affection: 5, jealousy: -5, careerPressure: 3 } },
      { id: 'cl01_c', text: '在粉丝群里说他们很配', riskPreview: '口是心非', statChanges: { mood: -10, jealousy: 15, mentalHealth: -5 } }
    ]
  }
]

export function getEventChainById(id: string): EventChain | undefined {
  return eventChains.find(e => e.id === id)
}

export function getEventsByType(type: string): GameEvent[] {
  return individualEvents.filter(e => e.type === type)
}

export function getRandomEvent(excludeIds: string[] = []): GameEvent {
  const available = individualEvents.filter(e => !excludeIds.includes(e.id))
  return available[Math.floor(Math.random() * available.length)]
}
