import { Puzzle, Flame } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'

export default function Timeline() {
  const timelines = useGameStore((s) => s.weverse.timeline)

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #00B4D8, #00D4FF)' }}>
        <h1 className="text-white font-bold text-lg">粉丝时间线</h1>
        <p className="text-white/70 text-[10px]">粉丝调查记录</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {timelines.map((tl) => (
          <div
            key={tl.id}
            className={`px-3 py-3 border-b border-gray-50 ${tl.heat > 70 ? 'bg-red-50/50' : ''}`}
            style={tl.heat > 70 ? { boxShadow: 'inset 3px 0 0 #EF4444' } : {}}
          >
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-semibold text-gray-800 flex-1">{tl.title}</p>
              {tl.heat > 50 && (
                <div className="flex items-center gap-1">
                  <Flame size={11} className={tl.heat > 70 ? 'text-red-500' : 'text-amber-500'} />
                  <span className={`text-[10px] font-medium ${tl.heat > 70 ? 'text-red-500' : 'text-amber-500'}`}>
                    {tl.heat}%
                  </span>
                </div>
              )}
              {tl.heat > 70 && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-100 text-red-600 animate-pulse">
                  危险
                </span>
              )}
            </div>

            <div className="relative ml-2">
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gray-200" />
              {tl.entries.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-2 mb-2 last:mb-0">
                  <div className="w-[11px] h-[11px] rounded-full border-2 border-[#00D4FF] bg-white flex-shrink-0 mt-0.5 z-10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 mb-0.5">{entry.time}</p>
                    <p className="text-[11px] text-gray-700">{entry.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {tl.heat > 60 && (
              <div className="flex items-center gap-1 mt-1">
                <Puzzle size={11} className="text-purple-500" />
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 font-medium">
                  证据拼图
                </span>
              </div>
            )}
          </div>
        ))}
        {timelines.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">暂无时间线</p>
          </div>
        )}
      </div>
    </div>
  )
}
