'use client'
import { Box, Stack, Typography, Avatar, IconButton, Tooltip } from '@mui/material'
import { MoneyWavy, Gift, ChatTeardropText, Circle } from '@phosphor-icons/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { notificationService } from '@/services/notification.service'
import type { Notification, NotificationType } from '@/types/notification'
import { relativeTime } from '@/utils/date'

const TYPE_CONFIG: Record<
  NotificationType,
  { Icon: typeof MoneyWavy; bgColor: string; iconColor: string }
> = {
  BUDGET_WARNING: { Icon: MoneyWavy, bgColor: 'error.light', iconColor: 'error.main' },
  BENEFIT_DEADLINE: { Icon: Gift, bgColor: 'warning.light', iconColor: 'warning.main' },
  COMMENT: { Icon: ChatTeardropText, bgColor: 'primary.light', iconColor: 'primary.main' },
}

interface NotificationItemProps {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter()
  const queryClientInstance = useQueryClient()
  const { Icon, bgColor, iconColor } = TYPE_CONFIG[notification.type]

  const { mutate: markRead } = useMutation({
    mutationFn: () => notificationService.markRead(notification.id),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['notifications'] })
      queryClientInstance.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })

  const handleClick = () => {
    if (!notification.isRead) markRead()
    if (notification.linkUrl) router.push(notification.linkUrl)
  }

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        px: 2,
        py: 1.75,
        cursor: notification.linkUrl ? 'pointer' : 'default',
        bgcolor: notification.isRead ? 'background.paper' : 'primary.light',
        '&:hover': { bgcolor: 'action.hover' },
        transition: 'background-color 0.15s',
      }}
    >
      {/* 타입 아이콘 */}
      <Avatar sx={{ width: 36, height: 36, bgcolor: bgColor, flexShrink: 0 }}>
        <Icon size={18} color={`var(--mui-palette-${iconColor.replace('.', '-')})`} weight="fill" />
      </Avatar>

      {/* 내용 */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography
            variant="body2"
            fontWeight={notification.isRead ? 500 : 700}
            noWrap
            sx={{ flex: 1 }}
          >
            {notification.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            {relativeTime(notification.createdAt)}
          </Typography>
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.25, display: 'block', wordBreak: 'break-word' }}
        >
          {notification.message}
        </Typography>
      </Box>

      {/* 미읽음 dot */}
      {!notification.isRead && (
        <Tooltip title="읽지 않음">
          <Box sx={{ color: 'primary.main', flexShrink: 0, mt: 0.5 }}>
            <Circle size={10} weight="fill" />
          </Box>
        </Tooltip>
      )}
    </Box>
  )
}
