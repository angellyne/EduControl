const router = require('express').Router();
const db = require('../db');

router.get('/', async (_, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM escola ORDER BY id_escola');
    res.json(rows);
  } catch(e){ next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { nome, endereco, cnpj, telefone } = req.body;
    const [r] = await db.query(
      'INSERT INTO escola (nome, endereco, cnpj, telefone) VALUES (?,?,?,?)',
      [nome, endereco, cnpj, telefone]);
    res.status(201).json({ id_escola: r.insertId });
  } catch(e){ next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM escola WHERE id_escola=?', [req.params.id]);
    res.json({ ok: true });
  } catch(e){ next(e); }
});
module.exports = router;
