const router = require('express').Router();
const db = require('../db');

router.get('/', async (_, res) => {
  const [rows] = await db.query(`
    SELECT h.*, a.nome AS aluno
    FROM historico_presenca h JOIN aluno a ON a.id_aluno = h.id_aluno
    ORDER BY h.id_presenca DESC LIMIT 200`);
  res.json(rows);
});
router.post('/', async (req, res, next) => {
  try {
    const { id_aluno, data_presenca, hora_entrada, hora_saida, status_presenca } = req.body;
    await db.query(`
      INSERT INTO historico_presenca
        (id_aluno, data_presenca, hora_entrada, hora_saida, entrada_aluno, saida_aluno, status_presenca)
      VALUES (?,?,?,?, TIMESTAMP(?,?), ?, ?)`,
      [id_aluno, data_presenca, hora_entrada, hora_saida || null,
       data_presenca, hora_entrada,
       hora_saida ? `${data_presenca} ${hora_saida}` : null,
       status_presenca || 'PRESENTE']);
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM historico_presenca WHERE id_presenca=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});
module.exports = router;
