import { Moon, Zap, Brain, Heart } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { MentalTag } from '@/types/game'

const tagConfig: Record<MentalTag, { label: string; color: string; bg: string }> = {
  insecure: { label: '不安', color: '#F97316', bg: '#FFF7ED' },
  jealous: { label: '嫉妒', color: '#10B981', bg: '#ECFDF5' },
  exhausted: { label: '疲惫', color: '#6B7280', bg: '#F9FAFB' },
  obsessive: { label: '执念', color: '#8B5CF6', bg: '#FAF5FF' },
  numb: { label: '麻木', color: '#4B5563', bg: '#F3F4F6' },
  angry: { label: '愤怒', color: '#EF4444', bg: '#FEF2F2' },
  clearheaded: { label: '清醒', color: '#06B6D4', bg: '#ECFEFF' },
  dependent: { label: '依赖', color: '#EC4899', bg: '#FDF2F8' },
  suspicious: { label: '多疑', color: '#A855F7', bg: '#FAF5FF' },
  heartbroken: { label: '心碎', color: '#DC2626', bg: '#FEF2F2' },
}

function getMoodLabel(mood: number): { label: string; emoji: string } {
  if (mood >= 80) return { label: '心情很好', emoji: '😊' }
  if (mood >= 60) return { label: '还不错', emoji: '🙂' }
  if (mood >= 40) return { label: '有点低落', emoji: '😐' }
  if (mood >= 20) return { label: '很糟糕', emoji: '😔' }
  return { label: '濒临崩溃', emoji: '😭' }
}

function getTip(sleep: number, stress: number, mental: number): string {
  if (mental < 30) return '你的精神状态很差，建议休息或找朋友倾诉'
  if (stress > 70) return '压力过高！试着减少社交活动，给自己一些空间'
  if (sleep < 30) return '严重睡眠不足，今晚早点休息吧'
  if (sleep < 50 && stress > 50) return '睡眠不足加上压力，小心身体撑不住'
  return '状态还不错，继续保持规律作息'
}

export default function HealthPanel() {
  const health = useGameStore((s) => s.health)
  const player = useGameStore((s) => s.player)
  const moodInfo = getMoodLabel(player.mood)

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #0D9488, #14B8A6)' }}>
        <h1 className="text-white font-bold text-lg">健康</h1>
        <p className="text-white/70 text-[10px]">身心状态</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 flex items-center justify-center gap-3 border-b border-gray-50">
          <span className="text-3xl">{moodInfo.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{moodInfo.label}</p>
            <p className="text-[10px] text-gray-400">心情指数 {player.mood}/100</p>
          </div>
        </div>

        <div className="px-4 py-3 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Moon size={14} className="text-blue-500" />
                <span className="text-xs font-medium text-gray-700">睡眠</span>
              </div>
              <span className="text-[10px] text-gray-400">{health.sleep}/100</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${health.sleep}%`,
                  backgroundColor: health.sleep > 60 ? '#3B82F6' : health.sleep > 30 ? '#F59E0B' : '#EF4444',
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-red-500" />
                <span className="text-xs font-medium text-gray-700">压力</span>
              </div>
              <span className="text-[10px] text-gray-400">{health.stress}/100</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${health.stress}%`,
                  backgroundColor: health.stress > 70 ? '#EF4444' : health.stress > 40 ? '#F59E0B' : '#22C55E',
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Brain size={14} className="text-green-500" />
                <span className="text-xs font-medium text-gray-700">精神</span>
              </div>
              <span className="text-[10px] text-gray-400">{health.mentalHealth}/100</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${health.mentalHealth}%`,
                  backgroundColor: health.mentalHealth > 60 ? '#22C55E' : health.mentalHealth > 30 ? '#F59E0B' : '#EF4444',
                }}
              />
            </div>
          </div>
        </div>

        {player.mentalTags.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50">
            <p className="text-[10px] text-gray-400 mb-2">心理标签</p>
            <div className="flex flex-wrap gap-1.5">
              {player.mentalTags.map((tag) => {
                const cfg = tagConfig[tag]
                return (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <div className="px-4 py-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 mb-1">
            <Heart size={12} className="text-teal-500" />
            <span className="text-[10px] text-gray-400">健康建议</span>
          </div>
          <p className="text-[11px] text-gray-600">{getTip(health.sleep, health.stress, health.mentalHealth)}</p>
        </div>
      </div>
    </div>
  )
}
