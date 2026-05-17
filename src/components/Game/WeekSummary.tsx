import { ChevronRight, TrendingUp, TrendingDown, Bell } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'

interface StatChange {
  label: string
  value: number
}

interface WeekSummaryProps {
  onContinue: () => void
}

export default function WeekSummary({ onContinue }: WeekSummaryProps) {
  const state = useGameStore()
  const advanceWeek = useGameStore((s) => s.advanceWeek)

  const weekHistory = state.history.filter((h) => h.week === state.week)

  const statChanges: StatChange[] = [
    { label: '好感度', value: state.maleLead.affection },
    { label: '信任度', value: state.maleLead.trust },
    { label: '恋情保密度', value: state.risk.secrecy },
    { label: '舆论热度', value: state.risk.publicHeat },
    { label: '公司警觉度', value: state.risk.companyAlert },
    { label: '事业压力', value: state.maleLead.careerPressure },
    { label: '青春共鸣值', value: state.player.popularity },
    { label: '生活稳定度', value: state.player.lifeStability },
    { label: '金钱', value: state.player.money },
  ]

  const nextNotifications = state.notifications.filter((n) => !n.isRead).slice(0, 3)

  const handleContinue = () => {
    advanceWeek()
    onContinue()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(5, 5, 16, 0.95)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(15, 15, 30, 0.95)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.5s ease-out',
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        <div className="px-6 py-5 border-b border-white/5">
          <h2 className="text-white text-xl font-bold">本周回顾</h2>
          <p className="text-white/30 text-xs mt-1">第 {state.week} 周 · {state.narrativePhase}篇</p>
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {weekHistory.length > 0 && (
            <div className="mb-5">
              <h3 className="text-white/50 text-xs mb-3">本周事件</h3>
              <div className="flex flex-col gap-2">
                {weekHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="px-3 py-2 rounded-lg"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <p className="text-white/70 text-xs">{entry.event}</p>
                    {entry.choice && (
                      <p className="text-[#ff6b9d] text-[10px] mt-0.5">→ {entry.choice}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-5">
            <h3 className="text-white/50 text-xs mb-3">当前状态</h3>
            <div className="grid grid-cols-3 gap-2">
              {statChanges.map((sc) => (
                <div
                  key={sc.label}
                  className="flex flex-col items-center px-2 py-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <span className="text-white/40 text-[10px]">{sc.label}</span>
                  <span className="text-white font-bold text-sm">{sc.value}</span>
                </div>
              ))}
            </div>
          </div>

          {nextNotifications.length > 0 && (
            <div className="mb-4">
              <h3 className="text-white/50 text-xs mb-2 flex items-center gap-1">
                <Bell size={10} />
                下周预告
              </h3>
              <div className="flex flex-col gap-1.5">
                {nextNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="px-3 py-1.5 rounded-lg"
                    style={{
                      background: n.urgency === 'high' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
                      borderLeft: `2px solid ${n.urgency === 'high' ? '#ef4444' : n.urgency === 'medium' ? '#eab308' : '#3b82f6'}`,
                    }}
                  >
                    <p className="text-white/50 text-[10px]">{n.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/5">
          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #ff2d78, #ff6b9d)',
              color: 'white',
              boxShadow: '0 0 20px rgba(255,45,120,0.3)',
            }}
          >
            进入下一周
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
