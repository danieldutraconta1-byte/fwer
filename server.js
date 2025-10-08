require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar ao banco de dados
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do front-end
app.use(express.static(path.join(__dirname, 'public')));

// Importar rotas
const professorRoutes = require('./routes/professorRoutes');
const salaRoutes = require('./routes/salaRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const participacaoRoutes = require('./routes/participacaoRoutes');
const presencaRoutes = require('./routes/presencaRoutes');
const maoLevantadaRoutes = require('./routes/maoLevantadaRoutes');
const perguntaAlunoRoutes = require('./routes/perguntaAlunoRoutes');
const quizRoutes = require('./routes/quizRoutes');
const perguntaRoutes = require('./routes/perguntaRoutes');
const opcaoRoutes = require('./routes/opcaoRoutes');
const respostaRoutes = require('./routes/respostaRoutes');
const materialRoutes = require('./routes/materialRoutes');

// Usar rotas
app.use('/api/professores', professorRoutes);
app.use('/api/salas', salaRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/participacoes', participacaoRoutes);
app.use('/api/presencas', presencaRoutes);
app.use('/api/maos-levantadas', maoLevantadaRoutes);
app.use('/api/perguntas-aluno', perguntaAlunoRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/perguntas', perguntaRoutes);
app.use('/api/opcoes', opcaoRoutes);
app.use('/api/respostas', respostaRoutes);
app.use('/api/materiais', materialRoutes);

// Catch-all: serve front-end para qualquer rota não reconhecida
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
