'use client'
import { use, useEffect } from 'react'
import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { communityService } from '@/services/community.service'
import { PostForm } from '@/features/community/PostForm'
import { useToastStore } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'
import type { PostUpdateRequest } from '@/types/community'

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default function CommunityEditPage({ params }: EditPageProps) {
  const { id } = use(params)
  const postId = Number(id)
  const router = useRouter()
  const showToast = useToastStore((s) => s.show)
  const user = useAuthStore((s) => s.user)
  const queryClientInstance = useQueryClient()

  const { data: postRes, isLoading } = useQuery({
    queryKey: ['community', 'post', postId],
    queryFn: () => communityService.getDetail(postId),
    enabled: !isNaN(postId),
  })

  // 본인 확인 — 다른 유저면 목록으로
  useEffect(() => {
    if (postRes?.data && user && postRes.data.authorId !== user.id) {
      showToast('수정 권한이 없습니다.', 'error')
      router.push(`/community/${postId}`)
    }
  }, [postRes, user, postId, router, showToast])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PostUpdateRequest) => communityService.update(postId, data),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['community', 'post', postId] })
      queryClientInstance.invalidateQueries({ queryKey: ['community', 'list'] })
      showToast('게시글이 수정되었습니다.', 'success')
      router.push(`/community/${postId}`)
    },
    onError: () => showToast('게시글 수정에 실패했습니다.', 'error'),
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  const post = postRes?.data

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        글 수정
      </Typography>
      <Card>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <PostForm
            key={postId}
            defaultValues={
              post
                ? { title: post.title, content: post.content, category: post.category }
                : undefined
            }
            onSubmit={mutate}
            onCancel={() => router.push(`/community/${postId}`)}
            isPending={isPending}
            submitLabel="수정"
          />
        </CardContent>
      </Card>
    </Box>
  )
}
