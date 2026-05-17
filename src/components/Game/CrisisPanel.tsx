import { useState } from 'react'
import { X, AlertTriangle, Ghost, Trash2, UserCheck, Cloud, Shield, Sword, Handshake, FolderLock } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { LucideIcon } from 'lucide-react'

interface Strategy {
  id: string
  name: string
  icon: LucideIcon
  description: string
  riskLevel: number
  benefitLevel: number
  consequence: string
}

const strategies: Strategy[] = [
  {
    id: 'play_dead',
    name: '装死',
    icon: Ghost,
    description: '消失一段时间，不回应任何消息和动态，让热度自然冷却',
    riskLevel: 2,
    benefitLevel: 3,
    consequence: '舆论热度-10，但好感度-8，信任度-5。他可能会很担心或很生气。',
  },
  {
    id: 'delete_evidence',
    name: '删除证据',
    icon: Trash2,
    description: '迅速删除所有可疑的聊天记录、照片和动态',
    riskLevel: 3,
    benefitLevel: 4,
    consequence: '证据减少，但删帖行为本身可能被截图。粉丝怀疑度+5，恋情保密度+10。',
  },
  {
    id: 'boyfriend_explain',
    name: '让男友解释',
    icon: UserCheck,
    description: '让他出面解释或否认，利用他的公众形象平息风波',
    riskLevel: 4,
    benefitLevel: 3,
    consequence: '他出面可以暂时平息，但公司警觉度+15，事业压力+10。他可能因此被公司约谈。',
  },
  {
    id: 'smoke_bomb',
    name: '发烟雾弹',
    icon: Cloud,
    description: '发布误导性信息，制造假象混淆视听',
    riskLevel: 3,
    benefitLevel: 2,
    consequence: '暂时转移注意力，但如果被识破，信任度-15，舆论热度+10。风险很高。',
  },
  {
    id: 'control_narrative',
    name: '控评',
    icon: Shield,
    description: '通过小号和盟友引导舆论方向，压制不利言论',
    riskLevel: 2,
    benefitLevel: 3,
    consequence: '舆论热度-8，粉丝怀疑度-5。但需要消耗大量精力和金钱-10。',
  },
  {
    id: 'confront',
    name: '正面硬刚',
    icon: Sword,
    description: '直接承认或正面回应，以攻为守',
    riskLevel: 5,
    benefitLevel: 5,
    consequence: '最激进的策略。如果好感度和信任度够高，可能走向公开；否则一切崩塌。舆论热度+30，公司警觉度+25。',
  },
  {
    id: 'ask_manager',
    name: '求助经纪人',
    icon: Handshake,
    description: '向他的经纪人求助，寻求公司层面的保护',
    riskLevel: 3,
    benefitLevel: 4,
    consequence: '经纪人可能帮忙，但也可能成为公司的把柄。公司警觉度+20，但事业压力-10。',
  },
  {
    id: 'preserve_evidence',
    name: '保存证据',
    icon: FolderLock,
    description: '保留所有证据以备不时之需，不做任何删除或回应',
    riskLevel: 1,
    benefitLevel: 2,
    consequence: '最保守的策略。证据保留完整，但舆论热度+5，粉丝怀疑度+5。等待时间可能让事态恶化。',
  },
]

const levelColors = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#dc2626']

interface CrisisPanelProps {
  onClose: () => void
}

export default function CrisisPanel({ onClose }: CrisisPanelProps) {
  const state = useGameStore()
  const performAction = useGameStore((s) => s.performAction)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)

  const crisisLevel = Math.min(5, Math.max(1, Math.floor(state.risk.publicHeat / 20)))

  const crisisDescriptions: Record<number, string> = {
    1: '有粉丝开始注意到一些蛛丝马迹...',
    2: '粉圈出现了关于你的讨论帖',
    3: 'D社收到了匿名爆料，正在调查',
    4: '你的照片和信息已经在粉圈流传',
    5: '恋情即将曝光！D社已经掌握了关键证据',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(10, 5, 5, 0.9)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <style>{`
        @keyframes crisisPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.3); }
          50% { box-shadow: 0 0 40px rgba(239,68,68,0.6), 0 0 60px rgba(239,68,68,0.2); }
        }
        @keyframes warningBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(30, 10, 10, 0.95)',
          border: '1px solid rgba(239,68,68,0.3)',
          animation: 'crisisPulse 2s ease-in-out infinite',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-red-900/30">
          <div className="flex items-center gap-3">
            <AlertTriangle
              size={20}
              className="text-red-500"
              style={{ animation: 'warningBlink 1s ease-in-out infinite' }}
            />
            <h2 className="text-red-400 font-bold text-lg">危机警报</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={14} className="text-white/70" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="w-6 h-3 rounded-sm"
                  style={{
                    background: i < crisisLevel ? levelColors[Math.min(i, 4)] : 'rgba(255,255,255,0.08)',
                  }}
                />
              ))}
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: levelColors[crisisLevel - 1] }}
            >
              危机等级 {crisisLevel}
            </span>
          </div>

          <p className="text-white/60 text-sm mb-5">
            {crisisDescriptions[crisisLevel]}
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {strategies.map((strategy) => {
              const Icon = strategy.icon
              return (
                <button
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy)}
                  className="text-left p-3 rounded-xl transition-all duration-200"
                  style={{
                    background: selectedStrategy?.id === strategy.id
                      ? 'rgba(239,68,68,0.15)'
                      : 'rgba(255,255,255,0.03)',
                    border: selectedStrategy?.id === strategy.id
                      ? '1px solid rgba(239,68,68,0.4)'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} className="text-red-400" />
                    <span className="text-white/80 text-xs font-bold">{strategy.name}</span>
                  </div>
                  <p className="text-white/30 text-[10px] line-clamp-2">{strategy.description}</p>
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-[9px]" style={{ color: levelColors[strategy.riskLevel - 1] }}>
                      风险:{'★'.repeat(strategy.riskLevel)}
                    </span>
                    <span className="text-[9px] text-green-400/70">
                      收益:{'★'.repeat(strategy.benefitLevel)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedStrategy && (
            <div
              className="p-4 rounded-xl mb-4"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.15)',
              }}
            >
              <p className="text-red-300/80 text-xs mb-3">{selectedStrategy.consequence}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedStrategy(null)}
                  className="flex-1 px-4 py-2 rounded-xl text-xs font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  再想想
                </button>
                <button
                  onClick={() => {
                    performAction(`crisis_${selectedStrategy.id}`)
                    setSelectedStrategy(null)
                    onClose()
                  }}
                  className="flex-1 px-4 py-2 rounded-xl text-xs font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    boxShadow: '0 0 15px rgba(239,68,68,0.3)',
                  }}
                >
                  执行策略
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
