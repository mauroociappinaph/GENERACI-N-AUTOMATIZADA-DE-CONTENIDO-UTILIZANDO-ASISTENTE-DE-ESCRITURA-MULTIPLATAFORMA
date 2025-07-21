# 🔧 Hooks Template Guide

## 📋 **Cómo usar estos hooks en otros proyectos**

### **Paso 1: Copiar archivos de hooks**

```bash
# Copiar todos los hooks a nuevo proyecto
cp -r .kiro/hooks/* /path/to/new-project/.kiro/hooks/
```

### **Paso 2: Adaptar configuraciones**

#### **Variables a cambiar en cada hook:**

##### **GitHub Issue Generator:**

```json
// Cambiar estos paths según tu estructura de proyecto:
"patterns": [
  "**/tasks.md",           // → Tu archivo de tareas
  "**/requirements.md",    // → Tu archivo de requerimientos
  "**/*.test.ts",         // → Extensión de tus tests
  "**/package.json"       // → Mantener igual
]
```

##### **Pre-commit Quality Check:**

```bash
# Adaptar comandos según tu stack:
# Backend
cd YOUR_BACKEND_FOLDER    # Cambiar "Req/backend"
npm run lint              # O yarn lint, pnpm lint
npm run test              # Tu comando de tests
npm run build             # Tu comando de build

# Frontend
cd YOUR_FRONTEND_FOLDER   # Cambiar "Req/frontend"
npm run lint              # Tu linter
npm run build             # Tu build command
```

##### **Branch Management:**

```bash
# Adaptar nombres de ramas según tu estrategia:
- main/master             # Tu rama principal
- dev/develop            # Tu rama de desarrollo
- feature/*              # Tu patrón de features
- hotfix/*               # Tu patrón de hotfixes
```

### **Paso 3: Configurar para diferentes IDEs**

#### **Para VS Code:**

```json
// .vscode/settings.json
{
  "kiro.hooks.enabled": true,
  "kiro.hooks.autoTrigger": true,
  "kiro.hooks.path": ".kiro/hooks"
}
```

#### **Para otros IDEs (Genérico):**

```bash
# Crear script ejecutable
#!/bin/bash
# run-hooks.sh

HOOK_DIR=".kiro/hooks"
TRIGGER_TYPE=$1
FILE_PATTERN=$2

# Buscar hooks que coincidan con el trigger
for hook in $HOOK_DIR/*.kiro.hook; do
    # Leer configuración del hook
    HOOK_TRIGGER=$(jq -r '.when.type' "$hook")

    if [ "$HOOK_TRIGGER" = "$TRIGGER_TYPE" ]; then
        echo "Ejecutando hook: $(basename $hook)"
        # Ejecutar lógica del hook
    fi
done
```

### **Paso 4: Configuración por tipo de proyecto**

#### **Para proyectos React/Next.js:**

```json
// Adaptar extensiones de archivos
"patterns": [
  "**/*.tsx",
  "**/*.jsx",
  "**/*.ts",
  "**/*.js"
]

// Comandos específicos
"npm run dev"      // Desarrollo
"npm run build"    // Build
"npm run lint"     // Linting
"npm run test"     // Tests
```

#### **Para proyectos Vue:**

```json
"patterns": [
  "**/*.vue",
  "**/*.ts",
  "**/*.js"
]

// Comandos Vue
"npm run serve"    // Desarrollo
"npm run build"    // Build
"npm run lint"     // Linting
"npm run test:unit" // Tests
```

#### **Para proyectos Python/Django:**

```json
"patterns": [
  "**/*.py",
  "**/requirements.txt",
  "**/manage.py"
]

// Comandos Python
"python manage.py test"     // Tests
"flake8 ."                 // Linting
"black ."                  // Formatting
"python manage.py migrate" // Migrations
```

#### **Para proyectos .NET:**

```json
"patterns": [
  "**/*.cs",
  "**/*.csproj",
  "**/*.sln"
]

// Comandos .NET
"dotnet test"      // Tests
"dotnet build"     // Build
"dotnet run"       // Run
```

### **Paso 5: Variables de entorno configurables**

```bash
# .env.hooks (crear en cada proyecto)
PROJECT_NAME="Mi Nuevo Proyecto"
BACKEND_DIR="src/backend"
FRONTEND_DIR="src/frontend"
TEST_COMMAND="npm test"
BUILD_COMMAND="npm run build"
LINT_COMMAND="npm run lint"

# GitHub configuración
GITHUB_REPO="usuario/mi-repo"
GITHUB_OWNER="usuario"
DEFAULT_BRANCH="main"
DEV_BRANCH="develop"
```

### **Paso 6: Script de instalación automática**

```bash
#!/bin/bash
# install-hooks.sh

echo "🔧 Instalando Kiro Hooks System..."

# Crear estructura de directorios
mkdir -p .kiro/hooks
mkdir -p .kiro/specs
mkdir -p .kiro/steering

# Copiar hooks template
cp -r /path/to/hooks-template/* .kiro/hooks/

# Configurar para el proyecto actual
echo "📝 Configurando para este proyecto..."

# Detectar tipo de proyecto
if [ -f "package.json" ]; then
    PROJECT_TYPE="nodejs"
    echo "✅ Proyecto Node.js detectado"
elif [ -f "requirements.txt" ]; then
    PROJECT_TYPE="python"
    echo "✅ Proyecto Python detectado"
elif [ -f "*.csproj" ]; then
    PROJECT_TYPE="dotnet"
    echo "✅ Proyecto .NET detectado"
fi

# Adaptar hooks según tipo de proyecto
case $PROJECT_TYPE in
    "nodejs")
        sed -i 's/YOUR_BACKEND_FOLDER/backend/g' .kiro/hooks/*.kiro.hook
        sed -i 's/YOUR_FRONTEND_FOLDER/frontend/g' .kiro/hooks/*.kiro.hook
        ;;
    "python")
        sed -i 's/npm run test/python -m pytest/g' .kiro/hooks/*.kiro.hook
        sed -i 's/npm run lint/flake8 ./g' .kiro/hooks/*.kiro.hook
        ;;
    "dotnet")
        sed -i 's/npm run test/dotnet test/g' .kiro/hooks/*.kiro.hook
        sed -i 's/npm run build/dotnet build/g' .kiro/hooks/*.kiro.hook
        ;;
esac

echo "✅ Hooks instalados y configurados!"
echo "📋 Revisa .kiro/hooks/ para ajustes específicos"
```

## 🎯 **Hacer el Design.md Portable**

### **Template de Design Document:**

````bash
#!/bin/bash
# generate-design-template.sh

echo "📋 Generando template de design document..."

cat > DESIGN_TEMPLATE.md << 'EOF'
# Design Document - {{PROJECT_NAME}}

## Overview

{{PROJECT_DESCRIPTION}}

## Architecture

### General Architecture

```mermaid
graph TB
    A[{{CLIENT_TYPE}}] --> B[Load Balancer]
    B --> C[{{FRONTEND_FRAMEWORK}}]
    C --> D[{{BACKEND_FRAMEWORK}}]
    D --> E[Auth Service]
    D --> F[Data Service]
    D --> G[{{ADDITIONAL_SERVICES}}]

    E --> H[({{DATABASE_TYPE}})]
    F --> H
    G --> I[{{EXTERNAL_SERVICES}}]
````

### Development and Deployment Architecture

#### Branching Strategy

```mermaid
gitGraph
    commit id: "Initial"
    branch {{DEV_BRANCH}}
    checkout {{DEV_BRANCH}}
    commit id: "Feature 1"
    commit id: "Feature 2"
    branch feature/{{SAMPLE_FEATURE}}
    checkout feature/{{SAMPLE_FEATURE}}
    commit id: "Implementation"
    commit id: "Tests"
    checkout {{DEV_BRANCH}}
    merge feature/{{SAMPLE_FEATURE}}
    commit id: "Integration tests"
    checkout {{MAIN_BRANCH}}
    merge {{DEV_BRANCH}}
    commit id: "Production Release v1.0"
```

#### Branch Management Rules

- **{{MAIN_BRANCH}}**: Production-ready code, always stable and deployable
- **{{DEV_BRANCH}}**: Integration branch for development, staging environment
- **feature/**: Individual features, created from {{DEV_BRANCH}}, merged back to {{DEV_BRANCH}}
- **hotfix/**: Emergency fixes, created from {{MAIN_BRANCH}}, merged to both {{MAIN_BRANCH}} and {{DEV_BRANCH}}

### Selected Technologies

**Frontend:**

- Framework: {{FRONTEND_FRAMEWORK}}
- Styling: {{CSS_FRAMEWORK}}
- State Management: {{STATE_MANAGEMENT}}
- Build Tool: {{BUILD_TOOL}}

**Backend:**

- Framework: {{BACKEND_FRAMEWORK}}
- Database: {{DATABASE_TYPE}}
- ORM: {{ORM_TOOL}}
- API Documentation: {{API_DOCS_TOOL}}

**Infrastructure:**

- Containers: {{CONTAINER_TECH}}
- Deployment: {{DEPLOYMENT_PLATFORM}}
- Monitoring: {{MONITORING_TOOLS}}
- CI/CD: {{CICD_PLATFORM}}

**Project Management Integration:**

- Issues: {{ISSUE_TRACKER}}
- Project Board: {{PROJECT_BOARD}}
- CI/CD: {{CICD_INTEGRATION}}
- API Integration: {{API_INTEGRATION}}

EOF

echo "✅ Template creado en DESIGN_TEMPLATE.md"

````

### **Script de configuración de proyecto:**

```bash
#!/bin/bash
# configure-project.sh

echo "🎯 Configurando proyecto con design template..."

# Solicitar información del proyecto
read -p "📝 Nombre del proyecto: " PROJECT_NAME
read -p "📝 Descripción: " PROJECT_DESCRIPTION
read -p "🎨 Framework frontend (React/Vue/Angular): " FRONTEND_FRAMEWORK
read -p "⚙️ Framework backend (Express/Django/Spring): " BACKEND_FRAMEWORK
read -p "🗄️ Base de datos (PostgreSQL/MySQL/MongoDB): " DATABASE_TYPE
read -p "🌿 Rama principal (main/master): " MAIN_BRANCH
read -p "🔧 Rama de desarrollo (dev/develop): " DEV_BRANCH

# Reemplazar variables en template
sed -e "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" \
    -e "s/{{PROJECT_DESCRIPTION}}/$PROJECT_DESCRIPTION/g" \
    -e "s/{{FRONTEND_FRAMEWORK}}/$FRONTEND_FRAMEWORK/g" \
    -e "s/{{BACKEND_FRAMEWORK}}/$BACKEND_FRAMEWORK/g" \
    -e "s/{{DATABASE_TYPE}}/$DATABASE_TYPE/g" \
    -e "s/{{MAIN_BRANCH}}/$MAIN_BRANCH/g" \
    -e "s/{{DEV_BRANCH}}/$DEV_BRANCH/g" \
    DESIGN_TEMPLATE.md > design.md

echo "✅ Design document creado: design.md"
````

## 📦 **Crear Package Reutilizable**

### **Estructura del package:**

```
kiro-hooks-system/
├── hooks/
│   ├── *.kiro.hook           # Todos los hooks
│   └── templates/            # Templates por tecnología
├── docs/
│   ├── DESIGN_TEMPLATE.md    # Template de design
│   └── README.md             # Documentación
├── scripts/
│   ├── install.sh            # Instalación automática
│   ├── configure.sh          # Configuración por proyecto
│   └── migrate.sh            # Migración entre proyectos
├── config/
│   ├── nodejs.json           # Config para Node.js
│   ├── python.json           # Config para Python
│   └── dotnet.json           # Config para .NET
└── package.json              # Metadata del package
```

### **Publicar como NPM package:**

```bash
# Crear package.json
{
  "name": "@tu-usuario/kiro-hooks-system",
  "version": "1.0.0",
  "description": "Sistema de hooks reutilizable para Kiro IDE",
  "main": "index.js",
  "bin": {
    "install-kiro-hooks": "./scripts/install.sh",
    "configure-kiro-project": "./scripts/configure.sh"
  },
  "keywords": ["kiro", "hooks", "automation", "development"],
  "author": "Tu Nombre",
  "license": "MIT"
}

# Publicar
npm publish
```

### **Uso en otros proyectos:**

```bash
# Instalar el package
npm install -g @tu-usuario/kiro-hooks-system

# Usar en nuevo proyecto
cd mi-nuevo-proyecto
install-kiro-hooks
configure-kiro-project

# ¡Listo! Hooks configurados automáticamente
```

## 🎯 **¿Quieres que cree el sistema completo de portabilidad?**

Puedo crear:

1. **Scripts de instalación** automática
2. **Templates configurables** por tecnología
3. **Package reutilizable** para NPM
4. **Documentación completa** de uso

¿Te parece útil? ¿Por cuál empezamos?
