# 📝 Convenciones de Commits

Este proyecto utiliza [Conventional Commits](https://www.conventionalcommits.org/) para mantener un historial de commits limpio y semánticamente significativo.

## 🎯 Formato

```
<tipo>[ámbito opcional]: <descripción>

[cuerpo opcional]

[pie opcional]
```

## 📋 Tipos de Commits

| Tipo       | Descripción             | Ejemplo                                              |
| ---------- | ----------------------- | ---------------------------------------------------- |
| `feat`     | Nueva funcionalidad     | `feat(auth): add JWT authentication`                 |
| `fix`      | Corrección de bugs      | `fix(user): resolve password validation issue`       |
| `docs`     | Documentación           | `docs: update API documentation`                     |
| `style`    | Cambios de formato      | `style: fix code formatting`                         |
| `refactor` | Refactoring             | `refactor(services): improve user service structure` |
| `perf`     | Mejoras de performance  | `perf(db): optimize user queries`                    |
| `test`     | Tests                   | `test(auth): add JWT service tests`                  |
| `chore`    | Tareas de mantenimiento | `chore: update dependencies`                         |
| `ci`       | CI/CD                   | `ci: add GitHub Actions workflow`                    |
| `build`    | Build system            | `build: update webpack config`                       |
| `revert`   | Revertir commits        | `revert: revert feat(auth): add JWT`                 |

## 🎯 Ámbitos Sugeridos

- `auth` - Autenticación y autorización
- `user` - Gestión de usuarios
- `api` - Endpoints de API
- `db` - Base de datos
- `config` - Configuración
- `middleware` - Middlewares
- `services` - Servicios de negocio
- `utils` - Utilidades
- `types` - Tipos de TypeScript
- `tests` - Archivos de test

## ✅ Ejemplos Correctos

```bash
feat(auth): implement JWT token refresh mechanism
fix(user): resolve email validation in registration
docs(api): add OpenAPI documentation for user endpoints
test(services): add comprehensive user service tests
refactor(middleware): improve error handling structure
perf(db): optimize user query with proper indexing
```

## ❌ Ejemplos Incorrectos

```bash
# Muy vago
fix: bug fix

# Sin tipo
update user service

# Descripción muy larga
feat(auth): implement a very comprehensive JWT authentication system with refresh tokens, blacklisting, and advanced security features

# Mayúsculas incorrectas
Feat(auth): Add JWT authentication
```

## 🔧 Herramientas

- **Commitlint**: Valida automáticamente el formato de commits
- **Husky**: Ejecuta validaciones antes de cada commit
- **Lint-staged**: Ejecuta linting y formatting automáticamente

## 🚀 Flujo de Trabajo

1. Realiza tus cambios
2. Ejecuta `git add .`
3. Ejecuta `git commit -m "tipo(ámbito): descripción"`
4. Husky validará automáticamente:
   - Formato del commit
   - Linting del código
   - Formatting del código
   - Tests (si están configurados)

## 📚 Recursos

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitlint Rules](https://commitlint.js.org/#/reference-rules)
- [Semantic Versioning](https://semver.org/)
