const mongoose = require('mongoose');

const SalaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor',
    required: true,
  },
  codigo: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('Sala', SalaSchema);

