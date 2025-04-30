import { v4 as uuidv4 } from 'uuid';
import type { Task } from '../types';

/**
 * Sample task data for testing that spans the entire year
 */
export const generateSampleTasks = (): Task[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Generate reference dates
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  // Create array to hold all tasks
  const tasks: Task[] = [];
  
  // Effect types for variety
  const effectTypes = ["glow", "neon", "pulse", "flicker", "static", "hologram", "glitch", "wave"];
  
  // Colors for variety
  const colors = [
    "#FF5252", // Red
    "#00F5FF", // Cyan
    "#7B68EE", // Purple
    "#FFA500", // Orange
    "#98FB98", // Green
    "#FF00FF", // Magenta
    "#FFFF00", // Yellow
    "#1E90FF", // Blue
    "#FF69B4", // Pink
    "#32CD32", // Lime
    "#8A2BE2", // Violet
    "#00FFFF", // Aqua
    "#FF4500", // OrangeRed
    "#20B2AA", // Light Sea Green
    "#9370DB"  // Medium Purple
  ];
  
  // Tags for variety
  const allTags = [
    ["bug", "UI", "navigation"],
    ["deployment", "UI", "components"],
    ["meeting", "team"],
    ["security", "refactoring", "auth"],
    ["maintenance", "dependencies"],
    ["feature", "UX", "design"],
    ["infrastructure", "DevOps", "CI/CD"],
    ["testing", "QA", "automation"],
    ["optimization", "performance"],
    ["research", "exploration"],
    ["integration", "API", "third-party"],
    ["documentation", "wiki"],
    ["planning", "roadmap", "strategy"],
    ["database", "migration", "schema"],
    ["review", "code", "PR"],
    ["analytics", "metrics", "reporting"],
    ["bug-fix", "hotfix", "critical"],
    ["release", "version", "milestone"],
    ["configuration", "settings"],
    ["client", "customer", "support"]
  ];
  
  // Task title templates
  const taskTitles = [
    "Fix {component} glitches",
    "Deploy {component} to production",
    "{type} sync meeting",
    "Refactor {component} service",
    "Update {component} dependencies",
    "Design new {component} interface",
    "Implement {component} feature",
    "Set up {component} monitoring",
    "Optimize {component} performance",
    "Research {component} solutions",
    "Integrate with {component} API",
    "Write {component} documentation",
    "Plan Q{quarter} {component} roadmap",
    "Migrate {component} database",
    "Review {component} pull requests",
    "Analyze {component} metrics",
    "Fix critical {component} bug",
    "Prepare {component} v{version} release",
    "Configure {component} settings",
    "Respond to {component} support tickets",
    "Upgrade {component} framework",
    "Create {component} presentation",
    "Test {component} edge cases",
    "Debug {component} in production",
    "Audit {component} security",
    "Improve {component} accessibility",
    "Deploy {component} hotfix",
    "Schedule {component} maintenance",
    "Develop {component} prototype",
    "Finalize {component} specifications"
  ];
  
  // Components to use in task titles
  const components = [
    "authentication", "navigation", "dashboard", "payment", "analytics", 
    "notification", "user profile", "search", "cyberpunk UI", "visualization",
    "admin panel", "reporting", "feedback", "social integration", "API",
    "database", "cache", "task management", "calendar", "chat", 
    "file upload", "export", "import", "settings", "theming",
    "animation", "filtering", "sorting", "pagination", "encryption"
  ];
  
  // Types for meetings
  const meetingTypes = ["Team", "Project", "Client", "Stakeholder", "Department", "All-hands", "Sprint", "Planning", "Retrospective", "Design"];
  
  // Versions
  const versions = ["1.0", "1.1", "2.0", "2.1", "3.0", "0.5", "0.9", "4.2", "5.0", "2.5"];
  
  // Helper function to create a task with a specific due date
  const createTaskForDate = (dueDate: Date, index: number): Task => {
    // Create a realistic creation date (1-14 days before due date)
    const createdAt = new Date(dueDate);
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 14) - 1);
    
    // Determine if task is completed (past tasks have 70% chance of being completed)
    const isPastTask = dueDate < now;
    const completed = isPastTask ? Math.random() < 0.7 : false;
    
    // Set completedAt for completed tasks
    const completedAt = completed ? new Date(dueDate) : null;
    if (completedAt) {
      completedAt.setHours(
        Math.floor(Math.random() * 10) + 9, // 9 AM to 7 PM
        Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 60)
      );
    }
    
    // Set a realistic updatedAt (either completion time or sometime between creation and now)
    const updatedAt = completedAt || new Date(Math.max(
      createdAt.getTime(),
      createdAt.getTime() + Math.random() * (now.getTime() - createdAt.getTime())
    ));
    
    // Pick task properties
    const priority = ["low", "low", "medium", "high", "critical"][Math.floor(Math.random() * 4)] as "low" | "low" | "medium" | "high" | "critical";
    const effectType = effectTypes[Math.floor(Math.random() * effectTypes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const tags = allTags[Math.floor(Math.random() * allTags.length)];
    
    // Generate a realistic title
    let title = taskTitles[index % taskTitles.length];
    const component = components[Math.floor(Math.random() * components.length)];
    const meetingType = meetingTypes[Math.floor(Math.random() * meetingTypes.length)];
    const version = versions[Math.floor(Math.random() * versions.length)];
    const quarter = Math.floor(dueDate.getMonth() / 3) + 1;
    
    // Replace template placeholders
    title = title.replace("{component}", component)
                 .replace("{type}", meetingType)
                 .replace("{version}", version)
                 .replace("{quarter}", quarter.toString());
    
    // Generate subtasks (between 1 and 5)
    const numSubtasks = Math.floor(Math.random() * 5) + 1;
    const subtasks = [];
    
    const subtaskTitles = [
      "Research options",
      "Create draft",
      "Review with team",
      "Implement solution",
      "Test implementation",
      "Update documentation",
      "Deploy changes",
      "Get feedback",
      "Fix issues",
      "Finalize"
    ];
    
    for (let i = 0; i < numSubtasks; i++) {
      const subtaskTitle = subtaskTitles[i % subtaskTitles.length];
      // Completed tasks have all subtasks completed, incomplete tasks have some subtasks completed
      const subtaskCompleted = completed || (Math.random() < 0.4);
      
      subtasks.push({
        id: uuidv4(),
        title: subtaskTitle,
        completed: subtaskCompleted
      });
    }
    
    // Determine if task should be recurring
    const isRecurring = Math.random() < 0.2; // 20% of tasks are recurring
    
    // Create recurring pattern for recurring tasks
    let recurringPattern = undefined;
    
    if (isRecurring) {
      const frequency = ['daily', 'weekly', 'monthly', 'yearly'][Math.floor(Math.random() * 4)] as 'daily' | 'weekly' | 'monthly' | 'yearly';
      const interval = Math.floor(Math.random() * 3) + 1;
      const daysOfWeek = frequency === 'weekly' ? [Math.floor(Math.random() * 7)] : undefined;
      
      recurringPattern = {
        frequency,
        interval,
        daysOfWeek
      };
    }
    
    // Create task history
    const history = [
      {
        timestamp: createdAt,
        action: "created"
      }
    ];
    
    // Add completion action if completed
    if (completed && completedAt) {
      history.push({
        timestamp: completedAt,
        action: "completed"
      });
    }
    
    // Add update action if updated
    if (updatedAt > createdAt && (!completed || updatedAt < completedAt!)) {
      history.push({
        timestamp: updatedAt,
        action: "updated"
      });
    }
    
    // Create task notes
    const noteTemplates = [
      `This ${component} task requires close attention to detail.`,
      `Make sure to coordinate with the team on this ${component} work.`,
      `The ${component} implementation should follow our cyberpunk design system.`,
      `Check previous ${component} implementation for reference.`,
      `This is a critical ${component} task that impacts multiple systems.`,
      `The ${component} should be optimized for performance.`,
      `Remember to update the documentation after completing this ${component} task.`,
      `This ${component} task was requested by leadership.`,
      `The ${component} feature needs to be backward compatible.`,
      `Consider accessibility requirements for this ${component}.`
    ];
    
    const notes = noteTemplates[Math.floor(Math.random() * noteTemplates.length)];
    
    // Some tasks have links
    const hasLinks = Math.random() < 0.3;
    const links = hasLinks ? [
      `https://github.com/issue/${Math.floor(Math.random() * 9000) + 1000}`,
      `https://docs.example.com/${component.replace(/\s+/g, '-').toLowerCase()}`
    ] : [];
    
    // Create the task
    return {
      id: uuidv4(),
      title,
      description: `${title} - This task involves working on the ${component} to ensure it meets our quality standards and cyberpunk aesthetic.`,
      dueDate,
      createdAt,
      updatedAt,
      completedAt,
      completed,
      priority,
      tags,
      color,
      effectType,
      isRecurring,
      recurringPattern,
      notifications: {
        enabled: Math.random() < 0.8, // 80% have notifications enabled
        reminderTime: [15, 30, 60, 120, 1440][Math.floor(Math.random() * 5)] // 15min, 30min, 1hr, 2hrs, or 1 day
      },
      subtasks,
      notes,
      links,
      history
    };
  };
  
  // Generate tasks for the entire year
  const startOfYear = new Date(currentYear, 0, 1); // January 1st
  const endOfYear = new Date(currentYear, 11, 31); // December 31st
  
  // Create at least 5 tasks per month = 60 tasks
  for (let month = 0; month < 12; month++) {
    for (let i = 0; i < 10; i++) {
      // Create a date within the current month
      const dueDate = new Date(currentYear, month, Math.floor(Math.random() * 28) + 1);
      
      // Adjust time to be during working hours (9am - 6pm)
      dueDate.setHours(
        Math.floor(Math.random() * 10) + 9, // 9 AM to 7 PM
        Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 60)
      );
      
      // Create and add task
      const task = createTaskForDate(dueDate, tasks.length);
      tasks.push(task);
    }
  }
  
  // Add some recurring meetings throughout the year
  const meetingDays = [1, 3, 5]; // Monday, Wednesday, Friday
  const meetingCount = 5; // 5 different recurring meetings
  
  for (let i = 0; i < meetingCount; i++) {
    const meetingType = meetingTypes[Math.floor(Math.random() * meetingTypes.length)];
    const weekDay = meetingDays[Math.floor(Math.random() * meetingDays.length)];
    
    // Create a meeting date (always in the future from now)
    const meetingDate = new Date(now);
    meetingDate.setDate(meetingDate.getDate() + (weekDay + 7 - meetingDate.getDay()) % 7);
    meetingDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0); // Between 9am and 5pm
    
    tasks.push({
      id: uuidv4(),
      title: `${meetingType} sync meeting`,
      description: `Weekly ${meetingType.toLowerCase()} sync to discuss progress, blockers, and next steps`,
      dueDate: meetingDate,
      createdAt: lastWeek,
      updatedAt: lastWeek,
      completedAt: null,
      completed: false,
      priority: "medium",
      tags: ["meeting", meetingType.toLowerCase()],
      color: "#7B68EE",
      effectType: "pulse",
      isRecurring: true,
      recurringPattern: {
        frequency: "weekly",
        interval: 1,
        daysOfWeek: [weekDay]
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
          title: "Update status reports",
          completed: false
        }
      ],
      notes: `This ${meetingType.toLowerCase()} meeting occurs every week. Be prepared with your status updates.`,
      links: ["https://meet.google.com/abc-defg-hij"],
      history: [
        {
          timestamp: lastWeek,
          action: "created"
        }
      ]
    });
  }
  
  // Add some milestone tasks for each quarter
  for (let quarter = 1; quarter <= 4; quarter++) {
    const month = (quarter - 1) * 3 + 1; // Second month of the quarter (Feb, May, Aug, Nov)
    const milestoneDate = new Date(currentYear, month, 15); // Middle of the month
    
    tasks.push({
      id: uuidv4(),
      title: `Q${quarter} Planning and Review`,
      description: `Quarter ${quarter} planning, goal setting, and previous quarter review`,
      dueDate: milestoneDate,
      createdAt: new Date(currentYear, month - 1, 15), // Create a month before
      updatedAt: new Date(currentYear, month - 1, 15),
      completedAt: quarter < Math.ceil((now.getMonth() + 1) / 3) ? milestoneDate : null, // Complete if quarter is in the past
      completed: quarter < Math.ceil((now.getMonth() + 1) / 3),
      priority: "high",
      tags: ["planning", "roadmap", "quarterly"],
      color: "#FFA500",
      effectType: "hologram",
      isRecurring: true,
      recurringPattern: {
        frequency: "yearly",
        interval: 1
      },
      notifications: {
        enabled: true,
        reminderTime: 1440 // 1 day reminder
      },
      subtasks: [
        {
          id: uuidv4(),
          title: "Prepare quarterly metrics",
          completed: quarter < Math.ceil((now.getMonth() + 1) / 3)
        },
        {
          id: uuidv4(),
          title: "Review goals from previous quarter",
          completed: quarter < Math.ceil((now.getMonth() + 1) / 3)
        },
        {
          id: uuidv4(),
          title: "Draft OKRs for next quarter",
          completed: quarter < Math.ceil((now.getMonth() + 1) / 3)
        },
        {
          id: uuidv4(),
          title: "Prepare presentation",
          completed: quarter < Math.ceil((now.getMonth() + 1) / 3)
        }
      ],
      notes: `This is our quarterly planning session where we review progress and set goals for Q${quarter}.`,
      links: ["https://company-wiki.example.com/quarterly-planning"],
      history: [
        {
          timestamp: new Date(currentYear, month - 1, 15),
          action: "created"
        }
      ]
    });
  }
  
  // Add some product release milestones
  const releaseVersions = ["1.0", "1.5", "2.0", "2.5"];
  const releaseMonths = [2, 5, 8, 11]; // March, June, September, December
  
  for (let i = 0; i < releaseVersions.length; i++) {
    const releaseDate = new Date(currentYear, releaseMonths[i], 20);
    const isPastRelease = releaseDate < now;
    
    tasks.push({
      id: uuidv4(),
      title: `Release version ${releaseVersions[i]}`,
      description: `Prepare and deploy product version ${releaseVersions[i]} to production`,
      dueDate: releaseDate,
      createdAt: new Date(currentYear, releaseMonths[i] - 1, 20),
      updatedAt: isPastRelease ? releaseDate : new Date(currentYear, releaseMonths[i] - 1, 20),
      completedAt: isPastRelease ? releaseDate : null,
      completed: isPastRelease,
      priority: "critical",
      tags: ["release", "deployment", "milestone"],
      color: "#FF4500",
      effectType: "glitch",
      isRecurring: false,
      notifications: {
        enabled: true,
        reminderTime: 60 * 24 // 1 day reminder
      },
      subtasks: [
        {
          id: uuidv4(),
          title: "Freeze code",
          completed: isPastRelease
        },
        {
          id: uuidv4(),
          title: "Run regression tests",
          completed: isPastRelease
        },
        {
          id: uuidv4(),
          title: "Prepare release notes",
          completed: isPastRelease
        },
        {
          id: uuidv4(),
          title: "Deploy to staging",
          completed: isPastRelease
        },
        {
          id: uuidv4(),
          title: "Final approval",
          completed: isPastRelease
        },
        {
          id: uuidv4(),
          title: "Deploy to production",
          completed: isPastRelease
        }
      ],
      notes: `This is a major release with new features and improvements. All hands on deck during deployment.`,
      links: [
        `https://github.com/releases/v${releaseVersions[i]}`,
        `https://jira.example.com/release-${releaseVersions[i]}`
      ],
      history: [
        {
          timestamp: new Date(currentYear, releaseMonths[i] - 1, 20),
          action: "created"
        }
      ]
    });
  }
  
  return tasks;
};

/**
 * Utility to add sample tasks to the database for testing
 */
export const loadSampleTasks = async (taskRepository: any): Promise<void> => {
  const sampleTasks = generateSampleTasks();
  await taskRepository.bulkAdd(sampleTasks);
  console.log(`Loaded ${sampleTasks.length} sample tasks`);
};
