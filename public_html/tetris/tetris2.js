let initPlacement = 4;
let score = 0;
let level = 1;
let gBArrayHeight = 20;
let gBArrayWidth = 12;
let status = "Press Space to Start";
let tetris_clear = false;

let tetrominos = // Push T 
    [[[1, 0], [0, 1], [1, 1], [2, 1]],
    // Push I
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    // Push J
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    // Push Square
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    // Push L
    [[2, 0], [0, 1], [1, 1], [2, 1]],
    // Push S
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    // Push Z
    [[0, 0], [1, 0], [1, 1], [2, 1]]];

let TETROMINO_TYPES = {
    T: 0,
    I: 1,
    J: 2,
    SQUARE: 3,
    L: 4,
    S: 5,
    Z: 6,
}

let tetrominoColors = ['purple', 'cyan', 'blue', 'yellow', 'orange', 'green', 'red'];

let curTetromino;
let curTetrominoColor;
let curTetrominoType;

let nextTetromino;
let nextTetrominoColor;
let nextTetrominoType;

let rotateIndex = 0;

let gameBoard = [...Array(gBArrayWidth)].map(e => Array(gBArrayHeight).fill(0));

let coordinateArray = [...Array(gBArrayWidth)].map(e => Array(gBArrayHeight).fill(0));

class Coordinates {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

document.addEventListener('DOMContentLoaded', SetupCanvas);

function SetupCanvas() {
    canvas = document.getElementById('my-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 936;
    canvas.height = 956;

    ctx.scale(2, 2);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(8, 8, 280, 462);

    tetrisLogo = new Image(161, 54);
    tetrisLogo.onload = DrawTetrisLogo;
    tetrisLogo.src = "tetris.png";

    // Set font for score label text and draw
    ctx.fillStyle = 'black';
    ctx.font = '21px Arial';
    ctx.fillText("SCORE", 300, 98);

    // Draw score rectangle
    ctx.strokeRect(300, 107, 161, 24);

    // Draw score
    ctx.fillText(score.toString(), 310, 127);

    // Draw start thing
    ctx.fillText(status, 10, 200);

    // Draw level label text
    ctx.fillText("LEVEL", 300, 157);

    // Draw level rectangle
    ctx.strokeRect(300, 171, 161, 24);

    // Draw level
    ctx.fillText(level.toString(), 310, 190);

    // Draw next label text
    ctx.fillText("Next Piece", 300, 221);

    // Draw playing condition

    // Draw playing condition rectangle
    ctx.strokeRect(300, 232, 161, 95);

    // Draw controls label text
    ctx.fillText("CONTROLS", 300, 354);

    // Draw controls rectangle
    ctx.strokeRect(300, 366, 161, 104);

    // Draw controls text
    ctx.font = '19px Arial';
    ctx.fillText("A : Move Left", 310, 388);
    ctx.fillText("D : Move Right", 310, 413);
    ctx.fillText("S : Move Down", 310, 438);
    ctx.fillText("E : Rotate Right", 310, 463);

    // 2. Handle keyboard presses
    document.addEventListener('keydown', HandleKeyPress);

    CreateCoordArray();
    
    // CreateTetromino();
}

function HandleKeyPress(key) {
    if ((status === "Press Space to Start" || status === "Game Over") &&
        key.keyCode === 32) {
            RestartGame();
    }
    if (status === "") {
        // a keycode (LEFT)
        if (key.keyCode === 65) {
            MoveTetromino(-1, 0);
            // d keycode (RIGHT)
        } else if (key.keyCode === 68) {
            MoveTetromino(1, 0);
            // s keycode (DOWN)
        } else if (key.keyCode === 83) {
            MoveTetromino(0, 1);
            // 9. e keycode calls for rotation of Tetromino
        } else if (key.keyCode === 69) {
            RotateTetromino(true);
        }
    }
}

// move tetromino based on input
function MoveTetromino(x, y) {
    let tetromino = [];
    let oldTetromino = JSON.parse(JSON.stringify(curTetromino));
    for (let i = 0; i < curTetromino.length; i++) {
        tetromino.push([curTetromino[i][0] + x, curTetromino[i][1] + y]);
    }
    if (!HitWall(tetromino) && !HitTetromino(tetromino)) {
        curTetromino = tetromino;
        DeleteTetromino(oldTetromino);
        DrawTetromino(curTetromino, curTetrominoColor);
        return true;
    } else if (x === 0 && y === 1) { // if collision and going down, set
        AddTetrominoToGameBoard(curTetromino, curTetrominoColor);
        CreateTetromino();
    }
    return false;
}

function HitWall(tetromino) {
    for (let i = 0; i < tetromino.length; i++) {
        if (tetromino[i][0] < 0 || tetromino[i][1] < 0 ||
            tetromino[i][0] > gBArrayWidth - 1 || tetromino[i][1] > gBArrayHeight - 1) {
            return true;
        }
    }
    return false;
}

function HitTetromino(tetromino) {
    for (let i = 0; i < tetromino.length; i++) {
        if (typeof gameBoard[tetromino[i][0]][tetromino[i][1]] === 'string') {
            return true;
        }
    }
    return false;
}

function AddTetrominoToGameBoard(tetromino, tetrominoColor) {
    for (let i = 0; i < tetromino.length; i++) {
        gameBoard[tetromino[i][0]][tetromino[i][1]] = tetrominoColor;
    }
    let numRowsCleared = 0;
    for (let i = 0; i < gBArrayHeight; i++) {
        let clear = true;
        for (let j = 0; j < gBArrayWidth; j++) {
            if (gameBoard[j][i] === 0) {
                clear = false;
            }
        }
        if (clear) {
            console.log('clear');
            let toDelete = [];
            numRowsCleared++;
            for (let k = i; k > 0; k--) {
                let filledIn = false;
                for (let j = 0; j < gBArrayWidth; j++) {
                    if (gameBoard[j][k-1] !== 0) {
                        filledIn = true;
                    }
                    console.log('moving ', j, k-1,  gameBoard[j][k-1], 'from ', j,k, gameBoard[j][k]);
                    gameBoard[j][k] = gameBoard[j][k-1];
                }
                if (!filledIn) {
                    break;
                }
            }
            // clear first row (cant copy down)
            for (let j = 0; j < gBArrayWidth; j++) {
                gameBoard[j][0] = 0;
            }
            ReDrawGameBoard();
        }
    }
    if (numRowsCleared === 1) {
        score += 100;
        tetris_clear = false;
    } else if (numRowsCleared === 2) {
        score += 300;
        tetris_clear = false;
    } else if (numRowsCleared === 3) {
        score += 550;
        tetris_clear = false;
    } else if (numRowsCleared >= 4) {
        // back-to-back tetris get 1200 (normal gets 800)
        if (tetris_clear) {
            score += 400;
        }
        score += 800;
        tetris_clear = true;
    }
    ctx.fillStyle = 'white';
    ctx.fillRect(310, 109, 140, 19);
    ctx.fillStyle = 'black';
    ctx.font = '21px Arial';
    ctx.fillText(score.toString(), 310, 127);
}



function ReDrawGameBoard() {
    for (let i = 0; i < gBArrayWidth; i++) {
        for (let j = 0; j < gBArrayHeight; j++) {
            let coordinate = coordinateArray[i][j];
            ctx.fillStyle = typeof gameBoard[i][j] === 'string' ? 
                gameBoard[i][j] : 'white';
            ctx.fillRect(coordinate.x, coordinate.y, 21, 21);
        }
    }
}


function DeleteTetromino(tetromino) {
    for (let i = 0; i < tetromino.length; i++) {
        let coordinate = coordinateArray[tetromino[i][0]][tetromino[i][1]];
        ctx.fillStyle = 'white';
        ctx.fillRect(coordinate.x, coordinate.y, 21, 21);
    }
}

function DrawTetromino(tetromino, tetrominoColor) {
    for (let i = 0; i < tetromino.length; i++) {
        let coordinate = coordinateArray[tetromino[i][0]][tetromino[i][1]];
        ctx.fillStyle = tetrominoColor;
        ctx.fillRect(coordinate.x, coordinate.y, 21, 21);
    }
}

function CreateCoordArray() {
    let xR = 0, yR = 19;
    let i = 0, j = 0;
    for (let y = 9; y <= 446; y += 23) {
        // 12 * 23 = 276 - 12 = 264 Max X value
        for (let x = 11; x <= 264; x += 23) {
            coordinateArray[i][j] = new Coordinates(x, y);
            i++;
        }
        j++;
        i = 0;
    }
}

function CreateTetromino() {
    rotateIndex = 0;
    if (nextTetromino == null) {
        let randomTetromino = Math.floor(Math.random() * tetrominos.length);
        nextTetromino = tetrominos[randomTetromino];
        nextTetrominoColor = tetrominoColors[randomTetromino];
        nextTetrominoType = randomTetromino;
    }
    curTetromino = nextTetromino;
    curTetrominoColor = nextTetrominoColor;
    curTetrominoType = nextTetrominoType;

    if (!MoveTetromino(initPlacement, 0)) {
        status = "Game Over";
        ctx.fillStyle = 'black';
        ctx.font = '41px Arial';
        ctx.fillText(status, 40, 200);
    }
    let randomTetromino = Math.floor(Math.random() * tetrominos.length);
    nextTetromino = tetrominos[randomTetromino];
    nextTetrominoColor = tetrominoColors[randomTetromino];
    nextTetrominoType = randomTetromino;

    ctx.fillStyle = 'white';
    ctx.fillRect(321, 249, 100, 50);

    for (let i = 0; i < nextTetromino.length; i++) {
        let coordinate = coordinateArray[nextTetromino[i][0]][nextTetromino[i][1]];
        ctx.fillStyle = nextTetrominoColor;
        ctx.fillRect(coordinate.x + 310, coordinate.y + 240, 21, 21);
    }
}

function RestartGame() {
    status = "";
    ctx.fillStyle = 'white';
    ctx.fillRect(11, 9, (23 * 12), (23 * 20));
    for (let i = 0; i < gBArrayWidth; i++) {
        gameBoard[i].fill(0);
    }
    CreateTetromino();
}

function DrawTetrisLogo() {
    ctx.drawImage(tetrisLogo, 300, 8, 161, 54);
}

window.setInterval(function () {
    if (status === "")
        MoveTetromino(0, 1);
}, 1000);




/****************************************************/
//    ROTATION

function RotateTetromino(clockwise) {
    let tetromino = [];
    let oldRotateIndex = rotateIndex;
    let newRotateIndex = rotateIndex + (clockwise ? 1 : -1);
    newRotateIndex = newRotateIndex % 4;
    let oldTetromino = JSON.parse(JSON.stringify(curTetromino));
    
    for (let i = 0; i < curTetromino.length; i++) {
        tetromino.push(RotateTile(curTetromino[i], clockwise));
    }
    if (RotateOffset(tetromino, oldTetromino, oldRotateIndex, newRotateIndex)) {
        rotateIndex = newRotateIndex;
    }
}

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};


function GetOriginOffset() {
    if (curTetrominoType === TETROMINO_TYPES.J ||
        curTetrominoType === TETROMINO_TYPES.L ||
        curTetrominoType === TETROMINO_TYPES.S ||
        curTetrominoType === TETROMINO_TYPES.Z ||
        curTetrominoType === TETROMINO_TYPES.T) {
        if (rotateIndex === 0 || rotateIndex === 3) {
            return [1, 1];
        } else if (rotateIndex === 1) {
            return [0, 1];
        } else {
            return [1, 0];
        }
    } else if (curTetrominoType === TETROMINO_TYPES.I) {
        if (rotateIndex === 0) {
            return [1, 0];
        } else if (rotateIndex === 1) {
            return [0,1];
        } else if (rotateIndex === 2) {
            return [2,0];
        } else if (rotateIndex === 3) {
            return [0,2];
        }
    } else if (curTetrominoType === TETROMINO_TYPES.SQUARE) {
        if (rotateIndex === 0) {
            return [0,1];
        } else if (rotateIndex === 1) {
            return [0,0];
        } else if (rotateIndex === 2) {
            return [1,0];
        } else if (rotateIndex === 3) {
            return [1,1];
        }
    }
}

function GetPiecePosition() {
    let minX = gBArrayWidth, minY = gBArrayHeight;
    for (let i = 0; i < curTetromino.length; i++) {
        if (curTetromino[i][0] < minX)
            minX = curTetromino[i][0];
        if (curTetromino[i][1] < minY)
            minY = curTetromino[i][1];
    }
    return [minX, minY];
}

function RotateTile(tilePos, clockwise) {
    let relativeX, relativeY;
    let centerX = GetPiecePosition()[0] + GetOriginOffset()[0];
    let centerY = GetPiecePosition()[1] + GetOriginOffset()[1];
    relativeX = tilePos[0] - centerX;
    relativeY = tilePos[1] - centerY;

    let rotMatrix = clockwise ? [[0, 1], [-1, 0]] : [[0, -1], [1, 0]];

    let newX = (rotMatrix[0][0] * relativeX) + (rotMatrix[1][0] * relativeY);
    let newY = (rotMatrix[0][1] * relativeX) + (rotMatrix[1][1] * relativeY);
    return [centerX + newX, centerY + newY];
}

function RotateOffset(tetromino, oldTetromino, oldRotateIndex, newRotateIndex) {
    let offsetVal1, offsetVal2, endOffset = [0, 0];
    let curOffsetData;

    if (curTetrominoType === TETROMINO_TYPES.I) {
        curOffsetData = I_offset;
    } else if (curTetrominoType === TETROMINO_TYPES.SQUARE) {
        curOffsetData = square_offset;
    } else {
        curOffsetData = JLSTZ_offset;
    } 
    for (let testIndex = 0; testIndex < 5; testIndex++) {
        let tempTetromino = JSON.parse(JSON.stringify(tetromino));
        offsetVal1 = curOffsetData[testIndex][oldRotateIndex];
        offsetVal2 = curOffsetData[testIndex][newRotateIndex];

        endOffset = [offsetVal1[0] - offsetVal2[0], offsetVal1[1] - offsetVal2[1]];

        for (let i = 0; i < tempTetromino.length; i++) {
            tempTetromino[i][0] += endOffset[0];
            tempTetromino[i][1] += endOffset[1];
        }
        if (!HitWall(tempTetromino) && !HitTetromino(tempTetromino)) {
            curTetromino = tempTetromino;
            DeleteTetromino(oldTetromino);
            DrawTetromino(curTetromino, curTetrominoColor);
            return true;
        }
    }
    return false;
}

let JLSTZ_offset = [
    [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ],
    [
        [0, 0],
        [1, 0],
        [0, 0],
        [-1, 0],
    ],
    [
        [0, 0],
        [1, -1],
        [0, 0],
        [-1, -1],
    ],
    [
        [0, 0],
        [0, 2],
        [0, 0],
        [0, 2],
    ],
    [
        [0, 0],
        [1, 2],
        [0, 0],
        [-1, 2],
    ]
];
let I_offset = [
    [
        [0, 0],
        [-1, 0],
        [-1, -1],
        [1, -1],
    ],
    [
        [-1, 0],
        [0, 0],
        [1, 1],
        [0, 1],
    ],
    [
        [2, 0],
        [0, 0],
        [-2, 1],
        [0, 1],
    ],
    [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1],
    ],
    [
        [2, 0],
        [0, -2],
        [-2, 0],
        [0, 2],
    ]
];
let square_offset = [
    [
        [0, 0],
        [0, 1],
        [-1, 1],
        [-1, 0],
    ]
];
