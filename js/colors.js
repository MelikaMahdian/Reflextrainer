window.renderColors = function renderColors(opts = {}) {
  const { onBack = () => {}, onComplete = () => {} } = opts;

  document.body.className = "colors";
  const app = document.getElementById("app");

  app.innerHTML = `
    <button class="back-btn" id="backBtn" type="button">← Zurück</button>

    <div class="colors-wrap">
      <div class="colors-card">
        <div class="colors-top">
          <div class="colors-title">Click ONLY when the word matches the color!</div>
          <div class="colors-score">Score: <span id="score">0</span> / <span id="goal">10</span></div>
        </div>

        <div class="colors-display">
          <div class="colors-word" id="word">GREEN</div>
        </div>

        <div class="colors-actions">
          <button class="btn btn-match" id="btnMatch" type="button">MATCH!</button>
          <button class="btn btn-nomatch" id="btnNoMatch" type="button">No Match</button>
        </div>

        <div class="colors-feedback" id="feedback"></div>
      </div>
    </div>
  `;

  document.getElementById("backBtn").addEventListener("click", onBack);

  const wordEl = document.getElementById("word");
  const scoreEl = document.getElementById("score");
  const goalEl = document.getElementById("goal");
  const feedbackEl = document.getElementById("feedback");
  const btnMatch = document.getElementById("btnMatch");
  const btnNoMatch = document.getElementById("btnNoMatch");

  const GOAL = 10;
  goalEl.textContent = String(GOAL);

  const COLORS = [
    { name: "RED", css: "#ef4444" },
    { name: "GREEN", css: "#22c55e" },
    { name: "BLUE", css: "#3b82f6" },
    { name: "YELLOW", css: "#eab308" },
    { name: "PURPLE", css: "#a855f7" }
  ];

  let score = 0;
  let current = null;

  btnMatch.addEventListener("click", () => handleAnswer(true));
  btnNoMatch.addEventListener("click", () => handleAnswer(false));

  nextRound();

  function nextRound() {
    feedbackEl.textContent = "";
    feedbackEl.className = "colors-feedback";

    const isMatch = Math.random() < 0.5;

    const word = pick(COLORS);
    let color = pick(COLORS);

    if (isMatch) {
      color = COLORS.find(c => c.name === word.name);
    } else {
      while (color.name === word.name) color = pick(COLORS);
    }

    current = { wordName: word.name, colorCss: color.css, isMatch };

    wordEl.textContent = current.wordName;
    wordEl.style.color = current.colorCss;
  }

  function handleAnswer(userSaysMatch) {
    const correct = userSaysMatch === current.isMatch;

    if (correct) {
      score++;
      scoreEl.textContent = String(score);
      showFeedback(true);
    } else {
      showFeedback(false);
    }

    if (score >= GOAL) {
      feedbackEl.textContent = "Geschafft! Level abgeschlossen ✅";
      feedbackEl.className = "colors-feedback ok";
      btnMatch.disabled = true;
      btnNoMatch.disabled = true;
      setTimeout(onComplete, 500);
    } else {
      setTimeout(nextRound, 450);
    }
  }

  function showFeedback(ok) {
    feedbackEl.textContent = ok ? "Richtig!" : "Falsch!";
    feedbackEl.className = `colors-feedback ${ok ? "ok" : "bad"}`;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
};
