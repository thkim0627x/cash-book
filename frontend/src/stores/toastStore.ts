import { create } from 'zustand'

type Severity = 'success' | 'error' | 'warning' | 'info'

interface ToastState {
  open: boolean
  message: string
  severity: Severity
  show: (message: string, severity?: Severity) => void
  hide: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  open: false,
  message: '',
  severity: 'info',

  show: (message, severity = 'info') => set({ open: true, message, severity }),
  hide: () => set({ open: false }),
}))
