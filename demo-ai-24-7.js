/**
 * Demo del sistema de IA 24/7 - Simulación local
 * Muestra cómo funcionará el GitHub Action automáticamente
 */

const FreeAISystem = require('./free-ai-system.js');

// Configurar tu API key de Groq (usar variable de entorno)
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'TU_GROQ_API_KEY_AQUI';

// Simular issues de GitHub con requests de IA
const mockIssues = [
  {
    number: 1,
    title: 'Crear función de validación de contraseñas seguras',
    body: 'Necesito una función JavaScript que valide que las contraseñas tengan al menos 8 caracteres, mayúsculas, minúsculas, números y símbolos.',
    labels: [{ name: 'ai-request' }],
  },
  {
    number: 2,
    title: 'Diseñar schema de base de datos para sistema de comentarios',
    body: 'Necesito el diseño de tablas para un sistema de comentarios anidados con likes, respuestas y moderación.',
    labels: [{ name: 'ai-request' }],
  },
  {
    number: 3,
    title: 'Generar contenido para blog sobre IA en desarrollo',
    body: 'Escribir un artículo de 500 palabras sobre cómo la IA está transformando el desarrollo de software en 2024.',
    labels: [{ name: 'ai-request' }],
  },
  {
    number: 4,
    title: 'Crear componente React para dashboard de métricas',
    body: 'Necesito un componente React que muestre métricas en tiempo real con gráficos y sea responsive.',
    labels: [{ name: 'ai-request' }],
  },
];

async function simulateGitHubAction() {
  console.log('🚀 Simulando GitHub Action - AI Content Processor 24/7\n');
  console.log('⏰ Esta simulación muestra cómo funcionará automáticamente cada 5 minutos\n');

  const aiSystem = new FreeAISystem();

  // Mostrar estadísticas iniciales
  console.log('📊 Estado inicial del sistema:');
  const initialStats = aiSystem.getStats();
  console.log(`- Proveedores activos: ${initialStats.activeProviders}/${initialStats.totalProviders}`);
  console.log(`- Capacidad diaria: ${initialStats.dailyCapacity.toLocaleString()} requests GRATIS`);
  console.log(`- Costo: $${initialStats.cost}\n`);

  console.log(`🔍 Encontrados ${mockIssues.length} issues con label 'ai-request'\n`);

  // Procesar cada issue (máximo 3 por ejecución como en el GitHub Action)
  const issuesToProcess = mockIssues.slice(0, 3);

  for (let i = 0; i < issuesToProcess.length; i++) {
    const issue = issuesToProcess[i];
    console.log(`🤖 [${i + 1}/${issuesToProcess.length}] Procesando issue #${issue.number}`);
    console.log(`📋 Título: ${issue.title}`);

    try {
      // Determinar tipo de request
      let requestType = 'general_assistance';
      const title = issue.title.toLowerCase();
      const body = issue.body.toLowerCase();

      if (title.includes('database') || title.includes('schema') || body.includes('sql')) {
        requestType = 'database_design';
      } else if (title.includes('frontend') || title.includes('component') || title.includes('react')) {
        requestType = 'code_generation';
      } else if (title.includes('content') || title.includes('blog') || title.includes('article')) {
        requestType = 'content_generation';
      } else if (title.includes('función') || title.includes('validación') || body.includes('javascript')) {
        requestType = 'code_generation';
      }

      console.log(`🎯 Tipo detectado: ${requestType}`);

      // Crear request para IA
      const aiRequest = {
        type: requestType,
        prompt: `Título: ${issue.title}\n\nDescripción: ${issue.body}\n\nTipo de tarea: ${requestType}\n\nPor favor, proporciona una respuesta detallada y práctica.`,
        issueId: issue.number,
      };

      // Procesar con sistema de IA
      console.log('⚡ Enviando a sistema de IA...');
      const result = await aiSystem.distributeRequest(aiRequest);

      if (result && !result.includes('encolado')) {
        console.log('✅ Procesado exitosamente!');
        console.log('📝 Respuesta generada:');
        console.log('─'.repeat(50));
        console.log(result.substring(0, 300) + '...');
        console.log('─'.repeat(50));

        // Simular acciones de GitHub
        console.log('🔄 Acciones automáticas:');
        console.log('  ✅ Comentario agregado al issue');
        console.log('  🏷️  Label cambiado: ai-request → ai-completed');
        console.log('  📱 Notificación enviada a Telegram');
        console.log('  💰 Costo: $0.00');
      } else {
        console.log('⏳ Request encolado para próxima ejecución');
      }
    } catch (error) {
      console.log(`❌ Error procesando issue #${issue.number}:`, error.message);
      console.log('🔄 Se agregará comentario de error y se reintentará en 5 minutos');
    }

    console.log('\n' + '═'.repeat(60) + '\n');
  }

  // Mostrar estadísticas finales
  console.log('📊 Estado final del sistema:');
  const finalStats = aiSystem.getStats();
  console.log(`- Requests procesados: ${finalStats.usedToday}`);
  console.log(`- Capacidad restante hoy: ${finalStats.remainingToday.toLocaleString()}`);
  console.log(`- Costo total: $${finalStats.cost}`);
  console.log(`- Próxima ejecución: 5 minutos\n`);

  // Simular estado del sistema
  console.log('🤖 Estado del sistema 24/7:');
  console.log('─'.repeat(40));
  console.log(`⏰ Última ejecución: ${new Date().toLocaleString()}`);
  console.log('✅ Estado: Operativo');
  console.log('🔄 Próxima ejecución: 5 minutos');
  console.log('💰 Presupuesto usado: $0.00/$0.00');
  console.log('📈 Ejecuciones hoy: 1/288');
  console.log('🚀 Disponibilidad: 24/7/365');
  console.log('─'.repeat(40));

  console.log('\n🎉 Simulación completada!');
  console.log('💡 Para activar el sistema real:');
  console.log('   1. Configurar secrets en GitHub');
  console.log('   2. Hacer push del workflow');
  console.log('   3. Crear issues con label "ai-request"');
  console.log('   4. ¡El sistema procesará automáticamente cada 5 minutos!');
}

// Ejecutar simulación
simulateGitHubAction().catch(console.error);
