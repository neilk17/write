# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Write" - a minimalist Electron-based desktop journaling application that allows users to create and manage text entries stored locally on their filesystem. The app features a rich text editor powered by TipTap and supports both writing and reading modes.

## Commands

### Development

- `npm start` - Start the development server with hot reload
- `npm run lint` - Run ESLint on TypeScript files

### Building & Packaging

- `npm run package` - Package the app without creating installers
- `npm run make` - Create platform-specific installers
- `npm run publish` - Publish the app

Note: There are no test commands configured in this project.

## Architecture

### Electron Process Architecture

The app follows the standard Electron architecture with three key processes:

1. **Main Process** (`src/index.ts`):

   - Manages app lifecycle and window creation
   - Handles all file system operations (read/write/list)
   - Manages IPC communication with renderer
   - Stores user preferences via config management

2. **Preload Script** (`src/preload.ts`):

   - Provides secure bridge between main and renderer processes
   - Exposes limited API via `window.api` object
   - Methods: `selectDirectory`, `createDirectory`, `saveFile`, `readFile`, `listEntries`, `getConfig`, `updateConfig`

3. **Renderer Process** (`src/renderer.ts` → `src/app.tsx`):
   - React application entry point
   - Manages UI state and user interactions
   - Communicates with main process via preload API

### Key Features & Implementation

1. **File Storage Pattern**:

   - Journal entries are stored as plain `.txt` files
   - User selects a folder for storage
   - Files are named with timestamp format: `YYYY-MM-DD_HH-MM-SS.txt`

2. **State Management**:

   - Uses local React state (no Redux/MobX)
   - Mode switching between "write" and "read" modes
   - Persistent folder selection via config

3. **UI Components**:
   - Built with shadcn/ui components (New York style)
   - Custom theme system with dark/light mode support
   - TipTap rich text editor for journal entries
   - Tailwind CSS v4 (alpha) for styling

### Technology Stack

- **Electron**: 36.3.1
- **React**: 19.1.0
- **TypeScript**: 4.5.4
- **TipTap**: 2.12.0 (rich text editor)
- **Tailwind CSS**: v4 alpha
- **Build**: Webpack via Electron Forge
- **UI Components**: shadcn/ui

### Build Configuration

- Uses Electron Forge for building and packaging
- Webpack configuration split into main and renderer configs
- TypeScript compilation with path aliases configured (`@/*` → `src/*`)
- PostCSS with Tailwind CSS plugin
