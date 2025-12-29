window.renderWarmup = function renderWarmup(opts = {}) {
  const { onBack = () => {}, onComplete = () => {} } = opts;

  document.body.className = "warmup";
  const app = document.getElementById("app");

  app.innerHTML = `
    <button class="back-btn" id="backBtn" type="button">← Zurück</button>

    <main class="wu-page">
      <section class="wu-card">
        <div class="wu-head">
          <div>
            <h2 class="wu-title">Warm-up</h2>
            <p class="wu-sub">Klicke auf das grüne Quadrat, sobald es erscheint!</p>
          </div>

          <div class="wu-score">
            <div class="wu-score__label">Treffer</div>
            <div class="wu-score__value"><span id="hits">0</span> / <span id="goal">5</span></div>
          </div>
        </div>

        <div class="wu-center">
          <button class="wu-start" id="startBtn" type="button">Training starten</button>
        </div>

        <div class="wu-arenaWrap" id="arenaWrap" hidden>
          <div class="wu-arena" id="arena">
            <button class="wu-target" id="target" type="button" aria-label="Ziel"></button>
          </div>
        </div>
      </section>
    </main>
  `;

  document.getElementById("backBtn").addEventListener("click", onBack);

  const startBtn = document.getElementById("startBtn");
  const arenaWrap = document.getElementById("arenaWrap");
  const arena = document.getElementById("arena");
  const target = document.getElementById("target");
  const hitsEl = document.getElementById("hits");
  const goalEl = document.getElementById("goal");

  const GOAL = 5;
  goalEl.textContent = String(GOAL);

  let hits = 0;
  let running = false;
  let timeoutId = null;

  startBtn.addEventListener("click", () => {
    if (running) return;
    running = true;
    hits = 0;
    hitsEl.textContent = "0";

    startBtn.disabled = true;
    startBtn.textContent = "Läuft…";

    arenaWrap.hidden = false;
    scheduleNextTarget();
  });

  target.addEventListener("click", () => {
    if (!running) return;

    hits++;
    hitsEl.textContent = String(hits);

    target.style.opacity = "0";
    if (timeoutId) clearTimeout(timeoutId);

    if (hits >= GOAL) {
      running = false;
      startBtn.disabled = false;
      startBtn.textContent = "Geschafft ✅";
      setTimeout(onComplete, 400);
    } else {
      timeoutId = setTimeout(scheduleNextTarget, 250);
    }
  });

  function scheduleNextTarget() {
    const wait = 600 + Math.random() * 1200;
    target.style.opacity = "0";
    timeoutId = setTimeout(() => {
      placeTargetRandom();
      target.style.opacity = "1";
    }, wait);
  }

  function placeTargetRandom() {
    const rect = arena.getBoundingClientRect();
    const size = 140;
    const padding = 24;

    const maxX = Math.max(padding, rect.width - size - padding);
    const maxY = Math.max(padding, rect.height - size - padding);

    const x = padding + Math.random() * (maxX - padding);
    const y = padding + Math.random() * (maxY - padding);

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
    target.style.width = `${size}px`;
    target.style.height = `${size}px`;
  }
};
