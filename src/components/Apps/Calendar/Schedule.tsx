import { useState } from 'react'
import { Check, AlertTriangle } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { CalendarEvent } from '@/types/game'

const dayLabels = ['一', '二', '三', '四', '五', '六', '日']

const typeColors: Record<CalendarEvent['type'], { bg: string; text: string; dot: string }> = {
  player: { bg: '#EFF6FF', text: '#3B82F6', dot: '#3B82F6' },
  boyfriend: { bg: '#FDF2F8', text: '#EC4899', dot: '#EC4899' },
  shared: { bg: '#FEF2F2', text: '#EF4444', dot: '#EF4444' },
}

function getEventDayIndex(date: string): number {
  const weekDay = date.match(/W\d+-D(\d+)/i)
  if (weekDay) return Math.max(0, Math.min(6, Number(weekDay[1]) - 1))

  const chineseDay = date.match(/第(\d+)天/)
  if (chineseDay) return Math.max(0, Math.min(6, Number(chineseDay[1]) - 1))

  const parsed = new Date(date)
  if (!Number.isNaN(parsed.getTime())) {
    const day = parsed.getDay()
    return day === 0 ? 6 : day - 1
  }
  return 0
}

export default function Schedule() {
  const events = useGameStore((s) => s.calendar.events)
  const week = useGameStore((s) => s.week)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const eventsByDay = dayLabels.map((_, i) =>
    events.filter((e) => getEventDayIndex(e.date) === i)
  )

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">日程</h1>
            <p className="text-white/70 text-[10px]">第 {week} 周</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">W{week}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 gap-px bg-gray-100">
          {dayLabels.map((label, i) => (
            <div key={label} className="bg-white text-center py-1.5">
              <span className="text-[10px] font-medium text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        <div className="px-2 py-2 space-y-3">
          {dayLabels.map((label, dayIdx) => {
            const dayEvents = eventsByDay[dayIdx]
            if (dayEvents.length === 0) return null
            return (
              <div key={label}>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-[10px] font-bold text-gray-400">周{label}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                {dayEvents.map((event) => {
                  const cfg = typeColors[event.type]
                  const isCompleted = completedIds.has(event.id)
                  return (
                    <div
                      key={event.id}
                      className={`flex items-center gap-2 px-2 py-2 mb-1 rounded-lg ${isCompleted ? 'opacity-50' : ''}`}
                      style={{ backgroundColor: cfg.bg }}
                    >
                      <button
                        onClick={() => toggleComplete(event.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isCompleted ? 'border-green-400 bg-green-400' : 'border-gray-300'
                        }`}
                      >
                        {isCompleted && <Check size={10} className="text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                          <p className={`text-[11px] font-medium ${isCompleted ? 'line-through text-gray-400' : ''}`} style={{ color: isCompleted ? undefined : cfg.text }}>
                            {event.title}
                          </p>
                        </div>
                        <p className="text-[9px] text-gray-400 ml-2.5">{event.time}</p>
                      </div>
                      {event.isHighRisk && !isCompleted && (
                        <AlertTriangle size={12} className="text-red-500 animate-pulse flex-shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">暂无日程</p>
          </div>
        )}
      </div>
    </div>
  )
}
