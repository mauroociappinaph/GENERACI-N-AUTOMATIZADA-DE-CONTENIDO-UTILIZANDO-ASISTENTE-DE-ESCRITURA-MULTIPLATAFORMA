#!/bin/bash

# 🤖 Setup rápido para Bot de Telegram con IA
# Configura el bot completo en minutos

echo "🤖 Setup Bot de Telegram con IA - Modo Dual"
echo "============================================="
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "📥 Instalar desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI no está instalado"
    echo "📥 Instalar desde: https://cli.github.com/"
    exit 1
fi

echo "✅ GitHub CLI encontrado"

# Configurar bot de Telegram
echo ""
echo "🤖 Configuración del Bot de Telegram"
echo "======================================"
echo ""
echo "📱 Para crear tu bot:"
echo "1. Abre Telegram y busca @BotFather"
echo "2. Envía /newbot"
echo "3. Sigue las instrucciones"
echo "4. Copia el token que te da"
echo ""

read -p "Ingresa el token de tu bot de Telegram: " telegram_token

if [[ -z "$telegram_token" ]]; then
    echo "❌ Token de Telegram requerido"
    exit 1
fi

# Configurar secret en GitHub
gh secret set TELEGRAM_BOT_TOKEN --body "$telegram_token"
echo "✅ TELEGRAM_BOT_TOKEN configurado en GitHub"

# Obtener Chat ID
echo ""
echo "📱 Para obtener tu Chat ID:"
echo "1. Envía un mensaje a tu bot en Telegram"
echo "2. Ve a: https://api.telegram.org/bot$telegram_token/getUpdates"
echo "3. Busca 'chat':{'id': TU_CHAT_ID"
echo ""

read -p "Ingresa tu Chat ID: " chat_id

if [[ -z "$chat_id" ]]; then
    echo "❌ Chat ID requerido"
    exit 1
fi

# Configurar Chat ID en GitHub
gh secret set TELEGRAM_CHAT_ID --body "$chat_id"
echo "✅ TELEGRAM_CHAT_ID configurado en GitHub"

# Verificar API keys de IA
echo ""
echo "🔑 Verificando APIs de IA..."

if gh secret list | grep -q "GROQ_API_KEY"; then
    echo "✅ GROQ_API_KEY ya configurado"
else
    echo "⚠️ GROQ_API_KEY no encontrado"
    read -p "Ingresa tu Groq API key (gsk_...): " groq_key
    if [[ $groq_key == gsk_* ]]; then
        gh secret set GROQ_API_KEY --body "$groq_key"
        echo "✅ GROQ_API_KEY configurado"
    fi
fi

# Crear archivo de configuración local para testing
cat > .env << EOF
TELEGRAM_BOT_TOKEN=$telegram_token
TELEGRAM_CHAT_ID=$chat_id
GROQ_API_KEY=\${GROQ_API_KEY}
EOF

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📊 Resumen del bot:"
echo "- ✅ Bot de Telegram configurado"
echo "- ✅ Chat directo con IA habilitado"
echo "- ✅ Sistema automático de GitHub Issues activo"
echo "- ✅ Consultas sobre tasks del proyecto"
echo "- ✅ Comandos especializados de IA"
echo "- 💰 Costo total: $0.00"
echo ""
echo "🚀 Cómo usar:"
echo "1. Envía /start a tu bot en Telegram"
echo "2. Usa comandos como /tasks, /status, /code"
echo "3. O simplemente escribe cualquier pregunta"
echo ""
echo "🔄 Para activar el sistema automático:"
echo "1. Haz merge de la rama ai-system-clean"
echo "2. El GitHub Action se ejecutará cada 5 minutos"
echo ""
echo "🧪 Para probar localmente:"
echo "export TELEGRAM_BOT_TOKEN='$telegram_token'"
echo "export TELEGRAM_CHAT_ID='$chat_id'"
echo "npm start"
echo ""
echo "✨ ¡Tu bot está listo para usar!"
