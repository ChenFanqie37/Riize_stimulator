import { useMemo } from 'react'
import { AlertTriangle, MessageCircle, Instagram, Shield, Flame, X, Briefcase, Search, UserRound } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { ChatMessage, InstagramDraft, WeversePost } from '@/types/game'
import { getIdentityIncidentScript, type IdentityChoiceTone } from '@/data/identityGameplay'

type IncidentChoice = {
  id: string
  label: string
  detail: string
  tone: IdentityChoiceTone
  action: () => void
}

type DailyIncidentModalProps = {
  isOpen: boolean
  onClose: () => void
  onRequestDate: () => void
}

const incidentTemplates = [
  {
    id: 'timeline_zoom',
    title: '粉丝开始拼今晚的动线',
    description: '超话里有人把他的下班路透、你相册里那张路灯反光、还有店门口 CCTV 的时间全摆在一起。还没锤死，但评论已经从“别造谣”变成“怎么又对上了”。',
    caption: '有时候，路灯比人先承认秘密。',
    forumTitle: '【时间线】今晚这几张图是不是太巧了',
    forumContent: '站姐图、路灯反光、下班时间全能对上。先不说是谁，懂的都懂，别急着骂我，等下一张图出来再说。',
  },
  {
    id: 'same_item',
    title: '同款物品被放大了',
    description: '粉丝把你照片角落里的杯套和他直播桌上的杯套截在一起，甚至有人开始扒购买记录。公司那边还没下场，但经纪人已经在群里问“谁认识这个账号”。',
    caption: '偏偏今天很想用同一个颜色。',
    forumTitle: '【同款】这杯套是不是有人见过',
    forumContent: '别跟我说巧合，颜色、折痕、贴纸位置都一样。现在问题是这是谁的手，为什么会出现在同一天。',
  },
  {
    id: 'paparazzi_car',
    title: '有车跟了你们两条街',
    description: '你刚退到路边，后视镜里那辆黑车又慢下来。艺人给你发了两条消息，最后一句停在“帮我说一声”，但没有发出去。',
    caption: '今晚的风好吵，像有人一路跟着。',
    forumTitle: '【目击】有人说今晚看到可疑车了',
    forumContent: '车牌被打码了，但跟拍路线很像冲着他去的。粉丝别装睡，最近真的有人在蹲。',
  },
  {
    id: 'company_pressure',
    title: '公司开始问你们的关系',
    description: '经纪人给他开了临时会议，话术很冷：“不是禁止交朋友，是不要让粉丝替公司发现。”你手机亮了一下，是他只发来的一个问号。',
    caption: '有些问号，只有当事人知道答案。',
    forumTitle: '【公司】经纪人是不是已经知道了',
    forumContent: '今天团队行程突然改了两次，工作人员脸色也不对。别问我怎么知道，前线都在传。',
  },
  {
    id: 'fan_room',
    title: '粉丝群开始疯狂考古',
    description: '一个自称“老粉”的账号把你几个月前的定位、穿搭和他采访里的只言片语串成了长图。离实锤还远，但情绪已经很高了。',
    caption: '被看见一点点，也不一定是坏事。',
    forumTitle: '【考古】这条线其实早有预兆',
    forumContent: '从那次机场到最近的同款，所有时间点放一起就很微妙。先存档，别让人删了。',
  },
  {
    id: 'teammate_cover',
    title: '队友突然帮他挡了一句',
    description: '直播里有人刷到恋爱关键词，队友立刻把话题带到新专辑和舞台站位。他笑了一下，但那一秒的松气被粉丝剪出来反复看。',
    caption: '有人替你把风吹到别处。',
    forumTitle: '【队友】刚才是不是有人帮忙挡话题',
    forumContent: '直播里那个转话题太明显了吧？也可能只是队友默契，但现在剪辑号都在发“救场瞬间”。',
  },
  {
    id: 'album_diversion',
    title: '新专辑讨论压过了恋爱词',
    description: '主打曲预告突然释出，评论区一半在吵part分配，一半在夸概念图。恋爱猜测还在，但被音乐话题压到第二页。',
    caption: '今天先把心跳藏进鼓点里。',
    forumTitle: '【回归】先聊新专辑别聊乱七八糟的',
    forumContent: '预告质感不错，桥段编排也有变化。恋爱瓜先放一边吧，回归期别让黑子拿热度。',
  },
  {
    id: 'staff_hint',
    title: '工作人员的提醒太具体',
    description: '一个工作人员小号发了句“非公开路线别跟”，没点名，却刚好卡在你们昨晚见面之后。粉丝开始猜公司是不是已经知道更多。',
    caption: '越具体的提醒，越像答案。',
    forumTitle: '【工作人员】这句提醒是不是在说某条线',
    forumContent: '非公开路线、不要跟车、不要发定位，这几个词放一起就很微妙。公司可能比粉丝更早知道。',
  },
  {
    id: 'wrong_target',
    title: '粉丝扒错了人',
    description: '一个无关女生因为穿了相似外套被错认，评论区短暂失控。你松了一口气，但也看到这场游戏会伤到别人。',
    caption: '有时候沉默也会落到别人身上。',
    forumTitle: '【澄清】刚才那个女生不是她吧',
    forumContent: '拜托别乱挂素人，外套像不等于本人。真正的问题是为什么大家已经急到开始找替身了。',
  },
]

function pickIncidentIndex(week: number, day: number) {
  return ((week - 1) * 7 + day - 1) % incidentTemplates.length
}

export default function DailyIncidentModal({ isOpen, onClose, onRequestDate }: DailyIncidentModalProps) {
  const state = useGameStore()
  const updateStats = useGameStore((s) => s.updateStats)
  const openApp = useGameStore((s) => s.openApp)
  const openChat = useGameStore((s) => s.openChat)
  const receiveMessage = useGameStore((s) => s.receiveMessage)
  const addNotification = useGameStore((s) => s.addNotification)
  const addHistoryEntry = useGameStore((s) => s.addHistoryEntry)

  const incident = useMemo(
    () => incidentTemplates[pickIncidentIndex(state.week, state.day)],
    [state.week, state.day]
  )

  if (!isOpen) return null

  const latestPhoto = [...state.gallery.photos].reverse().find((photo) => !photo.isDeleted)
  const pressure = Math.min(100, state.risk.fanSuspicion + state.risk.publicHeat + state.risk.paparazziAttention)
  const identityScript = getIdentityIncidentScript(state.player.identity)

  const closeWithHistory = (choice: string, consequences: Record<string, number>) => {
    addHistoryEntry({
      week: state.week,
      day: state.day,
      event: `每日被动事件：${incident.title}`,
      choice,
      consequences,
      memoryTags: ['daily_incident', incident.id],
    })
    onClose()
  }

  const runIdentityScript = () => {
    const consequences = identityScript.statChanges
    updateStats(consequences)

    useGameStore.setState((current) => {
      const now = Date.now()
      const artifact = identityScript.artifact
      if (artifact.type === 'note') {
        return {
          notes: {
            ...current.notes,
            entries: [
              ...current.notes.entries,
              {
                id: `note_identity_${now}`,
                title: artifact.title,
                content: artifact.content,
                type: 'plan',
                createdAt: now,
              },
            ],
          },
        }
      }
      if (artifact.type === 'calendar') {
        return {
          calendar: {
            ...current.calendar,
            events: [
              ...current.calendar.events,
              {
                id: `cal_identity_${now}`,
                title: artifact.title,
                date: `W${current.week}-D${current.day}`,
                time: artifact.time,
                type: 'player',
                isHighRisk: artifact.isHighRisk,
                isCompleted: false,
              },
            ],
          },
        }
      }
      if (artifact.type === 'company') {
        return {
          companyNotice: {
            ...current.companyNotice,
            notices: [
              ...current.companyNotice.notices,
              {
                id: `company_identity_${now}`,
                level: artifact.level,
                title: artifact.title,
                content: artifact.content,
                isRead: false,
                createdAt: now,
              },
            ],
          },
        }
      }
      if (artifact.type === 'weverse') {
        return {
          weverse: {
            ...current.weverse,
            posts: [
              ...current.weverse.posts,
              {
                id: `wv_identity_${now}`,
                type: 'control',
                author: current.appAccounts.weverse.displayName,
                title: artifact.title,
                content: artifact.content,
                heat: Math.min(100, 35 + current.risk.fanSuspicion),
                comments: 60 + Math.floor(current.risk.publicHeat * 1.4),
                isPlayerAlt: true,
                relatedEvidenceIds: current.evidenceFragments.slice(-3).map((e) => e.id),
                createdAt: now,
              },
            ],
          },
        }
      }
      if (artifact.type === 'naver') {
        return {
          naver: {
            ...current.naver,
            news: [
              ...current.naver.news,
              {
                id: `naver_identity_${now}`,
                title: artifact.title,
                summary: artifact.summary,
                source: '实时搜索',
                heat: Math.max(10, current.risk.publicHeat - 4),
                relatedSearchWords: [current.maleLead.stageName, '海外行程', '翻译误读'],
                createdAt: now,
              },
            ],
          },
        }
      }
      if (artifact.type === 'gallery') {
        return {
          gallery: {
            ...current.gallery,
            photos: [
              ...current.gallery.photos,
              {
                id: `photo_identity_${now}`,
                title: artifact.title,
                description: artifact.description,
                riskLevel: artifact.riskLevel,
                source: artifact.source,
                isHidden: false,
                isDeleted: false,
                isDiscoveredByFans: false,
                createdAt: now,
              },
            ],
          },
        }
      }
      return {}
    })

    addNotification({
      id: `notif_identity_${Date.now()}`,
      app: identityScript.app,
      title: identityScript.notificationTitle,
      content: identityScript.notificationContent,
      urgency: identityScript.tone === 'danger' || identityScript.tone === 'work' ? 'high' : 'medium',
      isRead: false,
      createdAt: Date.now(),
    })
    openApp(identityScript.app)
    closeWithHistory(identityScript.historyChoice, consequences)
  }

  const choices: IncidentChoice[] = [
    {
      id: 'talk',
      label: '先找他说清楚',
      detail: '跳到聊天，把口供、动线和要不要见面先对齐。',
      tone: 'sweet',
      action: () => {
        const consequences = { affection: 2, trust: 3, companyAlert: 1, secrecy: 1 }
        updateStats(consequences)
        const message: ChatMessage = {
          id: `daily_bf_${Date.now()}`,
          sender: 'boyfriend',
          senderName: state.maleLead.name,
          textKo: '',
          textZh: `我刚看到她们在拼时间线。先别急，我想听你怎么说。要是你想见面，我会想办法。`,
          timestamp: Date.now(),
          isRead: false,
          isRecalled: false,
          emotion: 'anxious',
          category: 'warning',
        }
        receiveMessage('thread_boyfriend', message)
        openChat('thread_boyfriend')
        openApp('kakaoTalk')
        closeWithHistory('找艺人对口供', consequences)
      },
    },
    {
      id: 'bestie',
      label: '问闺蜜怎么兜',
      detail: '跳到 KakaoTalk 闺蜜聊天，让她帮你判断粉丝会先扒哪条线。',
      tone: 'sweet',
      action: () => {
        const consequences = { fanSuspicion: -2, secrecy: 2, mood: 2, publicHeat: 1 }
        updateStats(consequences)
        const bestieName = state.player.bestieName || '闺蜜'
        const message: ChatMessage = {
          id: `daily_bestie_${Date.now()}`,
          sender: 'npc',
          senderName: bestieName,
          textKo: '',
          textZh: `我看了一圈，先别慌。现在最危险的是“${incident.title}”这条线。你要么跟他统一说法，要么用小号把注意力带走，别两边都动。`,
          timestamp: Date.now(),
          isRead: false,
          isRecalled: false,
          emotion: 'anxious',
          category: 'warning',
        }
        receiveMessage('thread_bestie', message)
        openChat('thread_bestie')
        openApp('kakaoTalk')
        closeWithHistory('问闺蜜制定兜底口径', consequences)
      },
    },
    {
      id: 'identity',
      label: identityScript.label,
      detail: identityScript.detail,
      tone: identityScript.tone,
      action: runIdentityScript,
    },
    {
      id: 'post',
      label: '发暧昧 Story 反撩',
      detail: '跳到 Instagram，用主账号发一条让粉丝更坐不住的内容。',
      tone: 'danger',
      action: () => {
        const consequences = { fanSuspicion: 6, publicHeat: 5, secrecy: -5, lovestagramScore: 6, mood: 4 }
        const draft: InstagramDraft = {
          postType: 'story',
          category: 'provocative',
          caption: incident.caption,
          visibility: 'public',
          showLocation: false,
          sourcePhotoId: latestPhoto?.id,
          reason: incident.title,
        }
        updateStats(consequences)
        useGameStore.setState({ pendingInstagramDraft: draft })
        openApp('instagram')
        closeWithHistory('发暧昧 Story 挑衅粉丝', consequences)
      },
    },
    {
      id: 'forum',
      label: '用小号下场带节奏',
      detail: '跳到 Weverse/论坛区，用小号把猜测推向你想要的方向。',
      tone: 'control',
      action: () => {
        const consequences = { fanSuspicion: 3, publicHeat: 4, rumorCredibility: 4, mood: 3 }
        const post: WeversePost = {
          id: `wv_daily_alt_${Date.now()}`,
          type: 'timeline',
          author: '深夜的站台',
          title: incident.forumTitle,
          content: incident.forumContent,
          heat: Math.min(100, 42 + pressure * 0.4),
          comments: 90 + Math.floor(pressure * 1.5),
          isPlayerAlt: true,
          relatedEvidenceIds: state.evidenceFragments.slice(-3).map((e) => e.id),
          createdAt: Date.now(),
        }
        updateStats(consequences)
        useGameStore.setState((current) => ({
          weverse: {
            ...current.weverse,
            posts: [...current.weverse.posts, post],
          },
        }))
        openApp('weverse')
        closeWithHistory('小号下场带节奏', consequences)
      },
    },
    {
      id: 'dispatch',
      label: '先查狗仔线索',
      detail: '跳到 Dispatch 线索页，看看外部到底拍到了哪一步。',
      tone: 'danger',
      action: () => {
        const consequences = { paparazziAttention: 3, secrecy: 2, stress: 3, fanSuspicion: -1 }
        updateStats(consequences)
        useGameStore.setState((current) => ({
          dispatch: {
            ...current.dispatch,
            tips: [
              ...current.dispatch.tips,
              {
                id: `dispatch_daily_${Date.now()}`,
                type: 'clue',
                content: `有人在核对${current.maleLead.stageName}今晚的车辆路线。暂时没有正脸图，但车牌、店门口监控和粉丝路透已经被放在同一张表里。`,
                heatLevel: Math.min(100, 35 + current.risk.paparazziAttention + current.hiddenRisk.paparazziHeat),
                createdAt: Date.now(),
              },
            ],
          },
        }))
        openApp('dispatch')
        closeWithHistory('先查狗仔线索', consequences)
      },
    },
    {
      id: 'hide',
      label: '先清痕迹装死',
      detail: '压热度，但他可能会觉得你又把他推远了。',
      tone: 'quiet',
      action: () => {
        const consequences = { secrecy: 6, fanSuspicion: -5, companyAlert: -2, affection: -1, mood: -1 }
        updateStats(consequences)
        addNotification({
          id: `daily_hide_${Date.now()}`,
          app: 'notes',
          title: '痕迹清理完成',
          content: '你把可疑定位、预览图和几条容易被截图的内容先藏了起来，热度暂时降了一点。',
          urgency: 'medium',
          isRead: false,
          createdAt: Date.now(),
        })
        closeWithHistory('清痕迹装死', consequences)
      },
    },
  ]

  const toneStyle: Record<IncidentChoice['tone'], string> = {
    sweet: 'border-pink-200 bg-pink-50 text-pink-700',
    danger: 'border-red-200 bg-red-50 text-red-700',
    control: 'border-purple-200 bg-purple-50 text-purple-700',
    quiet: 'border-gray-200 bg-gray-50 text-gray-600',
    work: 'border-blue-200 bg-blue-50 text-blue-700',
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-black/10 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <div>
              <p className="text-sm font-bold">第 {state.day} 天突发情况</p>
              <p className="text-[11px] text-white/80">剧情默认推进，每天都会有人先动手。</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15">
            <X size={17} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-rose-500" />
              <h3 className="text-[#1C1C1E] text-sm font-bold">{incident.title}</h3>
            </div>
            <p className="text-xs leading-relaxed text-[#3C3C3C]">{incident.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {choices.map((choice) => (
              <button
                key={choice.id}
                onClick={choice.action}
                className={`rounded-xl border px-3 py-2.5 text-left transition-all hover:scale-[1.01] ${toneStyle[choice.tone]}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {choice.id === 'talk' && <MessageCircle size={14} />}
                  {choice.id === 'bestie' && <UserRound size={14} />}
                  {choice.id === 'identity' && <Briefcase size={14} />}
                  {choice.id === 'post' && <Instagram size={14} />}
                  {choice.id === 'forum' && <Flame size={14} />}
                  {choice.id === 'dispatch' && <Search size={14} />}
                  {choice.id === 'hide' && <Shield size={14} />}
                  <span className="text-xs font-bold">{choice.label}</span>
                </div>
                <p className="text-[11px] opacity-80">{choice.detail}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              onRequestDate()
              onClose()
            }}
            className="mt-3 w-full rounded-xl border border-pink-200 bg-white px-3 py-2 text-xs font-bold text-pink-600"
          >
            直接安排一次约会，把局面变得更刺激
          </button>
        </div>
      </div>
    </div>
  )
}
