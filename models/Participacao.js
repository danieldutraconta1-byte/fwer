const mongoose = require('mongoose');

const ParticipacaoSchema = new mongoose.Schema({
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
  data_entrada: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Participacao', ParticipacaoSchema);

