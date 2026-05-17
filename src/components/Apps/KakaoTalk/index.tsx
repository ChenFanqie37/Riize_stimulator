import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import ChatList from './ChatList'
import ChatRoom from './ChatRoom'
import CallLog from './CallLog'

export default function KakaoTalk() {
  const currentChatThreadId = useGameStore((s) => s.currentChatThreadId)
  const [showCallLog, setShowCallLog] = useState(false)

  if (currentChatThreadId) {
    return <ChatRoom />
  }

  if (showCallLog) {
    return <CallLog onBack={() => setShowCallLog(false)} />
  }

  return <ChatList onOpenCallLog={() => setShowCallLog(true)} />
}
