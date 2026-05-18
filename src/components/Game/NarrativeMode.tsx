import { X } from 'lucide-react'
import NarrativeReader from './NarrativeReader'

interface NarrativeModeProps {
  isOpen: boolean
  onClose: () => void
}

export default function NarrativeMode({ isOpen, onClose }: NarrativeModeProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[90] bg-[#F7F7F8] flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl h-[92vh] rounded-[28px] overflow-hidden bg-white shadow-2xl border border-black/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/5 flex items-center justify-center text-gray-500 hover:bg-black/10"
          title="关闭文游模式"
        >
          <X size={18} />
        </button>
        <NarrativeReader source="narrative_mode" />
      </div>
    </div>
  )
}
