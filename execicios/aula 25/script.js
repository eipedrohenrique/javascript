// ====================================================================
// Variáveis Globais
// ====================================================================
let filmes = [];
let filmesComPeso = []; // Lista expandida para o sorteio (com repetições)
let isGirando = false;

// Elementos do DOM
const filmeInput = document.getElementById('filmeInput');
const pesoInput = document.getElementById('pesoInput');
const adicionarFilmeBtn = document.getElementById('adicionarFilmeBtn');
const listaFilmesUl = document.getElementById('listaFilmes');
const listaVaziaMsg = document.getElementById('listaVaziaMsg');
const girarBtn = document.getElementById('girarBtn');
const embaralharBtn = document.getElementById('embaralharBtn');
const limparListaBtn = document.getElementById('limparListaBtn');
const timerInput = document.getElementById('timerInput');
const resultadoModal = new bootstrap.Modal(document.getElementById('resultadoModal'));
const filmeSorteadoNome = document.getElementById('filmeSorteadoNome');

// Canvas e Contexto
const canvas = document.getElementById('roletaCanvas');
const ctx = canvas.getContext('2d');
const roletaRadius = 200; // Raio da roleta (ajuste para o tamanho do canvas)
canvas.width = roletaRadius * 2;
canvas.height = roletaRadius * 2;
const centroX = roletaRadius;
const centroY = roletaRadius;

// ====================================================================
// Funções de Gerenciamento da Lista
// ====================================================================

/**
 * Adiciona um filme à lista principal e recalcula a lista com pesos.
 */
function adicionarFilme() {
    const nome = filmeInput.value.trim();
    let peso = parseInt(pesoInput.value);

    if (nome === "") {
        alert("Por favor, digite o nome do filme.");
        return;
    }

    if (isNaN(peso) || peso < 1) {
        peso = 1; // Garante um peso mínimo de 1
        pesoInput.value = 1;
    }

    filmes.push({ nome, peso });

    // Limpa inputs
    filmeInput.value = '';
    pesoInput.value = 1;

    // Atualiza tudo
    atualizarListaFilmesDOM();
    recalcularFilmesComPeso();
    desenharRoleta();
}

/**
 * Remove um filme da lista principal.
 * @param {number} index - O índice do filme a ser removido na lista 'filmes'.
 */
function removerFilme(index) {
    if (confirm(`Tem certeza que deseja remover "${filmes[index].nome}"?`)) {
        filmes.splice(index, 1);
        atualizarListaFilmesDOM();
        recalcularFilmesComPeso();
        desenharRoleta();
    }
}

/**
 * Embaralha a ordem dos filmes na lista principal.
 */
function embaralharFilmes() {
    if (filmes.length === 0) return;
    
    // Algoritmo de Fisher-Yates para embaralhar
    for (let i = filmes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filmes[i], filmes[j]] = [filmes[j], filmes[i]];
    }

    atualizarListaFilmesDOM();
    recalcularFilmesComPeso();
    desenharRoleta();
}

/**
 * Limpa toda a lista de filmes.
 */
function limparLista() {
    if (filmes.length === 0) return;
    if (confirm("Tem certeza que deseja limpar toda a lista de filmes?")) {
        filmes = [];
        filmesComPeso = [];
        atualizarListaFilmesDOM();
        desenharRoleta();
    }
}

/**
 * Cria a lista expandida para o sorteio, repetindo os filmes de acordo com o peso.
 */
function recalcularFilmesComPeso() {
    filmesComPeso = [];
    filmes.forEach(filme => {
        for (let i = 0; i < filme.peso; i++) {
            filmesComPeso.push(filme.nome);
        }
    });

    girarBtn.disabled = filmesComPeso.length < 2;
}

/**
 * Atualiza o HTML da lista de filmes (coluna lateral).
 */
function atualizarListaFilmesDOM() {
    listaFilmesUl.innerHTML = '';
    if (filmes.length === 0) {
        listaFilmesUl.innerHTML = `<li class="list-group-item text-center text-muted" id="listaVaziaMsg">Adicione filmes para começar!</li>`;
    } else {
        filmes.forEach((filme, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item filme-item';
            li.innerHTML = `
                <span class="filme-nome">${filme.nome}</span>
                <span class="filme-peso">(${filme.peso}x)</span>
                <button class="btn btn-sm btn-outline-danger btn-remover-filme" data-index="${index}">
                    <i class="bi bi-x-lg"></i> Excluir
                </button>
            `;
            listaFilmesUl.appendChild(li);
        });

        // Adiciona listeners para os botões de remover
        document.querySelectorAll('.btn-remover-filme').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                removerFilme(index);
            });
        });
    }
}


// ====================================================================
// Funções de Desenho da Roleta (Canvas)
// ====================================================================

/**
 * Gera uma cor hexadecimal aleatória.
 * @returns {string} Cor em formato '#RRGGBB'.
 */
function gerarCorAleatoria() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * Desenha a roleta no Canvas.
 */
function desenharRoleta() {
    // Se a lista estiver vazia, apenas limpa o canvas
    if (filmes.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#e9ecef'; // Cor de fundo suave
        ctx.beginPath();
        ctx.arc(centroX, centroY, roletaRadius, 0, 2 * Math.PI);
        ctx.fill();

        // Texto informativo
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("Adicione filmes!", centroX, centroY);
        return;
    }

    const numOpcoes = filmes.length;
    const angleSlice = (2 * Math.PI) / numOpcoes; // Ângulo de cada fatia

    let currentAngle = 0;
    
    // Para garantir que as cores sejam as mesmas em um redesenho, 
    // podemos armazená-las ou usar um gerador determinístico. 
    // Para simplificar, vamos gerar novas cores a cada redesenho.
    
    filmes.forEach(filme => {
        const startAngle = currentAngle;
        const endAngle = currentAngle + angleSlice;

        // 1. Desenha a fatia
        ctx.beginPath();
        ctx.moveTo(centroX, centroY);
        ctx.arc(centroX, centroY, roletaRadius, startAngle, endAngle);
        ctx.closePath();
        
        ctx.fillStyle = gerarCorAleatoria(); 
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 2. Desenha o texto
        ctx.save(); // Salva o estado atual
        
        ctx.translate(centroX, centroY);
        const textAngle = startAngle + angleSlice / 2;
        ctx.rotate(textAngle);
        
        ctx.fillStyle = '#000'; // Cor do texto
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'right';

        // Posição do texto (perto da borda)
        const textX = roletaRadius * 0.9;
        const textY = 0; 

        // O texto precisa ser quebrado para caber
        const maxLen = 12; // Número máximo de caracteres por linha
        const nomeFilme = filme.nome.toUpperCase();

        if (nomeFilme.length > maxLen * 2) {
             // Se for muito longo, truncar
             const textoLinha1 = nomeFilme.substring(0, maxLen) + '...';
             ctx.fillText(textoLinha1, textX - 5, textY - 5);
        } else if (nomeFilme.length > maxLen) {
            // Se for longo, dividir em duas linhas
            const meio = Math.ceil(nomeFilme.length / 2);
            const textoLinha1 = nomeFilme.substring(0, meio).trim();
            const textoLinha2 = nomeFilme.substring(meio).trim();
            ctx.fillText(textoLinha1, textX - 5, textY - 10);
            ctx.fillText(textoLinha2, textX - 5, textY + 10);
        } else {
            // Curto, uma linha
            ctx.fillText(nomeFilme, textX - 5, textY + 5);
        }

        ctx.restore(); // Restaura o estado anterior
        
        currentAngle = endAngle;
    });

    // Desenha o círculo central (opcional)
    ctx.beginPath();
    ctx.arc(centroX, centroY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// ====================================================================
// Funções de Giro e Sorteio
// ====================================================================

/**
 * Calcula a rotação necessária para que o filme sorteado pare no ponteiro.
 * @param {number} sorteadoIndex - O índice do filme sorteado na lista `filmes`.
 * @param {number} numOpcoes - Número total de fatias.
 * @returns {number} O ângulo de rotação final.
 */
function calcularAnguloSorteado(sorteadoIndex, numOpcoes) {
    const anguloPorFatia = 360 / numOpcoes;
    
    // O ponteiro está no topo (0 graus).
    // O meio da fatia sorteada deve parar no topo.
    
    // Ângulo inicial do centro da fatia (em relação ao "zero" da roleta)
    const anguloCentroFatia = 360 - (sorteadoIndex * anguloPorFatia + anguloPorFatia / 2);
    
    // A roleta precisa girar até que o ânguloCentroFatia esteja no topo.
    // Adiciona giros completos para um efeito visual de várias voltas
    const girosCompletos = 5; // Mínimo de 5 voltas
    const rotacaoTotal = girosCompletos * 360 + anguloCentroFatia;
    
    // Adiciona um pequeno offset aleatório para que não pare sempre exatamente no centro
    const offsetAleatorio = Math.random() * (anguloPorFatia / 2) - (anguloPorFatia / 4);
    
    return rotacaoTotal + offsetAleatorio;
}

/**
 * Inicia a animação de giro da roleta.
 */
function girarRoleta() {
    if (isGirando || filmesComPeso.length === 0) return;
    
    isGirando = true;
    girarBtn.disabled = true;
    adicionarFilmeBtn.disabled = true;
    embaralharBtn.disabled = true;

    // 1. Sorteia um filme da lista com pesos (maior chance se peso > 1)
    const sorteadoNome = filmesComPeso[Math.floor(Math.random() * filmesComPeso.length)];
    
    // 2. Encontra o índice do *primeiro* item que corresponde ao sorteado na lista `filmes` (sem peso)
    const sorteadoIndex = filmes.findIndex(f => f.nome === sorteadoNome);
    
    // 3. Calcula o ângulo final
    const anguloFinal = calcularAnguloSorteado(sorteadoIndex, filmes.length);
    
    // 4. Inicia a animação CSS
    const tempoGiroSegundos = parseFloat(timerInput.value) || 3;
    
    canvas.style.transition = `transform ${tempoGiroSegundos}s cubic-bezier(0.25, 0.1, 0.25, 1)`; // Efeito "slow out"
    canvas.style.transform = `rotate(${anguloFinal}deg)`;
    
    // 5. Após o tempo de giro, finaliza o sorteio
    setTimeout(() => {
        // Remove a transição para que a próxima rotação comece do zero
        canvas.style.transition = 'none'; 
        
        // Ajusta o transform para manter a posição final sem o acúmulo de transições
        // Usa o módulo para manter o ângulo dentro de 0-360 se for necessário para debug
        const anguloModulo = anguloFinal % 360; 
        canvas.style.transform = `rotate(${anguloFinal}deg)`;
        
        isGirando = false;
        girarBtn.disabled = filmesComPeso.length < 2;
        adicionarFilmeBtn.disabled = false;
        embaralharBtn.disabled = false;
        
        // Exibe o resultado no modal
        filmeSorteadoNome.textContent = sorteadoNome;
        resultadoModal.show();
        
        // Opcional: Remover o filme sorteado da lista
        // const indiceParaRemover = filmes.findIndex(f => f.nome === sorteadoNome);
        // if (indiceParaRemover !== -1) {
        //     removerFilme(indiceParaRemover);
        // }

    }, tempoGiroSegundos * 1000);
}


// ====================================================================
// Inicialização e Event Listeners
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicialização da Roleta
    desenharRoleta();
    
    // Event Listeners
    adicionarFilmeBtn.addEventListener('click', adicionarFilme);
    girarBtn.addEventListener('click', girarRoleta);
    embaralharBtn.addEventListener('click', embaralharFilmes);
    limparListaBtn.addEventListener('click', limparLista);

    // Permitir adicionar filme com a tecla Enter
    filmeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita o submit padrão de um formulário
            adicionarFilme();
        }
    });

    // Inicializa a lista e o botão
    atualizarListaFilmesDOM();
    recalcularFilmesComPeso();
});