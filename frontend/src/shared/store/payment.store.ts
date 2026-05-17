import { create } from 'zustand'

export type PaymentStatus = 'idle' | 'processing' | 'approved' | 'rejected' | 'error'

interface PaymentState {
  status: PaymentStatus
  mpPaymentId: string | null
  statusDetail: string | null
  setPaymentStatus: (status: PaymentStatus, mpPaymentId?: string | null, statusDetail?: string | null) => void
  reset: () => void
}

export const usePaymentStore = create<PaymentState>()((set) => ({
  status: 'idle',
  mpPaymentId: null,
  statusDetail: null,
  setPaymentStatus: (status, mpPaymentId = null, statusDetail = null) =>
    set({ status, mpPaymentId, statusDetail }),
  reset: () => set({ status: 'idle', mpPaymentId: null, statusDetail: null }),
}))
