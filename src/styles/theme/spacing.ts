/**
 * Spacing system for VoidCheck
 * Provides consistent spacing throughout the application
 */

// Base unit for spacing (in pixels)
const BASE = 8;

/**
 * Spacing scale
 * Uses 8px as a base unit and scales up
 */
export const spacing = {
  xxs: `${BASE / 4}px`,    // 2px - Micro spacing
  xs: `${BASE / 2}px`,     // 4px - Tiny spacing
  sm: `${BASE}px`,         // 8px - Small spacing
  md: `${BASE * 2}px`,     // 16px - Medium spacing
  lg: `${BASE * 3}px`,     // 24px - Large spacing
  xl: `${BASE * 4}px`,     // 32px - Extra large spacing
  xxl: `${BASE * 6}px`,    // 48px - Double extra large spacing
  xxxl: `${BASE * 8}px`    // 64px - Triple extra large spacing
};

/**
 * Creates a function to calculate spacing based on the base unit
 * @param units - Number of base units
 * @returns CSS value with the calculated spacing
 */
export const space = (units: number): string => {
  return `${BASE * units}px`;
};

/**
 * Border radius values
 */
export const radius = {
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  round: '50%',
  circle: '9999px'
};

/**
 * Z-index values for stacking elements
 */
export const zIndex = {
  base: 1,
  dialog: 10,
  popover: 20,
  tooltip: 30,
  overlay: 40,
  modal: 50,
  toast: 60,
  dropdown: 70
};

/**
 * Grid system values
 */
export const grid = {
  columns: 12,
  gutter: spacing.md,
  margin: spacing.md
};

export default {
  spacing,
  space,
  radius,
  zIndex,
  grid
};
