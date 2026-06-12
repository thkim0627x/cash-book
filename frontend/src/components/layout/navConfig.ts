import {
  Bank,
  Bell,
  ChartBar,
  ChatTeardropDots,
  DotsThreeOutline,
  Gear,
  Gift,
  House,
  Receipt,
  Wallet,
  type Icon,
} from '@phosphor-icons/react'

export interface NavItem {
  label: string
  icon: Icon
  path: string
  /** 뱃지 텍스트 (예: 'NEW') — 사이드바에서 Chip으로 표시 */
  pill?: string
}

export interface NavGroup {
  /** 섹션 헤더 텍스트. undefined 이면 헤더 없음 */
  section?: string
  items: NavItem[]
}

// 사이드바 IA (modern_redesign_guide §10)
export const SIDEBAR_NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: '대시보드', icon: House, path: '/dashboard' },
      { label: '거래내역', icon: Receipt, path: '/transactions' },
    ],
  },
  // {
  //   section: '자산관리',
  //   items: [
  //     { label: '자산', icon: Bank, path: '/assets' },
  //     { label: '예산', icon: Wallet, path: '/budget' },
  //     { label: '통계', icon: ChartBar, path: '/statistics' },
  //   ],
  // },
  // {
  //   section: '더보기',
  //   items: [
  //     { label: '청년혜택', icon: Gift, path: '/benefits', pill: 'NEW' },
  //     { label: '커뮤니티', icon: ChatTeardropDots, path: '/community' },
  //     { label: '알림', icon: Bell, path: '/notifications' },
  //     { label: '설정', icon: Gear, path: '/settings' },
  //   ],
  // },
]

// flat list (하위 호환 — BottomNav 등 기존 코드에서 사용)
export const SIDEBAR_NAV: NavItem[] = SIDEBAR_NAV_GROUPS.flatMap((g) => g.items)

// 모바일 하단 탭바 (xs only)
export const BOTTOM_NAV: NavItem[] = [
  { label: '홈', icon: House, path: '/dashboard' },
  { label: '거래', icon: Receipt, path: '/transactions' },
  { label: '자산', icon: Bank, path: '/assets' },
  { label: '혜택', icon: Gift, path: '/benefits' },
  { label: '더보기', icon: DotsThreeOutline, path: '/settings' },
]

/** 현재 경로가 해당 메뉴에 해당하는지 (하위 경로 포함) */
export function isNavActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(path + '/')
}
