const router = require('express').Router();
const db = require('../db');

router.get('/', async (_, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, a.nome AS aluno
      FROM matricula m JOIN aluno a ON a.id_aluno = m.id_aluno
      ORDER BY m.id_matricula DESC`);
    res.json(rows);
  } catch(e){ next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id_aluno, periodo_letivo, comprovante_url } = req.body;
    const [r] = await db.query(`
      INSERT INTO matricula (numero_matricula, id_aluno, periodo_letivo, data_matricula, comprovante_url)
      VALUES (NULL, ?, ?, CURDATE(), ?)`,
      [id_aluno, periodo_letivo, comprovante_url || null]);
    const [[row]] = await db.query(
      'SELECT numero_matricula FROM matricula WHERE id_matricula=?', [r.insertId]);
    res.status(201).json({ id_matricula: r.insertId, numero_matricula: row.numero_matricula });
  } catch(e){ next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM matricula WHERE id_matricula=?', [req.params.id]);
    res.json({ ok: true });
  } catch(e){ next(e); }
});

module.exports = router;
