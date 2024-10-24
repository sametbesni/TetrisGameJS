const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');
nextContext.scale(20, 20);

let nextPiece = null;

function drawNextPiece(piece) {
    const nextPieceCanvas = document.getElementById('next-piece');
    const context = nextPieceCanvas.getContext('2d');
    context.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    // Parçayı çizin
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = piece.color;
                context.fillRect(x, y, 1, 1);
            }
        });
    });
}

function playerReset() {
    const pieces = 'TJLOSZI';
    if (!nextPiece) {
        nextPiece = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    }
    player.matrix = nextPiece;
    nextPiece = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    drawNextPiece();
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function drawMatrix(matrix, offset, ctx = context) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x,
                             y + offset.y,
                             1, 1);
            }
        });
    });
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [5, 5, 5],
            [0, 5, 0],
        ];
    } else if (type === 'O') {
        return [
            [7, 7],
            [7, 7],
        ];
    } else if (type === 'L') {
        return [
            [0, 6, 0],
            [0, 6, 0],
            [0, 6, 6],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 2, 0, 0],
            [0, 2, 0, 0],
            [0, 2, 0, 0],
            [0, 2, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 4, 4],
            [4, 4, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
let isPaused = false;
let highScore = 0;

function update(time = 0) {
    if (isPaused) return;
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    updateLevel();
    requestAnimationFrame(update);
}

function updateScore() {
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    if (scoreElement) {
        scoreElement.innerText = player.score;
    }
    if (player.score > highScore) {
        highScore = player.score;
        highScoreElement.innerText = highScore;
    }
}

function updateLevel() {
    const levelElement = document.getElementById('level');
    if (levelElement) {
        levelElement.innerText = Math.floor(player.score / 100) + 1;
    }
}

function gameOver() {
    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#fff';
    context.font = '1px Arial';
    context.fillText('GAME OVER', 3, 10);
}

function togglePause() {
    isPaused = !isPaused;
    if (!isPaused) {
        update();
    }
}

document.getElementById('pause').addEventListener('click', togglePause);
document.getElementById('play').addEventListener('click', () => {
    if (isPaused) {
        togglePause();
    }
});
document.getElementById('refresh').addEventListener('click', () => {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    playerReset();
    update();
});

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

function gameLoop() {
    drawNextPiece(nextPiece);
    updateScoreBoard(currentScore, currentLevel, highScore);
}

playerReset();
updateScore();
update();
