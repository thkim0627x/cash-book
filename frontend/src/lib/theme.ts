import { createTheme, type Theme } from '@mui/material/styles'
import { indigoTheme } from './themes/indigo'
import { greenTheme } from './themes/green'
import { pinkTheme } from './themes/pink'

// 기본 테마: indigo (우선순위 indigo → green → pink)
export type ThemePreset = 'indigo' | 'green' | 'pink'

const presets = { indigo: indigoTheme, green: greenTheme, pink: pinkTheme }

// 수입/지출/경고 색상은 테마 교체와 무관하게 고정 (사용자 인지 일관성 우선)
const semanticFixed = {
  success: { main: '#2E7D32', light: '#E8F5E9', dark: '#1B5E20' },
  error: { main: '#C62828', light: '#FFEBEE', dark: '#B71C1C' },
  warning: { main: '#E65100', light: '#FBE9E7' },
  info: { main: '#0277BD', light: '#E1F5FE' },
}

export function buildTheme(preset: ThemePreset = 'indigo'): Theme {
  const p = presets[preset]

  return createTheme({
    palette: {
      primary: p.primary,
      secondary: p.secondary,
      background: p.background,
      text: p.text,
      divider: p.divider,
      ...semanticFixed,
    },
    typography: {
      fontFamily: '"Pretendard", "Noto Sans KR", -apple-system, sans-serif',
      h4: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
      h5: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 },
      h6: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
      subtitle1: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
      subtitle2: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.4 },
      body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
      caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.4 },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 10 },
          sizeLarge: { height: 48, fontSize: '1rem' },
          sizeMedium: { height: 40 },
          sizeSmall: { height: 32, fontSize: '0.8125rem' },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small', variant: 'outlined' },
        styleOverrides: {
          root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
            border: `1px solid ${p.divider}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            '&.Mui-selected': {
              backgroundColor: p.primary.light,
              color: p.primary.dark,
              '& .MuiListItemIcon-root': { color: p.primary.dark },
              '&:hover': { backgroundColor: p.primary.light },
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: { root: { borderRadius: 4, height: 8 } },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 16 },
        },
      },
    },
  })
}

// 하위 호환: 기본(indigo) 테마 default export 유지
const theme = buildTheme('indigo')
export default theme
