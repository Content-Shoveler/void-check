/**
 * Utilities for handling task positioning based on time scale
 */
import type { Task } from '../types';

// Time scale constants in milliseconds
export const TIME_SCALES = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  QUARTER: 90 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000
};

// Time scale slider marks for UI
export const TIME_SCALE_MARKS = [
  { value: 0, label: '1m' },   // 1 minute
  { value: 2, label: '1h' },   // 1 hour
  { value: 4, label: '1d' },   // 1 day
  { value: 6, label: '1w' },   // 1 week
  { value: 7, label: '1m' },   // 1 month
  { value: 8.5, label: '1q' }, // 1 quarter
  { value: 10, label: '1y' }   // 1 year
];

// Position type for task entities in 3D space
export interface TaskPosition {
  x: number;
  y: number;
  z: number;
  distance?: number; // Distance from center
  angle?: number;    // Angle in radians
}

/**
 * Get the scaling factor for task positions based on time scale
 * Lower values (1m) produce larger scaling (zoomed in effect) 
 * Higher values (1y) produce smaller scaling (zoomed out effect)
 * 
 * @param sliderValue Slider value (0-10)
 * @returns Scaling factor
 */
export function getPositionScalingFactor(sliderValue: number): number {
  // Scale goes from ~0.1 (most zoomed in at 1m) to ~2.0 (most zoomed out at 1y)
  // At 0 (1m), we want objects to appear 10x larger (closer)
  // At 10 (1y), we want objects to appear 2x smaller (further away)
  
  // Convert slider value to 0-1 range
  const normValue = sliderValue / 10;
  
  // Calculate scaling with exponential curve for more natural scaling
  // This creates a non-linear effect where early changes are more dramatic
  const baseScale = 0.1; // Scaling at 1m view
  const maxScale = 2.0;  // Scaling at 1y view
  
  return baseScale + Math.pow(normValue, 1.5) * (maxScale - baseScale);
}

/**
 * Get the current time scale in milliseconds based on slider position
 * 
 * @param sliderValue Value from the slider (0-10)
 * @returns Time scale in milliseconds
 */
export function getTimeScaleMs(sliderValue: number): number {
  // If at the min or max, return exact time scale
  if (sliderValue <= 0) return TIME_SCALES.MINUTE;
  if (sliderValue >= 10) return TIME_SCALES.YEAR;
  
  // Find the two marks that this value falls between
  let lowerMark = TIME_SCALE_MARKS[0];
  let upperMark = TIME_SCALE_MARKS[TIME_SCALE_MARKS.length - 1];
  
  for (let i = 0; i < TIME_SCALE_MARKS.length - 1; i++) {
    if (sliderValue >= TIME_SCALE_MARKS[i].value && sliderValue <= TIME_SCALE_MARKS[i + 1].value) {
      lowerMark = TIME_SCALE_MARKS[i];
      upperMark = TIME_SCALE_MARKS[i + 1];
      break;
    }
  }
  
  // Calculate the percentage between the two marks
  const range = upperMark.value - lowerMark.value;
  const percentInRange = (sliderValue - lowerMark.value) / range;
  
  // Get the time scale values for both marks
  let lowerTimeMs = TIME_SCALES.MINUTE;
  let upperTimeMs = TIME_SCALES.YEAR;
  
  // Map labels to time scales
  switch (lowerMark.label) {
    case '1m': lowerTimeMs = TIME_SCALES.MINUTE; break;
    case '1h': lowerTimeMs = TIME_SCALES.HOUR; break;
    case '1d': lowerTimeMs = TIME_SCALES.DAY; break;
    case '1w': lowerTimeMs = TIME_SCALES.WEEK; break;
    case '1m': lowerTimeMs = TIME_SCALES.MONTH; break;
    case '1q': lowerTimeMs = TIME_SCALES.QUARTER; break;
    case '1y': lowerTimeMs = TIME_SCALES.YEAR; break;
  }
  
  switch (upperMark.label) {
    case '1m': upperTimeMs = TIME_SCALES.MINUTE; break;
    case '1h': upperTimeMs = TIME_SCALES.HOUR; break;
    case '1d': upperTimeMs = TIME_SCALES.DAY; break;
    case '1w': upperTimeMs = TIME_SCALES.WEEK; break;
    case '1m': upperTimeMs = TIME_SCALES.MONTH; break;
    case '1q': upperTimeMs = TIME_SCALES.QUARTER; break;
    case '1y': upperTimeMs = TIME_SCALES.YEAR; break;
  }
  
  // Use an exponential interpolation for smoother scaling between time periods
  return lowerTimeMs * Math.pow(upperTimeMs / lowerTimeMs, percentInRange);
}

/**
 * Calculate a 2D position for a task based on its due date
 * and the current time scale factor, creating a solar system-like visualization
 * 
 * @param task The task to position
 * @param timeScale Scale factor (0-10) controlling how spread out tasks are in time
 * @returns Position in solar system space (primarily using X and Z axes)
 */
export function calculateTaskPosition(task: Task, timeScale: number): TaskPosition {
  // Current time as reference point
  const now = new Date();
  
  // Calculate time difference in milliseconds
  const dueDate = new Date(task.dueDate);
  const timeDifference = dueDate.getTime() - now.getTime();
  const absTimeDifference = Math.abs(timeDifference);
  
  // Base radius constants for different time periods
  const baseRadii = {
    minute: 8,
    hour: 15,
    day: 22,
    week: 30,
    month: 40,
    quarter: 55,
    year: 75
  };
  
  // Determine which orbit to place the task in based on its due time
  let orbitRadius;
  
  if (absTimeDifference < TIME_SCALES.MINUTE) {
    // Tasks due within a minute - innermost orbit
    orbitRadius = baseRadii.minute * (0.5 + absTimeDifference / TIME_SCALES.MINUTE * 0.5);
  } else if (absTimeDifference < TIME_SCALES.HOUR) {
    // Tasks due within an hour
    orbitRadius = baseRadii.hour * (0.8 + (absTimeDifference - TIME_SCALES.MINUTE) / (TIME_SCALES.HOUR - TIME_SCALES.MINUTE) * 0.2);
  } else if (absTimeDifference < TIME_SCALES.DAY) {
    // Tasks due within a day
    orbitRadius = baseRadii.day * (0.8 + (absTimeDifference - TIME_SCALES.HOUR) / (TIME_SCALES.DAY - TIME_SCALES.HOUR) * 0.2);
  } else if (absTimeDifference < TIME_SCALES.WEEK) {
    // Tasks due within a week
    orbitRadius = baseRadii.week * (0.8 + (absTimeDifference - TIME_SCALES.DAY) / (TIME_SCALES.WEEK - TIME_SCALES.DAY) * 0.2);
  } else if (absTimeDifference < TIME_SCALES.MONTH) {
    // Tasks due within a month
    orbitRadius = baseRadii.month * (0.8 + (absTimeDifference - TIME_SCALES.WEEK) / (TIME_SCALES.MONTH - TIME_SCALES.WEEK) * 0.2);
  } else if (absTimeDifference < TIME_SCALES.QUARTER) {
    // Tasks due within a quarter
    orbitRadius = baseRadii.quarter * (0.8 + (absTimeDifference - TIME_SCALES.MONTH) / (TIME_SCALES.QUARTER - TIME_SCALES.MONTH) * 0.2);
  } else {
    // Tasks due beyond a quarter
    orbitRadius = baseRadii.year * (0.8 + Math.min(1, (absTimeDifference - TIME_SCALES.QUARTER) / (TIME_SCALES.YEAR - TIME_SCALES.QUARTER)) * 0.2);
  }
  
  // Apply scaling based on the current time scale (0-10)
  // This creates the illusion of camera movement by scaling positions
  // At 0 (1m), scaling is small (tasks appear further away from center)
  // At 10 (1y), scaling is large (tasks appear closer to center)
  const scalingFactor = getPositionScalingFactor(timeScale);
  orbitRadius = orbitRadius / scalingFactor;
  
  // For completed tasks, place them in a different orbit (slightly further out)
  const distanceMultiplier = task.completed ? 1.2 : 1;
  orbitRadius = orbitRadius * distanceMultiplier;
  
  // Calculate angle around the orbit
  // Instead of having positive/negative Z for future/past,
  // we'll use the angle to represent this:
  // - Future tasks: 0 to 180 degrees (right half of circle)
  // - Past/overdue tasks: 180 to 360 degrees (left half of circle)
  
  // Start with base angle based on whether task is in future or past
  let baseAngle = timeDifference > 0 ? 0 : Math.PI;
  
  // Add variation based on due date
  const dayFactor = (dueDate.getDay() / 7);
  const timeFactor = (dueDate.getHours() / 24);
  
  // Generate a unique angle offset based on task ID for uniqueness
  const idHash = task.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const idOffset = (idHash % 100) / 100;
  
  // Calculate final angle - spread tasks around their half of the circle
  let angle;
  if (timeDifference > 0) {
    // Future tasks spread across 0 to 180 degrees
    angle = baseAngle + (dayFactor + timeFactor + idOffset) * Math.PI;
  } else {
    // Past tasks spread across 180 to 360 degrees
    angle = baseAngle + (dayFactor + timeFactor + idOffset) * Math.PI;
  }
  
  // Priority affects Y position slightly (to add minimal 3D effect)
  // This gives a subtle height difference but keeps the main positioning on the 2D plane
  const priorityMap: Record<string, number> = {
    'low': 0,
    'medium': 0.5,
    'high': 1,
    'critical': 1.5
  };
  
  const yOffset = priorityMap[task.priority] || 0;
  
  // For completed tasks, move them slightly lower
  const y = task.completed ? -0.5 : yOffset;
  
  // Calculate final position on the orbital plane
  const x = Math.cos(angle) * orbitRadius;
  const z = Math.sin(angle) * orbitRadius;
  
  return {
    x,
    y,
    z,
    distance: orbitRadius,
    angle
  };
}

/**
 * Avoid clustering of tasks by adjusting positions when tasks are too close
 * Modified for 2D orbital layout
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
      const dy = (pos1.y - pos2.y) * 0.3; 
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      // If too close, adjust positions by pushing them apart
      if (distance < minDistance) {
        // Vector from pos2 to pos1 (primarily in XZ plane)
        const vx = dx / distance;
        const vz = dz / distance;
        // Minimal adjustment in Y to maintain orbital plane
        const vy = dy / distance * 0.3;
        
        // Calculate adjustment amount (half the remaining distance)
        const adjustment = (minDistance - distance) / 2;
        
        // Get the positions to adjust
        const adjustedPos1 = adjustedPositions.get(id1)!;
        const adjustedPos2 = adjustedPositions.get(id2)!;
        
        // Store original orbital radiuses and angles
        const radius1 = adjustedPos1.distance || 
          Math.sqrt(adjustedPos1.x * adjustedPos1.x + adjustedPos1.z * adjustedPos1.z);
        const radius2 = adjustedPos2.distance || 
          Math.sqrt(adjustedPos2.x * adjustedPos2.x + adjustedPos2.z * adjustedPos2.z);
        
        // Adjust positions
        adjustedPos1.x += vx * adjustment;
        adjustedPos1.y += vy * adjustment;
        adjustedPos1.z += vz * adjustment;
        
        adjustedPos2.x -= vx * adjustment;
        adjustedPos2.y -= vy * adjustment;
        adjustedPos2.z -= vz * adjustment;
        
        // Calculate new angles based on adjusted positions
        adjustedPos1.angle = Math.atan2(adjustedPos1.z, adjustedPos1.x);
        adjustedPos2.angle = Math.atan2(adjustedPos2.z, adjustedPos2.x);
        
        adjustedPositions.set(id1, adjustedPos1);
        adjustedPositions.set(id2, adjustedPos2);
      }
    }
  }
  
  return adjustedPositions;
}

/**
 * Get orbital ring configurations based on current time scale
 * Returns radii and visibility for each time period ring
 * 
 * @param sliderValue Current slider value (0-10)
 * @returns Array of orbital ring configurations
 */
export function getOrbitalRingConfig(sliderValue: number): { radius: number; opacity: number; label: string }[] {
  // Base radius values
  const baseRadii = {
    minute: 8.5,
    hour: 15.5,
    day: 22.5,
    week: 30.5,
    month: 40.5,
    quarter: 55.5, 
    year: 75.5
  };
  
  // Get normalized value (0-1) based on slider position
  const normValue = sliderValue / 10;
  
  // Apply scaling to ring radii based on time scale
  const scalingFactor = getPositionScalingFactor(sliderValue);
  
  // Determine which rings to show based on the current time scale
  // We'll show only 3 rings at most - current, next, and previous time periods
  const result: { radius: number; opacity: number; label: string }[] = [];
  
  // Show different rings based on where we are in the time scale
  if (normValue < 0.2) {
    // 1m - 1h range: show minute and hour rings
    result.push({ 
      radius: baseRadii.minute / scalingFactor, 
      opacity: 0.8, 
      label: '1m'
    });
    result.push({ 
      radius: baseRadii.hour / scalingFactor, 
      opacity: 0.4, 
      label: '1h'
    });
  } 
  else if (normValue < 0.4) {
    // 1h - 1d range: show hour and day rings
    result.push({ 
      radius: baseRadii.hour / scalingFactor, 
      opacity: 0.8, 
      label: '1h'
    });
    result.push({ 
      radius: baseRadii.day / scalingFactor, 
      opacity: 0.4, 
      label: '1d'
    });
  }
  else if (normValue < 0.6) {
    // 1d - 1w range: show day and week rings
    result.push({ 
      radius: baseRadii.day / scalingFactor, 
      opacity: 0.8, 
      label: '1d'
    });
    result.push({ 
      radius: baseRadii.week / scalingFactor, 
      opacity: 0.4, 
      label: '1w'
    });
  }
  else if (normValue < 0.75) {
    // 1w - 1m range: show week and month rings
    result.push({ 
      radius: baseRadii.week / scalingFactor, 
      opacity: 0.8, 
      label: '1w'
    });
    result.push({ 
      radius: baseRadii.month / scalingFactor, 
      opacity: 0.4, 
      label: '1m'
    });
  }
  else if (normValue < 0.85) {
    // 1m - 1q range: show month and quarter rings
    result.push({ 
      radius: baseRadii.month / scalingFactor, 
      opacity: 0.8, 
      label: '1m'
    });
    result.push({ 
      radius: baseRadii.quarter / scalingFactor, 
      opacity: 0.4, 
      label: '1q'
    });
  }
  else {
    // 1q - 1y range: show quarter and year rings
    result.push({ 
      radius: baseRadii.quarter / scalingFactor, 
      opacity: 0.8, 
      label: '1q'
    });
    result.push({ 
      radius: baseRadii.year / scalingFactor, 
      opacity: 0.4, 
      label: '1y'
    });
  }
  
  return result;
}
