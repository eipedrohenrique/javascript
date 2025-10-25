// JAVASCRIPT (A Lógica da Roleta com Peso e Embaralhamento - Versão Bootstrap)
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');
const movieInput = document.getElementById('movie-input');
const weightInput = document.getElementById('weight-input');
const addMovieBtn = document.getElementById('add-movie-btn');
const spinBtn = document.getElementById('spin-btn');
const resultDiv = document.getElementById('result');
const movieListContainer = document.getElementById('movie-list-container');
const movieListUl = document.getElementById('movie-list');
const spinDurationInput = document.getElementById('spin-duration');
const shuffleBtn = document.getElementById('shuffle-btn');

// Estrutura do filme: { name: 'Filme X', weight: 10 }
let movies = [];
// Cores para o Canvas (sem depender das classes Bootstrap)
const colors = ["#0d6efd", "#6610f2", "#6f42c1", "#d63384", "#fd7e14", "#ffc107", "#20c997", "#198754"];
let isSpinning = false;

let displayMovies = []; // Array que será usado para o desenho da roleta (embaralhado)

// Função de embaralhamento (Fisher-Yates)
const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const drawRoulette = () => {
    const segments = displayMovies;
    const totalWeight = segments.reduce((sum, movie) => sum + movie.weight, 0);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;
    let currentStartAngle = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 18px sans-serif'; 

    if (segments.length === 0 || totalWeight === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Adicione filmes e seus pesos!', centerX, centerY);
        return;
    }

    // Desenha cada segmento proporcional ao seu peso
    segments.forEach((movie, i) => {
        const segmentAngle = (movie.weight / totalWeight) * (2 * Math.PI);
        const endAngle = currentStartAngle + segmentAngle;

        // Desenha a fatia
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentStartAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        
        // Desenha o texto
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(currentStartAngle + segmentAngle / 2); 
        ctx.textAlign = 'right';
        ctx.fillStyle = '#121212';
        const text = movie.name.length > 15 ? movie.name.substring(0, 14) + '...' : movie.name;
        ctx.fillText(text, radius - 15, 10);
        ctx.restore();
        
        currentStartAngle = endAngle;
    });
};

const updateUI = () => {
    const totalWeight = movies.reduce((sum, movie) => sum + movie.weight, 0);

    // 1. Atualiza o array de exibição com a ordem embaralhada
    if (movies.length > 0) {
        if (displayMovies.length === 0 || displayMovies.length !== movies.length) {
             displayMovies = [...movies];
        }
    } else {
        displayMovies = [];
    }

    // 2. Atualiza a lista lateral (usando classes Bootstrap)
    movieListUl.innerHTML = '';
    if (movies.length > 0) {
        movieListContainer.style.display = 'block';
    } else {
        movieListContainer.style.display = 'none';
    }
    
    movies.forEach((movie, index) => {
        const li = document.createElement('li');
        // Aplica classes de lista do Bootstrap
        li.className = 'list-group-item d-flex justify-content-between align-items-center'; 
        
        const movieText = document.createElement('span');
        movieText.textContent = movie.name;

        const weightDisplay = document.createElement('span');
        const percentage = totalWeight > 0 ? ((movie.weight / totalWeight) * 100).toFixed(1) : 0;
        weightDisplay.textContent = `(${movie.weight}x - ${percentage}%)`;
        weightDisplay.className = 'movie-weight';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.className = 'delete-btn text-center'; 
        deleteBtn.dataset.index = index; 
        
        li.appendChild(movieText);
        li.appendChild(weightDisplay);
        li.appendChild(deleteBtn);
        movieListUl.appendChild(li);
    });

    // 3. Desenha a roleta
    drawRoulette();
    
    spinBtn.disabled = movies.length === 0 || totalWeight === 0 || isSpinning;
};

const addMovie = () => {
    const movieName = movieInput.value.trim();
    const movieWeight = parseInt(weightInput.value, 10);
    
    if (movieName && movieWeight >= 1 && !isSpinning) {
        movies.push({ name: movieName, weight: movieWeight });
        movieInput.value = '';
        weightInput.value = 1;
        
        displayMovies = shuffleArray(movies); 
        updateUI();
    }
    movieInput.focus();
};

const deleteMovie = (index) => {
    if (!isSpinning) {
        movies.splice(index, 1); 
        displayMovies = shuffleArray(movies); 
        updateUI();
    }
};

const handleShuffle = () => {
    if (movies.length > 1 && !isSpinning) {
        displayMovies = shuffleArray(movies);
        drawRoulette(); 
    }
};

const spin = () => {
    const totalWeight = movies.reduce((sum, movie) => sum + movie.weight, 0);
    if (isSpinning || totalWeight === 0) return;

    isSpinning = true;
    spinBtn.disabled = true;
    resultDiv.textContent = 'Sorteando...';
    
    // 1. Determinar o VENCEDOR (Probabilidade)
    let randomValue = Math.random() * totalWeight; 
    let winningIndex = -1;
    let cumulativeWeight = 0;
    for (let i = 0; i < movies.length; i++) {
        cumulativeWeight += movies[i].weight;
        if (randomValue < cumulativeWeight) {
            winningIndex = i;
            break;
        }
    }
    const winner = movies[winningIndex];

    // 2. Determinar o ÂNGULO DE PARADA (Visual)
    const winningSegment = winner; 
    const winningSegmentIndex = displayMovies.findIndex(m => m.name === winningSegment.name && m.weight === winningSegment.weight);
    
    let angleStart = 0;
    let angleEnd = 0;
    
    for (let i = 0; i < displayMovies.length; i++) {
        const segmentAngle = (displayMovies[i].weight / totalWeight) * (2 * Math.PI);
        angleEnd = angleStart + segmentAngle;
        
        if (i === winningSegmentIndex) {
            break; 
        }
        angleStart = angleEnd;
    }

    const middleAngleOfSegment = angleStart + (angleEnd - angleStart) / 2;
    const targetAngleOnWheel = (2 * Math.PI - middleAngleOfSegment) % (2 * Math.PI);
    
    const variation = (Math.random() - 0.5) * (angleEnd - angleStart) * 0.5;
    const finalTargetAngle = (targetAngleOnWheel + variation) % (2 * Math.PI);

    // 3. Configurar e Iniciar a Animação
    const spinDuration = (parseInt(spinDurationInput.value, 10) || 5) * 1000;
    const numRotations = 5; 
    const finalRotationInRad = (numRotations * 2 * Math.PI) + finalTargetAngle;
    
    let start = null;

    const spinAnimation = (timestamp) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out-cubic

        const currentRotation = finalRotationInRad * easedProgress;
        canvas.style.transform = `rotate(${currentRotation}rad)`;

        if (progress < 1) {
            requestAnimationFrame(spinAnimation);
        } else {
            // Fim da animação
            canvas.style.transform = `rotate(${finalRotationInRad}rad)`;
            resultDiv.textContent = `O filme sorteado é: ${winner.name}!`;
            isSpinning = false;
            updateUI();
        }
    };
    
    requestAnimationFrame(spinAnimation);
};

// --- Event Listeners ---
addMovieBtn.addEventListener('click', addMovie);
shuffleBtn.addEventListener('click', handleShuffle); 

movieInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addMovie();
    }
});
weightInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addMovie();
    }
});

movieListUl.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const index = parseInt(e.target.dataset.index, 10);
        deleteMovie(index);
    }
});

spinBtn.addEventListener('click', spin);

// Inicialização: Embaralha a lista inicial (se houver) e desenha
displayMovies = shuffleArray(movies);
updateUI();