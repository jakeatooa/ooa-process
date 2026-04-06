// ── State ──
const state = {
  mode: null, // "quick" or "process"
  currentScreen: "home",
  currentCardIndex: 0,
  totalCards: 1,
  categoryOrder: [], // shuffled category keys for process mode
  drawnCards: [],
  responses: [],
  closure: { action: "" },
  isFlipped: false,
};

// ── DOM helpers ──
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ── Screen management ──
function showScreen(name) {
  $$(".screen").forEach((s) => s.classList.remove("active"));
  $(`#${name}-screen`).classList.add("active");
  state.currentScreen = name;

  // Update nav
  $$("nav button").forEach((b) => b.classList.remove("active"));
  const navMap = { home: "nav-home", history: "nav-history" };
  if (navMap[name]) $(`.${navMap[name]}`)?.classList.add("active");
}

// ── Start session ──
function startSession(mode) {
  state.mode = mode;
  state.totalCards = mode === "quick" ? 1 : 6;
  state.currentCardIndex = 0;
  state.categoryOrder = mode === "process" ? getShuffledCategoryKeys() : [];
  state.drawnCards = [];
  state.responses = [];
  state.closure = { action: "" };

  drawNextCard();
  showScreen("card");
}

// ── Draw card ──
function drawNextCard() {
  let catKey;
  if (state.mode === "process") {
    catKey = state.categoryOrder[state.currentCardIndex];
  } else {
    catKey = getRandomCategoryKey();
  }
  const card = getSmartRandomCard(catKey);
  state.drawnCards.push(card);
  state.isFlipped = false;

  renderCardScreen();
}

function renderCardScreen() {
  const card = state.drawnCards[state.drawnCards.length - 1];
  const cardNum = state.currentCardIndex + 1;

  // Header
  $(".session-header h2").textContent =
    state.mode === "quick" ? "Quick Pull" : `Card ${cardNum} of ${state.totalCards}`;

  // Progress dots
  const dotsContainer = $(".progress-dots");
  dotsContainer.innerHTML = "";
  for (let i = 0; i < state.totalCards; i++) {
    const dot = document.createElement("div");
    dot.className = "progress-dot";
    if (i < state.currentCardIndex) dot.classList.add("filled");
    if (i === state.currentCardIndex) dot.classList.add("current");
    dotsContainer.appendChild(dot);
  }

  // Card images
  const cardEl = $(".card");
  cardEl.classList.remove("flipped");
  $(".card-front img").src = card.back; // back image = face-down (category art)
  $(".card-back img").src = card.front; // front image = face-up (prompt)

  // Reset card animation
  const container = $(".card-container");
  container.classList.remove("card-appear");
  void container.offsetWidth;
  container.classList.add("card-appear");

  // Category pill
  $(".category-pill").textContent = card.categoryName;

  // Hint
  $(".card-hint").textContent = "Click the card to flip it";

  // Restore response area to input mode
  restoreResponseArea();
}

// ── Card flip ──
function flipCard() {
  if (state.isFlipped) return;
  state.isFlipped = true;
  $(".card").classList.add("flipped");
  $(".card-hint").textContent = "";

  // Show response area after flip
  setTimeout(() => {
    $(".response-area").classList.add("visible");
    const ta = $("#response-textarea");
    if (ta) ta.focus();
  }, 400);
}

// ── Submit response ──
function submitResponse() {
  const textarea = $("#response-textarea");
  if (!textarea) return;
  const text = textarea.value.trim();
  const card = state.drawnCards[state.drawnCards.length - 1];

  if (text) {
    state.responses.push({
      prompt: card.prompt,
      response: text,
      category: card.category,
      categoryName: card.categoryName,
      kept: null, // set by keep/discard step
    });
    showReflectionStep(text);
  } else {
    advanceCard();
  }
}

function skipCard() {
  advanceCard();
}

// ── Per-card Keep / Discard ──
function showReflectionStep(responseText) {
  const area = $(".response-area");
  area.innerHTML = `
    <div class="reflection-step fade-in">
      <p class="reflection-label">Your response</p>
      <blockquote class="reflection-quote">${escapeHtml(responseText)}</blockquote>
      <p class="reflection-prompt">Did this card resonate?</p>
      <div class="card-actions">
        <button class="btn" id="btn-discard-card">Discard</button>
        <button class="btn primary" id="btn-keep-card">Keep</button>
      </div>
    </div>
  `;
  area.classList.add("visible");
}

function decidCard(kept) {
  if (state.responses.length > 0) {
    state.responses[state.responses.length - 1].kept = kept;
  }
  advanceCard();
}

function restoreResponseArea() {
  const area = $(".response-area");
  area.classList.remove("visible");
  area.innerHTML = `
    <label for="response-textarea">Respond honestly. Write what comes first.</label>
    <textarea id="response-textarea" placeholder="Start writing... (Ctrl+Enter to submit)"></textarea>
    <div class="card-actions">
      <button class="btn" id="btn-skip">Skip</button>
      <button class="btn primary" id="btn-submit">Submit</button>
    </div>
  `;
}

// ── Advance to next card or action step ──
function advanceCard() {
  state.currentCardIndex++;

  if (state.currentCardIndex >= state.totalCards) {
    if (state.responses.length > 0) {
      showScreen("action");
    } else {
      showScreen("home");
    }
  } else {
    drawNextCard();
  }
}

// ── Action step ──
function finishAction() {
  state.closure.action = $("#action-input").value.trim();
  runSynthesis();
}

// ── Synthesis ──
function runSynthesis() {
  const result = synthesize(state.responses);
  renderSynthesis(result);
  saveSession(result);
  showScreen("synthesis");
}

function renderSynthesis(result) {
  // Through-line
  $(".through-line").textContent = result.throughLine || "Complete more cards for deeper insights.";

  // Themes
  const themesContainer = $(".themes-list");
  themesContainer.innerHTML = "";
  if (result.themes.length > 0) {
    $(".themes-section").style.display = "block";
    const maxWeight = Math.max(...result.themes.map((t) => t.weight));
    result.themes.forEach((theme) => {
      const bar = document.createElement("div");
      bar.className = "theme-bar fade-in";
      const pct = Math.max((theme.weight / maxWeight) * 100, 15);
      bar.innerHTML = `
        <span class="theme-label">${theme.theme}</span>
        <div class="theme-track"><div class="theme-fill" style="width: ${pct}%"></div></div>
      `;
      themesContainer.appendChild(bar);
    });
  } else {
    $(".themes-section").style.display = "none";
  }

  // Key quote
  const quoteSection = $(".key-quote-section");
  if (result.keyQuote) {
    quoteSection.style.display = "block";
    quoteSection.querySelector("blockquote").textContent = `\u201C${result.keyQuote.quote}\u201D`;
    quoteSection.querySelector(".source").textContent = `\u2014 In response to: ${result.keyQuote.category}`;
  } else {
    quoteSection.style.display = "none";
  }

  // Action commitment
  const closureSummary = $(".closure-summary");
  closureSummary.innerHTML = "<h3>Your Commitment</h3>";
  if (state.closure.action) {
    closureSummary.innerHTML += `
      <div class="closure-item"><div class="closure-label">Next Action</div><p>${escapeHtml(state.closure.action)}</p></div>
    `;
  } else {
    closureSummary.innerHTML += `<div class="closure-item"><p style="font-style:italic; color: var(--gray-400);">No action recorded this session.</p></div>`;
  }
}

// ── Storage ──
function saveSession(synthesis) {
  const session = {
    id: Date.now(),
    date: new Date().toISOString(),
    mode: state.mode,
    responses: state.responses,
    closure: state.closure,
    synthesis: {
      themes: synthesis.themes,
      throughLine: synthesis.throughLine,
      keyQuote: synthesis.keyQuote,
    },
  };

  try {
    const sessions = JSON.parse(localStorage.getItem("process_sessions") || "[]");
    sessions.unshift(session);
    localStorage.setItem("process_sessions", JSON.stringify(sessions));
  } catch (err) {
    console.warn("Couldn't save session to localStorage:", err);
  }
}

function loadHistory() {
  let sessions = [];
  try {
    sessions = JSON.parse(localStorage.getItem("process_sessions") || "[]");
  } catch (err) {
    console.warn("Couldn't read sessions from localStorage:", err);
  }
  const list = $(".session-list");
  list.innerHTML = "";

  if (sessions.length === 0) {
    list.innerHTML = '<div class="empty-state">No sessions yet. Pull your first card.</div>';
    return;
  }

  sessions.forEach((session) => {
    const item = document.createElement("li");
    item.className = "session-item";
    const date = new Date(session.date);
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    const modeLabel = session.mode === "quick" ? "Quick Pull" : "Process Session";
    const preview = session.synthesis?.throughLine || `${session.responses.length} response(s)`;

    item.innerHTML = `
      <div class="session-date">${dateStr}</div>
      <div class="session-type">${modeLabel}</div>
      <div class="session-preview">${escapeHtml(preview)}</div>
    `;
    item.addEventListener("click", () => reviewSession(session));
    list.appendChild(item);
  });
}

function reviewSession(session) {
  state.responses = session.responses;
  state.closure = session.closure || { action: "" };
  state.mode = session.mode;
  const result = synthesize(session.responses);
  result.throughLine = session.synthesis?.throughLine || result.throughLine;
  renderSynthesis(result);
  showScreen("synthesis");
}

// ── Share ──
function shareAsText() {
  const lines = ["Process \u2014 Career Reflection", ""];

  state.responses.forEach((r) => {
    const tag = r.kept === true ? " [Kept]" : r.kept === false ? " [Discarded]" : "";
    lines.push(`[${r.categoryName}]${tag} ${r.prompt}`);
    lines.push(r.response);
    lines.push("");
  });

  if (state.closure.action) lines.push(`Next Action: ${state.closure.action}`);
  lines.push("", "\u2014 Out of Architecture");

  const text = lines.join("\n");
  const btn = $("#share-text-btn");
  const original = btn.textContent;
  const flash = (msg) => {
    btn.textContent = msg;
    setTimeout(() => (btn.textContent = original), 2000);
  };

  const fallback = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      flash(ok ? "Copied!" : "Copy failed");
    } catch (err) {
      console.warn("Clipboard fallback failed:", err);
      flash("Copy failed");
    }
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => flash("Copied!")).catch(fallback);
  } else {
    fallback();
  }
}

function downloadAsImage() {
  try {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const W = 800;
  const padding = 60;

  let lines = [];
  lines.push({ text: "Process", size: 32, bold: true, space: 20 });
  lines.push({ text: "A system for designing your career.", size: 14, italic: true, space: 30 });

  state.responses.forEach((r) => {
    const tag = r.kept === true ? " [Kept]" : r.kept === false ? " [Discarded]" : "";
    lines.push({ text: `[${r.categoryName}]${tag}`, size: 11, bold: true, space: 6 });
    lines.push({ text: r.prompt, size: 14, italic: true, space: 8 });
    const words = r.response.split(" ");
    let line = "";
    words.forEach((w) => {
      const test = line ? line + " " + w : w;
      if (test.length > 70) {
        lines.push({ text: line, size: 14, space: 4 });
        line = w;
      } else {
        line = test;
      }
    });
    if (line) lines.push({ text: line, size: 14, space: 20 });
  });

  if (state.closure.action) {
    lines.push({ text: "Next Action:", size: 12, bold: true, space: 6 });
    lines.push({ text: state.closure.action, size: 14, space: 12 });
  }

  lines.push({ text: "", size: 14, space: 20 });
  lines.push({ text: "\u2014 Out of Architecture", size: 12, italic: true, space: 0 });

  const totalHeight = lines.reduce((h, l) => h + l.size + (l.space || 0), 0) + padding * 2;
  canvas.width = W;
  canvas.height = totalHeight;

  ctx.fillStyle = "#faf8f4";
  ctx.fillRect(0, 0, W, totalHeight);

  let y = padding;
  lines.forEach((l) => {
    const weight = l.bold ? "bold" : "normal";
    const style = l.italic ? "italic" : "normal";
    ctx.font = `${style} ${weight} ${l.size}px Inter, sans-serif`;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillText(l.text, padding, y + l.size);
    y += l.size + (l.space || 0);
  });

  const link = document.createElement("a");
  link.download = `process-session-${new Date().toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  } catch (err) {
    console.warn("Couldn't generate image:", err);
    const btn = $("#download-img-btn");
    const original = btn.textContent;
    btn.textContent = "Download failed";
    setTimeout(() => (btn.textContent = original), 2000);
  }
}

// ── Utility ──
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ── Init ──
document.addEventListener("DOMContentLoaded", () => {
  // Nav
  $(".nav-home").addEventListener("click", () => showScreen("home"));
  $(".nav-history").addEventListener("click", () => {
    loadHistory();
    showScreen("history");
  });

  // Mode buttons
  $("#start-quick").addEventListener("click", () => startSession("quick"));
  $("#start-process").addEventListener("click", () => startSession("process"));

  // Card flip
  $(".card-container").addEventListener("click", flipCard);
  $(".card-container").addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      flipCard();
    }
  });

  // Response area — use event delegation so dynamically replaced buttons work
  $(".response-area").addEventListener("click", (e) => {
    const id = e.target.id;
    if (id === "btn-submit") submitResponse();
    else if (id === "btn-skip") skipCard();
    else if (id === "btn-keep-card") decidCard(true);
    else if (id === "btn-discard-card") decidCard(false);
  });

  $(".response-area").addEventListener("keydown", (e) => {
    if (e.target.id === "response-textarea" && (e.ctrlKey || e.metaKey) && e.key === "Enter") {
      submitResponse();
    }
  });

  // Action step
  $("#btn-finish-action").addEventListener("click", finishAction);

  // Share
  $("#share-text-btn").addEventListener("click", shareAsText);
  $("#download-img-btn").addEventListener("click", downloadAsImage);
  $("#btn-new-session").addEventListener("click", () => showScreen("home"));

  showScreen("home");
});
