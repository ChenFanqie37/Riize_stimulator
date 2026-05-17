import { useState, useEffect } from 'react'
import { X, Trash2, Save, FolderOpen } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import Modal from '@/components/Common/Modal'
import type { SaveData } from '@/types/game'

interface SaveLoadPanelProps {
  isOpen: boolean
  onClose: () => void
}

type Tab = 'save' | 'load'

export default function SaveLoadPanel({ isOpen, onClose }: SaveLoadPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('save')
  const [confirmAction, setConfirmAction] = useState<{
    type: 'overwrite' | 'load' | 'delete'
    saveId?: string
    slotIndex?: number
  } | null>(null)
  const [saveName, setSaveName] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)

  const saves = useGameStore((s) => s.saves)
  const saveGame = useGameStore((s) => s.saveGame)
  const loadGame = useGameStore((s) => s.loadGame)
  const deleteSave = useGameStore((s) => s.deleteSave)
  const getSaves = useGameStore((s) => s.getSaves)

  useEffect(() => {
    if (isOpen) {
      getSaves()
    }
  }, [isOpen, getSaves])

  const slots: (SaveData | null)[] = Array.from({ length: 10 }, (_, i) => saves[i] || null)

  const handleSave = (slotIndex: number) => {
    const existing = slots[slotIndex]
    if (existing) {
      setConfirmAction({ type: 'overwrite', saveId: existing.id, slotIndex })
      return
    }
    const name = saveName.trim() || `存档 ${slotIndex + 1}`
    saveGame(name)
    setSelectedSlot(null)
    setSaveName('')
  }

  const handleLoad = (saveId: string) => {
    setConfirmAction({ type: 'load', saveId })
  }

  const handleDelete = (saveId: string) => {
    setConfirmAction({ type: 'delete', saveId })
  }

  const confirmActionHandler = () => {
    if (!confirmAction) return
    if (confirmAction.type === 'overwrite') {
      if (confirmAction.saveId) {
        deleteSave(confirmAction.saveId)
      }
      const name = saveName.trim() || `存档 ${(confirmAction.slotIndex ?? 0) + 1}`
      saveGame(name)
      setSaveName('')
      setSelectedSlot(null)
    } else if (confirmAction.type === 'load' && confirmAction.saveId) {
      loadGame(confirmAction.saveId)
      onClose()
    } else if (confirmAction.type === 'delete' && confirmAction.saveId) {
      deleteSave(confirmAction.saveId)
    }
    setConfirmAction(null)
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }} />

        <div
          className="relative w-full max-w-lg max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'rgba(20, 20, 35, 0.92)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(255,45,120,0.05)',
            animation: 'modalIn 0.25s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
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
            <h3 className="text-white/90 text-base font-semibold">存档管理</h3>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X size={14} className="text-white/70" />
            </button>
          </div>

          <div className="flex border-b border-white/5">
            <button
              onClick={() => setActiveTab('save')}
              className="flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              style={{
                color: activeTab === 'save' ? '#ff2d78' : 'rgba(255,255,255,0.4)',
                borderBottom: activeTab === 'save' ? '2px solid #ff2d78' : '2px solid transparent',
              }}
            >
              <Save size={14} />
              存档
            </button>
            <button
              onClick={() => setActiveTab('load')}
              className="flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              style={{
                color: activeTab === 'load' ? '#3b82f6' : 'rgba(255,255,255,0.4)',
                borderBottom: activeTab === 'load' ? '2px solid #3b82f6' : '2px solid transparent',
              }}
            >
              <FolderOpen size={14} />
              读档
            </button>
          </div>

          {activeTab === 'save' && (
            <div className="p-4 border-b border-white/5">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="输入存档名称..."
                className="w-full px-4 py-2 rounded-lg text-sm text-white/90 placeholder-white/30 outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {slots.map((save, i) => (
              <div
                key={i}
                className="rounded-xl p-3 transition-all cursor-pointer"
                style={{
                  background: save
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedSlot === i ? 'rgba(255,45,120,0.4)' : 'rgba(255,255,255,0.06)'}`,
                }}
                onClick={() => {
                  if (activeTab === 'save') {
                    setSelectedSlot(i)
                    handleSave(i)
                  } else if (save) {
                    handleLoad(save.id)
                  }
                }}
              >
                {save ? (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white/80 text-sm font-medium truncate">{save.name}</span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px]"
                          style={{
                            background: 'rgba(255,45,120,0.12)',
                            color: '#ff6b9d',
                          }}
                        >
                          第{save.week}周
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/40 text-[11px]">
                        <span>{formatDate(save.timestamp)}</span>
                        {save.maleLeadName && <span>· {save.maleLeadName}</span>}
                      </div>
                    </div>
                    {activeTab === 'load' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(save.id)
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors shrink-0 ml-2"
                      >
                        <Trash2 size={14} className="text-red-400/60" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-2">
                    <span className="text-white/20 text-sm">空存档位</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        title="确认操作"
      >
        <div className="text-center">
          <p className="text-white/70 text-sm mb-5">
            {confirmAction?.type === 'overwrite' && '该存档位已有存档，覆盖后将无法恢复。确定覆盖吗？'}
            {confirmAction?.type === 'load' && '读档将丢失当前未保存的进度。确定继续吗？'}
            {confirmAction?.type === 'delete' && '删除存档后将无法恢复。确定删除吗？'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setConfirmAction(null)}
              className="px-5 py-2 rounded-full text-sm text-white/60 transition-colors"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              取消
            </button>
            <button
              onClick={confirmActionHandler}
              className="px-5 py-2 rounded-full text-sm text-white font-medium transition-colors"
              style={{
                background: confirmAction?.type === 'delete'
                  ? 'linear-gradient(to right, #ef4444, #f87171)'
                  : 'linear-gradient(to right, #ff2d78, #ff6b9d)',
              }}
            >
              {confirmAction?.type === 'overwrite' && '覆盖'}
              {confirmAction?.type === 'load' && '读档'}
              {confirmAction?.type === 'delete' && '删除'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
