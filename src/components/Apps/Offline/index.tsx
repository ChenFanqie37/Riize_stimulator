import { useMemo, useState } from 'react'
import { CalendarClock, Camera, CheckCircle2, Loader2, MapPin, Route, ShieldAlert, Sparkles, Ticket, Users } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import AppAccountBar from '../../Common/AppAccountBar'
import { generateOfflineScene } from '@/engine/gemini'
import { createFallbackOfflineScene } from '@/engine/narrativeEngine'
import type { OfflineAccessMode, OfflineAccessModeId, OfflineCategory, OfflinePlan, OfflineSceneResult } from '@/types/game'

const categoryLabels: Record<OfflineCategory, string> = {
  concert: '演唱会',
  fansign: '签售',
  prerecording: '预录',
  festival: '音乐节',
  airport: '机场',
  music_show: '打歌',
  company: '公司周边',
  brand: '品牌活动',
  campus: '公开活动',
}

const categoryIcons: Record<OfflineCategory, typeof Ticket> = {
  concert: Ticket,
  fansign: Users,
  prerecording: Camera,
  festival: Sparkles,
  airport: Route,
  music_show: Camera,
  company: ShieldAlert,
  brand: Ticket,
  campus: MapPin,
}

function access(mode: OfflineAccessMode): OfflineAccessMode {
  return mode
}

const basePlans: OfflinePlan[] = [
  {
    id: 'concert_vip',
    category: 'concert',
    title: '首尔演唱会内场',
    place: 'KSPO DOME 内场侧区',
    time: '18:00',
    timeCost: 8,
    baseCost: 80,
    arrangedCost: 12,
    minAffection: 48,
    minTrust: 42,
    risk: 54,
    reward: 86,
    detail: '正常买票很贵也不一定能抢到；如果让他安排，可能会变成靠近控台或亲友区的敏感座位。',
    accessModes: [
      access({ id: 'self_paid', label: '自己买票进场', description: '花钱抢票，位置普通但解释空间大。', cost: 80, riskDelta: 0, rewardDelta: 0 }),
      access({ id: 'boyfriend_arranged', label: '让他安排亲友座', description: '他让工作人员留一张票，花费低但动线更敏感。', cost: 12, riskDelta: 18, rewardDelta: 12, minAffection: 48, minTrust: 42, companyAlertDelta: 8 }),
      access({ id: 'outer_area', label: '场外听控/等散场', description: '不进内场，只在场外等结束。', cost: 8, riskDelta: -10, rewardDelta: -18 }),
    ],
    effects: { affection: 4, trust: 2, fanSuspicion: 4, publicHeat: 3, secrecy: -4, paparazziAttention: 3, mood: 5 },
    trace: '你去了演唱会现场，灯海亮起时他朝侧区看了一眼。',
    llmPromptHint: 'concert, family/VIP seat, lightstick ocean, hidden eye contact, staff route',
  },
  {
    id: 'fansign_inside',
    category: 'fansign',
    title: '签售内场',
    place: '汝矣岛签售会场',
    time: '14:00',
    timeCost: 5,
    baseCost: 55,
    arrangedCost: 5,
    minAffection: 38,
    minTrust: 34,
    risk: 68,
    reward: 76,
    detail: '作为粉丝抽中签售很合理，但如果他主动帮你进场，站姐和同担会更容易记住你的脸。',
    accessModes: [
      access({ id: 'lottery', label: '自己抽签/买专进场', description: '成本高，粉丝身份解释最自然。', cost: 55, riskDelta: 0, rewardDelta: 0 }),
      access({ id: 'boyfriend_arranged', label: '他说一声补名额', description: '他让工作人员补一个空位，甜但极其危险。', cost: 5, riskDelta: 22, rewardDelta: 10, minAffection: 42, minTrust: 36, companyAlertDelta: 10 }),
      access({ id: 'outer_area', label: '外围观察粉圈风向', description: '不进内场，收集站姐和同担动线。', cost: 6, riskDelta: -16, rewardDelta: -20 }),
    ],
    effects: { affection: 3, trust: 1, fanSuspicion: 7, publicHeat: 4, secrecy: -6, paparazziAttention: 2, mood: 4 },
    trace: '你靠近签售会场，听见前排粉丝在对暗号和站位。',
    llmPromptHint: 'fansign, album pile, fansites, handwritten post-it, he recognizes player',
  },
  {
    id: 'prerecording_dawn',
    category: 'prerecording',
    title: '凌晨预录',
    place: '音乐银行预录入口',
    time: '05:20',
    timeCost: 7,
    baseCost: 20,
    arrangedCost: 0,
    minAffection: 44,
    minTrust: 46,
    risk: 62,
    reward: 82,
    detail: '预录很早、很冷、粉丝密度高。让他安排进去几乎不要钱，但通行路线会被公司记住。',
    accessModes: [
      access({ id: 'self_paid', label: '按粉丝流程排预录', description: '跟粉丝一起排队，风险来自人群和站姐。', cost: 20, riskDelta: 0, rewardDelta: 0 }),
      access({ id: 'boyfriend_arranged', label: '他让工作人员带你进去', description: '从侧门进，省钱但公司警觉明显上升。', cost: 0, riskDelta: 20, rewardDelta: 14, minAffection: 44, minTrust: 46, companyAlertDelta: 12 }),
      access({ id: 'work_pass', label: '借工作证名义协助', description: '适合工作人员身份，风险集中在职场记录。', cost: 4, riskDelta: 8, rewardDelta: 4, minTrust: 30, companyAlertDelta: 8 }),
    ],
    effects: { affection: 5, trust: 3, fanSuspicion: 6, publicHeat: 3, secrecy: -5, companyAlert: 4, mood: 3 },
    trace: '你在凌晨预录入口等到天亮，手指被冻得发红。',
    llmPromptHint: 'dawn prerecording, cold hands, staff side door, whispered concern',
  },
  {
    id: 'festival_side_gate',
    category: 'festival',
    title: '音乐节侧门',
    place: '首尔麻浦区音乐节侧门',
    time: '16:30',
    timeCost: 6,
    baseCost: 35,
    arrangedCost: 10,
    minAffection: 36,
    minTrust: 30,
    risk: 58,
    reward: 70,
    detail: '开放场地更容易偶遇，也更容易被路人拍到背影。',
    accessModes: [
      access({ id: 'self_paid', label: '自己买音乐节票', description: '能自然出现，成本中等。', cost: 35, riskDelta: 0, rewardDelta: 0 }),
      access({ id: 'boyfriend_arranged', label: '他给你留侧台通行', description: '靠近舞台侧边，甜度高但动线很显眼。', cost: 10, riskDelta: 16, rewardDelta: 12, minAffection: 36, minTrust: 30, companyAlertDelta: 6 }),
      access({ id: 'outer_area', label: '只去侧门外等车', description: '花费低，可能只看见一眼。', cost: 6, riskDelta: -8, rewardDelta: -14 }),
    ],
    effects: { affection: 3, trust: 1, fanSuspicion: 5, publicHeat: 4, secrecy: -4, paparazziAttention: 4, mood: 4 },
    trace: '你去了音乐节侧门，保姆车灯光扫过你的影子。',
    llmPromptHint: 'festival side gate, open venue, van headlights, quick rescue',
  },
  {
    id: 'airport_arrival',
    category: 'airport',
    title: '机场接机',
    place: '仁川机场到达层',
    time: '11:20',
    timeCost: 6,
    baseCost: 16,
    arrangedCost: 3,
    minAffection: 40,
    minTrust: 28,
    risk: 72,
    reward: 70,
    detail: '机场镜头多，任何对视都会被剪成慢放。让他安排车位会更危险。',
    accessModes: [
      access({ id: 'self_paid', label: '自己坐机场线去', description: '作为路人或粉丝出现，成本低。', cost: 16, riskDelta: 0, rewardDelta: 0 }),
      access({ id: 'boyfriend_arranged', label: '他让车多绕一圈', description: '你能更近地见到他，但车牌和动线会留下证据。', cost: 3, riskDelta: 20, rewardDelta: 10, minAffection: 40, minTrust: 28, companyAlertDelta: 6 }),
    ],
    effects: { affection: 4, fanSuspicion: 8, publicHeat: 7, secrecy: -7, paparazziAttention: 7, stress: 4, mood: 2 },
    trace: '你去了机场接机，他在人群里停了一秒，像是认出了你。',
    llmPromptHint: 'airport arrival, camera line, van route, eye contact clipped by fans',
  },
  {
    id: 'music_show_exit',
    category: 'music_show',
    title: '音乐节目下班点',
    place: 'SBS 附近公开出口',
    time: '18:30',
    timeCost: 5,
    baseCost: 8,
    arrangedCost: 2,
    minAffection: 34,
    minTrust: 30,
    risk: 46,
    reward: 58,
    detail: '公开行程附近，站姐和工作人员都很多。被安排到不显眼的位置会很甜，也会有通行记录。',
    accessModes: [
      access({ id: 'self_paid', label: '自己去下班点', description: '像普通粉丝一样等，风险可解释。', cost: 8, riskDelta: 0, rewardDelta: 0 }),
      access({ id: 'boyfriend_arranged', label: '他让经纪人避开人群给你递话', description: '不会直接见面，但会留下工作人员异常动线。', cost: 2, riskDelta: 12, rewardDelta: 10, minAffection: 34, minTrust: 30, companyAlertDelta: 5 }),
    ],
    effects: { affection: 3, fanSuspicion: 4, publicHeat: 3, secrecy: -3, paparazziAttention: 3, mood: 4 },
    trace: '你去了音乐节目下班点，隔着人群看到他回头找你的方向。',
    llmPromptHint: 'music show exit, crowd, manager relay, subtle line',
  },
  {
    id: 'company_cafe',
    category: 'company',
    title: '公司附近咖啡厅',
    place: '公司后门街角',
    time: '20:40',
    timeCost: 5,
    baseCost: 10,
    arrangedCost: 5,
    minAffection: 42,
    minTrust: 38,
    risk: 78,
    reward: 84,
    detail: '最像恋爱剧情，也最危险。员工、私生、狗仔都可能认识这条路。',
    accessModes: [
      access({ id: 'self_paid', label: '自己去咖啡厅等', description: '像普通客人一样坐着，风险来自熟脸。', cost: 10, riskDelta: 0, rewardDelta: 0 }),
      access({ id: 'boyfriend_arranged', label: '他让你坐固定角落', description: '店员会记住你们的习惯，甜但很容易形成证据。', cost: 5, riskDelta: 14, rewardDelta: 12, minAffection: 42, minTrust: 38, companyAlertDelta: 8 }),
    ],
    effects: { affection: 6, trust: 3, fanSuspicion: 9, publicHeat: 6, secrecy: -8, companyAlert: 8, paparazziAttention: 8, mood: 5 },
    trace: '你去了公司后门咖啡厅，他把纸条压在杯套下。',
    llmPromptHint: 'company cafe, cup sleeve note, staff recognizes routine',
  },
  {
    id: 'brand_popup',
    category: 'brand',
    title: '品牌快闪同场',
    place: '圣水洞品牌快闪店',
    time: '15:00',
    timeCost: 4,
    baseCost: 18,
    arrangedCost: 6,
    minAffection: 32,
    minTrust: 24,
    risk: 38,
    reward: 46,
    detail: '看起来最像普通路人活动，适合制造“巧合”，也适合留下同款伏笔。',
    accessModes: [
      access({ id: 'self_paid', label: '自己预约入场', description: '普通消费者路径，风险低。', cost: 18, riskDelta: 0, rewardDelta: 0 }),
      access({ id: 'boyfriend_arranged', label: '他给你留员工预览名额', description: '进场更顺，但会进入品牌名单。', cost: 6, riskDelta: 10, rewardDelta: 8, minAffection: 32, minTrust: 24, companyAlertDelta: 4 }),
    ],
    effects: { affection: 2, fanSuspicion: 3, publicHeat: 2, secrecy: -2, coupleItemScore: 5, popularity: 2, mood: 2 },
    trace: '你去了快闪店，买到一件和他直播里相同色系的小物。',
    llmPromptHint: 'brand popup, same item, staff preview list, photowall',
  },
  {
    id: 'campus_event',
    category: 'campus',
    title: '校园公开活动',
    place: '延南洞大学路小舞台',
    time: '13:30',
    timeCost: 4,
    baseCost: 6,
    arrangedCost: 0,
    minAffection: 30,
    minTrust: 28,
    risk: 34,
    reward: 50,
    detail: '青春感最强，费用低；如果他特意给你留通道，反而更像剧情会被记住。',
    accessModes: [
      access({ id: 'self_paid', label: '作为观众参加', description: '自然、便宜，但距离远。', cost: 6, riskDelta: 0, rewardDelta: 0 }),
      access({ id: 'boyfriend_arranged', label: '他让志愿者给你留前排边座', description: '像小小偏爱，风险温和。', cost: 0, riskDelta: 8, rewardDelta: 10, minAffection: 30, minTrust: 28, companyAlertDelta: 2 }),
    ],
    effects: { affection: 3, trust: 2, fanSuspicion: 2, secrecy: -2, mood: 5, lifeStability: 2 },
    trace: '你去了校园公开活动，台下风吹起应援纸的一角。',
    llmPromptHint: 'campus event, volunteer seat, youth, ordinary life contrast',
  },
]

function riskColor(risk: number) {
  if (risk < 40) return '#22C55E'
  if (risk < 60) return '#F59E0B'
  return '#EF4444'
}

function effectiveRisk(plan: OfflinePlan, mode?: OfflineAccessMode) {
  return Math.max(0, Math.min(100, plan.risk + (mode?.riskDelta || 0)))
}

function effectiveReward(plan: OfflinePlan, mode?: OfflineAccessMode) {
  return Math.max(0, Math.min(100, plan.reward + (mode?.rewardDelta || 0)))
}

export default function Offline() {
  const state = useGameStore()
  const updateStats = useGameStore((s) => s.updateStats)
  const advanceTime = useGameStore((s) => s.advanceTime)
  const addPendingStoryHook = useGameStore((s) => s.addPendingStoryHook)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [selectedModeId, setSelectedModeId] = useState<OfflineAccessModeId>('self_paid')
  const [loading, setLoading] = useState(false)

  const plans = useMemo(() => {
    const riskBoost = state.risk.publicHeat > 55 ? 10 : state.risk.fanSuspicion > 55 ? 6 : 0
    return basePlans.map((plan) => ({ ...plan, risk: Math.min(100, plan.risk + riskBoost) }))
  }, [state.risk.publicHeat, state.risk.fanSuspicion])

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || null
  const selectedMode = selectedPlan?.accessModes.find((mode) => mode.id === selectedModeId) || selectedPlan?.accessModes[0] || null

  const canUseMode = (mode: OfflineAccessMode) => {
    if (state.player.money < mode.cost || state.player.actionPoints <= 0) return false
    if (mode.minAffection && state.maleLead.affection < mode.minAffection) return false
    if (mode.minTrust && state.maleLead.trust < mode.minTrust) return false
    return true
  }

  const executePlan = async (plan: OfflinePlan, mode: OfflineAccessMode) => {
    if (!canUseMode(mode)) return
    setLoading(true)
    let scene: OfflineSceneResult
    try {
      scene = await generateOfflineScene({ state: useGameStore.getState(), plan, accessMode: mode })
    } catch {
      scene = createFallbackOfflineScene(useGameStore.getState(), plan, mode)
    }

    const risk = effectiveRisk(plan, mode)
    const now = Date.now()
    const spotted = risk + state.risk.fanSuspicion > 105
    const combinedStats = {
      ...plan.effects,
      ...scene.statChanges,
      fanSuspicion: (plan.effects.fanSuspicion || 0) + (scene.statChanges.fanSuspicion || 0) + (spotted ? 6 : 0),
      companyAlert: (plan.effects.companyAlert || 0) + (scene.statChanges.companyAlert || 0) + (mode.companyAlertDelta || 0),
      paparazziHeat: Math.ceil(risk / 12),
      timelineOverlap: Math.ceil(risk / 18),
      money: -mode.cost,
      actionPoints: -1,
    }
    updateStats(combinedStats)

    useGameStore.setState((current) => {
      const message = {
        id: `msg_offline_${now}`,
        sender: 'boyfriend' as const,
        senderName: current.maleLead.name,
        textKo: '',
        textZh: scene.boyfriendMessage,
        timestamp: now,
        isRead: false,
        isRecalled: false,
        emotion: spotted ? 'anxious' as const : 'sweet' as const,
        category: spotted ? 'warning' as const : 'sweet' as const,
      }
      return {
        kakaoTalk: {
          ...current.kakaoTalk,
          threads: current.kakaoTalk.threads.map((thread) =>
            thread.id === 'thread_boyfriend'
              ? { ...thread, unreadCount: thread.unreadCount + 1, lastActive: '刚刚', messages: [...thread.messages, message] }
              : thread
          ),
        },
        calendar: {
          ...current.calendar,
          events: [
            ...current.calendar.events,
            {
              id: `offline_cal_${now}`,
              title: `${plan.title} · ${mode.label}`,
              date: `W${current.week}-D${current.day}`,
              time: plan.time,
              type: mode.id === 'boyfriend_arranged' ? 'shared' : 'player',
              isHighRisk: risk >= 60,
              isCompleted: true,
            },
          ],
        },
        gallery: {
          ...current.gallery,
          photos: [
            ...current.gallery.photos,
            {
              id: `offline_photo_${now}`,
              title: plan.title,
              description: scene.narrative.join('\n'),
              riskLevel: risk >= 60 ? 'high' : risk >= 40 ? 'medium' : 'low',
              source: 'offline',
              isHidden: false,
              isDeleted: false,
              isDiscoveredByFans: spotted,
              relatedEventChainId: 'offline_route',
              createdAt: now,
            },
          ],
        },
        evidenceFragments: [
          ...current.evidenceFragments,
          {
            id: `offline_ev_${now}`,
            title: `${plan.title}线下痕迹`,
            source: 'offline',
            riskLevel: risk,
            description: scene.evidence,
            discoveredByFans: spotted,
            canDelete: false,
            relatedEventChainId: 'offline_route',
            createdAt: now,
          },
        ],
        dispatch: risk >= 60
          ? {
              ...current.dispatch,
              tips: [
                ...current.dispatch.tips,
                {
                  id: `offline_dispatch_${now}`,
                  type: spotted ? 'blur_photo' : 'clue',
                  content: spotted ? `${current.maleLead.stageName}公开行程附近出现模糊同框线索，粉丝正在找原图。` : scene.evidence,
                  heatLevel: Math.min(100, 28 + risk + current.risk.paparazziAttention),
                  createdAt: now,
                },
              ],
            }
          : current.dispatch,
        weverse: {
          ...current.weverse,
          posts: [
            ...current.weverse.posts,
            {
              id: `wv_offline_${now}`,
              type: spotted ? 'analysis' : 'sugar',
              author: spotted ? 'timeline_room' : 'briize_window',
              title: spotted ? '오늘 동선 좀 이상하지 않아?' : '오늘 현장 분위기 좋았음',
              content: spotted ? `有人把${plan.title}现场动线和${current.maleLead.stageName}离场时间放在一起对比。` : scene.appUpdates[0] || `${plan.title}现场没有大事，但有人说他今天往侧边看了好几次。`,
              heat: Math.min(100, 30 + current.risk.fanSuspicion + risk * 0.4),
              comments: 40 + Math.floor(risk * 1.3),
              isPlayerAlt: false,
              relatedEvidenceIds: current.evidenceFragments.slice(-2).map((e) => e.id),
              createdAt: now,
            },
          ],
        },
        notifications: [
          ...current.notifications,
          {
            id: `offline_notif_${now}`,
            app: 'offline',
            title: mode.id === 'boyfriend_arranged' ? '他替你安排好了' : '线下行程完成',
            content: scene.notification,
            urgency: spotted || risk >= 70 ? 'high' : risk >= 50 ? 'medium' : 'low',
            isRead: false,
            createdAt: now,
          },
        ],
        history: [
          ...current.history,
          {
            id: `hist_offline_${now}`,
            week: current.week,
            day: current.day,
            event: `追线下：${plan.title}`,
            choice: `${mode.label}｜${scene.narrative[0] || plan.trace}`,
            consequences: combinedStats,
            memoryTags: scene.historyTags,
            createdAt: now,
          },
        ],
      }
    })

    addPendingStoryHook({
      source: 'offline',
      title: `线下：${plan.title}`,
      detail: `${mode.label}。${scene.narrative.join(' ')}`,
      weight: mode.id === 'boyfriend_arranged' ? 5 : 3,
    })
    advanceTime(plan.timeCost)
    setLoading(false)
    setSelectedPlanId(null)
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #0284C7, #38BDF8)' }}>
        <div className="flex items-center gap-2">
          <Route size={18} className="text-white" />
          <div>
            <h1 className="text-white font-bold text-lg">线下</h1>
            <p className="text-white/70 text-[10px]">演唱会、签售、预录、音乐节和被安排进场</p>
          </div>
        </div>
      </div>
      <AppAccountBar app="offline" />

      <div className="px-3 py-2 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-sky-50 px-2 py-2">
            <p className="text-[9px] text-sky-500">时间</p>
            <p className="text-xs font-bold text-sky-700">{String(state.hour ?? 8).padStart(2, '0')}:30</p>
          </div>
          <div className="rounded-lg bg-rose-50 px-2 py-2">
            <p className="text-[9px] text-rose-500">关系</p>
            <p className="text-xs font-bold text-rose-700">{state.maleLead.affection}/{state.maleLead.trust}</p>
          </div>
          <div className="rounded-lg bg-amber-50 px-2 py-2">
            <p className="text-[9px] text-amber-500">预算</p>
            <p className="text-xs font-bold text-amber-700">{state.player.money}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {plans.map((plan) => {
          const Icon = categoryIcons[plan.category]
          const arranged = plan.accessModes.find((mode) => mode.id === 'boyfriend_arranged')
          const canArrange = arranged ? canUseMode(arranged) : false
          return (
            <button
              key={plan.id}
              onClick={() => {
                setSelectedPlanId(plan.id)
                setSelectedModeId(plan.accessModes[0].id)
              }}
              className="w-full text-left px-3 py-3 border-b border-gray-50"
            >
              <div className="flex items-start gap-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${riskColor(plan.risk)}14`, color: riskColor(plan.risk) }}
                >
                  <Icon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-gray-800">{plan.title}</p>
                    <span className="text-[10px] text-gray-400">{categoryLabels[plan.category]}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{plan.place} · {plan.time} · {plan.timeCost}h</p>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{plan.detail}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[10px]" style={{ color: riskColor(plan.risk) }}>风险 {plan.risk}</span>
                    <span className="text-[10px] text-pink-500">甜度 {plan.reward}</span>
                    <span className="text-[10px] text-amber-500">普通 {plan.baseCost}</span>
                    <span className={`text-[10px] ${canArrange ? 'text-emerald-500' : 'text-gray-400'}`}>
                      {canArrange ? '可让他安排' : `安排需 ${plan.minAffection}/${plan.minTrust}`}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selectedPlan && selectedMode && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedPlanId(null)} />
          <div className="relative w-full max-h-[88%] rounded-2xl bg-white border border-black/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">{selectedPlan.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{selectedPlan.detail}</p>
            </div>
            <div className="p-4 overflow-y-auto">
              <div className="space-y-2 mb-4">
                {selectedPlan.accessModes.map((mode) => {
                  const available = canUseMode(mode)
                  const active = selectedModeId === mode.id
                  return (
                    <button
                      key={mode.id}
                      onClick={() => available && setSelectedModeId(mode.id)}
                      disabled={!available}
                      className="w-full text-left rounded-xl border p-3 disabled:opacity-45"
                      style={{
                        borderColor: active ? '#38BDF8' : 'rgba(0,0,0,0.08)',
                        background: active ? 'rgba(56,189,248,0.08)' : 'rgba(0,0,0,0.02)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            {active && <CheckCircle2 size={13} className="text-sky-500" />}
                            {mode.label}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{mode.description}</p>
                        </div>
                        <span className="text-[10px] font-bold text-amber-500">{mode.cost}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2">
                        风险 {effectiveRisk(selectedPlan, mode)} · 甜度 {effectiveReward(selectedPlan, mode)}
                        {!available && mode.id === 'boyfriend_arranged' ? ` · 需要好感${mode.minAffection}/信任${mode.minTrust}` : ''}
                      </p>
                    </button>
                  )
                })}
              </div>

              <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-3">
                <div className="h-full" style={{ width: `${effectiveRisk(selectedPlan, selectedMode)}%`, background: riskColor(effectiveRisk(selectedPlan, selectedMode)) }} />
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                这会推进 {selectedPlan.timeCost} 小时。让他安排通常更便宜、更甜，但会留下通行、座位、工作人员动线或公司记录。
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPlanId(null)}
                  className="flex-1 rounded-xl bg-gray-100 py-2 text-xs font-bold text-gray-500"
                >
                  取消
                </button>
                <button
                  onClick={() => executePlan(selectedPlan, selectedMode)}
                  disabled={loading || !canUseMode(selectedMode)}
                  className="flex-1 rounded-xl py-2 text-xs font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0284C7, #38BDF8)' }}
                >
                  {loading && <Loader2 size={13} className="animate-spin" />}
                  出发
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
