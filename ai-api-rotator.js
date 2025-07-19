// Sistema de rotación automática entre APIs de IA
class AIAPIRotator {
  constructor() {
    this.providers = [
      {
        name: 'OpenAI',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        key: process.env.OPENAI_API_KEY,
        rateLimit: 3500, // requests per minute
        cost: 0.002, // per 1K tokens
        status: 'active',
        queue: [],
      },
      {
        name: 'Anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        key: process.env.ANTHROPIC_API_KEY,
        rateLimit: 1000,
        cost: 0.008,
        status: 'active',
        queue: [],
      },
      {
        name: 'Google Gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
        key: process.env.GOOGLE_API_KEY,
        rateLimit: 60,
        cost: 0.001,
        status: 'active',
        queue: [],
      },
      {
        name: 'Cohere',
        endpoint: 'https://api.cohere.ai/v1/generate',
        key: process.env.COHERE_API_KEY,
        rateLimit: 1000,
        cost: 0.0015,
        status: 'active',
        queue: [],
      },
    ];

    this.currentProvider = 0;
    this.requestCounts = new Map();
    this.startRotationScheduler();
  }

  // Distribuir requests inteligentemente
  async distributeRequest(request) {
    // Encontrar el proveedor con menor carga
    const bestProvider = this.findBestProvider(request);

    if (!bestProvider) {
      // Si todos están saturados, usar cola
      return this.queueRequest(request);
    }

    try {
      const result = await this.makeRequest(bestProvider, request);
      this.updateProviderStats(bestProvider, 'success');
      return result;
    } catch (error) {
      this.updateProviderStats(bestProvider, 'error');
      // Intentar con siguiente proveedor
      return this.fallbackRequest(request, bestProvider);
    }
  }

  findBestProvider(request) {
    return this.providers
      .filter((p) => p.status === 'active')
      .sort((a, b) => {
        // Priorizar por: disponibilidad > costo > velocidad
        const aLoad = this.getProviderLoad(a);
        const bLoad = this.getProviderLoad(b);

        if (aLoad !== bLoad) return aLoad - bLoad;
        return a.cost - b.cost;
      })[0];
  }

  getProviderLoad(provider) {
    const currentMinute = Math.floor(Date.now() / 60000);
    const requests = this.requestCounts.get(`${provider.name}-${currentMinute}`) || 0;
    return requests / provider.rateLimit;
  }

  // Procesamiento en paralelo
  async processMultipleRequests(requests) {
    const chunks = this.chunkRequests(requests, this.providers.length);

    const promises = chunks.map(async (chunk, index) => {
      const provider = this.providers[index % this.providers.length];
      return this.processChunk(chunk, provider);
    });

    return Promise.allSettled(promises);
  }

  async processChunk(requests, provider) {
    const results = [];

    for (const request of requests) {
      try {
        // Respetar rate limits
        await this.waitForRateLimit(provider);

        const result = await this.makeRequest(provider, request);
        results.push({ success: true, data: result, provider: provider.name });

        // Actualizar GitHub Issue con progreso
        await this.updateIssueProgress(request.issueId, 'completed', provider.name);

        // Notificar a Telegram
        await this.notifyTelegram(
          `✅ AI Request completado\n\nProvider: ${provider.name}\nIssue: #${request.issueId}\nTipo: ${request.type}`,
        );
      } catch (error) {
        results.push({ success: false, error: error.message, provider: provider.name });

        // Mover a cola de reintento
        this.queueForRetry(request, provider);
      }
    }

    return results;
  }

  // Scheduler 24/7
  startRotationScheduler() {
    // Cada minuto: limpiar contadores
    setInterval(() => {
      this.cleanupRequestCounts();
    }, 60000);

    // Cada 5 minutos: procesar colas
    setInterval(async () => {
      await this.processQueues();
    }, 300000);

    // Cada hora: optimizar distribución
    setInterval(() => {
      this.optimizeDistribution();
    }, 3600000);

    // Cada 6 horas: rotar provider principal
    setInterval(() => {
      this.rotatePrimaryProvider();
    }, 21600000);
  }

  async processQueues() {
    console.log('🔄 Procesando colas de AI requests...');

    for (const provider of this.providers) {
      if (provider.queue.length > 0 && provider.status === 'active') {
        const batchSize = Math.min(provider.queue.length, 10);
        const batch = provider.queue.splice(0, batchSize);

        console.log(`📊 Procesando ${batch.length} requests con ${provider.name}`);

        // Procesar en paralelo pero respetando rate limits
        const results = await this.processBatchWithRateLimit(batch, provider);

        // Actualizar estadísticas
        this.updateBatchStats(provider, results);
      }
    }
  }

  async processBatchWithRateLimit(batch, provider) {
    const results = [];
    const delayBetweenRequests = 60000 / provider.rateLimit; // ms entre requests

    for (let i = 0; i < batch.length; i++) {
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests));
      }

      try {
        const result = await this.makeRequest(provider, batch[i]);
        results.push({ success: true, data: result });

        // Actualizar progreso en tiempo real
        await this.updateRealTimeProgress(batch[i], provider, 'completed');
      } catch (error) {
        results.push({ success: false, error: error.message });

        // Si es error de rate limit, pausar este provider
        if (error.message.includes('rate limit')) {
          provider.status = 'rate_limited';
          setTimeout(() => {
            provider.status = 'active';
          }, 60000); // Pausa 1 minuto
        }
      }
    }

    return results;
  }

  async updateRealTimeProgress(request, provider, status) {
    // Actualizar GitHub Issue
    if (request.issueId) {
      await this.updateGitHubIssue(request.issueId, {
        status,
        provider: provider.name,
        timestamp: new Date().toISOString(),
        progress: this.calculateProgress(request),
      });
    }

    // Notificar Telegram
    await this.sendTelegramUpdate(request, provider, status);
  }

  async updateGitHubIssue(issueId, update) {
    const comment = `🤖 **AI Processing Update**

**Status:** ${update.status}
**Provider:** ${update.provider}
**Time:** ${update.timestamp}
**Progress:** ${update.progress}%

*Updated automatically by AI API Rotator*`;

    try {
      await fetch(`https://api.github.com/repos/owner/repo/issues/${issueId}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: comment }),
      });
    } catch (error) {
      console.error('Error updating GitHub issue:', error);
    }
  }

  async sendTelegramUpdate(request, provider, status) {
    const message = `🤖 *AI Processing Update*

*Request:* ${request.type}
*Provider:* ${provider.name}
*Status:* ${status}
*Issue:* #${request.issueId}

*Time:* ${new Date().toLocaleString()}`;

    try {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  }

  // Optimización inteligente
  optimizeDistribution() {
    console.log('🧠 Optimizando distribución de APIs...');

    // Analizar rendimiento de cada provider
    const stats = this.analyzeProviderPerformance();

    // Reordenar providers por eficiencia
    this.providers.sort((a, b) => {
      const aScore = this.calculateProviderScore(a, stats);
      const bScore = this.calculateProviderScore(b, stats);
      return bScore - aScore;
    });

    console.log(
      '📊 Nuevo orden de providers:',
      this.providers.map((p) => p.name),
    );
  }

  calculateProviderScore(provider, stats) {
    const providerStats = stats[provider.name] || { success: 0, speed: 0, cost: 0 };

    // Score basado en: éxito (40%) + velocidad (30%) + costo (30%)
    return providerStats.success * 0.4 + providerStats.speed * 0.3 + (1 - providerStats.cost) * 0.3;
  }

  // Monitoreo en tiempo real
  getSystemStatus() {
    return {
      timestamp: new Date().toISOString(),
      providers: this.providers.map((p) => ({
        name: p.name,
        status: p.status,
        queueLength: p.queue.length,
        currentLoad: this.getProviderLoad(p),
        rateLimit: p.rateLimit,
        cost: p.cost,
      })),
      totalQueueLength: this.providers.reduce((sum, p) => sum + p.queue.length, 0),
      activeProviders: this.providers.filter((p) => p.status === 'active').length,
    };
  }
}

// Inicializar sistema 24/7
const aiRotator = new AIAPIRotator();

// Endpoint para monitoreo
app.get('/ai-status', (req, res) => {
  res.json(aiRotator.getSystemStatus());
});

// Endpoint para agregar requests
app.post('/ai-request', async (req, res) => {
  try {
    const result = await aiRotator.distributeRequest(req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = aiRotator;
