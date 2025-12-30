window.renderNumbers = function renderNumbers(opts = {}) {
  const { onBack = () => {}, onComplete = () => {} } = opts;

  document.body.className = "level numbers";
  const app = document.getElementById("app");

 app.innerHTML = `
  <button class="back-btn" id="backBtn" type="button">← Zurück</button>

  <main class="level-page">
    <section class="level-card num-card">

      <div class="num-header">
        <div>
          <h2 class="num-title">Zahlen</h2>
          <p class="num-sub">Klicke auf die Zahl, die dem angezeigten Wort entspricht!</p>
        </div>

        <div class="num-stats">
          <div class="stat">
            <div class="label">Punkte</div>
            <div class="value"><span id="points">0</span> / <span id="goalPoints">5</span></div>
          </div>
          <div class="stat">
            <div class="label">Runde</div>
            <div class="value"><span id="round">0</span> / <span id="goalRounds">5</span></div>
          </div>
        </div>
      </div>

      <div class="num-display">
        <div class="num-word" id="word">SIEBEN</div>
      </div>

      <div class="num-grid" id="grid"></div>
      <div class="num-feedback" id="feedback"></div>

    </section>
  </main>
`;

  document.getElementById("backBtn").addEventListener("click", onBack);

  const pointsEl = document.getElementById("points");
  const roundEl = document.getElementById("round");
  const goalPointsEl = document.getElementById("goalPoints");
  const goalRoundsEl = document.getElementById("goalRounds");
  const wordEl = document.getElementById("word");
  const gridEl = document.getElementById("grid");
  const feedbackEl = document.getElementById("feedback");

  const GOAL = 5;
  goalPointsEl.textContent = String(GOAL);
  goalRoundsEl.textContent = String(GOAL);

  const WORDS = {
    1: "EINS",
    2: "ZWEI",
    3: "DREI",
    4: "VIER",
    5: "FÜNF",
    6: "SECHS",
    7: "SIEBEN",
    8: "ACHT",
    9: "NEUN"
  };

  let points = 0;
  let round = 0;
  let correctNumber = 7;
  let locked = false;

  nextRound();

  function nextRound() {
    locked = false;
    feedbackEl.textContent = "";
    feedbackEl.className = "num-feedback";

    round++;
    roundEl.textContent = String(round);

    correctNumber = 1 + Math.floor(Math.random() * 9);
    wordEl.textContent = WORDS[correctNumber];

    renderGrid();
  }

  function renderGrid() {
    const nums = Array.from({ length: 9 }, (_, i) => i + 1);
    shuffle(nums);

    gridEl.innerHTML = "";
    nums.forEach(n => {
      const btn = document.createElement("button");
      btn.className = "num-btn";
      btn.type = "button";
      btn.textContent = String(n);
      btn.addEventListener("click", () => handlePick(n));
      gridEl.appendChild(btn);
    });
  }

  function handlePick(n) {
    if (locked) return;
    locked = true;

    const ok = n === correctNumber;

    if (ok) {
      points++;
      pointsEl.textContent = String(points);
      feedbackEl.textContent = "Richtig!";
      feedbackEl.classList.add("ok");
    } else {
      feedbackEl.textContent = `Falsch! Richtige Zahl: ${correctNumber}`;
      feedbackEl.classList.add("bad");
    }

    [...gridEl.querySelectorAll("button")].forEach(b => (b.disabled = true));

    if (round >= GOAL) {
      setTimeout(() => {
        feedbackEl.textContent = `Fertig! Punkte: ${points} / ${GOAL} ✅`;
        feedbackEl.className = "num-feedback ok";
        setTimeout(onComplete, 500);
      }, 700);
      return;
    }

    setTimeout(nextRound, 700);
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
};
