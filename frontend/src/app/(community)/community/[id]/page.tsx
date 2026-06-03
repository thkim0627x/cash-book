'use client'
import { use } from 'react'
import {
  Box,
  Typography,
  Chip,
  Stack,
  Button,
  Divider,
  Alert,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material'
import { ArrowLeft, PencilSimple, Trash, Eye } from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { communityService } from '@/services/community.service'
import { LikeButton } from '@/features/community/LikeButton'
import { CommentList } from '@/features/community/CommentList'
import { CommentForm } from '@/features/community/CommentForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { POST_CATEGORY_LABELS, POST_CATEGORY_COLORS } from '@/types/community'
import { formatDate } from '@/utils/date'
import { useState } from 'react'

interface PostDetailPageProps {
  params: Promise<{ id: string }>
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = use(params)
  const postId = Number(id)
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: postRes, isLoading, isError } = useQuery({
    queryKey: ['community', 'post', postId],
    queryFn: () => communityService.getDetail(postId),
    enabled: !isNaN(postId),
  })

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: () => communityService.remove(postId),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['community', 'list'] })
      showToast('게시글이 삭제되었습니다.', 'success')
      router.push('/community')
    },
    onError: () => showToast('게시글 삭제에 실패했습니다.', 'error'),
  })

  if (isLoading) {
    return (
      <Box>
        <Skeleton height={40} width="60%" sx={{ mb: 1 }} />
        <Skeleton height={20} width="30%" sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={200} />
      </Box>
    )
  }

  if (isError || !postRes?.data) {
    return (
      <Alert severity="error">
        게시글을 불러오는 중 오류가 발생했습니다.
      </Alert>
    )
  }

  const post = postRes.data
  const isAuthor = user?.id === post.authorId
  const catStyle = POST_CATEGORY_COLORS[post.category]

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* 뒤로가기 */}
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={() => router.push('/community')}
        sx={{ mb: 2, color: 'text.secondary' }}
        size="small"
      >
        목록으로
      </Button>

      {/* 카테고리 칩 */}
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <Chip
          label={POST_CATEGORY_LABELS[post.category]}
          size="small"
          sx={{ bgcolor: catStyle.bgcolor, color: catStyle.color, fontWeight: 600 }}
        />
        {post.isPinned && (
          <Chip label="공지" size="small" color="primary" variant="outlined" />
        )}
      </Stack>

      {/* 제목 */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2, lineHeight: 1.4 }}>
        {post.title}
      </Typography>

      {/* 메타 정보 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            <strong>{post.authorName}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(post.createdAt)}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Eye size={14} />
            <Typography variant="body2" color="text.secondary">
              {post.viewCount.toLocaleString('ko-KR')}
            </Typography>
          </Stack>
        </Stack>

        {/* 수정/삭제 (본인만) */}
        {isAuthor && (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="수정">
              <IconButton
                size="small"
                onClick={() => router.push(`/community/${postId}/edit`)}
              >
                <PencilSimple size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="삭제">
              <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteOpen(true)}>
                <Trash size={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* 본문 */}
      <Typography
        variant="body1"
        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.8, mb: 4 }}
      >
        {post.content}
      </Typography>

      {/* 좋아요 버튼 */}
      <Stack alignItems="center" sx={{ mb: 4 }}>
        <LikeButton
          postId={postId}
          liked={post.isLiked}
          likeCount={post.likeCount}
          disabled={isAuthor} // 본인 글 비활성
        />
        {isAuthor && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            본인 글에는 좋아요를 누를 수 없어요
          </Typography>
        )}
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* 댓글 */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        댓글 {post.commentCount.toLocaleString('ko-KR')}
      </Typography>

      {/* 댓글 입력 */}
      <Box sx={{ mb: 3 }}>
        <CommentForm postId={postId} />
      </Box>

      {/* 댓글 목록 */}
      <CommentList postId={postId} />

      {/* 삭제 확인 */}
      <ConfirmDialog
        open={deleteOpen}
        title="게시글 삭제"
        description="이 게시글을 삭제하시겠습니까? 댓글을 포함한 모든 내용이 삭제됩니다."
        loading={isDeleting}
        onConfirm={() => deletePost()}
        onClose={() => setDeleteOpen(false)}
      />
    </Box>
  )
}
