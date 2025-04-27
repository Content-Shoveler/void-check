import { v4 as uuidv4 } from 'uuid';
import type { Task } from '../types';

/**
 * Sample task data for testing
 */
export const generateSampleTasks = (): Task[] => {
  const now = new Date();
  
  // Generate dates
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  return [
    // Overdue task
    {
      id: uuidv4(),
      title: "Fix navigation glitches",
      description: "Debug and resolve the navigation menu flickering issues in dark mode",
      dueDate: yesterday,
      createdAt: lastWeek,
      updatedAt: lastWeek,
      completedAt: null,
      completed: false,
      priority: "high",
      tags: ["bug", "UI", "navigation"],
      color: "#FF5252",
      effectType: "glow",
      isRecurring: false,
      notifications: {
        enabled: true,
        reminderTime: 30
      },
      subtasks: [
        {
          id: uuidv4(),
          title: "Analyze flickering cause",
          completed: true
        },
        {
          id: uuidv4(),
          title: "Fix z-index issues",
          completed: false
        },
        {
          id: uuidv4(),
          title: "Test fix in different resolutions",
          completed: false
        }
      ],
      notes: "The issue seems to be related to z-index conflicts when the dark mode class is applied",
      links: ["https://github.com/issue/1234"],
      history: [
        {
          timestamp: lastWeek,
          action: "created"
        }
      ]
    },
    
    // Due today
    {
      id: uuidv4(),
      title: "Deploy cyberpunk components",
      description: "Deploy the new cyberpunk UI component library to production",
      dueDate: now,
      createdAt: yesterday,
      updatedAt: yesterday,
      completedAt: null,
      completed: false,
      priority: "critical",
      tags: ["deployment", "UI", "components"],
      color: "#00F5FF",
      effectType: "neon",
      isRecurring: false,
      notifications: {
        enabled: true,
        reminderTime: 60
      },
      subtasks: [
        {
          id: uuidv4(),
          title: "Run final tests",
          completed: true
        },
        {
          id: uuidv4(),
          title: "Update documentation",
          completed: true
        },
        {
          id: uuidv4(),
          title: "Deploy to CDN",
          completed: false
        },
        {
          id: uuidv4(),
          title: "Verify deployment",
          completed: false
        }
      ],
      notes: "Ensure we have a rollback plan in case of any issues",
      links: [],
      history: [
        {
          timestamp: yesterday,
          action: "created"
        }
      ]
    },
    
    // Due tomorrow
    {
      id: uuidv4(),
      title: "Team sync meeting",
      description: "Weekly team sync to discuss project progress and blockers",
      dueDate: tomorrow,
      createdAt: lastWeek,
      updatedAt: lastWeek,
      completedAt: null,
      completed: false,
      priority: "medium",
      tags: ["meeting", "team"],
      color: "#7B68EE",
      effectType: "pulse",
      isRecurring: true,
      recurringPattern: {
        frequency: "weekly",
        interval: 1,
        daysOfWeek: [1]  // Monday
      },
      notifications: {
        enabled: true,
        reminderTime: 15
      },
      subtasks: [
        {
          id: uuidv4(),
          title: "Prepare agenda",
          completed: false
        },
        {
          id: uuidv4(),
          title: "Update task board",
          completed: false
        }
      ],
      notes: "Don't forget to discuss the new feature prioritization",
      links: ["https://meet.google.com/abc-defg-hij"],
      history: [
        {
          timestamp: lastWeek,
          action: "created"
        }
      ]
    },
    
    // Due next week
    {
      id: uuidv4(),
      title: "Refactor authentication service",
      description: "Improve the authentication service to support multi-factor authentication",
      dueDate: nextWeek,
      createdAt: yesterday,
      updatedAt: yesterday,
      completedAt: null,
      completed: false,
      priority: "high",
      tags: ["security", "refactoring", "auth"],
      color: "#FFA500",
      effectType: "flicker",
      isRecurring: false,
      notifications: {
        enabled: true,
        reminderTime: 120
      },
      subtasks: [
        {
          id: uuidv4(),
          title: "Research MFA options",
          completed: false
        },
        {
          id: uuidv4(),
          title: "Design new authentication flow",
          completed: false
        },
        {
          id: uuidv4(),
          title: "Update API endpoints",
          completed: false
        },
        {
          id: uuidv4(),
          title: "Write integration tests",
          completed: false
        }
      ],
      notes: "Consider using WebAuthn for the implementation",
      links: ["https://webauthn.guide/"],
      history: [
        {
          timestamp: yesterday,
          action: "created"
        }
      ]
    },
    
    // Completed task
    {
      id: uuidv4(),
      title: "Update dependencies",
      description: "Update all project dependencies to their latest versions",
      dueDate: yesterday,
      createdAt: lastWeek,
      updatedAt: yesterday,
      completedAt: yesterday,
      completed: true,
      priority: "low",
      tags: ["maintenance", "dependencies"],
      color: "#98FB98",
      effectType: "static",
      isRecurring: true,
      recurringPattern: {
        frequency: "monthly",
        interval: 1
      },
      notifications: {
        enabled: false,
        reminderTime: 0
      },
      subtasks: [
        {
          id: uuidv4(),
          title: "Audit dependencies",
          completed: true
        },
        {
          id: uuidv4(),
          title: "Update package.json",
          completed: true
        },
        {
          id: uuidv4(),
          title: "Run tests after update",
          completed: true
        }
      ],
      notes: "All tests passed with the new dependencies",
      links: [],
      history: [
        {
          timestamp: lastWeek,
          action: "created"
        },
        {
          timestamp: yesterday,
          action: "completed"
        }
      ]
    }
  ];
};

/**
 * Utility to add sample tasks to the database for testing
 */
export const loadSampleTasks = async (taskRepository: any): Promise<void> => {
  const sampleTasks = generateSampleTasks();
  await taskRepository.bulkAdd(sampleTasks);
  console.log(`Loaded ${sampleTasks.length} sample tasks`);
};
