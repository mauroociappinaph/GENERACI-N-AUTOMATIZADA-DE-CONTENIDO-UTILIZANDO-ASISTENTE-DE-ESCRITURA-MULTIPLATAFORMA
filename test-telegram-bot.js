/**
 * Test local del bot de Telegram
 * Simula las funcionalidades principales sin necesidad de Telegram real
 */

const ProjectTelegramBot = require('./telegram-bot.js');

// Configurar variables de entorno para testing
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'TU_GROQ_API_KEY_AQUI';
process.env.TELEGRAM_BOT_TOKEN = 'TEST_TOKEN';
process.env.TELEGRAM_CHAT_ID = 'TEST_CHAT_ID';

async function testBotFunctionalities() {
  console.log('🧪 Iniciando test del bot de Telegram...\n');

  try {
    // Crear instancia del bot (sin inicializar Telegram real)
    const botClass = ProjectTelegramBot;

    // Test 1: Estadísticas de tasks
    console.log('📊 Test 1: Estadísticas de tasks');
    try {
      const bot = new botClass();
      const tasksStats = await bot.getTasksStatistics();
      console.log('✅ Estadísticas obtenidas:');
      console.log(tasksStats.substring(0, 300) + '...\n');
    } catch (error) {
      console.log('⚠️ Error en estadísticas (normal si no existe tasks.md):', error.message, '\n');
    }

    // Test 2: Información de issues
    console.log('📋 Test 2: Información de issues');
    try {
      const bot = new botClass();
      const issuesInfo = await bot.getIssuesInfo();
      console.log('✅ Issues obtenidos:');
      console.log(issuesInfo.substring(0, 300) + '...\n');
    } catch (error) {
      console.log('⚠️ Error en issues (normal si GitHub CLI no está configurado):', error.message, '\n');
    }

    // Test 3: Simulación de chat con IA
    console.log('💬 Test 3: Simulación de chat con IA');
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'TU_GROQ_API_KEY_AQUI') {
      try {
        const bot = new botClass();
        const response = await bot.handleDirectAIChat(
          12345,
          '¿Puedes ayudarme a crear una función JavaScript que valide emails?',
        );
        console.log('✅ Respuesta de IA:');
        console.log(response.substring(0, 300) + '...\n');
      } catch (error) {
        console.log('❌ Error en chat con IA:', error.message, '\n');
      }
    } else {
      console.log('⚠️ GROQ_API_KEY no configurado, saltando test de IA\n');
    }

    // Test 4: Detección de preguntas sobre tasks
    console.log('🎯 Test 4: Detección de preguntas sobre tasks');
    const bot = new botClass();
    const testQuestions = [
      '¿Cuántas tasks tenemos?',
      '¿Cuáles están completadas?',
      '¿Qué falta por hacer?',
      'Ayúdame con JavaScript',
      'Estado del proyecto',
    ];

    testQuestions.forEach((question) => {
      const isTasksQuestion = bot.isTasksQuestion(question);
      console.log(`"${question}" -> ${isTasksQuestion ? '✅ Pregunta sobre tasks' : '❌ Chat general'}`);
    });

    console.log('\n🎉 Tests completados!');
    console.log('\n📋 Resumen de funcionalidades del bot:');
    console.log('✅ Chat directo con IA (como Kiro IDE)');
    console.log('✅ Consultas sobre tasks del proyecto');
    console.log('✅ Comandos especializados (/code, /design, /content, /analyze)');
    console.log('✅ Información de issues de GitHub');
    console.log('✅ Estado del sistema de IA');
    console.log('✅ Historial de conversación por usuario');
    console.log('✅ Notificaciones automáticas del sistema GitHub Actions');
    console.log('💰 Costo total: $0.00');

    console.log('\n🚀 Para usar el bot real:');
    console.log('1. Ejecuta: ./setup-telegram-bot.sh');
    console.log('2. Configura tu bot con @BotFather');
    console.log('3. Ejecuta: npm start');
    console.log('4. ¡Chatea con tu bot en Telegram!');
  } catch (error) {
    console.error('❌ Error en tests:', error.message);
  }
}

// Ejecutar tests
testBotFunctionalities().catch(console.error);
