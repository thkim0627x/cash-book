'use client'
import { Snackbar, Alert } from '@mui/material'
import { useToastStore } from '@/stores/toastStore'

export function GlobalToast() {
  const { open, message, severity, hide } = useToastStore()

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={hide}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={hide} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
}
