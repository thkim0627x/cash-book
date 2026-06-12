import { createTheme, type Theme, alpha } from '@mui/material/styles'
import { indigoTheme } from './themes/indigo'
import { greenTheme } from './themes/green'
import { pinkTheme } from './themes/pink'
import { sodaTheme } from './themes/soda'

// 기본 테마: indigo (우선순위 indigo → green → pink → soda)
export type ThemePreset = 'indigo' | 'green' | 'pink' | 'soda'

const presets = {
  indigo: indigoTheme,
  green: greenTheme,
  pink: pinkTheme,
  soda: sodaTheme,
}

// 수입/지출/경고 색상은 테마 교체와 무관하게 고정 (사용자 인지 일관성 우선)
// CORE 결정: income = success.main #15A34A (TailwindGreen-600, 현대적 초록)
const semanticFixed = {
  success: {
    main: '#15A34A',
    light: '#DCFCE7',
    dark: '#166534',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#C62828',
    light: '#FFEBEE',
    dark: '#B71C1C',
    contrastText: '#FFFFFF',
  },
  warning: { main: '#E65100', light: '#FBE9E7', contrastText: '#FFFFFF' },
  info: { main: '#0277BD', light: '#E3F2FB', contrastText: '#FFFFFF' },
}

// 플로팅 카드 그림자 (가이드 허용 rgba 값)
const CARD_SHADOW =
  '0 1px 2px rgba(14,36,56,.03), 0 6px 20px rgba(14,36,56,.05)'
// 헤더/사이드바 플로팅 그림자 (약하게)
const SURFACE_SHADOW =
  '0 1px 3px rgba(14,36,56,.04), 0 4px 12px rgba(14,36,56,.04)'

export function buildTheme(preset: ThemePreset = 'indigo'): Theme {
  const p = presets[preset]

  return createTheme({
    palette: {
      primary: p.primary,
      secondary: p.secondary,
      background: {
        default: p.background.default,
        paper: p.background.paper,
        sidebar: p.background.sidebar,
        canvasDeep: p.background.canvasDeep,
      } as never,
      text: {
        primary: p.text.primary,
        secondary: p.text.secondary,
        muted: p.text.muted,
      } as never,
      divider: p.divider,
      divider2: p.divider2,
      ...semanticFixed,
    },
    typography: {
      fontFamily: '"Pretendard", "Noto Sans KR", -apple-system, sans-serif',
      // letter-spacing: -0.012em (modern_redesign_guide §3)
      h4: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.012em',
      },
      h5: {
        fontSize: '1.5rem',
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: '-0.012em',
      },
      h6: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '-0.012em',
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: '-0.012em',
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '-0.012em',
      },
      body1: {
        fontSize: '0.9375rem',
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: '-0.012em',
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '-0.012em',
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: '-0.008em',
      },
    },
    shape: { borderRadius: 5 },
    components: {
      // ── AppBar ──────────────────────────────────────────────
      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: p.background.default, // 캔버스 배경 (단일 색상)
            color: p.text.primary,
            boxShadow: 'none',
          },
        },
      },
      // ── CssBaseline ─────────────────────────────────────────
      MuiCssBaseline: {
        styleOverrides: {
          html: { letterSpacing: '-0.012em' },
        },
      },
      // ── Button ──────────────────────────────────────────────
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 5,
            letterSpacing: '-0.01em',
          },
          sizeLarge: { height: 40, fontSize: '1rem' },
          sizeMedium: { height: 36 },
          sizeSmall: { height: 32, fontSize: '0.8125rem' },
          // contained primary: 그라디언트
          containedPrimary: {
            background: `linear-gradient(135deg, ${p.primary.main} 0%, ${p.primary.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${p.primary.dark} 0%, ${p.primary.dark} 100%)`,
            },
          },
          // outlined: ghost 스타일 (1.5px 테두리)
          outlined: {
            borderWidth: '1.5px',
            '&:hover': { borderWidth: '1.5px' },
          },
          outlinedPrimary: {
            borderColor: p.primary.main,
            color: p.primary.main,
            '&:hover': {
              backgroundColor: alpha(p.primary.main, 0.06),
              borderColor: p.primary.dark,
            },
          },
        },
      },
      // ── TextField ───────────────────────────────────────────
      MuiTextField: {
        defaultProps: { size: 'small', variant: 'outlined' },
        styleOverrides: {
          root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } },
        },
      },
      // ── OutlinedInput ────────────────────────────────────────
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: p.divider2,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: p.primary.main,
            },
          },
        },
      },
      // ── Card ─────────────────────────────────────────────────
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            boxShadow: CARD_SHADOW,
            border: `1px solid ${p.divider2}`,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '20px 20px 16px',
            '&:last-child': { paddingBottom: 20 },
          },
        },
      },
      // ── Paper (기본) ──────────────────────────────────────────
      MuiPaper: {
        styleOverrides: {
          rounded: { borderRadius: 10 },
          elevation1: { boxShadow: CARD_SHADOW },
        },
      },
      // ── Chip ─────────────────────────────────────────────────
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 5, fontWeight: 500, letterSpacing: '-0.01em' },
        },
      },
      // ── ListItemButton ────────────────────────────────────────
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: 'background 0.15s, color 0.15s',
            '&.Mui-selected': {
              backgroundColor: p.primary.light,
              color: p.primary.main,
              fontWeight: 600,
              '& .MuiListItemIcon-root': { color: p.primary.main },
              '&:hover': { backgroundColor: p.primary.light },
            },
          },
        },
      },
      // ── LinearProgress ───────────────────────────────────────
      MuiLinearProgress: {
        styleOverrides: { root: { borderRadius: 4, height: 8 } },
      },
      // ── Dialog ───────────────────────────────────────────────
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
            boxShadow: SURFACE_SHADOW,
          },
        },
      },
      // ── Menu ─────────────────────────────────────────────────
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 10,
            boxShadow: SURFACE_SHADOW,
            border: `1px solid ${p.divider2}`,
          },
        },
      },
      // ── Tooltip ──────────────────────────────────────────────
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontWeight: 500,
            letterSpacing: '-0.01em',
          },
        },
      },
    },
  })
}

// 하위 호환: 기본(indigo) 테마 default export 유지
const theme = buildTheme('indigo')
export default theme
