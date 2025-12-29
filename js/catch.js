// Catch Level: "Fange nur die Bälle! Vermeide die Dreiecke!"
// - Klick Ball: Treffer++
// - Ball fällt unten raus: verpasst++
// - Klick Dreieck: Strafe (verpasst++), optional Treffer-- (hier: nur verpasst++)
// - Ende: Zeit abgelaufen ODER 3 Bälle verpasst

window.renderCatch = function renderCatch() {
  document.body.className = "catch";

  const app = document.getElementById("app") || document.body;

  app.innerHTML = `
    <button class="catch-back" id="catchBack" type="button">← Zurück</button>

    <div class="catch-wrap">
      <div class="catch-card">
        <h2 class="catch-title">Ball</h2>
        <p class="catch-sub">Fange nur die Bälle! Vermeide die Dreiecke!</p>

        <div class="catch-hud">
          <div class="hud-item hud-hit">
            <div class="label">Treffer</div>
            <div class="value" id="hits">0</div>
          </div>
          <div class="hud-item hud-miss">
            <div class="label">Verpasste Bälle</div>
            <div class="value"><span id="miss">0</span> / <span id="missMax">3</span></div>
          </div>
          <div class="hud-item hud-time">
            <div class="label">Zeit</div>
            <div class="value"><span id="time">35</span>s</div>
          </div>
        </div>

        <div class="catch-arena" id="arena"></div>
        <div class="catch-feedback" id="feedback"></div>
      </div>
    </div>
  `;

  const backBtn = document.getElementById("catchBack");
  const arena = document.getElementById("arena");
  const hitsEl = document.getElementById("hits");
  const missEl = document.getElementById("miss");
  const missMaxEl = document.getElementById("missMax");
  const timeEl = document.getElementById("time");
  const feedbackEl = document.getElementById("feedback");

  // Settings
  const DURATION_SEC = 35;
  const MISS_MAX = 3;

  missMaxEl.textContent = String(MISS_MAX);
  timeEl.textContent = String(DURATION_SEC);

  let hits = 0;
  let miss = 0;
  let running = true;

  // Spiel-Loop (physics)
  let lastTs = performance.now();
  let spawnTimer = 0;
  let countdown = DURATION_SEC;

  // Objekte
  const objects = []; // {el, type, x,y, vy, size, clicked}

  backBtn.addEventListener("click", () => window.location.reload());

  // Countdown Timer
  const secInterval = setInterval(() => {
    if (!running) return;
    countdown--;
    timeEl.textContent = String(Math.max(0, countdown));
    if (countdown <= 0) endGame(true);
  }, 1000);

  requestAnimationFrame(tick);

  function tick(ts) {
    if (!running) return;

    const dt = Math.min(0.033, (ts - lastTs) / 1000);
    lastTs = ts;

    // spawn alle ~0.75s (random)
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnTimer = 0.55 + Math.random() * 0.55; // 0.55 - 1.1s
      spawnObject();
    }

    // move objects
    const arenaRect = arena.getBoundingClientRect();
    for (let i = objects.length - 1; i >= 0; i--) {
      const o = objects[i];
      o.y += o.vy * dt;

      // apply
      o.el.style.transform = `translate(${o.x}px, ${o.y}px)`;

      // out of bounds bottom
      if (o.y > arenaRect.height + 80) {
        // nur Bälle zählen als "verpasst"
        if (o.type === "ball" && !o.clicked) {
          miss++;
          missEl.textContent = String(miss);
          if (miss >= MISS_MAX) {
            endGame(false);
            return;
          }
        }
        // remove
        o.el.remove();
        objects.splice(i, 1);
      }
    }

    requestAnimationFrame(tick);
  }

  function spawnObject() {
    const arenaRect = arena.getBoundingClientRect();
    const size = 70 + Math.floor(Math.random() * 30); // 70-99
    const x = 20 + Math.random() * (arenaRect.width - size - 40);

    const isBall = Math.random() < 0.7; // 70% ball, 30% triangle
    const type = isBall ? "ball" : "tri";

    const el = document.createElement("div");
    el.className = `obj ${type}`;
    el.style.left = "0px";
    el.style.top = "0px";

    if (type === "ball") {
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      // Farben wie Screenshot: rot/grün wechselnd
      el.style.background = Math.random() < 0.5 ? "#ef4444" : "#22c55e";
      el.style.borderRadius = "999px";
    } else {
      // Dreieck via border trick
      const triSize = size; // basis
      el.style.borderLeft = `${triSize / 2}px solid transparent`;
      el.style.borderRight = `${triSize / 2}px solid transparent`;
      el.style.borderBottom = `${triSize}px solid #111827`; // dunkel
      // Dreieck braucht "hitbox"
      el.style.width = "0px";
      el.style.height = "0px";
    }

    arena.appendChild(el);

    const o = {
      el,
      type,
      x,
      y: -100,
      vy: 220 + Math.random() * 160, // speed
      size,
      clicked: false
    };

    // Klick-Handling
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!running) return;

      o.clicked = true;

      if (o.type === "ball") {
        hits++;
        hitsEl.textContent = String(hits);
        showFeedback(true, "Treffer!");
      } else {
        // Dreieck angeklickt => Strafe
        miss++;
        missEl.textContent = String(miss);
        showFeedback(false, "Falsch! Dreieck!");
        if (miss >= MISS_MAX) {
          endGame(false);
          return;
        }
      }

      // remove clicked object
      o.el.remove();
      const idx = objects.indexOf(o);
      if (idx >= 0) objects.splice(idx, 1);
    });

    objects.push(o);
  }

  function showFeedback(ok, text) {
    feedbackEl.textContent = text;
    feedbackEl.className = `catch-feedback ${ok ? "ok" : "bad"}`;
    setTimeout(() => {
      if (!running) return;
      feedbackEl.textContent = "";
      feedbackEl.className = "catch-feedback";
    }, 450);
  }

  function endGame(winByTime) {
    running = false;
    clearInterval(secInterval);

    // disable remaining objects
    objects.forEach(o => o.el.remove());
    objects.length = 0;

    if (winByTime && miss < MISS_MAX) {
      feedbackEl.textContent = `Zeit vorbei! Geschafft ✅ Treffer: ${hits}`;
      feedbackEl.className = "catch-feedback ok";
      // localStorage.setItem("level_catch_done", "1");
    } else {
      feedbackEl.textContent = `Game Over ❌ Zu viele verpasst (${miss}/${MISS_MAX})`;
      feedbackEl.className = "catch-feedback bad";
    }
  }
};
