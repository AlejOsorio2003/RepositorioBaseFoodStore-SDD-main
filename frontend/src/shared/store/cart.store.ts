import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productoId: number
  nombre: string
  precioUnitario: number
  cantidad: number
  imagenUrl?: string
  ingredientesRemovidos?: number[]
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productoId: number) => void
  updateQuantity: (productoId: number, cantidad: number) => void
  clearCart: () => void
  subtotal: () => number
  costoEnvio: () => number
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productoId === item.productoId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productoId === item.productoId
                  ? { ...i, cantidad: i.cantidad + item.cantidad }
                  : i,
              ),
            }
          }
          return { items: [...state.items, item] }
        }),
      removeItem: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.productoId !== productoId) })),
      updateQuantity: (productoId, cantidad) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productoId === productoId ? { ...i, cantidad } : i,
          ),
        })),
      clearCart: () => set({ items: [] }),
      subtotal: () => get().items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0),
      costoEnvio: () => (get().items.length > 0 ? 50 : 0),
      total: () => get().subtotal() + get().costoEnvio(),
      itemCount: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    { name: 'cart' },
  ),
)
