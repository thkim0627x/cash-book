'use client'
import {
  Box,
  Stack,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Skeleton,
} from '@mui/material'
import { Trash } from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '@/services/community.service'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { relativeTime } from '@/utils/date'
import { useState } from 'react'

interface CommentListProps {
  postId: number
}

export function CommentList({ postId }: CommentListProps) {
  const user = useAuthStore((s) => s.user)
  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const { data: commentsRes, isLoading } = useQuery({
    queryKey: ['community', 'comments', postId],
    queryFn: () => communityService.getComments(postId),
  })

  const { mutate: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => communityService.deleteComment(id),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['community', 'comments', postId] })
      queryClientInstance.invalidateQueries({ queryKey: ['community', 'post', postId] })
      showToast('댓글이 삭제되었습니다.', 'success')
      setDeleteTarget(null)
    },
    onError: () => showToast('댓글 삭제에 실패했습니다.', 'error'),
  })

  const comments = commentsRes?.data?.content ?? []

  if (isLoading) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Stack key={i} direction="row" spacing={1.5}>
            <Skeleton variant="circular" width={32} height={32} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width={100} height={16} />
              <Skeleton width="80%" height={14} sx={{ mt: 0.5 }} />
            </Box>
          </Stack>
        ))}
      </Stack>
    )
  }

  if (comments.length === 0) {
    return <EmptyState message="첫 번째 댓글을 남겨보세요." />
  }

  return (
    <>
      <Stack spacing={0}>
        {comments.map((comment, idx) => (
          <Box key={comment.id}>
            {idx > 0 && <Divider sx={{ my: 1.5 }} />}
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.dark', fontSize: '0.8rem' }}>
                {comment.authorName.slice(0, 1)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {comment.authorName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {relativeTime(comment.createdAt)}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {comment.content}
                </Typography>
              </Box>
              {/* 본인 댓글만 삭제 버튼 */}
              {user && user.id === comment.authorId && (
                <Tooltip title="삭제">
                  <IconButton size="small" sx={{ color: 'error.main', mt: -0.5 }} onClick={() => setDeleteTarget(comment.id)}>
                    <Trash size={15} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="댓글 삭제"
        description="이 댓글을 삭제하시겠습니까?"
        loading={isDeleting}
        onConfirm={() => deleteTarget !== null && deleteComment(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  )
}
