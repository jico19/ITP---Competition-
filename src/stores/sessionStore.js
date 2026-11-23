import { create } from 'zustand'

const initialState = {
  session: null,
  profile: null,
  room: null,
  hydrated: false,
  error: null,
}

export const useSessionStore = create((set) => ({
  ...initialState,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setRoom: (room) => set({ room }),
  setHydrated: (hydrated) => set({ hydrated }),
  setError: (error) => set({ error }),
  clearSession: () => set({ ...initialState, hydrated: true }),
}))

