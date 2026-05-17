import { RotateCcw, Smartphone, BookOpen } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { Ending } from '@/types/game'

const endingThemes: Record<Ending['type'], { bg: string; accent: string; label: string; glow: string }> = {
  HE: {
    bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 30%, #1a1030 100%)',
    accent: '#ff6b9d',
    label: 'Happy Ending',
    glow: 'rgba(255,107,157,0.3)',
  },
  OE: {
    bg: 'linear-gradient(135deg, #0a1a2e 0%, #1b2d4e 30%, #0a1030 100%)',
    accent: '#60a5fa',
    label: 'Open Ending',
    glow: 'rgba(96,165,250,0.3)',
  },
  BE: {
    bg: 'linear-gradient(135deg, #1a0a0a 0%, #2d1b1b 30%, #1a0a0a 100%)',
    accent: '#ef4444',
    label: 'Bad Ending',
    glow: 'rgba(239,68,68,0.3)',
  },
  SE: {
    bg: 'linear-gradient(135deg, #0a1a1a 0%, #1b2d2d 30%, #0a1a1a 100%)',
    accent: '#14b8a6',
    label: 'Self Ending',
    glow: 'rgba(20,184,166,0.3)',
  },
  GE: {
    bg: 'linear-gradient(135deg, #1a1a0a 0%, #2d2d1b 30%, #1a1a0a 100%)',
    accent: '#eab308',
    label: 'Growth Ending',
    glow: 'rgba(234,179,8,0.3)',
  },
}

interface EndingScreenProps {
  ending: Ending
}

export default function EndingScreen({ ending }: EndingScreenProps) {
  const state = useGameStore()
  const setPhase = useGameStore((s) => s.setPhase)
  const theme = endingThemes[ending.type]

  const keyChoices = state.history
    .filter((h) => h.memoryTags && h.memoryTags.length > 0)
    .slice(-5)

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-y-auto"
      style={{ background: theme.bg }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 120px ${theme.glow}`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto px-6 py-10 w-full">
        <div
          className="px-4 py-1.5 rounded-full text-xs font-bold mb-6"
          style={{
            background: `${theme.accent}22`,
            color: theme.accent,
            border: `1px solid ${theme.accent}44`,
          }}
        >
          {theme.label}
        </div>

        <h1
          className="text-3xl md:text-4xl font-black text-center mb-4"
          style={{
            color: theme.accent,
            textShadow: `0 0 20px ${theme.glow}`,
          }}
        >
          {ending.title}
        </h1>

        <p className="text-white/60 text-sm leading-relaxed text-center mb-8 max-w-sm">
          {ending.description}
        </p>

        <div
          className="w-full max-w-xs rounded-2xl p-4 mb-8"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Smartphone size={14} style={{ color: theme.accent }} />
            <span className="text-white/50 text-xs">手机画面</span>
          </div>
          <div className="flex flex-col gap-1">
            {ending.phoneDisplay.split('\n').map((line, i) => (
              <p key={i} className="text-white/40 text-[11px] leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>

        <div
          className="w-full max-w-xs rounded-2xl p-4 mb-8"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <h3 className="text-white/50 text-xs mb-3">最终状态</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '好感度', value: state.maleLead.affection },
              { label: '信任度', value: state.maleLead.trust },
              { label: '保密度', value: state.risk.secrecy },
              { label: '舆论', value: state.risk.publicHeat },
              { label: '公司警觉', value: state.risk.companyAlert },
              { label: '事业压力', value: state.maleLead.careerPressure },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="text-white/30 text-[10px]">{s.label}</span>
                <span className="text-white font-bold text-sm">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {keyChoices.length > 0 && (
          <div
            className="w-full max-w-xs rounded-2xl p-4 mb-8"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={14} style={{ color: theme.accent }} />
              <h3 className="text-white/50 text-xs">关键选择回顾</h3>
            </div>
            <div className="flex flex-col gap-2">
              {keyChoices.map((choice) => (
                <div
                  key={choice.id}
                  className="px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <p className="text-white/50 text-[11px]">{choice.event}</p>
                  <p style={{ color: theme.accent }} className="text-[10px] mt-0.5">→ {choice.choice}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setPhase('cover')}
          className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
            color: 'white',
            boxShadow: `0 0 20px ${theme.glow}`,
          }}
        >
          <RotateCcw size={16} />
          重新开始
        </button>
      </div>
    </div>
  )
}
