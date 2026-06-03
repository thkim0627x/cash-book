// 🌿 Green (기본) — Sage Teal
import type { PresetTokens } from './types'

export const greenTheme: PresetTokens = {
  primary: {
    main: '#41A882', // Sage Teal — 신선함·균형감
    light: '#E6F5F0', // 연한 민트 (활성 메뉴 bg)
    dark: '#2D7A5E', // 진한 그린 (pressed)
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FF8A65', // Warm Coral (보조 강조)
    light: '#FBE9E7',
    dark: '#BF360C',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F7FAF8', // 연한 민트-화이트
    paper: '#FFFFFF',
    sidebar: '#FFFFFF', // 사이드바: 순백 + border-right
  },
  text: {
    primary: '#1A2E24', // 진한 그린-블랙
    secondary: '#6B8070', // 그레이-그린
  },
  divider: '#E0EBE5',
}
