const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que a pasta uploads existe
const pastaUploads = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(pastaUploads)) fs.mkdirSync(pastaUploads, { recursive: true });

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pastaUploads),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nome = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, nome);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const permitidos = /jpeg|jpg|png|gif|webp|pdf/i;
    const ok = permitidos.test(path.extname(file.originalname));
    cb(ok ? null : new Error('Formato não permitido'), ok);
  }
});

// POST /api/upload  (campo: "arquivo")
router.post('/', upload.single('arquivo'), (req, res) => {
  if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
  res.json({
    ok: true,
    url: `/uploads/${req.file.filename}`,
    nome: req.file.originalname
  });
});

module.exports = router;
