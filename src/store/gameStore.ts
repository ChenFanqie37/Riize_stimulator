import { create } from 'zustand'
import type {
  GameState,
  AppName,
  ChatMessage,
  ChatThread,
  CallLog,
  InstagramPost,
  Notification,
  Trace,
  DelayedConsequence,
  EventChain,
  EvidenceFragment,
  FanTimelineEntry,
  HistoryEntry,
  RelationshipStatus,
  RIIZEMember,
  PlayerIdentity,
  BoyfriendPersona,
  NarrativePhase,
  Clue,
  HiddenRisk,
  FandomStage,
  PaparazziStage,
  DelayedEcho
} from '../types/game'
import { riizeMembers, npcTemplates, createNPCFromTemplate, getRandomPersona, getMemberData } from '../data/characters'
import { eventChains } from '../data/events'
import { getInitialSocialContent, getTriggeredContent } from '../data/initialSocialContent'
import { getIdentityStory } from '../data/storyData'
import { performPlayerAction } from '../engine/actionEngine'
import { processDelayedConsequences, generateFanTimeline, checkCrisisLevel } from '../engine/eventEngine'
import {
  generateWeekNotifications,
  generateMainEvent,
  processWeekStart,
  processWeekEnd,
  checkSpecialTriggers,
  determineNarrativePhase,
  determineRelationshipStage
} from '../engine/storyEngine'

const initialState: GameState = {
  phase: 'cover',
  week: 1,
  day: 1,
  timeOfDay: 'morning',
  weather: '晴',
  player: {
    name: '',
    bestieName: '智恩',
    age: 20,
    identity: 'student',
    fanLevel: 'casual',
    storyPace: 'standard',
    plotPreference: 'A',
    money: 35,
    mood: 60,
    popularity: 10,
    lifeStability: 50,
    actionPoints: 3,
    mentalTags: []
  },
  maleLead: {
    memberId: 'shotaro',
    name: '将太郎',
    stageName: 'SHOTARO',
    affection: 15,
    trust: 20,
    careerPressure: 30,
    relationshipStage: 'stranger',
    hiddenPersona: 'true_love',
    emotionalState: 'neutral',
    memory: {
      playerAskedForPublic: 0,
      playerDeletedPhotoForHim: false,
      lastFightReason: '',
      unresolvedIssues: [],
      emotionalDebt: 0,
      promisedToMeet: false,
      playerProtectInCrisis: false,
      playerColdWarCount: 0,
      keyMemories: []
    }
  },
  risk: {
    secrecy: 80,
    companyAlert: 5,
    publicHeat: 5,
    fanSuspicion: 5,
    paparazziAttention: 5,
    evidenceCount: 0
  },
  npcs: npcTemplates.map(t => createNPCFromTemplate(t)),
  kakaoTalk: {
    threads: [],
    callLogs: []
  },
  instagram: {
    posts: [],
    stories: [],
    dms: []
  },
  weverse: {
    posts: [],
    timeline: []
  },
  naver: {
    news: [],
    searchHistory: []
  },
  companyNotice: {
    notices: []
  },
  dispatch: {
    tips: []
  },
  calendar: {
    events: []
  },
  gallery: {
    photos: []
  },
  notes: {
    entries: []
  },
  health: {
    sleep: 70,
    stress: 20,
    mentalHealth: 70
  },
  eventChains: eventChains.map(ec => ({ ...ec })),
  delayedConsequences: [],
  evidenceFragments: [],
  traces: [],
  history: [],
  memoryTags: [],
  currentChapter: 1,
  narrativePhase: '起',
  relationshipStatus: 'normal',
  notifications: [],
  currentApp: null,
  currentChatThreadId: null,
  saves: [],
  isTyping: false,
  typingDuration: 0,
  pendingCall: null,
  showMessageBanner: null,
  hiddenRisk: {
    paparazziHeat: 0,
    lovestagramScore: 0,
    coupleItemScore: 0,
    timelineOverlap: 0,
    possessiveness: 15,
    rumorCredibility: 0,
    insiderLeakRisk: 0,
  },
  clueLedger: [],
  fandomStage: 'none' as FandomStage,
  paparazziStage: 'observing' as PaparazziStage,
  delayedEchoes: [],
}

interface GameStore extends GameState {
  setPhase: (phase: GameState['phase']) => void
  createGame: (options: {
    playerName: string
    bestieName: string
    playerAge: number
    identity: PlayerIdentity
    fanLevel: GameState['player']['fanLevel']
    storyPace: GameState['player']['storyPace']
    plotPreference: GameState['player']['plotPreference']
    memberId: RIIZEMember
    customBoyfriendName?: string
  }) => void
  advanceWeek: () => void
  advanceDay: () => void
  sendMessage: (threadId: string, textKo: string, textZh: string) => void
  receiveMessage: (threadId: string, message: ChatMessage) => void
  postInstagram: (post: InstagramPost) => void
  deleteInstagramPost: (postId: string) => void
  addNotification: (notification: Notification) => void
  markNotificationRead: (notificationId: string) => void
  openApp: (app: AppName) => void
  closeApp: () => void
  openChat: (threadId: string) => void
  updateStats: (changes: Record<string, number>) => void
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'createdAt'>) => void
  addTrace: (trace: Omit<Trace, 'id' | 'createdAt'>) => void
  addDelayedConsequence: (consequence: Omit<DelayedConsequence, 'id'>) => void
  triggerDelayedConsequences: () => void
  updateEventChain: (chainId: string, updates: Partial<EventChain>) => void
  addEvidence: (evidence: EvidenceFragment) => void
  addFanTimeline: (entry: FanTimelineEntry) => void
  updateBoyfriendMemory: (updates: Partial<GameState['maleLead']['memory']>) => void
  saveGame: (name: string) => void
  loadGame: (saveId: string) => void
  deleteSave: (saveId: string) => void
  getSaves: () => void
  setRelationshipStatus: (status: RelationshipStatus) => void
  performAction: (actionId: string, payload?: any) => string
  answerCall: () => void
  rejectCall: () => void
  dismissBanner: () => void
  triggerIncomingCall: (callerName: string, callerAvatar: string) => void
  triggerMessageBanner: (threadId: string, senderName: string, preview: string, avatar: string) => void
  deleteThread: (threadId: string) => void
  setBestieName: (name: string) => void
  triggerSocialEvent: (platform: string, trigger: string) => void
  addClue: (clue: Omit<Clue, 'id' | 'createdAt' | 'discovered' | 'linkedClueIds'>) => void
  discoverClue: (clueId: string, discoveredBy: 'fans' | 'company' | 'paparazzi') => void
  updateHiddenRisk: (changes: Partial<HiddenRisk>) => void
  evaluateFandomStage: () => FandomStage
  evaluatePaparazziStage: () => PaparazziStage
  addDelayedEcho: (echo: DelayedEcho) => void
  processDelayedEchoes: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  createGame: (options) => {
    const memberData = getMemberData(options.memberId)
    const boyfriendName = options.customBoyfriendName || memberData.nameZh
    const persona = getRandomPersona(options.memberId)
    const identityData = {
      student: { money: 30, mood: 60, popularity: 10, lifeStability: 50 },
      fan: { money: 40, mood: 70, popularity: 20, lifeStability: 40 },
      intern: { money: 35, mood: 50, popularity: 15, lifeStability: 55 },
      staff: { money: 45, mood: 55, popularity: 15, lifeStability: 60 },
      stylist: { money: 40, mood: 55, popularity: 20, lifeStability: 50 },
      translator: { money: 55, mood: 50, popularity: 15, lifeStability: 65 },
      volunteer: { money: 25, mood: 65, popularity: 5, lifeStability: 55 },
      parttime: { money: 20, mood: 45, popularity: 10, lifeStability: 35 },
      custom: { money: 35, mood: 55, popularity: 10, lifeStability: 45 }
    }
    const stats = identityData[options.identity]
    const storyOpening = getIdentityStory(options.identity)
    const initialBoyfriendMessages: ChatMessage[] = []
    if (storyOpening) {
      initialBoyfriendMessages.push({
        id: `msg_${Date.now()}_bf`,
        sender: 'boyfriend',
        senderName: boyfriendName,
        textKo: storyOpening.firstMessageKo,
        textZh: storyOpening.firstMessageZh,
        timestamp: Date.now() - 60000,
        isRead: false,
        isRecalled: false,
        emotion: 'anxious',
        category: 'sweet'
      })
    }

    const initialBestieMessages: ChatMessage[] = [{
      id: `msg_${Date.now()}_bestie`,
      sender: 'npc',
      senderName: options.bestieName || '智恩',
      textKo: '',
      textZh: `姐妹！你和${boyfriendName}怎么样了？快跟我说说！🤭`,
      timestamp: Date.now() - 30000,
      isRead: false,
      isRecalled: false,
      emotion: 'sweet',
      category: 'sweet'
    }]

    const boyfriendThread: ChatThread = {
      id: 'thread_boyfriend',
      participantName: boyfriendName,
      participantAvatar: memberData.avatar,
      messages: initialBoyfriendMessages,
      unreadCount: initialBoyfriendMessages.filter(m => !m.isRead).length,
      isPinned: true,
      isOnline: true,
      lastActive: '刚刚',
      relationship: '暧昧'
    }
    const bestieThread: ChatThread = {
      id: 'thread_bestie',
      participantName: options.bestieName || '智恩',
      participantAvatar: '👩',
      messages: initialBestieMessages,
      unreadCount: 1,
      isPinned: false,
      isOnline: true,
      lastActive: '5分钟前',
      relationship: '闺蜜'
    }
    const socialContent = getInitialSocialContent(boyfriendName, memberData.stageName)
    set({
      phase: 'playing',
      week: 1,
      day: 1,
      timeOfDay: 'morning',
      weather: '晴',
      player: {
        name: options.playerName,
        bestieName: options.bestieName || '智恩',
        age: options.playerAge,
        identity: options.identity,
        fanLevel: options.fanLevel,
        storyPace: options.storyPace,
        plotPreference: options.plotPreference,
        money: stats.money,
        mood: stats.mood,
        popularity: stats.popularity,
        lifeStability: stats.lifeStability,
        actionPoints: 3,
        mentalTags: []
      },
      maleLead: {
        memberId: options.memberId,
        name: boyfriendName,
        stageName: memberData.stageName,
        affection: 55,
        trust: 45,
        careerPressure: 30,
        relationshipStage: 'ambiguous',
        hiddenPersona: persona,
        emotionalState: 'neutral',
        memory: {
          playerAskedForPublic: 0,
          playerDeletedPhotoForHim: false,
          lastFightReason: '',
          unresolvedIssues: [],
          emotionalDebt: 0,
          promisedToMeet: false,
          playerProtectInCrisis: false,
          playerColdWarCount: 0,
          keyMemories: []
        }
      },
      kakaoTalk: {
        threads: [boyfriendThread, bestieThread],
        callLogs: []
      },
      instagram: socialContent.instagram,
      weverse: socialContent.weverse,
      naver: socialContent.naver,
      companyNotice: socialContent.companyNotice,
      dispatch: socialContent.dispatch,
      notifications: generateWeekNotifications({
        ...initialState,
        player: { ...initialState.player, name: options.playerName, money: stats.money, mood: stats.mood, popularity: stats.popularity, lifeStability: stats.lifeStability },
        maleLead: {
          ...initialState.maleLead,
          memberId: options.memberId,
          name: boyfriendName,
          stageName: memberData.stageName,
          affection: memberData.initialAffection,
          trust: memberData.initialTrust,
          hiddenPersona: persona
        }
      }),
      hiddenRisk: {
        paparazziHeat: 0,
        lovestagramScore: 0,
        coupleItemScore: 0,
        timelineOverlap: 0,
        possessiveness: 15,
        rumorCredibility: 0,
        insiderLeakRisk: 0,
      },
      clueLedger: [],
      fandomStage: 'none' as FandomStage,
      paparazziStage: 'observing' as PaparazziStage,
      delayedEchoes: [],
    })
  },

  advanceWeek: () => {
    const state = get()
    const weekStartUpdates = processWeekStart(state)
    const weekEndUpdates = processWeekEnd(state)
    const newWeek = state.week + 1
    const newPhase = determineNarrativePhase(newWeek)
    const newRelationshipStage = determineRelationshipStage(state.maleLead.affection)
    const { state: afterDelayed } = processDelayedConsequences({ ...state, ...weekEndUpdates, week: newWeek })
    const mainEvent = generateMainEvent(afterDelayed)
    const specialEvent = checkSpecialTriggers(afterDelayed)
    const newNotifications = generateWeekNotifications(afterDelayed)
    const fanTimeline = generateFanTimeline(afterDelayed)
    set({
      ...afterDelayed,
      ...weekStartUpdates,
      week: newWeek,
      day: 1,
      timeOfDay: 'morning',
      narrativePhase: newPhase,
      maleLead: {
        ...(weekStartUpdates.maleLead || afterDelayed.maleLead),
        relationshipStage: newRelationshipStage
      },
      notifications: [...afterDelayed.notifications, ...newNotifications],
      weverse: {
        ...afterDelayed.weverse,
        timeline: fanTimeline ? [...afterDelayed.weverse.timeline, fanTimeline] : afterDelayed.weverse.timeline
      },
      currentChapter: Math.floor(newWeek / 4) + 1
    })
  },

  advanceDay: () => {
    const state = get()
    const dayOrder: GameState['timeOfDay'][] = ['morning', 'afternoon', 'evening', 'night']
    const currentIdx = dayOrder.indexOf(state.timeOfDay)
    if (currentIdx < 3) {
      set({ timeOfDay: dayOrder[currentIdx + 1] })
    } else {
      const newDay = state.day + 1
      if (newDay > 7) {
        get().advanceWeek()
      } else {
        set({ day: newDay, timeOfDay: 'morning' })
      }
    }
  },

  sendMessage: (threadId, textKo, textZh) => {
    const state = get()
    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'player',
      senderName: state.player.name,
      textKo,
      textZh,
      timestamp: Date.now(),
      isRead: false,
      isRecalled: false,
      emotion: 'neutral'
    }
    set({
      kakaoTalk: {
        ...state.kakaoTalk,
        threads: state.kakaoTalk.threads.map(t =>
          t.id === threadId
            ? { ...t, messages: [...t.messages, message] }
            : t
        )
      }
    })
  },

  receiveMessage: (threadId, message) => {
    const state = get()
    set({
      kakaoTalk: {
        ...state.kakaoTalk,
        threads: state.kakaoTalk.threads.map(t =>
          t.id === threadId
            ? {
                ...t,
                messages: [...t.messages, message],
                unreadCount: t.unreadCount + 1
              }
            : t
        )
      }
    })
  },

  postInstagram: (post) => {
    const state = get()
    const targetList = post.contentType === 'story' ? 'stories' : 'posts'
    set({
      instagram: {
        ...state.instagram,
        [targetList]: [...state.instagram[targetList], post]
      }
    })
  },

  deleteInstagramPost: (postId) => {
    const state = get()
    set({
      instagram: {
        ...state.instagram,
        posts: state.instagram.posts.map(p =>
          p.id === postId ? { ...p, isDeleted: true } : p
        ),
        stories: state.instagram.stories.map(s =>
          s.id === postId ? { ...s, isDeleted: true } : s
        )
      },
      risk: {
        ...state.risk,
        fanSuspicion: Math.min(100, state.risk.fanSuspicion + 3)
      }
    })
  },

  addNotification: (notification) => {
    const state = get()
    set({
      notifications: [...state.notifications, notification]
    })
  },

  markNotificationRead: (notificationId) => {
    const state = get()
    set({
      notifications: state.notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    })
  },

  openApp: (app) => set({ currentApp: app }),

  closeApp: () => set({ currentApp: null }),

  openChat: (threadId) => {
    if (!threadId) {
      set({ currentChatThreadId: '' })
      return
    }
    const state = get()
    const threads = state.kakaoTalk.threads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          unreadCount: 0,
          messages: t.messages.map(m => ({ ...m, isRead: true }))
        }
      }
      return t
    })
    set({
      currentChatThreadId: threadId,
      kakaoTalk: { ...state.kakaoTalk, threads }
    })
  },

  updateStats: (changes) => {
    const state = get()
    let updated = { ...state }
    if (changes.affection !== undefined) {
      updated = { ...updated, maleLead: { ...updated.maleLead, affection: Math.max(0, Math.min(100, updated.maleLead.affection + changes.affection)) } }
    }
    if (changes.trust !== undefined) {
      updated = { ...updated, maleLead: { ...updated.maleLead, trust: Math.max(0, Math.min(100, updated.maleLead.trust + changes.trust)) } }
    }
    if (changes.mood !== undefined) {
      updated = { ...updated, player: { ...updated.player, mood: Math.max(0, Math.min(100, updated.player.mood + changes.mood)) } }
    }
    if (changes.secrecy !== undefined) {
      updated = { ...updated, risk: { ...updated.risk, secrecy: Math.max(0, Math.min(100, updated.risk.secrecy + changes.secrecy)) } }
    }
    if (changes.companyAlert !== undefined) {
      updated = { ...updated, risk: { ...updated.risk, companyAlert: Math.max(0, Math.min(100, updated.risk.companyAlert + changes.companyAlert)) } }
    }
    if (changes.fanSuspicion !== undefined) {
      updated = { ...updated, risk: { ...updated.risk, fanSuspicion: Math.max(0, Math.min(100, updated.risk.fanSuspicion + changes.fanSuspicion)) } }
    }
    if (changes.publicHeat !== undefined) {
      updated = { ...updated, risk: { ...updated.risk, publicHeat: Math.max(0, Math.min(100, updated.risk.publicHeat + changes.publicHeat)) } }
    }
    if (changes.careerPressure !== undefined) {
      updated = { ...updated, maleLead: { ...updated.maleLead, careerPressure: Math.max(0, Math.min(100, updated.maleLead.careerPressure + changes.careerPressure)) } }
    }
    if (changes.paparazziAttention !== undefined) {
      updated = { ...updated, risk: { ...updated.risk, paparazziAttention: Math.max(0, Math.min(100, updated.risk.paparazziAttention + changes.paparazziAttention)) } }
    }
    if (changes.popularity !== undefined) {
      updated = { ...updated, player: { ...updated.player, popularity: Math.max(0, Math.min(100, updated.player.popularity + changes.popularity)) } }
    }
    if (changes.lifeStability !== undefined) {
      updated = { ...updated, player: { ...updated.player, lifeStability: Math.max(0, Math.min(100, updated.player.lifeStability + changes.lifeStability)) } }
    }
    if (changes.money !== undefined) {
      updated = { ...updated, player: { ...updated.player, money: Math.max(0, updated.player.money + changes.money) } }
    }
    set(updated)
  },

  addHistoryEntry: (entry) => {
    const state = get()
    set({
      history: [
        ...state.history,
        {
          ...entry,
          id: `hist_${Date.now()}`,
          createdAt: Date.now()
        }
      ]
    })
  },

  addTrace: (trace) => {
    const state = get()
    set({
      traces: [
        ...state.traces,
        {
          ...trace,
          id: `trace_${Date.now()}`,
          createdAt: Date.now()
        }
      ]
    })
  },

  addDelayedConsequence: (consequence) => {
    const state = get()
    set({
      delayedConsequences: [
        ...state.delayedConsequences,
        {
          ...consequence,
          id: `dc_${Date.now()}`
        }
      ]
    })
  },

  triggerDelayedConsequences: () => {
    const state = get()
    const { state: updatedState } = processDelayedConsequences(state)
    set(updatedState)
  },

  updateEventChain: (chainId, updates) => {
    const state = get()
    set({
      eventChains: state.eventChains.map(ec =>
        ec.id === chainId ? { ...ec, ...updates } : ec
      )
    })
  },

  addEvidence: (evidence) => {
    const state = get()
    set({
      evidenceFragments: [...state.evidenceFragments, evidence],
      risk: {
        ...state.risk,
        evidenceCount: state.risk.evidenceCount + 1
      }
    })
  },

  addFanTimeline: (entry) => {
    const state = get()
    set({
      weverse: {
        ...state.weverse,
        timeline: [...state.weverse.timeline, entry]
      }
    })
  },

  updateBoyfriendMemory: (updates) => {
    const state = get()
    set({
      maleLead: {
        ...state.maleLead,
        memory: {
          ...state.maleLead.memory,
          ...updates
        }
      }
    })
  },

  saveGame: (name) => {
    const state = get()
    const id = `save_${Date.now()}`
    const { saves, isTyping, typingDuration, ...gameState } = state
    const saveData = {
      id,
      name,
      timestamp: Date.now(),
      week: state.week,
      day: state.day,
      maleLeadName: state.maleLead.name,
      screenshot: '',
    }
    try {
      localStorage.setItem(`riize_save_${id}`, JSON.stringify(gameState))
      const indexRaw = localStorage.getItem('riize_saves_index')
      const index: typeof saves = indexRaw ? JSON.parse(indexRaw) : []
      if (index.length >= 10) {
        const oldest = index.shift()
        if (oldest) {
          localStorage.removeItem(`riize_save_${oldest.id}`)
        }
      }
      const updatedIndex = [...index, saveData]
      localStorage.setItem('riize_saves_index', JSON.stringify(updatedIndex))
      set({ saves: updatedIndex })
    } catch {
      set({ saves: [...state.saves, saveData] })
    }
  },

  loadGame: (saveId) => {
    try {
      const raw = localStorage.getItem(`riize_save_${saveId}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        const currentSaves = get().saves
        set({
          ...parsed,
          hiddenRisk: parsed.hiddenRisk || initialState.hiddenRisk,
          clueLedger: parsed.clueLedger || [],
          fandomStage: parsed.fandomStage || 'none',
          paparazziStage: parsed.paparazziStage || 'observing',
          delayedEchoes: parsed.delayedEchoes || [],
          saves: currentSaves,
          isTyping: false,
          typingDuration: 0,
        })
      }
    } catch {}
  },

  deleteSave: (saveId) => {
    const state = get()
    try {
      localStorage.removeItem(`riize_save_${saveId}`)
      const updatedSaves = state.saves.filter((s) => s.id !== saveId)
      localStorage.setItem('riize_saves_index', JSON.stringify(updatedSaves))
      set({ saves: updatedSaves })
    } catch {}
  },

  getSaves: () => {
    try {
      const indexRaw = localStorage.getItem('riize_saves_index')
      if (indexRaw) {
        const index = JSON.parse(typeof indexRaw === 'string' ? indexRaw : '[]') as GameState['saves']
        set({ saves: index })
      }
    } catch {}
  },

  setRelationshipStatus: (status) => set({ relationshipStatus: status }),

  performAction: (actionId, payload) => {
    const state = get()
    const result = performPlayerAction(actionId, payload || {}, state)
    set(result.state)
    return result.feedback
  },

  answerCall: () => {
    const state = get()
    if (!state.pendingCall) return
    const callLog: CallLog = {
      id: `call_${Date.now()}`,
      with: state.pendingCall.callerName,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      duration: '0:00',
      status: 'answered',
      emotionalTone: 'sweet',
    }
    set({
      pendingCall: null,
      kakaoTalk: {
        ...state.kakaoTalk,
        callLogs: [callLog, ...state.kakaoTalk.callLogs],
      },
      maleLead: {
        ...state.maleLead,
        affection: Math.min(100, state.maleLead.affection + 3),
        trust: Math.min(100, state.maleLead.trust + 2),
      },
    })
  },

  rejectCall: () => {
    const state = get()
    if (!state.pendingCall) return
    const callLog: CallLog = {
      id: `call_${Date.now()}`,
      with: state.pendingCall.callerName,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      duration: '0:00',
      status: 'rejected',
      emotionalTone: 'cold',
    }
    set({
      pendingCall: null,
      kakaoTalk: {
        ...state.kakaoTalk,
        callLogs: [callLog, ...state.kakaoTalk.callLogs],
      },
      maleLead: {
        ...state.maleLead,
        affection: Math.max(0, state.maleLead.affection - 3),
      },
    })
  },

  dismissBanner: () => set({ showMessageBanner: null }),

  triggerIncomingCall: (callerName, callerAvatar) => {
    set({
      pendingCall: {
        callerName,
        callerAvatar,
        isRinging: true,
      },
    })
  },

  triggerMessageBanner: (threadId, senderName, preview, avatar) => {
    const state = get()
    if (state.currentChatThreadId === threadId) return
    set({
      showMessageBanner: {
        threadId,
        senderName,
        preview,
        avatar,
      },
    })
  },

  deleteThread: (threadId) => {
    const state = get()
    set({
      kakaoTalk: {
        ...state.kakaoTalk,
        threads: state.kakaoTalk.threads.filter((t) => t.id !== threadId),
      },
    })
  },

  setBestieName: (name) => {
    const state = get()
    set({
      player: {
        ...state.player,
        bestieName: name,
      },
      kakaoTalk: {
        ...state.kakaoTalk,
        threads: state.kakaoTalk.threads.map((t) =>
          t.id === 'thread_bestie'
            ? { ...t, participantName: name }
            : t
        ),
      },
    })
  },

  triggerSocialEvent: (platform, trigger) => {
    const state = get()
    const result = getTriggeredContent(trigger, state)
    if (!result) return
    if (result.platform === 'instagram') {
      const post = result.content as InstagramPost
      const targetList = post.contentType === 'story' ? 'stories' : 'posts'
      set({
        instagram: {
          ...state.instagram,
          [targetList]: [...state.instagram[targetList], post]
        }
      })
    } else if (result.platform === 'weverse') {
      set({
        weverse: {
          ...state.weverse,
          posts: [...state.weverse.posts, result.content]
        }
      })
    } else if (result.platform === 'naver') {
      set({
        naver: {
          ...state.naver,
          news: [...state.naver.news, result.content]
        }
      })
    } else if (result.platform === 'companyNotice') {
      set({
        companyNotice: {
          ...state.companyNotice,
          notices: [...state.companyNotice.notices, result.content]
        }
      })
    } else if (result.platform === 'dispatch') {
      set({
        dispatch: {
          ...state.dispatch,
          tips: [...state.dispatch.tips, result.content]
        }
      })
    }
  },

  addClue: (clue) => {
    const state = get()
    const newClue: Clue = {
      ...clue,
      id: `clue_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
      discovered: false,
      linkedClueIds: [],
    }
    set({ clueLedger: [...state.clueLedger, newClue] })
  },

  discoverClue: (clueId, discoveredBy) => {
    const state = get()
    set({
      clueLedger: state.clueLedger.map(c =>
        c.id === clueId ? { ...c, discovered: true, discoveredBy } : c
      ),
    })
  },

  updateHiddenRisk: (changes) => {
    const state = get()
    const updated = { ...state.hiddenRisk }
    for (const [key, value] of Object.entries(changes)) {
      if (key in updated) {
        (updated as any)[key] = Math.max(0, Math.min(100, (updated as any)[key] + value))
      }
    }
    set({ hiddenRisk: updated })
  },

  evaluateFandomStage: () => {
    const state = get()
    const hr = state.hiddenRisk
    const score = hr.lovestagramScore
      + hr.coupleItemScore * 0.8
      + hr.timelineOverlap * 0.9
      + state.risk.evidenceCount * 6
    let stage: FandomStage = 'none'
    if (score > 180) stage = 'confirmed_crisis'
    else if (score > 135) stage = 'public_controversy'
    else if (score > 95) stage = 'expose_post'
    else if (score > 55) stage = 'small_talk'
    else if (score > 25) stage = 'familiar'
    if (stage !== state.fandomStage) {
      set({ fandomStage: stage })
    }
    return stage
  },

  evaluatePaparazziStage: () => {
    const state = get()
    const ph = state.hiddenRisk.paparazziHeat
    const to = state.hiddenRisk.timelineOverlap
    let stage: PaparazziStage = 'observing'
    if (ph >= 90) stage = 'expose'
    else if (ph >= 75) stage = 'preview'
    else if (ph >= 50 && to >= 30) stage = 'cross_referencing'
    else if (ph >= 30 && to >= 30) stage = 'following'
    if (stage !== state.paparazziStage) {
      set({ paparazziStage: stage })
    }
    return stage
  },

  addDelayedEcho: (echo) => {
    const state = get()
    set({ delayedEchoes: [...state.delayedEchoes, echo] })
  },

  processDelayedEchoes: () => {
    const state = get()
    const currentDay = (state.week - 1) * 7 + state.day
    const updated = state.delayedEchoes.map(e => {
      if (e.triggered) return e
      const echoDay = Math.floor(currentDay)
      if (echoDay >= e.afterDays) {
        return { ...e, triggered: true }
      }
      return e
    })
    set({ delayedEchoes: updated })
  },
}))
