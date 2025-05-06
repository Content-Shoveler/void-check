import { v4 as uuidv4 } from 'uuid';
import type { Task, DisplayProperties } from '../types';
import type { 
  TaskSource, 
  TaskStatus, 
  RecurrencePattern, 
  Reminder,
  Attendee
} from '../types/integration';

/**
 * Creates a new task with the modern data structure
 */
export function createTask(taskData: Partial<Task>): Task {
  const now = new Date();
  
  // Initialize with defaults for required fields
  const task: Task = {
    id: taskData.id || uuidv4(),
    title: taskData.title || 'New Task',
    description: taskData.description || '',
    
    // Core timing fields
    endTime: taskData.endTime || new Date(now.getTime() + 24 * 60 * 60 * 1000), // Default: tomorrow
    startTime: taskData.startTime || undefined,
    isAllDay: taskData.isAllDay !== undefined ? taskData.isAllDay : false,
    
    // Status information
    status: {
      completed: taskData.status?.completed || false,
      completedAt: taskData.status?.completedAt,
      calendarStatus: taskData.status?.calendarStatus || 'confirmed'
    },
    priority: taskData.priority || 'medium',
    
    // Source information
    source: taskData.source || 'internal', // Default to internal source
    sourceId: taskData.sourceId,
    lastSynced: taskData.lastSynced,
    
    // Categorization
    tags: taskData.tags || [],
    
    // Recurrence
    isRecurring: taskData.isRecurring !== undefined ? taskData.isRecurring : false,
    recurringPattern: taskData.recurringPattern,
    
    // Reminders
    reminders: taskData.reminders || [
      {
        type: 'notification',
        minutes: 30,
        enabled: true,
        method: 'popup'
      }
    ],
    
    // VoidCheck specific features
    subtasks: taskData.subtasks || [],
    notes: taskData.notes || '',
    links: taskData.links || [],
    
    // Visual properties
    display: {
      color: taskData.display?.color || '#00F5FF', 
      effectType: taskData.display?.effectType || 'glow',
      icon: taskData.display?.icon
    },
    
    // System fields
    createdAt: taskData.createdAt || now,
    updatedAt: taskData.updatedAt || now,
    
    // History
    history: taskData.history || [
      {
        timestamp: now,
        action: 'created'
      }
    ],
    
    // Optional calendar fields
    location: taskData.location,
    attendees: taskData.attendees,
    sourceMetadata: taskData.sourceMetadata || {},
  };
  
  return task;
}

/**
 * Updates a task with partial data
 */
export function updateTask(task: Task, updates: Partial<Task>): Task {
  // Start with a clone of the original task
  const updatedTask: Task = { ...task };
  
  // Apply all valid direct updates
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      (updatedTask as any)[key] = value;
    }
  });
  
  // Update nested objects properly
  if (updates.status) {
    updatedTask.status = {
      ...updatedTask.status,
      ...updates.status
    };
  }
  
  if (updates.display) {
    updatedTask.display = {
      ...updatedTask.display,
      ...updates.display
    };
  }
  
  // Always update the updatedAt timestamp
  updatedTask.updatedAt = new Date();
  
  // Add to history
  updatedTask.history = [
    ...updatedTask.history,
    {
      timestamp: new Date(),
      action: 'updated',
      previousState: task
    }
  ];
  
  return updatedTask;
}

/**
 * Checks if a task is overdue
 */
export function isOverdue(task: Task): boolean {
  const now = new Date();
  return !task.status.completed && task.endTime < now;
}

/**
 * Checks if a task is due today
 */
export function isDueToday(task: Task): boolean {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return !task.status.completed && task.endTime >= today && task.endTime < tomorrow;
}
