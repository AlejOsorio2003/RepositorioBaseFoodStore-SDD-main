import { create } from 'zustand'

interface PaymentState {
  status: string | null
  preferenceId: string | null
  setPayment: (status: string, preferenceId: string) => void
  clearPayment: () => void
}

export const usePaymentStore = create<PaymentState>()((set) => ({
  status: null,
  preferenceId: null,
  setPayment: (status, preferenceId) => set({ status, preferenceId }),
  clearPayment: () => set({ status: null, preferenceId: null }),
}))
