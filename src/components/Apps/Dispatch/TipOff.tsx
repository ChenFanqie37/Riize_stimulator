import { Search, Image, Clock, MessageSquare, AlertTriangle } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { DispatchTip } from '@/types/game'

const tipIcons: Record<DispatchTip['type'], { icon: React.ReactNode; color: string }> = {
  clue: { icon: <Search size={14} />, color: '#3B82F6' },
  blur_photo: { icon: <Image size={14} />, color: '#8B5CF6' },
  countdown: { icon: <Clock size={14} />, color: '#EF4444' },
  dm_threat: { icon: <MessageSquare size={14} />, color: '#F97316' },
  official_expose: { icon: <AlertTriangle size={14} />, color: '#DC2626' },
}

const tipLabels: Record<DispatchTip['type'], string> = {
  clue: '线索',
  blur_photo: '模糊照片',
  countdown: '倒计时',
  dm_threat: 'DM威胁',
  official_expose: '官方曝光',
}

export default function TipOff() {
  const tips = useGameStore((s) => s.dispatch.tips)

  const maxHeat = tips.length > 0 ? Math.max(...tips.map((t) => t.heatLevel)) : 0
  const progress = Math.min(100, maxHeat)

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #EA580C, #F97316)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white font-black text-lg" style={{ fontFamily: 'serif' }}>D</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Dispatch</h1>
            <p className="text-white/70 text-[10px]">独家爆料</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500">爆料进度</span>
          <span className={`text-[10px] font-bold ${progress > 70 ? 'text-red-500' : 'text-orange-500'}`}>
            {progress}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: progress > 70
                ? 'linear-gradient(90deg, #F97316, #EF4444)'
                : 'linear-gradient(90deg, #FBBF24, #F97316)',
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tips.map((tip) => {
          const cfg = tipIcons[tip.type]
          return (
            <div key={tip.id} className="px-3 py-3 border-b border-gray-50">
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                >
                  {cfg.icon}
                </div>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                >
                  {tipLabels[tip.type]}
                </span>
                {tip.type === 'countdown' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 animate-pulse">
                    倒计时中
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-700 leading-relaxed">{tip.content}</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${tip.heatLevel}%`,
                      backgroundColor: tip.heatLevel > 70 ? '#EF4444' : tip.heatLevel > 40 ? '#F59E0B' : '#F97316',
                    }}
                  />
                </div>
                <span className="text-[9px] text-gray-400">{tip.heatLevel}%</span>
              </div>
            </div>
          )
        })}
        {tips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <AlertTriangle size={32} className="mb-2" />
            <p className="text-sm">暂无爆料</p>
          </div>
        )}
      </div>
    </div>
  )
}
