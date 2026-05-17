import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  theme: 'light' | 'dark'
  cartOpen: boolean
  toggleTheme: () => void
  openCart: () => void
  closeCart: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'light',
      cartOpen: false,
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),
    }),
    {
      name: 'ui',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
