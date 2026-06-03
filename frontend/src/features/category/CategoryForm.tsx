'use client'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Box,
  Typography,
  ButtonBase,
  CircularProgress,
} from '@mui/material'
import { Check } from '@phosphor-icons/react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/category.service'
import { useToastStore } from '@/stores/toastStore'
import {
  CATEGORY_COLORS,
  type Category,
  type TransactionType,
} from '@/types/category'

interface CategoryFormValues {
  name: string
  color: string
}

interface CategoryFormProps {
  open: boolean
  onClose: () => void
  type: TransactionType // 등록 시 적용할 유형 (현재 탭)
  editTarget?: Category | null
}

export function CategoryForm({ open, onClose, type, editTarget }: CategoryFormProps) {
  const isEditMode = !!editTarget
  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    // Dialog는 닫힐 때 언마운트되지 않으므로 open될 때 key로 remount하여 초기값 반영
    defaultValues: {
      name: editTarget?.name ?? '',
      color: editTarget?.color ?? CATEGORY_COLORS[0],
    },
  })

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      categoryService.create({ name: values.name, type, color: values.color }),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['categories'] })
      showToast('카테고리가 추가되었습니다.', 'success')
      handleClose()
    },
    onError: () => showToast('카테고리 추가에 실패했습니다.', 'error'),
  })

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      categoryService.update(editTarget!.id, { name: values.name, color: values.color }),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['categories'] })
      showToast('카테고리가 수정되었습니다.', 'success')
      handleClose()
    },
    onError: () => showToast('카테고리 수정에 실패했습니다.', 'error'),
  })

  const isPending = isCreating || isUpdating

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (values: CategoryFormValues) => {
    if (isEditMode) update(values)
    else create(values)
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {isEditMode ? '카테고리 수정' : `${type === 'INCOME' ? '수입' : '지출'} 카테고리 추가`}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {/* 이름 */}
          <TextField
            label="카테고리 이름"
            fullWidth
            autoFocus
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name', {
              required: '이름을 입력해주세요.',
              maxLength: { value: 20, message: '20자 이하로 입력해주세요.' },
            })}
          />

          {/* 색상 팔레트 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              색상
            </Typography>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1 }}>
                  {CATEGORY_COLORS.map((c) => {
                    const selected = field.value === c
                    return (
                      <ButtonBase
                        key={c}
                        onClick={() => field.onChange(c)}
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: c,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid',
                          borderColor: selected ? 'text.primary' : 'transparent',
                          transition: 'border-color 0.15s',
                        }}
                      >
                        {selected && <Check size={18} weight="bold" />}
                      </ButtonBase>
                    )
                  })}
                </Box>
              )}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={handleClose} disabled={isPending}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {isEditMode ? '수정' : '추가'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
