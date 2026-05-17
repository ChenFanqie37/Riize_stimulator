import { X, MessageCircle, Camera, Heart, Search, Briefcase, Eye, Calendar, Image, FileText, Activity } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { AppName, Notification } from '@/types/game'
import type { LucideIcon } from 'lucide-react'

const appIcons: Record<AppName, LucideIcon> = {
  kakaoTalk: MessageCircle,
  instagram: Camera,
  weverse: Heart,
  naver: Search,
  companyNotice: Briefcase,
  dispatch: Eye,
  calendar: Calendar,
  gallery: Image,
  notes: FileText,
  health: Activity,
}

const appColors: Record<AppName, string> = {
  kakaoTalk: '#FEE500',
  instagram: '#E4405F',
  weverse: '#00C3FF',
  naver: '#03C75A',
  companyNotice: '#EF4444',
  dispatch: '#F97316',
  calendar: '#FFFFFF',
  gallery: '#A855F7',
  notes: '#D4C5A9',
  health: '#4ADE80',
}

const urgencyColors: Record<Notification['urgency'], string> = {
  low: '#3b82f6',
  medium: '#eab308',
  high: '#ef4444',
}

const urgencyBg: Record<Notification['urgency'], string> = {
  low: 'rgba(59,130,246,0.1)',
  medium: 'rgba(234,179,8,0.1)',
  high: 'rgba(239,68,68,0.1)',
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const notifications = useGameStore((s) => s.notifications)
  const markNotificationRead = useGameStore((s) => s.markNotificationRead)

  const unreadNotifications = notifications.filter((n) => !n.isRead)

  const handleMarkAllRead = () => {
    unreadNotifications.forEach((n) => {
      markNotificationRead(n.id)
    })
  }

  if (!isOpen) return null

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{
        background: 'rgba(10, 10, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <h2 className="text-white text-lg font-semibold">Notifications</h2>
        <div className="flex items-center gap-3">
          {unreadNotifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[#ff2d78] text-xs font-medium hover:underline"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={14} className="text-white/80" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-white/30">
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((notification) => {
              const Icon = appIcons[notification.app]
              const color = appColors[notification.app]
              const uColor = urgencyColors[notification.urgency]
              const uBg = urgencyBg[notification.urgency]

              return (
                <button
                  key={notification.id}
                  onClick={() => markNotificationRead(notification.id)}
                  className="flex items-start gap-3 p-3 rounded-xl text-left transition-colors w-full"
                  style={{
                    background: notification.isRead ? 'rgba(255,255,255,0.03)' : uBg,
                    borderLeft: `3px solid ${notification.isRead ? 'transparent' : uColor}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${color}22` }}
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white/90 text-xs font-medium truncate">
                        {notification.title}
                      </span>
                      {!notification.isRead && (
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: uColor }}
                        />
                      )}
                    </div>
                    <p className="text-white/50 text-[11px] mt-0.5 line-clamp-2">
                      {notification.content}
                    </p>
                    <p className="text-white/25 text-[9px] mt-1">
                      {new Date(notification.createdAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
