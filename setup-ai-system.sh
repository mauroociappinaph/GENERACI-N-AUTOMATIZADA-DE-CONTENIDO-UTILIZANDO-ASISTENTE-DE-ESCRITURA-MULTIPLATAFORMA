#!/bin/bash

# 🚀 Setup script para AI Content Processor 24/7
# Configura automáticamente el sistema de IA gratuito

echo "🤖 AI Content Processor 24/7 - Setup Script"
echo "============================================="
echo ""

# Verificar si GitHub CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI no está instalado"
    echo "📥 Instalar desde: https://cli.github.com/"
    exit 1
fi

# Verificar autenticación con GitHub
if ! gh auth status &> /dev/null; then
    echo "🔐 Necesitas autenticarte con GitHub CLI"
    echo "🚀 Ejecuta: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI configurado correctamente"
echo ""

# Configurar secret de Groq (ya tienes la key)
echo "🔑 Configurando API key de Groq..."
gh secret set GROQ_API_KEY --body "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"
echo "✅ GROQ_API_KEY configurado"

# Preguntar por otras APIs opcionales
echo ""
echo "🎯 APIs adicionales (opcionales para más capacidad):"
echo ""

read -p "¿Tienes Google Gemini API key? (y/n): " has_google
if [[ $has_google == "y" || $has_google == "Y" ]]; then
    read -p "Ingresa tu Google API key (AIza...): " google_key
    if [[ $google_key == AIza* ]]; then
        gh secret set GOOGLE_API_KEY --body "$google_key"
        echo "✅ GOOGLE_API_KEY configurado"
    else
        echo "⚠️ API key de Google inválida (debe empezar con AIza)"
    fi
fi

read -p "¿Tienes HuggingFace API key? (y/n): " has_hf
if [[ $has_hf == "y" || $has_hf == "Y" ]]; then
    read -p "Ingresa tu HuggingFace token (hf_...): " hf_key
    if [[ $hf_key == hf_* ]]; then
        gh secret set HUGGINGFACE_API_KEY --body "$hf_key"
        echo "✅ HUGGINGFACE_API_KEY configurado"
    else
        echo "⚠️ Token de HuggingFace inválido (debe empezar con hf_)"
    fi
fi

read -p "¿Tienes Cohere API key? (y/n): " has_cohere
if [[ $has_cohere == "y" || $has_cohere == "Y" ]]; then
    read -p "Ingresa tu Cohere API key: " cohere_key
    gh secret set COHERE_API_KEY --body "$cohere_key"
    echo "✅ COHERE_API_KEY configurado"
fi

# Configurar Telegram (opcional)
echo ""
read -p "¿Quieres configurar notificaciones de Telegram? (y/n): " setup_telegram
if [[ $setup_telegram == "y" || $setup_telegram == "Y" ]]; then
    echo "📱 Para configurar Telegram:"
    echo "1. Habla con @BotFather en Telegram"
    echo "2. Crea un bot con /newbot"
    echo "3. Copia el token del bot"
    echo ""
    read -p "Ingresa el token del bot de Telegram: " telegram_token
    gh secret set TELEGRAM_BOT_TOKEN --body "$telegram_token"

    echo ""
    echo "4. Agrega tu bot a un chat"
    echo "5. Envía un mensaje al bot"
    echo "6. Ve a: https://api.telegram.org/bot$telegram_token/getUpdates"
    echo "7. Busca 'chat':{'id': TU_CHAT_ID"
    echo ""
    read -p "Ingresa tu Chat ID: " chat_id
    gh secret set TELEGRAM_CHAT_ID --body "$chat_id"

    echo "✅ Telegram configurado"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📊 Resumen del sistema:"
echo "- ✅ Groq API configurado (14,400 req/día GRATIS)"
echo "- 🔄 GitHub Action se ejecutará cada 5 minutos"
echo "- 💰 Costo total: $0.00"
echo "- 🚀 Capacidad: ~43,233 requests/día (con todas las APIs)"
echo ""
echo "🎯 Cómo usar:"
echo "1. Crear issue con label 'ai-request'"
echo "2. El sistema procesará automáticamente cada 5 minutos"
echo "3. Recibirás la respuesta como comentario en el issue"
echo ""
echo "📋 Ejemplo de uso:"
echo 'gh issue create --title "Crear función de validación" --body "Necesito validar emails" --label "ai-request"'
echo ""
echo "🔍 Monitorear el sistema:"
echo "- El sistema creará un issue de estado automáticamente"
echo "- Se actualiza cada 5 minutos con estadísticas"
echo ""
echo "✨ ¡Tu sistema de IA 24/7 está listo!"
