/**
 * Minimal AI System for GitHub Actions
 * Uses only environment variables - no hardcoded secrets
 */

class MinimalAISystem {
  constructor() {
    this.providers = [
      {
        name: 'groq',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey: process.env.GROQ_API_KEY,
        active: !!process.env.GROQ_API_KEY
      }
    ];
  }

  async processRequest(request) {
    const provider = this.providers.find(p => p.active);
    if (!provider) {
      throw new Error('No AI provider available');
    }

    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente de IA especializado en desarrollo de software.'
          },
          {
            role: 'user',
            content: request.prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

module.exports = MinimalAISystem;
