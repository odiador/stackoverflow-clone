const Question = require('../models/question');
const User = require('../models/user');
const aiService = require('../services/aiService');
const { canValidateAI, canMarkSolved } = require('../middlewares/moderatorAuth');
const marked = require('marked');

// Generar respuesta automática de IA para una pregunta
const generateAIResponse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findById(id)
      .populate('author')
      .populate('answers.author', '-role');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Verificar si ya tiene respuesta de IA pendiente
    const hasAIPending = question.answers.some(
      answer => answer.isAIGenerated && answer.aiValidationStatus === 'pending'
    );

    if (hasAIPending) {
      return res.status(400).json({ 
        message: 'This question already has a pending AI response' 
      });
    }

    const aiResult = await aiService.generateAnswer(question);
    
    if (!aiResult.success) {
      return res.status(500).json({ 
        message: 'Failed to generate AI response',
        error: aiResult.error 
      });
    }

    // Crear un usuario AI si no existe
    let aiUser = await User.findOne({ username: 'AI_Assistant' });
    if (!aiUser) {
      // En un escenario real, crearías este usuario en la base de datos
      return res.status(500).json({ 
        message: 'AI user not configured. Please create AI_Assistant user.' 
      });
    }

    // Convertir Markdown a HTML y agregar la respuesta de IA a la pregunta
    const htmlAnswer = marked.parse(aiResult.answer || '');

    question.answers.push({
      author: aiUser._id,
      // Store HTML in `text` so the frontend can render formatted content
      text: htmlAnswer,
      // Keep the raw markdown for audit/editing purposes
      rawMarkdown: aiResult.answer,
      isAIGenerated: true,
      aiValidationStatus: 'pending'
    });

    question.hasAIResponse = true;
    await question.save();

    // Popular la nueva respuesta y enviarla
    const updatedQuestion = await Question.findById(id)
      .populate('author')
      .populate('answers.author', '-role');

    res.status(201).json({
      message: 'AI response generated successfully',
      question: updatedQuestion,
      confidence: aiResult.confidence
    });

  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ message: error.message });
  }
};

// Validar respuesta de IA (aprobar o rechazar)
const validateAIResponse = async (req, res) => {
  try {
    if (!canValidateAI(req.user)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const { questionId, answerId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (!answer.isAIGenerated) {
      return res.status(400).json({ message: 'This is not an AI-generated answer' });
    }

    answer.aiValidationStatus = action === 'approve' ? 'approved' : 'rejected';
    answer.validatedBy = req.user.id;
    answer.validatedAt = new Date();

    await question.save();

    const updatedQuestion = await Question.findById(questionId)
      .populate('author')
      .populate('answers.author', '-role');

    res.json({
      message: `AI response ${action}d successfully`,
      question: updatedQuestion
    });

  } catch (error) {
    console.error('Error validating AI response:', error);
    res.status(500).json({ message: error.message });
  }
};

// Marcar pregunta como resuelta
const markQuestionSolved = async (req, res) => {
  try {
    if (!canMarkSolved(req.user)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const { id } = req.params;
    const { answerId } = req.body; // ID de la respuesta que resolvió la pregunta (opcional)

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.status = 'solved';
    question.solvedBy = req.user.id;
    question.solvedAt = new Date();

    await question.save();

    const updatedQuestion = await Question.findById(id)
      .populate('author')
      .populate('answers.author', '-role')
      .populate('solvedBy', 'username');

    res.json({
      message: 'Question marked as solved',
      question: updatedQuestion
    });

  } catch (error) {
    console.error('Error marking question as solved:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener preguntas pendientes de moderación
const getPendingModerationQuestions = async (req, res) => {
  try {
    if (!canValidateAI(req.user)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const questions = await Question.find({
      'answers.isAIGenerated': true,
      'answers.aiValidationStatus': 'pending'
    })
    .populate('author')
    .populate('answers.author', '-role')
    .sort({ created: -1 });

    res.json({ questions });

  } catch (error) {
    console.error('Error fetching pending moderation questions:', error);
    res.status(500).json({ message: error.message });
  }
};

// Auto-generar respuesta de IA cuando se crea una nueva pregunta
const autoGenerateAIResponse = async (questionId) => {
  try {
    const question = await Question.findById(questionId).populate('author');
    if (!question) return;

    const aiUser = await User.findOne({ username: 'AI_Assistant' });
    if (!aiUser) {
      console.log('AI_Assistant user not found. Skipping auto-generation.');
      return;
    }

    // Build prompt for AI
    let prompt = `Actúa como un experto desarrollador de software. Responde la siguiente pregunta de Stack Overflow en formato Markdown.\n\n`;
    prompt += `**Título:** ${question.title}\n\n`;
    prompt += `**Pregunta:** ${question.text}\n\n`;
    
    if (question.tags && question.tags.length > 0) {
      prompt += `**Tags:** ${question.tags.join(', ')}\n\n`;
    }

    prompt += `**Instrucciones:**\n`;
    prompt += `- Responde en formato Markdown completo\n`;
    prompt += `- Usa encabezados (#, ##, ###) para estructurar la respuesta\n`;
    prompt += `- Incluye ejemplos de código usando \`\`\`javascript o el lenguaje apropiado\n`;
    prompt += `- Usa **negrita** para términos importantes\n`;
    prompt += `- Usa listas con - o números cuando sea apropiado\n`;
    prompt += `- Proporciona una respuesta completa y útil\n\n`;

    // Initialize AI client and generate response
    const client = await aiService.getClient();
    const chatCompletion = await client.chat({
      model: aiService.model,
      messages: [{ role: 'user', content: prompt }]
    });

    let aiResponseText = chatCompletion.choices[0].message.content;
    
    // Convert markdown to HTML
    const htmlResponse = marked.parse(aiResponseText);
    
    // Add the AI response to the question
    question.answers.push({
      author: aiUser._id,
      text: htmlResponse, // Store as HTML
      rawMarkdown: aiResponseText, // Keep original markdown for editing
      isAIGenerated: true,
      aiValidationStatus: 'pending'
    });

    question.hasAIResponse = true;
    await question.save();
    
    console.log(`AI response generated for question ${questionId}`);
    
  } catch (error) {
    console.error('Error auto-generating AI response:', error);
  }
};

// New endpoint for real-time streaming responses
const streamAIResponse = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId).populate('author');
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Build prompt for AI
    let prompt = `Actúa como un experto desarrollador de software. Responde la siguiente pregunta de Stack Overflow en formato Markdown.\n\n`;
    prompt += `**Título:** ${question.title}\n\n`;
    prompt += `**Pregunta:** ${question.text}\n\n`;
    
    if (question.tags && question.tags.length > 0) {
      prompt += `**Tags:** ${question.tags.join(', ')}\n\n`;
    }

    if (question.answers && question.answers.length > 0) {
      prompt += `**Respuestas existentes:**\n`;
      question.answers.forEach((answer, index) => {
        prompt += `${index + 1}. ${answer.text}\n`;
      });
      prompt += `\n**Proporciona una respuesta adicional o mejora las existentes usando formato Markdown.**\n\n`;
    } else {
      prompt += `**Instrucciones:**\n`;
      prompt += `- Responde en formato Markdown completo\n`;
      prompt += `- Usa encabezados (#, ##, ###) para estructurar la respuesta\n`;
      prompt += `- Incluye ejemplos de código usando \`\`\`javascript o el lenguaje apropiado\n`;
      prompt += `- Usa **negrita** para términos importantes\n`;
      prompt += `- Usa listas con - o números cuando sea apropiado\n`;
      prompt += `- Proporciona una respuesta completa y útil\n\n`;
    }

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    let fullResponse = '';
    
    try {
      // Initialize and use the AI service
      const client = await aiService.getClient();
      const chatCompletion = await client.chatStream({
        model: aiService.model,
        messages: [{ role: 'user', content: prompt }]
      });

      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          // Send streaming data
          res.write(`data: ${JSON.stringify({ content, isComplete: false })}\n\n`);
        }
      }

      // Send completion signal with full markdown response
      res.write(`data: ${JSON.stringify({ content: '', isComplete: true, fullResponse })}\n\n`);
      res.end();

    } catch (aiError) {
      console.error('AI Service Error:', aiError);
      res.write(`data: ${JSON.stringify({ error: 'Failed to generate AI response: ' + aiError.message })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('Error streaming AI response:', error);
    res.write(`data: ${JSON.stringify({ error: 'Server error: ' + error.message })}\n\n`);
    res.end();
  }
};

module.exports = {
  generateAIResponse,
  validateAIResponse,
  markQuestionSolved,
  getPendingModerationQuestions,
  autoGenerateAIResponse,
  streamAIResponse
};