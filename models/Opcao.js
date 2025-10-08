const mongoose = require('mongoose');

const OpcaoSchema = new mongoose.Schema({
  pergunta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pergunta',
    required: true,
  },
  texto_opcao: {
    type: String,
    required: true,
  },
  correta: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Opcao', OpcaoSchema);

