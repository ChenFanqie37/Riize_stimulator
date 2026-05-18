import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Mic, Phone, Send, Play, Languages } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { useSettingsStore } from '@/store/settingsStore'
import { generateChatReply, generateBestieReply } from '@/engine/gemini'
import type { ChatMessage, MessageCategory } from '@/types/game'

const categoryConfig: Record<MessageCategory, { icon: string; label: string; bg: string; color: string }> = {
  sweet: { icon: '💕', label: '甜蜜消息', bg: 'rgba(244,114,182,0.08)', color: 'rgba(244,114,182,0.8)' },
  emotional: { icon: '😢', label: '情绪消息', bg: 'rgba(96,165,250,0.08)', color: 'rgba(96,165,250,0.8)' },
  warning: { icon: '⚠️', label: '警告消息', bg: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.8)' },
  call_record: { icon: '📞', label: '通话记录', bg: 'rgba(34,197,94,0.08)', color: 'rgba(34,197,94,0.8)' },
  system: { icon: '🔔', label: '系统消息', bg: 'rgba(156,163,175,0.08)', color: 'rgba(156,163,175,0.8)' },
}

function inferCategory(msg: ChatMessage): MessageCategory | null {
  if (msg.category) return msg.category
  if (msg.isVoice) return 'call_record'
  if (msg.sender === 'npc' && msg.senderName !== msg.senderName) return 'system'
  if (msg.emotion === 'sweet' || msg.emotion === 'vulnerable') return 'sweet'
  if (msg.emotion === 'anxious' || msg.emotion === 'jealous' || msg.emotion === 'guilty') return 'emotional'
  if (msg.emotion === 'angry' || msg.emotion === 'cold' || msg.emotion === 'avoidant') return 'warning'
  return null
}

function CategoryTag({ category }: { category: MessageCategory }) {
  const config = categoryConfig[category]
  return (
    <div className="flex justify-center my-1">
      <span
        className="text-[9px] px-2 py-0.5 rounded-full"
        style={{
          background: config.bg,
          color: config.color,
          border: `1px solid ${config.color}20`,
        }}
      >
        {config.icon} {config.label}
      </span>
    </div>
  )
}

export default function ChatRoom() {
  const currentChatThreadId = useGameStore((s) => s.currentChatThreadId)
  const threads = useGameStore((s) => s.kakaoTalk.threads)
  const isTyping = useGameStore((s) => s.isTyping)
  const relationshipStatus = useGameStore((s) => s.relationshipStatus)
  const maleLead = useGameStore((s) => s.maleLead)
  const player = useGameStore((s) => s.player)
  const week = useGameStore((s) => s.week)
  const day = useGameStore((s) => s.day)
  const timeOfDay = useGameStore((s) => s.timeOfDay)
  const weather = useGameStore((s) => s.weather)
  const risk = useGameStore((s) => s.risk)
  const clueLedger = useGameStore((s) => s.clueLedger)
  const hiddenRisk = useGameStore((s) => s.hiddenRisk)
  const fandomStage = useGameStore((s) => s.fandomStage)
  const paparazziStage = useGameStore((s) => s.paparazziStage)
  const sendMessage = useGameStore((s) => s.sendMessage)
  const receiveMessage = useGameStore((s) => s.receiveMessage)
  const openChat = useGameStore((s) => s.openChat)
  const updateStats = useGameStore((s) => s.updateStats)
  const triggerMessageBanner = useGameStore((s) => s.triggerMessageBanner)

  const showTranslation = useSettingsStore((s) => s.showTranslation)
  const toggleTranslation = useSettingsStore((s) => s.toggleTranslation)

  const [input, setInput] = useState('')
  const [localTyping, setLocalTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const thread = threads.find((t) => t.id === currentChatThreadId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.messages.length, localTyping])

  const handleSend = async () => {
    if (!input.trim() || !thread) return
    const text = input.trim()
    setInput('')

    sendMessage(thread.id, text, text)

    if (thread.id === 'thread_boyfriend') {
      setLocalTyping(true)
      try {
        const recentMessages = thread.messages.slice(-6).map(
          (m) => `${m.senderName}: ${m.textZh}`
        )
        const recentClues = clueLedger.slice(-8).map(c =>
          `[${c.clueType}] ${c.description} (severity:${c.severity})`
        )
        const hiddenRiskSummary = `Lovestagram:${hiddenRisk.lovestagramScore} CoupleItem:${hiddenRisk.coupleItemScore} Timeline:${hiddenRisk.timelineOverlap} Paparazzi:${hiddenRisk.paparazziHeat} Possessiveness:${hiddenRisk.possessiveness}`
        const context = {
          boyfriendName: maleLead.name,
          boyfriendPersona: maleLead.hiddenPersona,
          relationshipStage: maleLead.relationshipStage,
          affection: maleLead.affection,
          trust: maleLead.trust,
          emotionalState: maleLead.emotionalState,
          recentMessages,
          playerMessage: text,
          week,
          day,
          timeOfDay,
          weather,
          mood: player.mood,
          secrecy: risk.secrecy,
          companyAlert: risk.companyAlert,
          fanSuspicion: risk.fanSuspicion,
          memory: maleLead.memory.keyMemories,
          recentEvents: maleLead.memory.unresolvedIssues,
          mentalTags: player.mentalTags,
          relationshipStatus,
          recentClues,
          hiddenRiskSummary,
          fandomStage,
          paparazziStage,
        }
        const reply = await generateChatReply(context)
        const replyMsg: ChatMessage = {
          id: `msg_${Date.now()}`,
          sender: 'boyfriend',
          senderName: maleLead.name,
          textKo: reply.messageKo,
          textZh: reply.messageZh,
          timestamp: Date.now(),
          isRead: true,
          isRecalled: false,
          emotion: reply.emotion,
        }
        receiveMessage(thread.id, replyMsg)
        if (reply.statChanges && Object.keys(reply.statChanges).length > 0) {
          updateStats(reply.statChanges)
        }
        triggerMessageBanner(
          thread.id,
          maleLead.name,
          reply.messageZh.slice(0, 20),
          maleLead.name.charAt(0)
        )
      } catch {
        const fallbackMsg: ChatMessage = {
          id: `msg_${Date.now()}`,
          sender: 'boyfriend',
          senderName: maleLead.name,
          textKo: '...',
          textZh: '...',
          timestamp: Date.now(),
          isRead: true,
          isRecalled: false,
          emotion: 'neutral',
        }
        receiveMessage(thread.id, fallbackMsg)
      } finally {
        setLocalTyping(false)
      }
    }

    if (thread.id === 'thread_bestie') {
      setLocalTyping(true)
      try {
        const recentMessages = thread.messages.slice(-6).map(
          (m) => `${m.senderName}: ${m.textZh}`
        )
        const bestieName = player.bestieName || '闺蜜'
        const context = {
          bestieName,
          playerName: player.name,
          boyfriendName: maleLead.name,
          relationshipStage: maleLead.relationshipStage,
          recentMessages,
          playerMessage: text,
          week,
          mood: player.mood,
          fanSuspicion: risk.fanSuspicion,
          companyAlert: risk.companyAlert,
          relationshipStatus,
          boyfriendEmotionalState: maleLead.emotionalState,
          recentClues: clueLedger.slice(-5).map(c => c.description),
          fandomStage,
        }
        const reply = await generateBestieReply(context)
        const replyMsg: ChatMessage = {
          id: `msg_${Date.now()}`,
          sender: 'npc',
          senderName: bestieName,
          textKo: '',
          textZh: reply.messageZh,
          timestamp: Date.now(),
          isRead: true,
          isRecalled: false,
          emotion: 'sweet',
          category: 'sweet',
        }
        receiveMessage(thread.id, replyMsg)
        if (reply.moodEffect && reply.moodEffect !== 0) {
          updateStats({ mood: reply.moodEffect })
        }
        triggerMessageBanner(
          thread.id,
          bestieName,
          reply.messageZh.slice(0, 20),
          bestieName.charAt(0)
        )
      } catch {
        const fallbackMsg: ChatMessage = {
          id: `msg_${Date.now()}`,
          sender: 'npc',
          senderName: player.bestieName || '闺蜜',
          textKo: '',
          textZh: '宝我刚才信号不好，你再说一遍？',
          timestamp: Date.now(),
          isRead: true,
          isRecalled: false,
          emotion: 'sweet',
        }
        receiveMessage(thread.id, fallbackMsg)
      } finally {
        setLocalTyping(false)
      }
    }
  }

  if (!thread) return null

  const isColdWar = relationshipStatus === 'cold_war'
  const lastPlayerMsg = [...thread.messages].reverse().find((m) => m.sender === 'player')

  const getMessageGroups = () => {
    const groups: { category: MessageCategory | null; messages: ChatMessage[] }[] = []
    let currentCategory: MessageCategory | null = null
    let currentMessages: ChatMessage[] = []

    for (const msg of thread.messages) {
      if (msg.isRecalled) {
        if (currentMessages.length > 0) {
          groups.push({ category: currentCategory, messages: currentMessages })
        }
        groups.push({ category: null, messages: [msg] })
        currentMessages = []
        currentCategory = null
        continue
      }

      const msgCategory = inferCategory(msg)
      if (msgCategory && msgCategory !== currentCategory) {
        if (currentMessages.length > 0) {
          groups.push({ category: currentCategory, messages: currentMessages })
        }
        currentCategory = msgCategory
        currentMessages = [msg]
      } else {
        currentMessages.push(msg)
        if (!currentCategory && msgCategory) {
          currentCategory = msgCategory
        }
      }
    }

    if (currentMessages.length > 0) {
      groups.push({ category: currentCategory, messages: currentMessages })
    }

    return groups
  }

  return (
    <div className="flex flex-col h-full bg-[#B2C7DA] relative">
      {isColdWar && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-200/30 via-transparent to-blue-300/20" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(173,216,230,0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 60%, rgba(173,216,230,0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 80%, rgba(200,220,240,0.12) 0%, transparent 40%)`,
          }} />
        </div>
      )}

      <div className="bg-[#FEE500] px-3 py-2 flex items-center gap-2 z-10">
        <button
          onClick={() => openChat('')}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-[#3C3C3C]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#3C3C3C]">{thread.participantName}</span>
            <div
              className={`w-2 h-2 rounded-full ${
                thread.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </div>
          <p className="text-[10px] text-[#3C3C3C]/60">
            {thread.isOnline ? '在线' : thread.lastActive}
          </p>
        </div>
        <button className="w-8 h-8 flex items-center justify-center">
          <Phone size={18} className="text-[#3C3C3C]" />
        </button>
        <button
          onClick={toggleTranslation}
          className="w-8 h-8 flex items-center justify-center"
          style={{ opacity: showTranslation ? 1 : 0.4 }}
        >
          <Languages size={18} className="text-[#3C3C3C]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 z-10">
        {getMessageGroups().map((group, gi) => (
          <div key={gi}>
            {group.category && <CategoryTag category={group.category} />}
            {group.messages.map((msg) => {
              if (msg.isRecalled) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="text-[10px] text-gray-500 bg-black/5 rounded px-2 py-0.5">
                      对方撤回了一条消息
                    </span>
                  </div>
                )
              }

              const isPlayer = msg.sender === 'player'

              return (
                <div key={msg.id} className={`flex ${isPlayer ? 'justify-end' : 'justify-start'} mb-2`}>
                  {!isPlayer && (
                    <div className="w-8 h-8 rounded-full bg-[#FEE500] flex items-center justify-center text-xs font-bold text-[#3C3C3C] mr-2 flex-shrink-0 mt-1">
                      {thread.participantName.charAt(0)}
                    </div>
                  )}
                  <div className="max-w-[70%]">
                    {msg.isVoice ? (
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-2xl ${
                          isPlayer
                            ? 'bg-[#FEE500] rounded-br-sm'
                            : 'bg-white rounded-bl-sm'
                        }`}
                      >
                        <Play size={14} className={isPlayer ? 'text-[#3C3C3C]' : 'text-gray-600'} />
                        <div className="flex gap-0.5">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-0.5 rounded-full ${
                                isPlayer ? 'bg-[#3C3C3C]/40' : 'bg-gray-400'
                              }`}
                              style={{ height: `${Math.random() * 12 + 4}px` }}
                            />
                          ))}
                        </div>
                        <span className={`text-[10px] ${isPlayer ? 'text-[#3C3C3C]/60' : 'text-gray-400'}`}>
                          {msg.voiceDuration}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                          isPlayer
                            ? 'bg-[#FEE500] text-[#3C3C3C] rounded-br-sm'
                            : 'bg-white text-[#3C3C3C] rounded-bl-sm'
                        }`}
                      >
                        {isPlayer ? (
                          <span>{msg.textZh}</span>
                        ) : (
                          <>
                            <span className="text-[15px]">{msg.textKo}</span>
                            {showTranslation && msg.textZh && (
                              <span className="block text-[11px] text-gray-400 mt-0.5">{msg.textZh}</span>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {localTyping && (
          <div className="flex justify-start mb-2">
            <div className="w-8 h-8 rounded-full bg-[#FEE500] flex items-center justify-center text-xs font-bold text-[#3C3C3C] mr-2 flex-shrink-0">
              {thread.participantName.charAt(0)}
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {lastPlayerMsg && !localTyping && (
          <div className="flex justify-end mb-1">
            <span className="text-[10px] text-gray-500">已读</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white px-3 py-2 flex items-center gap-2 z-10 border-t border-gray-100">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="消息"
          className="flex-1 h-9 px-3 rounded-full bg-gray-100 text-sm text-[#3C3C3C] outline-none placeholder-gray-400"
        />
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
          <Mic size={18} className="text-gray-500" />
        </button>
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FEE500] disabled:opacity-40"
        >
          <Send size={16} className="text-[#3C3C3C]" />
        </button>
      </div>
    </div>
  )
}
