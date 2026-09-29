const router = require('express').Router();
const db = require('../db');

router.get('/', async (_, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, a.nome AS aluno
      FROM responsavel r LEFT JOIN aluno a ON a.id_aluno = r.id_aluno
      ORDER BY r.id_responsavel`);
    res.json(rows);
  } catch(e){ next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { nome, cpf, telefone, id_aluno, parentesco } = req.body;
    const cpfLimpo = (cpf||'').replace(/\D/g,'');
    const [r] = await db.query(
      'INSERT INTO responsavel (nome, cpf, telefone, id_aluno, parentesco) VALUES (?,?,?,?,?)',
      [nome, cpfLimpo, telefone, id_aluno, parentesco]);
    res.status(201).json({ id_responsavel: r.insertId });
  } catch(e){ next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM responsavel WHERE id_responsavel=?', [req.params.id]);
    res.json({ ok: true });
  } catch(e){ next(e); }
});
module.exports = router;
