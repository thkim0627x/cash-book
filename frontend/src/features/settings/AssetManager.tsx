'use client'
import { useState } from 'react'
import {
  Box,
  Button,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  FormHelperText,
  CircularProgress,
} from '@mui/material'
import { PencilSimple, Trash, Plus } from '@phosphor-icons/react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assetService } from '@/services/asset.service'
import { useToastStore } from '@/stores/toastStore'
import type { Asset, AssetRequest, AssetType } from '@/types/asset'
import { ASSET_TYPE_LABELS } from '@/types/asset'

interface FormValues {
  name: string
  initialAmount: string
  assetType: AssetType
}

function formatNum(v: string) {
  const d = v.replace(/[^0-9]/g, '')
  return d ? Number(d).toLocaleString('ko-KR') : ''
}

function parseNum(v: string) {
  return Number(v.replace(/[^0-9]/g, ''))
}

export function AssetManager() {
  const qc = useQueryClient()
  const showToast = useToastStore((s) => s.show)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Asset | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: res, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: assetService.getAll,
  })
  const assets = res?.data ?? []

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: '', initialAmount: '', assetType: 'SAVINGS' },
  })

  const openCreate = () => {
    reset({ name: '', initialAmount: '', assetType: 'SAVINGS' })
    setEditTarget(null)
    setDialogOpen(true)
  }

  const openEdit = (a: Asset) => {
    reset({
      name: a.name,
      initialAmount: formatNum(String(a.initialAmount)),
      assetType: a.assetType,
    })
    setEditTarget(a)
    setDialogOpen(true)
  }

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: (req: AssetRequest) =>
      editTarget ? assetService.update(editTarget.id, req) : assetService.create(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] })
      showToast(editTarget ? '자산이 수정되었습니다.' : '자산이 등록되었습니다.', 'success')
      setDialogOpen(false)
    },
    onError: () => showToast('저장에 실패했습니다.', 'error'),
  })

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => assetService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] })
      showToast('자산이 삭제되었습니다.', 'success')
      setDeleteId(null)
    },
    onError: () => showToast('삭제에 실패했습니다.', 'error'),
  })

  const onSubmit = (data: FormValues) => {
    save({ name: data.name, initialAmount: parseNum(data.initialAmount), assetType: data.assetType })
  }

  return (
    <Box>
      {isLoading ? (
        <CircularProgress size={24} />
      ) : assets.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          등록된 자산이 없습니다.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {assets.map((a) => (
            <Stack
              key={a.id}
              direction="row"
              alignItems="center"
              sx={{ px: 2, py: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" fontWeight={600}>{a.name}</Typography>
                  <Chip label={ASSET_TYPE_LABELS[a.assetType]} size="small" variant="outlined" />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  초기 금액: {a.initialAmount.toLocaleString('ko-KR')}원
                </Typography>
              </Box>
              <Tooltip title="수정">
                <IconButton size="small" onClick={() => openEdit(a)}><PencilSimple size={16} /></IconButton>
              </Tooltip>
              <Tooltip title="삭제">
                <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(a.id)}>
                  <Trash size={16} />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      )}

      <Button variant="outlined" size="small" startIcon={<Plus size={16} />} onClick={openCreate}>
        자산 추가
      </Button>

      {/* 등록/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editTarget ? '자산 수정' : '자산 추가'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="자산 이름"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name', { required: '자산 이름을 입력해주세요.' })}
            />
            <Controller
              name="initialAmount"
              control={control}
              rules={{
                required: '초기 금액을 입력해주세요.',
                validate: (v) => parseNum(v) >= 0 || '금액은 0원 이상이어야 합니다.',
              }}
              render={({ field }) => (
                <TextField
                  label="초기 금액"
                  type="text"
                  inputMode="numeric"
                  fullWidth
                  error={!!errors.initialAmount}
                  helperText={errors.initialAmount?.message}
                  InputProps={{ endAdornment: <InputAdornment position="end">원</InputAdornment> }}
                  value={field.value}
                  onChange={(e) => field.onChange(formatNum(e.target.value))}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Controller
              name="assetType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>자산 유형</InputLabel>
                  <Select {...field} label="자산 유형">
                    {(Object.keys(ASSET_TYPE_LABELS) as AssetType[]).map((k) => (
                      <MenuItem key={k} value={k}>{ASSET_TYPE_LABELS[k]}</MenuItem>
                    ))}
                  </Select>
                  {errors.assetType && <FormHelperText error>{errors.assetType.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDialogOpen(false)} disabled={isSaving}>취소</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>자산 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 자산을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteId(null)} disabled={isDeleting}>취소</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteId !== null && remove(deleteId)}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
