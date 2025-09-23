const express = require('express');
const router = express.Router();
const {
  createQuestion,
  show,
  listQuestions,
  listByTags,
  listByUser,
  removeQuestion,
  loadComment,
  questionValidate,
  streamAIResponse
} = require('../controllers/questions');

// Rutas para preguntas
router.route('/')
  .post(questionValidate, createQuestion)
  .get(listQuestions);

router.route('/:id')
  .get(show)
  .delete(removeQuestion);

// Ruta para preguntas por etiqueta
router.get('/tags/:tags', listByTags);

// Ruta para preguntas por usuario
router.get('/user/:username', listByUser);

// Streaming AI response route
router.get('/:id/ai-stream', streamAIResponse);

module.exports = router;