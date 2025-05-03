# Cyberpunk Space Todo/Timer PWA: Styling & Theming Guide

This document outlines the visual language, design system, and theming principles for the Cyberpunk Space Todo/Timer application.

## Design Philosophy

Our design combines two core aesthetics:
1. **Cyberpunk** - High-tech meets low-life, neon-lit interfaces, digital glitches, and urban futurism
2. **Space** - Vast cosmic environments, celestial objects, and the infinity of the universe

These themes are interpreted differently between our dark and light modes:
- **Dark Mode**: Deep space with vibrant neon accents, representing the cold void with brilliant distant objects
- **Light Mode**: Futuristic space station interior with sleek, clean surfaces and ambient lighting

## Color Palette

### Core Colors

| Name | Dark Mode | Light Mode | Usage |
|------|-----------|------------|-------|
| Primary | `#00F5FF` (Cyan) | `#0088FF` (Blue) | Main actions, active states |
| Secondary | `#FF3E80` (Magenta) | `#FF4F5E` (Coral) | Secondary actions, highlights |
| Accent | `#FFCC00` (Gold) | `#FFB900` (Amber) | Special elements, warnings |

### Background Spectrum

| Name | Dark Mode | Light Mode | Usage |
|------|-----------|------------|-------|
| Background | `#050718` (Deep Space) | `#F0F4FF` (Cosmic White) | Main app background |
| Surface | `#0C1024` (Night Space) | `#FFFFFF` (White) | Cards, dialogs |
| Elevated | `#141838` (Deep Blue) | `#E6EBFF` (Soft Blue) | Elevated components |
| Inset | `#080C1A` (Darker Space) | `#D8DFEF` (Muted Light) | Inset components like inputs |

### Text Colors

| Name | Dark Mode | Light Mode | Usage |
|------|-----------|------------|-------|
| Primary Text | `#FFFFFF` | `#121438` | Main text content |
| Secondary Text | `#A9B1D6` | `#495174` | Supporting text content |
| Disabled Text | `#565F89` | `#BBC0D9` | Inactive text elements |

### Priority Colors

| Priority | Color | Hex Code |
|----------|-------|----------|
| Low | Teal | `#00B2A0` |
| Medium | Yellow | `#FFD600` |
| High | Orange | `#FF7A00` |
| Critical | Red | `#FF2D55` |

### Status Colors

| Status | Color | Hex Code |
|--------|-------|----------|
| Success | Green | `#00C781` |
| Warning | Amber | `#FFAA15` |
| Error | Red | `#FF4040` |
| Info | Blue | `#00C8FF` |

## Effect System

### Glow Effects

Neon glow is a key part of our cyberpunk aesthetic:

```css
--glow-primary: 0 0 10px #00F5FF, 0 0 20px rgba(0, 245, 255, 0.5);
--glow-secondary: 0 0 10px #FF3E80, 0 0 20px rgba(255, 62, 128, 0.5);
--glow-accent: 0 0 10px #FFCC00, 0 0 20px rgba(255, 204, 0, 0.5);
```

Usage:
```css
.cyber-button:hover {
  box-shadow: var(--glow-primary);
}
```

### Glassmorphism

For space-age transparent surfaces:

```css
--glass-background: rgba(12, 16, 36, 0.7);
--glass-border: 1px solid rgba(255, 255, 255, 0.1);
--glass-blur: blur(10px);
```

Usage:
```css
.cyber-card {
  background: var(--glass-background);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
}
```

### Gradients

Space-inspired gradients:

```css
--gradient-cosmic: linear-gradient(135deg, #070B34 0%, #141852 100%);
--gradient-nebula: linear-gradient(135deg, #0C1024 0%, #2B1055 100%);
--gradient-aurora: linear-gradient(135deg, #091833 0%, #2E3B52 50%, #23778F 100%);
```

## Typography

### Font Stack

```css
--font-primary: 'Orbitron', 'Rajdhani', sans-serif;
--font-secondary: 'Rajdhani', 'Exo 2', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Font Weights

```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-bold: 700;
```

### Line Heights

```css
--leading-tight: 1.1;
--leading-snug: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

## Spacing System

Consistent spacing is essential for visual rhythm:

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.5rem;    /* 24px */
--space-6: 2rem;      /* 32px */
--space-8: 3rem;      /* 48px */
--space-10: 4rem;     /* 64px */
--space-12: 6rem;     /* 96px */
```

## Borders & Radius

```css
--radius-sm: 0.125rem;  /* 2px */
--radius-md: 0.25rem;   /* 4px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 1rem;      /* 16px */
--radius-full: 9999px;

--border-thin: 1px;
--border-regular: 2px;
--border-thick: 3px;
```

## Animation & Transitions

### Timing Functions

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-glitch: cubic-bezier(0.6, -0.28, 0.74, 0.05);
```

### Duration

```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

### Common Transitions

```css
--transition-base: all var(--duration-normal) var(--ease-out);
--transition-glow: box-shadow var(--duration-normal) var(--ease-out);
--transition-transform: transform var(--duration-normal) var(--ease-out);
--transition-color: color var(--duration-fast) var(--ease-out);
```

## Component Design Guidelines

### Buttons

Buttons should have:
- Slight gradient background
- Hover glow effect matching their purpose
- Pressed state with reduced scale (95%)
- Transition for all properties
- Uppercase text for standard buttons
- Icon + text with proper spacing

Example:
```css
.cyber-button {
  background: var(--gradient-cosmic);
  color: var(--color-primary);
  text-transform: uppercase;
  font-family: var(--font-primary);
  font-weight: var(--font-medium);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: var(--border-thin) solid var(--color-primary);
  transition: var(--transition-base);
}

.cyber-button:hover {
  box-shadow: var(--glow-primary);
}

.cyber-button:active {
  transform: scale(0.95);
}
```

### Cards

Cards should have:
- Slight transparency for background
- Glowing border in active state
- Consistent padding
- Clear hierarchy for content

Example:
```css
.cyber-card {
  background: var(--glass-background);
  backdrop-filter: var(--glass-blur);
  border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: var(--transition-base);
}

.cyber-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--glow-primary);
}
```

### Form Elements

Form elements should have:
- Consistent sizing and padding
- Clear focus states with glow
- Validation states with appropriate colors
- Animated transitions between states

Example:
```css
.cyber-input {
  background: var(--color-inset);
  border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-primary);
  transition: var(--transition-base);
}

.cyber-input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--glow-primary);
  outline: none;
}

.cyber-input.error {
  border-color: var(--color-error);
  box-shadow: var(--glow-error);
}
```

## Dark/Light Mode Implementation

The theme system will use CSS variables with a theme toggle that switches between predefined sets of values.

### Implementation

1. Define variables for both themes
2. Add a `data-theme` attribute to the root element
3. Use CSS to select the appropriate variables

```css
:root {
  /* Default theme (dark) */
  --color-primary: #00F5FF;
  --color-background: #050718;
  /* etc... */
}

[data-theme="light"] {
  --color-primary: #0088FF;
  --color-background: #F0F4FF;
  /* etc... */
}
```

### Theme Switching

The theme toggle will:
1. Change the `data-theme` attribute
2. Store preference in localStorage
3. Add a smooth transition between themes

```typescript
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Add transition class
  document.documentElement.classList.add('theme-transition');
  
  // Change theme
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Store preference
  localStorage.setItem('theme', newTheme);
  
  // Remove transition class after animation completes
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition');
  }, 500);
}
```

## Accessibility Considerations

### Color Contrast

All color combinations must meet WCAG AA standards:
- Text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- UI components and graphical objects: 3:1 contrast ratio

### Reduced Motion

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Focus Visibility

All interactive elements must have visible focus states:

```css
:focus-visible {
  outline: var(--border-regular) solid var(--color-primary);
  outline-offset: 2px;
  box-shadow: var(--glow-primary);
}
```

## SCSS Implementation

The theme will be implemented using SCSS for maintainability:

### Variables Module

```scss
// _variables.scss
$colors: (
  'dark': (
    'primary': #00F5FF,
    'secondary': #FF3E80,
    // etc...
  ),
  'light': (
    'primary': #0088FF,
    'secondary': #FF4F5E,
    // etc...
  )
);

// Generate CSS variables from the map
:root {
  @each $name, $value in map-get($colors, 'dark') {
    --color-#{$name}: #{$value};
  }
}

[data-theme="light"] {
  @each $name, $value in map-get($colors, 'light') {
    --color-#{$name}: #{$value};
  }
}
```

### Mixins

```scss
// _mixins.scss
@mixin cyber-glow($color: 'primary', $intensity: 'medium') {
  $values: (
    'low': 0 0 5px,
    'medium': 0 0 10px,
    'high': 0 0 20px
  );
  
  $color-value: var(--color-#{$color});
  $glow-value: map-get($values, $intensity);
  
  box-shadow: #{$glow-value} #{$color-value};
}

@mixin glass-effect($opacity: 0.7, $blur: 10px) {
  background-color: rgba(var(--color-surface-rgb), $opacity);
  backdrop-filter: blur($blur);
  -webkit-backdrop-filter: blur($blur);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## Implementation Guidelines

1. Always use the predefined CSS variables for colors, spacing, etc.
2. Follow the component design patterns for consistency
3. Use the SCSS mixins for common effects
4. Test all components in both light and dark modes
5. Verify accessibility compliance for all elements
6. Use the animation system for consistent motion

Following these guidelines will ensure a cohesive, visually striking, and accessible cyberpunk space aesthetic throughout the application.
