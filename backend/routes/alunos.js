const router = require('express').Router();
const db = require('../db');

router.get('/', async (_, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, t.serie AS turma
      FROM aluno a LEFT JOIN turma t ON t.id_turma = a.id_turma
      ORDER BY a.id_aluno`);
    res.json(rows);
  } catch(e){ next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { nome, cpf, nascimento, id_turma } = req.body;
    const cpfLimpo = (cpf||'').replace(/\D/g,'');
    const [r] = await db.query(
      'INSERT INTO aluno (nome, cpf, data_nascimento, id_turma) VALUES (?,?,?,?)',
      [nome, cpfLimpo, nascimento, id_turma || null]);
    res.status(201).json({ id_aluno: r.insertId });
  } catch(e){ next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM aluno WHERE id_aluno=?', [req.params.id]);
    res.json({ ok: true });
  } catch(e){ next(e); }
});
module.exports = router;
