import { useState, useEffect, useRef } from 'react'
import { X, BookOpen, Heart, AlertTriangle, Flame, Moon, ChevronRight, Check, Maximize2 } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { getIdentityStory, getIdentityEvents, getIdentityEndings } from '@/data/storyData'
import type { StoryEvent, IdentityEnding } from '@/data/storyData'
import NarrativeReader from './NarrativeReader'

interface StoryProgressionProps {
  isOpen: boolean
  onClose: () => void
  onOpenNarrativeMode?: () => void
}

const eventTypeConfig = {
  sweet: { color: '#ff6b9d', bg: 'rgba(255,107,157,0.1)', border: 'rgba(255,107,157,0.3)', icon: Heart, label: '甜蜜' },
  crisis: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', icon: AlertTriangle, label: '危机' },
  explosion: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: Flame, label: '爆发' },
  dark: { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', icon: Moon, label: '黑暗' },
}

export default function StoryProgression({ isOpen, onClose, onOpenNarrativeMode }: StoryProgressionProps) {
  const state = useGameStore()
  const addNotification = useGameStore((s) => s.addNotification)
  const updateStats = useGameStore((s) => s.updateStats)
  const addHistoryEntry = useGameStore((s) => s.addHistoryEntry)
  const advanceTime = useGameStore((s) => s.advanceTime)

  const [displayedNarrative, setDisplayedNarrative] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<StoryEvent | null>(null)
  const [activeTab, setActiveTab] = useState<'reader' | 'events' | 'progress' | 'endings'>('reader')
  const narrativeRef = useRef<HTMLDivElement>(null)

  const identity = state.player.identity
  const storyOpening = getIdentityStory(identity)
  const storyEvents = getIdentityEvents(identity)
  const storyEndings = getIdentityEndings(identity)
  const isWeekOne = state.week === 1

  const completedEventIds = state.history
    .filter(h => h.memoryTags.some(t => t.startsWith('story_')))
    .map(h => h.event)

  useEffect(() => {
    if (isWeekOne && storyOpening && isOpen) {
      setIsTyping(true)
      setDisplayedNarrative([])
      let idx = 0
      const interval = setInterval(() => {
        if (idx < storyOpening.openingNarrative.length) {
          setDisplayedNarrative(prev => [...prev, storyOpening.openingNarrative[idx]])
          idx++
        } else {
          setIsTyping(false)
          clearInterval(interval)
        }
      }, 800)
      return () => clearInterval(interval)
    } else {
      setDisplayedNarrative(storyOpening?.openingNarrative || [])
      setIsTyping(false)
    }
  }, [isWeekOne, storyOpening, isOpen])

  useEffect(() => {
    if (narrativeRef.current) {
      narrativeRef.current.scrollTop = narrativeRef.current.scrollHeight
    }
  }, [displayedNarrative])

  const handleTriggerEvent = (event: StoryEvent, eventType: string) => {
    addNotification({
      id: `story_${event.id}_${Date.now()}`,
      app: 'kakaoTalk',
      title: `剧情事件：${event.title}`,
      content: event.description,
      urgency: eventType === 'dark' ? 'high' : eventType === 'explosion' ? 'high' : eventType === 'crisis' ? 'medium' : 'low',
      isRead: false,
      createdAt: Date.now(),
    })

    updateStats(event.effects)
    addHistoryEntry({
      week: state.week,
      day: state.day,
      event: event.title,
      choice: `触发${eventTypeConfig[eventType as keyof typeof eventTypeConfig].label}事件`,
      consequences: event.effects,
      memoryTags: [`story_${event.id}`, `story_type_${eventType}`],
    })

    setSelectedEvent(event)
  }

  const handleChoiceSelect = (event: StoryEvent, choiceId: string) => {
    const choice = event.choices.find(c => c.id === choiceId)
    if (!choice) return

    updateStats(choice.statChanges)
    advanceTime(4)
    addHistoryEntry({
      week: state.week,
      day: state.day,
      event: event.title,
      choice: choice.text,
      consequences: choice.statChanges,
      memoryTags: [`story_${event.id}_choice_${choiceId}`],
    })
    if ((choice.statChanges.fanSuspicion || 0) > 0 || (choice.statChanges.publicHeat || 0) > 0) {
      useGameStore.setState((current) => ({
        weverse: {
          ...current.weverse,
          posts: [
            ...current.weverse.posts,
            {
              id: `wv_story_after_${Date.now()}`,
              type: 'analysis',
              author: 'plot_watcher',
              title: '오늘 흐름이 좀 바뀐 것 같아',
              content: `剧情事件“${event.title}”之后，粉圈开始把新的选择后果接进时间线。有人说只是巧合，也有人开始等下一张图。`,
              heat: Math.min(100, 38 + current.risk.fanSuspicion + (choice.statChanges.publicHeat || 0)),
              comments: 80 + Math.floor(current.risk.publicHeat * 1.2),
              isPlayerAlt: false,
              relatedEvidenceIds: current.evidenceFragments.slice(-2).map((e) => e.id),
              createdAt: Date.now(),
            },
          ],
        },
      }))
      addNotification({
        id: `story_after_${Date.now()}`,
        app: 'weverse',
        title: '剧情后果发酵',
        content: '你的选择已经进入粉圈讨论，会在后续事件里继续发酵。',
        urgency: 'medium',
        isRead: false,
        createdAt: Date.now(),
      })
    } else if ((choice.statChanges.affection || 0) > 0 || (choice.statChanges.trust || 0) > 0) {
      addNotification({
        id: `story_soft_${Date.now()}`,
        app: 'kakaoTalk',
        title: '关系后果已记录',
        content: '这次选择会影响他之后的语气、记忆和主动性。',
        urgency: 'low',
        isRead: false,
        createdAt: Date.now(),
      })
    }
    setSelectedEvent(null)
  }

  const isEventCompleted = (eventId: string) => {
    return completedEventIds.includes(eventId) || state.history.some(h => h.memoryTags.includes(`story_${eventId}`))
  }

  const getAvailableEvents = (events: StoryEvent[], minWeek?: number) => {
    return events.filter(e => {
      if (isEventCompleted(e.id)) return false
      if (minWeek && state.week < minWeek) return false
      return true
    })
  }

  const getNextPhasePreview = () => {
    const phase = state.narrativePhase
    const week = state.week
    if (phase === '起') return '承 · 矛盾升级：更多身份专属危机即将到来'
    if (phase === '承') return '转 · 关键转折：爆发事件将改变一切'
    if (phase === '转') return '合 · 结局将至：你的选择决定最终走向'
    return '故事即将迎来结局...'
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(10, 5, 15, 0.9)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'rgba(20, 10, 30, 0.95)',
          border: '1px solid rgba(168,85,247,0.2)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-900/30">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-purple-400" />
            <h2 className="text-purple-300 font-bold text-lg">剧情</h2>
          </div>
          <div className="flex items-center gap-2">
            {onOpenNarrativeMode && (
              <button
                onClick={onOpenNarrativeMode}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                title="进入独立文游模式"
              >
                <Maximize2 size={14} className="text-white/70" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X size={14} className="text-white/70" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {storyOpening && (
            <div
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(168,85,247,0.08)',
                border: '1px solid rgba(168,85,247,0.15)',
              }}
            >
              <h3 className="text-purple-300 font-bold text-sm mb-2">{storyOpening.title}</h3>
              <p className="text-purple-400/60 text-xs mb-3">核心张力：{storyOpening.coreTension}</p>

              {isWeekOne && (
                <div
                  ref={narrativeRef}
                  className="max-h-40 overflow-y-auto space-y-1.5 mb-3 pr-1"
                >
                  {displayedNarrative.map((line, idx) => (
                    <p
                      key={idx}
                      className="text-white/70 text-xs leading-relaxed"
                      style={{
                        animation: 'fadeIn 0.5s ease-out',
                      }}
                    >
                      {line}
                    </p>
                  ))}
                  {isTyping && (
                    <span className="inline-block w-1.5 h-4 bg-purple-400 animate-pulse" />
                  )}
                </div>
              )}

              <div
                className="p-3 rounded-lg"
                style={{
                  background: 'rgba(34,211,238,0.05)',
                  border: '1px solid rgba(34,211,238,0.1)',
                }}
              >
                <p className="text-cyan-400/50 text-[10px] mb-1">他的第一条消息</p>
                <p className="text-cyan-300/80 text-xs">{storyOpening.firstMessageZh}</p>
                <p className="text-cyan-400/40 text-[10px] mt-1">{storyOpening.firstMessageKo}</p>
              </div>
            </div>
          )}

          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            {(['reader', 'events', 'progress', 'endings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: activeTab === tab ? 'rgba(168,85,247,0.15)' : 'transparent',
                  color: activeTab === tab ? '#c084fc' : 'rgba(255,255,255,0.4)',
                }}
              >
                {tab === 'reader' ? '正文' : tab === 'events' ? '事件' : tab === 'progress' ? '进度' : '结局'}
              </button>
            ))}
          </div>

          {activeTab === 'reader' && (
            <div className="relative overflow-hidden rounded-2xl bg-white">
              <NarrativeReader source="story_panel" compact />
            </div>
          )}

          {activeTab === 'events' && storyEvents && (
            <div className="space-y-3">
              {(['sweet', 'crisis', 'explosion', 'dark'] as const).map(eventType => {
                const config = eventTypeConfig[eventType]
                const Icon = config.icon
                const allEvents = storyEvents[`${eventType}Events` as keyof typeof storyEvents] as StoryEvent[]
                const available = getAvailableEvents(allEvents)
                const completed = allEvents.filter(e => isEventCompleted(e.id))

                if (allEvents.length === 0) return null

                return (
                  <div key={eventType}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={14} style={{ color: config.color }} />
                      <span className="text-xs font-bold" style={{ color: config.color }}>
                        {config.label}事件
                      </span>
                      <span className="text-white/20 text-[10px]">
                        {completed.length}/{allEvents.length}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {allEvents.map(event => {
                        const done = isEventCompleted(event.id)
                        return (
                          <div
                            key={event.id}
                            className="p-3 rounded-xl transition-all duration-200"
                            style={{
                              background: done ? 'rgba(255,255,255,0.02)' : config.bg,
                              border: done ? '1px solid rgba(255,255,255,0.04)' : `1px solid ${config.border}`,
                              opacity: done ? 0.5 : 1,
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-bold ${done ? 'text-white/30' : 'text-white/80'}`}>
                                {event.title}
                              </span>
                              {done ? (
                                <div className="flex items-center gap-1">
                                  <Check size={12} className="text-green-400/50" />
                                  <span className="text-green-400/50 text-[10px]">已完成</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleTriggerEvent(event, eventType)}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 hover:scale-105"
                                  style={{
                                    background: config.color,
                                    color: 'white',
                                    boxShadow: `0 0 10px ${config.color}33`,
                                  }}
                                >
                                  触发
                                </button>
                              )}
                            </div>
                            <p className="text-white/40 text-[10px] line-clamp-2">{event.description}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-3">
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className="text-white/50 text-xs mb-2">当前叙事阶段</p>
                <div className="flex items-center gap-3">
                  {(['起', '承', '转', '合'] as const).map(phase => (
                    <div
                      key={phase}
                      className="flex-1 text-center py-2 rounded-lg"
                      style={{
                        background: state.narrativePhase === phase ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
                        border: state.narrativePhase === phase ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: state.narrativePhase === phase ? '#c084fc' : 'rgba(255,255,255,0.2)',
                        }}
                      >
                        {phase}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(34,211,238,0.05)',
                  border: '1px solid rgba(34,211,238,0.1)',
                }}
              >
                <p className="text-cyan-400/60 text-xs mb-1">下一阶段预告</p>
                <p className="text-cyan-300/80 text-xs">{getNextPhasePreview()}</p>
              </div>

              {storyEvents && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <p className="text-white/50 text-xs mb-3">事件完成进度</p>
                  {(['sweet', 'crisis', 'explosion', 'dark'] as const).map(eventType => {
                    const config = eventTypeConfig[eventType]
                    const allEvents = storyEvents[`${eventType}Events` as keyof typeof storyEvents] as StoryEvent[]
                    const completed = allEvents.filter(e => isEventCompleted(e.id)).length
                    const total = allEvents.length
                    if (total === 0) return null
                    const pct = Math.round((completed / total) * 100)
                    return (
                      <div key={eventType} className="mb-2 last:mb-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px]" style={{ color: config.color }}>{config.label}</span>
                          <span className="text-white/30 text-[10px]">{completed}/{total}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: config.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {state.history.filter(h => h.memoryTags.some(t => t.startsWith('story_'))).length > 0 && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <p className="text-white/50 text-xs mb-3">剧情历史</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {state.history
                      .filter(h => h.memoryTags.some(t => t.startsWith('story_')))
                      .slice(-10)
                      .map(entry => (
                        <div key={entry.id} className="flex items-start gap-2">
                          <ChevronRight size={10} className="text-purple-400/50 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-white/60 text-[10px]">第{entry.week}周 · {entry.event}</p>
                            <p className="text-white/30 text-[10px]">{entry.choice}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'endings' && (
            <div className="space-y-2">
              <p className="text-white/40 text-xs mb-2">可能的结局（达成条件后解锁）</p>
              {storyEndings.map((ending: IdentityEnding) => {
                const typeColors: Record<string, string> = {
                  HE: '#22c55e',
                  NE: '#eab308',
                  BE: '#ef4444',
                  SE: '#a855f7',
                  GE: '#06b6d4',
                }
                const typeLabels: Record<string, string> = {
                  HE: 'HE',
                  NE: 'NE',
                  BE: 'BE',
                  SE: '特殊',
                  GE: 'GE',
                }
                return (
                  <div
                    key={ending.id}
                    className="p-3 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: `${typeColors[ending.type]}20`,
                          color: typeColors[ending.type],
                        }}
                      >
                        {typeLabels[ending.type]}
                      </span>
                      <span className="text-white/70 text-xs font-bold">{ending.title}</span>
                    </div>
                    <p className="text-white/30 text-[10px] mb-1">条件：{ending.condition}</p>
                    <p className="text-white/50 text-[10px]">{ending.description}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {selectedEvent && (
          <div
            className="p-4 border-t border-purple-900/30"
            style={{ background: 'rgba(20, 10, 30, 0.98)' }}
          >
            <h4 className="text-white/80 text-xs font-bold mb-2">{selectedEvent.title}</h4>
            <p className="text-white/50 text-[10px] mb-3">{selectedEvent.description}</p>
            <div className="space-y-1.5">
              {selectedEvent.choices.map(choice => (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceSelect(selectedEvent, choice.id)}
                  className="w-full text-left p-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(168,85,247,0.08)',
                    border: '1px solid rgba(168,85,247,0.15)',
                  }}
                >
                  <span className="text-white/70 text-xs">{choice.text}</span>
                  <p className="text-purple-400/40 text-[10px] mt-0.5">{choice.riskPreview}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full mt-2 px-4 py-2 rounded-xl text-xs font-medium"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              返回
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
