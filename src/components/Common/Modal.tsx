import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{
          animation: 'fadeIn 0.2s ease-out',
        }}
      />
      <div
        className={cn(
          'relative w-full max-w-sm rounded-2xl overflow-hidden',
          'border border-white/10',
        )}
        style={{
          background: 'rgba(20, 20, 35, 0.9)',
          backdropFilter: 'blur(40px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(255,45,120,0.05)',
          animation: 'modalIn 0.25s ease-out',
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          {title && (
            <h3 className="text-white/90 text-base font-semibold">{title}</h3>
          )}
          {!title && <div />}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={14} className="text-white/70" />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
