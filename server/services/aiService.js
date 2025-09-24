require('dotenv').config();

class AIService {
  constructor() {
    this.client = null;
    this.model = "mistral-large-latest";
  }

  async initClient() {
    if (!this.client) {
      const MistralClient = (await import('@mistralai/mistralai')).default;
      this.client = new MistralClient(process.env.MISTRAL_API_KEY);
    }
    return this.client;
  }

  async generateAnswer(question) {
    try {
      await this.initClient();
      const prompt = this.buildPrompt(question);
      
      const response = await this.client.chat({
        model: this.model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return {
        success: true,
        answer: response.choices[0].message.content,
        confidence: this.estimateConfidence(question, response.choices[0].message.content)
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  buildPrompt(question) {
    let prompt = `**Título:** ${question.title}\n\n`;
    prompt += `**Pregunta:** ${question.text}\n\n`;
    
    if (question.tags && question.tags.length > 0) {
      prompt += `**Tags:** ${question.tags.join(', ')}\n\n`;
    }

    // Si hay respuestas existentes, incluirlas para contexto
    if (question.answers && question.answers.length > 0) {
      prompt += `**Respuestas existentes:**\n`;
      question.answers.forEach((answer, index) => {
        prompt += `${index + 1}. ${answer.text}\n`;
      });
      prompt += `\n**Proporciona una respuesta adicional o mejora las existentes.**`;
    } else {
      prompt += `**Por favor, proporciona una respuesta completa y útil.**`;
    }

    return prompt;
  }

  estimateConfidence(question, answer) {
    // Lógica simple para estimar confianza basada en:
    // - Longitud de la respuesta
    // - Presencia de código/ejemplos
    // - Tags técnicos conocidos
    let confidence = 0.5; // Base confidence

    // Aumentar confianza si la respuesta es sustancial
    if (answer.length > 200) confidence += 0.1;
    if (answer.length > 500) confidence += 0.1;

    // Aumentar confianza si contiene código
    if (answer.includes('```') || answer.includes('`')) confidence += 0.1;

    // Aumentar confianza para tags comunes
    const commonTags = ['javascript', 'python', 'react', 'node.js', 'html', 'css'];
    const hasCommonTags = question.tags?.some(tag => 
      commonTags.includes(tag.toLowerCase())
    );
    if (hasCommonTags) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  shouldAutoGenerate(question) {
    // Lógica para decidir si generar respuesta automáticamente
    // Por ahora, generar para todas las preguntas sin respuestas
    return question.answers.length === 0;
  }

  // Helper method to get initialized client
  async getClient() {
    return await this.initClient();
  }

  // Method for streaming responses
  async generateAnswerStream(question, callback) {
    try {
      await this.initClient();
      const prompt = this.buildPrompt(question);
      
      const response = await this.client.chatStream({
        model: this.model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content && callback) {
          callback(content);
        }
      }
    } catch (error) {
      console.error('Error generating streaming AI response:', error);
      throw error;
    }
  }
}

module.exports = new AIService();