const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // <- importar o CORS

const app = express();
const PORT = 4000;

const pdfFolder = path.join(__dirname, './pdfs');

// Habilitar CORS para permitir acesso do front-end local (ex: localhost:5500)
app.use(cors({
  origin: 'http://localhost:5500'  // ou '*' para permitir qualquer origem (apenas em testes)
}));

// Serve os arquivos da pasta pdfs (ex: /pdfs/arquivo.pdf)
app.use('/pdfs', express.static(pdfFolder));

// Endpoint para listar arquivos da pasta pdfs
app.get('/api/files', (req, res) => {
  fs.readdir(pdfFolder, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao ler a pasta.' });
    }

    // Filtra apenas arquivos (ignora subpastas)
    const fileList = files.filter(file => {
      const fullPath = path.join(pdfFolder, file);
      return fs.statSync(fullPath).isFile();
    });

    res.json(fileList);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
