document.addEventListener("DOMContentLoaded", () => {
  initHelpModal();
  initStatsModal();
  createSquares();
  addKeyboardClicks();

  // also in local storage
  let currentWordIndex = 0;
  let guessedWordCount = 0;
  let availableSpace = 1;
  let guessedWords = [[]];

  const words = ["sweet", "onion", "shoes", "heavy", "couch"];
  let currentWord = words[currentWordIndex];

  function createSquares() {
    const gameBoard = document.getElementById("board");

    for (let i = 0; i < 30; i++) {
      let square = document.createElement("div");
      square.classList.add("animate__animated");
      square.classList.add("square");
      square.setAttribute("id", i + 1);
      gameBoard.appendChild(square);
    }
  }

  function getCurrentWordArr() {
    const numberOfGuessedWords = guessedWords.length;
    return guessedWords[numberOfGuessedWords - 1];
  }

  function updateGuessedLetters(letter) {
    const currentWordArr = getCurrentWordArr();

    if (currentWordArr && currentWordArr.length < 5) {
      currentWordArr.push(letter);

      const availableSpaceEl = document.getElementById(availableSpace);

      availableSpaceEl.textContent = letter;
      availableSpace = availableSpace + 1;
    }
  }

  function showResult() {
    const finalResultEl = document.getElementById("final-score");
    finalResultEl.textContent = "Wordle 1 - You win!";
  }

  function showLosingResult() {
    const finalResultEl = document.getElementById("final-score");
    finalResultEl.textContent = `Wordle 1 - Unsuccessful Today!`;
  }

  function clearBoard() {
    for (let i = 0; i < 30; i++) {
      let square = document.getElementById(i + 1);
      square.textContent = "";
    }

    const keys = document.getElementsByClassName("keyboard-button");

    for (var key of keys) {
      key.disabled = true;
    }
  }

  function getIndicesOfLetter(letter, arr) {
    const indices = [];
    let idx = arr.indexOf(letter);
    while (idx != -1) {
      indices.push(idx);
      idx = arr.indexOf(letter, idx + 1);
    }
    return indices;
  }

  function getTileClass(letter, index, currentWordArr) {
    const isCorrectLetter = currentWord
      .toUpperCase()
      .includes(letter.toUpperCase());

    if (!isCorrectLetter) {
      return "incorrect-letter";
    }

    const letterInThatPosition = currentWord.charAt(index);
    const isCorrectPosition =
      letter.toLowerCase() === letterInThatPosition.toLowerCase();

    if (isCorrectPosition) {
      return "correct-letter-in-place";
    }

    const isGuessedMoreThanOnce =
      currentWordArr.filter((l) => l === letter).length > 1;

    if (!isGuessedMoreThanOnce) {
      return "correct-letter";
    }

    const existsMoreThanOnce =
      currentWord.split("").filter((l) => l === letter).length > 1;

    // is guessed more than once and exists more than once
    if (existsMoreThanOnce) {
      return "correct-letter";
    }

    const hasBeenGuessedAlready = currentWordArr.indexOf(letter) < index;

    const indices = getIndicesOfLetter(letter, currentWord.split(""));
    const otherIndices = indices.filter((i) => i !== index);
    const isGuessedCorrectlyLater = otherIndices.some(
      (i) => i > index && currentWordArr[i] === letter
    );

    if (!hasBeenGuessedAlready && !isGuessedCorrectlyLater) {
      return "correct-letter";
    }

    return "incorrect-letter";
  }

  async function handleSubmitWord() {
    const currentWordArr = getCurrentWordArr();
    const guessedWord = currentWordArr.join("");

    if (guessedWord.length !== 5) {
      return;
    }

    try {
      // const res = await fetch(
      //   `https://wordsapiv1.p.rapidapi.com/words/${guessedWord.toLowerCase()}`,
      //   {
      //     method: "GET",
      //     headers: {
      //       "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
      //       "x-rapidapi-key": "<YOU_KEY_HERE>",
      //     },
      //   }
      // );

      // if (!res.ok) {
      //   throw Error();
      // }
      const firstLetterId = guessedWordCount * 5 + 1;

      const interval = 200;
      currentWordArr.forEach((letter, index) => {
        setTimeout(() => {
          const tileClass = getTileClass(letter, index, currentWordArr);
          if (tileClass) {
            const letterId = firstLetterId + index;
            const letterEl = document.getElementById(letterId);
            letterEl.classList.add("animate__flipInX");
            letterEl.classList.add(tileClass);

            const keyboardEl = document.querySelector(`[data-key=${letter}]`);
            keyboardEl.classList.add(tileClass);
          }
        }, index * interval);
      });

      guessedWordCount += 1;

      if (guessedWord === currentWord) {
        setTimeout(() => {
          const okSelected = window.confirm("Well done!");
          if (okSelected) {
            clearBoard();
            showResult();
          }
          return;
        }, 1200);
      }

      if (guessedWords.length === 6 && guessedWord !== currentWord) {
        setTimeout(() => {
          const okSelected = window.confirm(
            `Sorry, you have no more guesses! The word is "${currentWord.toUpperCase()}".`
          );
          if (okSelected) {
            clearBoard();
            showLosingResult();
          }
          return;
        }, 1200);
      }

      guessedWords.push([]);
    } catch (_error) {
      window.alert("Word is not recognised!");
    }
  }

  function handleDelete() {
    const currentWordArr = getCurrentWordArr();

    if (!currentWordArr.length) {
      return;
    }

    currentWordArr.pop();

    guessedWords[guessedWords.length - 1] = currentWordArr;

    const lastLetterEl = document.getElementById(availableSpace - 1);

    lastLetterEl.innerHTML = "";
    availableSpace = availableSpace - 1;
  }

  function addKeyboardClicks() {
    const keys = document.querySelectorAll(".keyboard-row button");
    for (let i = 0; i < keys.length; i++) {
      keys[i].addEventListener("click", ({ target }) => {
        const key = target.getAttribute("data-key");

        if (key === "enter") {
          handleSubmitWord();
          return;
        }

        if (key === "del") {
          handleDelete();
          return;
        }

        updateGuessedLetters(key);
      });
    }
  }

  function initHelpModal() {
    const modal = document.getElementById("help-modal");

    // Get the button that opens the modal
    const btn = document.getElementById("help");

    // Get the <span> element that closes the modal
    const span = document.getElementById("close-help");

    // When the user clicks on the button, open the modal
    btn.addEventListener("click", function () {
      modal.style.display = "block";
    });

    // When the user clicks on <span> (x), close the modal
    span.addEventListener("click", function () {
      modal.style.display = "none";
    });

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener("click", function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });
  }

  function initStatsModal() {
    const modal = document.getElementById("stats-modal");

    // Get the button that opens the modal
    const btn = document.getElementById("stats");

    // Get the <span> element that closes the modal
    const span = document.getElementById("close-stats");

    // When the user clicks on the button, open the modal
    btn.addEventListener("click", function () {
      // update stats here
      modal.style.display = "block";
    });

    // When the user clicks on <span> (x), close the modal
    span.addEventListener("click", function () {
      modal.style.display = "none";
    });

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener("click", function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });
  }
});
