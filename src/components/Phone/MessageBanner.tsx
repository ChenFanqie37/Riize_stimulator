import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'

export default function MessageBanner() {
  const banner = useGameStore((s) => s.showMessageBanner)
  const dismissBanner = useGameStore((s) => s.dismissBanner)
  const openApp = useGameStore((s) => s.openApp)
  const openChat = useGameStore((s) => s.openChat)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (banner) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => dismissBanner(), 300)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [banner, dismissBanner])

  if (!banner) return null

  const handleView = () => {
    openApp('kakaoTalk')
    openChat(banner.threadId)
    setVisible(false)
    setTimeout(() => dismissBanner(), 300)
  }

  return (
    <div
      className="absolute top-0 left-0 right-0 z-[60] px-3 pt-2"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer"
        style={{
          background: 'rgba(30, 30, 50, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
        onClick={handleView}
      >
        <div className="w-10 h-10 rounded-full bg-[#FEE500] flex items-center justify-center text-sm font-bold text-[#3C3C3C] flex-shrink-0">
          {banner.avatar || banner.senderName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <MessageCircle size={12} className="text-[#FEE500]" />
            <span className="text-white text-xs font-semibold truncate">{banner.senderName}</span>
          </div>
          <p className="text-white/50 text-[11px] truncate mt-0.5">{banner.preview}</p>
        </div>
        <button
          className="px-3 py-1.5 rounded-full text-[11px] font-bold flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #ff2d78, #ff6b9d)',
            color: 'white',
          }}
          onClick={(e) => {
            e.stopPropagation()
            handleView()
          }}
        >
          查看
        </button>
      </div>
    </div>
  )
}
