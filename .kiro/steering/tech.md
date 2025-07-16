# Technology Stack

## Backend

- **Express.js** - Web framework for Node.js
- **TypeScript** - Static typing with strict mode enabled
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Frontend

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **clsx & tailwind-merge** - Conditional styling utilities

## Development Tools

- **ESLint** - Code linting with TypeScript rules
- **Prettier** - Code formatting (single quotes, 2 spaces, 80 char width)
- **tsx** - TypeScript execution for development

## Common Commands

### Backend Development

```bash
cd backend
npm run dev          # Start development server (port 3001)
npm run build        # Compile TypeScript
npm start           # Run compiled version
npm run lint        # Check code quality
npm run lint:fix    # Auto-fix linting issues
npm run format      # Format code with Prettier
```

### Frontend Development

```bash
cd frontend
npm run dev         # Start development server (port 3000)
npm run build       # Build for production
npm start          # Run production build
npm run lint       # Check code quality
npm run lint:fix   # Auto-fix linting issues
npm run format     # Format code with Prettier
```

## Environment Setup

- Node.js 18+ required
- Copy `backend/.env.example` to `backend/.env` and configure
- Install dependencies in both backend and frontend directories
