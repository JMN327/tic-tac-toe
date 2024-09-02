function Gameboard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  //populate board array with Cell objects
  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;
  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );
    console.log(boardWithCellValues);
  };

  const markBoard = (row, column, player) => {
    let currentValue = board[row][column].getValue();
    if (currentValue !== 0) {
        console.log("current value of position " + currentValue)
      return;
    }
    board[row][column].mark(player);
  };

  return { getBoard, markBoard, printBoard };
};

function Cell() {
  let value = 0;

  const mark = (player) => {
    value = player;
  };

  const getValue = () => value;

  return {
    mark,
    getValue,
  };
}

function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
  ) {
    const board = Gameboard();
  
    const players = [
      {
        name: playerOneName,
        mark: 1
      },
      {
        name: playerTwoName,
        mark: 2
      }
    ];
  
    let activePlayer = players[0];
  
    const switchPlayerTurn = () => {
      activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;
  
    const printNewRound = () => {
      board.printBoard();
      console.log(`${getActivePlayer().name}'s turn.`);
    };
  
    const playRound = (row, column) => {
      // Drop a mark for the current player
      console.log(
        `Putting ${getActivePlayer().name}'s mark at ${row},${column}...`
      );
      board.markBoard(row, column, getActivePlayer().mark);
  
      /*  This is where we would check for a winner and handle that logic,
          such as a win message. */
  
      // Switch player turn
      switchPlayerTurn();
      printNewRound();
    };
  
    // Initial play game message
    printNewRound();
  
    // For the console version, we will only use playRound, but we will need
    // getActivePlayer for the UI version, so I'm revealing it now
    return {
      playRound,
      getActivePlayer
    };
  }
  
  const game = GameController();
