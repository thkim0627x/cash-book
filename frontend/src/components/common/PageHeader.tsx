import { Box, Typography, Button } from '@mui/material'
import { Plus } from '@phosphor-icons/react/dist/ssr'

interface PageHeaderProps {
  title: string
  action?: { label: string; onClick: () => void }
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3,
      }}
    >
      <Typography variant="h5">{title}</Typography>
      {action && (
        <Button
          variant="contained"
          startIcon={<Plus weight="bold" />}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </Box>
  )
}
