'use client'
import { useState, useMemo } from 'react'
import {
  Box, Card, CardContent, Tabs, Tab, Select, MenuItem, FormControl, InputLabel,
  IconButton, Tooltip, Typography, Stack, Alert, useMediaQuery, useTheme,
  Avatar, Divider, Fab, Chip, Button, ToggleButtonGroup, ToggleButton,
} from '@mui/material'
import { PencilSimple, Trash, Plus, DownloadSimple, Rows, CalendarBlank } from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '@/services/transaction.service'
import { categoryService } from '@/services/category.service'
import { TransactionForm } from '@/features/transaction/TransactionForm'
import { MonthPicker } from '@/components/common/MonthPicker'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { CalendarGrid } from '@/features/calendar/CalendarGrid'
import { DayDetailDrawer } from '@/features/calendar/DayDetailDrawer'
import { useToastStore } from '@/stores/toastStore'
import type { Transaction } from '@/types/transaction'
import type { TransactionType } from '@/types/category'
import { PageHeader } from '@/components/common/PageHeader'
import * as XLSX from 'xlsx'

// ── 공휴일 ────────────────────────────────────────────────────────────────
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

const DAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

function getDateInfo(dateStr: string) {
  const d = new Date(dateStr)
  const dow = d.getDay()
  const dd = String(d.getDate()).padStart(2, '0')
  const isSaturday = dow === 6
  const isSunday = dow === 0
  const holiday = KOREAN_HOLIDAYS[dateStr]
  const isRedDay = isSunday || !!holiday
  return { dd, dayName: DAY_NAMES[dow], isSaturday, isSunday, holiday, isRedDay }
}

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50]

export default function TransactionsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Transaction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

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

  const filtered = useMemo(() => {
    let list = allTransactions
    if (typeFilter !== 'ALL') list = list.filter((t) => t.type === typeFilter)
    if (categoryFilter !== 'ALL') list = list.filter((t) => String(t.categoryId) === categoryFilter)
    return list
  }, [allTransactions, typeFilter, categoryFilter])

  // 날짜별 그룹 (최신순 → 내림차순)
  const groupedByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {}
    for (const t of filtered) {
      if (!map[t.txnDate]) map[t.txnDate] = []
      map[t.txnDate].push(t)
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const summary = transactionService.getSummary(filtered)

  const { mutate: deleteTxn, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => transactionService.remove(id),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['transactions', year, month] })
      showToast('거래내역이 삭제되었습니다.', 'success')
      setDeleteTarget(null)
    },
    onError: () => showToast('삭제에 실패했습니다.', 'error'),
  })

  const handleMonthChange = (y: number, m: number) => {
    setYear(y); setMonth(m)
    setSelectedDate(null); setDrawerOpen(false)
  }

  const handleTypeFilter = (_: React.SyntheticEvent, val: 'ALL' | TransactionType) => {
    setTypeFilter(val); setCategoryFilter('ALL')
  }

  const handleExcelDownload = () => {
    const rows = filtered.map((txn) => ({
      날짜: txn.txnDate,
      유형: txn.type === 'INCOME' ? '수입' : '지출',
      카테고리: txn.categoryName ?? '',
      내용: txn.memo ?? '',
      금액: txn.type === 'INCOME' ? txn.amount : -txn.amount,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 30 }, { wch: 14 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '거래내역')
    XLSX.writeFile(wb, `거래내역_${year}년${month}월.xlsx`)
  }

  const handleEditClick = (txn: Transaction) => { setEditTarget(txn); setFormOpen(true) }
  const handleFormClose = () => { setFormOpen(false); setEditTarget(null) }

  const categoryOptions = useMemo(
    () => typeFilter === 'ALL' ? categories : categories.filter((c) => c.type === typeFilter),
    [categories, typeFilter]
  )

  return (
    <Box sx={{ pb: isMobile ? 10 : 4 }}>
      <PageHeader title="거래 내역" action={!isMobile ? { label: '거래 추가', onClick: () => setFormOpen(true) } : undefined} />

      {/* ── 필터 카드 ── */}
      <Card sx={{ mb: 2, borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>

          {/* Row 1: 월 선택 + 집계 요약 */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 1.5 }}
          >
            <MonthPicker year={year} month={month} onChange={handleMonthChange} />

            <Stack direction="row" spacing={{ xs: 2, sm: 3 }} alignItems="center" flexWrap="wrap">
              <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                <Typography variant="caption" color="text.secondary" display="block">수입</Typography>
                <Typography variant="subtitle2" color="info.main" fontWeight={700}>
                  +{summary.totalIncome.toLocaleString('ko-KR')}원
                </Typography>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                <Typography variant="caption" color="text.secondary" display="block">지출</Typography>
                <Typography variant="subtitle2" color="error.main" fontWeight={700}>
                  {summary.totalExpense.toLocaleString('ko-KR')}원
                </Typography>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                <Typography variant="caption" color="text.secondary" display="block">잔액</Typography>
                <Typography variant="subtitle2" fontWeight={700} color={summary.balance >= 0 ? 'success.main' : 'error.main'}>
                  {summary.balance >= 0 ? '+' : '-'}{Math.abs(summary.balance).toLocaleString('ko-KR')}원
                </Typography>
              </Box>
            </Stack>
          </Stack>

          {/* Row 2: 필터 + 뷰 토글 */}
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            <Tabs
              value={typeFilter}
              onChange={handleTypeFilter}
              sx={{ minHeight: 32, '& .MuiTab-root': { minHeight: 32, py: 0, px: 1.5, fontSize: '0.8rem' } }}
            >
              <Tab label="전체" value="ALL" />
              <Tab label="수입" value="INCOME" sx={{ color: 'info.main', '&.Mui-selected': { color: 'info.main' } }} />
              <Tab label="지출" value="EXPENSE" sx={{ color: 'error.main', '&.Mui-selected': { color: 'error.main' } }} />
            </Tabs>

            <FormControl size="small" sx={{ minWidth: { xs: 110, sm: 130 } }}>
              <InputLabel>카테고리</InputLabel>
              <Select value={categoryFilter} label="카테고리" onChange={(e) => setCategoryFilter(e.target.value)}>
                <MenuItem value="ALL">전체</MenuItem>
                {categoryOptions.map((cat) => (
                  <MenuItem key={cat.id} value={String(cat.id)}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={`${filtered.length}건`} size="small" variant="outlined" />
              <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small">
                <ToggleButton value="list" sx={{ px: 1.2, py: 0.4 }}><Rows size={15} /></ToggleButton>
                <ToggleButton value="calendar" sx={{ px: 1.2, py: 0.4 }}><CalendarBlank size={15} /></ToggleButton>
              </ToggleButtonGroup>
              <Tooltip title="엑셀 다운로드">
                <span>
                  <IconButton size="small" onClick={handleExcelDownload} disabled={filtered.length === 0}>
                    <DownloadSimple size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>데이터를 불러오는 중 오류가 발생했습니다.</Alert>}

      {/* ── 달력 뷰 ── */}
      {viewMode === 'calendar' ? (
        <>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 0.5, sm: 1.5 }, '&:last-child': { pb: { xs: 0.5, sm: 1.5 } } }}>
              {isLoading ? <ListSkeleton rows={6} /> : (
                <CalendarGrid year={year} month={month} transactions={allTransactions} selectedDate={selectedDate} onSelectDate={(d) => { setSelectedDate(d); setDrawerOpen(true) }} />
              )}
            </CardContent>
          </Card>
          <DayDetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} dateKey={selectedDate} transactions={allTransactions} />
        </>
      ) : (
        /* ── 목록 뷰 — 날짜별 그룹 카드 ── */
        isLoading ? (
          <Card sx={{ borderRadius: 3 }}><CardContent><ListSkeleton rows={8} /></CardContent></Card>
        ) : filtered.length === 0 ? (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <EmptyState message="조건에 맞는 거래내역이 없습니다." actionLabel="거래 추가" onAction={() => setFormOpen(true)} />
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {groupedByDate.map(([dateKey, txns]) => {
              const { dd, dayName, isSaturday, isRedDay, holiday } = getDateInfo(dateKey)
              const dayIncome = txns.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
              const dayExpense = txns.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)

              return (
                <Card key={dateKey} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  {/* ── 날짜 헤더 ── */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: { xs: 2, sm: 2.5 },
                      py: { xs: 1, sm: 1.25 },
                      bgcolor: isRedDay ? 'rgba(198,40,40,0.04)' : isSaturday ? 'rgba(2,119,189,0.05)' : 'grey.50',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color={isRedDay ? 'error.main' : isSaturday ? 'info.main' : 'text.primary'}
                        sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, lineHeight: 1 }}
                      >
                        {dd}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {dayName}
                      </Typography>
                      {isSaturday && (
                        <Chip label="토" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#e1f5fe', color: '#0277bd' }} />
                      )}
                      {isRedDay && (
                        <Chip label={holiday ?? '일'} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#ffebee', color: '#c62828' }} />
                      )}
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {dayIncome > 0 && (
                        <Typography variant="caption" color="info.main" fontWeight={700}>
                          +{dayIncome.toLocaleString('ko-KR')}
                        </Typography>
                      )}
                      {dayExpense > 0 && (
                        <Typography variant="caption" color="error.main" fontWeight={700}>
                          {dayExpense.toLocaleString('ko-KR')}
                        </Typography>
                      )}
                    </Stack>
                  </Box>

                  {/* ── 거래 행 ── */}
                  {txns.map((txn, idx) => (
                    <Box key={txn.id}>
                      {idx > 0 && <Divider />}
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        sx={{
                          px: { xs: 2, sm: 2.5 },
                          py: { xs: 1, sm: 1.1 },
                          transition: 'background-color 0.15s',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        {/* 카테고리 아바타 */}
                        <Avatar
                          sx={{
                            width: { xs: 32, sm: 34 },
                            height: { xs: 32, sm: 34 },
                            fontSize: '0.7rem',
                            flexShrink: 0,
                            bgcolor: txn.categoryColor ?? (txn.type === 'INCOME' ? '#e1f5fe' : '#ffebee'),
                            color: txn.type === 'INCOME' ? '#0277bd' : '#c62828',
                          }}
                        >
                          {txn.categoryName?.slice(0, 1)}
                        </Avatar>

                        {/* 내용 */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {txn.categoryName}
                          </Typography>
                          {txn.memo && (
                            <Typography variant="caption" color="text.secondary" noWrap display="block">
                              {txn.memo}
                            </Typography>
                          )}
                        </Box>

                        {/* 금액 */}
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color={txn.type === 'INCOME' ? 'info.main' : 'error.main'}
                          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                        >
                          {txn.type === 'INCOME' ? '+' : ''}{txn.amount.toLocaleString('ko-KR')}원
                        </Typography>

                        {/* 액션 버튼 */}
                        <Stack direction="row" spacing={0} sx={{ flexShrink: 0 }}>
                          <Tooltip title="수정">
                            <IconButton size="small" onClick={() => handleEditClick(txn)} sx={{ p: 0.5 }}>
                              <PencilSimple size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="삭제">
                            <IconButton size="small" onClick={() => setDeleteTarget(txn.id)} sx={{ p: 0.5, color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                              <Trash size={14} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Card>
              )
            })}
          </Stack>
        )
      )}

      {/* 모바일 FAB */}
      {isMobile && (
        <Fab color="primary" onClick={() => setFormOpen(true)} sx={{ position: 'fixed', bottom: 80, right: 20, zIndex: 10 }}>
          <Plus weight="bold" size={24} />
        </Fab>
      )}

      <TransactionForm
        key={`${editTarget?.id ?? 'new'}-${formOpen}`}
        open={formOpen}
        onClose={handleFormClose}
        defaultYear={year}
        defaultMonth={month}
        editTarget={editTarget}
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
