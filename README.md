# Sistema de Sala Online - Refatorado com Firebase

## Visão Geral

Sistema de sala online interativa refatorado do zero para utilizar exclusivamente o Firebase como backend, eliminando dependências de servidor Node.js, MongoDB e sessões locais.

## Mudanças Principais

### Antes (Backend Node.js + MongoDB)
- Servidor Express.js com rotas e controllers
- MongoDB com Mongoose para persistência
- SessionStorage/LocalStorage para estado temporário
- API REST customizada
- Comunicação via HTTP requests

### Depois (Firebase Only)
- Firebase Firestore para persistência de dados
- Listeners em tempo real para sincronização automática
- Sem servidor backend próprio
- Sem sessionStorage/localStorage
- Comunicação totalmente via Firebase SDK

## Estrutura do Projeto

```
project/
├── public/
│   ├── index.html                          # Entrada principal
│   ├── css/                                # Estilos (mantidos intactos)
│   ├── pages/
│   │   ├── home.html                       # Página inicial (mantida)
│   │   ├── teacher-panel.html              # Painel do professor (mantido)
│   │   └── student-room.html               # Sala do aluno (mantida)
│   └── js/
│       ├── firebase-config.js              # Configuração do Firebase
│       ├── firebase-room.js                # Gerenciamento de salas
│       ├── firebase-student.js             # Gerenciamento de alunos
│       ├── firebase-activities.js          # Sistema de atividades
│       ├── firebase-questions.js           # Sistema de perguntas
│       ├── firebase-hand-raise.js          # Levantar mão
│       ├── firebase-materials.js           # Materiais de apoio
│       ├── firebase-quiz.js                # Quiz interativo
│       ├── firebase-presence.js            # Controle de presença
│       ├── app-firebase.js                 # App principal refatorado
│       ├── utils.js                        # Utilitários (mantido)
│       ├── components.js                   # Componentes UI (mantido)
│       └── camera.js                       # Câmera (mantido)
├── FIREBASE_SETUP.md                       # Guia de configuração do Firebase
└── README.md                               # Este arquivo
```

## Funcionalidades Implementadas

### Professor
- ✅ Criar sala automaticamente ao acessar painel
- ✅ Gerar código único de 6 dígitos
- ✅ Gerar QR Code de acesso
- ✅ Visualizar alunos conectados em tempo real
- ✅ Controlar presença dos alunos
- ✅ Criar e gerenciar atividades
- ✅ Visualizar respostas de atividades
- ✅ Criar e enviar quizzes interativos
- ✅ Ver resultados de quizzes em tempo real
- ✅ Receber e gerenciar perguntas dos alunos
- ✅ Visualizar mãos levantadas
- ✅ Compartilhar materiais de apoio (links/arquivos)
- ✅ Encerrar sala

### Aluno
- ✅ Entrar na sala via código de 6 dígitos
- ✅ Entrar na sala via QR Code (preparado para scanner)
- ✅ Inserir nome ao entrar
- ✅ Marcar presença
- ✅ Levantar/abaixar mão
- ✅ Fazer perguntas ao professor
- ✅ Visualizar perguntas enviadas
- ✅ Responder atividades
- ✅ Participar de quizzes em tempo real
- ✅ Acessar materiais de apoio
- ✅ Sair da sala

## Collections do Firebase

### salas
Armazena informações das salas criadas pelos professores.

```javascript
{
  code: "123456",                    // Código da sala (6 dígitos)
  teacher: "Professor Atual",        // Nome do professor
  createdAt: Timestamp,              // Data de criação
  isActive: true,                    // Status da sala
  studentsCount: 0                   // Contador de alunos
}
```

### alunos
Armazena informações dos alunos conectados.

```javascript
{
  name: "João Silva",                // Nome do aluno
  roomCode: "123456",                // Código da sala
  joinedAt: Timestamp,               // Data de entrada
  isPresent: false,                  // Presença marcada
  raisedHand: false                  // Mão levantada
}
```

### atividades
Atividades criadas pelo professor.

```javascript
{
  title: "Atividade 1",              // Título
  description: "Descrição...",       // Descrição
  type: "text",                      // text/file/both
  dueDate: null,                     // Prazo (opcional)
  maxFileSize: 10,                   // Tamanho máximo (MB)
  roomCode: "123456",                // Código da sala
  createdAt: Timestamp               // Data de criação
}
```

### respostas
Respostas dos alunos às atividades.

```javascript
{
  activityId: "abc123",              // ID da atividade
  studentName: "João Silva",         // Nome do aluno
  textResponse: "Minha resposta",    // Resposta em texto
  submittedAt: Timestamp             // Data de envio
}
```

### perguntas
Perguntas enviadas pelos alunos.

```javascript
{
  text: "Qual é a dúvida?",          // Texto da pergunta
  studentName: "João Silva",         // Nome do aluno
  roomCode: "123456",                // Código da sala
  status: "pending",                 // pending/answered
  createdAt: Timestamp               // Data de criação
}
```

### materiais
Materiais de apoio compartilhados.

```javascript
{
  title: "Apostila Cap. 1",          // Título
  description: "Material...",        // Descrição
  type: "link",                      // link/file
  url: "https://...",                // URL do material
  roomCode: "123456",                // Código da sala
  createdAt: Timestamp               // Data de criação
}
```

### quizzes
Quizzes interativos criados.

```javascript
{
  title: "Quiz 1",                   // Título
  question: "Qual é...?",            // Pergunta
  options: ["A", "B", "C", "D"],     // 4 opções
  correctAnswer: 0,                  // Índice correto (0-3)
  roomCode: "123456",                // Código da sala
  isActive: true,                    // Quiz ativo
  createdAt: Timestamp               // Data de criação
}
```

### quiz-respostas
Respostas dos alunos aos quizzes.

```javascript
{
  quizId: "xyz789",                  // ID do quiz
  studentName: "João Silva",         // Nome do aluno
  selectedOption: 0,                 // Opção selecionada
  isCorrect: true,                   // Resposta correta
  submittedAt: Timestamp             // Data de envio
}
```

## Como Configurar

Siga o guia detalhado em `FIREBASE_SETUP.md`.

### Resumo Rápido

1. Crie um projeto no Firebase Console
2. Ative o Firestore Database
3. Configure as regras de segurança (fornecidas no guia)
4. Copie as credenciais do Firebase
5. Cole as credenciais em `public/js/firebase-config.js`
6. Abra `public/index.html` em um servidor local

## Tecnologias Utilizadas

- **Firebase Firestore**: Banco de dados NoSQL em tempo real
- **Firebase SDK**: Biblioteca JavaScript para integração
- **Vanilla JavaScript**: Sem frameworks pesados
- **HTML5 & CSS3**: Interface responsiva
- **QRCode.js**: Geração de QR Codes

## Sincronização em Tempo Real

Todos os dados são sincronizados automaticamente usando listeners do Firestore:

```javascript
// Exemplo: Escutar mudanças nos alunos conectados
onSnapshot(query(collection(db, 'alunos'), where('roomCode', '==', roomCode)),
  (snapshot) => {
    // Atualização automática da UI quando dados mudam
  }
);
```

## Arquivos Removidos

Os seguintes arquivos do backend antigo foram removidos:

- `server.js` (não mais necessário)
- `config/db.js`
- `controllers/*` (todos)
- `models/*` (todos)
- `routes/*` (todas)
- `public/js/api.js`
- `public/js/room.js` (substituído por firebase-room.js)
- `public/js/quiz.js` (substituído por firebase-quiz.js)
- `public/js/hand-raise.js` (substituído por firebase-hand-raise.js)
- `public/js/materials.js` (substituído por firebase-materials.js)
- `public/js/questions-system.js` (substituído por firebase-questions.js)
- `public/js/activities-system.js` (substituído por firebase-activities.js)

## Observações Importantes

1. **Sem LocalStorage/SessionStorage**: Todos os dados são gerenciados pelo Firebase
2. **Tempo Real**: Atualizações automáticas sem necessidade de refresh
3. **Sem Backend Próprio**: O Firebase funciona como backend completo
4. **Escalável**: O Firebase gerencia automaticamente a escalabilidade
5. **HTML e CSS Intactos**: Toda a interface visual foi mantida exatamente como estava

## Próximos Passos (Opcional)

- Implementar autenticação Firebase Auth
- Adicionar regras de segurança mais restritas
- Implementar upload real de arquivos (Firebase Storage)
- Adicionar histórico de salas
- Implementar notificações push

## Suporte

Para dúvidas sobre configuração, consulte `FIREBASE_SETUP.md`.
Para problemas técnicos, verifique o console do navegador e o Firestore Console.
