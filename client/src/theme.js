import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00bcd4' },
    secondary: { main: '#7c4dff' },
    background: { default: '#0b0f14', paper: '#121821' }
  },
  shape: { borderRadius: 10 },
  components: {
    MuiAppBar: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiButton: { defaultProps: { variant: 'contained' } }
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"'
  }
});

export default theme;