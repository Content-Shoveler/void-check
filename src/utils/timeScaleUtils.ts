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
  
  // Normalize the time scale (0-10) to a reasonable spread factor
  // Higher timeScale = more spread out tasks
  const spreadFactor = 0.5 + (timeScale * 0.5);
  
  // Base scaling to convert milliseconds to spatial units
  // One day = approximately 10 units at default scale
  const dayInMs = 24 * 60 * 60 * 1000;
  const baseScale = 10 / dayInMs;
  
  // Calculate orbital radius based on time difference
  // This represents the "orbit" distance from the center
  const absTimeDifference = Math.abs(timeDifference);
  
  // Create discrete orbit rings - group similar time frames
  // Tasks due within similar timeframes will be in the same orbit
  const weekInMs = 7 * dayInMs;
  const monthInMs = 30 * dayInMs;
  
  let orbitRadius;
  if (absTimeDifference < dayInMs) {
    // Tasks due today - inner orbit
    orbitRadius = 8 + (absTimeDifference / dayInMs) * 5;
  } else if (absTimeDifference < weekInMs) {
    // Tasks due this week - middle orbit
    orbitRadius = 15 + ((absTimeDifference - dayInMs) / weekInMs) * 10;
  } else if (absTimeDifference < monthInMs) {
    // Tasks due this month - outer orbit
    orbitRadius = 25 + ((absTimeDifference - weekInMs) / monthInMs) * 15;
  } else {
    // Tasks due beyond a month - furthest orbit
    orbitRadius = 40 + (Math.log(absTimeDifference / monthInMs) * 10);
  }
  
  // Apply time scale factor
  orbitRadius = orbitRadius * (0.5 + (spreadFactor * 0.5));
  
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
