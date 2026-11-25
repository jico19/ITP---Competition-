import { create } from 'zustand'

let nextId = 1

export const useToastStore = create((set) => ({
  toasts: [],
  pushToast: (message, { kind = 'ok', duration = 3200 } = {}) => {
    const id = nextId++
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { id, message, kind }],
    }))
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, duration)
    }
    return id
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))

export function toast(message, options) {
  return useToastStore.getState().pushToast(message, options)
}
