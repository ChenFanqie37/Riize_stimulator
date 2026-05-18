import { useState } from 'react'
import { Search, TrendingUp, Clock, ArrowLeft } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { TranslateText, parseMixedText } from '../../Common/TranslateText'
import AppAccountBar from '../../Common/AppAccountBar'
import { commentsForNaverNews, type SocialAgentComment } from '@/engine/socialAgents'

const roleConfig: Record<SocialAgentComment['role'], { label: string; color: string; bg: string }> = {
  fan: { label: '粉丝', color: '#16A34A', bg: '#F0FDF4' },
  anti: { label: '黑粉', color: '#DC2626', bg: '#FEF2F2' },
  passerby: { label: '路人', color: '#6B7280', bg: '#F9FAFB' },
  company: { label: '公司', color: '#2563EB', bg: '#EFF6FF' },
  paparazzi: { label: '狗仔', color: '#D97706', bg: '#FFFBEB' },
  teammateFan: { label: '队友粉', color: '#8B5CF6', bg: '#F5F3FF' },
}

export default function NewsFeed() {
  const state = useGameStore()
  const news = state.naver.news
  const searchHistory = state.naver.searchHistory
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)

  const trendingKeywords = news
    .flatMap((n) => n.relatedSearchWords)
    .reduce<Record<string, number>>((acc, w) => {
      acc[w] = (acc[w] || 0) + 1
      return acc
    }, {})
  const trending = Object.entries(trendingKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  if (selectedArticleId) {
    const article = news.find((n) => n.id === selectedArticleId)
    if (!article) {
      setSelectedArticleId(null)
      return null
    }
    const comments = commentsForNaverNews(article, state)
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="px-4 py-2.5 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #1AA300, #1EC800)' }}>
          <button onClick={() => setSelectedArticleId(null)} className="text-white">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-white font-bold text-sm">NAVER</h1>
            <p className="text-white/70 text-[10px]">新闻详情</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-3">
            <p className="text-sm font-bold text-gray-800 leading-snug mb-2">{article.title}</p>
            <TranslateText {...parseMixedText(article.summary)} koStyle={{ fontSize: '12px', lineHeight: 1.5 }} />
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] text-gray-400">{article.source}</span>
              <div className="flex items-center gap-1">
                <TrendingUp size={11} className={article.heat > 70 ? 'text-red-500' : 'text-gray-400'} />
                <span className="text-[10px] text-gray-500">热度</span>
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${article.heat}%`,
                      backgroundColor: article.heat > 70 ? '#EF4444' : article.heat > 40 ? '#F59E0B' : '#1EC800',
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{article.heat}%</span>
              </div>
            </div>
            {article.relatedSearchWords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {article.relatedSearchWords.map((w, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-green-50 text-[10px] text-green-700 font-medium">
                    {w}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 px-3 py-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">网友评论</p>
            <div className="flex flex-col gap-2">
              {comments.map((c, i) => {
                const cfg = roleConfig[c.role]
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
                          {cfg.label}
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
      <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #1AA300, #1EC800)' }}>
        <h1 className="text-white font-bold text-lg">NAVER</h1>
        <p className="text-white/70 text-[10px]">新闻与搜索</p>
      </div>
      <AppAccountBar app="naver" />

      {searchHistory.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center gap-1 mb-1.5">
            <Clock size={11} className="text-gray-400" />
            <span className="text-[10px] text-gray-400">搜索历史</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {searchHistory.slice(-5).map((q, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-500">
                {q}
              </span>
            ))}
          </div>
        </div>
      )}

      {trending.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center gap-1 mb-1.5">
            <TrendingUp size={11} className="text-[#1EC800]" />
            <span className="text-[10px] text-gray-400">热搜关键词</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {trending.map(([word], i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-green-50 text-[10px] text-green-700 font-medium">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {news.map((article) => (
          <button
            key={article.id}
            onClick={() => setSelectedArticleId(article.id)}
            className="w-full text-left px-3 py-3 border-b border-gray-50"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 leading-snug mb-1">
                  {article.title}
                </p>
                <TranslateText {...parseMixedText(article.summary)} koStyle={{ fontSize: '11px' }} />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">{article.source}</span>
                  <div className="flex items-center gap-0.5">
                    <TrendingUp size={10} className={article.heat > 70 ? 'text-red-500' : 'text-gray-400'} />
                    <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${article.heat}%`,
                          backgroundColor: article.heat > 70 ? '#EF4444' : article.heat > 40 ? '#F59E0B' : '#1EC800',
                        }}
                      />
                    </div>
                  </div>
                </div>
                {article.relatedSearchWords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {article.relatedSearchWords.slice(0, 3).map((w, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-green-50 text-[9px] text-green-600">
                        {w}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
        {news.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Search size={32} className="mb-2" />
            <p className="text-sm">暂无新闻</p>
          </div>
        )}
      </div>
    </div>
  )
}
