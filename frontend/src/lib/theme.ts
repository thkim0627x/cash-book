import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#3F51B5',
      light: '#7986CB',
      dark: '#283593',
      contrastText: '#FFFFFF',
    },
    success: { main: '#2E7D32', light: '#E8F5E9' },
    error: { main: '#C62828', light: '#FFEBEE' },
    warning: { main: '#E65100' },
    background: { default: '#FAFAFA', paper: '#FFFFFF' },
    text: { primary: '#212121', secondary: '#757575' },
  },
  typography: {
    fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
    h4: { fontSize: '2rem', fontWeight: 700 },
    h5: { fontSize: '1.5rem', fontWeight: 700 },
    h6: { fontSize: '1.25rem', fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    body2: { fontSize: '0.875rem' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
      },
      defaultProps: { disableElevation: true },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 4 } },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderBottom: '1px solid #E0E0E0' } },
    },
  },
})

export default theme
