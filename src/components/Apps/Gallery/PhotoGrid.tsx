import { useState } from 'react'
import { Eye, Trash2, AlertTriangle, X } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { GalleryPhoto } from '@/types/game'

const sourceGradients: Record<string, string> = {
  selfie: 'linear-gradient(135deg, #f093fb, #f5576c)',
  couple: 'linear-gradient(135deg, #f5576c, #ff6b9d)',
  backstage: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
  travel: 'linear-gradient(135deg, #43e97b, #38f9d7)',
  date: 'linear-gradient(135deg, #fa709a, #fee140)',
  gift: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  default: 'linear-gradient(135deg, #667eea, #764ba2)',
}

function getGradient(source: string) {
  return sourceGradients[source] || sourceGradients.default
}

const riskConfig: Record<GalleryPhoto['riskLevel'], { label: string; color: string; bg: string }> = {
  low: { label: '低风险', color: '#22C55E', bg: '#F0FDF4' },
  medium: { label: '中风险', color: '#EAB308', bg: '#FEFCE8' },
  high: { label: '高风险', color: '#EF4444', bg: '#FEF2F2' },
}

export default function PhotoGrid() {
  const photos = useGameStore((s) => s.gallery.photos)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = selectedId ? photos.find((p) => p.id === selectedId) : null

  if (selected) {
    const risk = riskConfig[selected.riskLevel]
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
          <button onClick={() => setSelectedId(null)}>
            <X size={18} className="text-white" />
          </button>
          <h1 className="text-white font-bold text-sm">照片详情</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="w-full aspect-square" style={{ background: getGradient(selected.source) }}>
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/20 text-5xl">📷</span>
            </div>
          </div>
          <div className="px-3 py-3">
            <p className={`text-sm font-semibold mb-1 ${selected.isDeleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {selected.title}
            </p>
            <p className="text-[11px] text-gray-500 mb-2">{selected.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: risk.bg, color: risk.color }}>
                {risk.label}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500">
                来源: {selected.source}
              </span>
              {selected.isHidden && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-200 text-gray-500">已隐藏</span>
              )}
            </div>
            {selected.isDiscoveredByFans && (
              <div className="flex items-center gap-1 px-2 py-1.5 rounded bg-red-50 mb-2">
                <AlertTriangle size={12} className="text-red-500" />
                <span className="text-[10px] text-red-600 font-medium">已被粉丝发现</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
        <h1 className="text-white font-bold text-lg">相册</h1>
        <p className="text-white/70 text-[10px]">照片管理</p>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5">
        <div className="grid grid-cols-3 gap-1">
          {photos.map((photo) => {
            const risk = riskConfig[photo.riskLevel]
            return (
              <button
                key={photo.id}
                onClick={() => setSelectedId(photo.id)}
                className="aspect-square rounded-lg overflow-hidden relative"
                style={{ background: getGradient(photo.source) }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white/20 text-2xl">📷</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1">
                  <p className={`text-[9px] text-white truncate ${photo.isDeleted ? 'line-through' : ''}`}>
                    {photo.title}
                  </p>
                </div>
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: risk.color }} />
                </div>
                {photo.isDiscoveredByFans && (
                  <div className="absolute top-1 left-1">
                    <AlertTriangle size={10} className="text-red-400" />
                  </div>
                )}
                {photo.isDeleted && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Trash2 size={16} className="text-white/60" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
        {photos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">暂无照片</p>
          </div>
        )}
      </div>
    </div>
  )
}
