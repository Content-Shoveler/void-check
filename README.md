# Cyberpunk Space Todo/Timer PWA

A sophisticated Vue 3 PWA application with an immersive cyberpunk space theme, featuring a futuristic todo list with innovative time visualization.

## Features

- **Immersive Space Visualization**: Tasks float in a 3D space environment with their position representing time until due date
- **Comprehensive Task Management**: Advanced task features including recurring tasks, subtasks, and detailed metadata
- **Cyberpunk Design**: Distinctive visual style with neon accents and atmospheric design
- **Offline-First Architecture**: Full functionality without internet connection through PWA technology
- **Dark/Light Themes**: Seamless transitions between dark and light cyberpunk-themed interfaces

## Technology Stack

- **Frontend**: Vue 3 with TypeScript
- **Build System**: Vite
- **UI Framework**: Mantine UI with custom CyberComponents
- **State Management**: Pinia
- **Persistence**: IndexedDB via Dexie.js
- **Visualization**: Three.js for WebGL rendering
- **Animation**: Vue Motion and Rive for micro-animations
- **Styling**: SCSS with custom cyberpunk theming

## Getting Started

### Prerequisites

- Node.js (v16+)
- Yarn package manager

### Installation

1. Clone the repository
```
git clone [repository-url]
cd void-check
```

2. Install dependencies
```
yarn
```

3. Start the development server
```
yarn dev
```

4. Build for production
```
yarn build
```

## Project Structure

```
void-check/
├── public/                  # Static files
├── src/
│   ├── assets/              # Static assets
│   │   ├── fonts/           # Cyberpunk fonts
│   │   ├── images/          # Space and cyberpunk imagery
│   │   ├── rive/            # Rive animation files
│   │   └── models/          # 3D models
│   ├── components/          # Vue components
│   │   ├── cyber/           # Custom cyberpunk components
│   │   ├── layout/          # Layout components
│   │   ├── task/            # Task-related components
│   │   └── visualization/   # WebGL/animation components
│   ├── composables/         # Vue composables
│   ├── router/              # Vue Router configuration
│   ├── store/               # Pinia store
│   │   └── modules/         # Store modules
│   ├── views/               # Page components
│   ├── utils/               # Utility functions
│   ├── services/            # API/data services
│   ├── types/               # TypeScript types
│   ├── styles/              # Global styles
│   ├── i18n/                # Internationalization
│   ├── plugins/             # Vue plugins
│   └── workers/             # Web Workers
└── docs/                    # Documentation
    ├── phases/              # Implementation phase docs
    └── components/          # Component documentation
```

## Documentation

For more detailed information, see:

- [Original Prompt](./docs/original-prompt.md)
- [Implementation Plan](./docs/implementation-plan.md)
- [Project Brief](./docs/project-brief.md)
- [Styling & Theming Guide](./docs/styling-theming-guide.md)
- [Google Calendar Integration Guide](./docs/google-calendar-integration.md)
- [Microsoft Calendar Integration Guide](./docs/microsoft-calendar-integration.md)

## License

This project is licensed under the MIT License.
