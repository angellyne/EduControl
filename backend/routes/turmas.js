const router = require('express').Router();
const db = require('../db');

router.get('/', async (_, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, e.nome AS escola
      FROM turma t LEFT JOIN escola e ON e.id_escola = t.id_escola
      ORDER BY t.id_turma`);
    res.json(rows);
  } catch(e){ next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { serie, ano, capacidade, id_escola } = req.body;
    const [r] = await db.query(
      'INSERT INTO turma (serie, ano_letivo, capacidade, id_escola) VALUES (?,?,?,?)',
      [serie, ano, capacidade || 30, id_escola]);
    res.status(201).json({ id_turma: r.insertId });
  } catch(e){ next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM turma WHERE id_turma=?', [req.params.id]);
    res.json({ ok: true });
  } catch(e){ next(e); }
});
module.exports = router;
