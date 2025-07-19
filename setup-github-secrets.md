# 🔐 Configuración de GitHub Secrets para AI System 24/7

Para que el sistema funcione automáticamente, necesitas configurar estos secrets en tu repositorio de GitHub.

## 📋 **Secrets Requeridos:**

### 1. **GROQ_API_KEY** ✅ (Ya tienes)

```
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
```

### 2. **GOOGLE_API_KEY** (Opcional - para más capacidad)

```bash
# 1. Ir a: https://makersuite.google.com/app/apikey
# 2. Crear API Key
# 3. Copiar la key que empieza con: AIza...
```

### 3. **HUGGINGFACE_API_KEY** (Opcional - para más capacidad)

```bash
# 1. Registrarse en: https://huggingface.co/join
# 2. Ir a: https://huggingface.co/settings/tokens
# 3. Crear token que empieza con: hf_...
```

### 4. **COHERE_API_KEY** (Opcional - para más capacidad)

```bash
# 1. Registrarse en: https://dashboard.cohere.ai/register
# 2. Ir a API Keys
# 3. Copiar la key que empieza con: co_...
```

### 5. **TELEGRAM_BOT_TOKEN** (Opcional - para notificaciones)

```bash
# 1. Hablar con @BotFather en Telegram
# 2. Crear bot con /newbot
# 3. Copiar el token
```

### 6. **TELEGRAM_CHAT_ID** (Opcional - para notificaciones)

```bash
# 1. Agregar tu bot a un chat
# 2. Enviar mensaje al bot
# 3. Ir a: https://api.telegram.org/bot<TOKEN>/getUpdates
# 4. Buscar "chat":{"id": TU_CHAT_ID
```

## 🛠️ **Cómo configurar los secrets:**

### Opción 1: Interfaz Web de GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Agregar cada secret con su nombre y valor

### Opción 2: GitHub CLI (más rápido)

```bash
# Configurar Groq (ya tienes la key)
gh secret set GROQ_API_KEY --body "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"

# Si tienes las otras APIs:
gh secret set GOOGLE_API_KEY --body "TU_GOOGLE_API_KEY"
gh secret set HUGGINGFACE_API_KEY --body "TU_HUGGINGFACE_API_KEY"
gh secret set COHERE_API_KEY --body "TU_COHERE_API_KEY"

# Para notificaciones Telegram (opcional):
gh secret set TELEGRAM_BOT_TOKEN --body "TU_BOT_TOKEN"
gh secret set TELEGRAM_CHAT_ID --body "TU_CHAT_ID"
```

## 🎯 **Cómo usar el sistema:**

### 1. **Crear request de IA:**

```bash
# Crear issue con label 'ai-request'
gh issue create --title "Generar función de validación de email" --body "Necesito una función JavaScript que valide emails usando regex" --label "ai-request"
```

### 2. **El sistema automáticamente:**

- ✅ Detecta el issue cada 5 minutos
- 🤖 Procesa con IA gratuita (Groq)
- 💬 Agrega respuesta como comentario
- 🏷️ Cambia label a 'ai-completed'
- 📱 Notifica por Telegram (si configurado)

### 3. **Monitorear el sistema:**

- El sistema crea un issue de estado automáticamente
- Se actualiza cada 5 minutos
- Muestra estadísticas y capacidad restante

## 💰 **Costos:**

- **GitHub Actions:** GRATIS (2,000 min/mes)
- **APIs de IA:** GRATIS (Groq: 14,400 req/día)
- **Hosting:** GRATIS (GitHub Pages)
- **Total:** $0.00 siempre

## 🚀 **Capacidad del sistema:**

- **Ejecuciones:** Cada 5 minutos = 288 ejecuciones/día
- **Requests IA:** ~43,233 requests/día GRATIS
- **Disponibilidad:** 24/7/365
- **Costo:** $0.00

¡El sistema estará listo para funcionar automáticamente una vez que configures los secrets!
