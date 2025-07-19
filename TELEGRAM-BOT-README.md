# 🤖 Bot de Telegram con IA - HERRAMIENTA DE DESARROLLO

> **⚠️ IMPORTANTE: Esta es una herramienta de desarrollo. NO debe estar en producción.**

## 🎯 **Propósito**

Este bot de Telegram es una **herramienta de desarrollo** que permite a los desarrolladores:

- 💬 Chatear directamente con IA como en Kiro IDE
- 📊 Consultar el estado de las tasks del proyecto
- 🔄 Recibir notificaciones del sistema automático de GitHub Issues
- 🎯 Usar comandos especializados para desarrollo

## 🚫 **NO ES PARA PRODUCCIÓN**

### ❌ **Lo que NO debe hacer:**

- NO incluir este bot en la rama `main`
- NO desplegar en producción
- NO usar para usuarios finales del sistema

### ✅ **Lo que SÍ debe hacer:**

- Usar SOLO en ramas de desarrollo (`dev`, `feature/*`)
- Usar como herramienta personal de desarrollo
- Mantener en entorno de desarrollo

## 🏗️ **Arquitectura de Ramas**

```
main (PRODUCCIÓN)
├── ❌ Sin bot de Telegram
├── ❌ Sin sistema de IA automático
├── ❌ Sin herramientas de desarrollo
└── ✅ Solo código del sistema principal

dev (DESARROLLO)
├── ✅ Bot de Telegram completo
├── ✅ Sistema de IA 24/7
├── ✅ GitHub Actions para IA
└── ✅ Todas las herramientas de desarrollo
```

## 🚀 **Configuración Rápida**

### 1. **Crear Bot en Telegram**

```bash
# 1. Buscar @BotFather en Telegram
# 2. Enviar /newbot
# 3. Seguir instrucciones
# 4. Copiar token
```

### 2. **Configurar Automáticamente**

```bash
./setup-telegram-bot.sh
```

### 3. **Ejecutar Bot**

```bash
npm start
```

## 💬 **Funcionalidades del Bot**

### **Chat Directo con IA**

```
Usuario: ¿Puedes ayudarme a crear una función de validación?
Bot: [Respuesta de IA usando Groq/Gemini/etc.]
```

### **Consultas sobre el Proyecto**

```
Usuario: ¿Cuántas tasks tenemos completadas?
Bot: 📊 Estadísticas del Proyecto
     Total: 150 tasks
     ✅ Completadas: 120 (80%)
     🔄 En progreso: 5
     ⏳ Pendientes: 25
```

### **Comandos Especializados**

- `/code` - Consultas de programación
- `/design` - Consultas de diseño
- `/content` - Generación de contenido
- `/analyze` - Análisis de código
- `/tasks` - Estado de tasks
- `/status` - Estado del sistema

### **Sistema Automático (GitHub Issues)**

- Procesa issues con label "ai-request" cada 5 minutos
- Envía notificaciones automáticas cuando se completan
- Mantiene toda la funcionalidad existente

## 💰 **Costo**

**$0.00 siempre** - Usa solo APIs gratuitas:

- Groq: 14,400 requests/día GRATIS
- Google Gemini: 1,500 requests/día GRATIS
- HuggingFace: 24,000 requests/día GRATIS
- GitHub Actions: 2,000 minutos/mes GRATIS

## 🔒 **Seguridad**

- API keys almacenadas como GitHub Secrets
- No hay API keys hardcodeadas en el código
- Tokens de Telegram protegidos
- Solo funciona en ramas de desarrollo

## 🧪 **Testing**

```bash
# Test sin Telegram real
npm run test

# Test de funcionalidades
node test-telegram-bot.js

# Demo del sistema
npm run demo
```

## 📋 **Archivos del Bot**

```
telegram-bot.js           # Bot principal
setup-telegram-bot.sh     # Configuración automática
test-telegram-bot.js      # Tests del bot
package.json              # Dependencias
.gitignore.production     # Archivos excluidos de producción
```

## ⚠️ **Recordatorio Final**

**Este bot es una HERRAMIENTA DE DESARROLLO.**

- ✅ Úsalo en `dev` y `feature/*`
- ❌ NO lo incluyas en `main`
- ✅ Perfecto para desarrollo y testing
- ❌ NO es parte del producto final

¡Disfruta desarrollando con tu asistente de IA personal! 🚀
