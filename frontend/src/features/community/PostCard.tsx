import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Stack,
  Chip,
  Box,
} from '@mui/material'
import { ChatTeardropText, Heart, Eye, PushPin } from '@phosphor-icons/react/dist/ssr'
import { useRouter } from 'next/navigation'
import type { Post } from '@/types/community'
import { POST_CATEGORY_LABELS, POST_CATEGORY_COLORS } from '@/types/community'
import { relativeTime } from '@/utils/date'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter()
  const catStyle = POST_CATEGORY_COLORS[post.category]

  return (
    <Card
      sx={{
        bgcolor: post.isPinned ? 'primary.light' : 'background.paper',
      }}
    >
      <CardActionArea onClick={() => router.push(`/community/${post.id}`)}>
        <CardContent sx={{ p: 2.5 }}>
          {/* 상단: 카테고리 칩 + 핀 표시 */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Chip
              label={POST_CATEGORY_LABELS[post.category]}
              size="small"
              sx={{
                bgcolor: catStyle.bgcolor,
                color: catStyle.color,
                fontWeight: 600,
                fontSize: '11px',
                height: 20,
              }}
            />
            {post.isPinned && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <PushPin size={13} weight="fill" color="var(--mui-palette-primary-main)" />
                <Typography variant="caption" color="primary.main" fontWeight={600}>
                  공지
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* 제목 */}
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{
              mb: 0.75,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {post.title}
          </Typography>

          {/* 메타: 작성자 + 날짜 */}
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
            {post.authorName} · {relativeTime(post.createdAt)}
          </Typography>

          {/* 통계: 조회수, 좋아요, 댓글 */}
          <Stack direction="row" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Eye size={13} />
              <Typography variant="caption" color="text.secondary">
                {post.viewCount.toLocaleString('ko-KR')}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Heart size={13} weight={post.isLiked ? 'fill' : 'regular'} />
              <Typography variant="caption" color="text.secondary">
                {post.likeCount.toLocaleString('ko-KR')}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ChatTeardropText size={13} />
              <Typography variant="caption" color="text.secondary">
                {post.commentCount.toLocaleString('ko-KR')}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
