import { X, Heart, Shield, Eye, Flame, AlertTriangle, Brain, Sparkles, Home, Coins } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { getFandomStageLabel, getPaparazziStageLabel } from '@/engine/clueEngine'
import type { MentalTag, RelationshipStage, NarrativePhase, FandomStage, PaparazziStage } from '@/types/game'

interface StatItem {
  key: string
  label: string
  color: string
  getValue: (state: ReturnType<typeof useGameStore.getState>) => number
}

const stats: StatItem[] = [
  { key: 'affection', label: '好感度', color: '#ff2d78', getValue: (s) => s.maleLead.affection },
  { key: 'trust', label: '信任度', color: '#3b82f6', getValue: (s) => s.maleLead.trust },
  { key: 'secrecy', label: '恋情保密度', color: '#22c55e', getValue: (s) => s.risk.secrecy },
  { key: 'publicHeat', label: '舆论热度', color: '#f97316', getValue: (s) => s.risk.publicHeat },
  { key: 'companyAlert', label: '公司警觉度', color: '#ef4444', getValue: (s) => s.risk.companyAlert },
  { key: 'careerPressure', label: '事业压力', color: '#a855f7', getValue: (s) => s.maleLead.careerPressure },
  { key: 'popularity', label: '青春共鸣值', color: '#06b6d4', getValue: (s) => s.player.popularity },
  { key: 'lifeStability', label: '生活稳定度', color: '#14b8a6', getValue: (s) => s.player.lifeStability },
  { key: 'money', label: '金钱', color: '#eab308', getValue: (s) => s.player.money },
]

const stageLabels: Record<RelationshipStage, string> = {
  stranger: '陌生人',
  impression: '有印象',
  interest: '有好感',
  ambiguous: '暧昧期',
  confirmed: '已确认',
  passionate: '热恋中',
  trial: '考验期',
}

const stageColors: Record<RelationshipStage, string> = {
  stranger: '#6b7280',
  impression: '#3b82f6',
  interest: '#06b6d4',
  ambiguous: '#f97316',
  confirmed: '#ff2d78',
  passionate: '#ef4444',
  trial: '#a855f7',
}

const mentalTagLabels: Record<MentalTag, string> = {
  insecure: '不安',
  jealous: '嫉妒',
  exhausted: '疲惫',
  obsessive: '执念',
  numb: '麻木',
  angry: '愤怒',
  clearheaded: '清醒',
  dependent: '依赖',
  suspicious: '多疑',
  heartbroken: '心碎',
}

const phaseLabels: Record<NarrativePhase, string> = {
  '起': '起',
  '承': '承',
  '转': '转',
  '合': '合',
}

const fandomStageColors: Record<FandomStage, string> = {
  none: '#6b7280',
  familiar: '#3b82f6',
  small_talk: '#f59e0b',
  expose_post: '#f97316',
  public_controversy: '#ef4444',
  confirmed_crisis: '#991b1b',
}

const paparazziStageColors: Record<PaparazziStage, string> = {
  observing: '#22c55e',
  following: '#f59e0b',
  cross_referencing: '#f97316',
  preview: '#ef4444',
  expose: '#991b1b',
}

function CircularProgress({ value, color, label }: { value: number; color: string; label: string }) {
  const clampedValue = Math.max(0, Math.min(100, value))
  const angle = (clampedValue / 100) * 360

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center relative"
        style={{
          background: `conic-gradient(${color} ${angle}deg, rgba(255,255,255,0.06) ${angle}deg)`,
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: '#0a0a1a' }}
        >
          <span className="text-white text-xs font-bold">{clampedValue}</span>
        </div>
      </div>
      <span className="text-white/50 text-[10px]">{label}</span>
    </div>
  )
}

interface StatsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function StatsPanel({ isOpen, onClose }: StatsPanelProps) {
  const state = useGameStore()
  const fandomStage = useGameStore((s) => s.fandomStage)
  const paparazziStage = useGameStore((s) => s.paparazziStage)
  const hiddenRisk = useGameStore((s) => s.hiddenRisk)
  const clueLedger = useGameStore((s) => s.clueLedger)

  if (!isOpen) return null

  return (
    <div
      className="fixed right-0 top-0 bottom-0 w-80 z-50 flex flex-col overflow-hidden"
      style={{
        background: 'rgba(10, 10, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        animation: 'slideLeft 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h2 className="text-white font-bold">状态面板</h2>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X size={14} className="text-white/70" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: `${stageColors[state.maleLead.relationshipStage]}22`,
              color: stageColors[state.maleLead.relationshipStage],
              border: `1px solid ${stageColors[state.maleLead.relationshipStage]}44`,
            }}
          >
            {stageLabels[state.maleLead.relationshipStage]}
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: 'rgba(0,212,255,0.1)',
              color: '#00d4ff',
              border: '1px solid rgba(0,212,255,0.2)',
            }}
          >
            {phaseLabels[state.narrativePhase]}篇
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5 text-white/50 text-xs">
          <span>第 {state.week} 周</span>
          <span>·</span>
          <span>第 {state.day} 天</span>
          <span>·</span>
          <span>行动点: {state.player.actionPoints}</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat) => (
            <CircularProgress
              key={stat.key}
              value={stat.getValue(state)}
              color={stat.color}
              label={stat.label}
            />
          ))}
        </div>

        <div className="mb-5">
          <h3 className="text-white/60 text-xs mb-2">他的情绪</h3>
          <div
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(255,45,120,0.08)',
              border: '1px solid rgba(255,45,120,0.15)',
              color: '#ff6b9d',
            }}
          >
            {state.maleLead.emotionalState}
          </div>
        </div>

        {state.player.mentalTags.length > 0 && (
          <div className="mb-5">
            <h3 className="text-white/60 text-xs mb-2">心理标签</h3>
            <div className="flex flex-wrap gap-1.5">
              {state.player.mentalTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[10px]"
                  style={{
                    background: 'rgba(168,85,247,0.15)',
                    color: '#c084fc',
                    border: '1px solid rgba(168,85,247,0.2)',
                  }}
                >
                  {mentalTagLabels[tag]}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-5">
          <h3 className="text-white/60 text-xs mb-2">关系状态</h3>
          <div
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            {state.relationshipStatus === 'normal' ? '正常' :
             state.relationshipStatus === 'cold_war' ? '冷战' :
             state.relationshipStatus === 'cooling_off' ? '降温' : '危机'}
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-white/60 text-xs mb-2">饭圈动态</h3>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: fandomStageColors[fandomStage] }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: fandomStageColors[fandomStage] }}
            >
              {getFandomStageLabel(fandomStage)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: paparazziStageColors[paparazziStage] }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: paparazziStageColors[paparazziStage] }}
            >
              {getPaparazziStageLabel(paparazziStage)}
            </span>
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-white/60 text-xs mb-2">痕迹线索 ({clueLedger.length})</h3>
          {clueLedger.length === 0 ? (
            <div className="text-white/30 text-xs">暂无线索</div>
          ) : (
            <div className="flex flex-col gap-1">
              {clueLedger.slice(-5).reverse().map(c => (
                <div
                  key={c.id}
                  className="px-2 py-1 rounded text-[10px]"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: c.discovered ? '#ef4444' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {c.description}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-5">
          <h3 className="text-white/60 text-xs mb-2">隐藏风险</h3>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Lovestagram', value: hiddenRisk.lovestagramScore, color: '#ec4899' },
              { label: '同款指数', value: hiddenRisk.coupleItemScore, color: '#a855f7' },
              { label: '时间线重叠', value: hiddenRisk.timelineOverlap, color: '#f97316' },
              { label: '狗仔热度', value: hiddenRisk.paparazziHeat, color: '#ef4444' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-white/40 text-[10px]">{item.label}</span>
                  <span className="text-white/60 text-[10px]">{item.value}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.value}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
