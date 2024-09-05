function Gameboard() {
  // creates the grid and populates it with individual cells objects to be marked during the game
  // methods returned:
  // get board - allows the board state to be sent to the game controller
  // print board - logs the board in the console for debugging
  // mark board - passes player data from game controller to cell objects

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
    if (currentValue !== "") {
      console.log("invalid move, please try again")
      return false;
    }
    board[row][column].mark(player);
    return true
  };

  return { getBoard, markBoard, printBoard };
};

function Cell() {
  // Object for individual cells of the board.  
  // Holds an X or O value based on which player marked it
  // Methods returned:
  // mark - add the active player's mark to the cell.  accessed by the game controller
  // get value - returns the current state of a cell

  let value = "";

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
    // handler for updating the game state.  Sets the 2 players and controls their interactions with the game
    // Methods returned:
    // Play round - handles game logic:  updates gameboard cells and switches active player
    // Get Active Player - returns the active player.  called by the screen controller 
    // Get Board - passes board from gameboard to screen controller for screen updates

    playerOneName = "Player One",
    playerTwoName = "Player Two"
  ) {
    const board = Gameboard();
  
    const players = [
      {
        name: playerOneName,
        mark: "O"
      },
      {
        name: playerTwoName,
        mark: "X"
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
      // Make a mark for the current player
      console.log(
        `Putting ${getActivePlayer().name}'s mark at ${row},${column}...`
      );
      const validMove = board.markBoard(row, column, getActivePlayer().mark);
  
      /*  This is where we would check for a winner and handle that logic,
          such as a win message. */
  
      // Switch player turn
      if (validMove) {
        switchPlayerTurn();
      }
      printNewRound();
    };
  
    // Initial play game message
    printNewRound();

    return {
      playRound,
      getActivePlayer,
      getBoard: board.getBoard
    };
  }
  
  function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
  
    const updateScreen = () => {
      // clear the board
      boardDiv.textContent = "";
  
      // get the newest version of the board and player turn
      const board = game.getBoard();
      const activePlayer = game.getActivePlayer();
  
      // Display player's turn
      playerTurnDiv.textContent = `${activePlayer.name}'s turn...`
  
      // Render board squares
      board.forEach((row, index1) => {
        row.forEach((cell, index2) => {
          // Anything clickable should be a button!!
          const cellButton = document.createElement("button");
          cellButton.classList.add("cell");
          // Create a data attribute to identify the column
          // This makes it easier to pass into our `playRound` function 
          cellButton.dataset.row = index1
          cellButton.dataset.column = index2
          let cellValue = cell.getValue();
          cellButton.textContent = cellValue;
          if (cellValue === "O") {
            cellButton.classList.add("nought");
          }
          if (cellValue ==="X") {
            cellButton.classList.add("cross");
          }
          boardDiv.appendChild(cellButton);
        })
      })
    }
  
    // Add event listener for the board
    function clickHandlerBoard(e) {
      const selectedRow = e.target.dataset.row;
      const selectedColumn = e.target.dataset.column;
      if (!selectedColumn) return;
      if (!selectedRow) return;
      game.playRound(selectedRow, selectedColumn);
      updateScreen();
    }
    boardDiv.addEventListener("click", clickHandlerBoard);
  
    // Initial render
    updateScreen();
  }
  
  ScreenController();  
