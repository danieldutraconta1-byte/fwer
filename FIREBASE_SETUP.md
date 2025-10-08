# Configuração do Firebase para o Sistema de Sala Online

## 1. Criar um Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nomeie seu projeto (ex: "sala-online")
4. Siga os passos de configuração

## 2. Criar um App Web no Firebase

1. No console do Firebase, clique no ícone de Web (</>)
2. Registre seu app com um nome (ex: "Plataforma Educacional")
3. Copie as credenciais do Firebase (firebaseConfig)

## 3. Configurar o Firestore Database

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (para desenvolvimento)
4. Selecione a localização do servidor

## 4. Configurar as Regras de Segurança

No Firestore, vá em "Regras" e use as seguintes regras:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /salas/{salaId} {
      allow read: if true;
      allow write: if true;
    }

    match /alunos/{alunoId} {
      allow read: if true;
      allow write: if true;
    }

    match /atividades/{atividadeId} {
      allow read: if true;
      allow write: if true;
    }

    match /respostas/{respostaId} {
      allow read: if true;
      allow write: if true;
    }

    match /perguntas/{perguntaId} {
      allow read: if true;
      allow write: if true;
    }

    match /materiais/{materialId} {
      allow read: if true;
      allow write: if true;
    }

    match /quizzes/{quizId} {
      allow read: if true;
      allow write: if true;
    }

    match /quiz-respostas/{respostaId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

**IMPORTANTE:** Estas regras são para desenvolvimento. Em produção, você deve adicionar autenticação e validações mais restritas.

## 5. Atualizar o Arquivo de Configuração

Edite o arquivo `public/js/firebase-config.js` e substitua as credenciais:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

## 6. Estrutura das Collections no Firestore

O sistema usa as seguintes collections:

### salas
- `code`: Código da sala (6 dígitos)
- `teacher`: Nome do professor
- `createdAt`: Timestamp de criação
- `isActive`: Status da sala (boolean)
- `studentsCount`: Número de alunos

### alunos
- `name`: Nome do aluno
- `roomCode`: Código da sala
- `joinedAt`: Timestamp de entrada
- `isPresent`: Presença marcada (boolean)
- `raisedHand`: Mão levantada (boolean)

### atividades
- `title`: Título da atividade
- `description`: Descrição
- `type`: Tipo de resposta (text/file/both)
- `dueDate`: Prazo de entrega
- `maxFileSize`: Tamanho máximo do arquivo
- `roomCode`: Código da sala
- `createdAt`: Timestamp de criação

### respostas
- `activityId`: ID da atividade
- `studentName`: Nome do aluno
- `textResponse`: Resposta em texto
- `submittedAt`: Timestamp de envio

### perguntas
- `text`: Texto da pergunta
- `studentName`: Nome do aluno
- `roomCode`: Código da sala
- `status`: Status (pending/answered)
- `createdAt`: Timestamp de criação

### materiais
- `title`: Título do material
- `description`: Descrição
- `type`: Tipo (link/file)
- `url`: URL do material
- `roomCode`: Código da sala
- `createdAt`: Timestamp de criação

### quizzes
- `title`: Título do quiz
- `question`: Pergunta
- `options`: Array com 4 opções
- `correctAnswer`: Índice da resposta correta (0-3)
- `roomCode`: Código da sala
- `isActive`: Quiz ativo (boolean)
- `createdAt`: Timestamp de criação

### quiz-respostas
- `quizId`: ID do quiz
- `studentName`: Nome do aluno
- `selectedOption`: Opção selecionada (0-3)
- `isCorrect`: Resposta correta (boolean)
- `submittedAt`: Timestamp de envio

## 7. Testando o Sistema

1. Abra o arquivo `public/index.html` em um servidor local
2. Como Professor:
   - Clique em "Sou Professor"
   - Um código de sala será gerado automaticamente
   - Use as funções disponíveis no painel
3. Como Aluno:
   - Clique em "Sou Aluno"
   - Digite o código da sala
   - Insira seu nome
   - Acesse as funcionalidades da sala

## 8. Funcionalidades Implementadas

### Professor:
- Criar e gerenciar salas
- Gerar QR Code de acesso
- Ver alunos conectados em tempo real
- Controle de presença
- Criar e gerenciar atividades
- Visualizar respostas de atividades
- Criar e enviar quizzes interativos
- Ver resultados de quizzes
- Receber e gerenciar perguntas dos alunos
- Ver mãos levantadas
- Compartilhar materiais de apoio

### Aluno:
- Entrar na sala com código ou QR Code
- Marcar presença
- Levantar a mão
- Fazer perguntas ao professor
- Responder atividades
- Participar de quizzes
- Acessar materiais de apoio

## 9. Observações Importantes

- Todos os dados são salvos em tempo real no Firebase
- Não use localStorage ou sessionStorage
- As atualizações são automáticas usando listeners do Firebase
- O sistema funciona totalmente sem backend próprio
- Para produção, implemente autenticação e regras de segurança mais rígidas
