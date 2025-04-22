/**
 * Task model representing a user task in the VoidCheck application.
 * Tasks are visualized as circles on the timeline.
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  externalLinks: LinkItem[];
  completed: boolean;
  priority: number; // 1-5, where 5 is highest priority
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents an external link associated with a task
 */
export interface LinkItem {
  title: string;
  url: string;
}

/**
 * Create a new task with default values
 */
export function createNewTask(): Task {
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    dueDate: new Date(),
    externalLinks: [],
    completed: false,
    priority: 3,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Task priority levels
 */
export enum TaskPriority {
  VeryLow = 1,
  Low = 2,
  Medium = 3,
  High = 4,
  VeryHigh = 5
}
