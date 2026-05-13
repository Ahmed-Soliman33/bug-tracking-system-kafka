import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'

const cookieStorage = {
  getItem: (name) => {
    const value = Cookies.get(name)
    return value ?? null
  },
  setItem: (name, value) => {
    Cookies.set(name, value, { expires: 7, sameSite: 'Lax' })
  },
  removeItem: (name) => {
    Cookies.remove(name)
  },
}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'bug-tracker-auth',
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
)
