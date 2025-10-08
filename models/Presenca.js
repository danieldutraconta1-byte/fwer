const mongoose = require('mongoose');

const PresencaSchema = new mongoose.Schema({
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
  data_presenca: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Presenca', PresencaSchema);

