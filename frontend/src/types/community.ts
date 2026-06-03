export type PostCategory = 'BENEFIT_REVIEW' | 'SAVING_TIP' | 'QA' | 'FREE'

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  BENEFIT_REVIEW: '혜택후기',
  SAVING_TIP: '절약팁',
  QA: 'Q&A',
  FREE: '자유',
}

export const POST_CATEGORY_COLORS: Record<
  PostCategory,
  { bgcolor: string; color: string }
> = {
  BENEFIT_REVIEW: { bgcolor: 'success.light', color: 'success.dark' },
  SAVING_TIP: { bgcolor: 'primary.light', color: 'primary.dark' },
  QA: { bgcolor: 'warning.light', color: 'warning.dark' },
  FREE: { bgcolor: 'action.selected', color: 'text.secondary' },
}

export interface Post {
  id: number
  title: string
  content: string
  category: PostCategory
  authorId: number
  authorName: string
  viewCount: number
  likeCount: number
  commentCount: number
  isPinned: boolean
  isLiked: boolean // 현재 유저의 좋아요 여부
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  postId: number
  authorId: number
  authorName: string
  content: string
  createdAt: string
}

export interface PostCreateRequest {
  title: string
  content: string
  category: PostCategory
}

export type PostUpdateRequest = PostCreateRequest

export interface CommentCreateRequest {
  content: string
}
