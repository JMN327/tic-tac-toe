function Gameboard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  //populate board array with Cell objects
  const resetBoard = () => {
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < columns; j++) {
        board[i].push(Cell());
      }
    }
    console.log("board initialized");
  };

  const getBoard = () => board;

  const markBoard = (row, column, player) => {
    let currentValue = board[row][column].getValue();
    if (currentValue !== "") {
      return false;
    }
    board[row][column].mark(player);
    return true;
  };

  resetBoard();

  return { getBoard, markBoard, resetBoard };
}

function Cell() {
  let value = "";

  const mark = (player) => {
    value = player;
  };

  const getValue = () => value;

  const reset = () => {
    value = "";
  };

  return {
    mark,
    getValue,
    reset,
  };
}

function TurnCounter() {
  let turnNumber = 1;

  const turn = () => turnNumber;
  const increment = () => turnNumber++;
  const reset = () => (turnNumber = 1);

  return {
    turn,
    increment,
    reset,
  };
}

function GameController(
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

    const flatBoard = board
      .getBoard()
      .map((row) => row.map((cell) => cell.getValue()))
      .flat(1);
    for (const checkLine of checkLines) {
      const a = flatBoard[checkLine[0]];
      const b = flatBoard[checkLine[1]];
      const c = flatBoard[checkLine[2]];
      const match = a === b && b === c && c != "";
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
    if (turnCounter.turn() === 10) {
      info = "Draw game!";
      return;
    }
    if (turnCounter.turn() === 1) {
      info = `Game begins! ${activePlayer.name}'s turn...`;
      return;
    }
    info = `${activePlayer.name}'s turn...`;
  };

  const getInfo = () => info;

  const setWinLine = (start, end) => {
    winLine = { start, end };
  };

  const getWinLine = () => winLine;

  const reset = () => {
    winLine = {};
    turnCounter.reset();
    board.resetBoard();
    setInfo();
  };

  const playRound = (row, column) => {

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
    console.log(`Turn Number ${turnCounter.turn()}`);
    switchPlayerTurn();
    setInfo(false);
  };

  // Initial play game message
  setInfo(false);

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    getInfo,
    getWinLine,
    reset,
  };
}

function ScreenController() {
  const game = GameController();
  const infoBarDiv = document.querySelector(".info-bar");
  const boardDiv = document.querySelector(".board");
  const gameContainer = document.querySelector(".gameContainer");

  const updateScreen = () => {
    // clear the board
    boardDiv.textContent = "";

    // get the newest version of the board and player turn
    const board = game.getBoard();
    const info = game.getInfo();
    console.log(`info is ${info}`);
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
      newLine.setAttribute("points", `${x1},${y1} ${x2},${y2}`);
      winLine.appendChild(newLine);
      boardDiv.appendChild(winLine);

      addPlayAgainButton();
    }

    if (info === "Draw game!") {
      addPlayAgainButton();
    }

    function addPlayAgainButton() {
      const playAgainDiv = document.createElement("div");
      playAgainDiv.classList = "playAgainDiv";
      const playAgainBtn = document.createElement("button");
      playAgainBtn.classList.add("resetBtn");
      playAgainBtn.innerText = "Play Again";
      playAgainBtn.addEventListener("click", clickPlayAgain);
      playAgainDiv.appendChild(playAgainBtn);
      gameContainer.appendChild(playAgainDiv);
    }
  };

  // Add event listene for the board
  function clickPlayAgain() {
    console.log(`last child is: ${gameContainer.lastChild.classList[0]}`);
    gameContainer.lastChild.remove();
    game.reset();
    updateScreen();
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
