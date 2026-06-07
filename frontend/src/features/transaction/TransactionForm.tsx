'use client'
import { useState, useEffect, useMemo } from 'react'
import {
  Dialog, DialogContent, Drawer,
  Button, Stack, useMediaQuery, useTheme, CircularProgress,
  Typography, Box, IconButton, TextField, Chip,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/category.service'
import { assetService } from '@/services/asset.service'
import { transactionService } from '@/services/transaction.service'
import { useToastStore } from '@/stores/toastStore'
import {
  CaretLeft, CaretRight, CaretDown, CaretUp,
  CalendarBlank, PencilSimple, X as XIcon,
} from '@phosphor-icons/react'
import type { Transaction, TransactionCreateRequest, TransactionUpdateRequest } from '@/types/transaction'
import { getCategoryIcon, AssetIcon } from './categoryIcons'

type TxnTabType = 'INCOME' | 'EXPENSE' | 'TRANSFER'

const EXPENSE_ORDER = ['식비', '교통/차량', '문화생활', '마트/편의점', '패션/미용', '생활용품', '주거/통신', '건강', '교육', '경조사/회비', '부모님', '기타']
const INCOME_ORDER  = ['월급', '부수입', '용돈', '상여', '금융소득', '기타']
const RECENT_MAX = 4

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtDate(s: string) {
  const d = new Date(s + 'T00:00:00')
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. (${days[d.getDay()]})`
}

function getRecentCats(tab: 'INCOME' | 'EXPENSE'): number[] {
  try { return JSON.parse(localStorage.getItem(`recentCats_${tab}`) ?? '[]') } catch { return [] }
}
function pushRecentCat(tab: 'INCOME' | 'EXPENSE', id: number) {
  const prev = getRecentCats(tab).filter(x => x !== id)
  localStorage.setItem(`recentCats_${tab}`, JSON.stringify([id, ...prev].slice(0, RECENT_MAX)))
}
function getRecentAssets(): number[] {
  try { return JSON.parse(localStorage.getItem('recentAssets') ?? '[]') } catch { return [] }
}
function pushRecentAsset(id: number) {
  const prev = getRecentAssets().filter(x => x !== id)
  localStorage.setItem('recentAssets', JSON.stringify([id, ...prev].slice(0, RECENT_MAX)))
}

// ── NumKeypad ──────────────────────────────────────────────────────────────
function NumKeypad({ digits, onDigits }: { digits: string; onDigits: (d: string) => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '⌫'] as const
  const handle = (k: string) => {
    if (k === '⌫') { onDigits(digits.slice(0, -1)); return }
    if (digits.length >= 11) return
    if (k === '00') { if (!digits || digits === '0') return; onDigits(digits + '00'); return }
    if (digits === '0') return
    onDigits(digits + k)
  }
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {keys.map((k) => (
        <Button key={k} variant="text" onClick={() => handle(k)}
          sx={{
            py: 1.75, fontSize: '1.35rem', fontWeight: 600, borderRadius: 0,
            color: k === '⌫' ? 'text.secondary' : 'text.primary',
            '&:hover': { bgcolor: 'action.hover' },
          }}>
          {k}
        </Button>
      ))}
    </Box>
  )
}

// ── DatePicker ────────────────────────────────────────────────────────────
function DatePicker({ value, onChange }: { value: string; onChange: (d: string) => void }) {
  const [nav, setNav] = useState(() => {
    const d = new Date(value + 'T00:00:00')
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const { year, month } = nav
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = todayStr()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  const makeStr = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const prevM = () => setNav(n => n.month === 0 ? { year: n.year - 1, month: 11 } : { ...n, month: n.month - 1 })
  const nextM = () => setNav(n => n.month === 11 ? { year: n.year + 1, month: 0 } : { ...n, month: n.month + 1 })
  return (
    <Box sx={{ px: 1.5, pt: 1, pb: 1.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
        <IconButton size="small" onClick={prevM} sx={{ p: 0.5 }}><CaretLeft size={15} /></IconButton>
        <Typography fontWeight={700} sx={{ fontSize: '0.88rem' }}>{year}년 {month + 1}월</Typography>
        <IconButton size="small" onClick={nextM} sx={{ p: 0.5 }}><CaretRight size={15} /></IconButton>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.25 }}>
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <Typography key={d} variant="caption" textAlign="center" fontWeight={700}
            color={i === 0 ? 'error.main' : i === 6 ? 'info.main' : 'text.secondary'}
            sx={{ fontSize: '0.68rem', py: 0.25 }}>
            {d}
          </Typography>
        ))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((d, i) => {
          if (d === null) return <Box key={`n-${i}`} />
          const str = makeStr(d)
          const isSel = value === str
          const isTod = today === str
          const dow = (firstDay + d - 1) % 7
          return (
            <Box key={d} onClick={() => onChange(str)} sx={{
              aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', cursor: 'pointer',
              bgcolor: isSel ? 'error.main' : 'transparent',
              color: isSel ? '#fff' : dow === 0 ? 'error.main' : dow === 6 ? 'info.main' : 'text.primary',
              fontWeight: isSel || isTod ? 700 : 400,
              outline: isTod && !isSel ? '2px solid' : 'none',
              outlineColor: 'error.main',
              fontSize: '0.82rem',
              '&:hover': { bgcolor: isSel ? 'error.main' : 'action.hover' },
            }}>
              {d}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

// ── CategoryBottomSheet ───────────────────────────────────────────────────
interface CatSheetProps {
  open: boolean
  onClose: () => void
  categories: Array<{ id: number; name: string; type: string }>
  selectedId: number | null
  onSelect: (id: number) => void
  tab: 'INCOME' | 'EXPENSE'
  tabColor: string
}

function CategoryBottomSheet({ open, onClose, categories, selectedId, onSelect, tab, tabColor }: CatSheetProps) {
  const theme = useTheme()
  const sorted = useMemo(() => {
    const order = tab === 'INCOME' ? INCOME_ORDER : EXPENSE_ORDER
    return [...categories].sort((a, b) => {
      const ai = order.indexOf(a.name), bi = order.indexOf(b.name)
      if (ai === -1 && bi === -1) return 0
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  }, [categories, tab])

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: (t) => t.zIndex.modal + 100,
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '75vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5, flexShrink: 0 }}>
        <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'grey.300' }} />
      </Box>
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 1.25, flexShrink: 0,
        borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <Typography fontWeight={700} sx={{ fontSize: '1rem' }}>
          {tab === 'INCOME' ? '수입' : '지출'} 분류 선택
        </Typography>
        <IconButton size="small" onClick={onClose}><XIcon size={18} /></IconButton>
      </Box>
      <Box sx={{ overflowY: 'auto', p: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {sorted.map((cat) => {
            const sel = selectedId === cat.id
            const Icon = getCategoryIcon(cat.name)
            return (
              <Box
                key={cat.id}
                onClick={() => { onSelect(cat.id); onClose() }}
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 0.75, py: 1.5, px: 0.5,
                  cursor: 'pointer', borderRadius: 2,
                  bgcolor: sel ? `${tabColor}18` : 'grey.50',
                  border: '1.5px solid', borderColor: sel ? tabColor : 'transparent',
                  transition: 'background-color 0.12s',
                  '&:hover': { bgcolor: sel ? `${tabColor}28` : 'grey.100' },
                }}
              >
                <Icon size={26} color={sel ? tabColor : theme.palette.text.secondary} weight={sel ? 'fill' : 'regular'} />
                <Typography variant="caption" fontWeight={sel ? 700 : 500}
                  color={sel ? tabColor : 'text.primary'}
                  sx={{ fontSize: '0.72rem', lineHeight: 1.3, textAlign: 'center' }}>
                  {cat.name}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Drawer>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────
interface TransactionFormProps {
  open: boolean
  onClose: () => void
  defaultYear: number
  defaultMonth: number
  defaultType?: 'INCOME' | 'EXPENSE'
  editTarget?: Transaction | null
}

export function TransactionForm({
  open, onClose, defaultYear, defaultMonth, defaultType, editTarget,
}: TransactionFormProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const showToast = useToastStore((s) => s.show)
  const qc = useQueryClient()
  const isEdit = !!editTarget

  const [tab, setTab] = useState<TxnTabType>(
    isEdit ? (editTarget.type as TxnTabType) : (defaultType ?? 'EXPENSE')
  )
  const [digits, setDigits] = useState(isEdit ? String(editTarget.amount) : '')
  const [catId, setCatId] = useState<number | null>(editTarget?.categoryId ?? null)
  const [assetId, setAssetId] = useState<number | null>(editTarget?.assetId ?? null)
  const [fromAsset, setFromAsset] = useState<number | null>(null)
  const [toAsset, setToAsset] = useState<number | null>(null)
  const [memo, setMemo] = useState(editTarget?.memo ?? '')
  const [date, setDate] = useState(editTarget?.txnDate ?? todayStr())

  const [amountOpen, setAmountOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [catSheetOpen, setCatSheetOpen] = useState(false)

  const [recentCatIds, setRecentCatIds] = useState<number[]>([])
  const [recentAssetIds, setRecentAssetIds] = useState<number[]>([])

  useEffect(() => {
    if (open) {
      if (!isEdit) {
        setTab(defaultType ?? 'EXPENSE'); setDigits(''); setCatId(null); setAssetId(null)
        setFromAsset(null); setToAsset(null); setMemo(''); setDate(todayStr())
      }
      setAmountOpen(false); setDateOpen(false); setCatSheetOpen(false)
      const t = isEdit ? editTarget?.type : (defaultType ?? 'EXPENSE')
      if (t === 'INCOME' || t === 'EXPENSE') setRecentCatIds(getRecentCats(t))
      setRecentAssetIds(getRecentAssets())
    }
  }, [open]) // eslint-disable-line

  useEffect(() => {
    if (tab === 'INCOME' || tab === 'EXPENSE') setRecentCatIds(getRecentCats(tab))
  }, [tab])

  const { data: catRes } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll, staleTime: Infinity })
  const { data: assetRes } = useQuery({ queryKey: ['assets'], queryFn: assetService.getAll, staleTime: Infinity })
  const allCats = catRes?.data ?? []
  const assets = assetRes?.data ?? []

  const typeCats = useMemo(() =>
    allCats.filter(c => (tab === 'INCOME' || tab === 'EXPENSE') && c.type === tab && c.name !== '이체'),
  [allCats, tab])

  const recentCats = useMemo(() =>
    recentCatIds.map(id => typeCats.find(c => c.id === id)).filter(Boolean) as typeof typeCats,
  [recentCatIds, typeCats])

  const displayCats = recentCats.length > 0 ? recentCats : typeCats.slice(0, RECENT_MAX)
  const selCat = allCats.find(c => c.id === catId)
  const showExtraCat = !!(selCat && !displayCats.some(c => c.id === catId))

  const sortedAssets = useMemo(() => {
    const recentSet = new Set(recentAssetIds)
    const recent = recentAssetIds.map(id => assets.find(a => a.id === id)).filter(Boolean) as typeof assets
    const rest = assets.filter(a => !recentSet.has(a.id))
    return [...recent, ...rest]
  }, [recentAssetIds, assets])

  const xferExpCat = allCats.find(c => c.name === '이체' && c.type === 'EXPENSE') ?? allCats.find(c => c.type === 'EXPENSE')
  const xferIncCat = allCats.find(c => c.name === '이체' && c.type === 'INCOME') ?? allCats.find(c => c.type === 'INCOME')

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: (d: TransactionCreateRequest) => transactionService.create(d),
    onError: () => showToast('등록에 실패했습니다.', 'error'),
  })
  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TransactionUpdateRequest }) => transactionService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions', defaultYear, defaultMonth] })
      showToast('수정되었습니다.', 'success')
      onClose()
    },
    onError: () => showToast('수정에 실패했습니다.', 'error'),
  })
  const saving = creating || updating

  const handleSave = () => {
    const amount = Number(digits)
    if (!amount || amount < 1) { showToast('금액을 입력해주세요.', 'warning'); return }

    if (tab === 'TRANSFER') {
      if (!xferExpCat || !xferIncCat) { showToast('이체 카테고리가 없습니다.', 'error'); return }
      const m = memo || '이체'
      create(
        { type: 'EXPENSE', categoryId: xferExpCat.id, amount, txnDate: date, memo: m, ...(fromAsset != null ? { assetId: fromAsset } : {}) },
        {
          onSuccess: () => create(
            { type: 'INCOME', categoryId: xferIncCat.id, amount, txnDate: date, memo: m, ...(toAsset != null ? { assetId: toAsset } : {}) },
            {
              onSuccess: () => {
                qc.invalidateQueries({ queryKey: ['transactions', defaultYear, defaultMonth] })
                showToast('이체가 등록되었습니다.', 'success')
                onClose()
              },
            }
          ),
        }
      )
      return
    }

    if (!catId) { showToast('분류를 선택해주세요.', 'warning'); return }
    const payload = { categoryId: catId, amount, txnDate: date, memo: memo || undefined, assetId: assetId ?? undefined }

    if (isEdit && editTarget) {
      update({ id: editTarget.id, data: { type: editTarget.type, ...payload } })
    } else {
      create({ type: tab as 'INCOME' | 'EXPENSE', ...payload }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ['transactions', defaultYear, defaultMonth] })
          showToast('등록되었습니다.', 'success')
          onClose()
        },
      })
    }
  }

  const tabColor = tab === 'INCOME' ? theme.palette.info.main : tab === 'EXPENSE' ? '#f44336' : theme.palette.primary.main
  const displayAmt = digits ? Number(digits).toLocaleString('ko-KR') : ''

  const handleCatSelect = (id: number) => {
    setCatId(id)
    if (tab === 'INCOME' || tab === 'EXPENSE') {
      pushRecentCat(tab, id)
      setRecentCatIds(getRecentCats(tab))
    }
  }

  const handleAssetSelect = (field: 'asset' | 'fromAsset' | 'toAsset', id: number) => {
    pushRecentAsset(id)
    setRecentAssetIds(getRecentAssets())
    if (field === 'fromAsset') setFromAsset(id)
    else if (field === 'toAsset') setToAsset(id)
    else setAssetId(prev => prev === id ? null : id)
  }

  const cardSx = {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
    overflow: 'hidden',
  }

  const cardHeadSx = {
    px: 2.5, py: 0.75,
    bgcolor: 'grey.50',
    borderBottom: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const chipSx = (sel: boolean, color: string) => ({
    bgcolor: sel ? color : `${color}14`,
    color: sel ? '#fff' : color,
    fontWeight: sel ? 700 : 500,
    border: '1px solid',
    borderColor: sel ? color : `${color}30`,
    '& .MuiChip-icon': { color: 'inherit' },
  })

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : undefined,
            height: isMobile ? '100dvh' : '90vh',
            maxHeight: isMobile ? '100dvh' : '90vh',
            borderRadius: isMobile ? 0 : 2,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* ── 탭 (Chip 스타일) ── */}
          <Box sx={{
            flexShrink: 0, px: 2, pt: 2, pb: 1.5,
            display: 'flex', gap: 1,
            borderBottom: '1px solid', borderColor: 'divider',
          }}>
            {(['INCOME', 'EXPENSE', 'TRANSFER'] as TxnTabType[]).map((t) => {
              const sel = tab === t
              const label = { INCOME: '수입', EXPENSE: '지출', TRANSFER: '이체' }[t]
              const c = { INCOME: theme.palette.info.main, EXPENSE: '#f44336', TRANSFER: theme.palette.primary.main }[t]
              return (
                <Chip
                  key={t}
                  label={label}
                  onClick={() => { if (!isEdit) { setTab(t); setCatId(null) } }}
                  disabled={isEdit && t !== tab}
                  sx={{
                    fontWeight: 700, fontSize: '0.88rem',
                    bgcolor: sel ? c : 'grey.100',
                    color: sel ? '#fff' : 'text.secondary',
                    '&:hover': { bgcolor: sel ? c : 'grey.200' },
                    '&.Mui-disabled': { opacity: 0.4 },
                  }}
                />
              )
            })}
          </Box>

          {/* ── 스크롤 영역 ── */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

            {/* 날짜 카드 */}
            <Box sx={cardSx}>
              <Box sx={{ ...cardHeadSx, cursor: 'pointer' }} onClick={() => setDateOpen(v => !v)}>
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <CalendarBlank size={14} color={theme.palette.text.secondary} />
                  <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.82rem' }}>날짜</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <Typography variant="body2" color="text.primary" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                    {fmtDate(date)}
                  </Typography>
                  {dateOpen
                    ? <CaretUp size={14} color={theme.palette.text.secondary} />
                    : <CaretDown size={14} color={theme.palette.text.secondary} />}
                </Stack>
              </Box>
              {dateOpen && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pt: 0.75 }}>
                    <Button size="small" onClick={() => setDate(todayStr())}
                      sx={{ fontSize: '0.75rem', color: 'text.secondary', py: 0.25, minWidth: 0 }}>
                      오늘
                    </Button>
                  </Box>
                  <DatePicker value={date} onChange={(d) => { setDate(d); setDateOpen(false) }} />
                </>
              )}
            </Box>

            {/* 금액 카드 */}
            <Box sx={cardSx}>
              <Box sx={cardHeadSx}>
                <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.82rem' }}>금액</Typography>
              </Box>
              <Box
                onClick={() => setAmountOpen(v => !v)}
                sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <Typography sx={{
                  flex: 1,
                  fontSize: displayAmt ? '1.75rem' : '1.25rem',
                  fontWeight: 700,
                  color: displayAmt ? tabColor : 'text.disabled',
                  letterSpacing: '-0.02em',
                }}>
                  {displayAmt ? `₩ ${displayAmt}` : '₩ 금액 입력'}
                </Typography>
                {amountOpen
                  ? <CaretUp size={16} color={theme.palette.text.secondary} />
                  : <CaretDown size={16} color={theme.palette.text.secondary} />}
              </Box>
            </Box>

            {/* 분류 카드 (수입 / 지출) */}
            {tab !== 'TRANSFER' && (
              <Box sx={cardSx}>
                <Box sx={cardHeadSx}>
                  <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.82rem' }}>분류</Typography>
                  <Button size="small" onClick={() => setCatSheetOpen(true)}
                    sx={{ fontSize: '0.75rem', color: 'text.secondary', py: 0.25, px: 1, minWidth: 0 }}>
                    전체 보기 →
                  </Button>
                </Box>
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {showExtraCat && selCat && (() => {
                      const Icon = getCategoryIcon(selCat.name)
                      return (
                        <Chip
                          key={`extra-${selCat.id}`}
                          icon={<Icon size={13} weight="fill" />}
                          label={selCat.name}
                          size="small"
                          sx={chipSx(true, tabColor)}
                        />
                      )
                    })()}
                    {displayCats.map((cat) => {
                      const sel = catId === cat.id
                      const Icon = getCategoryIcon(cat.name)
                      return (
                        <Chip
                          key={cat.id}
                          icon={<Icon size={13} weight={sel ? 'fill' : 'regular'} />}
                          label={cat.name}
                          size="small"
                          onClick={() => handleCatSelect(cat.id)}
                          sx={chipSx(sel, tabColor)}
                        />
                      )
                    })}
                    <Chip
                      label="전체 보기 +"
                      size="small"
                      onClick={() => setCatSheetOpen(true)}
                      sx={{ bgcolor: 'grey.100', color: 'text.secondary', fontWeight: 500, '&:hover': { bgcolor: 'grey.200' } }}
                    />
                  </Stack>
                </Box>
              </Box>
            )}

            {/* 이체 카드 */}
            {tab === 'TRANSFER' && (
              <Box sx={cardSx}>
                <Box sx={cardHeadSx}>
                  <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.82rem' }}>이체</Typography>
                </Box>
                {([
                  { label: '출금', field: 'fromAsset' as const, selId: fromAsset },
                  { label: '입금', field: 'toAsset' as const, selId: toAsset },
                ] as const).map(({ label, field, selId }, idx) => (
                  <Box key={field} sx={{
                    px: 2, py: 1.5,
                    ...(idx === 0 ? { borderBottom: '1px solid', borderColor: 'divider' } : {}),
                  }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                      {label}
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {sortedAssets.map((a) => {
                        const sel = selId === a.id
                        return (
                          <Chip
                            key={a.id}
                            icon={<AssetIcon size={13} weight={sel ? 'fill' : 'regular'} />}
                            label={a.name}
                            size="small"
                            onClick={() => handleAssetSelect(field, a.id)}
                            sx={chipSx(sel, theme.palette.primary.main)}
                          />
                        )
                      })}
                    </Stack>
                  </Box>
                ))}
              </Box>
            )}

            {/* 자산 카드 (수입 / 지출) */}
            {tab !== 'TRANSFER' && (
              <Box sx={cardSx}>
                <Box sx={cardHeadSx}>
                  <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.82rem' }}>자산</Typography>
                </Box>
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {sortedAssets.map((a) => {
                      const sel = assetId === a.id
                      return (
                        <Chip
                          key={a.id}
                          icon={<AssetIcon size={13} weight={sel ? 'fill' : 'regular'} />}
                          label={a.name}
                          size="small"
                          onClick={() => handleAssetSelect('asset', a.id)}
                          sx={chipSx(sel, tabColor)}
                        />
                      )
                    })}
                  </Stack>
                </Box>
              </Box>
            )}

            {/* 내용 카드 — 항상 표시 */}
            <Box sx={cardSx}>
              <Box sx={cardHeadSx}>
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <PencilSimple size={14} color={theme.palette.text.secondary} />
                  <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.82rem' }}>내용</Typography>
                </Stack>
              </Box>
              <Box sx={{ px: 2.5, py: 1.5 }}>
                <TextField
                  fullWidth
                  placeholder="내용 입력 (선택)"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  variant="standard"
                  inputProps={{ maxLength: 200, style: { fontSize: '16px' } }}
                  slotProps={{ input: { disableUnderline: true } }}
                  sx={{ '& .MuiInputBase-input': { py: 0 } }}
                />
              </Box>
            </Box>

          </Box>

          {/* ── 숫자 키패드 (금액 카드 탭 시 하단 고정) ── */}
          {amountOpen && (
            <Box sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider' }}>
              <NumKeypad digits={digits} onDigits={setDigits} />
            </Box>
          )}

          {/* ── 하단 버튼 ── */}
          <Box sx={{
            flexShrink: 0, px: 2, pt: 1.25,
            pb: isMobile ? 'max(env(safe-area-inset-bottom), 16px)' : 1.5,
            borderTop: '1px solid', borderColor: 'divider',
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <Button variant="text" size="small" onClick={onClose}
              sx={{ px: 2, py: 1.5, fontWeight: 700, color: 'text.secondary', flexShrink: 0 }}>
              취소
            </Button>
            <Button
              fullWidth variant="contained" size="large"
              onClick={handleSave}
              disabled={saving}
              sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700, borderRadius: 2, bgcolor: tabColor, '&:hover': { filter: 'brightness(0.88)' } }}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {isEdit ? '수정 완료' : '저장'}
            </Button>
          </Box>

        </DialogContent>
      </Dialog>

      {/* 분류 바텀시트 — Dialog z-index 위 */}
      {tab !== 'TRANSFER' && (
        <CategoryBottomSheet
          open={catSheetOpen}
          onClose={() => setCatSheetOpen(false)}
          categories={typeCats}
          selectedId={catId}
          onSelect={handleCatSelect}
          tab={tab as 'INCOME' | 'EXPENSE'}
          tabColor={tabColor}
        />
      )}
    </>
  )
}
