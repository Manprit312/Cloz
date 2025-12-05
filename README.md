# Cloz

personal wordrobe

## About

Cloz is a personal wardrobe management application built with Angular, Ionic, and Capacitor.

## Features

- User authentication (Login/Signup with email verification)
- Profile management (Edit name, email, gender, password, dark mode)
- Wardrobe organization (Categorize clothing items)
- Outfit planning
- Dark mode support
- Figma token integration for design consistency

## Tech Stack

- Angular 19
- Ionic 8
- Capacitor 7
- TypeScript
- Style Dictionary
- Figma Tokens Studio

## Development

```bash
# Install dependencies
npm install

# Generate tokens from Figma
npm run tokens

# Start development server
npm start

# Build for production
npm run build
```

## Project Structure

- `src/app/pages/` - Page components
- `src/app/core/` - Core services and guards
- `src/theme/` - Theme and design tokens
- `tokens/` - Local design tokens
- `scripts/` - Build and sync scripts
