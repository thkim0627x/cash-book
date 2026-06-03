'use client'
import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  Button,
  Stack,
  Divider,
  Alert,
  Skeleton,
  Pagination,
} from '@mui/material'
import { CheckCircle } from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/services/notification.service'
import { NotificationItem } from '@/features/notification/NotificationItem'
import { EmptyState } from '@/components/common/EmptyState'
import { useToastStore } from '@/stores/toastStore'

const PAGE_SIZE = 20

export default function NotificationsPage() {
  const [page, setPage] = useState(1)
  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()

  const { data: notifRes, isLoading, isError } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationService.getList(page - 1, PAGE_SIZE),
  })

  const { mutate: markAll, isPending: isMarkingAll } = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['notifications'] })
      queryClientInstance.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
      showToast('모든 알림을 읽음 처리했습니다.', 'success')
    },
    onError: () => showToast('처리에 실패했습니다.', 'error'),
  })

  const notifications = notifRes?.data?.content ?? []
  const totalPages = notifRes?.data?.totalPages ?? 1
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      {/* 헤더 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            알림
          </Typography>
          {unreadCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              안읽은 알림 <strong>{unreadCount}</strong>개
            </Typography>
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<CheckCircle size={16} />}
            onClick={() => markAll()}
            disabled={isMarkingAll}
          >
            전체 읽음
          </Button>
        )}
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          알림을 불러오는 중 오류가 발생했습니다.
        </Alert>
      )}

      <Card>
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Stack key={i} direction="row" spacing={1.5} sx={{ p: 1 }}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="80%" height={14} sx={{ mt: 0.5 }} />
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <EmptyState message="알림이 없습니다." />
          </Box>
        ) : (
          <Box>
            {notifications.map((notif, idx) => (
              <Box key={notif.id}>
                {idx > 0 && <Divider />}
                <NotificationItem notification={notif} />
              </Box>
            ))}
          </Box>
        )}
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  )
}
