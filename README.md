# Turno App - Decoupled Architecture

A modern turno (shift) management application with a decoupled frontend and backend architecture.

## Architecture Overview

The application is now split into two separate projects:

- **Frontend**: Qwik-based web application (`/frontend`)
- **Backend**: Express.js API server (`/backend`)

## Projects

### Frontend (Qwik)
- **Location**: `/frontend`
- **Technology**: Qwik, TypeScript, Tailwind CSS
- **Purpose**: User interface and client-side logic
- **Communication**: HTTP API calls to backend

### Backend (Express.js)
- **Location**: `/backend`
- **Technology**: Express.js, TypeScript, Azure CosmosDB
- **Purpose**: API server, data persistence, business logic
- **Database**: Azure CosmosDB

## Quick Start

### Prerequisites
- Node.js 18+
- Azure CosmosDB account
- npm or yarn

### Installation
```bash
# Install all dependencies (root, frontend, and backend)
npm run install:all
```

### Development
```bash
# Run both frontend and backend concurrently
npm run dev

# Or run them separately:
npm run dev:backend    # Backend only
npm run dev:frontend   # Frontend only
```

The backend will start on `http://localhost:3001`
The frontend will start on `http://localhost:5173`

### Configuration

#### Backend (.env)
```bash
cd backend
cp env.example .env
# Configure your Azure CosmosDB credentials in .env
```

#### Frontend (.env)
```bash
cd frontend
cp ../env.example .env
# Configure API URL in .env (default: http://localhost:3001/api)
```

## Environment Configuration

### Backend (.env)
```env
# Azure CosmosDB
COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
COSMOS_KEY=your-primary-key
COSMOS_DATABASE_ID=turno-db
COSMOS_CONTAINER_ID=turnos

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
```

## Migration from Monolithic Architecture

This project has been migrated from a monolithic Qwik application to a decoupled architecture:

### What Changed
- **Database**: SQLite → Azure CosmosDB
- **Architecture**: Monolithic → Client-Server
- **Data Access**: Direct database calls → HTTP API calls
- **Deployment**: Single app → Two separate deployments

### Benefits
- **Scalability**: Backend can scale independently
- **Flexibility**: Frontend and backend can be deployed separately
- **Cloud-native**: Uses Azure CosmosDB for global distribution
- **Maintainability**: Clear separation of concerns

## API Documentation

The backend provides a RESTful API. See `/backend/README.md` for detailed API documentation.

### Key Endpoints
- `GET /api/turnos` - Get turnos by date range
- `POST /api/turnos` - Create/update turno
- `POST /api/turnos/excel` - Upload Excel file
- `GET /api/turnos/stats` - Get statistics

## Deployment

### Backend Deployment (Azure App Service)
```bash
cd backend
npm run build
# Deploy dist/ folder to Azure App Service
```

### Frontend Deployment (Static Hosting)
```bash
npm run build
# Deploy dist/ folder to static hosting (Vercel, Netlify, etc.)
```

### Docker Support
Both frontend and backend include Dockerfile for containerized deployment.

## Development

### Running Both Services
```bash
# Run both services concurrently (recommended)
npm run dev

# Or run separately:
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

### Code Structure
```
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   └── config/
│   └── package.json
├── frontend/          # Qwik frontend
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── lib/
│   │   │   └── api/   # HTTP client for backend
│   │   └── global.css
│   └── package.json
├── data/              # Shared data files
├── scripts/           # Utility scripts
└── package.json       # Root workspace configuration
```

## Features

- ✅ **Shift Management**: Create, update, and view work shifts
- ✅ **Excel Import**: Bulk import shifts from Excel files
- ✅ **Date Navigation**: Navigate between different time periods
- ✅ **Statistics**: View shift distribution and vacation days
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Cloud Database**: Azure CosmosDB for scalability
- ✅ **API-First**: RESTful API for integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes to frontend (`/frontend`) or backend (`/backend`)
4. Test both services together
5. Submit a pull request

## License

MIT License - see LICENSE file for details.