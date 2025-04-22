/**
 * Typography system for VoidCheck
 * Space-themed with retrofuturistic elements
 */

/**
 * Font families
 */
export const fontFamily = {
  // Monospace font for technical information
  mono: "'JetBrains Mono', 'SF Mono', 'Roboto Mono', Menlo, Monaco, Consolas, monospace",
  
  // Sans-serif for general content
  sans: "'Inter', 'SF Pro Text', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
  
  // Display font for app title/branding
  display: "'Audiowide', 'Orbitron', 'SF Pro Display', 'Roboto', sans-serif"
};

/**
 * Font sizes (in pixels)
 */
export const fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  md: '1rem',       // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem'   // 72px
};

/**
 * Font weights
 */
export const fontWeight = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900
};

/**
 * Line heights
 */
export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2
};

/**
 * Letter spacing
 */
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em'
};

/**
 * Text styles
 */
export const textStyle = {
  // Display / Headers
  displayLarge: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight
  },
  displayMedium: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight
  },
  displaySmall: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight
  },
  
  // Headers
  headingLarge: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight
  },
  headingMedium: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight
  },
  headingSmall: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight
  },
  
  // Body text
  bodyLarge: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal
  },
  bodyMedium: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal
  },
  bodySmall: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal
  },
  
  // Technical
  code: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wide
  },
  
  // Label
  label: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wide
  },
  
  // Brand
  brand: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.none,
    letterSpacing: letterSpacing.wider
  }
};

export default {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyle
};
