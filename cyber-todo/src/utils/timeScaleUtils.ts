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

/**
 * Calculate a 3D position for a task based on its due date
 * and the current time scale factor
 * 
 * @param task The task to position
 * @param timeScale Scale factor (0-10) controlling how spread out tasks are in time
 * @returns Position in 3D space
 */
export function calculateTaskPosition(task: Task, timeScale: number): TaskPosition {
  // Current time as reference point
  const now = new Date();
  
  // Calculate time difference in milliseconds
  const dueDate = new Date(task.dueDate);
  const timeDifference = dueDate.getTime() - now.getTime();
  
  // Normalize the time scale (0-10) to a reasonable spread factor
  // Higher timeScale = more spread out tasks
  const spreadFactor = 0.5 + (timeScale * 0.5);
  
  // Base scaling to convert milliseconds to spatial units
  // One day = approximately 10 units at default scale
  const dayInMs = 24 * 60 * 60 * 1000;
  const baseScale = 10 / dayInMs;
  
  // Calculate distance from center based on time difference
  // We use the absolute time difference and add a minimum distance
  const distance = 5 + (Math.abs(timeDifference) * baseScale * spreadFactor);
  
  // Calculate angle based on due date and task priority
  // This creates a spiral pattern with tasks grouped by general time frame
  const dayAngle = (dueDate.getDay() / 7) * Math.PI * 2; // 0-2π based on day of week
  const timeAngle = (dueDate.getHours() / 24) * Math.PI / 2; // 0-π/2 based on time of day
  
  // Generate a semi-random angle offset based on task ID for uniqueness
  const idHash = task.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const randomOffset = (idHash % 100) / 100 * Math.PI / 4; // 0-π/4 random offset
  
  // Combine angles
  let angle = dayAngle + timeAngle + randomOffset;
  
  // Place future tasks in front (positive Z) and past/overdue tasks behind (negative Z)
  let zDirection = timeDifference > 0 ? 1 : -1;
  
  // Priority affects Y position (higher priority = higher up)
  const priorityMap: Record<string, number> = {
    'low': 0,
    'medium': 3,
    'high': 6,
    'critical': 10
  };
  
  const priorityOffset = priorityMap[task.priority] || 0;
  
  // For completed tasks, move them lower and further away
  let yOffset = task.completed ? -5 : priorityOffset;
  let distanceMultiplier = task.completed ? 1.5 : 1;
  
  // Calculate final position
  const x = Math.cos(angle) * distance * distanceMultiplier;
  const z = Math.sin(angle) * distance * distanceMultiplier * zDirection;
  const y = yOffset;
  
  return {
    x,
    y,
    z,
    distance,
    angle
  };
}

/**
 * Avoid clustering of tasks by adjusting positions when tasks are too close
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
      
      // Calculate distance between tasks
      const dx = pos1.x - pos2.x;
      const dy = pos1.y - pos2.y;
      const dz = pos1.z - pos2.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      // If too close, adjust positions by pushing them apart
      if (distance < minDistance) {
        // Vector from pos2 to pos1
        const vx = dx / distance;
        const vy = dy / distance;
        const vz = dz / distance;
        
        // Calculate adjustment amount (half the remaining distance)
        const adjustment = (minDistance - distance) / 2;
        
        // Adjust positions
        const adjustedPos1 = adjustedPositions.get(id1)!;
        const adjustedPos2 = adjustedPositions.get(id2)!;
        
        adjustedPos1.x += vx * adjustment;
        adjustedPos1.y += vy * adjustment;
        adjustedPos1.z += vz * adjustment;
        
        adjustedPos2.x -= vx * adjustment;
        adjustedPos2.y -= vy * adjustment;
        adjustedPos2.z -= vz * adjustment;
        
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
