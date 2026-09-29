const router = require('express').Router();
const db = require('../db');

router.get('/', async (_, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT h.*, a.nome AS aluno
      FROM historico_presenca h JOIN aluno a ON a.id_aluno = h.id_aluno
      ORDER BY h.id_presenca DESC LIMIT 200`);
    res.json(rows);
  } catch(e){ next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id_aluno, data_presenca, hora_entrada, hora_saida, status_presenca } = req.body;
    // RN03: saída > entrada
    if (hora_saida && hora_saida <= hora_entrada) {
      return res.status(400).json({ erro: 'Hora de saída deve ser depois da entrada.' });
    }
    const [r] = await db.query(`
      INSERT INTO historico_presenca (id_aluno, data_presenca, hora_entrada, hora_saida, status_presenca)
      VALUES (?,?,?,?,?)`,
      [id_aluno, data_presenca, hora_entrada, hora_saida || null, status_presenca || 'PRESENTE']);
    res.status(201).json({ id_presenca: r.insertId });
  } catch(e){ next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM historico_presenca WHERE id_presenca=?', [req.params.id]);
    res.json({ ok: true });
  } catch(e){ next(e); }
});

module.exports = router;
