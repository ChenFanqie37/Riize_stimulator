import {
  MessageCircle,
  Camera,
  Heart,
  Search,
  Briefcase,
  Eye,
  Calendar,
  Image,
  FileText,
  Activity,
  BarChart3,
  Zap,
  MapPinned,
} from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { AppName } from '@/types/game'
import type { LucideIcon } from 'lucide-react'

interface AppItem {
  id: AppName | 'stats' | 'actions'
  name: string
  icon: LucideIcon
  color: string
  gradient?: string
}

const apps: AppItem[] = [
  { id: 'kakaoTalk', name: 'KakaoTalk', icon: MessageCircle, color: '#FEE500' },
  { id: 'instagram', name: 'Instagram', icon: Camera, color: '#E4405F', gradient: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)' },
  { id: 'weverse', name: 'Weverse', icon: Heart, color: '#00C3FF' },
  { id: 'naver', name: 'Naver', icon: Search, color: '#03C75A' },
  { id: 'companyNotice', name: 'Company', icon: Briefcase, color: '#EF4444' },
  { id: 'dispatch', name: 'Dispatch', icon: Eye, color: '#F97316' },
  { id: 'offline', name: '线下', icon: MapPinned, color: '#0EA5E9' },
  { id: 'calendar', name: 'Calendar', icon: Calendar, color: '#FFFFFF' },
  { id: 'gallery', name: 'Gallery', icon: Image, color: '#A855F7' },
  { id: 'notes', name: 'Notes', icon: FileText, color: '#D4C5A9' },
  { id: 'health', name: 'Health', icon: Activity, color: '#4ADE80' },
  { id: 'stats', name: 'Stats', icon: BarChart3, color: '#22D3EE' },
  { id: 'actions', name: 'Actions', icon: Zap, color: '#EC4899' },
]

const dockApps = ['kakaoTalk', 'instagram', 'weverse', 'naver'] as const

function getUnreadCount(appId: AppName | 'stats' | 'actions', state: ReturnType<typeof useGameStore.getState>): number {
  const appNotifications = appId !== 'stats' && appId !== 'actions'
    ? state.notifications.filter((n) => n.app === appId && !n.isRead).length
    : 0
  switch (appId) {
    case 'kakaoTalk':
      return state.kakaoTalk.threads.reduce((sum, t) => sum + t.unreadCount, 0) + appNotifications
    case 'instagram':
      return state.instagram.dms.filter((m) => !m.isRead).length + appNotifications
    case 'weverse':
      return appNotifications
    case 'naver':
      return appNotifications
    case 'companyNotice':
      return state.companyNotice.notices.filter((n) => !n.isRead).length + appNotifications
    case 'dispatch':
      return appNotifications
    case 'offline':
      return appNotifications
    case 'calendar':
      return appNotifications
    case 'gallery':
      return appNotifications
    case 'notes':
      return appNotifications
    case 'health':
      return state.health.stress > 60 ? Math.max(1, appNotifications) : appNotifications
    default:
      return 0
  }
}

export default function HomeScreen() {
  const openApp = useGameStore((s) => s.openApp)
  const state = useGameStore()

  const weather = state.weather
  const week = state.week
  const day = state.day
  const hour = String(state.hour ?? 8).padStart(2, '0')

  const handleAppClick = (appId: AppName | 'stats' | 'actions') => {
    if (appId !== 'stats' && appId !== 'actions') {
      openApp(appId as AppName)
    }
  }

  return (
    <div
      className="flex flex-col h-full relative"
      style={{
        background: '#F2F2F7',
      }}
    >
      <div className="flex flex-col items-center pt-6 pb-4 relative z-10">
        <p className="text-[#1C1C1E]/50 text-xs">
          Week {week} · Day {day} · {hour}:30
        </p>
        <p className="text-[#1C1C1E]/30 text-[10px] mt-0.5">{weather}</p>
      </div>

      <div className="flex-1 px-5 overflow-y-auto relative z-10">
        <div className="grid grid-cols-4 gap-y-5 gap-x-2">
          {apps.map((app) => {
            const Icon = app.icon
            const unread = getUnreadCount(app.id, state)

            return (
              <button
                key={app.id}
                onClick={() => handleAppClick(app.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-[1rem] flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{
                      background: app.gradient || app.color,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  >
                    <Icon
                      size={24}
                      color={app.id === 'calendar' ? '#000' : '#fff'}
                    />
                  </div>
                  {unread > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center px-1">
                      <span className="text-white text-[10px] font-bold leading-none">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[#1C1C1E]/70 text-[10px] leading-tight text-center max-w-[60px] truncate">
                  {app.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="relative z-10 px-5 pb-8 pt-3">
        <div
          className="flex items-center justify-around rounded-2xl p-3"
          style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 -1px 0 rgba(0,0,0,0.05)',
          }}
        >
          {dockApps.map((appId) => {
            const app = apps.find((a) => a.id === appId)!
            const Icon = app.icon
            const unread = getUnreadCount(appId, state)

            return (
              <button
                key={appId}
                onClick={() => openApp(appId)}
                className="relative flex flex-col items-center gap-0.5 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    background: app.gradient || app.color,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  <Icon size={22} color="#fff" />
                </div>
                {unread > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-red-500 flex items-center justify-center px-0.5">
                    <span className="text-white text-[9px] font-bold leading-none">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
