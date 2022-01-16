import React from "react";
import Square from "../square/square.component";
import './board.styles.css';

class Board extends React.Component {

    renderRow(rowIndex) {
        let squares = [];
        for(let i = rowIndex; i < 10 + rowIndex; i++) {
            squares.push(<Square key={i} value={this.props.board[i].wasShot}  shipType={this.props.board[i].shipName}/>)
        }
        return squares;
    }
    renderBoard() {
        let rows = [];
        for(let i = 0; i < 100; i = i + 10) {
            let row = this.renderRow(i);
            rows.push(<div className="board-row" key={i}>{row}</div>);
        }
        return rows;
    }
    render() {
        return(
        <div className="board">
            {this.renderBoard()}
        </div>
        )
    }
}

export default Board;