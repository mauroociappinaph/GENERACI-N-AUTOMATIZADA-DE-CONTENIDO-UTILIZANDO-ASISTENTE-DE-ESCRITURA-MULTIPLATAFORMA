/**
 * Free AI System - Sistema de rotación automática de APIs gratuitas
 * Costo total: $0.00 siempre
 * Capacidad: ~43,233 requests/día GRATIS
 */

class FreeAISystem {
  constructor() {
    this.providers = [
      {
        name: 'groq',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey: process.env.GROQ_API_KEY,
        limits: {
          requestsPerMinute: 30,
          requestsPerDay: 14400,
          tokensPerRequest: 8000,
        },
        currentUsage: {
          requestsToday: 0,
          requestsThisMinute: 0,
          lastReset: new Date().toDateString(),
        },
        active: true,
        priority: 1, // Más alta prioridad (más rápido)
      },
      {
        name: 'gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        apiKey: process.env.GOOGLE_API_KEY,
        limits: {
          requestsPerMinute: 60,
          requestsPerDay: 1500,
          tokensPerRequest: 30720,
        },
        currentUsage: {
          requestsToday: 0,
          requestsThisMinute: 0,
          lastReset: new Date().toDateString(),
        },
        active: !!process.env.GOOGLE_API_KEY,
        priority: 2,
      },
      {
        name: 'huggingface',
        endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
        apiKey: process.env.HUGGINGFACE_API_KEY,
        limits: {
          requestsPerMinute: 16, // 1000/hora = ~16/min
          requestsPerDay: 24000,
          tokensPerRequest: 2048,
        },
        currentUsage: {
          requestsToday: 0,
          requestsThisMinute: 0,
          lastReset: new Date().toDateString(),
        },
        active: !!process.env.HUGGINGFACE_API_KEY,
        priority: 3,
      },
      {
        name: 'cohere',
        endpoint: 'https://api.cohere.ai/v1/generate',
        apiKey: process.env.COHERE_API_KEY,
        limits: {
          requestsPerMinute: 20,
          requestsPerDay: 3333, // ~100k tokens/mes ÷ 30 tokens promedio
          tokensPerRequest: 4096,
        },
        currentUsage: {
          requestsToday: 0,
          requestsThisMinute: 0,
          lastReset: new Date().toDateString(),
        },
        active: !!process.env.COHERE_API_KEY,
        priority: 4,
      },
    ];

    this.queue = [];
    this.processing = false;

    console.log('🤖 FreeAISystem inicializado');
    console.log(`📊 Proveedores activos: ${this.getActiveProviders().length}`);
    console.log(`🚀 Capacidad total: ~${this.getTotalDailyCapacity()} requests/día GRATIS`);
  }

  /**
   * Distribuir request automáticamente al mejor proveedor disponible
   */
  async distributeRequest(request) {
    console.log(`🔄 Distribuyendo request: ${request.type}`);

    // Encontrar el mejor proveedor disponible
    const provider = this.findBestProvider();

    if (!provider) {
      console.log('⏳ Todos los proveedores en límite, encolando...');
      return this.enqueueRequest(request);
    }

    try {
      const result = await this.processWithProvider(provider, request);
      console.log(`✅ Request completado con ${provider.name} - Costo: $0.00`);
      return result;
    } catch (error) {
      console.log(`❌ Error con ${provider.name}:`, error.message);

      // Intentar con siguiente proveedor
      provider.active = false;
      return this.distributeRequest(request);
    }
  }

  /**
   * Encontrar el mejor proveedor disponible
   */
  findBestProvider() {
    const activeProviders = this.getActiveProviders()
      .filter((p) => this.canMakeRequest(p))
      .sort((a, b) => a.priority - b.priority);

    return activeProviders[0] || null;
  }

  /**
   * Verificar si un proveedor puede hacer requests
   */
  canMakeRequest(provider) {
    this.resetUsageIfNeeded(provider);

    const withinDailyLimit = provider.currentUsage.requestsToday < provider.limits.requestsPerDay;
    const withinMinuteLimit = provider.currentUsage.requestsThisMinute < provider.limits.requestsPerMinute;

    return withinDailyLimit && withinMinuteLimit && provider.apiKey;
  }

  /**
   * Resetear contadores si es un nuevo día/minuto
   */
  resetUsageIfNeeded(provider) {
    const today = new Date().toDateString();
    const currentMinute = Math.floor(Date.now() / 60000);
    const lastMinute = Math.floor(provider.currentUsage.lastMinuteReset || 0 / 60000);

    if (provider.currentUsage.lastReset !== today) {
      provider.currentUsage.requestsToday = 0;
      provider.currentUsage.lastReset = today;
    }

    if (currentMinute !== lastMinute) {
      provider.currentUsage.requestsThisMinute = 0;
      provider.currentUsage.lastMinuteReset = Date.now();
    }
  }

  /**
   * Procesar request con proveedor específico
   */
  async processWithProvider(provider, request) {
    console.log(`🚀 Procesando con ${provider.name}...`);

    // Incrementar contadores
    provider.currentUsage.requestsToday++;
    provider.currentUsage.requestsThisMinute++;

    switch (provider.name) {
      case 'groq':
        return this.processWithGroq(provider, request);
      case 'gemini':
        return this.processWithGemini(provider, request);
      case 'huggingface':
        return this.processWithHuggingFace(provider, request);
      case 'cohere':
        return this.processWithCohere(provider, request);
      default:
        throw new Error(`Proveedor desconocido: ${provider.name}`);
    }
  }

  /**
   * Procesar con Groq (OpenAI compatible)
   */
  async processWithGroq(provider, request) {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente de IA especializado en desarrollo de software y generación de contenido.',
          },
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Procesar con Google Gemini
   */
  async processWithGemini(provider, request) {
    const response = await fetch(`${provider.endpoint}?key=${provider.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: request.prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Procesar con Hugging Face
   */
  async processWithHuggingFace(provider, request) {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: request.prompt,
        parameters: {
          max_length: 2000,
          temperature: 0.7,
          do_sample: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data[0].generated_text || data.generated_text;
  }

  /**
   * Procesar con Cohere
   */
  async processWithCohere(provider, request) {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        max_tokens: 2000,
        temperature: 0.7,
        model: 'command',
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.generations[0].text;
  }

  /**
   * Encolar request para procesar más tarde
   */
  async enqueueRequest(request) {
    this.queue.push({
      ...request,
      timestamp: Date.now(),
    });

    console.log(`📋 Request encolado. Cola: ${this.queue.length} requests`);

    // Procesar cola en background
    setTimeout(() => this.processQueue(), 60000); // Intentar en 1 minuto

    return 'Request encolado - se procesará cuando haya capacidad disponible';
  }

  /**
   * Procesar cola de requests pendientes
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    console.log(`🔄 Procesando cola: ${this.queue.length} requests pendientes`);

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      const provider = this.findBestProvider();

      if (!provider) {
        // Volver a encolar si no hay proveedores disponibles
        this.queue.unshift(request);
        break;
      }

      try {
        await this.processWithProvider(provider, request);
        console.log(`✅ Request de cola procesado con ${provider.name}`);
      } catch (error) {
        console.log(`❌ Error procesando cola:`, error.message);
      }
    }

    this.processing = false;
  }

  /**
   * Obtener proveedores activos
   */
  getActiveProviders() {
    return this.providers.filter((p) => p.active && p.apiKey);
  }

  /**
   * Calcular capacidad total diaria
   */
  getTotalDailyCapacity() {
    return this.getActiveProviders().reduce((total, p) => total + p.limits.requestsPerDay, 0);
  }

  /**
   * Obtener estadísticas del sistema
   */
  getStats() {
    const activeProviders = this.getActiveProviders();
    const totalCapacity = this.getTotalDailyCapacity();
    const totalUsedToday = activeProviders.reduce((total, p) => total + p.currentUsage.requestsToday, 0);

    return {
      activeProviders: activeProviders.length,
      totalProviders: this.providers.length,
      dailyCapacity: totalCapacity,
      usedToday: totalUsedToday,
      remainingToday: totalCapacity - totalUsedToday,
      queueLength: this.queue.length,
      cost: 0.0,
      providers: activeProviders.map((p) => ({
        name: p.name,
        requestsToday: p.currentUsage.requestsToday,
        dailyLimit: p.limits.requestsPerDay,
        remainingToday: p.limits.requestsPerDay - p.currentUsage.requestsToday,
      })),
    };
  }
}

module.exports = FreeAISystem;
