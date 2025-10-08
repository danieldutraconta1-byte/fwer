require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

const testConnection = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conexão com MongoDB Atlas bem-sucedida!');
    process.exit(0); // encerra o script
  } catch (err) {
    console.error('❌ Erro ao conectar com MongoDB Atlas:');
    console.error(err.message);
    process.exit(1);
  }
};

testConnection();