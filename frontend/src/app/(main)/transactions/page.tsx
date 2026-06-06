'use client'
import { useState, useMemo } from 'react'
import {
  Box, Chip, Typography, Stack, Alert, Skeleton, Avatar, Divider,
  IconButton, Tooltip, Fab, Drawer, Button, InputBase, ToggleButtonGroup,
  ToggleButton, useMediaQuery, useTheme, Paper,
} from '@mui/material'
import {
  Plus, CaretLeft, CaretRight, MagnifyingGlass, DownloadSimple,
  Rows, CalendarBlank, PencilSimple, Trash, X, TrendUp, TrendDown, Receipt,
} from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '@/services/transaction.service'
import { categoryService } from '@/services/category.service'
import { TransactionForm } from '@/features/transaction/TransactionForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { CalendarGrid } from '@/features/calendar/CalendarGrid'
import { DayDetailDrawer } from '@/features/calendar/DayDetailDrawer'
import { useToastStore } from '@/stores/toastStore'
import type { Transaction } from '@/types/transaction'
import type { TransactionType } from '@/types/category'
import * as XLSX from 'xlsx'

// ── 공휴일 ─────────────────────────────────────────────────────────────────
const KOREAN_HOLIDAYS: Record<string, string> = {
  '2025-01-01': '신정', '2025-01-28': '설날연휴', '2025-01-29': '설날', '2025-01-30': '설날연휴',
  '2025-03-01': '삼일절', '2025-05-05': '어린이날', '2025-05-06': '대체공휴일',
  '2025-06-06': '현충일', '2025-08-15': '광복절', '2025-10-03': '개천절',
  '2025-10-05': '추석연휴', '2025-10-06': '추석', '2025-10-07': '추석연휴',
  '2025-10-09': '한글날', '2025-12-25': '성탄절',
  '2026-01-01': '신정', '2026-02-17': '설날연휴', '2026-02-18': '설날', '2026-02-19': '설날연휴',
  '2026-03-01': '삼일절', '2026-03-02': '대체공휴일', '2026-05-05': '어린이날',
  '2026-06-06': '현충일', '2026-08-15': '광복절',
  '2026-09-24': '추석연휴', '2026-09-25': '추석', '2026-09-26': '추석연휴',
  '2026-10-03': '개천절', '2026-10-09': '한글날', '2026-12-25': '성탄절',
}
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const DAY_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

function getDateInfo(dateStr: string) {
  const d = new Date(dateStr)
  const dow = d.getDay()
  const dd = String(d.getDate()).padStart(2, '0')
  const holiday = KOREAN_HOLIDAYS[dateStr]
  return {
    dd, dayShort: DAY_NAMES[dow], dayFull: DAY_FULL[dow],
    isSat: dow === 6, isSun: dow === 0, holiday,
    isRed: dow === 0 || !!holiday,
  }
}

// ── 컴팩트 요약 바 ──────────────────────────────────────────────────────────
interface SummaryBarProps {
  year: number; month: number
  summary: { totalIncome: number; totalExpense: number; balance: number }
  loading: boolean; isCurrentMonth: boolean
  onPrev: () => void; onNext: () => void
  onAdd: () => void; isMobile: boolean
}

function SummaryBar({ year, month, summary, loading, isCurrentMonth, onPrev, onNext, onAdd, isMobile }: SummaryBarProps) {
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 1,
        px: { xs: 0, sm: 0 }, mb: 1.5,
      }}
    >
      {/* 월 네비게이터 */}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton size="small" onClick={onPrev} sx={{ p: 0.5 }}><CaretLeft size={16} /></IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ minWidth: 88, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.1rem' } }}>
          {year}년 {month}월
        </Typography>
        <IconButton size="small" onClick={onNext} disabled={isCurrentMonth} sx={{ p: 0.5 }}>
          <CaretRight size={16} />
        </IconButton>
      </Stack>

      {/* 집계 요약 */}
      {loading ? (
        <Skeleton width={280} height={36} />
      ) : (
        <Stack direction="row" spacing={{ xs: 2, sm: 3 }} alignItems="center">
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>수입</Typography>
            <Typography variant="body2" fontWeight={700} color="info.main" lineHeight={1.4}>
              {summary.totalIncome.toLocaleString('ko-KR')}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>지출</Typography>
            <Typography variant="body2" fontWeight={700} color="error.main" lineHeight={1.4}>
              {summary.totalExpense.toLocaleString('ko-KR')}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>잔액</Typography>
            <Typography variant="body2" fontWeight={700} lineHeight={1.4}
              color={summary.balance >= 0 ? 'success.main' : 'error.main'}
            >
              {summary.balance < 0 ? '-' : ''}{Math.abs(summary.balance).toLocaleString('ko-KR')}
            </Typography>
          </Box>
          {!isMobile && (
            <Button variant="contained" size="small" startIcon={<Plus weight="bold" size={14} />} onClick={onAdd} sx={{ height: 32 }}>
              거래 추가
            </Button>
          )}
        </Stack>
      )}
    </Box>
  )
}

// ── 필터 바 ────────────────────────────────────────────────────────────────
interface FilterBarProps {
  typeFilter: 'ALL' | TransactionType
  categoryFilter: string
  searchQuery: string
  viewMode: 'list' | 'calendar'
  categoryOptions: { id: number; name: string; type: string }[]
  totalCount: number
  onTypeChange: (v: 'ALL' | TransactionType) => void
  onCategoryChange: (v: string) => void
  onSearchChange: (v: string) => void
  onViewChange: (v: 'list' | 'calendar') => void
  onExcel: () => void
}

function FilterBar({
  typeFilter, categoryFilter, searchQuery, viewMode,
  categoryOptions, totalCount,
  onTypeChange, onCategoryChange, onSearchChange, onViewChange, onExcel,
}: FilterBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  const typeChips: { label: string; value: 'ALL' | TransactionType }[] = [
    { label: '전체', value: 'ALL' },
    { label: '수입', value: 'INCOME' },
    { label: '지출', value: 'EXPENSE' },
  ]

  return (
    <Box sx={{ mb: 1.5 }}>
      {/* Row 1: 유형 + 검색/뷰/엑셀 */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Stack direction="row" spacing={0.75} flexShrink={0}>
          {typeChips.map((c) => (
            <Chip
              key={c.value}
              label={c.label}
              size="small"
              onClick={() => onTypeChange(c.value)}
              variant={typeFilter === c.value ? 'filled' : 'outlined'}
              color={typeFilter === c.value
                ? c.value === 'INCOME' ? 'info' : c.value === 'EXPENSE' ? 'error' : 'primary'
                : 'default'}
              sx={{ fontWeight: typeFilter === c.value ? 700 : 400, height: 28 }}
            />
          ))}
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Chip label={`${totalCount}건`} size="small" variant="outlined" sx={{ height: 28, flexShrink: 0 }} />

        {/* 검색 */}
        {searchOpen ? (
          <Paper
            sx={{
              display: 'flex', alignItems: 'center', px: 1, height: 32,
              border: '1px solid', borderColor: 'primary.main', borderRadius: 2,
              boxShadow: 'none',
            }}
          >
            <MagnifyingGlass size={14} style={{ flexShrink: 0, color: '#999' }} />
            <InputBase
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="검색..."
              sx={{ ml: 0.75, fontSize: '0.8rem', width: 100 }}
            />
            <IconButton size="small" sx={{ p: 0.25 }} onClick={() => { onSearchChange(''); setSearchOpen(false) }}>
              <X size={12} />
            </IconButton>
          </Paper>
        ) : (
          <Tooltip title="검색">
            <IconButton size="small" onClick={() => setSearchOpen(true)} sx={{ p: 0.75 }}>
              <MagnifyingGlass size={16} />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="엑셀 다운로드">
          <span>
            <IconButton size="small" onClick={onExcel} disabled={totalCount === 0} sx={{ p: 0.75 }}>
              <DownloadSimple size={16} />
            </IconButton>
          </span>
        </Tooltip>

        <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && onViewChange(v)} size="small">
          <ToggleButton value="list" sx={{ px: 1, py: 0.4 }}><Rows size={14} /></ToggleButton>
          <ToggleButton value="calendar" sx={{ px: 1, py: 0.4 }}><CalendarBlank size={14} /></ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Row 2: 카테고리 칩 (가로 스크롤) */}
      {typeFilter !== 'ALL' && categoryOptions.length > 0 && (
        <Box
          sx={{
            display: 'flex', gap: 0.75, overflowX: 'auto',
            pb: 0.5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Chip
            key="all-cat"
            label="전체 카테고리"
            size="small"
            onClick={() => onCategoryChange('ALL')}
            variant={categoryFilter === 'ALL' ? 'filled' : 'outlined'}
            color={categoryFilter === 'ALL' ? 'primary' : 'default'}
            sx={{ height: 26, fontSize: '0.75rem', flexShrink: 0 }}
          />
          {categoryOptions.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              size="small"
              onClick={() => onCategoryChange(String(cat.id))}
              variant={categoryFilter === String(cat.id) ? 'filled' : 'outlined'}
              color={categoryFilter === String(cat.id) ? 'primary' : 'default'}
              sx={{ height: 26, fontSize: '0.75rem', flexShrink: 0 }}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

// ── 거래 행 ────────────────────────────────────────────────────────────────
interface TxnRowProps {
  txn: Transaction
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  isDesktop: boolean
}

function TxnRow({ txn, isSelected, onSelect, onEdit, onDelete, isDesktop }: TxnRowProps) {
  return (
    <Box
      onClick={onSelect}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: { xs: 2, sm: 2.5 }, py: { xs: 0.9, sm: 1 },
        cursor: 'pointer',
        bgcolor: isSelected ? 'action.selected' : 'transparent',
        borderLeft: '3px solid',
        borderColor: txn.type === 'INCOME' ? 'info.main' : 'error.main',
        transition: 'background-color 0.12s',
        '&:hover': { bgcolor: isSelected ? 'action.selected' : 'action.hover' },
        '&:hover .txn-actions': { opacity: 1 },
      }}
    >
      <Avatar
        sx={{
          width: 30, height: 30, fontSize: '0.65rem', flexShrink: 0,
          bgcolor: txn.categoryColor ?? (txn.type === 'INCOME' ? '#e1f5fe' : '#ffebee'),
          color: txn.type === 'INCOME' ? '#0277bd' : '#c62828',
        }}
      >
        {txn.categoryName?.slice(0, 1)}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap sx={{ lineHeight: 1.3 }}>
          {txn.categoryName}
        </Typography>
        {txn.memo && (
          <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ lineHeight: 1.3 }}>
            {txn.memo}
          </Typography>
        )}
      </Box>

      <Typography
        variant="body2" fontWeight={700} flexShrink={0} noWrap
        color={txn.type === 'INCOME' ? 'info.main' : 'error.main'}
      >
        {txn.amount.toLocaleString('ko-KR')}원
      </Typography>

      {/* 데스크톱 hover 액션 */}
      {isDesktop && (
        <Stack direction="row" className="txn-actions" sx={{ opacity: 0, transition: 'opacity 0.15s', flexShrink: 0 }}>
          <Tooltip title="수정">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit() }} sx={{ p: 0.4 }}>
              <PencilSimple size={13} />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete() }}
              sx={{ p: 0.4, color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
              <Trash size={13} />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
    </Box>
  )
}

// ── 날짜 그룹 헤더 ──────────────────────────────────────────────────────────
function DateHeader({ dateKey, txns }: { dateKey: string; txns: Transaction[] }) {
  const { dd, dayFull, isSat, isSun, holiday } = getDateInfo(dateKey)
  const dayIncome = txns.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const dayExpense = txns.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)

  // 토요일+공휴일이면 빨간색, 토요일만이면 파란색, 일요일/공휴일이면 빨간색
  const showSatBadge = isSat && !holiday
  const showRedBadge = isSun || !!holiday
  const dateColor = showRedBadge ? 'error.main' : showSatBadge ? 'info.main' : 'text.primary'

  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: { xs: 2, sm: 2.5 }, py: 0.75,
        bgcolor: 'grey.50',
        borderBottom: '1px solid', borderColor: 'divider',
        position: 'sticky', top: 0, zIndex: 1,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Typography fontWeight={800} color={dateColor} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: 1 }}>
          {dd}
        </Typography>
        <Typography variant="caption" color="text.secondary">{dayFull}</Typography>
        {showSatBadge && <Chip label="토" size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#e1f5fe', color: '#0277bd', px: 0 }} />}
        {showRedBadge && <Chip label={holiday ?? '일'} size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#ffebee', color: '#c62828', px: 0 }} />}
      </Stack>
      <Stack direction="row" spacing={1.5} alignItems="center">
        {dayIncome > 0 && <Typography variant="caption" fontWeight={700} color="info.main">{dayIncome.toLocaleString('ko-KR')}</Typography>}
        {dayExpense > 0 && <Typography variant="caption" fontWeight={700} color="error.main">{dayExpense.toLocaleString('ko-KR')}</Typography>}
      </Stack>
    </Box>
  )
}

// ── 거래 상세 패널 (태블릿/PC 우측) ──────────────────────────────────────────
interface DetailPanelProps {
  txn: Transaction | null
  onEdit: () => void
  onDelete: () => void
  onAdd: () => void
  onClose?: () => void
  isDrawer?: boolean
}

function DetailPanel({ txn, onEdit, onDelete, onAdd, onClose, isDrawer = false }: DetailPanelProps) {
  if (!txn) {
    return (
      <Box
        sx={{
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2, p: 4,
          color: 'text.disabled',
        }}
      >
        <Receipt size={48} />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          거래를 선택하면<br />상세 정보를 확인할 수 있어요
        </Typography>
        <Button variant="outlined" size="small" startIcon={<Plus size={14} />} onClick={onAdd}>
          거래 추가
        </Button>
      </Box>
    )
  }

  const isIncome = txn.type === 'INCOME'
  const { dd, dayFull } = getDateInfo(txn.txnDate)
  const d = new Date(txn.txnDate)

  return (
    <Box sx={{ p: { xs: 3, sm: 3 }, height: '100%', overflowY: 'auto' }}>
      {isDrawer && onClose && (
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
          <IconButton size="small" onClick={onClose}><X size={18} /></IconButton>
        </Stack>
      )}

      {/* 타입 + 카테고리 */}
      <Stack alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 64, height: 64, borderRadius: 3,
            bgcolor: txn.categoryColor ?? (isIncome ? '#e1f5fe' : '#ffebee'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {isIncome
            ? <TrendUp size={32} color="#0277bd" />
            : <TrendDown size={32} color="#c62828" />}
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={800} color={isIncome ? 'info.main' : 'error.main'}>
            {txn.amount.toLocaleString('ko-KR')}원
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {txn.categoryName}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 2.5 }} />

      {/* 상세 정보 */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <DetailRow label="날짜" value={`${d.getFullYear()}년 ${d.getMonth() + 1}월 ${dd}일 ${dayFull}`} />
        <DetailRow label="유형" value={isIncome ? '수입' : '지출'} valueColor={isIncome ? 'info.main' : 'error.main'} />
        <DetailRow label="카테고리" value={txn.categoryName ?? '-'} />
        {txn.memo && <DetailRow label="내용" value={txn.memo} />}
      </Stack>

      {/* 액션 버튼 */}
      <Stack direction="row" spacing={1.5}>
        <Button
          variant="outlined" size="medium" fullWidth
          startIcon={<PencilSimple size={16} />}
          onClick={onEdit}
        >
          수정
        </Button>
        <Button
          variant="outlined" size="medium" fullWidth color="error"
          startIcon={<Trash size={16} />}
          onClick={onDelete}
        >
          삭제
        </Button>
      </Stack>
    </Box>
  )
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 56, mt: 0.2 }}>{label}</Typography>
      <Typography variant="body2" fontWeight={500} color={valueColor ?? 'text.primary'} sx={{ textAlign: 'right', flex: 1, ml: 2 }}>
        {value}
      </Typography>
    </Stack>
  )
}

// ── 로딩 스켈레톤 ──────────────────────────────────────────────────────────
function ListSkeleton() {
  return (
    <Box>
      {[1, 2, 3].map((g) => (
        <Box key={g} sx={{ mb: 1.5, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ px: 2.5, py: 0.75, bgcolor: 'grey.50' }}>
            <Skeleton width={80} height={20} />
          </Box>
          {[1, 2].map((i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1 }}>
              <Skeleton variant="circular" width={30} height={30} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="50%" height={16} />
                <Skeleton width="30%" height={13} sx={{ mt: 0.5 }} />
              </Box>
              <Skeleton width={80} height={16} />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}

// ── 메인 페이지 ────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Transaction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [calSelectedDate, setCalSelectedDate] = useState<string | null>(null)
  const [calDrawerOpen, setCalDrawerOpen] = useState(false)

  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))      // < 900px
  const isTabletUp = useMediaQuery(theme.breakpoints.up('md'))      // ≥ 900px

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  const { data: txnRes, isLoading, isError } = useQuery({
    queryKey: ['transactions', year, month],
    queryFn: () => transactionService.getList({ year, month, size: 500 }),
  })
  const { data: catRes } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
    staleTime: Infinity,
  })

  const allTransactions = txnRes?.data?.content ?? []
  const categories = catRes?.data ?? []

  const { mutate: deleteTxn, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => transactionService.remove(id),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['transactions', year, month] })
      showToast('거래내역이 삭제되었습니다.', 'success')
      setDeleteTarget(null)
      if (selectedTxn?.id === deleteTarget) { setSelectedTxn(null); setMobileDrawerOpen(false) }
    },
    onError: () => showToast('삭제에 실패했습니다.', 'error'),
  })

  const filtered = useMemo(() => {
    let list = allTransactions
    if (typeFilter !== 'ALL') list = list.filter(t => t.type === typeFilter)
    if (categoryFilter !== 'ALL') list = list.filter(t => String(t.categoryId) === categoryFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(t =>
        t.categoryName?.toLowerCase().includes(q) || t.memo?.toLowerCase().includes(q)
      )
    }
    return list
  }, [allTransactions, typeFilter, categoryFilter, searchQuery])

  const groupedByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {}
    for (const t of filtered) {
      if (!map[t.txnDate]) map[t.txnDate] = []
      map[t.txnDate].push(t)
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const summary = transactionService.getSummary(filtered)

  const categoryOptions = useMemo(
    () => typeFilter === 'ALL' ? [] : categories.filter(c => c.type === typeFilter),
    [categories, typeFilter]
  )

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1)
    setSelectedTxn(null)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1)
    setSelectedTxn(null)
  }

  const handleTypeChange = (v: 'ALL' | TransactionType) => { setTypeFilter(v); setCategoryFilter('ALL') }
  const handleSelectTxn = (txn: Transaction) => {
    setSelectedTxn(txn)
    if (isMobile) setMobileDrawerOpen(true)
  }
  const handleEditClick = (txn: Transaction) => { setEditTarget(txn); setFormOpen(true); setMobileDrawerOpen(false) }
  const handleFormClose = () => { setFormOpen(false); setEditTarget(null) }
  const handleAddClick = () => { setEditTarget(null); setFormOpen(true); setMobileDrawerOpen(false) }

  const handleExcel = () => {
    const rows = filtered.map(t => ({
      날짜: t.txnDate, 유형: t.type === 'INCOME' ? '수입' : '지출',
      카테고리: t.categoryName ?? '', 내용: t.memo ?? '',
      금액: t.type === 'INCOME' ? t.amount : -t.amount,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 30 }, { wch: 14 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '거래내역')
    XLSX.writeFile(wb, `거래내역_${year}년${month}월.xlsx`)
  }

  // ── 리스트 영역 ──────────────────────────────────────────────────────────
  const listContent = (
    <>
      {isLoading ? <ListSkeleton /> : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Receipt size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
          <Typography variant="body2">조건에 맞는 거래내역이 없어요</Typography>
          <Button size="small" variant="outlined" sx={{ mt: 2 }} onClick={handleAddClick} startIcon={<Plus size={14} />}>
            거래 추가
          </Button>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {groupedByDate.map(([dateKey, txns]) => (
            <Box
              key={dateKey}
              sx={{ borderRadius: 2.5, overflow: 'hidden', border: '2px solid', borderColor: 'divider' }}
            >
              <DateHeader dateKey={dateKey} txns={txns} />
              {txns.map((txn, idx) => (
                <Box key={txn.id}>
                  {idx > 0 && <Divider />}
                  <TxnRow
                    txn={txn}
                    isSelected={selectedTxn?.id === txn.id}
                    onSelect={() => handleSelectTxn(txn)}
                    onEdit={() => handleEditClick(txn)}
                    onDelete={() => setDeleteTarget(txn.id)}
                    isDesktop={isTabletUp}
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Stack>
      )}
    </>
  )

  // ── 달력 뷰 ──────────────────────────────────────────────────────────────
  const calendarContent = (
    <>
      <Box sx={{ borderRadius: 2.5, overflow: 'hidden', border: '2px solid', borderColor: 'divider' }}>
        {isLoading ? <Box sx={{ p: 2 }}><Skeleton height={300} /></Box> : (
          <CalendarGrid
            year={year} month={month} transactions={allTransactions}
            selectedDate={calSelectedDate}
            onSelectDate={(d) => { setCalSelectedDate(d); setCalDrawerOpen(true) }}
          />
        )}
      </Box>
      <DayDetailDrawer open={calDrawerOpen} onClose={() => setCalDrawerOpen(false)} dateKey={calSelectedDate} transactions={allTransactions} />
    </>
  )

  return (
    <Box>
      {/* ── 요약 바 ── */}
      <SummaryBar
        year={year} month={month} summary={summary} loading={isLoading}
        isCurrentMonth={isCurrentMonth}
        onPrev={prevMonth} onNext={nextMonth}
        onAdd={handleAddClick} isMobile={isMobile}
      />

      {/* ── 필터 바 ── */}
      <FilterBar
        typeFilter={typeFilter} categoryFilter={categoryFilter}
        searchQuery={searchQuery} viewMode={viewMode}
        categoryOptions={categoryOptions} totalCount={filtered.length}
        onTypeChange={handleTypeChange}
        onCategoryChange={setCategoryFilter}
        onSearchChange={setSearchQuery}
        onViewChange={setViewMode}
        onExcel={handleExcel}
      />

      {isError && <Alert severity="error" sx={{ mb: 2 }}>데이터를 불러오는 중 오류가 발생했습니다.</Alert>}

      {/* ── 콘텐츠 레이아웃 ── */}
      {viewMode === 'calendar' ? (
        calendarContent
      ) : isTabletUp ? (
        /* 태블릿/PC: 좌 목록 + 우 상세 */
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          {/* 좌: 거래 목록 */}
          <Box sx={{ flex: '0 0 auto', width: { md: '45%', lg: '420px' }, minWidth: 0 }}>
            {listContent}
          </Box>

          {/* 우: 상세 패널 (sticky) */}
          <Box
            sx={{
              flex: 1, minWidth: 0,
              position: 'sticky', top: 80,
              maxHeight: 'calc(100dvh - 100px)', overflowY: 'auto',
              borderRadius: 2.5, border: '1px solid', borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <DetailPanel
              txn={selectedTxn}
              onEdit={() => selectedTxn && handleEditClick(selectedTxn)}
              onDelete={() => selectedTxn && setDeleteTarget(selectedTxn.id)}
              onAdd={handleAddClick}
            />
          </Box>
        </Box>
      ) : (
        /* 모바일: 단일 컬럼 */
        listContent
      )}

      {/* 모바일 거래 상세 Drawer */}
      <Drawer
        anchor="bottom"
        open={mobileDrawerOpen && isMobile}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px 16px 0 0',
            maxHeight: '75dvh',
            overflow: 'hidden',
          }
        }}
      >
        <Box sx={{ width: 40, height: 4, bgcolor: 'grey.300', borderRadius: 2, mx: 'auto', mt: 1.5, mb: 1 }} />
        <DetailPanel
          txn={selectedTxn}
          onEdit={() => selectedTxn && handleEditClick(selectedTxn)}
          onDelete={() => { selectedTxn && setDeleteTarget(selectedTxn.id); setMobileDrawerOpen(false) }}
          onAdd={handleAddClick}
          onClose={() => setMobileDrawerOpen(false)}
          isDrawer
        />
      </Drawer>

      {/* 모바일 FAB */}
      {isMobile && (
        <Fab color="primary" onClick={handleAddClick} sx={{ position: 'fixed', bottom: 80, right: 20, zIndex: 10 }}>
          <Plus weight="bold" size={24} />
        </Fab>
      )}

      <TransactionForm
        key={`${editTarget?.id ?? 'new'}-${formOpen}`}
        open={formOpen} onClose={handleFormClose}
        defaultYear={year} defaultMonth={month} editTarget={editTarget}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="거래내역 삭제"
        description="이 거래내역을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
        loading={isDeleting}
        onConfirm={() => deleteTarget !== null && deleteTxn(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
