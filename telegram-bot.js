/**
 * Bot de Telegram Interactivo con IA - Modo Dual
 *
 * Funcionalidades:
 * 1. MANTIENE: Sistema automático de GitHub Issues (cada 5 minutos)
 * 2. NUEVO: Chat directo con IA como en Kiro IDE
 * 3. NUEVO: Consultas sobre tasks del proyecto
 * 4. NUEVO: Comandos especializados de IA
 *
 * Costo: $0.00 siempre
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const FreeAISystem = require('./free-ai-system.js');
const fs = require('fs');
const { execSync } = require('child_process');

class ProjectTelegramBot {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    this.aiSystem = new FreeAISystem();
    this.userSessions = new Map(); // Historial de conversación por usuario

    console.log('🤖 Bot de Telegram iniciado - Modo Dual');
    console.log('✅ Funcionalidad GitHub Issues: ACTIVA');
    console.log('✅ Chat directo con IA: ACTIVO');
    console.log('💰 Costo: $0.00');

    this.setupCommands();
    this.setupMessageHandlers();
  }

  setupCommands() {
    // Comando de ayuda
    this.bot.onText(/\/start|\/help/, (msg) => {
      const chatId = msg.chat.id;
      const helpText = `🤖 **Bot de IA del Proyecto - Modo Dual**

**🔄 Sistema Automático (GitHub Issues):**
- Crea issues con label "ai-request"
- Se procesan automáticamente cada 5 minutos
- Recibes notificaciones aquí cuando se completen

**💬 Chat Directo con IA:**
- Escribe cualquier pregunta y te respondo al instante
- Uso las mismas APIs gratuitas (Groq, Gemini, etc.)
- Mantengo el contexto de nuestra conversación

**📋 Comandos Disponibles:**
/status - Estado del sistema
/tasks - Estadísticas de tasks del proyecto
/issues - Ver issues pendientes
/code - Consultas de programación
/design - Consultas de diseño
/content - Generación de contenido
/analyze - Análisis de código/datos
/clear - Limpiar historial de conversación
/help - Esta ayuda

**💡 Ejemplos de uso:**
- "¿Cuántas tasks tenemos completadas?"
- "Ayúdame a crear una función de validación"
- "Genera contenido para un blog sobre IA"
- "Analiza este código: [tu código]"

**💰 Costo: $0.00 siempre**
**🚀 Disponible 24/7**`;

      this.bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
    });

    // Comando de estado del sistema
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;

      try {
        const stats = this.aiSystem.getStats();
        const systemStatus = `📊 **Estado del Sistema 24/7**

**🤖 Sistema de IA:**
- Proveedores activos: ${stats.activeProviders}/${stats.totalProviders}
- Requests procesados hoy: ${stats.usedToday}
- Capacidad restante: ${stats.remainingToday.toLocaleString()}
- Costo total: $${stats.cost}

**🔄 GitHub Actions:**
- Estado: ✅ Operativo
- Próxima ejecución: 5 minutos
- Procesamiento automático: ACTIVO

**📋 Cola de procesamiento:**
- Requests en cola: ${stats.queueLength}

**💰 Presupuesto:**
- Usado hoy: $0.00
- Límite diario: $0.00
- **Sistema 100% GRATUITO**

*Última actualización: ${new Date().toLocaleString()}*`;

        this.bot.sendMessage(chatId, systemStatus, { parse_mode: 'Markdown' });
      } catch (error) {
        this.bot.sendMessage(chatId, `❌ Error obteniendo estado: ${error.message}`);
      }
    });

    // Comando de tasks del proyecto
    this.bot.onText(/\/tasks/, async (msg) => {
      const chatId = msg.chat.id;

      try {
        const tasksStats = await this.getTasksStatistics();
        this.bot.sendMessage(chatId, tasksStats, { parse_mode: 'Markdown' });
      } catch (error) {
        this.bot.sendMessage(chatId, `❌ Error obteniendo tasks: ${error.message}`);
      }
    });

    // Comando de issues
    this.bot.onText(/\/issues/, async (msg) => {
      const chatId = msg.chat.id;

      try {
        const issuesInfo = await this.getIssuesInfo();
        this.bot.sendMessage(chatId, issuesInfo, { parse_mode: 'Markdown' });
      } catch (error) {
        this.bot.sendMessage(chatId, `❌ Error obteniendo issues: ${error.message}`);
      }
    });

    // Comandos especializados de IA
    this.bot.onText(/\/code (.+)/, (msg, match) => {
      this.handleSpecializedAI(msg, match[1], 'code_generation');
    });

    this.bot.onText(/\/design (.+)/, (msg, match) => {
      this.handleSpecializedAI(msg, match[1], 'design_consultation');
    });

    this.bot.onText(/\/content (.+)/, (msg, match) => {
      this.handleSpecializedAI(msg, match[1], 'content_generation');
    });

    this.bot.onText(/\/analyze (.+)/, (msg, match) => {
      this.handleSpecializedAI(msg, match[1], 'code_analysis');
    });

    // Limpiar historial
    this.bot.onText(/\/clear/, (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;

      this.userSessions.delete(userId);
      this.bot.sendMessage(chatId, '🧹 Historial de conversación limpiado');
    });
  }

  setupMessageHandlers() {
    // Manejar mensajes de texto (chat directo con IA)
    this.bot.on('message', async (msg) => {
      // Ignorar comandos (ya se manejan arriba)
      if (msg.text && msg.text.startsWith('/')) return;

      // Solo procesar mensajes de texto
      if (!msg.text) return;

      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const userMessage = msg.text;

      try {
        // Mostrar indicador de "escribiendo"
        this.bot.sendChatAction(chatId, 'typing');

        // Verificar si es una pregunta sobre tasks del proyecto
        if (this.isTasksQuestion(userMessage)) {
          const response = await this.handleTasksQuestion(userMessage);
          this.bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
          return;
        }

        // Chat directo con IA
        const response = await this.handleDirectAIChat(userId, userMessage);

        // Enviar respuesta (dividir si es muy larga)
        if (response.length > 4000) {
          const chunks = this.splitMessage(response, 4000);
          for (const chunk of chunks) {
            await this.bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
          }
        } else {
          this.bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
        }
      } catch (error) {
        console.error('Error procesando mensaje:', error);
        this.bot.sendMessage(chatId, `❌ Error procesando tu mensaje: ${error.message}`);
      }
    });
  }

  async handleDirectAIChat(userId, message) {
    // Obtener o crear sesión del usuario
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, {
        history: [],
        createdAt: new Date(),
      });
    }

    const session = this.userSessions.get(userId);

    // Agregar mensaje del usuario al historial
    session.history.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Mantener solo los últimos 10 mensajes para no exceder límites
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }

    // Crear contexto de conversación
    const conversationContext = session.history
      .slice(-6) // Últimos 6 mensajes para contexto
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Crear prompt con contexto
    const aiPrompt = `Eres un asistente de IA especializado en desarrollo de software y gestión de proyectos.

Contexto de la conversación:
${conversationContext}

Responde de manera útil, práctica y concisa. Si es código, usa formato markdown. Si es una pregunta técnica, sé específico y proporciona ejemplos cuando sea apropiado.

Usuario: ${message}`;

    // Procesar con sistema de IA
    const aiRequest = {
      type: 'general_assistance',
      prompt: aiPrompt,
      userId: userId,
    };

    const response = await this.aiSystem.distributeRequest(aiRequest);

    // Agregar respuesta de IA al historial
    session.history.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    });

    return response;
  }

  async handleSpecializedAI(msg, query, type) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      this.bot.sendChatAction(chatId, 'typing');

      let specializedPrompt;
      switch (type) {
        case 'code_generation':
          specializedPrompt = `Eres un experto programador. Ayuda con esta consulta de código: ${query}. Proporciona código funcional y explicaciones claras.`;
          break;
        case 'design_consultation':
          specializedPrompt = `Eres un experto en diseño de software y UX. Ayuda con esta consulta de diseño: ${query}. Proporciona sugerencias prácticas y mejores prácticas.`;
          break;
        case 'content_generation':
          specializedPrompt = `Eres un experto en creación de contenido. Genera contenido de alta calidad para: ${query}. Sé creativo y profesional.`;
          break;
        case 'code_analysis':
          specializedPrompt = `Eres un experto en análisis de código. Analiza lo siguiente: ${query}. Proporciona feedback constructivo, identifica problemas y sugiere mejoras.`;
          break;
      }

      const aiRequest = {
        type: type,
        prompt: specializedPrompt,
        userId: userId,
      };

      const response = await this.aiSystem.distributeRequest(aiRequest);

      if (response.length > 4000) {
        const chunks = this.splitMessage(response, 4000);
        for (const chunk of chunks) {
          await this.bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
        }
      } else {
        this.bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
      }
    } catch (error) {
      this.bot.sendMessage(chatId, `❌ Error procesando consulta especializada: ${error.message}`);
    }
  }

  isTasksQuestion(message) {
    const tasksKeywords = [
      'task',
      'tarea',
      'cuántas',
      'cuantas',
      'completadas',
      'hechas',
      'pendientes',
      'falta',
      'progreso',
      'avance',
      'estado del proyecto',
    ];

    const lowerMessage = message.toLowerCase();
    return tasksKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  async handleTasksQuestion(message) {
    try {
      const tasksStats = await this.getTasksStatistics();

      // Usar IA para generar una respuesta natural basada en las estadísticas
      const aiPrompt = `El usuario pregunta: "${message}"

Aquí están las estadísticas actuales del proyecto:
${tasksStats}

Responde de manera natural y conversacional a su pregunta específica, usando la información de las estadísticas.`;

      const aiRequest = {
        type: 'project_consultation',
        prompt: aiPrompt,
      };

      const response = await this.aiSystem.distributeRequest(aiRequest);
      return response;
    } catch (error) {
      return `❌ Error obteniendo información de tasks: ${error.message}`;
    }
  }

  async getTasksStatistics() {
    try {
      // Leer archivo de tasks
      const tasksContent = fs.readFileSync('Req/.kiro/specs/sistema-gestion-040/tasks.md', 'utf8');

      // Parsear tasks
      const lines = tasksContent.split('\n');
      let totalTasks = 0;
      let completedTasks = 0;
      let inProgressTasks = 0;
      let pendingTasks = 0;

      const taskSections = [];
      let currentSection = null;

      for (const line of lines) {
        // Detectar tareas principales
        if (line.match(/^- \[(x| |-)\]/)) {
          totalTasks++;
          const isCompleted = line.includes('[x]');
          const isInProgress = line.includes('[-]');

          if (isCompleted) completedTasks++;
          else if (isInProgress) inProgressTasks++;
          else pendingTasks++;

          // Extraer nombre de la tarea
          const taskName = line.replace(/^- \[(x| |-)\]\s*\d*\.?\s*/, '').trim();
          if (taskName) {
            currentSection = {
              name: taskName,
              status: isCompleted ? 'completed' : isInProgress ? 'in_progress' : 'pending',
              subtasks: [],
            };
            taskSections.push(currentSection);
          }
        }
        // Detectar subtareas
        else if (line.match(/^\s+- \[(x| |-)\]/) && currentSection) {
          const isCompleted = line.includes('[x]');
          const isInProgress = line.includes('[-]');
          const subtaskName = line.replace(/^\s+- \[(x| |-)\]\s*\d*\.?\d*\.?\s*/, '').trim();

          if (subtaskName) {
            currentSection.subtasks.push({
              name: subtaskName,
              status: isCompleted ? 'completed' : isInProgress ? 'in_progress' : 'pending',
            });
          }
        }
      }

      const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Encontrar tareas recientes
      const recentCompleted = taskSections
        .filter((task) => task.status === 'completed')
        .slice(-3)
        .map((task) => `✅ ${task.name}`)
        .join('\n');

      const currentInProgress = taskSections
        .filter((task) => task.status === 'in_progress')
        .map((task) => `🔄 ${task.name}`)
        .join('\n');

      const nextPending = taskSections
        .filter((task) => task.status === 'pending')
        .slice(0, 3)
        .map((task) => `⏳ ${task.name}`)
        .join('\n');

      return `📊 **Estadísticas del Proyecto**

**📈 Progreso General:**
- Total de tasks: ${totalTasks}
- ✅ Completadas: ${completedTasks} (${completionPercentage}%)
- 🔄 En progreso: ${inProgressTasks}
- ⏳ Pendientes: ${pendingTasks}

**🎯 Tasks Recientes Completadas:**
${recentCompleted || 'Ninguna reciente'}

**🔄 Actualmente en Progreso:**
${currentInProgress || 'Ninguna en progreso'}

**⏳ Próximas Tasks:**
${nextPending || 'No hay pendientes'}

*Actualizado: ${new Date().toLocaleString()}*`;
    } catch (error) {
      throw new Error(`Error leyendo tasks: ${error.message}`);
    }
  }

  async getIssuesInfo() {
    try {
      // Obtener issues usando GitHub CLI
      const aiIssues = execSync(
        'gh issue list --label "ai-request" --state open --json number,title,createdAt --limit 5',
        { encoding: 'utf8' },
      );
      const completedIssues = execSync(
        'gh issue list --label "ai-completed" --state closed --json number,title,closedAt --limit 3',
        { encoding: 'utf8' },
      );

      const aiIssuesData = JSON.parse(aiIssues || '[]');
      const completedIssuesData = JSON.parse(completedIssues || '[]');

      let issuesText = `📋 **Estado de Issues con IA**

**🤖 Issues Pendientes de IA (${aiIssuesData.length}):**\n`;

      if (aiIssuesData.length > 0) {
        aiIssuesData.forEach((issue) => {
          const createdDate = new Date(issue.createdAt).toLocaleDateString();
          issuesText += `• #${issue.number}: ${issue.title}\n  📅 Creado: ${createdDate}\n\n`;
        });
      } else {
        issuesText += '✅ No hay issues pendientes\n\n';
      }

      issuesText += `**✅ Issues Completados Recientemente (${completedIssuesData.length}):**\n`;

      if (completedIssuesData.length > 0) {
        completedIssuesData.forEach((issue) => {
          const closedDate = new Date(issue.closedAt).toLocaleDateString();
          issuesText += `• #${issue.number}: ${issue.title}\n  ✅ Completado: ${closedDate}\n\n`;
        });
      } else {
        issuesText += 'No hay issues completados recientemente\n\n';
      }

      issuesText += `**💡 Cómo crear un nuevo issue:**
\`gh issue create --title "Tu título" --body "Descripción" --label "ai-request"\`

**⏰ Procesamiento:** Cada 5 minutos automáticamente
**💰 Costo:** $0.00`;

      return issuesText;
    } catch (error) {
      return `❌ Error obteniendo issues: ${error.message}\n\n💡 Asegúrate de que GitHub CLI esté configurado`;
    }
  }

  splitMessage(text, maxLength) {
    const chunks = [];
    let currentChunk = '';

    const lines = text.split('\n');

    for (const line of lines) {
      if (currentChunk.length + line.length + 1 > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
      }
      currentChunk += line + '\n';
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  // Método para enviar notificaciones (usado por GitHub Actions)
  static async sendNotification(message, chatId = process.env.TELEGRAM_CHAT_ID) {
    if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) {
      console.log('⚠️ Telegram no configurado, saltando notificación');
      return;
    }

    try {
      const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      console.log('✅ Notificación enviada a Telegram');
    } catch (error) {
      console.error('❌ Error enviando notificación:', error.message);
    }
  }
}

// Inicializar bot si se ejecuta directamente
if (require.main === module) {
  // Verificar variables de entorno
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN no configurado');
    process.exit(1);
  }

  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY no configurado');
    process.exit(1);
  }

  // Inicializar bot
  const bot = new ProjectTelegramBot();

  console.log('🚀 Bot de Telegram iniciado exitosamente');
  console.log('💬 Listo para chat directo con IA');
  console.log('🔄 Sistema automático de GitHub Issues activo');
  console.log('💰 Costo total: $0.00');
}

module.exports = ProjectTelegramBot;
