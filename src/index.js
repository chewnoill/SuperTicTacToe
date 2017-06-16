import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


class Square extends React.Component {
  constructor(props) {
    super();
    this.state = {
      winner: props.winner,
      pos: props.pos,
      onClick: props.onClick,
      value: props.value,
      parent: props.parent,
    };
  }
  render() {
    var className = "square tictack" + this.state.pos;
    return (
      <button
        className={className}
        onClick={() => this.state.onClick(this)} >
        {this.props.value}
      </button>
    );
  }
}


class Board extends React.Component {
  constructor(props) {
    super();
    console.log('board winners: ' + props.winners);
    this.state = {
      xIsNext: true,
      className: "board",
      pos: props.pos,
      onClick: props.onClick,
      parent: props.parent,
      winners: props.winners
    };

  }
  renderSquare(i) {
    return (
      <SmallBoard
        pos={i}
        onClick={this.props.onClick}
        squares={this.props.squares[i]}
        isActive={(obj) => this.props.isActive(obj)}
        winner={this.props.winners[i]} />
    )
  }
  render() {
    var isActive = '';
    if (this.state.className === 'smallboard') {
      isActive = this.props.isActive(this);
    }

    return (
      <div
        className={this.state.className +
          " tictack" + this.state.pos +
          " " + isActive} >
        <div
          className={this.state.className + "-row"} >
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div
          className={this.state.className + "-row"} >
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className={this.state.className + "-row"} >
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}
class SmallBoard extends Board {
  constructor(props) {

    super(props);
    this.state = {
      stepNumber: 0,
      xIsNext: true,
      className: "smallboard",
      pos: props.pos,
      onClick: props.onClick,
      parent: props.parent,
      winner: props.winner
    };
  }
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={this.props.onClick}
        pos={i}
        parent={this}
      />
    );
  }
  render() {
    console.log('SmallBoard render winner: ' + this.props.winner)
    if (this.props.winner == null) {
      return super.render();
    } else {
      return (
        <div className={'smallboard inactive winner tictack' + this.state.pos} >
          {this.props.winner}
        </div>
      );
    }
  }
  calculateWinner() {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (this.props.squares[a] &&
        this.props.squares[a] === this.props.squares[b] &&
        this.props.squares[a] === this.props.squares[c]) {
        return this.props.squares[a];
      }
    }
    return null;
  }
}


class Game extends React.Component {
  constructor() {
    super();

    this.state = {
      history: [{
        squares: this.emptyBoard(),
      }],
      stepNumber: 0,
      xIsNext: true,
      nextSquare: 'free',
      winners: []
    };
  }
  emptyBoard() {
    var squares = Array(9).fill(null);
    for (var i in squares) {
      squares[i] = Array(9).fill(null);
    }
    return squares;
  }
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];

    var status = ''
    if (this.state.game_winner) {
      status = this.state.game_winner + ' is the winner!!';
    } else {
      if (this.state.xIsNext) status = 'X'
      else status = 'O'
      status += ' to move'

    }

    return (
      <div className="game">
        <Board
          squares={current.squares}
          onClick={(obj) => this.handleClick(obj)}
          parent={this}
          isActive={this.isActive}
          winners={this.state.winners}
          game_winner={this.state.game_winner} />
        <div className='status'>
          {status}
        </div>
      </div>
    );
  }

  isActive(obj) {
    var game = this.parent;
    if (game.state.game_winner) {
      return 'inactive'
    }
    if (game.state.nextSquare === 'free') {
      return 'active'
    } else if (game.state.nextSquare === obj.state.pos) {
      return 'active'
    } else {
      return 'inactive'
    }
  }
  validateTurn(obj) {
    console.log('validateTurn')
    if (this.state.game_winner) {
      return false;
    }
    if (obj.state.value) {
      return false;
    }
    if (obj.state.parent.winner) {
      return false;
    }
    if (this.state.nextSquare === 'free') {
      return true;
    } else if (this.state.nextSquare === obj.state.parent.state.pos) {
      return true;
    }

    return false;
  }

  handleClick(obj) {
    var valid = this.validateTurn(obj);
    if (!valid) return;

    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();


    var player = this.state.xIsNext ? 'X' : 'O';
    var selected_game = obj.state.parent.state.pos;
    squares[selected_game][obj.state.pos] = player;
    var winners = this.state.winners
    winners[selected_game] = this.calculateWinner(squares[selected_game]);
    var nextSquare = obj.state.pos
    console.log('winnders:' + winners);
    if (winners[nextSquare]) {
      nextSquare = 'free';
      console.log('free!!!');
    }
    var game_winner = this.calculateWinner(winners);
    this.setState({
      history: history.concat([{
        squares: squares,
        winners: this.state.winners
      }]),
      nextSquare: nextSquare,
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      winners: winners,
      game_winner: game_winner
    });
    this.forceUpdate();
  }
  calculateWinner(squares) {
    console.log(squares)
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]) {
        console.log('winner!!! ' + squares[a])
        return squares[a];
      }
    }
    return null;
  }
}


ReactDOM.render(< Game />,
  document.getElementById('root')
);
