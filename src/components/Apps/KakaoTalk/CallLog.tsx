import { useState } from 'react'
import { ArrowLeft, PhoneIncoming, PhoneMissed, PhoneOff } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { CallLog as CallLogType } from '@/types/game'

const statusConfig: Record<string, { icon: typeof PhoneIncoming; color: string }> = {
  answered: { icon: PhoneIncoming, color: 'text-green-500' },
  missed: { icon: PhoneMissed, color: 'text-red-500' },
  rejected: { icon: PhoneOff, color: 'text-gray-400' },
}

const toneColors: Record<string, string> = {
  sweet: 'bg-pink-100 text-pink-600',
  cold: 'bg-blue-100 text-blue-600',
  anxious: 'bg-yellow-100 text-yellow-700',
  angry: 'bg-red-100 text-red-600',
  neutral: 'bg-gray-100 text-gray-600',
  guilty: 'bg-purple-100 text-purple-600',
  vulnerable: 'bg-indigo-100 text-indigo-600',
  jealous: 'bg-green-100 text-green-700',
  avoidant: 'bg-slate-100 text-slate-600',
}

export default function CallLog({ onBack }: { onBack: () => void }) {
  const callLogs = useGameStore((s) => s.kakaoTalk.callLogs)
  const [tab, setTab] = useState<'all' | 'missed'>('all')

  const filtered = tab === 'missed' ? callLogs.filter((c) => c.status === 'missed') : callLogs

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="bg-[#FEE500] px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
            <ArrowLeft size={20} className="text-[#3C3C3C]" />
          </button>
          <h1 className="text-lg font-bold text-[#3C3C3C]">通话记录</h1>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === 'all'
                ? 'bg-[#3C3C3C] text-white'
                : 'bg-[#3C3C3C]/10 text-[#3C3C3C]'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setTab('missed')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === 'missed'
                ? 'bg-[#3C3C3C] text-white'
                : 'bg-[#3C3C3C]/10 text-[#3C3C3C]'
            }`}
          >
            未接
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((log: CallLogType) => {
          const config = statusConfig[log.status] || statusConfig.neutral
          const Icon = config.icon
          const toneStyle = toneColors[log.emotionalTone] || toneColors.neutral

          return (
            <div
              key={log.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-50"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 ${config.color}`}>
                <Icon size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#3C3C3C]">{log.with}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${toneStyle}`}>
                    {log.emotionalTone}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {log.time} · {log.duration}
                </p>
              </div>

              <div className={`w-2 h-2 rounded-full ${
                log.status === 'missed' ? 'bg-red-400' : log.status === 'answered' ? 'bg-green-400' : 'bg-gray-300'
              }`} />
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">暂无通话记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
