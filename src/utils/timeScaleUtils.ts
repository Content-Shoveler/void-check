/**
 * Utilities for handling task positioning based on time scale
 */
import type { Task } from '../types';

// Position type for task entities in 3D space
export interface TaskPosition {
  x: number;
  y: number;
  z: number;
  distance?: number; // Distance from center
  angle?: number;    // Angle in radians
}

export type RingPostion = [number, number, number];

// Unified time configuration for both tasks and rings positioning
export interface TimeNotch {
  label: string;
  boundary: number;
  ms: number;
}

export interface TimeConfig {
  [key: string]: TimeNotch;
}

// Shared configuration for time notches
export const timeConfig: TimeConfig = {
  'hour': {
    label: 'hour',
    boundary: 5,
    ms: 60 * 60 * 1000
  },
  'day': {
    label: 'day',
    boundary: 15,
    ms: 24 * 60 * 60 * 1000
  },
  'week': {
    label: 'week',
    boundary: 30,
    ms: 7 * 24 * 60 * 60 * 1000
  },
  'month': {
    label: 'month',
    boundary: 60,
    ms: 30 * 24 * 60 * 60 * 1000
  },
  'quarter': {
    label: 'quarter',
    boundary: 110,
    ms: 3 * 30 * 24 * 60 * 60 * 1000
  },
  'year': {
    label: 'year',
    boundary: 200,
    ms: 365 * 24 * 60 * 60 * 1000
  },
};

// List of time periods in order for reference
export const timePeriodsInOrder = ['hour', 'day', 'week', 'month', 'quarter', 'year'];

/**
 * Calculate ring position and dimensions based on time period and scale
 * 
 * @param size Size or index of the ring
 * @param timeScale Scale factor controlling ring size
 * @param referenceTime Optional reference time (not used currently)
 * @returns Position parameters for the ring [innerRadius, outerRadius, segments]
 */
export function calculateRingPosition(size: number, timeScale: number, referenceTime?: Date): RingPostion {
  // Get appropriate time period based on size
  let timeNotch: TimeNotch | null = null;
  
  if (size <= 1) {
    timeNotch = timeConfig.hour;
  } else if (size <= 2) {
    timeNotch = timeConfig.day;
  } else if (size <= 3) {
    timeNotch = timeConfig.week;
  } else if (size <= 4) {
    timeNotch = timeConfig.month;
  } else if (size <= 5) {
    timeNotch = timeConfig.quarter;
  } else {
    timeNotch = timeConfig.year;
  }
  
  // Use the time notch values to determine ring size
  // This aligns with the task positioning logic
  const scaleFactor = timeScale + 0.5;
  const innerRadius = timeNotch.boundary * scaleFactor;
  const outerRadius = innerRadius + 0.5;
  
  return [
    innerRadius,
    outerRadius,
    64 // Segment count for smooth circles
  ];
}

/**
 * Calculate a 2D position for a task based on its due date
 * and the current time scale factor, creating a solar system-like visualization
 * 
 * @param task The task to position
 * @param timeScale Scale factor (0-10) controlling how spread out tasks are in time
 * @param referenceTime Optional reference time to use instead of current time
 * @returns Position in solar system space (primarily using X and Z axes)
 */
export function calculateTaskPosition(task: Task, timeScale: number, referenceTime?: Date): TaskPosition {
  const now = referenceTime || new Date();
  const dueDate = new Date(task.endTime);
  const timeDifference = dueDate.getTime() - now.getTime();

  let orbitRadius = 0;

  // Using the shared timeConfig to calculate the orbit radius
  for (let i = 0; i < timePeriodsInOrder.length; i++) {
    const key = timePeriodsInOrder[i];
    const notch = timeConfig[key];
    if (timeDifference < notch.ms) {
      // Get start value (previous boundary or 1 if this is the first period)
      const startValue = i === 0 ? 1 : timeConfig[timePeriodsInOrder[i - 1]].boundary;
      
      // Calculate orbital radius using the start value and current boundary
      orbitRadius = startValue + (notch.boundary - startValue) * (timeDifference / notch.ms);
      orbitRadius = orbitRadius * (timeScale + 0.5);
      break;
    } 
  }
  
  // Start with base angle based on whether task is in future or past
  let baseAngle = timeDifference > 0 ? 0 : Math.PI;
  
  // Add variation based on due date
  const dayFactor = (dueDate.getDay() / 7);
  const timeFactor = (dueDate.getHours() / 24);
  
  // Generate a unique angle offset based on task ID for uniqueness
  const idHash = task.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const idOffset = (idHash % 100) / 100;
  
  // Calculate final angle - spread tasks around their half of the circle
  let angle = baseAngle + (dayFactor + timeFactor + idOffset) * Math.PI;
  
  // Priority affects Y position slightly (to add minimal 3D effect)
  // This gives a subtle height difference but keeps the main positioning on the 2D plane
  const priorityMap: Record<string, number> = {
    'low': 0,
    'medium': 0.5,
    'high': 1,
    'critical': 1.5
  };
  
  const yOffset = priorityMap[task.priority] || 0;
  const y = yOffset;
  
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
        
        // Optional: Maintain orbital radiuses, just adjust angles
        // Uncomment these lines to keep tasks in perfect orbits
        /*
        adjustedPos1.x = Math.cos(adjustedPos1.angle) * radius1;
        adjustedPos1.z = Math.sin(adjustedPos1.angle) * radius1;
        
        adjustedPos2.x = Math.cos(adjustedPos2.angle) * radius2;
        adjustedPos2.z = Math.sin(adjustedPos2.angle) * radius2;
        */
        
        adjustedPositions.set(id1, adjustedPos1);
        adjustedPositions.set(id2, adjustedPos2);
      }
    }
  }
  
  return adjustedPositions;
}

/**
 * Calculate time scale in milliseconds from a 0-10 normalized value
 * 
 * @param normalizedValue Normalized time scale (0-10)
 * @returns Time scale in milliseconds
 */
export function calculateTimeScaleMs(normalizedValue: number): number {
  // Map 0-10 to different scales:
  // 0 = 1 hour
  // 5 = 1 day (default)
  // 10 = 1 month
  
  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;
  const monthMs = 30 * dayMs;
  
  if (normalizedValue <= 0) {
    return hourMs;
  } else if (normalizedValue >= 10) {
    return monthMs;
  }
  
  // Exponential scaling between hour, day, and month
  if (normalizedValue < 5) {
    // Scale between 1 hour and 1 day (0-5)
    const t = normalizedValue / 5;
    return hourMs + (dayMs - hourMs) * t;
  } else {
    // Scale between 1 day and 1 month (5-10)
    const t = (normalizedValue - 5) / 5;
    return dayMs + (monthMs - dayMs) * t;
  }
}
