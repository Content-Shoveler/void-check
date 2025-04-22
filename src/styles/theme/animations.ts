/**
 * Animation system for VoidCheck
 * Defines reusable animations and transitions for the application
 */

/**
 * Easing functions
 */
export const easing = {
  // Standard
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Precise control
  // cubic-bezier(x1, y1, x2, y2)
  easeInSine: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
  easeOutSine: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
  easeInOutSine: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
  
  // Back variations (slight overshoot)
  easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // Space-themed custom easing
  spaceTravel: 'cubic-bezier(0.19, 1, 0.22, 1)', // Smooth and exaggerated
  warpSpeed: 'cubic-bezier(0.075, 0.82, 0.165, 1)' // Fast start, slow end
};

/**
 * Duration presets (in milliseconds)
 */
export const duration = {
  fastest: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  slowest: 800
};

/**
 * Transition presets
 */
export const transition = {
  // Basic transitions
  default: `all ${duration.normal}ms ${easing.easeInOut}`,
  fast: `all ${duration.fast}ms ${easing.easeInOut}`,
  slow: `all ${duration.slow}ms ${easing.easeInOut}`,
  
  // Property-specific transitions
  opacity: `opacity ${duration.normal}ms ${easing.easeInOut}`,
  transform: `transform ${duration.normal}ms ${easing.spaceTravel}`,
  color: `color ${duration.fast}ms ${easing.easeOut}`,
  background: `background ${duration.fast}ms ${easing.easeOut}`,
  border: `border ${duration.fast}ms ${easing.easeOut}`,
  shadow: `box-shadow ${duration.fast}ms ${easing.easeOut}`,
  
  // Space-themed transitions
  warp: `all ${duration.normal}ms ${easing.warpSpeed}`,
  cosmic: `all ${duration.slow}ms ${easing.spaceTravel}`,
  
  // Components
  task: `transform ${duration.normal}ms ${easing.spaceTravel}, opacity ${duration.normal}ms ${easing.easeInOut}`,
  scale: `transform ${duration.fast}ms ${easing.easeInOut}`
};

/**
 * Keyframe animations
 */
export const keyframes = {
  // Fade in animation
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  
  // Pulse animation
  pulse: `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `,
  
  // Orbit animation for tasks
  orbit: `
    @keyframes orbit {
      0% { transform: rotate(0deg) translateX(10px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(10px) rotate(-360deg); }
    }
  `,
  
  // Star twinkle animation
  twinkle: `
    @keyframes twinkle {
      0% { opacity: 0.3; }
      50% { opacity: 1; }
      100% { opacity: 0.3; }
    }
  `,
  
  // Nebula glow animation
  nebulaGlow: `
    @keyframes nebulaGlow {
      0% { filter: brightness(1) saturate(1); }
      50% { filter: brightness(1.2) saturate(1.2); }
      100% { filter: brightness(1) saturate(1); }
    }
  `,
  
  // Space float animation
  spaceFloat: `
    @keyframes spaceFloat {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
  `,
  
  // Completion animation
  complete: `
    @keyframes complete {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.5; }
      100% { transform: scale(0); opacity: 0; }
    }
  `
};

/**
 * Animation presets
 */
export const animation = {
  fadeIn: `fadeIn ${duration.normal}ms ${easing.easeOut} forwards`,
  pulse: `pulse ${duration.slow * 2}ms ${easing.easeInOut} infinite`,
  orbit: `orbit 8s ${easing.linear} infinite`,
  twinkle: `twinkle 3s ${easing.easeInOut} infinite`,
  nebulaGlow: `nebulaGlow 5s ${easing.easeInOut} infinite`,
  spaceFloat: `spaceFloat 6s ${easing.easeInOut} infinite`,
  complete: `complete ${duration.normal}ms ${easing.easeInOut} forwards`
};

export default {
  easing,
  duration,
  transition,
  keyframes,
  animation
};
