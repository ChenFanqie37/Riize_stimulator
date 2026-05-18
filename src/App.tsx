import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { checkEndingConditions } from '@/data/endings'
import CoverScreen from '@/components/Game/CoverScreen'
import CharacterCreation from '@/components/Game/CharacterCreation'
import EndingScreen from '@/components/Game/EndingScreen'
import StatsPanel from '@/components/Game/StatsPanel'
import ActionPanel from '@/components/Game/ActionPanel'
import CrisisPanel from '@/components/Game/CrisisPanel'
import WeekSummary from '@/components/Game/WeekSummary'
import SaveLoadPanel from '@/components/Game/SaveLoadPanel'
import DateSystem from '@/components/Game/DateSystem'
import SettingsPanel from '@/components/Game/SettingsPanel'
import RelationshipGuide from '@/components/Game/RelationshipGuide'
import ModalQueue from '@/components/Common/ModalQueue'
import PhoneFrame from '@/components/Phone/PhoneFrame'
import HomeScreen from '@/components/Phone/HomeScreen'
import NotificationPanel from '@/components/Phone/NotificationPanel'
import IncomingCallUI from '@/components/Phone/IncomingCallUI'
import MessageBanner from '@/components/Phone/MessageBanner'
import KakaoTalk from '@/components/Apps/KakaoTalk'
import Instagram from '@/components/Apps/Instagram'
import Weverse from '@/components/Apps/Weverse'
import Naver from '@/components/Apps/Naver'
import CompanyNotice from '@/components/Apps/CompanyNotice'
import Dispatch from '@/components/Apps/Dispatch'
import Offline from '@/components/Apps/Offline'
import Calendar from '@/components/Apps/Calendar'
import Gallery from '@/components/Apps/Gallery'
import Notes from '@/components/Apps/Notes'
import Health from '@/components/Apps/Health'
import StoryProgression from '@/components/Game/StoryProgression'
import DailyIncidentModal from '@/components/Game/DailyIncidentModal'
import NarrativeMode from '@/components/Game/NarrativeMode'
import { BarChart3, Zap, FastForward, FolderOpen, Settings, Bell, BookOpen, Heart, SkipForward, Key, ScrollText } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'

function AppContent() {
  const phase = useGameStore((s) => s.phase)
  const navigate = useNavigate()

  useEffect(() => {
    switch (phase) {
      case 'cover':
        navigate('/')
        break
      case 'creation':
        navigate('/create')
        break
      case 'playing':
        navigate('/game')
        break
      case 'ending':
        navigate('/ending')
        break
    }
  }, [phase, navigate])

  return (
    <Routes>
      <Route path="/" element={<CoverScreen />} />
      <Route path="/create" element={<CharacterCreation />} />
      <Route path="/game" element={<GameScreen />} />
      <Route path="/ending" element={<EndingRoute />} />
    </Routes>
  )
}

function EndingRoute() {
  const state = useGameStore()
  const setPhase = useGameStore((s) => s.setPhase)

  const endingState = {
    affection: state.maleLead.affection,
    trust: state.maleLead.trust,
    careerPressure: state.maleLead.careerPressure,
    publicHeat: state.risk.publicHeat,
    companyAlert: state.risk.companyAlert,
    fanSuspicion: state.risk.fanSuspicion,
    secrecy: state.risk.secrecy,
    paparazziAttention: state.risk.paparazziAttention,
    evidenceCount: state.risk.evidenceCount,
    mood: state.player.mood,
    popularity: state.player.popularity,
    lifeStability: state.player.lifeStability,
    money: state.player.money,
    mentalHealth: state.health.mentalHealth,
    stress: state.health.stress,
    week: state.week,
    relationshipStage: state.maleLead.relationshipStage,
    narrativePhase: state.narrativePhase,
    hiddenPersona: state.maleLead.hiddenPersona,
    identity: state.player.identity,
    jealousy: 50,
    dependency: 50,
    npc_intimacy_childhood_friend: 50,
  }

  const ending = checkEndingConditions(endingState as unknown as Record<string, number>)

  if (!ending) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#F2F2F7' }}>
        <div className="text-center">
          <p className="text-[#8E8E93] text-lg mb-4">故事尚未结束...</p>
          <button
            onClick={() => setPhase('playing')}
            className="px-6 py-2 rounded-full text-sm font-bold"
            style={{ background: '#007AFF', color: 'white' }}
          >
            返回游戏
          </button>
        </div>
      </div>
    )
  }

  return <EndingScreen ending={ending} />
}

function GameScreen() {
  const state = useGameStore()
  const currentApp = useGameStore((s) => s.currentApp)
  const [statsOpen, setStatsOpen] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showWeekSummary, setShowWeekSummary] = useState(false)
  const [showCrisis, setShowCrisis] = useState(false)
  const [saveLoadOpen, setSaveLoadOpen] = useState(false)
  const [dateSystemOpen, setDateSystemOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [storyProgressionOpen, setStoryProgressionOpen] = useState(true)
  const [narrativeModeOpen, setNarrativeModeOpen] = useState(false)
  const [relationshipGuideOpen, setRelationshipGuideOpen] = useState(false)
  const [daysSinceLastDate, setDaysSinceLastDate] = useState(0)
  const [dailyIncidentOpen, setDailyIncidentOpen] = useState(false)
  const [lastIncidentKey, setLastIncidentKey] = useState('')
  const hasApiKey = useSettingsStore((s) => s.hasApiKey)
  const [showApiKeyGuide, setShowApiKeyGuide] = useState(false)

  useEffect(() => {
    if (!hasApiKey()) {
      setShowApiKeyGuide(true)
    }
  }, [])

  const crisisLevel = Math.floor(state.risk.publicHeat / 20)

  useEffect(() => {
    if (crisisLevel > 2 && !showCrisis) {
      setShowCrisis(true)
    }
  }, [crisisLevel])

  useEffect(() => {
    const key = `${state.week}-${state.day}`
    if (key !== lastIncidentKey) {
      setLastIncidentKey(key)
      setDailyIncidentOpen(true)
    }
  }, [state.week, state.day, lastIncidentKey])

  const closeAllPanels = () => {
    setStatsOpen(false)
    setActionsOpen(false)
    setNotificationsOpen(false)
    setSaveLoadOpen(false)
    setDateSystemOpen(false)
    setSettingsOpen(false)
    setStoryProgressionOpen(false)
    setNarrativeModeOpen(false)
    setRelationshipGuideOpen(false)
  }

  const openPanel = (panel: 'stats' | 'actions' | 'notifications' | 'saveLoad' | 'dateSystem' | 'settings' | 'storyProgression' | 'relationshipGuide') => {
    closeAllPanels()
    switch (panel) {
      case 'stats': setStatsOpen(true); break
      case 'actions': setActionsOpen(true); break
      case 'notifications': setNotificationsOpen(true); break
      case 'saveLoad': setSaveLoadOpen(true); break
      case 'dateSystem': setDateSystemOpen(true); break
      case 'settings': setSettingsOpen(true); break
      case 'storyProgression': setStoryProgressionOpen(true); break
      case 'relationshipGuide': setRelationshipGuideOpen(true); break
    }
  }

  const handleActionSelect = (actionId: string) => {
    if (actionId === 'request_meet') {
      closeAllPanels()
      setDateSystemOpen(true)
      setDaysSinceLastDate(0)
    }
  }

  const renderCurrentApp = () => {
    if (!currentApp) return <HomeScreen />

    switch (currentApp) {
      case 'kakaoTalk': return <KakaoTalk />
      case 'instagram': return <Instagram />
      case 'weverse': return <Weverse />
      case 'naver': return <Naver />
      case 'companyNotice': return <CompanyNotice />
      case 'dispatch': return <Dispatch />
      case 'offline': return <Offline />
      case 'calendar': return <Calendar />
      case 'gallery': return <Gallery />
      case 'notes': return <Notes />
      case 'health': return <Health />
      default: return <HomeScreen />
    }
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: '#F2F2F7' }}
    >
      <div className="flex items-center gap-4">
        <PhoneFrame>
          <div className="relative h-full">
            <MessageBanner />
            {renderCurrentApp()}
            <NotificationPanel
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
            <IncomingCallUI />
          </div>
        </PhoneFrame>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-2 px-4 py-3"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <button
          onClick={() => statsOpen ? closeAllPanels() : openPanel('stats')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            background: statsOpen ? 'rgba(34,211,238,0.15)' : 'rgba(0,0,0,0.03)',
            border: statsOpen ? '1px solid rgba(34,211,238,0.3)' : '1px solid rgba(0,0,0,0.06)',
            color: statsOpen ? '#22d3ee' : 'rgba(28,28,30,0.5)',
          }}
        >
          <BarChart3 size={14} />
          状态
        </button>

        <button
          onClick={() => relationshipGuideOpen ? closeAllPanels() : openPanel('relationshipGuide')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            background: relationshipGuideOpen ? 'rgba(255,45,120,0.15)' : 'rgba(0,0,0,0.03)',
            border: relationshipGuideOpen ? '1px solid rgba(255,45,120,0.3)' : '1px solid rgba(0,0,0,0.06)',
            color: relationshipGuideOpen ? '#ff6b9d' : 'rgba(28,28,30,0.5)',
          }}
        >
          <Heart size={14} />
          关系
        </button>

        <button
          onClick={() => actionsOpen ? closeAllPanels() : openPanel('actions')}
          className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            background: actionsOpen ? 'rgba(255,45,120,0.15)' : 'rgba(0,0,0,0.03)',
            border: actionsOpen ? '1px solid rgba(255,45,120,0.3)' : '1px solid rgba(0,0,0,0.06)',
            color: actionsOpen ? '#ff6b9d' : 'rgba(28,28,30,0.5)',
          }}
        >
          <Zap size={14} />
          行动
          {daysSinceLastDate >= 3 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-pink-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => notificationsOpen ? closeAllPanels() : openPanel('notifications')}
          className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            background: notificationsOpen ? 'rgba(234,179,8,0.15)' : 'rgba(0,0,0,0.03)',
            border: notificationsOpen ? '1px solid rgba(234,179,8,0.3)' : '1px solid rgba(0,0,0,0.06)',
            color: notificationsOpen ? '#eab308' : 'rgba(28,28,30,0.5)',
          }}
        >
          <Bell size={14} />
          通知
          {state.notifications.filter(n => !n.isRead).length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">
              {state.notifications.filter(n => !n.isRead).length}
            </span>
          )}
        </button>

        <button
          onClick={() => { state.advanceDay(); setDaysSinceLastDate(prev => prev + 1); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            background: 'rgba(0,122,255,0.06)',
            border: '1px solid rgba(0,122,255,0.15)',
            color: 'rgba(0,122,255,0.8)',
          }}
        >
          <SkipForward size={14} />
          下一天
        </button>

        <button
          onClick={() => storyProgressionOpen ? closeAllPanels() : openPanel('storyProgression')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            background: storyProgressionOpen ? 'rgba(168,85,247,0.15)' : 'rgba(0,0,0,0.03)',
            border: storyProgressionOpen ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(0,0,0,0.06)',
            color: storyProgressionOpen ? '#c084fc' : 'rgba(28,28,30,0.5)',
          }}
        >
          <BookOpen size={14} />
          剧情
        </button>

        <button
          onClick={() => {
            closeAllPanels()
            setNarrativeModeOpen(true)
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            background: narrativeModeOpen ? 'rgba(14,165,233,0.15)' : 'rgba(0,0,0,0.03)',
            border: narrativeModeOpen ? '1px solid rgba(14,165,233,0.3)' : '1px solid rgba(0,0,0,0.06)',
            color: narrativeModeOpen ? '#0ea5e9' : 'rgba(28,28,30,0.5)',
          }}
        >
          <ScrollText size={14} />
          文游
        </button>

        <button
          onClick={() => setShowWeekSummary(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.06)',
            color: 'rgba(28,28,30,0.5)',
          }}
        >
          <FastForward size={14} />
          下一周
        </button>

        <button
          onClick={() => saveLoadOpen ? closeAllPanels() : openPanel('saveLoad')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            background: saveLoadOpen ? 'rgba(59,130,246,0.15)' : 'rgba(0,0,0,0.03)',
            border: saveLoadOpen ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(0,0,0,0.06)',
            color: saveLoadOpen ? '#3b82f6' : 'rgba(28,28,30,0.5)',
          }}
        >
          <FolderOpen size={14} />
          存档
        </button>

        <button
          onClick={() => settingsOpen ? closeAllPanels() : openPanel('settings')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            background: settingsOpen ? 'rgba(168,85,247,0.15)' : 'rgba(0,0,0,0.03)',
            border: settingsOpen ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(0,0,0,0.06)',
            color: settingsOpen ? '#a855f7' : 'rgba(28,28,30,0.5)',
          }}
        >
          <Settings size={14} />
          设置
        </button>
      </div>

      <StatsPanel isOpen={statsOpen} onClose={() => setStatsOpen(false)} />
      <RelationshipGuide isOpen={relationshipGuideOpen} onClose={() => setRelationshipGuideOpen(false)} />
      <ActionPanel isOpen={actionsOpen} onClose={() => setActionsOpen(false)} onActionSelect={handleActionSelect} />

      {showCrisis && crisisLevel > 2 && (
        <CrisisPanel onClose={() => setShowCrisis(false)} />
      )}

      {showWeekSummary && (
        <WeekSummary onContinue={() => setShowWeekSummary(false)} />
      )}

      <SaveLoadPanel isOpen={saveLoadOpen} onClose={() => setSaveLoadOpen(false)} />
      <DateSystem isOpen={dateSystemOpen} onClose={() => setDateSystemOpen(false)} />
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <StoryProgression
        isOpen={storyProgressionOpen}
        onClose={() => setStoryProgressionOpen(false)}
        onOpenNarrativeMode={() => {
          setStoryProgressionOpen(false)
          setNarrativeModeOpen(true)
        }}
      />
      <NarrativeMode isOpen={narrativeModeOpen} onClose={() => setNarrativeModeOpen(false)} />
      <DailyIncidentModal
        isOpen={dailyIncidentOpen}
        onClose={() => setDailyIncidentOpen(false)}
        onRequestDate={() => {
          closeAllPanels()
          setDateSystemOpen(true)
          setDaysSinceLastDate(0)
        }}
      />
      <ModalQueue />

      {showApiKeyGuide && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.08)' }}
              >
                <Key size={20} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <h3 className="text-[#1C1C1E] font-bold text-sm">配置 API 密钥</h3>
                <p className="text-[#8E8E93] text-[10px]">AI聊天功能需要API密钥才能运行</p>
              </div>
            </div>

            <div
              className="p-3 rounded-xl mb-4 text-xs leading-relaxed"
              style={{
                background: 'rgba(245,158,11,0.06)',
                  border: '1px solid rgba(245,158,11,0.12)',
                  color: 'rgba(28,28,30,0.7)',
              }}
            >
              <p className="mb-2">🔑 本游戏使用 DeepSeek AI 驱动聊天功能</p>
              <p className="mb-2">📱 获取密钥步骤：</p>
              <ol className="list-decimal list-inside space-y-1 text-[#8E8E93]">
                <li>访问 <span className="text-amber-400">platform.deepseek.com</span></li>
                <li>注册/登录账号</li>
                <li>进入 API Keys 页面</li>
                <li>创建新密钥并复制</li>
                <li>粘贴到下方输入框</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowApiKeyGuide(false)
                  setSettingsOpen(true)
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(245,158,11,0.2)',
                }}
              >
                去设置密钥
              </button>
              <button
                onClick={() => setShowApiKeyGuide(false)}
                className="px-4 py-2.5 rounded-xl text-xs transition-all"
                style={{
                  background: 'rgba(0,0,0,0.03)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  color: 'rgba(28,28,30,0.4)',
                }}
              >
                稍后再说
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
