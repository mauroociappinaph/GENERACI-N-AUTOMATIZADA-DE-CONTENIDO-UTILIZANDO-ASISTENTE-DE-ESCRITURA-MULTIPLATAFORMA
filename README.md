# Sistema de Gestión #040

Sistema integral de gestión de procesos y datos empresariales diseñado para uso empresarial con arquitectura escalable y moderna.

## Estructura del Proyecto

```
├── backend/          # API REST con Express.js y TypeScript
├── frontend/         # Aplicación web con Next.js y React
└── .kiro/           # Configuración de especificaciones Kiro
```

## Tecnologías

### Backend

- **Express.js** - Framework web para Node.js
- **TypeScript** - Tipado estático con modo estricto
- **Prisma** - ORM moderno para base de datos con SQLite/PostgreSQL
- **JWT (jsonwebtoken)** - Autenticación y autorización con tokens
- **bcrypt** - Encriptación de contraseñas
- **Zod** - Validación de esquemas y tipos
- **Helmet** - Middleware de seguridad
- **CORS** - Configuración de políticas de origen cruzado
- **ESLint + Prettier** - Linting y formateo de código

### Frontend

- **Next.js 14** - Framework React con App Router
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de utilidades CSS
- **Zustand** - Gestión de estado
- **clsx & tailwind-merge** - Utilidades de estilo condicional
- **ESLint + Prettier** - Linting y formateo de código

## Configuración de Desarrollo

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd sistema-gestion-040
```

2. **Instalar dependencias del backend**

```bash
cd backend
npm install
```

3. **Instalar dependencias del frontend**

```bash
cd frontend
npm install
```

4. **Configurar variables de entorno**

```bash
cd backend
cp .env.example .env
# Editar .env con los valores apropiados
```

5. **Configurar la base de datos**

```bash
cd backend
npx prisma generate
npx prisma db push
```

### Desarrollo

**Ejecutar el backend:**

```bash
cd backend
npm run dev
```

El servidor estará disponible en http://localhost:3001

**Ejecutar el frontend:**

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en http://localhost:3000

### Scripts Disponibles

#### Backend

- `npm run dev` - Ejecutar en modo desarrollo con recarga automática
- `npm run build` - Compilar TypeScript a JavaScript
- `npm start` - Ejecutar versión compilada
- `npm run lint` - Verificar código con ESLint
- `npm run lint:fix` - Corregir errores de ESLint automáticamente
- `npm run format` - Formatear código con Prettier
- `npm run format:check` - Verificar formato del código
- `npm run db:generate` - Generar cliente Prisma
- `npm run db:migrate` - Ejecutar migraciones de base de datos
- `npm run db:reset` - Resetear base de datos (desarrollo)
- `npm run db:test` - Probar conexión a base de datos

#### Frontend

- `npm run dev` - Ejecutar en modo desarrollo (puerto 3000)
- `npm run build` - Compilar para producción
- `npm start` - Ejecutar versión compilada
- `npm run lint` - Verificar código con ESLint
- `npm run lint:fix` - Corregir errores de ESLint automáticamente
- `npm run format` - Formatear código con Prettier
- `npm run format:check` - Verificar formato del código

## Arquitectura

### Backend

```
src/
├── config/          # Configuración de la aplicación
├── controllers/     # Controladores de rutas
├── middleware/      # Middleware personalizado
├── models/          # Modelos de datos
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── types/           # Definiciones de tipos TypeScript
├── utils/           # Utilidades y helpers
└── index.ts         # Punto de entrada de la aplicación
```

### Frontend

```
src/
├── app/             # App Router de Next.js
├── components/      # Componentes React reutilizables
├── hooks/           # Hooks personalizados
├── lib/             # Utilidades y configuraciones
├── store/           # Gestión de estado con Zustand
└── types/           # Definiciones de tipos TypeScript
```

## Base de Datos

### Configuración de Prisma

El proyecto utiliza Prisma como ORM principal con soporte para SQLite (desarrollo) y PostgreSQL (producción). La configuración incluye:

- **Cliente Prisma**: Generado automáticamente en `src/generated/prisma`
- **Base de datos**: SQLite (`dev.db`) para desarrollo local, PostgreSQL para producción
- **Gestión de conexiones**: Prisma maneja automáticamente el pool de conexiones y optimizaciones
- **Migraciones**: Gestionadas automáticamente con Prisma
- **Logging**: Configurado para queries, info, warnings y errores
- **Instancia singleton**: Clase Database simplificada que encapsula la instancia de Prisma
- **Desconexión automática**: Manejo graceful de cierre de conexiones al terminar la aplicación
- **Utilidades de paginación**: Helpers para manejo de paginación, ordenamiento y respuestas paginadas

### Modelos de Datos

#### User (Usuarios)

- Gestión de usuarios con roles (ADMIN, MANAGER, USER, VIEWER)
- Autenticación con hash de contraseña
- Campos: id, email, firstName, lastName, role, isActive
- Relaciones con registros de datos, logs de auditoría y reportes
- **Validación de datos**: Esquemas Zod para creación, actualización y cambio de contraseña
- **Tipos de respuesta**: Interface UserResponse sin datos sensibles
- **Seguridad**: Exclusión automática de passwordHash en respuestas

#### DataRecord (Registros de Datos)

- Almacenamiento flexible de datos con JSON
- Metadatos opcionales y control de versiones
- Seguimiento de creador y último editor
- Campos: id, type, data, metadata, timestamps

#### AuditLog (Logs de Auditoría)

- Registro completo de actividades del sistema
- Seguimiento de cambios con valores anteriores y nuevos
- Información de contexto (IP, user agent)
- Campos: id, userId, action, resourceType, oldValues, newValues

#### Report (Reportes)

- Plantillas de reportes configurables
- Gestión de reportes activos/inactivos
- Campos: id, name, description, template, isActive

### Scripts de Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar cambios al esquema
npx prisma db push

# Ver datos en Prisma Studio
npx prisma studio

# Reset de base de datos (desarrollo)
npx prisma db push --force-reset
```

## Características Principales

### Backend

- **API RESTful** con Express.js y TypeScript
- **Base de datos robusta** con Prisma ORM y soporte PostgreSQL/SQLite
- **Autenticación JWT** preparada para implementación
- **Sistema de roles y permisos** completo (ADMIN, MANAGER, USER, VIEWER)
- **Middleware de autorización** con control granular de permisos
- **Auditoría completa** de actividades del sistema
- **Paginación avanzada** con helpers de utilidad
- **Pool de conexiones** optimizado para PostgreSQL
- **Middleware de seguridad** con Helmet y CORS
- **Manejo de errores** consistente y logging detallado

### Frontend

- **Interfaz moderna** con Next.js 14 y React 18
- **Cliente API** configurado con autenticación automática
- **Gestión de estado** preparada con Zustand
- **Diseño responsive** con Tailwind CSS
- **Tipado completo** con TypeScript
- **Componentes reutilizables** y arquitectura escalable

### Utilidades Implementadas

#### Prisma Helpers (`backend/src/utils/prisma-helpers.ts`)

- `calculatePagination()` - Cálculo de offset y límite para paginación
- `createPaginatedResponse()` - Creación de respuestas paginadas estandarizadas
- `parsePaginationParams()` - Validación y parsing de parámetros de paginación con límites seguros
- `excludeUserPassword()` - Exclusión segura de campos sensibles con manejo optimizado para ESLint
- `createOrderBy()` - Generación de objetos de ordenamiento para consultas Prisma

#### API Client (`frontend/src/lib/api.ts`)

- Cliente HTTP configurado con autenticación automática
- Manejo de tokens JWT desde localStorage
- Métodos GET, POST, PUT, DELETE con tipado TypeScript
- Manejo de errores centralizado

#### Authorization Middleware (`backend/src/middleware/authorization.middleware.ts`)

Sistema completo de autorización basado en roles y permisos granulares con manejo robusto de errores:

**Roles del Sistema:**

- `ADMIN` - Acceso completo al sistema
- `MANAGER` - Gestión de usuarios y datos, reportes
- `USER` - Creación y edición de datos, lectura de reportes
- `VIEWER` - Solo lectura de datos y reportes

**Permisos Granulares:**

- **Usuarios**: `users:create`, `users:read`, `users:update`, `users:delete`
- **Datos**: `data:create`, `data:read`, `data:update`, `data:delete`
- **Reportes**: `reports:create`, `reports:read`, `reports:update`, `reports:delete`
- **Sistema**: `system:configure`, `audit:read`

**Permisos por Rol:**

- **ADMIN**: Todos los permisos del sistema
- **MANAGER**: `users:read/update`, `data:*`, `reports:*`, `audit:read`
- **USER**: `data:create/read/update`, `reports:read`
- **VIEWER**: `data:read`, `reports:read`

**Middleware Disponibles:**

- `requireRole(...roles)` - Verificar roles específicos
- `requirePermission(...permissions)` - Verificar permisos granulares
- `requireOwnershipOrAdmin(getOwnerId)` - Acceso solo al propietario o admin

**Funciones Helper:**

- `hasPermission(role, permission)` - Verificar si un rol tiene un permiso
- `getRolePermissions(role)` - Obtener todos los permisos de un rol
- `isRoleHigherThan(role1, role2)` - Comparar jerarquía de roles

**Características de Seguridad:**

- Respuestas de error estandarizadas con códigos HTTP apropiados
- Logging de request IDs para trazabilidad
- Manejo robusto de errores con información detallada
- Validación de autenticación antes de autorización
- Soporte para verificación asíncrona de propiedad de recursos

## Endpoints de la API

### Salud del Sistema

- `GET /health` - Verificar estado del servidor
- `GET /health/db` - Verificar conexión a base de datos
- `GET /api` - Información básica de la API

### Autenticación (`/api/auth`)

- `POST /api/auth/login` - Iniciar sesión con email y contraseña
- `POST /api/auth/refresh` - Renovar token de acceso usando refresh token
- `POST /api/auth/logout` - Cerrar sesión (requiere autenticación)
- `GET /api/auth/me` - Obtener información del usuario actual

### Gestión de Usuarios (`/api/users`)

**Información de Roles y Permisos:**

- `GET /api/users/roles` - Obtener roles disponibles
- `GET /api/users/roles/:role/permissions` - Obtener permisos de un rol específico
- `GET /api/users/roles/info` - Obtener información completa de todos los roles
- `GET /api/users/permissions/info` - Obtener información completa de todos los permisos
- `GET /api/users/permissions/:permission/check` - Verificar si el usuario actual tiene un permiso específico

**CRUD de Usuarios:**

- `GET /api/users` - Obtener lista de usuarios con paginación y filtros
- `GET /api/users/:id` - Obtener usuario por ID
- `POST /api/users` - Crear nuevo usuario
- `PUT /api/users/:id` - Actualizar usuario
- `PUT /api/users/:id/password` - Cambiar contraseña de usuario
- `PATCH /api/users/:id/toggle-status` - Activar/desactivar usuario
- `DELETE /api/users/:id` - Eliminar usuario (soft delete)

## Sistema de Autenticación y Autorización

### Autenticación JWT

El sistema implementa autenticación completa basada en JWT con las siguientes características:

- **Tokens duales**: Access token (15 minutos) y refresh token (7 días)
- **Renovación automática**: Endpoint para renovar access tokens sin re-autenticación
- **Validación robusta**: Verificación de tipo de token y expiración
- **Seguridad**: Tokens firmados con secretos separados para access y refresh

### Sistema de Roles y Permisos

**Jerarquía de Roles (de menor a mayor):**

1. **VIEWER** - Solo lectura de datos y reportes
2. **USER** - Creación y edición de datos, lectura de reportes
3. **MANAGER** - Gestión de usuarios (lectura/actualización), gestión completa de datos y reportes, acceso a auditoría
4. **ADMIN** - Acceso completo al sistema incluyendo configuración

**Categorías de Permisos:**

- **users:** - Gestión de usuarios (create, read, update, delete)
- **data:** - Gestión de registros de datos (create, read, update, delete)
- **reports:** - Gestión de reportes (create, read, update, delete)
- **system:** - Configuración del sistema (configure)
- **audit:** - Acceso a logs de auditoría (read)

### Middleware de Seguridad

- **authenticateToken**: Verificación obligatoria de JWT
- **optionalAuth**: Verificación opcional de JWT
- **requireRole**: Verificación de roles específicos
- **requirePermission**: Verificación de permisos granulares
- **requireOwnershipOrAdmin**: Acceso solo al propietario del recurso o administradores

### Configuración de Variables de Entorno

#### Backend (`.env`)

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL="file:./dev.db"  # SQLite para desarrollo
# DATABASE_URL="postgresql://user:password@localhost:5432/dbname"  # PostgreSQL para producción

# JWT Configuration
JWT_ACCESS_SECRET="your-access-token-secret"
JWT_REFRESH_SECRET="your-refresh-token-secret"

# CORS Configuration
FRONTEND_URL="http://localhost:3000"
```

#### Frontend (`.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## Contribución

1. Seguir las convenciones de código establecidas por ESLint y Prettier
2. Escribir tests para nuevas funcionalidades
3. Documentar cambios significativos
4. Usar commits descriptivos

## Licencia

[Especificar licencia]
