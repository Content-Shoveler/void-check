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
 * Creates a new task or converts legacy task data to the new format
 */
export function createTask(taskData: Partial<Task>): Task {
  const now = new Date();
  
  // Initialize with defaults for required fields
  const task: Task = {
    id: taskData.id || uuidv4(),
    title: taskData.title || 'New Task',
    description: taskData.description || '',
    
    // Handle transitioning from dueDate to endTime
    endTime: taskData.endTime || taskData.dueDate || new Date(now.getTime() + 24 * 60 * 60 * 1000), // Default: tomorrow
    startTime: taskData.startTime || undefined,
    isAllDay: taskData.isAllDay !== undefined ? taskData.isAllDay : false,
    
    // Status information
    status: createTaskStatus(taskData),
    priority: taskData.priority || 'medium',
    
    // Source information
    source: taskData.source || 'internal', // Default to internal source
    sourceId: taskData.sourceId,
    lastSynced: taskData.lastSynced,
    
    // Categorization
    tags: taskData.tags || [],
    
    // Recurrence
    isRecurring: taskData.isRecurring !== undefined ? taskData.isRecurring : false,
    recurringPattern: createRecurringPattern(taskData),
    
    // Reminders
    reminders: createReminders(taskData),
    
    // VoidCheck specific features
    subtasks: taskData.subtasks || [],
    notes: taskData.notes || '',
    links: taskData.links || [],
    
    // Visual properties
    display: createDisplayProperties(taskData),
    
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
  
  // Add compatibility fields
  task.dueDate = task.endTime;
  task.completed = task.status.completed;
  task.completedAt = task.status.completedAt || null;
  task.color = task.display.color;
  task.effectType = task.display.effectType;
  
  if (task.reminders && task.reminders.length > 0) {
    task.notifications = {
      enabled: task.reminders.some(r => r.enabled),
      reminderTime: task.reminders[0].minutes
    };
  } else {
    task.notifications = {
      enabled: false,
      reminderTime: 30
    };
  }
  
  return task;
}

/**
 * Creates proper TaskStatus object from task data
 */
function createTaskStatus(taskData: Partial<Task>): TaskStatus {
  // Handle completed directly or from status object
  const completed = 
    taskData.status?.completed !== undefined ? taskData.status.completed : 
    taskData.completed !== undefined ? taskData.completed : 
    false;
  
  // Handle completedAt directly or from status object  
  const completedAt = 
    taskData.status?.completedAt ? taskData.status.completedAt : 
    taskData.completedAt || 
    null;
    
  return {
    completed,
    completedAt: completedAt || undefined,
    calendarStatus: taskData.status?.calendarStatus || 'confirmed'
  };
}

/**
 * Creates proper DisplayProperties object from task data
 */
function createDisplayProperties(taskData: Partial<Task>): DisplayProperties {
  return {
    color: 
      taskData.display?.color || 
      taskData.color || 
      '#00F5FF', // Default cyan
    effectType: 
      taskData.display?.effectType || 
      taskData.effectType || 
      'glow',
    icon: taskData.display?.icon
  };
}

/**
 * Creates proper RecurringPattern from task data
 */
function createRecurringPattern(taskData: Partial<Task>): RecurrencePattern | undefined {
  if (!taskData.isRecurring) {
    return undefined;
  }
  
  // Handle old format of recurringPattern
  const oldPattern = (taskData as any).recurringPattern;
  const newPattern = taskData.recurringPattern;
  
  if (newPattern) {
    return newPattern;
  } else if (oldPattern) {
    return {
      frequency: oldPattern.frequency || 'daily',
      interval: oldPattern.interval || 1,
      endDate: oldPattern.endDate,
      daysOfWeek: oldPattern.daysOfWeek
    };
  }
  
  return undefined;
}

/**
 * Creates proper Reminders array from task data
 */
function createReminders(taskData: Partial<Task>): Reminder[] {
  // If we already have a reminders array, use it
  if (taskData.reminders && taskData.reminders.length > 0) {
    return taskData.reminders;
  }
  
  // If we have old notifications format, convert it
  if (taskData.notifications) {
    return [
      {
        type: 'notification',
        minutes: taskData.notifications.reminderTime || 30,
        enabled: taskData.notifications.enabled || false,
        method: 'popup'
      }
    ];
  }
  
  // Default reminder
  return [
    {
      type: 'notification',
      minutes: 30,
      enabled: true,
      method: 'popup'
    }
  ];
}

/**
 * Updates a task with partial data, ensuring backward compatibility
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
  
  // Handle special compatibility properties
  if (updates.dueDate) {
    updatedTask.endTime = updates.dueDate;
  }
  
  if (updates.completed !== undefined) {
    updatedTask.status = {
      ...updatedTask.status,
      completed: updates.completed
    };
    
    // Also update completedAt if status changed
    if (updates.completed && !task.status.completed) {
      updatedTask.status.completedAt = new Date();
      updatedTask.completedAt = updatedTask.status.completedAt;
    } else if (!updates.completed && task.status.completed) {
      updatedTask.status.completedAt = undefined;
      updatedTask.completedAt = null;
    }
  }
  
  if (updates.completedAt !== undefined) {
    updatedTask.status = {
      ...updatedTask.status,
      completedAt: updates.completedAt || undefined
    };
  }
  
  if (updates.color) {
    updatedTask.display = {
      ...updatedTask.display,
      color: updates.color
    };
  }
  
  if (updates.effectType) {
    updatedTask.display = {
      ...updatedTask.display,
      effectType: updates.effectType
    };
  }
  
  if (updates.notifications) {
    // Convert from notifications to reminders
    updatedTask.reminders = [{
      type: 'notification',
      minutes: updates.notifications.reminderTime,
      enabled: updates.notifications.enabled,
      method: 'popup'
    }];
    
    // Keep backward compatibility
    updatedTask.notifications = updates.notifications;
  }
  
  // Ensure compatibility fields are updated
  updatedTask.dueDate = updatedTask.endTime;
  updatedTask.completed = updatedTask.status.completed;
  updatedTask.completedAt = updatedTask.status.completedAt || null;
  updatedTask.color = updatedTask.display.color;
  updatedTask.effectType = updatedTask.display.effectType;
  
  return updatedTask;
}

/**
 * Checks if a date is set in the past
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
  
  const dueDate = task.endTime;
  return !task.status.completed && dueDate >= today && dueDate < tomorrow;
}
