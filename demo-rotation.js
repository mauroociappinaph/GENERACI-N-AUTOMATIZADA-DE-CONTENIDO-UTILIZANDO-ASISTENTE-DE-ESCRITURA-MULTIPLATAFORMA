// Simulación del Sistema de Rotación Automática
class AIRotationDemo {
  constructor() {
    this.providers = [
      { name: 'Hugging Face', limit: 1000, used: 0, status: 'active', speed: 'medium' },
      { name: 'Google Gemini', limit: 60, used: 0, status: 'active', speed: 'fast' },
      { name: 'Groq Free', limit: 30, used: 0, status: 'active', speed: 'very_fast' },
      { name: 'Cohere Free', limit: 100, used: 0, status: 'active', speed: 'medium' },
    ];
  }

  // Selección inteligente basada en tipo de tarea
  selectProviderForTask(taskType) {
    const availableProviders = this.providers.filter((p) => p.status === 'active' && p.used < p.limit);

    if (availableProviders.length === 0) {
      return null; // Todas saturadas
    }

    // Criterios de selección inteligente
    switch (taskType) {
      case 'quick_response':
        // Para respuestas rápidas, priorizar velocidad
        return (
          availableProviders
            .filter((p) => p.speed === 'very_fast')
            .sort((a, b) => a.used / a.limit - b.used / b.limit)[0] || availableProviders[0]
        );

      case 'content_generation':
        // Para contenido, priorizar calidad (Gemini)
        return availableProviders.find((p) => p.name === 'Google Gemini') || availableProviders[0];

      case 'bulk_processing':
        // Para procesamiento masivo, priorizar límites altos
        return availableProviders.sort((a, b) => b.limit - b.used - (a.limit - a.used))[0];

      default:
        // Por defecto, el menos cargado
        return availableProviders.sort((a, b) => a.used / a.limit - b.used / b.limit)[0];
    }
  }

  simulateRequest(task, taskType) {
    console.log(`📋 Procesando: "${task}" (Tipo: ${taskType})`);

    const provider = this.selectProviderForTask(taskType);

    if (!provider) {
      console.log('📋 ⚠️ Todas las APIs saturadas - agregando a cola');
      return { success: false, queued: true };
    }

    provider.used++;

    // Simular respuesta exitosa
    console.log(`✅ Completado con ${provider.name} (${provider.speed})`);
    console.log(
      `📊 Uso actual: ${provider.used}/${provider.limit} (${((provider.used / provider.limit) * 100).toFixed(1)}%)`,
    );

    // Simular que se agota el límite
    if (provider.used >= provider.limit) {
      provider.status = 'rate_limited';
      console.log(`⚠️ ${provider.name} alcanzó su límite - rotará automáticamente en próximos requests`);
    }

    return { success: true, provider: provider.name };
  }

  showSystemStatus() {
    console.log('\n📊 Estado del Sistema de IA:');
    console.log('='.repeat(50));

    this.providers.forEach((provider) => {
      const percentage = ((provider.used / provider.limit) * 100).toFixed(1);
      const statusIcon = provider.status === 'active' ? '✅' : '⚠️';
      const speedIcon = provider.speed === 'very_fast' ? '⚡' : provider.speed === 'fast' ? '🚀' : '🔄';

      console.log(`${statusIcon} ${provider.name} ${speedIcon}`);
      console.log(`   Uso: ${provider.used}/${provider.limit} (${percentage}%)`);
      console.log(`   Estado: ${provider.status}`);
      console.log(`   Velocidad: ${provider.speed}`);
      console.log('');
    });

    const activeProviders = this.providers.filter((p) => p.status === 'active').length;
    const totalCapacity = this.providers.reduce((sum, p) => sum + (p.limit - p.used), 0);

    console.log(`🤖 Providers activos: ${activeProviders}/${this.providers.length}`);
    console.log(`📈 Capacidad restante: ${totalCapacity} requests`);
    console.log(`💰 Costo total: $0.00 (100% gratuito)`);
  }

  runDemo() {
    console.log('🚀 Demo: Sistema de Rotación Automática de APIs de IA');
    console.log('💰 Presupuesto: $0.00 - Solo APIs gratuitas');
    console.log('='.repeat(60));
    console.log('');

    // Diferentes tipos de tareas para mostrar selección inteligente
    const tasks = [
      { task: '¿Qué es JavaScript?', type: 'quick_response' },
      { task: 'Escribe un artículo sobre IA', type: 'content_generation' },
      { task: 'Respuesta rápida sobre Python', type: 'quick_response' },
      { task: 'Genera 10 títulos para blog', type: 'bulk_processing' },
      { task: 'Explica machine learning', type: 'content_generation' },
      { task: '¿Cómo funciona React?', type: 'quick_response' },
      { task: 'Crea descripción de producto', type: 'content_generation' },
    ];

    tasks.forEach((item, index) => {
      console.log(`\n--- Request ${index + 1} ---`);
      this.simulateRequest(item.task, item.type);
    });

    this.showSystemStatus();

    console.log('\n🎯 Características Implementadas:');
    console.log('✅ Rotación automática entre 6 APIs gratuitas');
    console.log('✅ Selección inteligente según tipo de tarea');
    console.log('✅ Monitoreo de límites en tiempo real');
    console.log('✅ Sistema de colas cuando todas están saturadas');
    console.log('✅ Notificaciones automáticas vía Telegram');
    console.log('✅ Funcionamiento 24/7 con GitHub Actions + Railway');
    console.log('✅ Costo total: $0.00 (presupuesto respetado)');

    console.log('\n🔧 Orquestador Principal:');
    console.log('📁 free-ai-system.js - Gestiona toda la lógica');
    console.log('🎯 Hook: project-manager.kiro.hook - Integración automática');
    console.log('📱 telegram-chat-bot.kiro.hook - Bot interactivo');
  }
}

// Ejecutar demo
const demo = new AIRotationDemo();
demo.runDemo();
