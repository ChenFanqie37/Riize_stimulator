import { X, Heart, Users, MessageCircle, CheckCircle2, Circle, ChevronRight } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { RelationshipStage } from '@/types/game'

interface RelationshipGuideProps {
  isOpen: boolean
  onClose: () => void
}

const stageData: {
  key: RelationshipStage
  label: string
  affectionRange: string
  milestone: string
  unlock: string
  color: string
  tasks: string[]
}[] = [
  {
    key: 'stranger',
    label: '陌生人',
    affectionRange: '0-9',
    milestone: '初次相遇',
    unlock: '社交平台互动',
    color: '#6b7280',
    tasks: ['收到他的第一条消息', '在社交平台与他互动'],
  },
  {
    key: 'impression',
    label: '初印象',
    affectionRange: '10-24',
    milestone: '记住彼此',
    unlock: '日常聊天',
    color: '#3b82f6',
    tasks: ['回复他的消息3次', '在约会中留下好印象'],
  },
  {
    key: 'interest',
    label: '有好感',
    affectionRange: '25-39',
    milestone: '主动联系',
    unlock: '约会系统',
    color: '#06b6d4',
    tasks: ['主动发起一次约会', '获得他的信任'],
  },
  {
    key: 'ambiguous',
    label: '暧昧',
    affectionRange: '40-54',
    milestone: '心照不宣',
    unlock: '深夜通话',
    color: '#f97316',
    tasks: ['确认关系', '度过第一次危机'],
  },
  {
    key: 'confirmed',
    label: '已确认',
    affectionRange: '55-69',
    milestone: '正式在一起',
    unlock: '秘密约会',
    color: '#ff2d78',
    tasks: ['公开或保持秘密', '应对公司压力'],
  },
  {
    key: 'passionate',
    label: '热恋',
    affectionRange: '70-84',
    milestone: '最甜蜜时光',
    unlock: '旅行约会',
    color: '#ef4444',
    tasks: ['维持热恋', '应对外界挑战'],
  },
  {
    key: 'trial',
    label: '考验期',
    affectionRange: '85-100',
    milestone: '命运抉择',
    unlock: '最终结局',
    color: '#a855f7',
    tasks: ['做出最终选择'],
  },
]

const affectionThresholds: Record<RelationshipStage, number> = {
  stranger: 0,
  impression: 10,
  interest: 25,
  ambiguous: 40,
  confirmed: 55,
  passionate: 70,
  trial: 85,
}

const nextStageThreshold: Record<RelationshipStage, number> = {
  stranger: 10,
  impression: 25,
  interest: 40,
  ambiguous: 55,
  confirmed: 70,
  passionate: 85,
  trial: 100,
}

const stageAdvice: Record<RelationshipStage, string[]> = {
  stranger: ['浏览Instagram了解他', '查看Weverse粉丝动态', '等待命运安排的相遇'],
  impression: ['回复他的消息保持互动', '分享你的日常生活', '关注他的社交动态'],
  interest: ['主动找话题聊天', '安排一次偶遇', '展示你的独特魅力'],
  ambiguous: ['试探他的心意', '创造独处的机会', '注意保持距离感'],
  confirmed: ['享受甜蜜时光', '小心维护秘密', '与闺蜜商量对策'],
  passionate: ['珍惜每一刻', '警惕外界风险', '保持自我独立'],
  trial: ['面对内心真实感受', '做出不后悔的选择', '相信自己的判断'],
}

function ProgressBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-white/50 text-[10px]">{label}</span>
        <span className="text-white/40 text-[10px]">{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 6px ${color}66`,
          }}
        />
      </div>
    </div>
  )
}

export default function RelationshipGuide({ isOpen, onClose }: RelationshipGuideProps) {
  const state = useGameStore()
  const currentStage = state.maleLead.relationshipStage
  const affection = state.maleLead.affection
  const trust = state.maleLead.trust
  const boyfriendName = state.maleLead.name
  const bestieName = state.player.bestieName || '闺蜜'
  const bestieThread = state.kakaoTalk.threads.find((t) => t.id === 'thread_bestie')
  const bestieMessageCount = bestieThread ? bestieThread.messages.length : 0
  const bestieIntimacy = Math.min(100, 30 + bestieMessageCount * 5)
  const currentStageIdx = stageData.findIndex((s) => s.key === currentStage)
  const nextThreshold = nextStageThreshold[currentStage]
  const affectionNeeded = Math.max(0, nextThreshold - affection)

  const recentMilestones = state.history
    .slice(-5)
    .reverse()
    .filter((h) => h.memoryTags.some((tag) => tag.includes('关系') || tag.includes('好感') || tag.includes('约会') || tag.includes('相遇')))

  if (!isOpen) return null

  return (
    <div
      className="fixed right-0 top-0 bottom-0 w-96 z-50 flex flex-col overflow-hidden"
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
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 8px var(--glow-color); }
          50% { box-shadow: 0 0 20px var(--glow-color); }
        }
        @keyframes fillBar {
          from { width: 0%; }
        }
      `}</style>

      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Heart size={16} style={{ color: '#ff2d78' }} />
          <h2 className="text-white font-bold">关系指南</h2>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X size={14} className="text-white/70" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {currentStage === 'stranger' && (
          <div
            className="mb-5 p-4 rounded-xl"
            style={{
              background: 'rgba(107, 114, 128, 0.1)',
              border: '1px solid rgba(107, 114, 128, 0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} style={{ color: '#9ca3af' }} />
              <span className="text-white font-bold text-sm">你们现在还不认识</span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">
              你和{boyfriendName}目前是陌生人。通过社交平台、工作接触或偶然相遇来建立初步印象。
            </p>
            <div className="flex flex-col gap-1.5 mt-3">
              {stageAdvice.stranger.map((action) => (
                <div key={action} className="flex items-center gap-2">
                  <ChevronRight size={12} style={{ color: '#9ca3af' }} />
                  <span className="text-white/50 text-xs">{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-5">
          <h3 className="text-white/60 text-xs mb-3">关系阶段</h3>
          <div className="flex flex-col gap-1.5">
            {stageData.map((stage, idx) => {
              const isCurrent = stage.key === currentStage
              const isPast = idx < currentStageIdx
              const isFuture = idx > currentStageIdx
              const progressInStage = isCurrent
                ? Math.min(100, ((affection - affectionThresholds[stage.key]) / (nextStageThreshold[stage.key] - affectionThresholds[stage.key])) * 100)
                : isPast
                  ? 100
                  : 0

              return (
                <div
                  key={stage.key}
                  className="p-3 rounded-xl transition-all duration-300"
                  style={{
                    background: isCurrent ? `${stage.color}12` : 'rgba(255,255,255,0.02)',
                    border: isCurrent
                      ? `1.5px solid ${stage.color}55`
                      : '1px solid rgba(255,255,255,0.05)',
                    ['--glow-color' as string]: `${stage.color}44`,
                    animation: isCurrent ? 'glowPulse 2s ease-in-out infinite' : 'none',
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {isPast ? (
                        <CheckCircle2 size={14} style={{ color: stage.color }} />
                      ) : (
                        <Circle size={14} style={{ color: isCurrent ? stage.color : 'rgba(255,255,255,0.15)' }} />
                      )}
                      <span
                        className="text-xs font-bold"
                        style={{ color: isCurrent ? stage.color : isPast ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)' }}
                      >
                        {stage.label}
                      </span>
                    </div>
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      好感 {stage.affectionRange}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {stage.milestone}
                    </span>
                    <span className="text-[10px]" style={{ color: `${stage.color}66` }}>
                      · {stage.unlock}
                    </span>
                  </div>
                  {(isCurrent || isPast) && (
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${progressInStage}%`,
                          background: `linear-gradient(90deg, ${stage.color}, ${stage.color}88)`,
                          animation: 'fillBar 0.7s ease-out',
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-white/60 text-xs mb-3">当前任务</h3>
          <div className="flex flex-col gap-2">
            {stageData.find((s) => s.key === currentStage)?.tasks.map((task) => {
              const completed = task.includes('消息')
                ? state.kakaoTalk.threads.some((t) => t.id === 'thread_boyfriend' && t.messages.length > 0)
                : false
              return (
                <div
                  key={task}
                  className="flex items-center gap-2 p-2.5 rounded-lg"
                  style={{
                    background: completed ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
                    border: completed ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {completed ? (
                    <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle size={14} className="text-white/20 flex-shrink-0" />
                  )}
                  <span className={`text-xs ${completed ? 'text-green-400/70 line-through' : 'text-white/50'}`}>
                    {task}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-white/60 text-xs mb-3">闺蜜关系</h3>
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(244,114,182,0.06)',
              border: '1px solid rgba(244,114,182,0.15)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={14} style={{ color: '#f472b6' }} />
                <span className="text-white text-sm font-bold">{bestieName}</span>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  background: 'rgba(244,114,182,0.15)',
                  color: '#f472b6',
                  border: '1px solid rgba(244,114,182,0.25)',
                }}
              >
                闺蜜
              </span>
            </div>
            <ProgressBar value={bestieIntimacy} max={100} color="#f472b6" label="亲密度" />
            <p className="text-white/30 text-[10px] mt-2">
              {bestieIntimacy >= 80
                ? `${bestieName}是你最信任的人，什么都可以和她说`
                : bestieIntimacy >= 50
                  ? `和${bestieName}越来越亲密了`
                  : `多和${bestieName}聊天增进感情吧`}
            </p>
            {currentStage !== 'stranger' && (
              <div className="mt-3 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-white/40 text-[10px]">
                  💬 {bestieName}的建议：{stageAdvice[currentStage]?.[0] || '加油！'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-white/60 text-xs mb-3">进展</h3>
          <div className="flex flex-col gap-3">
            <ProgressBar value={affection} max={100} color="#ff2d78" label="好感度" />
            <ProgressBar value={trust} max={100} color="#3b82f6" label="信任度" />
            {currentStage !== 'trial' && (
              <p className="text-white/30 text-[10px]">
                距离下一阶段还需: 好感+{affectionNeeded}
              </p>
            )}
          </div>
        </div>

        {recentMilestones.length > 0 && (
          <div className="mb-5">
            <h3 className="text-white/60 text-xs mb-3">近期里程碑</h3>
            <div className="flex flex-col gap-2">
              {recentMilestones.map((entry) => (
                <div
                  key={entry.id}
                  className="p-2.5 rounded-lg"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <p className="text-white/50 text-xs">{entry.event}</p>
                  <p className="text-white/25 text-[10px] mt-1">
                    第{entry.week}周 · 第{entry.day}天
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
