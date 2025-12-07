'use client';
import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { severity: 'info' },
              style: {
                backgroundColor: '#60a5fa',
              },
            },
          ],
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignSelf: 'center',
          width: '100%',
          padding: theme.spacing(4),
          gap: theme.spacing(2),
          margin: 'auto',
          [theme.breakpoints.up('sm')]: {
            maxWidth: '450px',
          },
          boxShadow:
            'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
          ...theme.applyStyles('dark', {
            boxShadow:
              'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
          }),
        }),
      },
    },
    MuiStack: {
      styleOverrides: {
        root: ({ theme }) => ({
          height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
          minHeight: '100%',
          padding: theme.spacing(2),
          [theme.breakpoints.up('sm')]: {
            padding: theme.spacing(4),
          },
          position: 'relative',
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            zIndex: -1,
            inset: 0,
              backgroundImage:
                'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
            backgroundRepeat: 'no-repeat',
            ...theme.applyStyles('dark', {
              backgroundImage:
                'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
            }),
          },
        }),
      },
    },
  },
});

export default theme;