/**
 * Utilities for WebGL and Three.js integration
 */

/**
 * Check if WebGL is available in the current browser
 * @returns boolean indicating if WebGL is supported
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

/**
 * Get optimal pixel ratio based on device and performance settings
 * @param performanceMode Whether performance mode is enabled
 * @returns Optimal pixel ratio for rendering
 */
export function getOptimalPixelRatio(performanceMode: boolean): number {
  // In performance mode, we limit to a lower value
  if (performanceMode) {
    return Math.min(1.5, window.devicePixelRatio || 1);
  } 
  
  // Otherwise, use device pixel ratio up to a reasonable max
  // This prevents extremely high DPI displays from using excessive resources
  return Math.min(2.5, window.devicePixelRatio || 1);
}

/**
 * Configure renderer for optimal performance
 * @param renderer Three.js WebGLRenderer
 * @param performanceMode Whether performance mode is enabled
 */
export function optimizeRenderer(renderer: any, performanceMode: boolean): void {
  // Set pixel ratio
  renderer.setPixelRatio(getOptimalPixelRatio(performanceMode));
  
  // Enable shadow map if not in performance mode
  renderer.shadowMap.enabled = !performanceMode;
  
  // Set appropriate tone mapping based on performance
  renderer.toneMapping = performanceMode ? 0 : 1; // NoToneMapping vs LinearToneMapping
  
  // Optimize further settings
  renderer.powerPreference = 'high-performance';
  renderer.precision = performanceMode ? 'mediump' : 'highp';
}

/**
 * Check if the current system is likely to have good WebGL performance
 * @returns Performance score from 0-1
 */
export function estimatePerformance(): number {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') as WebGLRenderingContext || 
             canvas.getContext('experimental-webgl') as WebGLRenderingContext;
  
  if (!gl) {
    return 0; // No WebGL support
  }
  
  let score = 0.5; // Start with average score
  
  // Check for various extensions and features
  const extensions = [
    'WEBGL_depth_texture',
    'OES_texture_float',
    'OES_texture_half_float',
    'OES_element_index_uint',
    'WEBGL_draw_buffers'
  ];
  
  // Add score for each supported extension
  for (const ext of extensions) {
    if (gl.getExtension(ext)) {
      score += 0.1;
    }
  }
  
  // Check for high precision support
  const vertHighp = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
  const fragHighp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  
  if (vertHighp && fragHighp && vertHighp.precision > 0 && fragHighp.precision > 0) {
    score += 0.1;
  }
  
  // Check for high device pixel ratio (retina displays)
  if (window.devicePixelRatio > 1) {
    score -= 0.1; // More challenging to render at high pixel ratios
  }
  
  // Hardware concurrency gives insight into CPU cores
  if (navigator.hardwareConcurrency) {
    if (navigator.hardwareConcurrency >= 8) {
      score += 0.1;
    } else if (navigator.hardwareConcurrency <= 2) {
      score -= 0.1;
    }
  }
  
  // User agent checking for mobile devices
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    score -= 0.2; // Mobile devices typically have lower performance
  }
  
  // Clamp score between 0 and 1
  return Math.max(0, Math.min(1, score));
}
