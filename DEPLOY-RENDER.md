# 🚀 Desplegar Bot de Telegram en Render.com - 24/7 GRATIS

## 📋 **Pasos para Despliegue**

### 1. **Crear cuenta en Render.com**

- Ve a: https://render.com
- Regístrate con tu cuenta de GitHub
- Es 100% GRATIS (750 horas/mes = 24/7)

### 2. **Conectar tu repositorio**

- En Render Dashboard, click "New +"
- Selecciona "Web Service"
- Conecta tu repositorio de GitHub
- Selecciona la rama: `ai-system-clean`

### 3. **Configurar el servicio**

```
Name: telegram-ai-bot-24-7
Environment: Node
Region: Oregon (US West)
Branch: ai-system-clean
Build Command: npm install
Start Command: node telegram-bot.js
```

### 4. **Configurar Variables de Entorno**

En la sección "Environment Variables" agregar:

```
TELEGRAM_BOT_TOKEN = 7624885642:AAErBCaKbHdtWXcZo8kRDHoxbY82nU6F-3w
TELEGRAM_CHAT_ID = 7938805278
GROQ_API_KEY = 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
NODE_ENV = production
```

### 5. **Configurar Plan**

- Selecciona: **Free Plan** (750 horas/mes)
- Auto-Deploy: **Enabled**

### 6. **Deploy**

- Click "Create Web Service"
- Render automáticamente:
  - Clona tu repositorio
  - Ejecuta `npm install`
  - Inicia `node telegram-bot.js`
  - Asigna una URL pública

## ✅ **Resultado**

Una vez desplegado:

- ✅ Bot funcionando 24/7
- ✅ No depende de tu PC
- ✅ Se reinicia automáticamente si hay errores
- ✅ Actualizaciones automáticas cuando haces push
- ✅ Logs en tiempo real
- ✅ Costo: $0.00

## 🔍 **Monitoreo**

### **Ver Logs:**

- En Render Dashboard → tu servicio → "Logs"
- Verás mensajes como:

```
🤖 Bot de Telegram iniciado - Modo Dual
✅ Funcionalidad GitHub Issues: ACTIVA
✅ Chat directo con IA: ACTIVO
💰 Costo: $0.00
🚀 Bot de Telegram iniciado exitosamente
```

### **Estado del Servicio:**

- Verde = Funcionando ✅
- Rojo = Error ❌
- Amarillo = Desplegando 🔄

## 🎯 **Después del Despliegue**

1. **Probar el bot:**

   - Ve a Telegram
   - Envía `/start` a tu bot
   - Debería responder inmediatamente

2. **Verificar funcionalidades:**

   - Chat directo: "Hola, ¿cómo estás?"
   - Tasks: "¿Cuántas tasks tenemos?"
   - Comandos: `/status`, `/tasks`

3. **Sistema automático:**
   - GitHub Actions seguirá procesando issues cada 5 minutos
   - Recibirás notificaciones en Telegram

## 🔧 **Troubleshooting**

### **Si el bot no responde:**

1. Verificar logs en Render
2. Verificar variables de entorno
3. Verificar que el token sea correcto

### **Si hay errores en logs:**

- Render reinicia automáticamente el servicio
- Los errores temporales se resuelven solos
- Logs muestran detalles del problema

## 💰 **Costos**

- **Render.com**: GRATIS (750 horas/mes)
- **APIs de IA**: GRATIS (Groq, Gemini, etc.)
- **GitHub Actions**: GRATIS (2,000 min/mes)
- **Total**: $0.00 siempre

## 🎉 **¡Listo!**

Una vez desplegado, tu bot funcionará 24/7 sin depender de tu PC. Podrás:

- Chatear con IA desde cualquier lugar
- Consultar el estado del proyecto
- Recibir notificaciones automáticas
- Todo con costo $0.00
