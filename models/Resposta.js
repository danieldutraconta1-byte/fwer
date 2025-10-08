const mongoose = require('mongoose');

const RespostaSchema = new mongoose.Schema({
  pergunta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pergunta',
    required: true,
  },
  aluno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aluno',
    required: true,
  },
  texto_resposta: {
    type: String,
  },
  opcao_selecionada: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opcao',
  },
  data_resposta: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resposta', RespostaSchema);

