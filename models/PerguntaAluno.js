const mongoose = require('mongoose');

const PerguntaAlunoSchema = new mongoose.Schema({
  aluno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aluno',
    required: true,
  },
  sala: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sala',
    required: true,
  },
  pergunta: {
    type: String,
    required: true,
  },
  data_pergunta: {
    type: Date,
    default: Date.now,
  },
  respondida: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('PerguntaAluno', PerguntaAlunoSchema);

