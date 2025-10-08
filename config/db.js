const mongoose = require('mongoose');
require('dotenv').config();

console.log('URI carregada:', process.env.MONGO_URI);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
     console.log('Não conectado');
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

