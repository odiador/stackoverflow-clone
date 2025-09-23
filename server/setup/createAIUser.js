const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
require('dotenv').config();

const config = require('../config');

const createAIUser = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(config.db.prod, config.db.options);
    console.log('Connected to database');

    // Verificar si el usuario AI ya existe
    const existingAI = await User.findOne({ username: 'AI_Assistant' });
    if (existingAI) {
      console.log('AI_Assistant user already exists');
      return;
    }

    // Crear usuario AI
    //const hashedPassword = await bcrypt.hash('', 12);
    const hashedPassword = null;
    
    const aiUser = new User({
      username: 'AI_Assistant',
      password: hashedPassword,
      role: 'user', // El AI actúa como un usuario normal pero con identificación especial
      profilePhoto: 'https://secure.gravatar.com/avatar/ai?s=90&d=robohash'
    });

    await aiUser.save();
    console.log('AI_Assistant user created successfully');
    console.log('AI User ID:', aiUser._id);

    // Crear un usuario moderador de ejemplo
    const existingModerator = await User.findOne({ username: 'moderator' });
    if (!existingModerator) {
      const modPassword = await bcrypt.hash('moderator123', 12);
      
      const moderator = new User({
        username: 'moderator',
        password: modPassword,
        role: 'moderator'
      });

      await moderator.save();
      console.log('Moderator user created successfully');
      console.log('Moderator credentials: username="moderator", password="moderator123"');
    }

  } catch (error) {
    console.error('Error creating AI user:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  createAIUser();
}

module.exports = createAIUser;