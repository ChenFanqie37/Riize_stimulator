import { useEffect, useRef } from 'react'
import { useModalStore, type ModalType } from '@/store/modalStore'
import Modal from '@/components/Common/Modal'
import { cn } from '@/lib/utils'

const typeStyles: Record<ModalType, { bg: string; border: string; text: string; icon: string }> = {
  event: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', text: '#c084fc', icon: '🎉' },
  notification: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa', icon: '🔔' },
  crisis: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#f87171', icon: '⚠️' },
  call: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', text: '#4ade80', icon: '📞' },
  message: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.3)', text: '#facc15', icon: '💬' },
  system: { bg: 'rgba(156,163,175,0.15)', border: 'rgba(156,163,175,0.3)', text: '#9ca3af', icon: '⚙️' },
}

const LOW_PRIORITY_AUTO_DISMISS_MS = 5000

export default function ModalQueue() {
  const currentModal = useModalStore((s) => s.currentModal)
  const queue = useModalStore((s) => s.queue)
  const dismiss = useModalStore((s) => s.dismiss)
  const isReady = useModalStore((s) => s.isReady)
  const dequeue = useModalStore((s) => s.dequeue)
  const lastDismissedAt = useModalStore((s) => s.lastDismissedAt)
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current)
      autoDismissTimerRef.current = null
    }

    if (currentModal && currentModal.priority === 'low') {
      autoDismissTimerRef.current = setTimeout(() => {
        dismiss(currentModal.id)
      }, LOW_PRIORITY_AUTO_DISMISS_MS)
    }

    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current)
        autoDismissTimerRef.current = null
      }
    }
  }, [currentModal, dismiss])

  useEffect(() => {
    if (readyTimerRef.current) {
      clearTimeout(readyTimerRef.current)
      readyTimerRef.current = null
    }

    if (!currentModal && queue.length > 0 && !isReady()) {
      const elapsed = Date.now() - lastDismissedAt
      const remaining = Math.max(0, 1500 - elapsed)
      readyTimerRef.current = setTimeout(() => {
        dequeue()
      }, remaining)
    } else if (!currentModal && queue.length > 0 && isReady()) {
      dequeue()
    }

    return () => {
      if (readyTimerRef.current) {
        clearTimeout(readyTimerRef.current)
        readyTimerRef.current = null
      }
    }
  }, [currentModal, queue.length, lastDismissedAt, isReady, dequeue])

  const handleClose = () => {
    if (currentModal) {
      dismiss(currentModal.id)
    }
  }

  if (!currentModal) {
    if (queue.length > 0) {
      return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99]">
          <div
            className="px-4 py-2 rounded-full text-xs"
            style={{
              background: 'rgba(20, 20, 35, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            还有 {queue.length} 条通知
          </div>
        </div>
      )
    }
    return null
  }

  const style = typeStyles[currentModal.type]

  return (
    <>
      <Modal isOpen={true} onClose={handleClose} title="">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
            }}
          >
            {style.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className="text-sm font-bold mb-1"
              style={{ color: style.text }}
            >
              {currentModal.title}
            </h4>
            <p className="text-white/70 text-xs leading-relaxed">
              {currentModal.content}
            </p>
          </div>
        </div>
      </Modal>

      {queue.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99]">
          <div
            className="px-4 py-2 rounded-full text-xs"
            style={{
              background: 'rgba(20, 20, 35, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            还有 {queue.length} 条通知
          </div>
        </div>
      )}
    </>
  )
}
