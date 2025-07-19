#!/usr/bin/env node

/**
 * Script para iniciar el bot de Telegram en background
 */

require('dotenv').config();
const ProjectTelegramBot = require('./telegram-bot.js');

console.log('🚀 Iniciando Bot de Telegram con IA...');
console.log('📱 Token configurado:', process.env.TELEGRAM_BOT_TOKEN ? '✅' : '❌');
console.log('💬 Chat ID configurado:', process.env.TELEGRAM_CHAT_ID ? '✅' : '❌');
console.log('🤖 Groq API configurado:', process.env.GROQ_API_KEY ? '✅' : '❌');
console.log('');

try {
  // Inicializar bot
  const bot = new ProjectTelegramBot();

  console.log('🎉 ¡Bot iniciado exitosamente!');
  console.log('');
  console.log('💬 Funcionalidades disponibles:');
  console.log('  ✅ Chat directo con IA (como Kiro IDE)');
  console.log('  ✅ Consultas sobre tasks: "¿cuántas tasks tenemos?"');
  console.log('  ✅ Comandos: /status, /tasks, /code, /design, /content');
  console.log('  ✅ Sistema automático de GitHub Issues (cada 5 min)');
  console.log('  ✅ Notificaciones automáticas');
  console.log('');
  console.log('💰 Costo total: $0.00');
  console.log('');
  console.log('📱 Ve a Telegram y envía /start a tu bot para comenzar');
  console.log('🔄 El bot está corriendo... (Ctrl+C para detener)');

  // Enviar notificación de inicio
  setTimeout(() => {
    ProjectTelegramBot.sendNotification(`🚀 **Bot de IA Iniciado**

✅ Sistema operativo
💬 Chat directo con IA disponible
📊 Consultas sobre tasks habilitadas
🔄 Sistema automático de GitHub Issues activo

**Comandos disponibles:**
/start - Ayuda
/tasks - Estado de tasks
/status - Estado del sistema
/code - Consultas de código
/design - Consultas de diseño
/content - Generación de contenido

💰 Costo: $0.00
🤖 ¡Listo para chatear!`);
  }, 2000);
} catch (error) {
  console.error('❌ Error iniciando bot:', error.message);
  process.exit(1);
}

// Manejar cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo bot...');
  ProjectTelegramBot.sendNotification('🛑 Bot de IA detenido\n\nSistema pausado temporalmente.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo bot...');
  process.exit(0);
});
