const mongoose = require('mongoose');

const PerguntaSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  texto_pergunta: {
    type: String,
    required: true,
  },
  tipo_pergunta: {
    type: String,
    enum: ['multipla_escolha', 'aberta'],
    required: true,
  },
});

module.exports = mongoose.model('Pergunta', PerguntaSchema);

