const express = require("express");
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const cors = require("cors");
const os = require("os");

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send({
    message: "API online!"
  })
  // res.sendFile(__dirname + '/index.html');
});

// Tentando descobrir a pasta "Documentos" mais robustamente, dependendo do SO
const homeDir = os.homedir();
const userDocumentsPath = path.join(homeDir, "Documents", "recibosClientes");

// Verificando qual é o caminho da pasta de "Documentos"
console.log('Pasta Documentos detectada:', userDocumentsPath);

// Diretório para armazenar os PDFs dentro do projeto
const projectPdfsPath = path.join(__dirname, "pdfs");

// Garantir que as pastas existam
if (!fs.existsSync(userDocumentsPath)) {
  console.log('A pasta "recibosClientes" não existe, criando...');
  fs.mkdirSync(userDocumentsPath, { recursive: true });
}

if (!fs.existsSync(projectPdfsPath)) {
  fs.mkdirSync(projectPdfsPath, { recursive: true });
}

app.post("/gerar-pdf", async (req, res) => {
  const {
    data,
    nome,
    cpf,
    endereco,
    bairro,
    cidade,
    uf,
    cep,
    imei,
    nome_aparelho,
    marca,
    cor,
    forma_pagamento,
    valor_pago,
    observacoes,
    valor_total,
    tempo_garantia,
    cap_armazenamento,
  } = req.body;
  

  try {
    // Carregando o modelo do PDF

      // Seleção de modelo de garantia
  let modelPdf = "";
  if (tempo_garantia == "1") {
    modelPdf = "./models_pdf/modelo-1.pdf"
  } 
  if (tempo_garantia == "3") {
    modelPdf = "./models_pdf/modelo-3.pdf";
  }
  if (tempo_garantia == "6") {
    modelPdf = "./models_pdf/modelo-6.pdf";
  }
  if (tempo_garantia == "1ano") {
    modelPdf = "./models_pdf/modelo-1ano.pdf";
  }

    const modeloBytes = fs.readFileSync(modelPdf);
    const pdfDoc = await PDFDocument.load(modeloBytes);
    const page = pdfDoc.getPages()[0];

    const fontSerifadaBold = await pdfDoc.embedFont(
      StandardFonts.TimesRomanBold
    );

    // Função para desenhar o texto nas coordenadas
    const drawText = (text, x, y, font, size) => {
      page.drawText(text.toUpperCase(), {
        x,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
    };

    // Tamanhos das fontes específicos
    const defaultSize = 11;
    const imeiSize = 10;
    const nomeAparelhoSize = 10;
    const marcaSize = 10;
    const corSize = 10;
    const formaPagamentoSize = 9;
    const valorPagoSize = 9;
    const observacoesSize = 9;

    // Desenhando o texto no PDF
    drawText(data, 489.55, 775.51, fontSerifadaBold, defaultSize);
    drawText(nome, 39.9, 688.27, fontSerifadaBold, defaultSize);
    drawText(cpf, 340.07, 688.27, fontSerifadaBold, defaultSize);
    drawText(endereco, 42.51, 655.69, fontSerifadaBold, defaultSize);
    drawText(bairro, 42.88, 623.26, fontSerifadaBold, defaultSize);
    drawText(cidade, 242.0, 623.26, fontSerifadaBold, defaultSize);
    drawText(uf, 424.35, 623.26, fontSerifadaBold, defaultSize);
    drawText(cep, 479.53, 623.26, fontSerifadaBold, defaultSize);
    drawText(imei, 47.73, 564.11, fontSerifadaBold, imeiSize);
    drawText(nome_aparelho, 191.66, 564.11, fontSerifadaBold, nomeAparelhoSize);
    drawText(marca, 354.99, 564.11, fontSerifadaBold, marcaSize);
    drawText(cor, 498.92, 564.11, fontSerifadaBold, corSize);
    drawText(
      forma_pagamento,
      70.48,
      540.62,
      fontSerifadaBold,
      formaPagamentoSize
    );
    drawText(
      "R$ " + valor_pago,
      226.34,
      540.62,
      fontSerifadaBold,
      valorPagoSize
    );
    drawText(observacoes, 329.63, 540.62, fontSerifadaBold, observacoesSize);
    drawText(valor_total, 483.13, 104.85, fontSerifadaBold, defaultSize);

    // Gerando o nome do arquivo PDF
    const pdfFileName = `${nome} - ${nome_aparelho} (${cap_armazenamento}GB) ${data.replace(
      /[^a-zA-Z0-9]/g,
      "-"
    )}.pdf`;

    // Caminho completo para salvar o PDF
    const pdfFilePath = path.join(userDocumentsPath, pdfFileName);
    const projectPdfFilePath = path.join(projectPdfsPath, pdfFileName);

    // Gerando o PDF
    const pdfBytes = await pdfDoc.save();

    // Salvando o PDF na pasta "Documentos"
    try {
      fs.writeFileSync(pdfFilePath, pdfBytes);
      console.log(`PDF salvo com sucesso em: ${pdfFilePath}`);
    } catch (err) {
      console.error("Erro ao salvar o PDF na pasta Documentos:", err);
      return res.status(500).send({ message: "Erro ao salvar o PDF." });
    }

    // Copiando o PDF para a pasta "pdfs" dentro do projeto
    fs.copyFile(pdfFilePath, projectPdfFilePath, (err) => {
      if (err) {
        console.error("Erro ao copiar o arquivo para a pasta do projeto:", err);
        return res.status(500).send({ message: "Erro ao gerar o PDF." });
      }

      // Retornando os links para os arquivos
      res.send({
        message: "PDF gerado com sucesso!",
        links: {
          pdf: `/pdfs/${pdfFileName}`,
        },
      });
    });
  } catch (error) {
    console.error("Erro ao gerar o PDF:", error);
    res.status(500).send({ message: "Erro ao gerar o PDF." });
  }
});


// Servindo os arquivos da pasta "pdfs" dentro do projeto
app.use("/pdfs", express.static(projectPdfsPath));

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
