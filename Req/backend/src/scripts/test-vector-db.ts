import { VectorDatabaseService } from '../services/vector-database.service';
import { createComponentLogger } from '../utils/debug-logger';

const logger = createComponentLogger('VECTOR_DB_TEST');

/**
 * Script para probar la funcionalidad del vector database
 */
async function testVectorDatabase(): Promise<void> {
  try {
    logger.info('Starting vector database test');

    const vectorService = new VectorDatabaseService();

    // Test 1: Inicializar conexión
    logger.info('Test 1: Initializing vector database connection');
    await vectorService.initialize();
    logger.info('✅ Vector database initialized successfully');

    // Test 2: Crear embeddings de prueba
    logger.info('Test 2: Creating test embeddings');
    const testDocuments = [
      {
        id: 'test-1',
        content: 'This is a test document about artificial intelligence and machine learning.',
        metadata: { type: 'test', category: 'ai' }
      },
      {
        id: 'test-2',
        content: 'This document discusses web development with React and TypeScript.',
        metadata: { type: 'test', category: 'web-dev' }
      },
      {
        id: 'test-3',
        content: 'Database management and SQL queries for data analysis.',
        metadata: { type: 'test', category: 'database' }
      }
    ];

    for (const doc of testDocuments) {
      await vectorService.addDocument(doc.id, doc.content, doc.metadata);
      logger.info(`✅ Added document: ${doc.id}`);
    }

    // Test 3: Buscar documentos similares
    logger.info('Test 3: Searching for similar documents');
    const searchResults = await vectorService.searchSimilar(
      'machine learning and AI development',
      3,
      0.7
    );

    logger.info('Search results:', { results: searchResults });
    logger.info(`✅ Found ${searchResults.length} similar documents`);

    // Test 4: Obtener documento por ID
    logger.info('Test 4: Getting document by ID');
    const document = await vectorService.getDocument('test-1');
    logger.info('Retrieved document:', { document });
    logger.info('✅ Document retrieved successfully');

    // Test 5: Actualizar documento
    logger.info('Test 5: Updating document');
    await vectorService.updateDocument(
      'test-1',
      'Updated content about advanced artificial intelligence and deep learning.',
      { type: 'test', category: 'ai', updated: true }
    );
    logger.info('✅ Document updated successfully');

    // Test 6: Eliminar documentos de prueba
    logger.info('Test 6: Cleaning up test documents');
    for (const doc of testDocuments) {
      await vectorService.deleteDocument(doc.id);
      logger.info(`✅ Deleted document: ${doc.id}`);
    }

    logger.info('🎉 All vector database tests completed successfully!');

  } catch (error) {
    logger.error('Vector database test failed', error as Error);
    process.exit(1);
  }
}

/**
 * Test de rendimiento del vector database
 */
async function performanceTest(): Promise<void> {
  try {
    logger.info('Starting vector database performance test');

    const vectorService = new VectorDatabaseService();
    await vectorService.initialize();

    const startTime = Date.now();
    const batchSize = 100;

    // Crear documentos de prueba en lote
    logger.info(`Creating ${batchSize} test documents`);
    const documents = Array.from({ length: batchSize }, (_, i) => ({
      id: `perf-test-${i}`,
      content: `Performance test document ${i} with various content about technology, programming, and software development. This document contains enough text to generate meaningful embeddings for similarity testing.`,
      metadata: { type: 'performance-test', index: i, batch: Math.floor(i / 10) }
    }));

    // Agregar documentos
    for (const doc of documents) {
      await vectorService.addDocument(doc.id, doc.content, doc.metadata);
    }

    const insertTime = Date.now() - startTime;
    logger.info(`✅ Inserted ${batchSize} documents in ${insertTime}ms`);

    // Test de búsqueda
    const searchStartTime = Date.now();
    const searchResults = await vectorService.searchSimilar(
      'software development and programming technologies',
      10,
      0.5
    );
    const searchTime = Date.now() - searchStartTime;

    logger.info(`✅ Search completed in ${searchTime}ms, found ${searchResults.length} results`);

    // Limpiar documentos de prueba
    logger.info('Cleaning up performance test documents');
    for (const doc of documents) {
      await vectorService.deleteDocument(doc.id);
    }

    const totalTime = Date.now() - startTime;
    logger.info(`🎉 Performance test completed in ${totalTime}ms`);
    logger.info('Performance metrics:', {
      totalDocuments: batchSize,
      insertTime: `${insertTime}ms`,
      avgInsertTime: `${(insertTime / batchSize).toFixed(2)}ms per document`,
      searchTime: `${searchTime}ms`,
      totalTime: `${totalTime}ms`
    });

  } catch (error) {
    logger.error('Performance test failed', error as Error);
    process.exit(1);
  }
}

/**
 * Función principal
 */
async function main(): Promise<void> {
  const testType = process.argv[2] || 'basic';

  switch (testType) {
    case 'basic':
      await testVectorDatabase();
      break;
    case 'performance':
      await performanceTest();
      break;
    case 'all':
      await testVectorDatabase();
      await performanceTest();
      break;
    default:
      logger.error('Invalid test type. Use: basic, performance, or all');
      process.exit(1);
  }

  process.exit(0);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch((error) => {
    logger.error('Test script failed', error);
    process.exit(1);
  });
}

export { testVectorDatabase, performanceTest };
