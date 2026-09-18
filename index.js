import express from 'express';
const app = express();
const PORT = 3000;

app.use(express.json());

// Array fixo em memória
let tarefas = [
    { id: 1, titulo: "Estudar Express", concluida: false },
    { id: 2, titulo: "Fazer exercícios de lógica", concluida: true },
    { id: 3, titulo: "Revisar banco de dados", concluida: false }
];

// ===== Middlewares =====

// Middleware 1: autenticação (simulada)
function autenticacao(req, res, next) {
    const auth = req.headers['authorization'];
    if (!auth) {
        return res.status(401).json({ erro: "Token de autenticação ausente" });
    }
    console.log("Autenticação: OK");
    next();
}

// Middleware 2: validação do corpo
function validarCorpo(req, res, next) {
    const { titulo } = req.body;
    if (!titulo) {
        return res.status(400).json({ erro: "O campo 'titulo' é obrigatório" });
    }
    console.log("Validação: OK");
    next();
}

// Middleware 3: registro de log
function logAcao(req, res, next) {
    console.log(`[LOG] ${new Date().toISOString()} - Nova tarefa sendo criada: ${req.body.titulo}`);
    next();
}

// ===== Rotas =====

// Rota raiz
app.get('/', (req, res) => {
    res.send('API de Tarefas no ar');
});

// GET /tarefas — lista todas, com filtro opcional ?concluida=true
app.get('/tarefas', (req, res) => {
    const { concluida } = req.query;

    if (concluida !== undefined) {
        const filtro = concluida === 'true';
        const tarefasFiltradas = tarefas.filter(t => t.concluida === filtro);
        return res.json(tarefasFiltradas);
    }

    res.json(tarefas);
});

// GET /tarefas/:id — busca por id
app.get('/tarefas/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const tarefa = tarefas.find(t => t.id === id);

    if (!tarefa) {
        return res.status(404).json({ erro: "Tarefa não encontrada" });
    }

    res.json(tarefa);
});

// POST /tarefas — cria nova tarefa, passando pelos 3 middlewares em ordem:
// autenticação → validação do corpo → registro de log
app.post('/tarefas', [autenticacao, validarCorpo, logAcao], (req, res) => {
    const novaTarefa = {
        id: tarefas.length + 1,
        titulo: req.body.titulo,
        concluida: false
    };

    tarefas.push(novaTarefa);
    res.status(201).json(novaTarefa);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});