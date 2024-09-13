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

  const markBoard = (row, column, playerMark) => {
    let currentValue = board[row][column].getValue();
    console.log(currentValue);
    if (currentValue !== "") {
      return false;
    }
    board[row][column].mark(playerMark);
    return true;
  };

  function Cell() {
    let value = "";

    const mark = (playerMark) => {
      value = playerMark;
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

  resetBoard();

  return { getBoard, markBoard, resetBoard };
}

function GameController() {
  let players = Players();
  let winLine = {};
  const board = Gameboard();
  const turnCounter = TurnCounter();
  let gameActiveState = false;

  function Players() {
    let players = [
      {
        name: "Player One",
        mark: "O",
        score: 0,
        index: 0,
      },
      {
        name: "Player Two",
        mark: "X",
        score: 0,
        index: 1,
      },
    ];

    let startPlayer = Math.round(Math.random());
    let activePlayer = players[startPlayer];

    const switchStartPlayer = () => {
      startPlayer = startPlayer === players[0] ? players[1] : players[0];
      activePlayer = startPlayer;
    };

    const getActivePlayer = () => activePlayer;

    const switchPlayerTurn = () => {
      activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const setPlayerNames = (playerOneName, playerTwoName) => {
      players[0].name = playerOneName == "" ? "Player One" : playerOneName;
      players[1].name = playerTwoName == "" ? "Player Two" : playerTwoName;
    };
    const setPlayerMarks = (playerOneMark, playerTwoMark) => {
      players[0].mark = playerOneMark;
      players[1].mark = playerTwoMark;
    };
    const incrementScores = (playerIndex) => {
      players[playerIndex].score++;
    };
    const resetScores = () => {
      players[0].score = 0;
      players[1].score = 0;
    };
    const getPlayers = () => players;

    return {
      switchStartPlayer,
      getActivePlayer,
      switchPlayerTurn,
      setPlayerNames,
      setPlayerMarks,
      incrementScores,
      resetScores,
      getPlayers,
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

  const setWinLine = (start, end) => {
    winLine = { start, end };
  };

  const toggleGameActiveState = () => {
    gameActiveState ? (gameActiveState = false) : (gameActiveState = true);
  };

  const getGameActiveState = () => gameActiveState;

  const getWinLine = () => winLine;

  const resetGame = () => {
    winLine = {};
    turnCounter.reset();
    board.resetBoard();
    players.switchStartPlayer();

    console.log(players.getActivePlayer().name);
    Info.setInfo(`Game begins! ${players.getActivePlayer().name}'s turn...`);
  };

  const playRound = (row, column) => {
    console.log("playing round");
    const validMove = board.markBoard(
      row,
      column,
      players.getActivePlayer().mark
    );
    if (!validMove) {
      return;
    }
    winCheck = checkForWin();
    if (winCheck.gameWon) {
      Info.setInfo(`A win! 1 point to ${players.getActivePlayer().name}!`);
      setWinLine(winCheck.start, winCheck.end);
      players.incrementScores(players.getActivePlayer().index);
      console.log(players.getPlayers()[0].score, players.getPlayers()[1].score);
      toggleGameActiveState();
      return;
    }
    if (turnCounter.turn() === 9) {
      Info.setInfo("Draw game!");
      console.log("Draw!");
      toggleGameActiveState();
      return;
    }
    // Initialize next round
    turnCounter.increment();
    console.log(`Turn Number ${turnCounter.turn()}`);
    players.switchPlayerTurn();
    Info.setInfo(`${players.getActivePlayer().name}'s turn...`);
  };

  // Initial play game message

  return {
    setPlayerNames: players.setPlayerNames,
    setPlayerMarks: players.setPlayerMarks,
    incrementScores: players.incrementScores,
    resetScores: players.resetScores,
    getPlayers: players.getPlayers,
    playRound,
    getBoard: board.getBoard,
    getWinLine,
    resetGame,
    toggleGameActiveState,
    getGameActiveState,
  };
}

function ScreenController() {
  const game = GameController();
  const infoBarDiv = document.querySelector(".info-bar");
  const boardDiv = document.querySelector(".board");
  const toolbar = document.querySelector(".toolbar");
  const scores = document.querySelectorAll(".score");
  const toolbarBtnArr = Array.from(document.querySelector(".toolbar").children);
  const markGroups = document.querySelectorAll(".mark-group");

  const updateScreen = () => {
    // clear the board
    boardDiv.textContent = "";

    // get the newest version of the board and player turn
    const board = game.getBoard();
    const winLineData = game.getWinLine();

    // Display player's turn or win/draw message
    if (Info.getInfo() == "") {
      Info.setInfo("Welcome! check the buttons below");
    }
    const info = Info.getInfo();
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

      toggleToolbar(true, true, true);

      scores[0].innerText = game.getPlayers()[0].score;
      scores[1].innerText = game.getPlayers()[1].score;
    }

    if (info === "Draw game!") {
      toggleToolbar(true, true, true);
    }
  };

  function toggleToolbar(b0, b1, b2) {
    toolbarBtnArr[0].disabled = !b0;
    toolbarBtnArr[1].disabled = !b1;
    toolbarBtnArr[2].disabled = !b2;
    console.log("Toolbar Toggled");
  }

  function togglePlayerInfo(btn) {
    nameInputs = document.querySelectorAll(".name-input");
    nameInputs.forEach((nameInput) => {
      nameInput.disabled === true
        ? (nameInput.disabled = false)
        : (nameInput.disabled = true);
    });
    array1 = Array.from(markGroups[0].childNodes).concat(
      Array.from(markGroups[1].childNodes)
    );
    array1.forEach((markGroups) => {
      markGroups.disabled === true
        ? (markGroups.disabled = false)
        : (markGroups.disabled = true);
    });
    if (nameInputs[0].disabled === false) {
      nameInputs[0].focus();
      toggleToolbar(true, false, false);
      btn.innerText = "Done";
      Info.setInfo("Enter you names and choose Marks");
    } else {
      toggleToolbar(true, true, true);
      btn.innerText = "Set Players";
      game.setPlayerNames(nameInputs[0].value, nameInputs[1].value);
      Info.setInfo("Names Updated.  Ready for a New Game?");
    }
  }
  // Add event listener for the toolbar
  function clickHandlerToolbar(e) {
    switch (parseFloat(e.target.dataset.groupPosition)) {
      case 1:
        togglePlayerInfo(e.target);
        infoBarDiv.textContent = Info.getInfo();
        break;

      case 2:
        toggleToolbar(false, false, false);
        game.toggleGameActiveState();
        game.resetGame();
        updateScreen();
        break;

      case 3:
        scores[0].innerText = 0;
        scores[1].innerText = 0;
        game.resetScores();
        Info.setInfo("Scores reset.  Ready for a New Game?");
        infoBarDiv.textContent = Info.getInfo();

        break;

      default:
        break;
    }
  }

  // Add event listener for the board
  function clickHandlerBoard(e) {
    if (game.getGameActiveState() === false) {
      return;
    }
    const selectedRow = e.target.dataset.row;
    const selectedColumn = e.target.dataset.column;
    if (!selectedColumn) return;
    if (!selectedRow) return;
    game.playRound(selectedRow, selectedColumn);
    updateScreen();
  }

  function clickHandlerMarkGroup(e) {
    log(e.target.dataset.markIndex);
    const markIndex = e.target.dataset.markIndex;
    switch (markIndex) {
      case "0":
        game.setPlayerMarks("O", "X");
        updateMarksClass(0, 3, 1, 2);
        break;
      case "1":
        game.setPlayerMarks("X", "O");
        updateMarksClass(1, 2, 0, 3);
        break;
      case "2":
        game.setPlayerMarks("X", "O");
        updateMarksClass(1, 2, 0, 3);
        break;
      case "3":
        game.setPlayerMarks("O", "X");
        updateMarksClass(0, 3, 1, 2);
        break;
      default:
        log("huh");
        break;
    }
    function updateMarksClass(on1, on2, off1, off2) {
      marksArr = Array.from(markGroups[0].children).concat(
        Array.from(markGroups[1].children)
      );
      if (marksArr[on1].classList.contains("off")) {
        marksArr[on1].classList.remove("off");
      }
      if (marksArr[on2].classList.contains("off")) {
        marksArr[on2].classList.remove("off");
      }
      marksArr[off1].classList.add("off");
      marksArr[off2].classList.add("off");
    }
  }
  /*   function mouseoverHandlerBoard(e) {
    const cellOver = e.target.classList.value;
    if ((cellOver === "cell")) {
      console.log(cellOver, e.target);
      e.target.textContent = "-Z";
    }
    updateScreen();
  } */

  boardDiv.addEventListener("click", clickHandlerBoard);
  toolbar.addEventListener("click", clickHandlerToolbar);
  markGroups[0].addEventListener("click", clickHandlerMarkGroup);
  markGroups[1].addEventListener("click", clickHandlerMarkGroup);
  /* boardDiv.addEventListener("mouseover", mouseoverHandlerBoard); */

  // Initial render
  updateScreen();
}

const Info = (function () {
  let info = "";

  const setInfo = (str) => {
    info = str;
  };

  const getInfo = () => info;

  return {
    setInfo,
    getInfo,
  };
})();

log = console.log;

ScreenController();
