import type { Ending } from '../types/game'

export const endings: Ending[] = [
  {
    id: 'he_01',
    type: 'HE',
    title: '公开的春天',
    description: '经历了无数个提心吊胆的日夜，你们终于等到了可以公开的那一天。不是被迫曝光，而是你们共同选择了面对世界。他在直播中牵起你的手，弹幕从震惊到祝福用了整整一夜。第二天，Naver热搜第一是"RIIZE成员恋情公开"，而你的手机里，是他发来的最后一条秘密消息："从今天起，不用再躲了。"',
    condition: 'affection >= 85 && trust >= 80 && careerPressure <= 30 && publicHeat <= 40 && relationshipStage === "passionate"',
    phoneDisplay: 'kakaoTalk置顶消息："从今天起，不用再躲了。❤️"\nInstagram：你们的合照，30万赞\nWeverse：粉丝祝福帖刷屏\nNaver：热搜第一 #RIIZE恋情公开'
  },
  {
    id: 'he_02',
    type: 'HE',
    title: '平凡的幸福',
    description: '他没有选择顶流之路，而是在合约期满后淡出娱乐圈。你们搬到了一个没人认识的小城市，开了一家咖啡店。偶尔有粉丝路过认出他，他会微笑着递上一杯咖啡。你的手机里不再有D社的预告，只有他每天早上发来的"今天想喝什么？"——这比任何甜蜜的kakaoTalk都让人安心。',
    condition: 'affection >= 80 && trust >= 75 && lifeStability >= 70 && careerPressure <= 20 && relationshipStage >= "confirmed"',
    phoneDisplay: 'kakaoTalk日常："今天想喝什么？☕"\nInstagram：咖啡店日常，0风险\nNaver：无相关搜索\n健康App：睡眠质量：优'
  },
  {
    id: 'he_03',
    type: 'HE',
    title: '地下长跑终点',
    description: '你们用了三年时间，从地下恋情走到了可以自然出现在彼此社交圈的关系。不是公开，而是不再需要刻意隐藏。他的队友知道、你的朋友知道、甚至他的家人也接受了你。你们在彼此的生活里有了不可替代的位置——不是作为"某人的恋人"，而是作为"自己"。',
    condition: 'affection >= 75 && trust >= 85 && secrecy >= 60 && lifeStability >= 60 && mentalHealth >= 60',
    phoneDisplay: 'kakaoTalk群聊："周末聚餐，带你对象来"\nInstagram：他的帖子下你的评论被点赞\n日历：共同行程标记\n健康App：压力指数：低'
  },
  {
    id: 'he_04',
    type: 'HE',
    title: '最好的时机',
    description: '你们等到了最完美的时机——他事业稳定，你独立成熟，外界不再把你们的关系当作猎奇素材。他是在颁奖典礼的感言里提到你的名字的，不是作为恋人，而是作为"最重要的人"。全场起立鼓掌的那一刻，你知道，所有的等待都值得。',
    condition: 'affection >= 90 && trust >= 85 && popularity >= 60 && careerPressure <= 15 && week >= 20',
    phoneDisplay: 'Naver热搜：#RIIZE颁奖典礼感言\nkakaoTalk："你看到了吗？"\nInstagram：他的颁奖礼照片，评论区全是祝福\n日历：纪念日标记'
  },
  {
    id: 'oe_01',
    type: 'OE',
    title: '未完待续',
    description: '你们没有在一起，也没有完全分开。他继续他的偶像生涯，你继续你的人生。偶尔在深夜，你会收到他发来的一首歌；偶尔在某个城市的街头，你们会"偶遇"。没有人知道你们的关系，也许连你们自己也不确定那算什么。但每次手机亮起的时候，你的心跳还是会漏一拍。',
    condition: 'affection >= 50 && affection <= 75 && trust >= 40 && trust <= 70 && relationshipStage === "ambiguous"',
    phoneDisplay: 'kakaoTalk：最后一条消息是3天前的歌链接\nInstagram：他的story，你截图了\nWeverse：你还在关注他的动态\n备忘录：写着"也许下次见面"'
  },
  {
    id: 'be_01',
    type: 'BE',
    title: 'D社独家',
    description: 'Dispatch的独家报道在周一早上8点准时发布。高清照片、时间线、证据链，一切都无可辩驳。他的公司发布声明否认，但互联网不会忘记。你被粉圈人肉、被网暴、被贴上"破坏偶像"的标签。他打来最后一个电话："对不起，我保护不了你。"然后，kakaoTalk上他的头像变成了灰色。',
    condition: 'publicHeat >= 80 && evidenceCount >= 5 && secrecy <= 20 && paparazziAttention >= 70',
    phoneDisplay: 'Naver热搜：#RIIZE恋情曝光\nkakaoTalk：他的头像变灰\nInstagram：你的账号被举报封禁\nWeverse：粉圈地震\n健康App：压力指数：极高\n备忘录：空'
  },
  {
    id: 'be_02',
    type: 'BE',
    title: '公司封杀令',
    description: '公司发现了你们的关系，给了他一个选择：分手，或者解约。他选择了事业。不是因为他不爱你，而是因为他的梦想里有太多人的期望——队友的、家人的、粉丝的。你在公司楼下等了一整夜，他没有下来。经纪人转交了一封信，里面只有一句话："忘了我。"',
    condition: 'companyAlert >= 80 && careerPressure >= 70 && trust <= 30 && relationshipStage <= "confirmed"',
    phoneDisplay: 'kakaoTalk：消息已读不回\n公司通知：恋爱禁止令\nInstagram：他取关了你\n日历：所有共同行程已删除\n健康App：心理健康：危险'
  },
  {
    id: 'be_03',
    type: 'BE',
    title: '粉圈审判',
    description: '你被粉圈扒得体无完肤。你的真实姓名、学校、家庭住址全部曝光。每天打开手机都是谩骂和威胁。他试图保护你，但他的每一次维护都让事情变得更糟。最终，你不得不离开韩国，回到中国。在仁川机场，你删掉了手机里所有和他的聊天记录。最后一行字是："如果有来生，希望你不是爱豆。"',
    condition: 'fanSuspicion >= 85 && publicHeat >= 60 && mood <= 20 && mentalHealth <= 20',
    phoneDisplay: 'kakaoTalk：所有聊天记录已删除\nInstagram：账号已注销\nWeverse：已退出\nNaver：你的名字在热搜\n健康App：心理健康：极危险\n备忘录："如果有来生"'
  },
  {
    id: 'be_04',
    type: 'BE',
    title: '他的选择',
    description: '他选择了别人。也许是那个合作的女艺人，也许是公司安排的"理想型"，也许只是一个你不知道的名字。他在电话里说"我们不合适"的时候，语气和拒绝粉丝告白时一模一样——温柔、坚定、不留余地。你终于明白，在他的世界里，你从来不是特别的那一个。',
    condition: 'affection <= 20 && trust <= 15 && jealousy >= 60 && relationshipStage <= "confirmed"',
    phoneDisplay: 'kakaoTalk：他的状态——"我们还是做回陌生人吧"\nInstagram：他和别人的合照\nWeverse：粉丝在嗑新CP\n备忘录："我算什么"\n健康App：睡眠质量：极差'
  },
  {
    id: 'se_01',
    type: 'SE',
    title: '独立宣言',
    description: '你选择了自己。不是因为不爱他，而是因为你终于明白——在"某人的女朋友"这个身份之外，你首先是你自己。你完成了学业，找到了工作，建立了自己的社交圈。偶尔想起他的时候，心里还是会痛，但你知道这个痛是你成长的勋章。你的手机里没有他的消息了，但你的生活里有了更多属于你自己的光。',
    condition: 'lifeStability >= 85 && mentalHealth >= 80 && mood >= 60 && popularity >= 40 && affection <= 50',
    phoneDisplay: 'kakaoTalk：闺蜜群聊活跃\nInstagram：你的生活日常，点赞数创新高\n日历：满满的自我提升计划\n健康App：各项指标正常\n备忘录："成为更好的自己"'
  },
  {
    id: 'ge_01',
    type: 'GE',
    title: '幕后女王',
    description: '你从"爱豆的女朋友"变成了"娱乐圈的幕后推手"。你利用在恋爱中积累的人脉和经验，成为了出色的娱乐产业从业者。他不再是你的恋人，而是你最重要的客户。你在谈判桌上为他争取最好的资源，他在舞台上发光——你们以另一种方式，成为了彼此最不可或缺的人。',
    condition: 'popularity >= 80 && lifeStability >= 75 && money >= 70 && trust >= 60 && (identity === "intern" || identity === "staff" || identity === "translator")',
    phoneDisplay: 'kakaoTalk工作群：行程确认\nInstagram：行业峰会照片\nNaver：你的名字出现在制作名单\n日历：满档的工作行程\n备忘录："下一个项目"'
  },
  {
    id: 'dogblood_01',
    type: 'BE',
    title: '替身游戏',
    description: '你发现他手机里有一个和你长得很像的前女友的照片。他一直把你当作她的替代品——同样的约会地点，同样的话，同样的礼物。当你质问他的时候，他沉默了很久，然后说："对不起，我以为我已经放下了。"你摔门而出，在首尔的街头哭到天亮。',
    condition: 'trust <= 10 && mentalHealth <= 25 && hiddenPersona === "secret_trauma" && affection >= 40',
    phoneDisplay: 'kakaoTalk：他的消息——"我可以解释"\n相册：那个女人的照片\nInstagram：你们的约会地点和她的一模一样\n备忘录："原来我只是一个影子"\n健康App：心理健康：崩溃'
  },
  {
    id: 'dogblood_02',
    type: 'BE',
    title: '三角困局',
    description: '你的青梅竹马向你表白了，而你的男朋友恰好看到了那条消息。他什么都没说，只是默默收拾了你的东西放在门口。你同时失去了两个人——一个因为误解，一个因为时机。你站在公寓门口，手里拿着两把钥匙，哪一把都打不开任何一扇门。',
    condition: 'jealousy >= 70 && affection <= 35 && npc_intimacy_childhood_friend >= 60 && relationshipStage === "trial"',
    phoneDisplay: 'kakaoTalk：两个对话都是已读不回\nInstagram：三个人都没有更新\n备忘录："我搞砸了一切"\n日历：所有约会已取消\n健康App：压力指数：极高'
  },
  {
    id: 'dogblood_03',
    type: 'BE',
    title: '怀孕风波',
    description: '验孕棒上的两条线让你的世界天旋地转。你不敢告诉他，不敢告诉任何人。当你终于鼓起勇气拨通他的电话时，那头传来的是经纪人的声音："他现在不方便接电话。请问你是哪位？"你挂断了电话，一个人坐在医院走廊里，做了一个没有人知道的决定。',
    condition: 'mood <= 15 && mentalHealth <= 15 && affection >= 30 && week >= 10',
    phoneDisplay: 'kakaoTalk：未接来电——1个\n健康App：孕期记录（已删除）\n备忘录：空白的日记\n日历：医院预约（已取消）\nNaver：搜索记录已清除'
  },
  {
    id: 'dogblood_04',
    type: 'BE',
    title: '他的双面人生',
    description: '你以为你是唯一，直到你在他的手机里看到了另外三个和你一样的聊天窗口。同样的甜言蜜语，同样的深夜消息，同样的"你是最特别的"。他不是中央空调，他是专业的情感操控者。而你，只是他收藏品中的一个。',
    condition: 'hiddenPersona === "playboy" && trust <= 5 && affection >= 50 && evidenceCount >= 3',
    phoneDisplay: 'kakaoTalk：四个置顶对话，同样的情话\nInstagram：他给每个人的点赞记录\n备忘录："我从来不是唯一"\n健康App：心理健康：极危险\n相册：截图证据'
  },
  {
    id: 'dark_01',
    type: 'BE',
    title: '消失的她',
    description: '你删除了所有社交账号，换了手机号码，搬离了首尔。没有人知道你去了哪里，包括他。他发了疯一样找你，但你已经消失在人海中。三年后，他在一个综艺节目里被问到"最后悔的事"，他沉默了很久说："弄丢了一个不该弄丢的人。"而你在另一个城市的出租屋里，关掉了电视。',
    condition: 'mood <= 10 && mentalHealth <= 10 && secrecy >= 80 && affection >= 60',
    phoneDisplay: 'kakaoTalk：账号已注销\nInstagram：账号不存在\nWeverse：已退出\n日历：空白\n备忘录：空白\n健康App：最后一次记录——3年前'
  },
  {
    id: 'dark_02',
    type: 'BE',
    title: '合约囚徒',
    description: '公司没有解雇他，而是用一份更严苛的合约锁住了他——10年禁止恋爱，违约金50亿韩元。他签了。不是因为他想签，而是因为公司手里有你的把柄。你成了他的人质，他是公司的囚徒。你们还在一起，但每次见面都像是在服刑。',
    condition: 'companyAlert >= 90 && careerPressure >= 85 && secrecy >= 70 && trust <= 25',
    phoneDisplay: '公司通知：合约更新通知\nkakaoTalk：所有消息都是暗语\nInstagram：你的账号被公司监控\n日历：公司批准的见面日\n备忘录："这不是爱，这是牢笼"'
  },
  {
    id: 'dark_03',
    type: 'BE',
    title: '网暴深渊',
    description: '粉圈的恶意像海啸一样吞噬了你。你的照片被P成各种侮辱性的图片，你的家人也受到了牵连。你报了警，但韩国的法律对网络暴力的惩罚轻得可笑。你开始失眠、焦虑、恐惧出门。他在电话里说"再忍忍"，但你已经不知道自己在忍什么了。',
    condition: 'fanSuspicion >= 90 && publicHeat >= 80 && mentalHealth <= 10 && mood <= 10',
    phoneDisplay: 'kakaoTalk：99+未读——全是谩骂\nInstagram：评论区地狱\nNaver：你的名字=靶子\n健康App：心理健康：极危险\n备忘录："我撑不下去了"'
  },
  {
    id: 'dark_04',
    type: 'BE',
    title: '精神控制',
    description: '你终于看清了他的真面目——他不是在爱你，他是在控制你。他监控你的社交账号，干涉你的交友，用冷暴力惩罚你的"不听话"。每次你想离开，他就会用最甜蜜的方式把你拉回来。你已经分不清什么是爱什么是操控了。你看着镜子里憔悴的自己，认不出那是谁。',
    condition: 'hiddenPersona === "narcissist" && trust <= 5 && mentalHealth <= 15 && affection >= 50 && dependency >= 80',
    phoneDisplay: 'kakaoTalk：他的消息——"你去哪了？"\nInstagram：他批准你才能发\n备忘录：被删除的日记\n健康App：心理健康：极危险\n日历：他的行程就是你的行程'
  }
]

export function getEndingById(id: string): Ending | undefined {
  return endings.find(e => e.id === id)
}

export function getEndingsByType(type: Ending['type']): Ending[] {
  return endings.filter(e => e.type === type)
}

export function checkEndingConditions(state: Record<string, number>): Ending | null {
  for (const ending of endings) {
    try {
      const condition = ending.condition
      const fn = new Function(...Object.keys(state), `return ${condition}`)
      if (fn(...Object.values(state))) {
        return ending
      }
    } catch {
      continue
    }
  }
  return null
}
