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
    return boardWithCellValues;
  };

  const markBoard = (row, column, player) => {
    let currentValue = board[row][column].getValue();
    if (currentValue !== "") {
      console.log("invalid move, please try again");
      return false;
    }
    board[row][column].mark(player);
    return true;
  };

  return { getBoard, markBoard, printBoard };
}

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

function TurnCounter() {
  let turnNumber = 1;

  const getTurnNumber = () => turnNumber;
  const increment = () => turnNumber++;

  return {
    getTurnNumber,
    increment,
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
  let info = "";
  let winLine = {};
  const board = Gameboard();
  const turnCounter = TurnCounter();

  const players = [
    {
      name: playerOneName,
      mark: "O",
    },
    {
      name: playerTwoName,
      mark: "X",
    },
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

  const checkForWin = () => {
    const checkLines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    const flatBoard = board.printBoard().flat(1);
    for (const checkLine of checkLines) {
      const a = flatBoard[checkLine[0]];
      const b = flatBoard[checkLine[1]];
      const c = flatBoard[checkLine[2]];
      const match = a === b && b === c && c != "";
      console.log(match);
      if (match) {
        return { gameWon: true, start: checkLine[0], end: checkLine[2] };
      }
    }

    return { gameWon: false };
  };

  const setInfo = (gameWon) => {
    if (gameWon) {
      info = `The winner is ${`${activePlayer.name}`}`;
      return;
    }
    info = `${activePlayer.name}'s turn...`;
  };

  const getInfo = () => info;

  const setWinLine = (start, end) => {
    winLine = { start, end };
  };

  const getWinLine = () => winLine;

  const playRound = (row, column) => {
    // Make a mark for the current player
    console.log(
      `Putting ${getActivePlayer().name}'s mark at ${row},${column}...`
    );
    // mark the board.  If the move was valid (on an empty space) then true is returned)
    const validMove = board.markBoard(row, column, getActivePlayer().mark);

    if (!validMove) {
      return;
    }
    winCheck = checkForWin();
    setInfo(winCheck.gameWon);
    if (winCheck.gameWon) {
      setWinLine(winCheck.start, winCheck.end);
      return;
    }

    // Initialize next round

    turnCounter.increment();
    console.log(`Turn Number ${turnCounter.getTurnNumber()}`);
    switchPlayerTurn();
    setInfo(false);
    printNewRound();
  };

  // Initial play game message
  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    getInfo,
    getWinLine,
  };
}

function ScreenController() {
  const game = GameController();
  const infoBarDiv = document.querySelector(".info-bar");
  const boardDiv = document.querySelector(".board");

  const updateScreen = () => {
    // clear the board
    boardDiv.textContent = "";

    // get the newest version of the board and player turn
    const board = game.getBoard();
    const info = game.getInfo();
    const winLineData = game.getWinLine();

    // Display player's turn or win/draw message
    infoBarDiv.textContent = info;

    // Render board squares
    board.forEach((row, index1) => {
      row.forEach((cell, index2) => {
        // Anything clickable should be a button!!
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        // Create a data attribute to identify the column
        // This makes it easier to pass into our `playRound` function
        cellButton.dataset.row = index1;
        cellButton.dataset.column = index2;
        let cellValue = cell.getValue();
        cellButton.textContent = cellValue;
        if (cellValue === "O") {
          cellButton.classList.add("nought");
        }
        if (cellValue === "X") {
          cellButton.classList.add("cross");
        }
        boardDiv.appendChild(cellButton);
      });
    });

    //Render Win Line
    if (Object.keys(winLineData).length != 0) {
      const winLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      winLine.classList.add("winLine");
      const startCell = boardDiv.childNodes[winLineData.start];
      const endCell = boardDiv.childNodes[winLineData.end];
      const b0 = boardDiv.getBoundingClientRect();
      const b1 = startCell.getBoundingClientRect();
      const b2 = endCell.getBoundingClientRect();
      const newLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polyline"
      );
      const x1 = b1.left + b1.width / 2 - b0.left;
      const y1 = b1.top + b1.height / 2 - b0.top;
      const x2 = b2.left + b2.width / 2 - b0.left;
      const y2 = b2.top + b2.height / 2 - b0.top;
      newLine.setAttribute(
        "points",
        `${x1},${y1} ${x2},${y2}`
      );
      winLine.appendChild(newLine);
      boardDiv.appendChild(winLine);
    }
  };

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
