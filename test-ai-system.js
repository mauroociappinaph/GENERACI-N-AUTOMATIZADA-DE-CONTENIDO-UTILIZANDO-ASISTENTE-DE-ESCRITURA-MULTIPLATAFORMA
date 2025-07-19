/**
 * Test script para verificar el sistema de IA gratuito
 */

const FreeAISystem = require('./free-ai-system.js');

// Configurar tu API key de Groq (usar variable de entorno)
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'TU_GROQ_API_KEY_AQUI';

async function testAISystem() {
  console.log('🧪 Iniciando test del sistema de IA gratuito...\n');

  const aiSystem = new FreeAISystem();

  // Mostrar estadísticas iniciales
  console.log('📊 Estadísticas iniciales:');
  console.log(JSON.stringify(aiSystem.getStats(), null, 2));
  console.log('\n');

  // Test 1: Generación de contenido simple
  console.log('🎯 Test 1: Generación de contenido simple');
  try {
    const request1 = {
      type: 'content_generation',
      prompt: 'Escribe un párrafo sobre los beneficios de la inteligencia artificial en el desarrollo de software.',
      issueId: 'test-1',
    };

    const result1 = await aiSystem.distributeRequest(request1);
    console.log('✅ Resultado 1:');
    console.log(result1.substring(0, 200) + '...\n');
  } catch (error) {
    console.log('❌ Error en test 1:', error.message, '\n');
  }

  // Test 2: Generación de código
  console.log('🎯 Test 2: Generación de código');
  try {
    const request2 = {
      type: 'code_generation',
      prompt: 'Crea una función JavaScript que valide si un email es válido usando regex.',
      issueId: 'test-2',
    };

    const result2 = await aiSystem.distributeRequest(request2);
    console.log('✅ Resultado 2:');
    console.log(result2.substring(0, 300) + '...\n');
  } catch (error) {
    console.log('❌ Error en test 2:', error.message, '\n');
  }

  // Test 3: Análisis de base de datos
  console.log('🎯 Test 3: Análisis de base de datos');
  try {
    const request3 = {
      type: 'database_design',
      prompt: 'Sugiere mejoras para una tabla de usuarios que tiene campos: id, email, password, created_at.',
      issueId: 'test-3',
    };

    const result3 = await aiSystem.distributeRequest(request3);
    console.log('✅ Resultado 3:');
    console.log(result3.substring(0, 250) + '...\n');
  } catch (error) {
    console.log('❌ Error en test 3:', error.message, '\n');
  }

  // Mostrar estadísticas finales
  console.log('📊 Estadísticas finales:');
  console.log(JSON.stringify(aiSystem.getStats(), null, 2));

  console.log('\n🎉 Test completado!');
  console.log('💰 Costo total: $0.00');
}

// Ejecutar test
testAISystem().catch(console.error);
