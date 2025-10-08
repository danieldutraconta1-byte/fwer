const API_BASE_URL = "https://eduhub-t8pz.onrender.com";

// se for local: const API_BASE_URL = "https://nome-do-seu-servico.onrender.com/api";

async function fetchData(endpoint, method = "GET", data = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erro na requisição: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erro na API:", error);
    throw error;
  }
}

// Funções específicas para cada entidade
const api = {
  professores: {
    create: (professor) => fetchData("/professores", "POST", professor),
    getAll: () => fetchData("/professores"),
    getById: (id) => fetchData(`/professores/${id}`),
    update: (id, professor) => fetchData(`/professores/${id}`, "PUT", professor),
    delete: (id) => fetchData(`/professores/${id}`, "DELETE"),
  },
  salas: {
    create: (sala) => fetchData("/salas", "POST", sala),
    getAll: () => fetchData("/salas"),
    getById: (id) => fetchData(`/salas/${id}`),
    update: (id, sala) => fetchData(`/salas/${id}`, "PUT", sala),
    delete: (id) => fetchData(`/salas/${id}`, "DELETE"),
  },
  alunos: {
    create: (aluno) => fetchData("/alunos", "POST", aluno),
    getAll: () => fetchData("/alunos"),
    getById: (id) => fetchData(`/alunos/${id}`),
    update: (id, aluno) => fetchData(`/alunos/${id}`, "PUT", aluno),
    delete: (id) => fetchData(`/alunos/${id}`, "DELETE"),
  },
  participacoes: {
    create: (participacao) => fetchData("/participacoes", "POST", participacao),
    getAll: () => fetchData("/participacoes"),
    getById: (id) => fetchData(`/participacoes/${id}`),
    update: (id, participacao) => fetchData(`/participacoes/${id}`, "PUT", participacao),
    delete: (id) => fetchData(`/participacoes/${id}`, "DELETE"),
  },
  presencas: {
    create: (presenca) => fetchData("/presencas", "POST", presenca),
    getAll: () => fetchData("/presencas"),
    getById: (id) => fetchData(`/presencas/${id}`),
    update: (id, presenca) => fetchData(`/presencas/${id}`, "PUT", presenca),
    delete: (id) => fetchData(`/presencas/${id}`, "DELETE"),
  },
  maosLevantadas: {
    create: (maoLevantada) => fetchData("/maos-levantadas", "POST", maoLevantada),
    getAll: () => fetchData("/maos-levantadas"),
    getById: (id) => fetchData(`/maos-levantadas/${id}`),
    update: (id, maoLevantada) => fetchData(`/maos-levantadas/${id}`, "PUT", maoLevantada),
    delete: (id) => fetchData(`/maos-levantadas/${id}`, "DELETE"),
  },
  perguntasAluno: {
    create: (perguntaAluno) => fetchData("/perguntas-aluno", "POST", perguntaAluno),
    getAll: () => fetchData("/perguntas-aluno"),
    getById: (id) => fetchData(`/perguntas-aluno/${id}`),
    update: (id, perguntaAluno) => fetchData(`/perguntas-aluno/${id}`, "PUT", perguntaAluno),
    delete: (id) => fetchData(`/perguntas-aluno/${id}`, "DELETE"),
  },
  quizzes: {
    create: (quiz) => fetchData("/quizzes", "POST", quiz),
    getAll: () => fetchData("/quizzes"),
    getById: (id) => fetchData(`/quizzes/${id}`),
    update: (id, quiz) => fetchData(`/quizzes/${id}`, "PUT", quiz),
    delete: (id) => fetchData(`/quizzes/${id}`, "DELETE"),
  },
  perguntas: {
    create: (pergunta) => fetchData("/perguntas", "POST", pergunta),
    getAll: () => fetchData("/perguntas"),
    getById: (id) => fetchData(`/perguntas/${id}`),
    update: (id, pergunta) => fetchData(`/perguntas/${id}`, "PUT", pergunta),
    delete: (id) => fetchData(`/perguntas/${id}`, "DELETE"),
  },
  opcoes: {
    create: (opcao) => fetchData("/opcoes", "POST", opcao),
    getAll: () => fetchData("/opcoes"),
    getById: (id) => fetchData(`/opcoes/${id}`),
    update: (id, opcao) => fetchData(`/opcoes/${id}`, "PUT", opcao),
    delete: (id) => fetchData(`/opcoes/${id}`, "DELETE"),
  },
  respostas: {
    create: (resposta) => fetchData("/respostas", "POST", resposta),
    getAll: () => fetchData("/respostas"),
    getById: (id) => fetchData(`/respostas/${id}`),
    update: (id, resposta) => fetchData(`/respostas/${id}`, "PUT", resposta),
    delete: (id) => fetchData(`/respostas/${id}`, "DELETE"),
  },
  materiais: {
    create: (material) => fetchData("/materiais", "POST", material),
    getAll: () => fetchData("/materiais"),
    getById: (id) => fetchData(`/materiais/${id}`),
    update: (id, material) => fetchData(`/materiais/${id}`, "PUT", material),
    delete: (id) => fetchData(`/materiais/${id}`, "DELETE"),
  },
};

window.api = api; // Expor a API globalmente para fácil acesso
