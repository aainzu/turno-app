# Turno App - Frontend

This is the frontend application for the Turno Management system, built with Qwik.

## Technologies

- **Qwik** - Modern web framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool
- **Vitest** - Testing framework

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run linting
npm run lint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components
│   ├── turnos/         # Turno-specific components
│   └── ui/             # Generic UI components
├── lib/                # Utility libraries
│   ├── api/           # API client
│   ├── services/      # Business logic services
│   ├── utils/         # Utility functions
│   └── validators/    # Data validation
├── routes/            # Qwik City routes
└── global.css         # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint
- `npm run fmt` - Format code with Prettier
