import { useMemo, useState } from 'react'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { generateNarrativeTurn, resolveNarrativeChoice } from '@/engine/gemini'
import { createFallbackNarrativeTurn, resolveFallbackNarrativeChoice } from '@/engine/narrativeEngine'
import type { NarrativeChoice, NarrativeChoiceId, NarrativeTurnSource } from '@/types/game'

interface NarrativeReaderProps {
  source?: NarrativeTurnSource
  compact?: boolean
}

const stageLabels: Record<string, string> = {
  stranger: '陌生人',
  impression: '初印象',
  interest: '在意',
  ambiguous: '暧昧拉扯',
  confirmed: '秘密恋人',
  passionate: '热恋',
  trial: '试炼期',
}

function statLine(state: ReturnType<typeof useGameStore.getState>) {
  return [
    `好感度：${state.maleLead.affection}`,
    `人气值：${state.player.popularity}`,
    `心情值：${state.player.mood}`,
    `金钱：${state.player.money}`,
    `恋情保密度：${state.risk.secrecy}`,
    `公司警觉度：${state.risk.companyAlert}`,
    `事业压力：${state.maleLead.careerPressure}`,
    `青春共鸣值：${state.hiddenRisk.possessiveness}`,
    `生活稳定度：${state.player.lifeStability}`,
  ].join(' | ')
}

export default function NarrativeReader({ source = 'narrative_mode', compact = false }: NarrativeReaderProps) {
  const state = useGameStore()
  const activeTurn = useGameStore((s) => s.activeNarrativeTurn)
  const setActiveNarrativeTurn = useGameStore((s) => s.setActiveNarrativeTurn)
  const commitNarrativeChoice = useGameStore((s) => s.commitNarrativeChoice)
  const [loading, setLoading] = useState(false)
  const [freeInput, setFreeInput] = useState('')

  const turn = activeTurn || createFallbackNarrativeTurn(state, source)
  const header = useMemo(() => ({
    scene: turn.scene || '首尔某处',
    maleLead: `${state.maleLead.name}（${state.maleLead.stageName}）`,
    relationship: stageLabels[state.maleLead.relationshipStage] || state.maleLead.relationshipStage,
  }), [turn.scene, state.maleLead.name, state.maleLead.stageName, state.maleLead.relationshipStage])

  const startTurn = async () => {
    setLoading(true)
    try {
      const generated = await generateNarrativeTurn({ state: useGameStore.getState(), source })
      setActiveNarrativeTurn(generated)
    } catch {
      setActiveNarrativeTurn(createFallbackNarrativeTurn(useGameStore.getState(), source))
    } finally {
      setLoading(false)
    }
  }

  const choose = async (choice: NarrativeChoice) => {
    if (choice.freeInput && !freeInput.trim()) return
    setLoading(true)
    const current = useGameStore.getState()
    const choiceId = choice.id as NarrativeChoiceId
    try {
      const nextTurn = await resolveNarrativeChoice({
        state: current,
        turn,
        choiceId,
        freeInput: choice.freeInput ? freeInput.trim() : undefined,
      })
      commitNarrativeChoice(turn.id, choiceId, nextTurn, choice.freeInput ? freeInput.trim() : undefined)
    } catch {
      const nextTurn = resolveFallbackNarrativeChoice(current, turn, choiceId, choice.freeInput ? freeInput.trim() : undefined)
      commitNarrativeChoice(turn.id, choiceId, nextTurn, choice.freeInput ? freeInput.trim() : undefined)
    } finally {
      setFreeInput('')
      setLoading(false)
    }
  }

  return (
    <div className={`flex flex-col ${compact ? 'h-full' : 'min-h-[70vh]'} bg-white text-[#1C1C1E]`}>
      <div className="px-5 py-4 border-b border-black/5 bg-white/95 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#8E8E93]">首尔地下恋爱手记</p>
            <h2 className="text-base font-bold tracking-normal">今日正文</h2>
          </div>
          <button
            onClick={startTurn}
            disabled={loading}
            className="h-9 px-3 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            续写
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="text-[13px] leading-7 whitespace-pre-wrap mb-7">
          <p>{statLine(state)}</p>
          <p className="mt-4">第 {state.week} 周 | 当前场景：{header.scene}</p>
          <p className="mt-4">当前男主：{header.maleLead}</p>
          <p className="mt-4">当前关系阶段：【{header.relationship}】</p>
          <p className="mt-4">当前叙事段落：【{state.narrativePhase}】</p>
        </div>

        <div className="h-px bg-gray-200 mb-7" />

        <div className="space-y-5 text-[15px] leading-8">
          {turn.bodyLines.map((line, index) => (
            <p key={`${turn.id}_${index}`}>{line}</p>
          ))}
        </div>

        <div className="h-px bg-gray-200 my-7" />

        <div>
          <h3 className="text-base font-bold mb-4">【可选行动】</h3>
          <div className="space-y-3">
            {turn.choices.map((choice) => (
              <div key={choice.id} className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3">
                <button
                  onClick={() => choose(choice)}
                  disabled={loading || (choice.freeInput && !freeInput.trim())}
                  className="w-full text-left disabled:opacity-50"
                >
                  <p className="text-sm font-bold">{choice.id}. {choice.text}</p>
                  <p className="text-[11px] text-[#8E8E93] mt-1">{choice.riskPreview}</p>
                </button>
                {choice.freeInput && (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={freeInput}
                      onChange={(event) => setFreeInput(event.target.value)}
                      placeholder="输入你想做的自由行动"
                      className="flex-1 h-9 rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-blue-300"
                    />
                    <button
                      onClick={() => choose(choice)}
                      disabled={loading || !freeInput.trim()}
                      className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center disabled:opacity-50"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
          <div className="rounded-full bg-white shadow-lg px-4 py-2 text-xs text-blue-600 flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            正在续写这一段...
          </div>
        </div>
      )}
    </div>
  )
}
