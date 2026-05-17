import { useState, useRef } from 'react'
import { Heart, MessageCircle, Send, Bookmark, Plus, ArrowLeft } from 'lucide-react'
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

const storyRingColors = [
  'conic-gradient(from 0deg, #f093fb, #f5576c, #feca57, #48dbfb, #ff9ff3, #f093fb)',
]

function generatePostComments(post: InstagramPost, fanSuspicion: number): { author: string; text: string; stance: 'support' | 'suspicious' | 'neutral' | 'anti' }[] {
  const comments: { author: string; text: string; stance: 'support' | 'suspicious' | 'neutral' | 'anti' }[] = []
  const isBoyfriend = post.author === 'boyfriend'

  if (isBoyfriend) {
    comments.push({ author: 'riize_luv', text: '오빠 너무 잘생겼어요! 💕', stance: 'support' })
    comments.push({ author: 'kpopfan_99', text: '이 사진 어디서 찍은 거야? 배경이...', stance: fanSuspicion > 40 ? 'suspicious' : 'neutral' })
    comments.push({ author: 'protect_riize', text: '항상 응원합니다! 건강 챙기세요 🙏', stance: 'support' })
    if (fanSuspicion > 30) {
      comments.push({ author: 'detective_briize', text: '이 반지... 혹시 커플링?', stance: 'suspicious' })
    }
    if (fanSuspicion > 60) {
      comments.push({ author: 'truth_revealer', text: '뒤에 여자 그림자 보이는데??', stance: 'anti' })
    }
    comments.push({ author: 'casual_viewer', text: '노래 좋아요~', stance: 'neutral' })
  } else {
    comments.push({ author: 'friend_1', text: '예쁘다! 😍', stance: 'support' })
    comments.push({ author: 'random_22', text: '어디야? 가보고 싶다', stance: 'neutral' })
    comments.push({ author: 'sasaeng_alert', text: '이 위치 팬들 사이에서 화제임', stance: 'suspicious' })
  }

  return comments.slice(0, 6)
}

const stanceConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  support: { label: '支持', color: '#EC4899', bg: '#FDF2F8', icon: '💕' },
  suspicious: { label: '怀疑', color: '#D97706', bg: '#FFFBEB', icon: '⚠️' },
  neutral: { label: '路人', color: '#6B7280', bg: '#F9FAFB', icon: '💬' },
  anti: { label: '黑粉', color: '#DC2626', bg: '#FEF2F2', icon: '🚫' },
}

export default function Feed({ onViewStory, onNewPost }: { onViewStory: (storyId: string) => void; onNewPost: () => void }) {
  const posts = useGameStore((s) => s.instagram.posts)
  const stories = useGameStore((s) => s.instagram.stories)
  const player = useGameStore((s) => s.player)
  const maleLead = useGameStore((s) => s.maleLead)
  const fanSuspicion = useGameStore((s) => s.risk.fanSuspicion)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)

  const activeStories = stories.filter((s) => !s.isDeleted)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  if (selectedPost) {
    const comments = generatePostComments(selectedPost, fanSuspicion)
    return (
      <div className="flex flex-col h-full bg-white">
        <div
          className="px-4 py-2.5 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)',
          }}
        >
          <button onClick={() => setSelectedPost(null)} className="text-white">
            <ArrowLeft size={20} />
          </button>
          <span className="text-white font-bold text-sm">{selectedPost.authorName}</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div
            className="w-full aspect-square"
            style={{ background: getGradient(selectedPost.imageTags) }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white/20 text-4xl">📷</div>
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="flex items-center gap-4 mb-1.5">
              <Heart size={20} className="text-[#3C3C3C]" />
              <MessageCircle size={20} className="text-[#3C3C3C]" />
              <Send size={18} className="text-[#3C3C3C] -rotate-12" />
              <div className="flex-1" />
              <Bookmark size={20} className="text-[#3C3C3C]" />
            </div>
            <p className="text-xs font-semibold text-[#3C3C3C] mb-0.5">
              {selectedPost.likes.toLocaleString()} 次赞
            </p>
            <p className="text-xs text-[#3C3C3C] mb-1">
              <span className="font-semibold">{selectedPost.authorName}</span>{' '}
              <TranslateText {...parseMixedText(selectedPost.text)} koStyle={{ fontSize: '13px', lineHeight: 1.5 }} />
            </p>
            {selectedPost.riskScore > 30 && (
              <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-lg bg-amber-50">
                <span className="text-xs">⚠️</span>
                <span className="text-[10px] text-amber-600 font-medium">风险指数 {selectedPost.riskScore}%</span>
                <div className="w-16 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${selectedPost.riskScore}%`,
                      backgroundColor: selectedPost.riskScore > 70 ? '#DC2626' : '#F59E0B',
                    }}
                  />
                </div>
              </div>
            )}
            {selectedPost.isScreenshotted && (
              <p className="text-[10px] text-orange-400 mb-2">📸 有人截图了</p>
            )}
          </div>

          <div className="border-t border-gray-100 px-3 py-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">评论</p>
            <div className="flex flex-col gap-2">
              {comments.map((c, i) => {
                const cfg = stanceConfig[c.stance]
                return (
                  <div key={i} className="flex items-start gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    >
                      {c.author.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-semibold text-gray-700">{c.author}</span>
                        <span
                          className="text-[9px] px-1 py-0.5 rounded font-medium"
                          style={{ backgroundColor: cfg.bg, color: cfg.color }}
                        >
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600"><TranslateText {...parseMixedText(c.text)} koStyle={{ fontSize: '12px' }} /></p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)',
        }}
      >
        <span className="text-white font-bold text-lg" style={{ fontFamily: 'cursive' }}>
          Instagram
        </span>
        <button
          onClick={onNewPost}
          className="w-8 h-8 flex items-center justify-center"
        >
          <Plus size={22} className="text-white" />
        </button>
      </div>

      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto"
        onTouchStart={(e) => {
          if (e.touches[0].clientY > 0 && feedRef.current && feedRef.current.scrollTop === 0) {
            handleRefresh()
          }
        }}
      >
        {refreshing && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}

        <div className="px-3 py-3 border-b border-gray-100">
          <div className="flex gap-3 overflow-x-auto pb-1">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 relative">
                <span className="text-lg font-bold text-gray-400">
                  {player.name.charAt(0) || '我'}
                </span>
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white">
                  <Plus size={10} className="text-white" />
                </div>
              </div>
              <span className="text-[10px] text-gray-500">你的故事</span>
            </div>

            {activeStories.map((story) => {
              const isBoyfriend = story.author === 'boyfriend'
              return (
                <button
                  key={story.id}
                  onClick={() => onViewStory(story.id)}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                >
                  <div
                    className="w-16 h-16 rounded-full p-[2px]"
                    style={{
                      background: isBoyfriend ? storyRingColors[0] : 'linear-gradient(135deg, #ddd, #999)',
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">
                        {story.authorName.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 max-w-[60px] truncate">
                    {story.authorName}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col">
          {posts.filter((p) => !p.isDeleted).map((post: InstagramPost) => (
            <div key={post.id} className="border-b border-gray-100">
              <button
                onClick={() => setSelectedPost(post)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: getGradient(post.imageTags) }}
                  >
                    {post.authorName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-[#3C3C3C]">{post.authorName}</span>
                    {post.location && (
                      <p className="text-[10px] text-gray-400 truncate">{post.location}</p>
                    )}
                  </div>
                  {post.visibility !== 'public' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                      {post.visibility === 'close_friends' ? '密友' : post.visibility === 'friends' ? '好友' : '私密'}
                    </span>
                  )}
                </div>

                <div
                  className="w-full aspect-square"
                  style={{ background: getGradient(post.imageTags) }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white/20 text-4xl">📷</div>
                  </div>
                </div>
              </button>

              <div className="px-3 py-2">
                <div className="flex items-center gap-4 mb-1.5">
                  <Heart size={20} className="text-[#3C3C3C]" />
                  <MessageCircle size={20} className="text-[#3C3C3C]" />
                  <Send size={18} className="text-[#3C3C3C] -rotate-12" />
                  <div className="flex-1" />
                  <Bookmark size={20} className="text-[#3C3C3C]" />
                </div>
                <p className="text-xs font-semibold text-[#3C3C3C] mb-0.5">
                  {post.likes.toLocaleString()} 次赞
                </p>
                <p className="text-xs text-[#3C3C3C]">
                  <span className="font-semibold">{post.authorName}</span>{' '}
                  <TranslateText {...parseMixedText(post.text)} koStyle={{ fontSize: '12px', lineHeight: 1.4 }} />
                </p>
                {post.comments.length > 0 && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    查看 {post.comments.length} 条评论
                  </p>
                )}
                {post.isScreenshotted && (
                  <p className="text-[10px] text-orange-400 mt-0.5">📸 有人截图了</p>
                )}
              </div>
            </div>
          ))}

          {posts.filter((p) => !p.isDeleted).length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-sm">暂无动态</p>
              <p className="text-xs mt-1">发布你的第一条动态吧</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
