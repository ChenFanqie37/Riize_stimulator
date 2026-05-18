export type RIIZEMember = 'shotaro' | 'eunseok' | 'sungchan' | 'wonbin' | 'sohee' | 'anton'
export type PlayerIdentity = 'student' | 'fan' | 'intern' | 'staff' | 'stylist' | 'translator' | 'volunteer' | 'parttime' | 'custom'
export type BoyfriendPersona = 'true_love' | 'career_freak' | 'avoidant' | 'central_ac' | 'playboy' | 'narcissist' | 'secret_trauma'
export type RelationshipStage = 'stranger' | 'impression' | 'interest' | 'ambiguous' | 'confirmed' | 'passionate' | 'trial'
export type MentalTag = 'insecure' | 'jealous' | 'exhausted' | 'obsessive' | 'numb' | 'angry' | 'clearheaded' | 'dependent' | 'suspicious' | 'heartbroken'
export type FanLevel = 'hard_fan' | 'casual' | 'neutral' | 'returning' | 'solo_stan'
export type StoryPace = 'slow_burn' | 'standard' | 'high_pressure' | 'growth' | 'ensemble'
export type PlotPreference = 'A' | 'B' | 'C' | 'D'
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'
export type NarrativePhase = '起' | '承' | '转' | '合'
export type AppName = 'kakaoTalk' | 'instagram' | 'weverse' | 'naver' | 'companyNotice' | 'dispatch' | 'calendar' | 'gallery' | 'notes' | 'health'
export type RelationshipStatus = 'normal' | 'cold_war' | 'cooling_off' | 'crisis'
export type EmotionLabel = 'sweet' | 'cold' | 'anxious' | 'jealous' | 'guilty' | 'avoidant' | 'angry' | 'vulnerable' | 'neutral'
export type PostType = 'story' | 'post' | 'reel'
export type Visibility = 'public' | 'friends' | 'private' | 'close_friends'
export type WeversePostType = 'sugar' | 'analysis' | 'breakdown' | 'control' | 'conspiracy' | 'anti' | 'fansite' | 'timeline'
export type NoticeLevel = 'gentle' | 'warning' | 'summon' | 'contract' | 'silence'
export type CrisisLevel = 1 | 2 | 3 | 4 | 5
export type EventType = 'daily' | 'romance' | 'work' | 'fan' | 'company' | 'economy' | 'collab' | 'crisis' | 'growth' | 'music'

export interface Player {
  name: string
  bestieName: string
  age: number
  identity: PlayerIdentity
  fanLevel: FanLevel
  storyPace: StoryPace
  plotPreference: PlotPreference
  money: number
  mood: number
  popularity: number
  lifeStability: number
  actionPoints: number
  mentalTags: MentalTag[]
}

export interface MaleLead {
  memberId: RIIZEMember
  name: string
  stageName: string
  affection: number
  trust: number
  careerPressure: number
  relationshipStage: RelationshipStage
  hiddenPersona: BoyfriendPersona
  emotionalState: string
  memory: BoyfriendMemory
}

export interface BoyfriendMemory {
  playerAskedForPublic: number
  playerDeletedPhotoForHim: boolean
  lastFightReason: string
  unresolvedIssues: string[]
  emotionalDebt: number
  promisedToMeet: boolean
  playerProtectInCrisis: boolean
  playerColdWarCount: number
  keyMemories: string[]
}

export interface Risk {
  secrecy: number
  companyAlert: number
  publicHeat: number
  fanSuspicion: number
  paparazziAttention: number
  evidenceCount: number
}

export interface NPC {
  id: string
  role: string
  name: string
  intimacy: number
  suspicion: number
  trust: number
  memoryTags: string[]
  avatar: string
}

export type MessageCategory = 'sweet' | 'emotional' | 'warning' | 'call_record' | 'system'

export interface ChatMessage {
  id: string
  sender: 'player' | 'boyfriend' | 'npc'
  senderName: string
  textKo: string
  textZh: string
  timestamp: number
  isRead: boolean
  isRecalled: boolean
  emotion?: EmotionLabel
  isTyping?: boolean
  isVoice?: boolean
  voiceDuration?: string
  category?: MessageCategory
}

export interface ChatThread {
  id: string
  participantName: string
  participantAvatar: string
  messages: ChatMessage[]
  unreadCount: number
  isPinned: boolean
  isOnline: boolean
  lastActive: string
  relationship: string
}

export interface CallLog {
  id: string
  with: string
  time: string
  duration: string
  status: 'answered' | 'missed' | 'rejected'
  emotionalTone: string
}

export interface InstagramPost {
  id: string
  author: 'player' | 'boyfriend' | 'teammate' | 'female_artist' | 'brand'
  authorName: string
  contentType: PostType
  text: string
  imageTags: string[]
  location?: string
  visibility: Visibility
  riskScore: number
  likes: number
  comments: InstagramComment[]
  views: number
  isDeleted: boolean
  isScreenshotted: boolean
  screenshottedBy: string[]
  boyfriendViewed: boolean
  createdAt: number
  expiresAt?: number
}

export interface InstagramComment {
  id: string
  author: string
  text: string
  isSuspicious: boolean
}

export interface InstagramDraft {
  postType: PostType
  category: string
  caption: string
  visibility: Visibility
  showLocation: boolean
  sourcePhotoId?: string
  reason: string
}

export interface WeversePost {
  id: string
  type: WeversePostType
  author: string
  title: string
  content: string
  heat: number
  comments: number
  isPlayerAlt: boolean
  relatedEvidenceIds: string[]
  createdAt: number
}

export interface NaverNews {
  id: string
  title: string
  summary: string
  source: string
  heat: number
  relatedSearchWords: string[]
  createdAt: number
}

export interface CompanyNotice {
  id: string
  level: NoticeLevel
  title: string
  content: string
  isRead: boolean
  createdAt: number
}

export interface DispatchTip {
  id: string
  type: 'clue' | 'blur_photo' | 'countdown' | 'dm_threat' | 'official_expose'
  content: string
  heatLevel: number
  createdAt: number
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: 'player' | 'boyfriend' | 'shared'
  isHighRisk: boolean
  isCompleted: boolean
}

export interface GalleryPhoto {
  id: string
  title: string
  description: string
  riskLevel: 'low' | 'medium' | 'high'
  source: string
  isHidden: boolean
  isDeleted: boolean
  isDiscoveredByFans: boolean
  relatedEventChainId?: string
  createdAt: number
}

export interface NoteEntry {
  id: string
  title: string
  content: string
  type: 'diary' | 'lyrics' | 'crisis' | 'plan'
  createdAt: number
}

export interface HealthState {
  sleep: number
  stress: number
  mentalHealth: number
}

export interface EventChain {
  id: string
  title: string
  currentStage: number
  totalStages: number
  stages: EventChainStage[]
  isActive: boolean
  isCompleted: boolean
}

export interface EventChainStage {
  title: string
  description: string
  triggerCondition: string
  choices: EventChoice[]
  consequences: Record<string, number>
}

export interface EventChoice {
  id: string
  text: string
  riskPreview: string
  statChanges: Record<string, number>
  nextStage?: number
  tags?: string[]
}

export interface DelayedConsequence {
  id: string
  triggerRound: number
  type: string
  eventId: string
  content: string
  statChanges: Record<string, number>
  isTriggered: boolean
}

export interface EvidenceFragment {
  id: string
  title: string
  source: string
  riskLevel: number
  description: string
  discoveredByFans: boolean
  canDelete: boolean
  relatedEventChainId: string
  createdAt: number
}

export interface FanTimelineEntry {
  id: string
  title: string
  entries: { time: string; content: string }[]
  heat: number
  createdAt: number
}

export interface Trace {
  id: string
  type: string
  description: string
  round: number
  appId: string
  screenshotBeforeDelete: boolean
  createdAt: number
}

export interface HistoryEntry {
  id: string
  week: number
  day: number
  event: string
  choice: string
  consequences: Record<string, number>
  memoryTags: string[]
  createdAt: number
}

export interface GameEvent {
  id: string
  type: EventType
  title: string
  description: string
  choices: EventChoice[]
  condition?: string
  chapter?: number
}

export interface Notification {
  id: string
  app: AppName
  title: string
  content: string
  urgency: 'low' | 'medium' | 'high'
  isRead: boolean
  createdAt: number
}

export interface AppAccount {
  app: AppName
  displayName: string
  handle: string
  avatar: string
  persona: string
  accountType: 'main' | 'alt' | 'anonymous' | 'official' | 'private'
  followers: number
  riskNote: string
  isAnonymous: boolean
}

export interface SaveData {
  id: string
  name: string
  timestamp: number
  week: number
  day: number
  maleLeadName: string
  screenshot: string
}

export type ClueType = 'location' | 'time' | 'item' | 'reflection' | 'voice' | 'caption' | 'color' | 'handwriting' | 'background' | 'schedule'
export type ClueVisibleTo = 'fans' | 'company' | 'paparazzi' | 'boyfriend' | 'bestFriend'
export type FandomStage = 'none' | 'familiar' | 'small_talk' | 'expose_post' | 'public_controversy' | 'confirmed_crisis'
export type PaparazziStage = 'observing' | 'following' | 'cross_referencing' | 'preview' | 'expose'

export interface Clue {
  id: string
  day: number
  week: number
  sourceApp: AppName
  clueType: ClueType
  visibleTo: ClueVisibleTo[]
  tags: string[]
  severity: 1 | 2 | 3 | 4 | 5
  discovered: boolean
  discoveredBy?: 'fans' | 'company' | 'paparazzi'
  linkedClueIds: string[]
  description: string
  createdAt: number
}

export interface HiddenRisk {
  paparazziHeat: number
  lovestagramScore: number
  coupleItemScore: number
  timelineOverlap: number
  possessiveness: number
  rumorCredibility: number
  insiderLeakRisk: number
}

export interface DelayedEcho {
  afterDays: number
  app: string
  eventId: string
  condition?: string
  triggered?: boolean
}

export interface GameState {
  phase: 'cover' | 'creation' | 'playing' | 'ending'
  week: number
  day: number
  timeOfDay: TimeOfDay
  weather: string
  player: Player
  maleLead: MaleLead
  risk: Risk
  npcs: NPC[]
  kakaoTalk: {
    threads: ChatThread[]
    callLogs: CallLog[]
  }
  instagram: {
    posts: InstagramPost[]
    stories: InstagramPost[]
    dms: ChatMessage[]
  }
  pendingInstagramDraft: InstagramDraft | null
  weverse: {
    posts: WeversePost[]
    timeline: FanTimelineEntry[]
  }
  naver: {
    news: NaverNews[]
    searchHistory: string[]
  }
  companyNotice: {
    notices: CompanyNotice[]
  }
  dispatch: {
    tips: DispatchTip[]
  }
  calendar: {
    events: CalendarEvent[]
  }
  gallery: {
    photos: GalleryPhoto[]
  }
  notes: {
    entries: NoteEntry[]
  }
  health: HealthState
  eventChains: EventChain[]
  delayedConsequences: DelayedConsequence[]
  evidenceFragments: EvidenceFragment[]
  traces: Trace[]
  history: HistoryEntry[]
  memoryTags: string[]
  currentChapter: number
  narrativePhase: NarrativePhase
  relationshipStatus: RelationshipStatus
  notifications: Notification[]
  appAccounts: Record<AppName, AppAccount>
  currentApp: AppName | null
  currentChatThreadId: string | null
  saves: SaveData[]
  isTyping: boolean
  typingDuration: number
  pendingCall: {
    callerName: string
    callerAvatar: string
    isRinging: boolean
  } | null
  showMessageBanner: {
    threadId: string
    senderName: string
    preview: string
    avatar: string
  } | null
  hiddenRisk: HiddenRisk
  clueLedger: Clue[]
  fandomStage: FandomStage
  paparazziStage: PaparazziStage
  delayedEchoes: DelayedEcho[]
}

export interface LLMResponse {
  messageKo: string
  messageZh: string
  emotion: EmotionLabel
  intent: string
  statChanges: Record<string, number>
  possibleTrigger: string
}

export interface PlayerAction {
  id: string
  label: string
  description: string
  riskPreview: string
  availableCondition?: string
  immediateEffect: Record<string, number>
  visibleTrace: {
    app: string
    type: string
    canBeDeleted: boolean
    canBeScreenshotted: boolean
  }
  npcReaction: string[]
  delayedConsequences: DelayedConsequence[]
  eventChainTags: string[]
}

export interface Ending {
  id: string
  type: 'HE' | 'OE' | 'BE' | 'SE' | 'GE'
  title: string
  description: string
  condition: string
  phoneDisplay: string
}
