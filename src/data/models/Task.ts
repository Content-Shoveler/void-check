/**
 * Represents an external link associated with a task
 */
export interface ExternalLink {
  title: string;
  url: string;
}

/**
 * Priority levels for tasks
 */
export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}

/**
 * Represents a task in the system
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  externalLinks: ExternalLink[];
  completed: boolean;
  priority: TaskPriority;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Factory function to create a new task with default values
 */
export function createTask(partialTask: Partial<Task> = {}): Task {
  const now = new Date();
  const id = `task_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    title: '',
    description: '',
    dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Default: tomorrow
    externalLinks: [],
    completed: false,
    priority: TaskPriority.MEDIUM,
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...partialTask
  };
}

/**
 * Get the visual size of a task based on its priority
 * Used for scaling the circle representation
 */
export function getTaskSize(priority: TaskPriority): number {
  switch (priority) {
    case TaskPriority.LOW:
      return 1;
    case TaskPriority.MEDIUM:
      return 1.5;
    case TaskPriority.HIGH:
      return 2;
    case TaskPriority.CRITICAL:
      return 2.5;
    default:
      return 1;
  }
}

/**
 * Calculates the remaining time for a task in milliseconds
 */
export function getRemainingTime(task: Task): number {
  const now = new Date();
  return task.dueDate.getTime() - now.getTime();
}

/**
 * Checks if a task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  return getRemainingTime(task) < 0 && !task.completed;
}
