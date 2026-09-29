const router = require('express').Router();
const db = require('../db');

router.get('/', async (_, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, e.nome AS escola
      FROM professor p LEFT JOIN escola e ON e.id_escola = p.id_escola
      ORDER BY p.id_professor`);
    res.json(rows);
  } catch(e){ next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { nome, cpf, email, id_escola } = req.body;
    const cpfLimpo = (cpf||'').replace(/\D/g,'');
    const [r] = await db.query(
      'INSERT INTO professor (nome, cpf, email, id_escola) VALUES (?,?,?,?)',
      [nome, cpfLimpo, email, id_escola || null]);
    res.status(201).json({ id_professor: r.insertId });
  } catch(e){ next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM professor WHERE id_professor=?', [req.params.id]);
    res.json({ ok: true });
  } catch(e){ next(e); }
});
module.exports = router;
