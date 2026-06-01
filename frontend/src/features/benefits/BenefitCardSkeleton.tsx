import { Card, CardContent, CardActions, Skeleton, Stack } from '@mui/material'

export function BenefitCardSkeleton() {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, p: 2.5 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Skeleton variant="rounded" width={64} height={22} />
          <Skeleton variant="rounded" width={48} height={22} />
        </Stack>
        <Skeleton variant="text" width="85%" height={24} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="55%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="80%" height={16} sx={{ mb: 1.5 }} />
        <Skeleton variant="text" width="60%" height={14} />
        <Skeleton variant="text" width="45%" height={14} />
      </CardContent>
      <CardActions sx={{ px: 2.5, pb: 2, pt: 0 }}>
        <Skeleton variant="rounded" width="100%" height={32} />
      </CardActions>
    </Card>
  )
}
