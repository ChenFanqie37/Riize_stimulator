import { useState, useEffect, useCallback } from 'react'
import { X, Eye, Camera, ChevronUp, Send } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { InstagramPost } from '@/types/game'
import { TranslateText, parseMixedText } from '../../Common/TranslateText'

const tagGradients: Record<string, string> = {
  selfie: 'linear-gradient(135deg, #f093fb, #f5576c)',
  food: 'linear-gradient(135deg, #4facfe, #00f2fe)',
  cafe: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  night: 'linear-gradient(135deg, #667eea, #764ba2)',
  travel: 'linear-gradient(135deg, #43e97b, #38f9d7)',
  couple: 'linear-gradient(135deg, #f5576c, #ff6b9d)',
  mood: 'linear-gradient(135deg, #fa709a, #fee140)',
  outfit: 'linear-gradient(135deg, #a8edea, #fed6e3)',
  studio: 'linear-gradient(135deg, #d299c2, #fef9d7)',
  backstage: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
}

function getGradient(tags: string[]) {
  for (const tag of tags) {
    if (tagGradients[tag]) return tagGradients[tag]
  }
  return 'linear-gradient(135deg, #667eea, #764ba2)'
}

export default function Story({
  storyId,
  onClose,
}: {
  storyId: string
  onClose: () => void
}) {
  const stories = useGameStore((s) => s.instagram.stories)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showViewers, setShowViewers] = useState(false)
  const [replyText, setReplyText] = useState('')

  const activeStories = stories.filter((s) => !s.isDeleted)
  const storyIndex = activeStories.findIndex((s) => s.id === storyId)

  useEffect(() => {
    if (storyIndex >= 0) {
      setCurrentIndex(storyIndex)
    }
  }, [storyIndex])

  const currentStory: InstagramPost | undefined = activeStories[currentIndex]
  const isExpired = currentStory?.expiresAt ? currentStory.expiresAt < Date.now() : false

  const goNext = useCallback(() => {
    if (currentIndex < activeStories.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }, [currentIndex, activeStories.length, onClose])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setProgress(0)
    }
  }, [currentIndex])

  useEffect(() => {
    if (isExpired || showViewers) return
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          goNext()
          return 0
        }
        return p + 2
      })
    }, 100)
    return () => clearInterval(timer)
  }, [isExpired, showViewers, goNext])

  if (!currentStory) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex gap-0.5 px-2 pt-2 absolute top-0 left-0 right-0 z-20">
        {activeStories.map((_, i) => (
          <div key={i} className="flex-1 h-[2px] bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-100"
              style={{
                width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 pt-5 pb-2 z-20">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: getGradient(currentStory.imageTags) }}
        >
          {currentStory.authorName.charAt(0)}
        </div>
        <span className="text-white text-xs font-medium">{currentStory.authorName}</span>
        <span className="text-white/40 text-[10px]">
          {Math.floor((Date.now() - currentStory.createdAt) / 60000)}分钟前
        </span>
        <div className="flex-1" />
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center">
          <X size={20} className="text-white" />
        </button>
      </div>

      <div
        className="flex-1 relative"
        style={{ background: getGradient(currentStory.imageTags) }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          if (x < rect.width / 3) {
            goPrev()
          } else {
            goNext()
          }
        }}
      >
        {isExpired ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <p className="text-white/60 text-lg">已过期</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <TranslateText {...parseMixedText(currentStory.text)} koStyle={{ fontSize: '13px', lineHeight: 1.5 }} />
          </div>
        )}

        <div className="absolute bottom-4 left-3 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1">
            <Eye size={12} className="text-white/70" />
            <span className="text-white/70 text-[10px]">{currentStory.views}</span>
          </div>
          {currentStory.boyfriendViewed && (
            <div className="flex items-center gap-1 bg-pink-500/30 rounded-full px-2 py-1">
              <span className="text-[10px]">❤️ 已看</span>
            </div>
          )}
          {currentStory.isScreenshotted && (
            <div className="flex items-center gap-1 bg-orange-500/30 rounded-full px-2 py-1">
              <Camera size={10} className="text-white/70" />
              <span className="text-white/70 text-[10px]">截图</span>
            </div>
          )}
        </div>
      </div>

      {showViewers && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[50%] overflow-y-auto z-30">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-[#3C3C3C]">查看者</span>
            <button onClick={() => setShowViewers(false)}>
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="px-4 py-2">
            {currentStory.screenshottedBy.map((name, i) => (
              <div key={i} className="flex items-center gap-2 py-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  {name.charAt(0)}
                </div>
                <span className="text-sm text-[#3C3C3C]">{name}</span>
                <Camera size={12} className="text-orange-400 ml-auto" />
              </div>
            ))}
            {currentStory.screenshottedBy.length === 0 && (
              <p className="text-xs text-gray-400 py-4 text-center">暂无查看者</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-3 z-20">
        <button
          onClick={() => setShowViewers(true)}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronUp size={18} className="text-white/60" />
        </button>
        <input
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="回复故事..."
          className="flex-1 h-9 px-3 rounded-full bg-white/10 border border-white/20 text-white text-sm outline-none placeholder-white/40"
        />
        <button className="w-9 h-9 flex items-center justify-center">
          <Send size={16} className="text-white/60 -rotate-12" />
        </button>
      </div>
    </div>
  )
}
