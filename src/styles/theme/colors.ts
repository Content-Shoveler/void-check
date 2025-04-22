/**
 * Color palette for VoidCheck
 * Space-inspired with retrofuturistic elements and cyberpunk accents
 */

// Deep space theme
export const SpaceColors = {
  // Primary colors
  deepSpace: '#13111C',     // Main background - deep space black
  spaceDust: '#211E2E',     // Surface containers - slightly lighter black
  nebula: '#9C27B0',        // Primary accent - deep purple
  cosmicRay: '#00BCD4',     // Secondary accent - cyan blue
  
  // Text colors
  starlight: '#F5F5F7',     // Primary text - off-white
  moonlight: '#BCBAC4',     // Secondary text - light gray
  
  // Accent colors
  supernova: '#FF4081',     // Bright accent - neon pink
  celestialRed: '#FC3D21',  // Retro NASA red
  nasaBlue: '#0B3D91',      // Retro NASA blue
  
  // State colors
  warpRed: '#F44336',       // Error state - red
  warpYellow: '#FF9800',    // Warning state - orange
  warpGreen: '#4CAF50',     // Success state - green
  
  // Gradients
  nebulaeGradient: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
  cosmicGradient: 'linear-gradient(135deg, #00BCD4 0%, #2196F3 100%)',
  sunsetGradient: 'linear-gradient(135deg, #FF4081 0%, #FF9800 100%)'
};

// Dark theme variant
export const DarkTheme = {
  primary: SpaceColors.nebula,
  secondary: SpaceColors.cosmicRay,
  background: SpaceColors.deepSpace,
  surface: SpaceColors.spaceDust,
  text: SpaceColors.starlight,
  textSecondary: SpaceColors.moonlight,
  accent: SpaceColors.supernova,
  error: SpaceColors.warpRed,
  warning: SpaceColors.warpYellow,
  success: SpaceColors.warpGreen,
  
  // Additional UI colors
  surfaceHover: '#2A273A',
  surfaceActive: '#332F47',
  divider: '#3A3649',
  overlay: 'rgba(19, 17, 28, 0.8)'
};

// Light theme variant (retro NASA inspired)
export const LightTheme = {
  primary: SpaceColors.nasaBlue,
  secondary: SpaceColors.celestialRed,
  background: '#F5F5F7',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  accent: SpaceColors.supernova,
  error: SpaceColors.warpRed,
  warning: SpaceColors.warpYellow,
  success: SpaceColors.warpGreen,
  
  // Additional UI colors
  surfaceHover: '#F0F0F2',
  surfaceActive: '#E6E6E8',
  divider: '#E0E0E0',
  overlay: 'rgba(245, 245, 247, 0.8)'
};

export default {
  SpaceColors,
  DarkTheme,
  LightTheme
};
