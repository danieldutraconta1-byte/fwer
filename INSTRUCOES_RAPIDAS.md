# Instruções Rápidas - Sistema Refatorado com Firebase

## ✅ O que foi feito

Todo o sistema foi refatorado do zero para usar exclusivamente o Firebase. Não há mais servidor Node.js, MongoDB ou uso de localStorage/sessionStorage.

## 🔥 Configuração Obrigatória do Firebase

**ANTES DE USAR O SISTEMA, VOCÊ PRECISA CONFIGURAR O FIREBASE:**

### Passo 1: Criar Projeto no Firebase
1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Dê um nome ao projeto
4. Aceite os termos e crie

### Passo 2: Criar App Web
1. No projeto criado, clique no ícone Web (</>)
2. Registre o app
3. **COPIE** as credenciais que aparecem

### Passo 3: Ativar Firestore
1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste"
4. Selecione a localização mais próxima

### Passo 4: Configurar Regras de Segurança
1. Na aba "Regras" do Firestore, cole:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**ATENÇÃO:** Estas regras são para desenvolvimento. Em produção, use regras mais restritivas!

### Passo 5: Atualizar Credenciais no Código
Abra o arquivo `public/js/firebase-config.js` e substitua:

```javascript
const firebaseConfig = {
    apiKey: "COLE_SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

## 🚀 Como Usar

### 1. Servir o Projeto
Você precisa servir o projeto através de um servidor HTTP. Exemplos:

**Python 3:**
```bash
cd /tmp/cc-agent/58273945/project/public
python3 -m http.server 8000
```

**Node.js (http-server):**
```bash
npx http-server /tmp/cc-agent/58273945/project/public -p 8000
```

**PHP:**
```bash
cd /tmp/cc-agent/58273945/project/public
php -S localhost:8000
```

### 2. Acessar o Sistema
Abra o navegador em: `http://localhost:8000`

### 3. Como Professor
1. Clique em "Sou Professor"
2. Um código de 6 dígitos será gerado automaticamente
3. Compartilhe o código com os alunos
4. Use as funções do painel

### 4. Como Aluno
1. Clique em "Sou Aluno"
2. Digite o código da sala fornecido pelo professor
3. Insira seu nome
4. Acesse as funcionalidades da sala

## 📋 Funcionalidades Implementadas

### Professor:
- ✅ Criar sala (automático ao acessar painel)
- ✅ Gerar código único de 6 dígitos
- ✅ Gerar QR Code de acesso
- ✅ Ver alunos conectados em tempo real
- ✅ Controlar presença
- ✅ Criar atividades
- ✅ Ver respostas de atividades
- ✅ Criar quizzes
- ✅ Ver resultados de quizzes
- ✅ Receber perguntas
- ✅ Ver mãos levantadas
- ✅ Compartilhar materiais
- ✅ Encerrar sala

### Aluno:
- ✅ Entrar com código de 6 dígitos
- ✅ Marcar presença
- ✅ Levantar mão
- ✅ Fazer perguntas
- ✅ Responder atividades
- ✅ Participar de quizzes
- ✅ Acessar materiais
- ✅ Sair da sala

## 🔧 Estrutura dos Arquivos Novos

```
public/js/
├── firebase-config.js          ← CONFIGURE AQUI
├── firebase-room.js            ← Gerenciamento de salas
├── firebase-student.js         ← Gerenciamento de alunos
├── firebase-activities.js      ← Sistema de atividades
├── firebase-questions.js       ← Sistema de perguntas
├── firebase-hand-raise.js      ← Levantar mão
├── firebase-materials.js       ← Materiais de apoio
├── firebase-quiz.js            ← Quiz interativo
├── firebase-presence.js        ← Controle de presença
└── app-firebase.js             ← App principal
```

## ❌ Arquivos Removidos

Os seguintes arquivos não são mais necessários:
- `server.js`
- `config/db.js`
- `controllers/` (todos)
- `models/` (todos)
- `routes/` (todas)
- `public/js/api.js`
- `public/js/room.js`
- `public/js/quiz.js`
- `public/js/hand-raise.js`
- `public/js/materials.js`
- `public/js/questions-system.js`
- `public/js/activities-system.js`
- `public/js/app.js` (substituído por app-firebase.js)

## 📊 Collections do Firebase

O sistema cria automaticamente as seguintes collections:

- `salas` - Salas criadas pelos professores
- `alunos` - Alunos conectados nas salas
- `atividades` - Atividades criadas
- `respostas` - Respostas dos alunos
- `perguntas` - Perguntas enviadas
- `materiais` - Materiais compartilhados
- `quizzes` - Quizzes criados
- `quiz-respostas` - Respostas aos quizzes

## 🔄 Sincronização em Tempo Real

Tudo funciona em tempo real:
- Alunos conectados atualizam automaticamente
- Perguntas aparecem instantaneamente para o professor
- Mãos levantadas são notificadas em tempo real
- Quizzes aparecem automaticamente para os alunos
- Respostas são sincronizadas instantaneamente

## ⚠️ Troubleshooting

### Erro: Firebase is not defined
- Verifique se configurou as credenciais em `firebase-config.js`
- Verifique se está servindo via HTTP (não abrindo arquivo direto)

### Erro: Permission denied
- Verifique as regras de segurança no Firestore Console
- Certifique-se de que estão configuradas como no Passo 4

### Nada acontece ao clicar
- Abra o Console do navegador (F12)
- Verifique se há erros de importação
- Verifique se o Firebase foi configurado corretamente

### Dados não aparecem
- Verifique no Firestore Console se os dados estão sendo salvos
- Verifique se o código da sala está correto
- Tente recarregar a página

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `README.md` - Visão geral do projeto
- `FIREBASE_SETUP.md` - Guia detalhado de configuração

## 💡 Dicas

1. **Desenvolvimento Local**: Use o modo de teste do Firestore
2. **Produção**: Configure regras de segurança adequadas
3. **Debug**: Use o Console do navegador (F12) para ver logs
4. **Firestore Console**: Monitore os dados em tempo real

## 🎯 Próximos Passos

O sistema está completo e funcional. Opcionalmente, você pode:
- Adicionar Firebase Authentication
- Implementar Firebase Storage para uploads reais
- Adicionar Cloud Functions para lógica serverless
- Configurar regras de segurança mais restritivas

---

**Importante:** O sistema só funciona após configurar o Firebase corretamente!
