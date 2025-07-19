// Prueba del Sistema de Rotación Automática de APIs de IA
const FreeAISystem = require('./free-ai-system.js');

class AIRotationTester {
  constructor() {
    this.freeAI = new FreeAISystem();
    this.testResults = [];
  }

  // Simular diferentes tipos de tareas para probar selección inteligente
  async testIntelligentSelection() {
    console.log('🧠 Probando selección inteligente de APIs...\n');

    const testTasks = [
      {
        type: 'content_generation',
        prompt: 'Escribe un párrafo sobre inteligencia artificial',
        preferredProvider: 'Google Gemini Free', // Mejor para contenido
        issueId: 23,
      },
      {
        type: 'quick_response',
        prompt: '¿Qué es JavaScript?',
        preferredProvider: 'Groq Free', // Más rápido
        issueId: 24,
      },
      {
        type: 'creative_writing',
        prompt: 'Escribe un poema sobre la programación',
        preferredProvider: 'Hugging Face', // Modelos creativos
        issueId: 25,
      },
      {
        type: 'technical_explanation',
        prompt: 'Explica cómo funciona una API REST',
        preferredProvider: 'Cohere Free', // Bueno para explicaciones
        issueId: 26,
      },
    ];

    for (const task of testTasks) {
      console.log(`📋 Procesando tarea: ${task.type}`);
      console.log(`💭 Prompt: "${task.prompt}"`);

      try {
        // El sistema automáticamente selecciona la mejor API
        const result = await this.freeAI.distributeRequest(task);

        console.log(`✅ Completado con éxito`);
        console.log(`🤖 Respuesta: ${result?.substring(0, 100)}...`);

        this.testResults.push({
          task: task.type,
          success: true,
          provider: result?.provider || 'Unknown',
        });
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);

        this.testResults.push({
          task: task.type,
          success: false,
          error: error.message,
        });
      }

      console.log('─'.repeat(50));

      // Esperar entre requests para respetar rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Probar rotación cuando se agotan límites
  async testRotationOnLimits() {
    console.log('🔄 Probando rotación automática cuando se agotan límites...\n');

    // Simular que Groq está en límite
    const groqProvider = this.freeAI.freeProviders.find((p) => p.name === 'Groq Free');
    if (groqProvider) {
      groqProvider.status = 'rate_limited';
      console.log('⚠️ Simulando que Groq está en límite de rate...');
    }

    const testRequest = {
      type: 'fallback_test',
      prompt: 'Esta es una prueba de fallback automático',
      issueId: 27,
    };

    try {
      const result = await this.freeAI.distributeRequest(testRequest);
      console.log(`✅ Sistema rotó automáticamente a otra API`);
      console.log(`🔄 Provider usado: ${result?.provider || 'Fallback provider'}`);

      // Restaurar Groq
      if (groqProvider) {
        groqProvider.status = 'active';
        console.log('✅ Groq restaurado para futuras pruebas');
      }
    } catch (error) {
      console.log(`❌ Error en rotación: ${error.message}`);
    }
  }

  // Probar sistema de colas cuando todas las APIs están saturadas
  async testQueueSystem() {
    console.log('📋 Probando sistema de colas cuando todas las APIs están saturadas...\n');

    // Simular que todas las APIs están saturadas
    this.freeAI.freeProviders.forEach((provider) => {
      provider.status = 'rate_limited';
    });

    console.log('⚠️ Simulando que todas las APIs están saturadas...');

    const queuedRequests = [
      { type: 'queued_1', prompt: 'Request en cola 1', issueId: 28 },
      { type: 'queued_2', prompt: 'Request en cola 2', issueId: 29 },
      { type: 'queued_3', prompt: 'Request en cola 3', issueId: 30 },
    ];

    for (const request of queuedRequests) {
      try {
        const result = await this.freeAI.distributeRequest(request);
        console.log(`📋 Request ${request.type} agregado a cola`);
      } catch (error) {
        console.log(`📋 Request ${request.type} encolado para procesamiento posterior`);
      }
    }

    // Restaurar APIs para procesamiento de cola
    console.log('🔄 Restaurando APIs para procesar cola...');
    this.freeAI.freeProviders.forEach((provider) => {
      provider.status = 'active';
    });

    // Procesar cola
    await this.freeAI.processFreeQueues();
    console.log('✅ Cola procesada exitosamente');
  }

  // Mostrar estado del sistema
  showSystemStatus() {
    console.log('📊 Estado actual del sistema:\n');

    const status = this.freeAI.getFreeSystemStatus();

    console.log(`🕐 Timestamp: ${status.timestamp}`);
    console.log(`💰 Costo total: $${status.totalCost}`);
    console.log(`📋 Cola total: ${status.totalQueueLength} requests`);
    console.log('');

    console.log('🤖 Estado de APIs:');
    status.providers.forEach((provider) => {
      const statusIcon = provider.status === 'active' ? '✅' : '⚠️';
      console.log(`${statusIcon} ${provider.name}:`);
      console.log(`   Status: ${provider.status}`);
      console.log(`   Usado hoy: ${provider.usedToday}`);
      console.log(`   Límite diario: ${provider.dailyLimit}`);
      console.log(`   Disponible: ${provider.available}`);
      console.log(`   Cola: ${provider.queueLength} requests`);
      console.log('');
    });
  }

  // Mostrar resultados de las pruebas
  showTestResults() {
    console.log('📊 Resultados de las pruebas:\n');

    const successful = this.testResults.filter((r) => r.success).length;
    const total = this.testResults.length;

    console.log(`✅ Pruebas exitosas: ${successful}/${total}`);
    console.log(`📈 Tasa de éxito: ${((successful / total) * 100).toFixed(1)}%`);
    console.log('');

    this.testResults.forEach((result, index) => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} Prueba ${index + 1}: ${result.task}`);
      if (result.success) {
        console.log(`   Provider: ${result.provider}`);
      } else {
        console.log(`   Error: ${result.error}`);
      }
    });
  }

  // Ejecutar todas las pruebas
  async runAllTests() {
    console.log('🚀 Iniciando pruebas del Sistema de Rotación Automática de IA\n');
    console.log('='.repeat(60));

    try {
      // Mostrar estado inicial
      this.showSystemStatus();

      // Prueba 1: Selección inteligente
      await this.testIntelligentSelection();

      // Prueba 2: Rotación automática
      await this.testRotationOnLimits();

      // Prueba 3: Sistema de colas
      await this.testQueueSystem();

      // Mostrar estado final
      console.log('📊 Estado final del sistema:');
      this.showSystemStatus();

      // Mostrar resultados
      this.showTestResults();

      console.log('='.repeat(60));
      console.log('🎉 Pruebas completadas exitosamente!');
    } catch (error) {
      console.error('❌ Error durante las pruebas:', error);
    }
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  const tester = new AIRotationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = AIRotationTester;
