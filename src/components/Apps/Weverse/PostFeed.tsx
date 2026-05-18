import { useState } from 'react'
import { AlertTriangle, MessageCircle, Flame, ArrowLeft } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { WeversePostType } from '@/types/game'
import { TranslateText, parseMixedText } from '../../Common/TranslateText'
import AppAccountBar from '../../Common/AppAccountBar'
import { commentsForWeversePost, type SocialAgentComment } from '@/engine/socialAgents'

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

const roleConfig: Record<SocialAgentComment['role'], { label: string; color: string; bg: string }> = {
  fan: { label: '粉丝', color: '#EC4899', bg: '#FDF2F8' },
  anti: { label: '黑粉', color: '#DC2626', bg: '#FEF2F2' },
  passerby: { label: '路人', color: '#6B7280', bg: '#F9FAFB' },
  company: { label: '公司', color: '#2563EB', bg: '#EFF6FF' },
  paparazzi: { label: '狗仔', color: '#D97706', bg: '#FFFBEB' },
  teammateFan: { label: '队友粉', color: '#8B5CF6', bg: '#F5F3FF' },
}

export default function PostFeed() {
  const state = useGameStore()
  const posts = state.weverse.posts
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
    const comments = commentsForWeversePost(post, state)
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
                const sCfg = roleConfig[c.role]
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
                          {sCfg.label}
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
      <AppAccountBar app="weverse" />

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
