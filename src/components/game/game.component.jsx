import React from "react";
import './game.styles.css';
import Board from "../board/board.component";

class Game extends React.Component {
    constructor(props)
    {
        super(props);
        this.state = {
            ships: [
                {
                    name: "carrier",
                    size: 5
                },
                {
                    name: "battleship",
                    size: 4
                },
                {
                    name: "cruiser",
                    size: 3
                },
                {
                    name: "submarine",
                    size: 3
                },
                {
                    name: "destroyer",
                    size: 2
                },
            ],
            boardA: Array(this.props.boardSize).fill({hasShip: false, shipName: '', wasShot: false}),
            boardB: Array(this.props.boardSize).fill({hasShip: false, shipName: '', wasShot: false}),
            nextIsA: true,
            shipsPlaced: false,
            autoPlay: false,
            interval: this.props.autoPlayInterval,
            intervalId: 0,
            lastMove: "",
            shipsRemainingA: null,
            shipsRemainingB: null,
            gameOver: false,
            winningMessage: "",
            lastShotWasHitButNotSinkA: [false, null],
            lastShotWasHitButNotSinkB: [false, null]
        };
    }

    checkIfValidSpotForPlacement = (board, spot, firstCell, horizontally) => {
        // Check if spot taken or over the board size
        if(spot >= this.props.boardSize || board[spot].hasShip === true) return false;
        if(horizontally) {
            // If ship placed horizontally, check if ship would not go trough multiple rows
            if(Math.floor(firstCell / 10.0) !== Math.floor(spot / 10.0)) return false;
        }
        return true;
    }

    placeShip = (board, horizontally, length, name) => {
        let currentBoard;
        let valid;
        do{
            currentBoard = board.slice();
            valid = false;
            const firstCell = Math.floor(Math.random() * this.props.boardSize);
            for(let i = 0; i < length; i++) {
                let spotIndex;
                if(horizontally) {
                    spotIndex = firstCell + i;
                    if(!this.checkIfValidSpotForPlacement(currentBoard, spotIndex, firstCell, true)) {
                        valid = false;
                        break;
                    }
                } else {
                    spotIndex = firstCell + i*10;
                    if(!this.checkIfValidSpotForPlacement(currentBoard, spotIndex, firstCell, false)) {
                        valid = false;
                        break;
                    }
                }
                const spot = {
                    hasShip: true, 
                    shipName: name, 
                    wasShot: false 
                }
                currentBoard[spotIndex] = spot;
                valid = true;
            }
        }while(!valid);
        return currentBoard;
    }

    placeShips = (board) => {
        let currentBoard = board.slice();
        const ships = this.state.ships;
        ships.forEach((x) => {
            const horizontally = Math.random() < 0.5;
            const newBoard = this.placeShip(currentBoard, horizontally, x.size, x.name);
            currentBoard = newBoard;
        })
        return currentBoard;
    }

    initializeGame = () => {
        if(!this.state.shipsPlaced) {
            const boardA = this.placeShips(this.state.boardA);
            const boardB = this.placeShips(this.state.boardB);
            const numberOfShips = this.state.ships.length;
            this.setState(
                {
                    boardA: boardA, 
                    boardB: boardB, 
                    shipsPlaced: true,
                    shipsRemainingA: numberOfShips,
                    shipsRemainingB: numberOfShips
                });
        }
    }

    toggleAutoPlay = () => {
        if(!this.state.shipsPlaced) return;
        if(!this.state.autoPlay) 
        {
            const intervalId = setInterval(this.shoot, this.state.interval);
            this.setState({autoPlay: !this.state.autoPlay, intervalId: intervalId})
        }
        else {
            clearInterval(this.state.intervalId);
            this.setState({autoPlay: !this.state.autoPlay, intervalId: 0})
        }
    }

    onGameFinished = () => {
        if(this.state.autoPlay) {
            clearInterval(this.state.interval);
        }
        const winningMessage = this.state.nextIsA ? "Player B won!" : "Player A won!"

        this.setState({
            autoPlay: false,
            winningMessage: winningMessage
        });
    }

    chooseFieldToShoot = (board, lastWasHitButNotSink) => {
        let spot;
        do{
            //Basic AI to hit adjacent fields after succesful hit, only remembers last shot
            if(lastWasHitButNotSink[0]){
                const adjacentFields = [
                    lastWasHitButNotSink[1] - 10, 
                    lastWasHitButNotSink[1] - 1, 
                    lastWasHitButNotSink[1] + 1, 
                    lastWasHitButNotSink[1] + 10, 
                ];
                const fieldsToShoot = adjacentFields.filter(
                    x => 
                    x >= 0 
                    && x < this.props.boardSize
                    && (lastWasHitButNotSink[1]%10 === x%10 || Math.floor(lastWasHitButNotSink[1]/10) === Math.floor(x/10)) //Check if field is in the same column or row
                    && board[x].wasShot !== true);
                if(fieldsToShoot.length > 0) {
                    spot = fieldsToShoot[Math.floor(Math.random() * fieldsToShoot.length)];
                } else {
                    spot = Math.floor(Math.random() * this.props.boardSize);
                }
            } else {
                spot = Math.floor(Math.random() * this.props.boardSize);
            }
        }while(board[spot].wasShot === true)
        return spot;
    }

    shoot = () => {
        if(!this.state.shipsPlaced) return;
        let gameOver = this.state.gameOver;
        if(gameOver) {
            this.onGameFinished();
            return;
        }
        const playerLetter = (this.state.nextIsA) ? "B" : "A";
        let shot, message, board, remainingShips;
        let lastShotWasHitButNotSink = (this.state.nextIsA) ? this.state.lastShotWasHitButNotSinkB : this.state.lastShotWasHitButNotSinkA;
        if(this.state.nextIsA) {
            board = this.state.boardB.slice();
            remainingShips = this.state.shipsRemainingB;
        } else {
            board = this.state.boardA.slice();
            remainingShips = this.state.shipsRemainingA;
        }
        shot = this.chooseFieldToShoot(board, lastShotWasHitButNotSink);
        let spot = Object.assign({}, board[shot]);
        spot.wasShot = true;
        board[shot] = spot;
        if(spot.shipName) {
            const ship = board.filter(x => x.shipName === spot.shipName);
            if(ship.every(x => x.wasShot === true)) {
                remainingShips -= 1;
                message = `Player ${playerLetter}'s ${spot.shipName} was sunk`;
                lastShotWasHitButNotSink = [false, null];
                if(remainingShips < 1) gameOver = true;
            } else {
                message = `Player ${playerLetter}'s ${spot.shipName} was hit`;
                lastShotWasHitButNotSink = [true, shot];
            }
        } else {
            message = "Miss";
            lastShotWasHitButNotSink = [false, null];
        }
        if(this.state.nextIsA) {
        this.setState({
            boardB: board, 
            nextIsA: !this.state.nextIsA, 
            lastMove: message, 
            shipsRemainingB: remainingShips, 
            gameOver: gameOver, 
            lastShotWasHitButNotSinkB: lastShotWasHitButNotSink});
        } else {
        this.setState({
            boardA: board, 
            nextIsA: !this.state.nextIsA, 
            lastMove: message, 
            shipsRemainingA: remainingShips, 
            gameOver: gameOver, 
            lastShotWasHitButNotSinkA: lastShotWasHitButNotSink});
        }
    }

    resetGame = () => {
        if(this.state.intervalId !== 0) {
            clearInterval(this.state.intervalId);
        }
        this.setState({
            boardA: Array(this.props.boardSize).fill({hasShip: false, shipName: '', wasShot: false}),
            boardB: Array(this.props.boardSize).fill({hasShip: false, shipName: '', wasShot: false}),
            nextIsA: true,
            shipsPlaced: false,
            autoPlay: false,
            intervalId: 0,
            lastMove: "",
            shipsRemainingA: null,
            shipsRemainingB: null,
            gameOver: false,
            winningMessage: "",
            lastShotWasHitButNotSinkA: [false, null],
            lastShotWasHitButNotSinkB: [false, null]
        })
    }

    render(){
        return(
            <div className="game">
                <h1>Battleships</h1>
                <div className="boards">
                    <div className="player">
                        <h2>Player A</h2>
                        <h4>Ships remaining: {this.state.shipsRemainingA}</h4>
                        <Board board={this.state.boardA} size={this.props.boardSize} />
                    </div>
                    <div className="player">
                        <h2>Player B</h2>
                        <h4>Ships remaining: {this.state.shipsRemainingB}</h4>
                        <Board board={this.state.boardB} size={this.props.boardSize} />
                    </div>
                </div>
                <div className="buttons">
                    <button className="customButton" onClick={() => this.initializeGame()}>Initialize Ships</button>
                    <button className="customButton" onClick={() => this.shoot()}>Next Shot</button>
                    <button className="customButton" onClick={() => this.toggleAutoPlay()}>Toggle Auto Play</button>
                    <button className="customButton" onClick={() => this.resetGame()}>Reset Game</button>
                </div>
                <div className="ship-colors">
                    <p className="carrier">Carrier</p>
                    <p className="battleship">Battleship</p>
                    <p className="cruiser">Cruiser</p>
                    <p className="submarine">Submarine</p>
                    <p className="destroyer">Destroyer</p>
                </div>
                <h1>{this.state.winningMessage}</h1>
                <h2>Last move: {this.state.lastMove}</h2>
            </div>
        )
    }
}

export default Game;