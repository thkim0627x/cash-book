'use client'
import {
  Box,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import type { PostCategory, PostCreateRequest } from '@/types/community'
import { POST_CATEGORY_LABELS } from '@/types/community'

const WRITABLE_CATEGORIES: PostCategory[] = ['BENEFIT_REVIEW', 'SAVING_TIP', 'QA', 'FREE']

interface PostFormValues {
  title: string
  content: string
  category: PostCategory
}

interface PostFormProps {
  defaultValues?: Partial<PostFormValues>
  onSubmit: (data: PostCreateRequest) => void
  onCancel: () => void
  isPending: boolean
  submitLabel?: string
}

export function PostForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel = '등록',
}: PostFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<PostFormValues>({
    defaultValues: {
      title: defaultValues?.title ?? '',
      content: defaultValues?.content ?? '',
      category: defaultValues?.category ?? 'FREE',
    },
  })

  const contentLength = watch('content', '').length

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        {/* 카테고리 */}
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <FormControl size="small" sx={{ maxWidth: 200 }}>
              <InputLabel>카테고리</InputLabel>
              <Select {...field} label="카테고리">
                {WRITABLE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {POST_CATEGORY_LABELS[cat]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        {/* 제목 */}
        <TextField
          label="제목"
          fullWidth
          error={!!errors.title}
          helperText={errors.title?.message}
          {...register('title', {
            required: '제목을 입력해주세요.',
            maxLength: { value: 200, message: '제목은 200자 이하여야 합니다.' },
          })}
        />

        {/* 본문 */}
        <Box>
          <TextField
            label="본문"
            fullWidth
            multiline
            rows={12}
            error={!!errors.content}
            helperText={errors.content?.message}
            {...register('content', {
              required: '본문을 입력해주세요.',
              maxLength: { value: 5000, message: '본문은 5,000자 이하여야 합니다.' },
            })}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
            {contentLength.toLocaleString('ko-KR')} / 5,000
          </Typography>
        </Box>

        {/* 액션 버튼 */}
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button variant="outlined" onClick={onCancel} disabled={isPending}>
            취소
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isPending ? '처리 중…' : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
