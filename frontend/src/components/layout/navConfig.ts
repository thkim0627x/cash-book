import {
  House,
  Receipt,
  CalendarBlank,
  Wallet,
  ChartBar,
  Gift,
  Gear,
  DotsThreeOutline,
  ChatTeardropDots,
  Bell,
  type Icon,
} from '@phosphor-icons/react'

export interface NavItem {
  label: string
  icon: Icon
  path: string
}

// 사이드바 메뉴 (design_system.md §5 MVP 메뉴 정의)
export const SIDEBAR_NAV: NavItem[] = [
  { label: '홈', icon: House, path: '/dashboard' },
  { label: '내역', icon: Receipt, path: '/transactions' },
  { label: '달력', icon: CalendarBlank, path: '/calendar' },
  { label: '예산', icon: Wallet, path: '/budget' },
  { label: '통계', icon: ChartBar, path: '/statistics' },
  { label: '청년혜택', icon: Gift, path: '/benefits' },
  { label: '커뮤니티', icon: ChatTeardropDots, path: '/community' },
  { label: '알림', icon: Bell, path: '/notifications' },
  { label: '설정', icon: Gear, path: '/settings' },
]

// 모바일 하단 탭바 (xs only — design_system.md §6)
export const BOTTOM_NAV: NavItem[] = [
  { label: '홈', icon: House, path: '/dashboard' },
  { label: '거래', icon: Receipt, path: '/transactions' },
  { label: '달력', icon: CalendarBlank, path: '/calendar' },
  { label: '혜택', icon: Gift, path: '/benefits' },
  { label: '더보기', icon: DotsThreeOutline, path: '/settings' },
]

/** 현재 경로가 해당 메뉴에 해당하는지 (하위 경로 포함) */
export function isNavActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(path + '/')
}
