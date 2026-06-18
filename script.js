// 1. Estado da Aplicação
let despesas = [];

// 2. Seleção de Elementos do DOM
const nomeInput = document.getElementById('nome-input');
const valorInput = document.getElementById('valor-input');
const btnAdicionar = document.getElementById('btn-adicionar');
const listaGastos = document.getElementById('lista-gastos');
const btnCalcular = document.getElementById('btn-calcular');
const caixaResultado = document.getElementById('caixa-resultado');

// Função auxiliar para evitar falhas de segurança (XSS) ao injetar texto no HTML
function escaparHTML(string) {
    const p = document.createElement('p');
    p.textContent = string;
    return p.innerHTML;
}

// 3. Adicionar um Novo Gasto
btnAdicionar.addEventListener('click', () => {
    const nome = nomeInput.value.trim();
    const valor = parseFloat(valorInput.value);

    // Validação básica
    if (!nome || isNaN(valor) || valor < 0) {
        alert('Por favor, insere um nome válido e um valor igual ou superior a 0.');
        return;
    }

    // Verifica se a pessoa já registou um gasto e soma, ou cria um novo registo
    const pessoaExistente = despesas.find(d => d.nome === nome);
    if (pessoaExistente) {
        pessoaExistente.valor += valor;
    } else {
        despesas.push({ nome, valor });
    }

    // Limpa os inputs
    nomeInput.value = '';
    valorInput.value = '';

    atualizarTabela();
});

// 4. Atualizar a Tabela de Despesas na Interface (Seguro)
function atualizarTabela() {
    listaGastos.innerHTML = ''; // Limpa a tabela atual

    despesas.forEach(despesa => {
        const linha = document.createElement('tr');
        linha.className = 'table-row';
        linha.innerHTML = `
            <td class="table-cell">${escaparHTML(despesa.nome)}</td>
            <td class="table-cell">${despesa.valor.toFixed(2)}€</td>
        `;
        listaGastos.appendChild(linha);
    });
}

// 5. Algoritmo de Cálculo e Otimização de Dívidas (Isolado)
function calcularDividas(listaDespesas) {
    const totalGastos = listaDespesas.reduce((acc, curr) => acc + curr.valor, 0);
    const mediaPorPessoa = totalGastos / listaDespesas.length;

    let devedores = [];
    let credores = [];

    listaDespesas.forEach(d => {
        const saldo = d.valor - mediaPorPessoa;
        if (saldo < -0.01) {
            devedores.push({ nome: d.nome, saldoOculto: Math.abs(saldo) });
        } else if (saldo > 0.01) {
            credores.push({ nome: d.nome, saldoOculto: saldo });
        }
    });

    const transacoes = [];
    let i = 0; // Índice de devedores
    let j = 0; // Índice de credores

    while (i < devedores.length && j < credores.length) {
        const devedor = devedores[i];
        const credor = credores[j];

        const valorAPagar = Math.min(devedor.saldoOculto, credor.saldoOculto);

        transacoes.push({
            devedor: devedor.nome,
            credor: credor.nome,
            valor: valorAPagar
        });

        devedor.saldoOculto -= valorAPagar;
        credor.saldoOculto -= valorAPagar;

        if (devedor.saldoOculto < 0.01) i++;
        if (credor.saldoOculto < 0.01) j++;
    }

    return { transacoes, totalGastos, mediaPorPessoa };
}

// 6. Evento de Clique para Calcular
btnCalcular.addEventListener('click', () => {
    if (despesas.length === 0) {
        alert('Adiciona pelo menos um gasto antes de calcular.');
        return;
    }

    const resultado = calcularDividas(despesas);
    mostrarResultados(resultado.transacoes, resultado.totalGastos, resultado.mediaPorPessoa);
});

// 7. Injetar os Resultados no HTML (Seguro)
function mostrarResultados(transacoes, total, media) {
    caixaResultado.classList.remove('hidden');

    let html = `<h2 class="text-2xl font-bold text-gray-800 mb-4">Resultado Final</h2>`;
    html += `<p class="mb-5 text-gray-600">Gasto Total: <strong>${total.toFixed(2)}€</strong> | Cada um devia pagar: <strong>${media.toFixed(2)}€</strong></p>`;

    if (transacoes.length === 0) {
        html += `<p class="text-lg text-green-700 font-semibold">Tudo certinho! Ninguém deve nada a ninguém. 🍻</p>`;
    } else {
        transacoes.forEach(t => {
            html += `<p class="text-lg text-orange-600 font-medium mb-2">
                💸 O <strong>${escaparHTML(t.devedor)}</strong> tem de pagar <strong>${t.valor.toFixed(2)}€</strong> a <strong>${escaparHTML(t.credor)}</strong>
            </p>`;
        });
    }

    caixaResultado.innerHTML = html;
}