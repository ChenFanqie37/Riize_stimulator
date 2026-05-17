import { useState } from 'react'
import { BookOpen, Music, AlertTriangle, CheckSquare, Plus, X } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { NoteEntry } from '@/types/game'

const typeConfig: Record<NoteEntry['type'], { icon: React.ReactNode; color: string; label: string }> = {
  diary: { icon: <BookOpen size={14} />, color: '#92400E', label: '日记' },
  lyrics: { icon: <Music size={14} />, color: '#7C3AED', label: '歌词' },
  crisis: { icon: <AlertTriangle size={14} />, color: '#DC2626', label: '危机' },
  plan: { icon: <CheckSquare size={14} />, color: '#2563EB', label: '计划' },
}

export default function NoteList() {
  const entries = useGameStore((s) => s.notes.entries)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [viewingId, setViewingId] = useState<string | null>(null)

  const viewing = viewingId ? entries.find((e) => e.id === viewingId) : null

  if (viewing) {
    const cfg = typeConfig[viewing.type]
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: '#FDF8F0' }}>
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #B45309, #D97706)' }}>
          <button onClick={() => setViewingId(null)}>
            <X size={18} className="text-white" />
          </button>
          <div className="flex items-center gap-1.5" style={{ color: 'white' }}>
            {cfg.icon}
            <span className="text-[10px]">{cfg.label}</span>
          </div>
          <h1 className="text-white font-bold text-sm flex-1 text-right">{viewing.title}</h1>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <p className="text-[10px] text-gray-400 mb-2">
            {new Date(viewing.createdAt).toLocaleDateString('zh-CN')}
          </p>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{viewing.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FDF8F0' }}>
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #B45309, #D97706)' }}>
        <div>
          <h1 className="text-white font-bold text-lg">备忘录</h1>
          <p className="text-white/70 text-[10px]">记录你的故事</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center"
        >
          <Plus size={16} className="text-white" />
        </button>
      </div>

      {creating && (
        <div className="px-3 py-2 border-b border-amber-100" style={{ backgroundColor: '#FFF9F0' }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="标题"
            className="w-full text-xs font-semibold bg-transparent outline-none mb-1 placeholder-amber-300"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="写点什么..."
            rows={3}
            className="w-full text-[11px] bg-transparent outline-none resize-none placeholder-amber-300"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setCreating(false); setNewTitle(''); setNewContent('') }}
              className="px-3 py-1 rounded text-[10px] text-gray-500"
            >
              取消
            </button>
            <button
              onClick={() => {
                setCreating(false)
                setNewTitle('')
                setNewContent('')
              }}
              className="px-3 py-1 rounded text-[10px] bg-amber-600 text-white"
            >
              保存
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {entries.map((entry) => {
          const cfg = typeConfig[entry.type]
          return (
            <button
              key={entry.id}
              onClick={() => setViewingId(entry.id)}
              className="w-full text-left px-3 py-3 border-b border-amber-50"
            >
              <div className="flex items-center gap-2 mb-1">
                <div style={{ color: cfg.color }}>{cfg.icon}</div>
                <span className="text-[10px]" style={{ color: cfg.color }}>{cfg.label}</span>
                <span className="text-[9px] text-gray-400 ml-auto">
                  {new Date(entry.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-800 mb-0.5">{entry.title}</p>
              <p className="text-[11px] text-gray-500 line-clamp-2">{entry.content}</p>
            </button>
          )
        })}
        {entries.length === 0 && !creating && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <BookOpen size={32} className="mb-2" />
            <p className="text-sm">暂无笔记</p>
          </div>
        )}
      </div>
    </div>
  )
}
