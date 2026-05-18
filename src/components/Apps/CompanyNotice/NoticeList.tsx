import { useEffect } from 'react'
import { Bell, Eye } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { NoticeLevel } from '@/types/game'
import { TranslateText, TranslateLink, parseMixedText } from '../../Common/TranslateText'

const levelConfig: Record<NoticeLevel, { label: string; color: string; bg: string; border: string }> = {
  gentle: { label: '温和', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  warning: { label: '警告', color: '#EAB308', bg: '#FEFCE8', border: '#FDE68A' },
  summon: { label: '约谈', color: '#F97316', bg: '#FFF7ED', border: '#FED7AA' },
  contract: { label: '合约', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
  silence: { label: '封口', color: '#7F1D1D', bg: '#450A0A', border: '#991B1B' },
}

export default function NoticeList() {
  const notices = useGameStore((s) => s.companyNotice.notices)

  useEffect(() => {
    useGameStore.setState((state) => ({
      companyNotice: {
        ...state.companyNotice,
        notices: state.companyNotice.notices.map((notice) => ({ ...notice, isRead: true })),
      },
    }))
  }, [])

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #B91C1C, #DC2626)' }}>
        <h1 className="text-white font-bold text-lg">公司通告</h1>
        <p className="text-white/70 text-[10px]">SM Entertainment</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notices.map((notice) => {
          const cfg = levelConfig[notice.level]
          const isSilence = notice.level === 'silence'
          return (
            <div
              key={notice.id}
              className="px-3 py-3 border-b border-gray-50 relative"
              style={{
                backgroundColor: isSilence ? '#1a0000' : cfg.bg,
                borderBottomColor: isSilence ? '#3a0000' : undefined,
              }}
            >
              {!notice.isRead && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    backgroundColor: isSilence ? '#450A0A' : cfg.bg,
                    color: cfg.color,
                    border: `1px solid ${cfg.border}`,
                  }}
                >
                  {cfg.label}
                </span>
                {notice.level === 'silence' && (
                  <span className="text-[9px] text-red-400 animate-pulse">⚠ 高度敏感</span>
                )}
              </div>
              <TranslateLink ko={notice.title} zh="" style={{ fontSize: '12px', fontWeight: 600, color: isSilence ? '#fca5a5' : '#1f2937' }} />
              {/[가-힣]/.test(notice.content) ? (
                <TranslateText
                  {...parseMixedText(notice.content)}
                  koStyle={{ fontSize: '11px', lineHeight: 1.5, color: isSilence ? 'rgba(248,113,113,0.7)' : '#6b7280' }}
                  zhStyle={{ color: isSilence ? 'rgba(248,113,113,0.7)' : '#6b7280' }}
                />
              ) : (
                <p className={`text-[11px] leading-relaxed ${isSilence ? 'text-red-400/70' : 'text-gray-500'}`}>
                  {notice.content}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1.5">
                <Eye size={10} className={notice.isRead ? 'text-gray-300' : 'text-blue-400'} />
                <span className="text-[9px] text-gray-400">
                  {notice.isRead ? '已读' : '未读'}
                </span>
              </div>
            </div>
          )
        })}
        {notices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Bell size={32} className="mb-2" />
            <p className="text-sm">暂无通告</p>
          </div>
        )}
      </div>
    </div>
  )
}
