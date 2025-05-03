# Cyberpunk Space Todo/Timer App Scaffold

This document contains the original specification for the Cyberpunk Space Todo/Timer PWA application.

## Project Setup

1. Create a Vue 3 application with TypeScript using the Vite build system
2. Configure it as a PWA with full offline capabilities and home screen installation
3. Use Mantine UI as the primary component library (preferred over Material UI)
4. Create a custom component library named "CyberComponents" extending Mantine
5. Implement motion/animation using Vue Motion (a Vue 3 alternative to Framer Motion)
6. Integrate Rive for advanced interactive icons and micro-animations
7. Set up Vue-GL or Three.js for WebGL space effects in background visualizations
8. Configure both dark and light themes with seamless transitions between them

## Project Structure

The project follows the recommended Vue 3 structure:
- public/ (manifest.json, robots.txt, favicons)
- src/
  - assets/
    - fonts/ (cyberpunk-themed fonts)
    - images/ (space and cyberpunk imagery)
    - rive/ (Rive animation files)
    - models/ (3D models if needed)
  - components/
    - cyber/ (our custom cyberpunk-themed components)
      - buttons/
      - inputs/
      - cards/
      - navigation/
      - modals/
    - layout/ (layout components)
    - task/ (task-related components)
    - visualization/ (WebGL and animation components)
  - composables/ (Vue 3 composables for shared logic)
    - useTaskMotion.js (for task animations)
    - useTimeScale.js (for timeline scaling)
    - useTheme.js (for theme management)
    - useAutoSave.js (for auto-saving functionality)
  - router/ (Vue Router configuration with lazy loading)
  - store/ (Pinia store setup)
    - modules/
      - tasks.js
      - settings.js
      - ui.js
  - views/ (page components)
    - Home.vue
    - Tasks.vue
    - Settings.vue
    - NotFound.vue
  - utils/ (utility functions)
  - services/ (API and data services)
  - types/ (TypeScript interface and type definitions)
  - styles/
    - theme.js (theme variables)
    - animations.css (global animations)
    - cyberpunk.scss (cyberpunk styling utilities)
  - i18n/ (internationalization configuration)
  - plugins/ (Vue plugins configuration)
  - workers/ (Web Workers for performance optimization)

## Key Features

### Home Page (Timeline Visualization)
- Create an immersive, WebGL-powered space environment as the background
- Implement a dynamic visualization where tasks float in "space" and move toward the center point (representing "now")
- Tasks approaching their due date move closer to the center with increasing speed and visual intensity
- Completed tasks should trigger a satisfying explosion animation using particle effects
- Implement a time-scale slider with Mantine components styled in cyberpunk theme
- Time scale should range from 10 seconds to 1 year with logarithmic scaling
- Implement fluid zoom functionality with mouse wheel and touch gestures
- Add Rive animations for task icons that react to proximity to the center
- Create a "task trail" effect using Vue Motion when tasks move
- Add visual indicators for task priority (size, glow intensity, etc.)
- Include ambient space sounds that can be toggled on/off

### Tasks Page
- Design both card and list views with a cyberpunk-styled toggle switch
- Cards should have subtle hover animations using Vue Motion
- Organize tasks into three clear sections: Overdue (with warning indicators), Active, and Completed
- Implement advanced filtering options:
  - By tags (multi-select)
  - By due date range
  - By completion status
  - By priority level
- Add sorting options (due date, creation date, alphabetical)
- Include a search function with cyberpunk-styled search bar
- Implement batch operations (complete multiple tasks, delete multiple tasks)
- Add Rive animations for empty states and loading indicators

### Settings Page
- Create a futuristic, cyberpunk-styled settings interface
- Theme toggle with animated transition between dark/light modes
- Default time scale setting with visual preview
- Interface scale/font size controls with live preview
- Visual effects settings with toggles for:
  - Particle density
  - Animation intensity
  - Background effects complexity
  - Performance mode for lower-end devices
- Audio settings for notification and ambient sounds
- Notification settings with:
  - Push notification options
  - Task reminder lead times
  - Critical task alerts
- Data management section:
  - Import/export task data
  - Clear all tasks option
  - Backup to cloud option (placeholder)
- Reset application option with confirmation modal
- About section with app version and credits

### Task Modal
- Design a unified, futuristic modal for viewing, editing, and creating tasks
- Implement seamless auto-save functionality with subtle "saving" indicators
- Include advanced fields:
  - Title with character counter
  - Rich text description with formatting options
  - Due date and time picker with cyberpunk styling
  - Recurring task options
  - Priority selector (low, medium, high, critical)
  - Tags system with creation, editing, and color options
  - Color selection with a cyberpunk color palette
  - Effect/animation type selector with preview
  - Notification settings per task
  - Subtasks capability with progress tracking
- Add Rive animations for form elements and transitions
- Include a task history/activity log
- Add related tasks section

## Technical Requirements

### State Management
- Use Pinia for state management with modular store design
- Implement advanced store modules:
  - Tasks store with filtering and sorting capabilities
  - User settings store with persistence
  - UI state store for interface preferences
  - Animation state store for coordinating effects
- Set up actions for complex task operations
- Implement getters for derived task data (overdue counts, completion rates)

### Animations and Effects
- Integrate Vue Motion (or Motion One) for fluid task animations
- Implement WebGL effects for the space background using Vue-GL or Three.js
- Create particle system for task completion effects
- Use Rive for interactive icons and micro-animations throughout the app
- Ensure all animations respect reduced-motion accessibility settings
- Implement animation performance monitoring and automatic scaling

### Persistence
- Use IndexedDB via Dexie.js for robust client-side storage
- Implement efficient querying for task filtering
- Create automatic backup system to localStorage
- Design data migration strategy for app updates
- Add data import/export functionality with JSON and CSV options
- Implement throttled auto-save to prevent performance issues

### Styling
- Create a comprehensive cyberpunk space theme with CSS variables
- Extend Mantine UI components with custom styling
- Ensure both dark and light modes have unique cyberpunk aesthetics:
  - Dark mode: Deep space with neon accents
  - Light mode: Futuristic daylight space station feel
- Use CSS Grid and Flexbox for responsive layouts
- Implement a fluid typography system
- Create custom scrollbars and focus states
- Use SCSS mixins for consistent cyberpunk styling patterns

### Accessibility
- Ensure proper color contrast in both themes
- Add keyboard navigation support throughout
- Implement screen reader friendly markup
- Include focus management in the task modal
- Add aria attributes to custom components
- Support reduced motion preferences

## Specific Components to Create

### Core Cyber Components
1. `CyberButton.vue` - Custom styled button with hover effects and optional Rive icon
2. `CyberCard.vue` - Card component with glowing borders and hover animations
3. `CyberModal.vue` - Base modal component with blur backdrop and entrance animation
4. `CyberTimeline.vue` - Timeline visualization component with WebGL integration
5. `CyberToggle.vue` - Toggle switch component with sliding neon effect
6. `CyberInput.vue` - Input field component with cyberpunk styling and validation
7. `CyberSelect.vue` - Select dropdown with custom styling and animation
8. `CyberSlider.vue` - Slider component for time scale with value visualization
9. `CyberTag.vue` - Tag component with glow effect and remove animation
10. `CyberCheckbox.vue` - Custom checkbox with animation
11. `CyberRadio.vue` - Radio button with cyberpunk styling
12. `CyberTooltip.vue` - Information tooltip with futuristic styling
13. `CyberBadge.vue` - Status badge for task states
14. `CyberDivider.vue` - Section divider with optional label
15. `CyberProgressBar.vue` - Progress indicator with cyber styling

### Feature Components
1. `TaskModal.vue` - The unified task modal with all fields and auto-save
2. `SpaceVisualization.vue` - The WebGL space environment for the home page
3. `TaskEntity.vue` - Individual task representation in the space visualization
4. `TaskList.vue` - List view for tasks with animation between states
5. `TaskCard.vue` - Card view with flip animation for quick actions
6. `TimeScaleControl.vue` - Control for adjusting the visualization time scale
7. `TaskFilter.vue` - Advanced filtering interface for the Tasks page
8. `EmptyState.vue` - Component for empty sections with Rive animations
9. `NotificationBell.vue` - Animated notification indicator
10. `TaskStatistics.vue` - Visual representation of task completion stats
11. `ThemeToggle.vue` - Animated toggle between light and dark themes
12. `TimelineLegend.vue` - Guide to interpreting the space visualization
13. `QuickAddTask.vue` - Minimalist form for rapidly adding tasks

### Layout Components
1. `AppHeader.vue` - Application header with navigation and key actions
2. `AppSidebar.vue` - Optional sidebar for larger screens
3. `AppFooter.vue` - Application footer with credits and secondary links
4. `PageTransition.vue` - Animated transitions between routes

## Data Models

Task model with these detailed properties:
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  color: string;
  effectType: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  };
  notifications: {
    enabled: boolean;
    reminderTime: number; // minutes before due date
  };
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  notes: string;
  links: string[];
  history: {
    timestamp: Date;
    action: string;
    previousState?: Partial<Task>;
  }[];
}
```

UserSettings model:
```typescript
interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  defaultTimeScale: number;
  interfaceScale: number;
  visualEffects: {
    particleDensity: number;
    animationIntensity: number;
    backgroundComplexity: number;
    performanceMode: boolean;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    defaultLeadTime: number;
  };
  audio: {
    ambientSounds: boolean;
    effectsVolume: number;
  };
  taskDefaults: {
    color: string;
    effectType: string;
    priority: 'low' | 'medium' | 'high';
  };
}
```

## Authentication (Optional Placeholder)
- Add a simple login screen with cyberpunk styling
- Include mock authentication flow
- Create user profile section in settings
- Add JWT token handling utilities (for future backend integration)

## Performance Optimizations
- Implement route-based code splitting
- Use Intersection Observer for task list rendering
- Add virtualized lists for handling large task collections
- Use Web Workers for heavy computational tasks
- Implement service workers for offline support
- Add request batching for future API integration
- Set up a performance monitoring system

## Additional Requirements

1. Create responsive designs for mobile, tablet, and desktop
2. Include a comprehensive onboarding experience for new users
3. Add keyboard shortcuts for power users
4. Implement drag-and-drop task organization
5. Create a comprehensive error handling system with custom error pages
6. Set up ESLint and Prettier with cyberpunk project-specific rules
7. Create detailed documentation:
   - README.md with setup instructions
   - ARCHITECTURE.md explaining the project structure
   - COMPONENTS.md documenting the component library
8. Add PWA manifest and icons
9. Implement automated testing setup:
   - Unit tests for utility functions
   - Component tests for core components
   - End-to-end tests for critical user flows
