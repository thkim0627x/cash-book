import { Box, Typography, Button } from '@mui/material'
import { Receipt } from '@phosphor-icons/react/dist/ssr'

interface EmptyStateProps {
  icon?: React.ReactNode
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 8,
        gap: 2,
        color: 'text.secondary',
      }}
    >
      {icon ?? <Receipt size={48} />}
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="outlined" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
