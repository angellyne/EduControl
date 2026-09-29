const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api/escolas',      require('./routes/escolas'));
app.use('/api/professores',  require('./routes/professores'));
app.use('/api/disciplinas',  require('./routes/disciplinas'));
app.use('/api/turmas',       require('./routes/turmas'));
app.use('/api/alunos',       require('./routes/alunos'));
app.use('/api/responsaveis', require('./routes/responsaveis'));
app.use('/api/matriculas',   require('./routes/matriculas'));
app.use('/api/frequencia',   require('./routes/frequencia'));

app.get('/', (req, res) => res.json({ ok: true, sistema: 'EduControl API v2.0' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ erro: err.sqlMessage || err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ EduControl API rodando em http://localhost:${PORT}`));
