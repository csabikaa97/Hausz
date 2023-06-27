/// <reference path="/var/www/forras/komponensek/alap_fuggvenyek.ts" />
/// <reference path="/var/www/forras/komponensek/belepteto_rendszer.ts" />
/// <reference path="/var/www/forras/komponensek/topbar.ts" />
/// <reference path="/var/www/forras/kettoezernegyvennyolc/ai.ts" />

let lepes_interval;
let game;
let jelenlegi_ai;

enum game_errors {
    INVALID_DIRECTION = 'INVALID_DIRECTION',
    IMPOSSIBLE_MOVE = 'IMPOSSIBLE_MOVE',
    GAME_OVER = 'GAME_OVER',
    INVALID_CONTROL_MODE = 'INVALID_CONTROL_MODE'
}

enum direction {
    left = 0,
    right = 1,
    up = 2,
    down = 3
}

enum control {
    automatikus_random = 0,
    manualis = 1,
    AI = 2
}

class Game {
    public board: number[][];
    private score: number;
    public control: control;

    constructor() {
        this.score = 0;
        this.board = [];
        for (let i = 0; i < 4; i++) {
            this.board[i] = [];
            for (let j = 0; j < 4; j++) {
                this.board[i][j] = 0;
            }
        }
    }

    public newGame(): void {
        this.board = [];
        for (let i = 0; i < 4; i++) {
            this.board[i] = [];
            for (let j = 0; j < 4; j++) {
                this.board[i][j] = 0;
            }
        }

        this.score = 0;

        if( this.control != control.AI ) {
            this.fillRandomCell();
            this.fillRandomCell();
        }
    }

    private fillRandomCell(): void {
        let emptyCells: number[][] = [];

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push([i, j]);
                }
            }
        }

        if (emptyCells.length > 0) {
            let cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[cell[0]][cell[1]] = 2;
        }
    }

    public move(direction: string): void {
        if (direction === 'left') {
            this.moveLeft();
        } else if (direction === 'right') {
            this.moveRight();
        } else if (direction === 'up') {
            this.moveUp();
        } else if (direction === 'down') {
            this.moveDown();
        } else {
            throw new Error(game_errors.INVALID_DIRECTION);
        }

        if( this.control != control.AI ) {
            this.fillRandomCell();
        }

        if( this.isGameOver() || this.score < -500 ) {
            drawGame(this);
            clearInterval(lepes_interval);
            if( this.control != control.AI ) {
                setTimeout(() => {
                    throw new Error(game_errors.GAME_OVER);
                }, 500);
            } else {
                throw new Error(game_errors.GAME_OVER);
            }
        }
    }

    public isGameOver(): boolean {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if( this.board[i][j] === 0 ) {
                    return false;
                }
            }
        }
    
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if( this.board[i][j] === this.board[i][j+1] ) {
                    return false;
                }
            }
        }

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if( this.board[j][i] === this.board[j+1][i] ) {
                    return false;
                }
            }
        }

        return true;
    }

    private moveLeft(): void {
        let possibleMove = false;
        for (let i = 0; i < 4; i++) {
            let row = this.board[i];
            let newRow = this.moveRow(row);
            if( row.toString() != newRow.toString() ) {
                possibleMove = true;
            }
            this.board[i] = newRow;
        }

        if( !possibleMove ) {
            throw new Error(game_errors.IMPOSSIBLE_MOVE);
        }
    }

    private moveRight(): void {
        let possibleMove = false;
        for (let i = 0; i < 4; i++) {
            let row = this.board[i];
            let newRow = this.moveRow(row.reverse()).reverse();
            if( row.toString() != newRow.toString() ) {
                possibleMove = true;
            }
            this.board[i] = newRow;
        }

        if( !possibleMove ) {
            throw new Error(game_errors.IMPOSSIBLE_MOVE);
        }
    }

    private moveUp(): void {
        let possibleMove = false;
        for (let i = 0; i < 4; i++) {
            let column = [];
            for (let j = 0; j < 4; j++) {
                column.push(this.board[j][i]);
            }

            let newColumn = this.moveRow(column);
            if( column.toString() != newColumn.toString() ) {
                possibleMove = true;
            }
            for (let j = 0; j < 4; j++) {
                this.board[j][i] = newColumn[j];
            }

        }

        if( !possibleMove ) {
            throw new Error(game_errors.IMPOSSIBLE_MOVE);
        }
    }

    private moveDown(): void {
        let possibleMove = false;
        for (let i = 0; i < 4; i++) {
            let column = [];
            for (let j = 0; j < 4; j++) {
                column.push(this.board[j][i]);
            }

            let newColumn = this.moveRow(column.reverse()).reverse();
            if( column.toString() != newColumn.toString() ) {
                possibleMove = true;
            }
            for (let j = 0; j < 4; j++) {
                this.board[j][i] = newColumn[j];
            }

        }

        if( !possibleMove ) {
            throw new Error(game_errors.IMPOSSIBLE_MOVE);
        }
    }

    private moveRow(row: number[]): number[] {
        let newRow = row.filter((value) => value !== 0);

        for (let i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                newRow.splice(i + 1, 1);
                this.score += newRow[i];
            }
        }

        for (let i = newRow.length; i < 4; i++) {
            newRow.push(0);
        }

        return newRow;
    }

    public changeControl(mode: string) {
        if( mode == 'kezi' ) {
            this.control = control.manualis;
        } else if( mode == 'automatikus' ) {
            this.control = control.automatikus_random;
            
        } else if ( mode == 'ai') {
            this.control = control.AI;
        } else {
            throw new Error(game_errors.INVALID_CONTROL_MODE);
        }

        if(this.control != control.manualis) {
            lepes_interval = setInterval(() => {
                while(1) {
                    try {
                        if( this.control == control.automatikus_random ) {
                            this.move(this.getRandomMove());
                        } else if( this.control == control.AI ) {
                            this.move(this.getAIMove());
                        }
                    }
                    catch(e) {
                        if( e.message == 'IMPOSSIBLE_MOVE' ) {
                            if( this.control == control.AI ) {
                                this.penalty(100);
                                if( this.isGameOver() || this.score < -500 ) {
                                    clearInterval(lepes_interval);
                                    alert('Game over! Score: ' + this.getScore());
                                }
                                break;
                            }
                            continue;
                        }
                        throw e;
                    }

                    break;
                }
                drawGame(this);
            }, this.control == control.AI ? 1000 : 100);
        }
    }

    private getRandomMove(): string {
        let moves = ['left', 'right', 'up', 'down'];
        return moves[Math.floor(Math.random() * 4)];
    }

    private getAIMove(): string {
        console.log('Asking AI to do something');
        return jelenlegi_ai.inference(this.board);
    }

    public penalty(penalty: number): void {
        this.score -= penalty;
    }

    public getBoard(): number[][] {
        return this.board;
    }

    public getScore(): number {
        return this.score;
    }
}

function drawGame(game: Game): void {
    let board = game.getBoard();
    let boardDiv = document.getElementById('board');
    let score = document.getElementById('score');
    boardDiv.innerHTML = '';
    
    let table = document.createElement('table');
    for (let i = 0; i < 4; i++) {
        let tr = document.createElement('tr');
        for (let j = 0; j < 4; j++) {
            let td = document.createElement('td');
            if( board[i][j] != 0) {
                td.innerText = board[i][j].toString();
                tr.appendChild(td);
            } else {
                let td = document.createElement('td');
                tr.appendChild(td);
            }
        }
        table.appendChild(tr);
    }

    table.style.borderSpacing = '0px';
    table.style.borderCollapse = 'collapse';
    for (let i = 0; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            table.rows[i].cells[j].style.border = '1px solid black';
            table.rows[i].cells[j].style.padding = '10px';
        }
    }

    for (let i = 0; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            let cell = table.rows[i].cells[j];
            if (cell.innerText === '2') {
                cell.style.backgroundColor = '#eee4da';
            } else if (cell.innerText === '4') {
                cell.style.backgroundColor = '#ede0c8';
            } else if (cell.innerText === '8') {
                cell.style.backgroundColor = '#f2b179';
            } else if (cell.innerText === '16') {
                cell.style.backgroundColor = '#f59563';
            } else if (cell.innerText === '32') {
                cell.style.backgroundColor = '#f67c5f';
            } else if (cell.innerText === '64') {
                cell.style.backgroundColor = '#f65e3b';
            } else if (cell.innerText === '128') {
                cell.style.backgroundColor = '#edcf72';
            } else if (cell.innerText === '256') {
                cell.style.backgroundColor = '#edcc61';
            } else if (cell.innerText === '512') {
                cell.style.backgroundColor = '#edc850';
            } else if (cell.innerText === '1024') {
                cell.style.backgroundColor = '#edc53f';
            } else if (cell.innerText === '2048') {
                cell.style.backgroundColor = '#edc22e';
            } else if (cell.innerText === '4096') {
                cell.style.backgroundColor = '#000000';
            } else if (cell.innerText === '8192') {
                cell.style.backgroundColor = '#000000';
            } else if (cell.innerText === '16384') {
                cell.style.backgroundColor = '#000000';
            }

            cell.style.width = '100px';
            cell.style.height = '100px';
            cell.style.fontSize = '50px';
            cell.style.textAlign = 'center';
        }
    }
    boardDiv.appendChild(table);

    score.innerText = game.getScore().toString();
}

function canMove(board: number[][], dir: direction): boolean {
    if (dir === direction.left) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === 0 && board[i][j + 1] !== 0) {
                    return true;
                } else if (board[i][j] !== 0 && board[i][j] === board[i][j + 1]) {
                    return true;
                }
            }
        }
    } else if (dir === direction.right) {
        for (let i = 0; i < 4; i++) {
            for (let j = 3; j > 0; j--) {
                if (board[i][j] === 0 && board[i][j - 1] !== 0) {
                    return true;
                } else if (board[i][j] !== 0 && board[i][j] === board[i][j - 1]) {
                    return true;
                }
            }
        }
    } else if (dir === direction.up) {
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 3; i++) {
                if (board[i][j] === 0 && board[i + 1][j] !== 0) {
                    return true;
                } else if (board[i][j] !== 0 && board[i][j] === board[i + 1][j]) {
                    return true;
                }
            }
        }
    } else if (dir === direction.down) {
        for (let j = 0; j < 4; j++) {
            for (let i = 3; i > 0; i--) {
                if (board[i][j] === 0 && board[i - 1][j] !== 0) {
                    return true;
                } else if (board[i][j] !== 0 && board[i][j] === board[i - 1][j]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function belepteto_rendszer_frissult() {
    if(session_loggedin != 'yes') {
        obj('loginWarning').style.display = 'block';
        obj('leaderboard').style.display = 'none';
    } else {
        obj('loginWarning').style.display = 'none';
        obj('leaderboard').style.display = 'block';
    }
}

window.onload = () => {
    topbar_betoltese();
    belepteto_rendszer_beallitas( belepteto_rendszer_frissult );

    game = new Game();

    game.newGame();
    drawGame(game);

    document.addEventListener('keydown', (event) => {
        try {
            game.move(event.key.replace('Arrow', '').toLowerCase());
        }
        catch (e) {
            if (e.message === 'IMPOSSIBLE_MOVE') {
                alert('IMPOSSIBLE_MOVE: -100 points');
                game.penalty(100);
            }
        }

        drawGame(game);
    });
};