import { create } from 'zustand'

export type ModalType = 'event' | 'notification' | 'crisis' | 'call' | 'message' | 'system'
export type ModalPriority = 'low' | 'medium' | 'high'

export interface ModalItem {
  id: string
  type: ModalType
  title: string
  content: string
  priority: ModalPriority
  data?: any
  createdAt: number
}

const MIN_INTERVAL = 1500

interface ModalStore {
  queue: ModalItem[]
  currentModal: ModalItem | null
  lastDismissedAt: number
  enqueue: (item: Omit<ModalItem, 'id' | 'createdAt'>) => void
  dequeue: () => void
  dismiss: (id: string) => void
  clearAll: () => void
  isReady: () => boolean
}

export const useModalStore = create<ModalStore>((set, get) => ({
  queue: [],
  currentModal: null,
  lastDismissedAt: 0,

  enqueue: (item) => {
    const newItem: ModalItem = {
      ...item,
      id: `modal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
    }
    const state = get()
    const newQueue = [...state.queue, newItem]
    if (!state.currentModal && state.isReady()) {
      set({ queue: newQueue.slice(1), currentModal: newItem })
    } else {
      set({ queue: newQueue })
    }
  },

  dequeue: () => {
    const state = get()
    const now = Date.now()
    if (state.queue.length > 0) {
      const next = state.queue[0]
      const remaining = state.queue.slice(1)
      set({
        queue: remaining,
        currentModal: next,
        lastDismissedAt: now,
      })
    } else {
      set({ currentModal: null, lastDismissedAt: now })
    }
  },

  dismiss: (id) => {
    const state = get()
    if (state.currentModal && state.currentModal.id === id) {
      get().dequeue()
    } else {
      set({ queue: state.queue.filter((m) => m.id !== id) })
    }
  },

  clearAll: () => {
    set({ queue: [], currentModal: null, lastDismissedAt: Date.now() })
  },

  isReady: () => {
    const state = get()
    return Date.now() - state.lastDismissedAt >= MIN_INTERVAL
  },
}))
