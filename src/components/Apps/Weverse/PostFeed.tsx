import { useState } from 'react'
import { AlertTriangle, MessageCircle, Flame, ArrowLeft } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { WeversePostType, WeversePost } from '@/types/game'
import { TranslateText, parseMixedText } from '../../Common/TranslateText'

const typeConfig: Record<WeversePostType, { label: string; color: string; bg: string }> = {
  sugar: { label: '嗑糖', color: '#EC4899', bg: '#FDF2F8' },
  analysis: { label: '分析', color: '#3B82F6', bg: '#EFF6FF' },
  breakdown: { label: '破防', color: '#EF4444', bg: '#FEF2F2' },
  control: { label: '控评', color: '#22C55E', bg: '#F0FDF4' },
  conspiracy: { label: '阴谋论', color: '#A855F7', bg: '#FAF5FF' },
  anti: { label: '黑粉', color: '#6B7280', bg: '#F9FAFB' },
  fansite: { label: '站姐', color: '#F97316', bg: '#FFF7ED' },
  timeline: { label: '时间线', color: '#06B6D4', bg: '#ECFEFF' },
}

const allTypes: WeversePostType[] = ['sugar', 'analysis', 'breakdown', 'control', 'conspiracy', 'anti', 'fansite', 'timeline']

function generateWeverseComments(post: WeversePost, fanSuspicion: number): { author: string; text: string; stance: 'sugar' | 'analysis' | 'anti' | 'neutral' }[] {
  const comments: { author: string; text: string; stance: 'sugar' | 'analysis' | 'anti' | 'neutral' }[] = []

  switch (post.type) {
    case 'sugar':
      comments.push({ author: 'sugar_mom', text: '이 커플 너무 예뻐요 😭💕', stance: 'sugar' })
      comments.push({ author: 'realist_fan', text: '그냥 친한 사이일 수도 있잖아요', stance: 'neutral' })
      break
    case 'analysis':
      comments.push({ author: 'detail_person', text: '이 타임라인 보면 확실히 겹치는데...', stance: 'analysis' })
      comments.push({ author: 'chill_briize', text: '분석 너무 깊게 들어가는 거 아냐?', stance: 'neutral' })
      break
    case 'conspiracy':
      comments.push({ author: 'truth_seeker', text: '이건 뭔가 있어!! 진실이 곧 나올 것이다', stance: 'analysis' })
      comments.push({ author: 'sane_person', text: '음모론 그만... 팬들 이미지 안 좋아져', stance: 'anti' })
      break
    case 'anti':
      comments.push({ author: 'hater_1', text: '아이돌 연애하면 팬 배신인데', stance: 'anti' })
      comments.push({ author: 'defender', text: '연애 자유입니다. 그만 좀 하세요', stance: 'sugar' })
      break
    default:
      comments.push({ author: 'briize_1', text: 'RIIZE 화이팅! 💪', stance: 'sugar' })
      comments.push({ author: 'passerby', text: '글쎄요...', stance: 'neutral' })
  }

  if (fanSuspicion > 50) {
    comments.push({ author: 'worried_fan', text: '진짜 연애 중이면 어떡하지... 😢', stance: 'analysis' })
  }
  if (post.heat > 70) {
    comments.push({ author: 'troll_99', text: '이거 터지면 대박 ㅋㅋ', stance: 'anti' })
  }
  comments.push({ author: 'newbie_fan', text: '무슨 일이에요? 새 팬이라 모르겠어요', stance: 'neutral' })

  return comments.slice(0, 6)
}

const weverseStanceConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  sugar: { label: '嗑糖', color: '#EC4899', bg: '#FDF2F8', icon: '💕' },
  analysis: { label: '分析', color: '#3B82F6', bg: '#EFF6FF', icon: '🔍' },
  anti: { label: '黑粉', color: '#6B7280', bg: '#F3F4F6', icon: '🚫' },
  neutral: { label: '路人', color: '#9CA3AF', bg: '#F9FAFB', icon: '💬' },
}

export default function PostFeed() {
  const posts = useGameStore((s) => s.weverse.posts)
  const fanSuspicion = useGameStore((s) => s.risk.fanSuspicion)
  const [filter, setFilter] = useState<WeversePostType | 'all'>('all')
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const filtered = filter === 'all' ? posts : posts.filter((p) => p.type === filter)

  if (selectedPostId) {
    const post = posts.find((p) => p.id === selectedPostId)
    if (!post) {
      setSelectedPostId(null)
      return null
    }
    const cfg = typeConfig[post.type]
    const comments = generateWeverseComments(post, fanSuspicion)
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="px-4 py-2.5 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #00B4D8, #00D4FF)' }}>
          <button onClick={() => setSelectedPostId(null)} className="text-white">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-white font-bold text-sm">Weverse</h1>
            <p className="text-white/70 text-[10px]">帖子详情</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}
              >
                {cfg.label}
              </span>
              <span className="text-[10px] text-gray-400">{post.author}</span>
              {post.isPlayerAlt && (
                <span className="text-[9px] px-1 py-0.5 rounded bg-blue-50 text-blue-400">我的小号</span>
              )}
              {post.relatedEvidenceIds.length > 0 && (
                <AlertTriangle size={12} className="text-amber-500" />
              )}
            </div>
            <p className="text-sm font-bold text-gray-800 mb-1.5">{post.title}</p>
            <TranslateText {...parseMixedText(post.content)} koStyle={{ fontSize: '12px', lineHeight: 1.5 }} />
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <Flame size={12} className={post.heat > 70 ? 'text-red-500' : 'text-gray-400'} />
                <span className="text-[10px] text-gray-500">热度</span>
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${post.heat}%`,
                      backgroundColor: post.heat > 70 ? '#EF4444' : post.heat > 40 ? '#F59E0B' : '#22C55E',
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{post.heat}%</span>
              </div>
              <div className="flex items-center gap-0.5 text-gray-400">
                <MessageCircle size={11} />
                <span className="text-[10px]">{post.comments}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 px-3 py-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">评论</p>
            <div className="flex flex-col gap-2">
              {comments.map((c, i) => {
                const sCfg = weverseStanceConfig[c.stance]
                return (
                  <div key={i} className="flex items-start gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: sCfg.bg, color: sCfg.color }}
                    >
                      {c.author.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-semibold text-gray-700">{c.author}</span>
                        <span
                          className="text-[9px] px-1 py-0.5 rounded font-medium"
                          style={{ backgroundColor: sCfg.bg, color: sCfg.color }}
                        >
                          {sCfg.icon} {sCfg.label}
                        </span>
                      </div>
                      <TranslateText {...parseMixedText(c.text)} koStyle={{ fontSize: '11px' }} />
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
      <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #00B4D8, #00D4FF)' }}>
        <h1 className="text-white font-bold text-lg">Weverse</h1>
        <p className="text-white/70 text-[10px]">粉丝社区</p>
      </div>

      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-b border-gray-100">
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-full text-[10px] font-medium flex-shrink-0 ${
            filter === 'all' ? 'bg-[#00D4FF] text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          全部
        </button>
        {allTypes.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium flex-shrink-0 ${
              filter === t ? 'text-white' : ''
            }`}
            style={filter === t ? { backgroundColor: typeConfig[t].color } : { backgroundColor: typeConfig[t].bg, color: typeConfig[t].color }}
          >
            {typeConfig[t].label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((post) => {
          const cfg = typeConfig[post.type]
          return (
            <button
              key={post.id}
              onClick={() => setSelectedPostId(post.id)}
              className="w-full text-left px-3 py-3 border-b border-gray-50"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>
                <span className="text-[10px] text-gray-400">{post.author}</span>
                {post.isPlayerAlt && (
                  <span className="text-[9px] px-1 py-0.5 rounded bg-blue-50 text-blue-400">我的小号</span>
                )}
                {post.relatedEvidenceIds.length > 0 && (
                  <AlertTriangle size={12} className="text-amber-500" />
                )}
              </div>
              <p className="text-xs font-semibold text-gray-800 mb-0.5">{post.title}</p>
              <TranslateText {...parseMixedText(post.content)} koStyle={{ fontSize: '11px' }} />
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Flame size={11} className={post.heat > 70 ? 'text-red-500' : 'text-gray-400'} />
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${post.heat}%`,
                        backgroundColor: post.heat > 70 ? '#EF4444' : post.heat > 40 ? '#F59E0B' : '#22C55E',
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-gray-400">
                  <MessageCircle size={11} />
                  <span className="text-[10px]">{post.comments}</span>
                </div>
              </div>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">暂无帖子</p>
          </div>
        )}
      </div>
    </div>
  )
}
