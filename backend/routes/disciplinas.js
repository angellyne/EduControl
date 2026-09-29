const router = require('express').Router();
const db = require('../db');

router.get('/', async (_, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM disciplina ORDER BY id_disciplina');
    res.json(rows);
  } catch(e){ next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { nome, carga } = req.body;
    const [r] = await db.query(
      'INSERT INTO disciplina (nome, carga_horaria) VALUES (?,?)',
      [nome, carga || 0]);
    res.status(201).json({ id_disciplina: r.insertId });
  } catch(e){ next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM disciplina WHERE id_disciplina=?', [req.params.id]);
    res.json({ ok: true });
  } catch(e){ next(e); }
});
module.exports = router;
