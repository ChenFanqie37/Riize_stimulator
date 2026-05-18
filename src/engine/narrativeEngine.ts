import type {
  GameState,
  NarrativeChoice,
  NarrativeChoiceId,
  NarrativeTurn,
  NarrativeTurnSource,
  OfflineAccessMode,
  OfflinePlan,
  OfflineSceneResult,
} from '../types/game'

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function idolName(state: GameState): string {
  return `${state.maleLead.name}（${state.maleLead.stageName}）`
}

function currentScene(state: GameState): string {
  if (state.currentApp === 'offline') return '首尔某公开行程附近'
  if (state.risk.fanSuspicion > 60) return '手机屏幕前，粉圈时间线正在刷新'
  if (state.risk.companyAlert > 55) return '公司楼下的便利店角落'
  if (state.timeOfDay === 'night') return '首尔夜路的出租车后座'
  return '首尔麻浦区某音乐节目侧门外'
}

function choice(id: NarrativeChoiceId, text: string, riskPreview: string, statChanges: Record<string, number>, timeCost = 3, freeInput = false): NarrativeChoice {
  return { id, text, riskPreview, statChanges, timeCost, freeInput }
}

export function createFallbackNarrativeTurn(state: GameState, source: NarrativeTurnSource = 'story_panel', promptHint = ''): NarrativeTurn {
  const hooks = state.pendingStoryHooks.slice(-2).map((hook) => hook.detail).join('；')
  const pressure = state.risk.fanSuspicion > 55 || state.risk.companyAlert > 55 || state.risk.paparazziAttention > 50
  const scene = currentScene(state)
  const name = idolName(state)
  const object = state.risk.fanSuspicion > 45 ? '手机屏幕上未读的热帖标题' : '书包侧袋里露出一角的通行证'
  const bodyLines = [
    `第 ${state.week} 周，第 ${state.day} 天，${String(state.hour ?? 8).padStart(2, '0')}:30。${scene}的风很冷，你把${object}又往里面塞了一点。`,
    hooks || `你本来只是想把今天过完，可${name}的行程表像一条细线，把你普通的一天轻轻拽向后台、镜头和人群。`,
    pressure
      ? `粉圈的讨论没有真的停下来。它们像被反复刷新过的截图，暂时没有结论，却已经开始把你的动线和他的空白时间放在同一张图上。`
      : `今天还算平静。平静到你差点忘记，在这个世界里，“刚好遇见”也可能被别人写成证据。`,
    `他没有直接看你，只是在经过时放慢了半拍。很短，短到别人只会以为是工作人员挡路。可你知道那不是。`,
    `KakaoTalk 震了一下。他发来一句：“别站在风口。等一下再走。”没有称呼，也没有表情，但你突然觉得自己被从人群里认出来了。`,
    promptHint ? `你刚才想做的事还压在心里：${promptHint}。它可以变成一次靠近，也可以变成之后被翻出来的第一格截图。` : '现在，你需要决定这一天要往哪里走。',
  ]

  return {
    id: uid('nar'),
    title: pressure ? '风口里的未读消息' : '侧门外的一秒停顿',
    scene,
    bodyLines,
    choices: [
      choice('A', '先保护自己，绕开人群回去。', '生活稳定度+2，保密度+1，好感小幅波动', { lifeStability: 2, secrecy: 1, affection: -1 }, 2),
      choice('B', '按他说的等一下，给他留一个能找到你的机会。', '好感+3，信任+2，粉丝怀疑+2', { affection: 3, trust: 2, fanSuspicion: 2 }, 3),
      choice('C', '拍一张没有定位的照片，试探粉圈反应。', '人气+2，粉丝怀疑+5，保密度-3', { popularity: 2, fanSuspicion: 5, secrecy: -3 }, 2),
      choice('D', '自由行动：由你输入。', '根据输入结算', {}, 2, true),
    ],
    status: 'active',
    createdAt: Date.now(),
    memoryTags: ['fallback_narrative', pressure ? 'pressure' : 'soft'],
    source,
  }
}

export function resolveFallbackNarrativeChoice(
  state: GameState,
  turn: NarrativeTurn,
  choiceId: NarrativeChoiceId,
  freeInput = '',
): NarrativeTurn {
  const selected = turn.choices.find((item) => item.id === choiceId)
  const name = idolName(state)
  const freeLine = choiceId === 'D' && freeInput ? `你没有照着任何选项走，而是选择：${freeInput}` : `你选择了：${selected?.text || choiceId}`
  const riskUp = (selected?.statChanges.fanSuspicion || 0) > 0 || (selected?.statChanges.companyAlert || 0) > 0
  const softUp = (selected?.statChanges.affection || 0) > 0 || (selected?.statChanges.trust || 0) > 0

  const bodyLines = [
    freeLine,
    riskUp
      ? `事情没有立刻爆开，但它留下了痕迹。有人在 Weverse 说“今天动线好像有点怪”，还有小号把${name}的公开行程和你的出现时间放在一起讨论。`
      : `你把这件事处理得很轻，轻到路过的人都不会多看一眼。可越是这样，那一点点被偏爱的证据反而更清楚。`,
    softUp
      ? `他后来给你发来一条很短的消息：“刚刚看见你了。”隔了几秒又补一句：“不是怪你，是怕你冷。”`
      : `手机屏幕暗下去的时候，你看见自己的倒影。你还在这段关系里，但你也还在自己的生活里。`,
    `这一天没有给你一个明确答案，只给了你下一段路：继续靠近，或者把今天当作一个提醒。`,
  ]

  return {
    id: uid('nar'),
    title: riskUp ? '被放进时间线的一格' : '没有说出口的偏爱',
    scene: turn.scene,
    bodyLines,
    choices: [
      choice('A', '整理今天留下的所有痕迹。', '保密度+2，心情-1', { secrecy: 2, mood: -1 }, 2),
      choice('B', '给他回一条只有你们懂的话。', '好感+2，信任+1', { affection: 2, trust: 1 }, 1),
      choice('C', '去粉圈看看有没有人注意到。', '人气+1，粉丝怀疑+3，压力+2', { popularity: 1, fanSuspicion: 3, stress: 2 }, 2),
      choice('D', '自由行动：由你输入。', '根据输入结算', {}, 2, true),
    ],
    status: 'active',
    createdAt: Date.now(),
    memoryTags: ['fallback_resolution', `choice_${choiceId}`],
    source: 'free_input',
  }
}

export function createFallbackOfflineScene(state: GameState, plan: OfflinePlan, accessMode: OfflineAccessMode): OfflineSceneResult {
  const arranged = accessMode.id === 'boyfriend_arranged'
  const name = idolName(state)
  const narrative = arranged
    ? [
        `${plan.place}外面的人流比你想象中更密。你本来已经准备好排队，却收到一条没有署名的短信：去三号门，别回头。`,
        `三号门旁边的工作人员看了一眼名单，把一张临时通行贴递给你。上面没有你的名字，只有一个很小的编号。`,
        `${name}没有出现。可你进场后发现座位刚好避开了最密集的站姐区，视线又能看见侧台。`,
        `演出或录制开始前，他从侧台走过，鞋尖停了半秒。没有人知道那是给你的确认。`,
      ]
    : [
        `你按自己的方式去了${plan.place}。钱花得比预想多，队伍也比预想长。`,
        `现场每个人都举着手机，风把应援纸吹得哗哗响。你很努力让自己像普通粉丝或普通路人。`,
        `${name}出现时，人群往前挤了一步。你没有喊他的名字，只是把手里的票根攥得更紧。`,
        `你们没有真正说上话，但你知道今天这趟不是空的。因为他离场前朝你这个方向看了一眼。`,
      ]

  return {
    narrative,
    boyfriendMessage: arranged
      ? '别把通行贴拍下来。结束后从原来的门走，我让人看着。'
      : '今天人很多。你要是也在附近，先顾好自己。',
    statChanges: arranged
      ? { affection: 4, trust: 3, secrecy: -5, fanSuspicion: 5, companyAlert: 4, paparazziAttention: 3, mood: 4, money: -accessMode.cost }
      : { affection: 2, trust: 1, secrecy: -2, fanSuspicion: 3, publicHeat: 1, mood: 2, money: -accessMode.cost },
    evidence: arranged ? `${plan.title}临时通行贴和侧门动线` : `${plan.title}票根、现场照片和离场时间`,
    appUpdates: arranged ? ['KakaoTalk 新增一条克制提醒', '公司门禁记录出现一次临时通行'] : ['相册新增现场照片', 'Weverse 有人讨论现场视线方向'],
    notification: arranged ? '他替你安排了入场，但这条动线变得更敏感。' : '线下行程完成，现场痕迹已写入相册。',
    historyTags: ['offline', plan.id, accessMode.id, arranged ? 'arranged' : 'self'],
  }
}
