# Project Structure

## Root Organization

```
├── backend/          # Express.js API server
├── frontend/         # Next.js web application
├── .kiro/           # Kiro specifications and steering
└── README.md        # Project documentation
```

## Backend Structure (`backend/src/`)

```
src/
├── config/          # Application configuration
├── controllers/     # Route controllers (business logic)
├── middleware/      # Custom middleware functions
├── models/          # Data models and schemas
├── routes/          # API route definitions
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── utils/           # Helper functions and utilities
└── index.ts         # Application entry point
```

## Frontend Structure (`frontend/src/`)

```
src/
├── app/             # Next.js App Router pages
├── components/      # Reusable React components
│   ├── layout/      # Layout-specific components
│   └── ui/          # UI component library
├── hooks/           # Custom React hooks
├── lib/             # Utilities and configurations
├── store/           # Zustand state management
└── types/           # TypeScript type definitions
```

## Path Aliases

Both backend and frontend use TypeScript path aliases:

### Backend

- `@/*` → `./src/*`
- `@/controllers/*` → `./src/controllers/*`
- `@/services/*` → `./src/services/*`
- `@/models/*` → `./src/models/*`
- `@/middleware/*` → `./src/middleware/*`
- `@/utils/*` → `./src/utils/*`
- `@/types/*` → `./src/types/*`

### Frontend

- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/lib/*` → `./src/lib/*`
- `@/types/*` → `./src/types/*`

## File Naming Conventions

- Use kebab-case for file and folder names
- TypeScript files use `.ts` extension (`.tsx` for React components)
- Keep `.gitkeep` files in empty directories to maintain structure
- Configuration files in root of respective directories

## API Endpoints

- Health check: `GET /health`
- API info: `GET /api`
- All business endpoints should be prefixed with `/api/`

## Design Principles

### Single Responsibility Principle (SRP)

Each folder in the `src/` directory is designed to follow the Single Responsibility Principle. For example:

- `controllers/` handle incoming HTTP requests and delegate processing
- `services/` contain business logic and orchestration
- `models/` define data structures
- `routes/` define endpoint definitions and routing logic

This modular design improves testability, scalability, and maintainability.

### Barrel Files

To simplify imports and keep code clean, barrel files (`index.ts`) are used in most folders (e.g., `services`, `controllers`, `utils`). This allows imports like:

```ts
import { createUser, deleteUser } from '@/services';
import { createUser } from '@/services/createUser';
import { deleteUser } from '@/services/deleteUser';
```

ℹ️ Avoid deeply nested barrels or circular dependencies by keeping each index.ts file focused and only re-exporting related entities.
