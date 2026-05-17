import { useState } from 'react'
import { Search, Pin, Phone, Trash2, MoreVertical } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'

const avatarColors = [
  '#FEE500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

const relationshipLabels: Record<string, { text: string; color: string }> = {
  stranger: { text: '陌生人', color: 'rgba(156,163,175,0.8)' },
  impression: { text: '初印象', color: 'rgba(96,165,250,0.8)' },
  interest: { text: '有好感', color: 'rgba(52,211,153,0.8)' },
  ambiguous: { text: '暧昧', color: 'rgba(251,146,60,0.8)' },
  confirmed: { text: '已确认', color: 'rgba(244,114,182,0.8)' },
  passionate: { text: '热恋', color: 'rgba(248,113,113,0.8)' },
  trial: { text: '考验期', color: 'rgba(168,85,247,0.8)' },
  '闺蜜': { text: '闺蜜', color: 'rgba(244,114,182,0.8)' },
}

export default function ChatList({ onOpenCallLog }: { onOpenCallLog: () => void }) {
  const threads = useGameStore((s) => s.kakaoTalk.threads)
  const openChat = useGameStore((s) => s.openChat)
  const deleteThread = useGameStore((s) => s.deleteThread)
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const sortedThreads = [...threads].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    const aTime = a.messages.length > 0 ? a.messages[a.messages.length - 1].timestamp : 0
    const bTime = b.messages.length > 0 ? b.messages[b.messages.length - 1].timestamp : 0
    return bTime - aTime
  })

  const filtered = sortedThreads.filter((t) =>
    t.participantName.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (threadId: string) => {
    deleteThread(threadId)
    setMenuOpen(null)
  }

  return (
    <div className="flex flex-col h-full bg-[#BDBDBD]">
      <div className="bg-[#FEE500] px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-[#3C3C3C]">KakaoTalk</h1>
          <button
            onClick={onOpenCallLog}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3C3C3C]/10"
          >
            <Phone size={16} className="text-[#3C3C3C]" />
          </button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3C3C3C]/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索"
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-white/70 text-xs text-[#3C3C3C] placeholder-[#3C3C3C]/40 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((thread) => {
          const lastMsg = thread.messages[thread.messages.length - 1]
          const color = getAvatarColor(thread.participantName)
          const firstLetter = thread.participantName.charAt(0)
          const relInfo = relationshipLabels[thread.relationship]

          return (
            <div
              key={thread.id}
              className="relative"
            >
              <button
                onClick={() => { openChat(thread.id); setMenuOpen(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100"
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: color }}
                  >
                    {firstLetter}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      thread.isOnline ? 'bg-green-400' : 'bg-gray-400'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    {thread.isPinned && (
                      <Pin size={10} className="text-[#FEE500] fill-[#FEE500] flex-shrink-0" />
                    )}
                    <span className="text-sm font-semibold text-[#3C3C3C] truncate">
                      {thread.participantName}
                    </span>
                    {relInfo && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: `${relInfo.color}20`,
                          color: relInfo.color,
                          border: `1px solid ${relInfo.color}30`,
                        }}
                      >
                        {relInfo.text}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {lastMsg
                      ? lastMsg.isRecalled
                        ? '对方撤回了一条消息'
                        : lastMsg.isVoice
                          ? `🎤 语音 ${lastMsg.voiceDuration}`
                          : lastMsg.textZh
                      : thread.lastActive}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] text-gray-400">
                    {lastMsg
                      ? new Date(lastMsg.timestamp).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                  {thread.unreadCount > 0 && (
                    <div className="min-w-[18px] h-[18px] rounded-full bg-[#FEE500] flex items-center justify-center px-1">
                      <span className="text-[10px] font-bold text-[#3C3C3C] leading-none">
                        {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(menuOpen === thread.id ? null : thread.id)
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity"
                style={{ opacity: menuOpen === thread.id ? 1 : undefined }}
              >
                <MoreVertical size={12} className="text-gray-400" />
              </button>

              {menuOpen === thread.id && (
                <div
                  className="absolute right-2 top-8 z-20 rounded-lg overflow-hidden shadow-lg"
                  style={{
                    background: 'rgba(30,30,50,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(thread.id)
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-white/5 w-full transition-colors"
                  >
                    <Trash2 size={12} />
                    删除聊天
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">暂无聊天</p>
          </div>
        )}
      </div>
    </div>
  )
}
