/**
 * Material UI (MUI) theme overrides for VoidCheck
 * Customizes MUI components to match the space theme
 */

import { DarkTheme, LightTheme } from './theme/colors';
import { fontFamily, fontSize, fontWeight } from './theme/typography';
import { radius } from './theme/spacing';

/**
 * Dark theme overrides for MUI components
 */
export const darkThemeOverrides = {
  palette: {
    mode: 'dark',
    primary: {
      main: DarkTheme.primary,
      light: '#BB4ECA',
      dark: '#7B1FA2',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: DarkTheme.secondary,
      light: '#26D6F1',
      dark: '#0095A8',
      contrastText: '#FFFFFF',
    },
    background: {
      default: DarkTheme.background,
      paper: DarkTheme.surface,
    },
    text: {
      primary: DarkTheme.text,
      secondary: DarkTheme.textSecondary,
    },
    error: {
      main: DarkTheme.error,
    },
    warning: {
      main: DarkTheme.warning,
    },
    success: {
      main: DarkTheme.success,
    },
    action: {
      active: 'rgba(255, 255, 255, 0.7)',
      hover: 'rgba(255, 255, 255, 0.1)',
      selected: 'rgba(255, 255, 255, 0.2)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
    divider: DarkTheme.divider,
  },
  
  shape: {
    borderRadius: parseInt(radius.md),
  },
  
  typography: {
    fontFamily: fontFamily.sans,
    fontSize: parseInt(fontSize.md),
    fontWeightLight: fontWeight.light,
    fontWeightRegular: fontWeight.normal,
    fontWeightMedium: fontWeight.medium,
    fontWeightBold: fontWeight.bold,
    
    h1: {
      fontFamily: fontFamily.display,
      fontWeight: fontWeight.bold,
    },
    h2: {
      fontFamily: fontFamily.display,
      fontWeight: fontWeight.bold,
    },
    h3: {
      fontWeight: fontWeight.bold,
    },
    button: {
      fontWeight: fontWeight.medium,
      textTransform: 'none',
    },
    overline: {
      fontFamily: fontFamily.mono,
      letterSpacing: '0.1em',
    },
  },
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          padding: '0.5rem 1.5rem',
          transition: 'all 0.2s ease-in-out',
          textTransform: 'none',
          fontWeight: fontWeight.medium,
        },
        contained: {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: DarkTheme.surface,
          borderRadius: radius.lg,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 20px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
    
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: DarkTheme.surface,
          borderRadius: radius.lg,
          boxShadow: '0 16px 32px rgba(0, 0, 0, 0.5)',
          backgroundImage: 
            `radial-gradient(circle at 15% 15%, ${DarkTheme.surface} 0%, ${DarkTheme.background} 100%)`,
        },
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: radius.md,
            '& fieldset': {
              borderWidth: '2px',
              transition: 'border-color 0.2s ease-in-out',
            },
            '&:hover fieldset': {
              borderColor: DarkTheme.primary,
            },
            '&.Mui-focused fieldset': {
              borderWidth: '2px',
            },
          },
        },
      },
    },
    
    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: 8,
        },
        thumb: {
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        },
        track: {
          opacity: 0.3,
          borderRadius: 20,
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: radius.circle,
          fontWeight: fontWeight.medium,
          '&.MuiChip-colorPrimary': {
            backgroundColor: `${DarkTheme.primary}80`, // 50% opacity
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: `${DarkTheme.secondary}80`, // 50% opacity
          },
        },
      },
    },
  },
};

/**
 * Light theme overrides for MUI components
 */
export const lightThemeOverrides = {
  ...darkThemeOverrides,
  palette: {
    mode: 'light',
    primary: {
      main: LightTheme.primary,
      light: '#2958A4',
      dark: '#052E72',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: LightTheme.secondary,
      light: '#FD5E45',
      dark: '#D21F00',
      contrastText: '#FFFFFF',
    },
    background: {
      default: LightTheme.background,
      paper: LightTheme.surface,
    },
    text: {
      primary: LightTheme.text,
      secondary: LightTheme.textSecondary,
    },
    error: {
      main: LightTheme.error,
    },
    warning: {
      main: LightTheme.warning,
    },
    success: {
      main: LightTheme.success,
    },
    action: {
      active: 'rgba(0, 0, 0, 0.7)',
      hover: 'rgba(0, 0, 0, 0.05)',
      selected: 'rgba(0, 0, 0, 0.1)',
      disabled: 'rgba(0, 0, 0, 0.3)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
    divider: LightTheme.divider,
  },
  components: {
    ...darkThemeOverrides.components,
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: LightTheme.surface,
          borderRadius: radius.lg,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: LightTheme.surface,
          borderRadius: radius.lg,
          boxShadow: '0 16px 32px rgba(0, 0, 0, 0.15)',
          backgroundImage: 'none',
        },
      },
    },
  },
};

export default {
  darkThemeOverrides,
  lightThemeOverrides
};
