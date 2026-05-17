import { Battery, Signal, Wifi, Clock } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { TimeOfDay } from '@/types/game'

const timeMap: Record<TimeOfDay, string> = {
  morning: '08:30',
  afternoon: '14:00',
  evening: '19:30',
  night: '23:45',
}

export default function StatusBar() {
  const timeOfDay = useGameStore((s) => s.timeOfDay)
  const week = useGameStore((s) => s.week)

  const time = timeMap[timeOfDay]
  const batteryLevel = Math.max(10, 100 - (week - 1) * 2)

  const batteryColor =
    batteryLevel > 50 ? '#34C759' : batteryLevel > 20 ? '#FF9500' : '#FF3B30'

  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center gap-1">
        <Clock size={12} className="text-[#1C1C1E]" />
        <span className="text-[#1C1C1E] text-xs font-semibold">{time}</span>
      </div>

      <div className="flex items-center gap-2">
        <Signal size={12} className="text-[#1C1C1E]" />
        <Wifi size={12} className="text-[#1C1C1E]" />
        <div className="flex items-center gap-0.5">
          <div className="relative w-[22px] h-[10px] border border-[#1C1C1E]/30 rounded-[2px] p-[1px]">
            <div
              className="h-full rounded-[1px]"
              style={{
                width: `${batteryLevel}%`,
                backgroundColor: batteryColor,
              }}
            />
          </div>
          <div className="w-[1.5px] h-[4px] rounded-r-sm bg-[#1C1C1E]/30" />
        </div>
      </div>
    </div>
  )
}
