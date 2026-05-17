import { useState, useEffect, useRef } from 'react'
import { Phone, PhoneOff, Mic, Volume2 } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { CallLog } from '@/types/game'

export default function IncomingCallUI() {
  const pendingCall = useGameStore((s) => s.pendingCall)
  const answerCall = useGameStore((s) => s.answerCall)
  const rejectCall = useGameStore((s) => s.rejectCall)
  const updateStats = useGameStore((s) => s.updateStats)

  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing')
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const missTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (pendingCall) {
      setCallState('ringing')
      setDuration(0)
      setIsMuted(false)
      setIsSpeaker(false)

      missTimerRef.current = setTimeout(() => {
        const state = useGameStore.getState()
        const callLog: CallLog = {
          id: `call_${Date.now()}`,
          with: pendingCall.callerName,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          duration: '0:00',
          status: 'missed',
          emotionalTone: 'anxious',
        }
        useGameStore.setState({
          pendingCall: null,
          kakaoTalk: {
            ...state.kakaoTalk,
            callLogs: [callLog, ...state.kakaoTalk.callLogs],
          },
          maleLead: {
            ...state.maleLead,
            affection: Math.max(0, state.maleLead.affection - 2),
          },
        })
        setCallState('ended')
      }, 10000)
    }

    return () => {
      if (missTimerRef.current) clearTimeout(missTimerRef.current)
    }
  }, [pendingCall])

  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [callState])

  useEffect(() => {
    if (callState === 'ended') {
      const t = setTimeout(() => setCallState('ringing'), 500)
      return () => clearTimeout(t)
    }
  }, [callState])

  if (!pendingCall && callState !== 'connected') return null

  const handleAnswer = () => {
    if (missTimerRef.current) clearTimeout(missTimerRef.current)
    answerCall()
    setCallState('connected')
  }

  const handleReject = () => {
    if (missTimerRef.current) clearTimeout(missTimerRef.current)
    rejectCall()
    setCallState('ended')
  }

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    const durationStr = `${minutes}:${String(seconds).padStart(2, '0')}`
    const affectionBonus = Math.min(5, Math.floor(duration / 30))
    const trustBonus = Math.min(3, Math.floor(duration / 60))
    if (affectionBonus > 0 || trustBonus > 0) {
      updateStats({ affection: affectionBonus, trust: trustBonus })
    }
    const state = useGameStore.getState()
    const callLog: CallLog = {
      id: `call_${Date.now()}`,
      with: pendingCall?.callerName || state.maleLead.name,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      duration: durationStr,
      status: 'answered',
      emotionalTone: 'sweet',
    }
    useGameStore.setState({
      kakaoTalk: {
        ...state.kakaoTalk,
        callLogs: [callLog, ...state.kakaoTalk.callLogs],
      },
    })
    setCallState('ended')
  }

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const callerName = pendingCall?.callerName || useGameStore.getState().maleLead.name
  const callerAvatar = pendingCall?.callerAvatar || useGameStore.getState().maleLead.name.charAt(0)

  return (
    <div
      className="absolute inset-0 z-[70] flex flex-col items-center justify-center"
      style={{
        background: callState === 'ringing'
          ? 'linear-gradient(180deg, rgba(10,10,30,0.97) 0%, rgba(20,10,30,0.97) 100%)'
          : 'linear-gradient(180deg, rgba(10,30,20,0.97) 0%, rgba(10,20,15,0.97) 100%)',
        backdropFilter: 'blur(30px)',
      }}
    >
      {callState === 'ringing' && (
        <>
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #FEE500, #FFD700)',
              boxShadow: '0 0 40px rgba(254,229,0,0.3), 0 0 80px rgba(254,229,0,0.1)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            {callerAvatar}
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(254,229,0,0.3); }
              50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(254,229,0,0.5); }
            }
          `}</style>

          <h2 className="text-white text-xl font-bold mb-1">{callerName}</h2>
          <p className="text-white/50 text-sm mb-12">来电...</p>

          <div className="flex items-center gap-16">
            <button
              onClick={handleReject}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 0 20px rgba(239,68,68,0.4)',
              }}
            >
              <PhoneOff size={24} className="text-white" />
            </button>
            <button
              onClick={handleAnswer}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                boxShadow: '0 0 20px rgba(34,197,94,0.4)',
              }}
            >
              <Phone size={24} className="text-white" />
            </button>
          </div>

          <div className="flex items-center gap-8 mt-6">
            <span className="text-red-400 text-xs font-medium">拒绝</span>
            <span className="text-green-400 text-xs font-medium">接听</span>
          </div>
        </>
      )}

      {callState === 'connected' && (
        <>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              boxShadow: '0 0 30px rgba(34,197,94,0.3)',
            }}
          >
            {callerAvatar}
          </div>

          <h2 className="text-white text-lg font-bold mb-1">{callerName}</h2>
          <p className="text-green-400 text-sm mb-8">{formatDuration(duration)}</p>

          <div className="flex items-center gap-8 mb-8">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: isMuted ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                border: isMuted ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Mic size={18} className={isMuted ? 'text-red-400' : 'text-white/60'} />
            </button>
            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: isSpeaker ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                border: isSpeaker ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Volume2 size={18} className={isSpeaker ? 'text-green-400' : 'text-white/60'} />
            </button>
          </div>

          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: '0 0 20px rgba(239,68,68,0.4)',
            }}
          >
            <PhoneOff size={24} className="text-white" />
          </button>
          <span className="text-white/40 text-xs mt-2">挂断</span>
        </>
      )}
    </div>
  )
}
