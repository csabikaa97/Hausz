/* This is the TypeScript source of the 2048 game AI trainer.

The game board is represented by a 4x4 array of numbers (16 cells total).
The numbers can be 0, or any power of 2.
0 means an empty cell.

The AI should have an inoput layer which has these data to work with:
4 neurons describing the possibility of moving in each direction (1 for possible, 0 for not possible)
16 neurons describing if the cells are empty or not (1 for empty, 0 for not empty)
16 neurons describing the value of the cells (0-1, 0 for empty, 1 for 65536)

In total: 64 neurons as the input layer

The AI should have an output layer for each of the 4 directions (up, down, left, right) with 4 neurons total.
The neurons should signal the probability of moving in that direction.

The number of hidden layers and the number of neurons in each layer is up to the user.

NO COMMENTS AFTER THIS PART
*/

/// <reference path="/var/www/forras/kettoezernegyvennyolc/kettoezernegyvennyolc.ts" />

let distribution: number[] = [0, 0, 0, 0];
const input_neuron_count = 20;

let cellPlacementCache = [];
let cacheHit = 0;
let cacheMiss = 0;
let bestGameSoFar: Game;
let bestScoreSoFar = -500;

function cacheStats() {
    console.log("Cache hit: " + cacheHit);
    console.log("Cache miss: " + cacheMiss);
    console.log("Cache hit rate: " + (cacheHit / (cacheHit + cacheMiss) * 100) + "%");
}

function relu(x: number): number {
    if( x < 0 ) {
        return x*0.01;
    } else {
        return x;
    }
}

class AI {
    private weights: number[][][];
    private biases: number[][];
    private hiddenLayerCount: number;
    private hiddenLayerNeuronCount: number;
    public selected = false;
    public latest_score = 0;
    public latest_fitness = 0;

    constructor(hiddenLayerCount: number, hiddenLayerNeuronCount: number) {
        this.hiddenLayerCount = hiddenLayerCount;
        this.hiddenLayerNeuronCount = hiddenLayerNeuronCount;
        this.weights = [];
        this.biases = [];
        this.initWeights();
        this.initBiases();
        this.selected = false;
        this.latest_score = 0;
        this.latest_fitness = 0;
    }

    private initWeights() {
        this.weights = [];
        for (let i = 0; i < this.hiddenLayerCount + 1; i++) {
            this.weights.push([]);
            for (let j = 0; j < (i == 0 ? input_neuron_count : this.hiddenLayerNeuronCount); j++) {
                this.weights[i].push([]);
                for (let k = 0; k < (i == this.hiddenLayerCount ? 4 : this.hiddenLayerNeuronCount); k++) {
                    this.weights[i][j].push(Math.random() * 2 - 1);
                }
            }
        }
    }

    private initBiases() {
        this.biases = [];
        for (let i = 0; i < this.hiddenLayerCount + 1; i++) {
            this.biases.push([]);
            for (let j = 0; j < (i == this.hiddenLayerCount ? 4 : this.hiddenLayerNeuronCount); j++) {
                this.biases[i].push(Math.random() * 2 - 1);
            }
        }
    }

    private getInput(board: number[][]): number[] {
        let input: number[] = [];
        input.push(canMove(board, direction.up) ? 1 : 0);
        input.push(canMove(board, direction.down) ? 1 : 0);
        input.push(canMove(board, direction.left) ? 1 : 0);
        input.push(canMove(board, direction.right) ? 1 : 0);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                input.push(board[i][j] / 65536);
            }
        }

        return input;
    }

    private getOutput(input: number[]): number[] {
        let output: number[];
        let layerInput = input;
        for (let i = 0; i < this.hiddenLayerCount + 1; i++) {
            output = [];
            for (let to = 0; to < (i == this.hiddenLayerCount ? 4 : this.hiddenLayerNeuronCount); to++) {
                let sum = 0;
                for (let from = 0; from < (i == 0 ? input_neuron_count : this.hiddenLayerNeuronCount); from++) {
                    sum += layerInput[from] * this.weights[i][from][to];
                }

                sum += this.biases[i][to];

                output.push(relu(sum));
            }

            layerInput = output;
        }
        return output;
    }

    private outputToMove(output: number[]): string {
        let max = 0;
        let maxIndex = 0;
        for (let i = 0; i < 4; i++) {
            if (output[i] > max) {
                max = output[i];
                maxIndex = i;
            }
        }

        distribution[maxIndex] += 1;

        switch (maxIndex) {
            case 0: return "up";
            case 1: return "down";
            case 2: return "left";
            default: return "right";
        }
    }

    private benchmark(): number {
        let score = 0;
        for (let i = 0; i < 16; i++) {
            for(let j = 0; j < 15; j++) {
                let game = new Game();
                game.control = control.AI;
                game.newGame();

                switch(i) {
                    case 0: game.board[0][0] = 2; break;
                    case 1: game.board[0][1] = 2; break;
                    case 2: game.board[0][2] = 2; break;
                    case 3: game.board[0][3] = 2; break;
                    case 4: game.board[1][0] = 2; break;
                    case 5: game.board[1][1] = 2; break;
                    case 6: game.board[1][2] = 2; break;
                    case 7: game.board[1][3] = 2; break;
                    case 8: game.board[2][0] = 2; break;
                    case 9: game.board[2][1] = 2; break;
                    case 10: game.board[2][2] = 2; break;
                    case 11: game.board[2][3] = 2; break;
                    case 12: game.board[3][0] = 2; break;
                    case 13: game.board[3][1] = 2; break;
                    case 14: game.board[3][2] = 2; break;
                    case 15: game.board[3][3] = 2; break;
                }

                switch(j) {
                    case 0: game.board[0][0] == 2 ? game.board[0][1] = 2 : game.board[0][0] = 2; break;
                    case 1: game.board[0][1] == 2 ? game.board[0][2] = 2 : game.board[0][1] = 2; break;
                    case 2: game.board[0][2] == 2 ? game.board[0][3] = 2 : game.board[0][2] = 2; break;
                    case 3: game.board[0][3] == 2 ? game.board[1][0] = 2 : game.board[0][3] = 2; break;
                    case 4: game.board[1][0] == 2 ? game.board[1][1] = 2 : game.board[1][0] = 2; break;
                    case 5: game.board[1][1] == 2 ? game.board[1][2] = 2 : game.board[1][1] = 2; break;
                    case 6: game.board[1][2] == 2 ? game.board[1][3] = 2 : game.board[1][2] = 2; break;
                    case 7: game.board[1][3] == 2 ? game.board[2][0] = 2 : game.board[1][3] = 2; break;
                    case 8: game.board[2][0] == 2 ? game.board[2][1] = 2 : game.board[2][0] = 2; break;
                    case 9: game.board[2][1] == 2 ? game.board[2][2] = 2 : game.board[2][1] = 2; break;
                    case 10: game.board[2][2] == 2 ? game.board[2][3] = 2 : game.board[2][2] = 2; break;
                    case 11: game.board[2][3] == 2 ? game.board[3][0] = 2 : game.board[2][3] = 2; break;
                    case 12: game.board[3][0] == 2 ? game.board[3][1] = 2 : game.board[3][0] = 2; break;
                    case 13: game.board[3][1] == 2 ? game.board[3][2] = 2 : game.board[3][1] = 2; break;
                    case 14: game.board[3][2] == 2 ? game.board[3][3] = 2 : game.board[3][2] = 2; break;
                    case 15: game.board[3][3] == 2 ? game.board[0][0] = 2 : game.board[3][3] = 2; break;
                }

                let taken_steps = 0;
                while (taken_steps < 500) {
                    let cancontinue = true;
                    try {
                        let inference_output = this.inference(game.getBoard());
                        let decoded_move = this.outputToMove(inference_output);
                        game.move(decoded_move);

                        taken_steps++;

                        let new_cell_position = getCachedRandomCellPosition(game.board);
                        if( game.board[new_cell_position.row][new_cell_position.column] != 0 ) {
                            console.error({game: game.board, new_cell_position: new_cell_position});
                            cancontinue = false;
                        }
                        game.board[new_cell_position.row][new_cell_position.column] = 2;
                    } catch(e) {
                        if( e == game_errors.GAME_OVER) {
                            console.log({e});
                            break;
                        } else {
                            game.penalty(300);
                            continue;
                        }
                    }
                    if(!cancontinue) {
                        throw new Error("Trying to place a new cell on a non-empty cell");
                    }
                }

                let current_score = game.getScore();
                score += current_score;

                if(current_score > bestScoreSoFar) {
                    bestGameSoFar = game;
                    bestScoreSoFar = current_score;
                    console.log("Best score so far: " + bestScoreSoFar);
                }
            }
        }
        this.latest_score = score;
        return score;
    }

    private mutate(mutation_rate: number, mutation_chance: number): void {
        for (let i = 0; i < this.hiddenLayerCount + 1; i++) {
            for (let j = 0; j < (i == this.hiddenLayerCount ? 4 : this.hiddenLayerNeuronCount); j++) {
                for (let k = 0; k < (i == 0 ? input_neuron_count : this.hiddenLayerNeuronCount); k++) {
                    if (Math.random() < mutation_chance) {
                        this.weights[i][k][j] += (Math.random() * 2 - 1) * mutation_rate;
                    }
                }
                if (Math.random() < mutation_chance) {
                    this.biases[i][j] = Math.random() * 2 - 1 * mutation_rate;
                }
            }
        }
    }

    public train(generations: number, populationSize: number, hiddenLayerCount: number, 
        hiddenLayerNeuronCount: number, mutation_rate: number, mutation_chance): AI {
        console.log("Training AI with the following parameters:");
        console.log({generations, populationSize, hiddenLayerCount, hiddenLayerNeuronCount, mutation_rate});
        let main_ai: AI;
        let main_ai_score;
        
        if( !this.selected ) {
            console.log("Starting benchmarking of starter population...");
            let max = -500;
            for (let i = 0; i < populationSize; i++) {
                console.log(i);
                let random_ai = new AI(hiddenLayerCount, hiddenLayerNeuronCount);
                let random_ai_score = random_ai.benchmark();
                if( random_ai_score > max) {
                    main_ai = random_ai;
                    main_ai_score = random_ai_score;
                    max = main_ai_score;
                    console.log("New main AI score: " + (main_ai_score / 240));
                }
            }
            console.log("Final main AI score: " + (main_ai_score / 240));
        } else {
            main_ai = this;
            main_ai.weights = this.weights;
            main_ai.biases = this.biases;
            main_ai_score = this.latest_score;
            console.log("Using pre-selected AI with score: " + (main_ai_score / 240));
        }
        
        for(let i = 0; i < generations; i++) {
            let mutated_ai = new AI(hiddenLayerCount, hiddenLayerNeuronCount);
            mutated_ai.weights = main_ai.weights;
            mutated_ai.biases = main_ai.biases;
            mutated_ai.mutate(mutation_rate, mutation_chance);
            let mutated_ai_score = mutated_ai.benchmark();
            
            if( mutated_ai_score > main_ai_score) {
                main_ai = mutated_ai;
                main_ai_score = mutated_ai_score;
                console.log("New main AI score: " + (main_ai_score / 240));
            }
        }

        console.log("Training finished");
        main_ai.selected = true;
        return main_ai;
    }

    public inference(board: number[][]): number[] {
        let input = this.getInput(board);
        let output = this.getOutput(input);
        return output;
    }
}

function getCachedRandomCellPosition(board: number[][]): {row: number, column: number} {
    let board_squished = [];
    for(let row = 0; row < 4; row++) {
        for(let column = 0; column < 4; column++) {
            board_squished.push(board[row][column]);
        }
    }

    let cache = cellPlacementCache;
    for(let currentCell = 0; currentCell < 16; currentCell++) {
        let foundForCell = false;
        for(let j = 0; j < cache.length; j++) {
            if( cache[j].currentToken == board_squished[currentCell]) {
                cache = cache[j].children;
                foundForCell = true;
                if( currentCell == 15) {
                    if( cache.length == 1) {
                        if( cache[0].row != undefined && cache[0].column != undefined) {
                            cacheHit++;
                            return {row: cache[0].row, column: cache[0].column};
                        }
                    }
                }
                break;
            }
        }
        if(!foundForCell) {
            break;
        }
    }

    cacheMiss++;

    let emptyCells = [];
    for(let row = 0; row < board.length; row++) {
        for(let column = 0; column < board[row].length; column++) {
            if( board[row][column] == 0) {
                emptyCells.push({row: row, column: column});
            }
        }
    }

    let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    for(let rotation = 0; rotation < 4; rotation++) {
        randomCell = {row: 3 - randomCell.column, column: randomCell.row};

        let board_rotated = [];
        for(let row = 0; row < board.length; row++) {
            board_rotated.push([]);
            for(let column = 0; column < board[row].length; column++) {
                board_rotated[row].push(board[column][3 - row]);
            }
        }
        board = board_rotated;

        board_squished = [];
        for(let row = 0; row < board_rotated.length; row++) {
            for(let column = 0; column < board_rotated[row].length; column++) {
                board_squished.push(board_rotated[row][column]);
            }
        }

        insertIntoCache(randomCell, board_squished);
    }

    return randomCell;
}

function insertIntoCache(randomCell, board_squished) {
    let cache_insert = cellPlacementCache;
    for(let currentCell = 0; currentCell < 16; currentCell++) {
        let exists = false;
        for(let j = 0; j < cache_insert.length; j++) {
            if( cache_insert.length == 0) {
                break;
            }

            if( cache_insert[j].currentToken == board_squished[currentCell]) {
                cache_insert = cache_insert[j].children;
                exists = true;
                break;
            }
        }

        if( !exists) {
            cache_insert.push({currentToken: board_squished[currentCell], children: []});
            for(let j = 0; j < cache_insert.length; j++) {
                if( cache_insert[j].currentToken == board_squished[currentCell]) {
                    cache_insert = cache_insert[j].children;
                    break;
                }
            }
        }
    }

    cache_insert.push({row: randomCell.row, column: randomCell.column});
}

function rotateBoardRight(board: number[][]): number[][] {
    let newBoard = [];
    for(let row = 0; row < board.length; row++) {
        newBoard.push([]);
        for(let column = 0; column < board[row].length; column++) {
            newBoard[row].push(board[column][board.length - row - 1]);
        }
    }
    return newBoard;
}

function rotateBoardLeft(board: number[][]): number[][] {
    let newBoard = [];
    for(let row = 0; row < board.length; row++) {
        newBoard.push([]);
        for(let column = 0; column < board[row].length; column++) {
            newBoard[row].push(board[board.length - column - 1][row]);
        }
    }
    return newBoard;
}

function rotateCellLeft(cell: {row: number, column: number}): {row: number, column: number} {
    return {row: cell.column, column: 3 - cell.row};
}

function testingSingle() {
    jelenlegi_ai = new AI(1, 10);
    jelenlegi_ai = jelenlegi_ai.train(1, 1, 1, 10, 10, 1, 0.01);
}

function testingReal() {
    jelenlegi_ai = new AI(1, 16);
    jelenlegi_ai = jelenlegi_ai.train(1000, 30, 2, 36, 1000, 0.1, 0.05);
}

function testingRealQuick() {
    jelenlegi_ai = new AI(1, 16);
    jelenlegi_ai = jelenlegi_ai.train(5, 10, 1, 16, 1000, 0.1, 0.01);
}

function testingContinous() {
    jelenlegi_ai = new AI(1, 16);
    let dsa = () => { 
        jelenlegi_ai = jelenlegi_ai.train(1, 10, 1, 16, 1000, 0.03, 0.003); 
        drawGame(bestGameSoFar); 
        cacheStats();
        drawGame(bestGameSoFar);
        setTimeout(dsa, 300); };
    dsa();
}