// 🥤 Soda — Soft Teal Mint
import type { PresetTokens } from './types'

export const sodaTheme: PresetTokens = {
  primary: {
    main: '#5BB5B0',  // 소다 틸 — 상쾌함·청량감
    light: '#D9F0EE', // 연한 민트 (활성 메뉴 bg)
    dark: '#3A8E89',  // 진한 틸 (pressed)
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#AFDBD7',  // 소프트 아쿠아 (보조 강조)
    light: '#EAF7F5',
    dark: '#5BB5B0',
    contrastText: '#1A3535',
  },
  background: {
    default: '#EEF8F7', // 아주 연한 민트-화이트
    paper: '#FFFFFF',
    sidebar: '#FFFFFF',
    canvasDeep: '#DFF0EE',
  },
  text: {
    primary: '#1A3535', // 진한 틸-블랙
    secondary: '#4A6B6A', // 그레이-틸
    muted: '#7A9E9C',
  },
  divider: '#C6E8E5',
  divider2: '#B5DDD9',
}
