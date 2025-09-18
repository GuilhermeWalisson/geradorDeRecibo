document.getElementById("reciboForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    // Adiciona a marca "Outro" ao objeto de dados caso necessário
    if (data.marca === "OUTRO") {
        data.marca = data.marca_outro;
    }

    // Adiciona a forma de pagamento "Outro" ao objeto de dados caso necessário
    if (data.forma_pagamento === "OUTRO") {
        data.forma_pagamento = data.forma_pagamento_outro;
    }

    const response = await fetch("http://localhost:3000/gerar-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    console.log(response)

    const result = await response.json();
    console.log(result)
    //Mensage Logs
    alert(result.message);
    if (result.link) {
        const pdfLink = `/pdfs/${result.link.split('/').pop()}`;
        document.getElementById('alert-message').style.display = 'block';
        setTimeout(() => {
            document.getElementById('alert-message').style.display = 'none';
        }, 4000);
    }
});

function formatCPF(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 11) {
        input.value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
}

function formatCEP(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 8) {
        input.value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
}

function updateValorTotal() {
    const valorPago = document.getElementById('valorPago').value;
    const valorTotal = document.getElementById('valorTotal');
    valorTotal.value = valorPago;
}

document.getElementById("marcaSelect").addEventListener("change", function() {
    const typeMarca = this.value;
    const colorOutros = document.getElementById("marcaOutros");
    if (typeMarca === "OUTRO") {
        marcaOutros.style.display = "block";
    } else {
        marcaOutros.style.display = "none";
    }
});

document.getElementById("formaPagamentoSelect").addEventListener("change", function() {
    const formaPagamento = this.value;
    const formaPagamentoOutros = document.getElementById("formaPagamentoOutros");
    if (formaPagamento === "OUTRO") {
        formaPagamentoOutros.style.display = "block";
    } else {
        formaPagamentoOutros.style.display = "none";
    }
});