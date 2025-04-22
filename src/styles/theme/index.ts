/**
 * Theme system for VoidCheck
 * Export all theme components together for easy access
 */

import colors, { SpaceColors, DarkTheme, LightTheme } from './colors';
import spacing, { space, radius, zIndex, grid } from './spacing';
import typography, { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textStyle } from './typography';
import animations, { easing, duration, transition, keyframes, animation } from './animations';

/**
 * VoidCheck theme object
 * Combines all theme components into a single object
 */
const theme = {
  // Colors
  colors,
  SpaceColors,
  DarkTheme,
  LightTheme,
  
  // Spacing
  spacing,
  space,
  radius,
  zIndex,
  grid,
  
  // Typography
  typography,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyle,
  
  // Animations
  animations,
  easing,
  duration,
  transition,
  keyframes,
  animation
};

export {
  // Colors
  SpaceColors,
  DarkTheme,
  LightTheme,
  
  // Spacing
  space,
  radius,
  zIndex,
  grid,
  
  // Typography
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyle,
  
  // Animations
  easing,
  duration,
  transition,
  keyframes,
  animation
};

export default theme;
