/**
 * Quantum Time Spiral Visualization System
 * Advanced utilities for positioning tasks and grid lines in a cyberpunk space-time continuum
 */
import type { Task } from '../types';

// Time interval definitions in milliseconds
export const TIME_INTERVALS = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  quarter: 90 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000
};

// Names for interval labels
export const INTERVAL_LABELS = {
  minute: '1m',
  hour: '1h',
  day: '1d',
  week: '1w',
  month: '1m',
  quarter: '1q',
  year: '1y'
};

// Time scale presets (0-6 range on slider)
export const TIME_SCALE_PRESETS = [
  { value: 0, interval: 'minute', label: '1 minute' },
  { value: 1, interval: 'hour', label: '1 hour' },
  { value: 2, interval: 'day', label: '1 day' },
  { value: 3, interval: 'week', label: '1 week' },
  { value: 4, interval: 'month', label: '1 month' },
  { value: 5, interval: 'quarter', label: '1 quarter' },
  { value: 6, interval: 'year', label: '1 year' }
];

// Position type for task entities in 3D space
export interface TaskPosition {
  x: number;
  y: number;
  z: number;
  distance: number;    // Distance from center
  angle: number;       // Angle in radians
  spiralOffset?: number; // Offset along the spiral
  distortionFactor?: number; // Time distortion factor
}

// Grid line definition
export interface GridLine {
  radius: number;
  label: string;
  interval: keyof typeof TIME_INTERVALS;
  timeMs: number;
  alpha: number; // Opacity/prominence
}

/**
 * Map a time interval to a spatial distance using quantum time mapping
 * 
 * @param timeInMs Time in milliseconds
 * @param timeScale Slider position (0-6)
 * @param isFuture Whether the time is in the future or past
 * @returns Distance from center in spatial units
 */
export function mapTimeToDistance(timeInMs: number, timeScale: number, isFuture: boolean = true): number {
  // Base distance for singularity
  const BASE_DISTANCE = 5;
  const MAX_DISTANCE = 100;
  
  // Handle zero or negative time (at singularity or in past)
  if (timeInMs <= 0) {
    return BASE_DISTANCE;
  }
  
  // Get integers below and above the current timeScale
  const lowerIndex = Math.max(0, Math.floor(timeScale));
  const upperIndex = Math.min(TIME_SCALE_PRESETS.length - 1, Math.ceil(timeScale));
  const fraction = timeScale - lowerIndex;
  
  // Get the focus intervals
  const lowerInterval = TIME_INTERVALS[TIME_SCALE_PRESETS[lowerIndex].interval as keyof typeof TIME_INTERVALS];
  const upperInterval = TIME_INTERVALS[TIME_SCALE_PRESETS[upperIndex].interval as keyof typeof TIME_INTERVALS];
  
  // Interpolate between intervals logarithmically
  const effectiveInterval = Math.exp(
    (1 - fraction) * Math.log(lowerInterval) + 
    fraction * Math.log(upperInterval)
  );
  
  // Calculate quantum distortion effect
  // This creates more dramatic spacing near the singularity
  const distortionFactor = 1 - Math.exp(-timeInMs / (effectiveInterval * 0.1));
  
  // Calculate base logarithmic distance
  const logBase = Math.log10(1 + timeInMs / effectiveInterval);
  const logScale = MAX_DISTANCE / Math.log10(1 + TIME_INTERVALS.year / TIME_INTERVALS.minute);
  const logDistance = BASE_DISTANCE + (logBase * logScale);
  
  // Apply quantum distortion
  const distance = BASE_DISTANCE + (logDistance - BASE_DISTANCE) * distortionFactor;
  
  // Tasks in the past are closer to the singularity
  return isFuture ? distance : Math.max(BASE_DISTANCE, distance * 0.7);
}

/**
 * Calculate spiral position based on time until due and angle
 * 
 * @param distance Distance from center
 * @param angle Base angle in radians
 * @param spiralFactor How much spiral effect to apply
 * @returns Position on the spiral in {x,z} coordinates
 */
function calculateSpiralPosition(distance: number, angle: number, spiralFactor: number = 0.2): {x: number, z: number} {
  // Apply spiral effect by offsetting angle based on distance
  const spiralAngle = angle + (spiralFactor * distance / 100);
  
  return {
    x: Math.cos(spiralAngle) * distance,
    z: Math.sin(spiralAngle) * distance
  };
}

/**
 * Calculate a position for a task based on its due date using quantum time mapping
 * 
 * @param task The task to position
 * @param timeScale Slider position (0-6) controlling the time scale focus
 * @returns Position in quantum spiral space
 */
export function calculateTaskPosition(task: Task, timeScale: number): TaskPosition {
  // Current time as reference point
  const now = new Date();
  
  // Calculate time difference in milliseconds
  const dueDate = new Date(task.dueDate);
  const timeDifference = dueDate.getTime() - now.getTime();
  const isFuture = timeDifference > 0;
  
  // Map the time to a distance using our quantum mapping
  const absTimeDifference = Math.abs(timeDifference);
  const distance = mapTimeToDistance(absTimeDifference, timeScale, isFuture);
  
  // Generate a stable base angle
  // Start with base angle based on whether task is in future or past
  const futurePastOffset = isFuture ? 0 : Math.PI;
  
  // Add variation based on due date attributes
  const dayFactor = (dueDate.getDay() / 7);
  const timeFactor = (dueDate.getHours() / 24);
  
  // Generate a unique angle offset based on task ID for uniqueness
  const idHash = task.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const idOffset = (idHash % 100) / 100;
  
  // Calculate final base angle
  const angle = futurePastOffset + (dayFactor + timeFactor + idOffset) * Math.PI;
  
  // Apply spiral effect for more interesting distribution
  const spiralFactor = 0.1 + (idHash % 10) / 100; // Subtle unique spiral for each task
  const spiralPosition = calculateSpiralPosition(distance, angle, spiralFactor);
  
  // Priority affects Y position (vertical placement)
  const priorityMap: Record<string, number> = {
    'low': 0,
    'medium': 0.7,
    'high': 1.5,
    'critical': 2.5
  };
  
  const yOffset = priorityMap[task.priority] || 0;
  
  // For completed tasks, move them slightly below the plane
  const y = task.completed ? -1.0 : yOffset;
  
  // Calculate distortion factor for animations
  const distortionFactor = 1 - Math.exp(-absTimeDifference / (TIME_INTERVALS.day * 0.1));
  
  return {
    x: spiralPosition.x,
    y: y,
    z: spiralPosition.z,
    distance: distance,
    angle: angle,
    spiralOffset: spiralFactor,
    distortionFactor: distortionFactor
  };
}

/**
 * Generate quantum grid lines based on time scale
 * 
 * @param timeScale Slider position (0-6)
 * @returns Array of grid lines to display
 */
export function generateGridLines(timeScale: number): GridLine[] {
  const gridLines: GridLine[] = [];
  
  // Get the primary interval based on current time scale
  const primaryIndex = Math.floor(timeScale);
  const primaryInterval = TIME_SCALE_PRESETS[primaryIndex].interval as keyof typeof TIME_INTERVALS;
  const primaryTimeMs = TIME_INTERVALS[primaryInterval];
  
  // Add main interval grid line
  gridLines.push({
    radius: mapTimeToDistance(primaryTimeMs, timeScale),
    label: INTERVAL_LABELS[primaryInterval],
    interval: primaryInterval,
    timeMs: primaryTimeMs,
    alpha: 1.0 // Full opacity for primary interval
  });
  
  // Add grid line for next interval up (if not at max)
  if (primaryIndex < TIME_SCALE_PRESETS.length - 1) {
    const nextInterval = TIME_SCALE_PRESETS[primaryIndex + 1].interval as keyof typeof TIME_INTERVALS;
    const nextTimeMs = TIME_INTERVALS[nextInterval];
    
    gridLines.push({
      radius: mapTimeToDistance(nextTimeMs, timeScale),
      label: INTERVAL_LABELS[nextInterval],
      interval: nextInterval,
      timeMs: nextTimeMs,
      alpha: 0.7 // Slightly less prominent
    });
  }
  
  // Add grid line for previous interval (if not at min)
  if (primaryIndex > 0) {
    const prevInterval = TIME_SCALE_PRESETS[primaryIndex - 1].interval as keyof typeof TIME_INTERVALS;
    const prevTimeMs = TIME_INTERVALS[prevInterval];
    
    gridLines.push({
      radius: mapTimeToDistance(prevTimeMs, timeScale),
      label: INTERVAL_LABELS[prevInterval],
      interval: prevInterval,
      timeMs: prevTimeMs,
      alpha: 0.7 // Slightly less prominent
    });
  }
  
  // Add half interval markers
  const halfTimeMs = primaryTimeMs / 2;
  gridLines.push({
    radius: mapTimeToDistance(halfTimeMs, timeScale),
    label: '½' + INTERVAL_LABELS[primaryInterval],
    interval: primaryInterval,
    timeMs: halfTimeMs,
    alpha: 0.4 // Less prominent for half interval
  });
  
  // Add quarter interval marker (for finer granularity)
  const quarterTimeMs = primaryTimeMs / 4;
  gridLines.push({
    radius: mapTimeToDistance(quarterTimeMs, timeScale),
    label: '¼' + INTERVAL_LABELS[primaryInterval],
    interval: primaryInterval,
    timeMs: quarterTimeMs,
    alpha: 0.3 // Even less prominent
  });
  
  // Singularity marker (now)
  gridLines.push({
    radius: 5, // Base distance
    label: 'NOW',
    interval: 'minute',
    timeMs: 0,
    alpha: 1.0
  });
  
  return gridLines;
}

/**
 * Get the current time scale label
 * 
 * @param timeScale Slider position (0-6)
 * @returns User-friendly label for the current scale
 */
export function getTimeScaleLabel(timeScale: number): string {
  // Get the discrete intervals below and above
  const lowerIndex = Math.floor(timeScale);
  const upperIndex = Math.min(TIME_SCALE_PRESETS.length - 1, Math.ceil(timeScale));
  
  // If we're at a discrete point, just return that label
  if (timeScale === lowerIndex) {
    return TIME_SCALE_PRESETS[lowerIndex].label;
  }
  
  // Calculate how far between the two discrete points we are
  const fraction = timeScale - lowerIndex;
  
  // If we're closer to the lower index, use that label
  if (fraction < 0.5) {
    return TIME_SCALE_PRESETS[lowerIndex].label;
  }
  
  // Otherwise use the upper index label
  return TIME_SCALE_PRESETS[upperIndex].label;
}

/**
 * Avoid clustering of tasks by adjusting positions when tasks are too close
 * Modified for quantum spiral layout
 * 
 * @param positions Map of task ID to position
 * @returns Adjusted map of positions
 */
export function avoidClusters(positions: Map<string, TaskPosition>): Map<string, TaskPosition> {
  const minDistance = 5; // Minimum distance between tasks
  const adjustedPositions = new Map<string, TaskPosition>(positions);
  const positionArray = Array.from(positions.entries());
  
  // For each pair of tasks, check if they're too close and adjust
  for (let i = 0; i < positionArray.length; i++) {
    const [id1, pos1] = positionArray[i];
    
    for (let j = i + 1; j < positionArray.length; j++) {
      const [id2, pos2] = positionArray[j];
      
      // Calculate distance between tasks (primarily on XZ plane for 2D layout)
      const dx = pos1.x - pos2.x;
      const dz = pos1.z - pos2.z;
      // Include y with reduced impact to maintain primarily 2D separation
      const dy = (pos1.y - pos2.y) * 0.5; 
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      // If too close, adjust positions by pushing them apart
      if (distance < minDistance) {
        // Vector from pos2 to pos1 (primarily in XZ plane)
        const vx = dx / distance;
        const vz = dz / distance;
        // Minimal adjustment in Y to maintain orbital plane
        const vy = dy / distance * 0.5;
        
        // Calculate adjustment amount (half the remaining distance)
        const adjustment = (minDistance - distance) / 2;
        
        // Get the positions to adjust
        const adjustedPos1 = adjustedPositions.get(id1)!;
        const adjustedPos2 = adjustedPositions.get(id2)!;
        
        // Adjust positions
        adjustedPos1.x += vx * adjustment;
        adjustedPos1.y += vy * adjustment;
        adjustedPos1.z += vz * adjustment;
        
        adjustedPos2.x -= vx * adjustment;
        adjustedPos2.y -= vy * adjustment;
        adjustedPos2.z -= vz * adjustment;
        
        // Recalculate distance and angle for adjusted positions
        adjustedPos1.distance = Math.sqrt(adjustedPos1.x * adjustedPos1.x + adjustedPos1.z * adjustedPos1.z);
        adjustedPos1.angle = Math.atan2(adjustedPos1.z, adjustedPos1.x);
        
        adjustedPos2.distance = Math.sqrt(adjustedPos2.x * adjustedPos2.x + adjustedPos2.z * adjustedPos2.z);
        adjustedPos2.angle = Math.atan2(adjustedPos2.z, adjustedPos2.x);
        
        adjustedPositions.set(id1, adjustedPos1);
        adjustedPositions.set(id2, adjustedPos2);
      }
    }
  }
  
  return adjustedPositions;
}

/**
 * Get transition data for animating between two time scales
 * When progress is provided, returns an interpolated time scale value.
 * Otherwise returns transition metadata.
 */
export function getTimeScaleTransition(oldTimeScale: number, newTimeScale: number, progress: number): number;
export function getTimeScaleTransition(oldTimeScale: number, newTimeScale: number): { 
  direction: number; 
  magnitude: number; 
  smoothStep: (t: number) => number;
};
export function getTimeScaleTransition(oldTimeScale: number, newTimeScale: number, progress?: number): number | { 
  direction: number; 
  magnitude: number; 
  smoothStep: (t: number) => number;
} {
  if (progress !== undefined) {
    // Return interpolated value if progress is provided
    return oldTimeScale + (newTimeScale - oldTimeScale) * progress;
  }
  
  // Otherwise return transition metadata (for backwards compatibility)
  return {
    // Direction: -1 = zooming out, 1 = zooming in
    direction: oldTimeScale > newTimeScale ? -1 : 1,
    // Magnitude: how big of a change (for more dramatic effects on larger jumps)
    magnitude: Math.abs(oldTimeScale - newTimeScale),
    // Smooth step function for animation curve
    smoothStep: (t: number) => t * t * (3 - 2 * t)
  };
}

/**
 * Get interval boundaries for current time scale
 * 
 * @param timeScale Current time scale (0-6)
 * @returns Object with lower and upper interval boundaries
 */
export function getIntervalBoundaries(timeScale: number) {
  const lowerIndex = Math.floor(timeScale);
  const upperIndex = Math.min(TIME_SCALE_PRESETS.length - 1, Math.ceil(timeScale));
  
  return {
    lowerInterval: TIME_SCALE_PRESETS[lowerIndex].interval,
    upperInterval: TIME_SCALE_PRESETS[upperIndex].interval,
    fraction: timeScale - lowerIndex
  };
}
