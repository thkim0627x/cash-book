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
import { subscriptionService } from '@/services/subscription.service'
import { useToastStore } from '@/stores/toastStore'
import type { Subscription, SubscriptionRequest, BillingCycle } from '@/types/subscription'
import { BILLING_CYCLE_LABELS } from '@/types/subscription'

interface FormValues {
  name: string
  startDate: string
  billingCycle: BillingCycle
  amount: string
}

function formatNum(v: string) {
  const d = v.replace(/[^0-9]/g, '')
  return d ? Number(d).toLocaleString('ko-KR') : ''
}

function parseNum(v: string) {
  return Number(v.replace(/[^0-9]/g, ''))
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function SubscriptionManager() {
  const qc = useQueryClient()
  const showToast = useToastStore((s) => s.show)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Subscription | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: res, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionService.getAll,
  })
  const subscriptions = res?.data ?? []

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: '', startDate: todayStr(), billingCycle: 'MONTHLY', amount: '' },
  })

  const openCreate = () => {
    reset({ name: '', startDate: todayStr(), billingCycle: 'MONTHLY', amount: '' })
    setEditTarget(null)
    setDialogOpen(true)
  }

  const openEdit = (s: Subscription) => {
    reset({
      name: s.name,
      startDate: s.startDate,
      billingCycle: s.billingCycle,
      amount: formatNum(String(s.amount)),
    })
    setEditTarget(s)
    setDialogOpen(true)
  }

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: (req: SubscriptionRequest) =>
      editTarget ? subscriptionService.update(editTarget.id, req) : subscriptionService.create(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      showToast(editTarget ? '구독이 수정되었습니다.' : '구독이 등록되었습니다.', 'success')
      setDialogOpen(false)
    },
    onError: () => showToast('저장에 실패했습니다.', 'error'),
  })

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => subscriptionService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      showToast('구독이 삭제되었습니다.', 'success')
      setDeleteId(null)
    },
    onError: () => showToast('삭제에 실패했습니다.', 'error'),
  })

  const onSubmit = (data: FormValues) => {
    save({
      name: data.name,
      startDate: data.startDate,
      billingCycle: data.billingCycle,
      amount: parseNum(data.amount),
    })
  }

  const totalMonthly = subscriptions.reduce((sum, s) => {
    if (s.billingCycle === 'MONTHLY') return sum + s.amount
    if (s.billingCycle === 'YEARLY') return sum + Math.round(s.amount / 12)
    if (s.billingCycle === 'WEEKLY') return sum + Math.round(s.amount * 4.33)
    return sum
  }, 0)

  return (
    <Box>
      {isLoading ? (
        <CircularProgress size={24} />
      ) : subscriptions.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          등록된 구독 서비스가 없습니다.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {subscriptions.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              월 예상 지출: <strong>{totalMonthly.toLocaleString('ko-KR')}원</strong>
            </Typography>
          )}
          {subscriptions.map((s) => (
            <Stack
              key={s.id}
              direction="row"
              alignItems="center"
              sx={{ px: 2, py: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                  <Chip label={BILLING_CYCLE_LABELS[s.billingCycle]} size="small" variant="outlined" />
                  {s.nextBillingDayOfMonth && (
                    <Chip label={`매월 ${s.nextBillingDayOfMonth}일`} size="small" color="primary" variant="outlined" />
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {s.amount.toLocaleString('ko-KR')}원 · 시작일 {s.startDate}
                </Typography>
              </Box>
              <Tooltip title="수정">
                <IconButton size="small" onClick={() => openEdit(s)}><PencilSimple size={16} /></IconButton>
              </Tooltip>
              <Tooltip title="삭제">
                <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(s.id)}>
                  <Trash size={16} />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      )}

      <Button variant="outlined" size="small" startIcon={<Plus size={16} />} onClick={openCreate}>
        구독 추가
      </Button>

      {/* 등록/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editTarget ? '구독 수정' : '구독 추가'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="구독명"
              placeholder="Netflix, 유튜브 프리미엄 등"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name', { required: '구독명을 입력해주세요.' })}
            />
            <TextField
              label="구독 시작일"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.startDate}
              helperText={errors.startDate?.message}
              {...register('startDate', { required: '시작일을 선택해주세요.' })}
            />
            <Controller
              name="billingCycle"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>결제 주기</InputLabel>
                  <Select {...field} label="결제 주기">
                    {(Object.keys(BILLING_CYCLE_LABELS) as BillingCycle[]).map((k) => (
                      <MenuItem key={k} value={k}>{BILLING_CYCLE_LABELS[k]}</MenuItem>
                    ))}
                  </Select>
                  {errors.billingCycle && <FormHelperText error>{errors.billingCycle.message}</FormHelperText>}
                </FormControl>
              )}
            />
            <Controller
              name="amount"
              control={control}
              rules={{
                required: '결제 금액을 입력해주세요.',
                validate: (v) => parseNum(v) > 0 || '금액은 1원 이상이어야 합니다.',
              }}
              render={({ field }) => (
                <TextField
                  label="결제 금액"
                  type="text"
                  inputMode="numeric"
                  fullWidth
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                  InputProps={{ endAdornment: <InputAdornment position="end">원</InputAdornment> }}
                  value={field.value}
                  onChange={(e) => field.onChange(formatNum(e.target.value))}
                  onBlur={field.onBlur}
                />
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
        <DialogTitle>구독 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 구독 서비스를 삭제하시겠습니까?</Typography>
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
