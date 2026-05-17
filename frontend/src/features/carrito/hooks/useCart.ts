import { useCartStore } from '@/shared/store'

export function useCart() {
  const items = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)

  // Computed values: call the store functions reactively
  const subtotal = useCartStore((s) => s.subtotal())
  const costoEnvio = useCartStore((s) => s.costoEnvio())
  const total = useCartStore((s) => s.total())
  const itemCount = useCartStore((s) => s.itemCount())

  return {
    items,
    subtotal,
    costoEnvio,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }
}
