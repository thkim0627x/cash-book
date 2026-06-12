'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Stack,
  Typography,
  IconButton,
  Button,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  CircularProgress,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Collapse,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material'
import {
  X,
  Plus,
  PencilSimple,
  Trash,
  Bank,
  Money,
  Bag,
  CreditCard,
  Repeat,
} from '@phosphor-icons/react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assetService } from '@/services/asset.service'
import { subscriptionService } from '@/services/subscription.service'
import { useToastStore } from '@/stores/toastStore'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Asset, AssetType } from '@/types/asset'
import { ASSET_TYPE_LABELS } from '@/types/asset'
import type { Subscription, BillingCycle } from '@/types/subscription'
import { BILLING_CYCLE_LABELS } from '@/types/subscription'

// ── 유틸 ─────────────────────────────────────────────────────────────────────
function fmt(v: string) {
  const d = v.replace(/[^0-9]/g, '')
  return d ? Number(d).toLocaleString('ko-KR') : ''
}
function parse(v: string) {
  return Number(v.replace(/[^0-9]/g, ''))
}
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── 자산 카테고리 설정 ─────────────────────────────────────────────────────────
type AssetClass = 'ASSET' | 'LIABILITY'
const ASSET_TYPES: AssetType[] = ['SAVINGS', 'CASH', 'ETC']
const LIAB_TYPES: AssetType[] = ['CREDIT_CARD']

const CAT_CFG: Record<
  AssetType,
  { icon: React.ElementType; bg: string; fg: string }
> = {
  SAVINGS: { icon: Bank, bg: '#e3f2fd', fg: '#1565c0' },
  CASH: { icon: Money, bg: '#e8f5e9', fg: '#2e7d32' },
  ETC: { icon: Bag, bg: '#f3e5f5', fg: '#6a1b9a' },
  CREDIT_CARD: { icon: CreditCard, bg: '#ffebee', fg: '#c62828' },
}

// ── 자산 폼 ───────────────────────────────────────────────────────────────────
interface AssetFormValues {
  name: string
  initialAmount: string
  assetType: AssetType
}

function AssetForm({
  cls,
  editTarget,
  onSaved,
  onCancel,
}: {
  cls: AssetClass
  editTarget: Asset | null
  onSaved: () => void
  onCancel: () => void
}) {
  const qc = useQueryClient()
  const showToast = useToastStore((s) => s.show)
  const availableTypes = cls === 'ASSET' ? ASSET_TYPES : LIAB_TYPES
  const defaultType = availableTypes[0]

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AssetFormValues>({
    defaultValues: {
      name: editTarget?.name ?? '',
      initialAmount: editTarget ? fmt(String(editTarget.initialAmount)) : '',
      assetType: editTarget?.assetType ?? defaultType,
    },
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: (req: {
      name: string
      initialAmount: number
      assetType: AssetType
    }) =>
      editTarget
        ? assetService.update(editTarget.id, req)
        : assetService.create(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] })
      showToast(editTarget ? '수정되었습니다.' : '추가되었습니다.', 'success')
      onSaved()
    },
    onError: () => showToast('저장에 실패했습니다.', 'error'),
  })

  const onSubmit = (d: AssetFormValues) =>
    save({
      name: d.name,
      initialAmount: parse(d.initialAmount),
      assetType: d.assetType,
    })

  return (
    <Box
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'primary.main',
        bgcolor: 'primary.50',
      }}
    >
      <Typography
        variant="caption"
        color="primary"
        fontWeight={700}
        display="block"
        sx={{ mb: 1.5 }}
      >
        {editTarget ? '항목 수정' : cls === 'ASSET' ? '자산 추가' : '부채 추가'}
      </Typography>
      <Stack spacing={1.5}>
        <TextField
          label="이름"
          size="small"
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message}
          {...register('name', { required: '이름을 입력해주세요.' })}
        />
        <Controller
          name="initialAmount"
          control={control}
          rules={{
            required: '금액을 입력해주세요.',
            validate: (v) => parse(v) >= 0 || '0원 이상이어야 합니다.',
          }}
          render={({ field }) => (
            <TextField
              label="금액"
              size="small"
              type="text"
              inputMode="numeric"
              fullWidth
              error={!!errors.initialAmount}
              helperText={errors.initialAmount?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">원</InputAdornment>
                ),
              }}
              value={field.value}
              onChange={(e) => field.onChange(fmt(e.target.value))}
              onBlur={field.onBlur}
            />
          )}
        />
        {availableTypes.length > 1 && (
          <Controller
            name="assetType"
            control={control}
            render={({ field }) => (
              <FormControl size="small" fullWidth>
                <InputLabel>유형</InputLabel>
                <Select {...field} label="유형">
                  {availableTypes.map((k) => (
                    <MenuItem key={k} value={k}>
                      {ASSET_TYPE_LABELS[k]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        )}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={onCancel}
          disabled={isPending}
        >
          취소
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          startIcon={
            isPending ? <CircularProgress size={14} color="inherit" /> : null
          }
        >
          저장
        </Button>
      </Stack>
    </Box>
  )
}

// ── 자산/부채 탭 콘텐츠 ────────────────────────────────────────────────────────
function AssetTabContent({
  cls,
  assets,
}: {
  cls: AssetClass
  assets: Asset[]
}) {
  const qc = useQueryClient()
  const showToast = useToastStore((s) => s.show)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Asset | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const items = assets.filter((a) =>
    cls === 'ASSET'
      ? ['SAVINGS', 'CASH', 'ETC'].includes(a.assetType)
      : ['CREDIT_CARD'].includes(a.assetType)
  )

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => assetService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] })
      showToast('삭제되었습니다.', 'success')
      setDeleteId(null)
    },
    onError: () => showToast('삭제에 실패했습니다.', 'error'),
  })

  const openAdd = () => {
    setEditTarget(null)
    setFormOpen(true)
  }
  const openEdit = (a: Asset) => {
    setEditTarget(a)
    setFormOpen(true)
  }
  const closeForm = () => {
    setFormOpen(false)
    setEditTarget(null)
  }

  const totalColor = cls === 'ASSET' ? 'info.main' : 'error.main'
  const total = items.reduce((s, a) => s + a.initialAmount, 0)

  return (
    <Box>
      {/* 합계 */}
      {items.length > 0 && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1.5 }}
        >
          <Typography variant="caption" color="text.secondary">
            {items.length}개 항목
          </Typography>
          <Typography variant="body2" fontWeight={700} color={totalColor}>
            {total.toLocaleString('ko-KR')}원
          </Typography>
        </Stack>
      )}

      {/* 인라인 폼 */}
      <Collapse in={formOpen}>
        <AssetForm
          cls={cls}
          editTarget={editTarget}
          onSaved={closeForm}
          onCancel={closeForm}
        />
      </Collapse>

      {/* 추가 버튼 */}
      {!formOpen && (
        <Button
          size="small"
          variant="outlined"
          fullWidth
          startIcon={<Plus size={14} />}
          onClick={openAdd}
          sx={{ mb: 1.5 }}
        >
          {cls === 'ASSET' ? '자산 추가' : '부채 추가'}
        </Button>
      )}

      {/* 목록 */}
      {items.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.disabled">
            등록된 {cls === 'ASSET' ? '자산' : '부채'}이 없어요
          </Typography>
        </Box>
      ) : (
        <Stack spacing={0.75}>
          {items.map((a) => {
            const cfg = CAT_CFG[a.assetType]
            const Icon = cfg.icon
            return (
              <Stack
                key={a.id}
                direction="row"
                alignItems="center"
                sx={{
                  px: 1.5,
                  py: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: cfg.bg,
                    mr: 1.25,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} color={cfg.fg} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {a.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ASSET_TYPE_LABELS[a.assetType]}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={cls === 'ASSET' ? 'info.main' : 'error.main'}
                  sx={{ mr: 1 }}
                >
                  {a.initialAmount.toLocaleString('ko-KR')}원
                </Typography>
                <Tooltip title="수정">
                  <IconButton
                    size="small"
                    onClick={() => openEdit(a)}
                    sx={{ p: 0.5 }}
                  >
                    <PencilSimple size={14} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="삭제">
                  <IconButton
                    size="small"
                    onClick={() => setDeleteId(a.id)}
                    sx={{
                      p: 0.5,
                      color: 'text.disabled',
                      '&:hover': { color: 'error.main' },
                    }}
                  >
                    <Trash size={14} />
                  </IconButton>
                </Tooltip>
              </Stack>
            )
          })}
        </Stack>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="삭제 확인"
        description="이 항목을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
        loading={isDeleting}
        onConfirm={() => deleteId !== null && remove(deleteId)}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  )
}

// ── 구독 폼 ───────────────────────────────────────────────────────────────────
interface SubFormValues {
  name: string
  amount: string
  billingCycle: BillingCycle
  startDate: string
}

function SubForm({
  editTarget,
  onSaved,
  onCancel,
}: {
  editTarget: Subscription | null
  onSaved: () => void
  onCancel: () => void
}) {
  const qc = useQueryClient()
  const showToast = useToastStore((s) => s.show)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SubFormValues>({
    defaultValues: {
      name: editTarget?.name ?? '',
      amount: editTarget ? fmt(String(editTarget.amount)) : '',
      billingCycle: editTarget?.billingCycle ?? 'MONTHLY',
      startDate: editTarget?.startDate ?? todayStr(),
    },
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: (req: {
      name: string
      amount: number
      billingCycle: BillingCycle
      startDate: string
    }) =>
      editTarget
        ? subscriptionService.update(editTarget.id, req)
        : subscriptionService.create(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      showToast(editTarget ? '수정되었습니다.' : '추가되었습니다.', 'success')
      onSaved()
    },
    onError: () => showToast('저장에 실패했습니다.', 'error'),
  })

  const onSubmit = (d: SubFormValues) =>
    save({
      name: d.name,
      amount: parse(d.amount),
      billingCycle: d.billingCycle,
      startDate: d.startDate,
    })

  return (
    <Box
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'primary.main',
        bgcolor: 'primary.50',
      }}
    >
      <Typography
        variant="caption"
        color="primary"
        fontWeight={700}
        display="block"
        sx={{ mb: 1.5 }}
      >
        {editTarget ? '구독 수정' : '구독 추가'}
      </Typography>
      <Stack spacing={1.5}>
        <TextField
          label="구독명"
          size="small"
          placeholder="Netflix, 유튜브 프리미엄 등"
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message}
          {...register('name', { required: '구독명을 입력해주세요.' })}
        />
        <Controller
          name="amount"
          control={control}
          rules={{
            required: '금액을 입력해주세요.',
            validate: (v) => parse(v) > 0 || '1원 이상이어야 합니다.',
          }}
          render={({ field }) => (
            <TextField
              label="결제 금액"
              size="small"
              type="text"
              inputMode="numeric"
              fullWidth
              error={!!errors.amount}
              helperText={errors.amount?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">원</InputAdornment>
                ),
              }}
              value={field.value}
              onChange={(e) => field.onChange(fmt(e.target.value))}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          name="billingCycle"
          control={control}
          render={({ field }) => (
            <FormControl size="small" fullWidth>
              <InputLabel>결제 주기</InputLabel>
              <Select {...field} label="결제 주기">
                {(Object.keys(BILLING_CYCLE_LABELS) as BillingCycle[]).map(
                  (k) => (
                    <MenuItem key={k} value={k}>
                      {BILLING_CYCLE_LABELS[k]}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          )}
        />
        <TextField
          label="시작일"
          size="small"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!errors.startDate}
          helperText={errors.startDate?.message}
          {...register('startDate', { required: '시작일을 선택해주세요.' })}
        />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={onCancel}
          disabled={isPending}
        >
          취소
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          startIcon={
            isPending ? <CircularProgress size={14} color="inherit" /> : null
          }
        >
          저장
        </Button>
      </Stack>
    </Box>
  )
}

// ── 구독 탭 콘텐츠 ──────────────────────────────────────────────────────────────
function SubTabContent({ subscriptions }: { subscriptions: Subscription[] }) {
  const qc = useQueryClient()
  const showToast = useToastStore((s) => s.show)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Subscription | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => subscriptionService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      showToast('삭제되었습니다.', 'success')
      setDeleteId(null)
    },
    onError: () => showToast('삭제에 실패했습니다.', 'error'),
  })

  const openAdd = () => {
    setEditTarget(null)
    setFormOpen(true)
  }
  const openEdit = (s: Subscription) => {
    setEditTarget(s)
    setFormOpen(true)
  }
  const closeForm = () => {
    setFormOpen(false)
    setEditTarget(null)
  }

  const totalMonthly = subscriptions.reduce((sum, s) => {
    if (s.billingCycle === 'MONTHLY') return sum + s.amount
    if (s.billingCycle === 'YEARLY') return sum + Math.round(s.amount / 12)
    if (s.billingCycle === 'WEEKLY') return sum + Math.round(s.amount * 4.33)
    return sum
  }, 0)

  return (
    <Box>
      {subscriptions.length > 0 && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1.5 }}
        >
          <Typography variant="caption" color="text.secondary">
            {subscriptions.length}개 · 월 환산
          </Typography>
          <Typography variant="body2" fontWeight={700} color="error.main">
            {totalMonthly.toLocaleString('ko-KR')}원
          </Typography>
        </Stack>
      )}

      <Collapse in={formOpen}>
        <SubForm
          editTarget={editTarget}
          onSaved={closeForm}
          onCancel={closeForm}
        />
      </Collapse>

      {!formOpen && (
        <Button
          size="small"
          variant="outlined"
          fullWidth
          startIcon={<Plus size={14} />}
          onClick={openAdd}
          sx={{ mb: 1.5 }}
        >
          구독 추가
        </Button>
      )}

      {subscriptions.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.disabled">
            등록된 구독 서비스가 없어요
          </Typography>
        </Box>
      ) : (
        <Stack spacing={0.75}>
          {subscriptions.map((s) => (
            <Stack
              key={s.id}
              direction="row"
              alignItems="center"
              sx={{
                px: 1.5,
                py: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: '#ffebee',
                  mr: 1.25,
                  flexShrink: 0,
                }}
              >
                <Repeat size={15} color="#c62828" />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {s.name}
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Chip
                    label={BILLING_CYCLE_LABELS[s.billingCycle]}
                    size="small"
                    sx={{ height: 16, fontSize: '0.62rem' }}
                  />
                  {s.nextBillingDayOfMonth && (
                    <Typography variant="caption" color="text.secondary">
                      매월 {s.nextBillingDayOfMonth}일
                    </Typography>
                  )}
                </Stack>
              </Box>
              <Typography
                variant="body2"
                fontWeight={700}
                color="error.main"
                sx={{ mr: 1 }}
              >
                {s.amount.toLocaleString('ko-KR')}원
              </Typography>
              <Tooltip title="수정">
                <IconButton
                  size="small"
                  onClick={() => openEdit(s)}
                  sx={{ p: 0.5 }}
                >
                  <PencilSimple size={14} />
                </IconButton>
              </Tooltip>
              <Tooltip title="삭제">
                <IconButton
                  size="small"
                  onClick={() => setDeleteId(s.id)}
                  sx={{
                    p: 0.5,
                    color: 'text.disabled',
                    '&:hover': { color: 'error.main' },
                  }}
                >
                  <Trash size={14} />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="삭제 확인"
        description="이 구독을 삭제하시겠습니까?"
        loading={isDeleting}
        onConfirm={() => deleteId !== null && remove(deleteId)}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  )
}

// ── 메인 모달 ─────────────────────────────────────────────────────────────────
interface AssetManageModalProps {
  open: boolean
  onClose: () => void
  defaultTab?: number
}

export function AssetManageModal({
  open,
  onClose,
  defaultTab = 0,
}: AssetManageModalProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [tab, setTab] = useState(defaultTab)

  const { data: assetRes, isLoading: assetLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: assetService.getAll,
  })
  const { data: subRes, isLoading: subLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionService.getAll,
  })

  const assets = assetRes?.data ?? []
  const subscriptions = subRes?.data ?? []

  const assetCount = assets.filter((a) =>
    ['SAVINGS', 'CASH', 'ETC'].includes(a.assetType)
  ).length
  const liabCount = assets.filter((a) => a.assetType === 'CREDIT_CARD').length
  const subCount = subscriptions.length

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 1 } }}
    >
      {/* 헤더 */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', px: 3, pt: 2.5, pb: 0 }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
          자산 관리
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </Box>

      {/* 탭 */}
      <Box sx={{ px: 3, pt: 1 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { minWidth: 0, px: 1.5, fontSize: '0.8rem' },
          }}
        >
          <Tab label={`자산 ${assetCount > 0 ? `(${assetCount})` : ''}`} />
          <Tab label={`부채 ${liabCount > 0 ? `(${liabCount})` : ''}`} />
          <Tab label={`구독 ${subCount > 0 ? `(${subCount})` : ''}`} />
        </Tabs>
        <Divider />
      </Box>

      {/* 콘텐츠 */}
      <DialogContent sx={{ px: 3, pt: 2, pb: 3 }}>
        {tab === 0 &&
          (assetLoading ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <AssetTabContent cls="ASSET" assets={assets} />
          ))}
        {tab === 1 &&
          (assetLoading ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <AssetTabContent cls="LIABILITY" assets={assets} />
          ))}
        {tab === 2 &&
          (subLoading ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <SubTabContent subscriptions={subscriptions} />
          ))}
      </DialogContent>
    </Dialog>
  )
}
