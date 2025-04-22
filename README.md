# VoidCheck - Visual Timer Todo App ✨🚀

VoidCheck is a space-themed visual task management Progressive Web App (PWA) that presents tasks as circles moving from the edge toward the center of a timeline as their due dates approach.

## 🌌 Features

- **Visual Timeline**: Tasks appear as circles that move from edge to center as time counts down
- **Flexible Time Scale**: Adjust the visualization from 10 seconds to 12 months
- **Offline Support**: Complete offline functionality with client-side data persistence
- **Space Theme**: Deep space blues/purples with neon accents and retro NASA inspiration
- **Custom Components**: Extends Material UI for Vue with space-themed components

## 🛸 Technology Stack

- **Vue 3** with TypeScript and Composition API
- **Vite** as the build tool
- **PWA Configuration** with service workers for offline use
- **Material UI (MUI)** for Vue as the base component library
- **Pinia** for state management with persistence
- **Dexie.js** for IndexedDB wrapper and database management
- **Motion One** for animations and movements
- **Rive** for interactive animations
- **Vue Router** for navigation
- **Vue i18n** for internationalization

## 🪐 Getting Started

### Prerequisites

- Node.js (v16 or later)
- Yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/void-check.git
   cd void-check
   ```

2. Install dependencies:
   ```bash
   yarn
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

4. Build for production:
   ```bash
   yarn build
   ```

## 📱 PWA Features

VoidCheck is fully configured as a Progressive Web App, offering:

- Full offline functionality
- Install prompt for adding to home screen
- App icons in various sizes
- Splash screen
- Background sync when coming back online

## 🎨 App Structure

- **Visual Timeline**: The main view shows tasks as circles on a time-based visualization
- **Task List**: View tasks in either card or list layout with sorting and filtering options
- **Task Details**: Create, edit, and view task details including deadlines, priorities, and tags
- **Settings**: Customize app appearance, behavior, and preferences

## 💫 Task Management Features

Tasks include:
- Title and description
- Due date
- Priority level (1-5)
- Tags for categorization
- External links
- Completion status

## 🚀 Project Structure

The project follows a modular structure:

```
src/
  assets/                # Static assets like icons and images
  components/            # Reusable Vue components
    tasks/               # Task-related components
    layout/              # Layout components
    ui/                  # Custom UI component library
  composables/           # Vue composition functions
  data/                  # Data models and database access
    models/              # Type definitions
    db/                  # Database configuration
      dexie/             # Dexie.js setup
      repositories/      # Data access repositories
  router/                # Vue Router configuration
  store/                 # Pinia stores for state management
  styles/                # Global styles and theme variables
  utils/                 # Utility functions
  views/                 # Main application views
```

## 📚 License

This project is licensed under the MIT License - see the LICENSE file for details.
