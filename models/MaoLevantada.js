const mongoose = require('mongoose');

const MaoLevantadaSchema = new mongoose.Schema({
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
  data_levantada: {
    type: Date,
    default: Date.now,
  },
  resolvida: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('MaoLevantada', MaoLevantadaSchema);

