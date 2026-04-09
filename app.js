// ── State ──
const state = {
  mode: null, // "quick" or "process"
  currentScreen: "home",
  currentCardIndex: 0,
  totalCards: 1,
  categoryOrder: [],
  drawnCards: [],
  responses: [],
  closure: { action: "" },
  isFlipped: false,
  activeWidget: null,
  widgetData: null,
};

// ── DOM helpers ──
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ── Screen management ──
function showScreen(name) {
  $$(".screen").forEach((s) => s.classList.remove("active"));
  $(`#${name}-screen`).classList.add("active");
  state.currentScreen = name;

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
  state.activeWidget = null;
  state.widgetData = null;

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
  state.activeWidget = null;
  state.widgetData = null;

  renderCardScreen();
}

function renderCardScreen() {
  const card = state.drawnCards[state.drawnCards.length - 1];
  const cardNum = state.currentCardIndex + 1;

  $(".session-header h2").textContent =
    state.mode === "quick" ? "Quick Pull" : `Card ${cardNum} of ${state.totalCards}`;

  const dotsContainer = $(".progress-dots");
  dotsContainer.innerHTML = "";
  for (let i = 0; i < state.totalCards; i++) {
    const dot = document.createElement("div");
    dot.className = "progress-dot";
    if (i < state.currentCardIndex) dot.classList.add("filled");
    if (i === state.currentCardIndex) dot.classList.add("current");
    dotsContainer.appendChild(dot);
  }

  const cardEl = $(".card");
  cardEl.classList.remove("flipped");
  $(".card-front img").src = card.back;
  $(".card-back img").src = card.front;

  const container = $(".card-container");
  container.classList.remove("card-appear");
  void container.offsetWidth;
  container.classList.add("card-appear");

  $(".category-pill").textContent = card.categoryName;
  $(".card-hint").textContent = "Click the card to flip it";

  restoreResponseArea();
}

// ── Card flip ──
function flipCard() {
  if (state.isFlipped) return;
  state.isFlipped = true;
  $(".card").classList.add("flipped");
  $(".card-hint").textContent = "";

  const card = state.drawnCards[state.drawnCards.length - 1];

  setTimeout(() => {
    $(".response-area").classList.add("visible");
    // Check for interactive widget
    if (card.widget) {
      renderWidget(card.widget);
    } else {
      const ta = $("#response-textarea");
      if (ta) ta.focus();
    }
  }, 400);
}

// ── Widgets ──

function renderWidget(type) {
  state.activeWidget = type;
  const area = $(".response-area");

  if (type === "quadrant") {
    renderQuadrantWidget(area);
  } else if (type === "rank") {
    renderRankWidget(area);
  }
}

function renderQuadrantWidget(area) {
  area.innerHTML = `
    <p class="reflection-label">Tap to place yourself on the grid</p>
    <div class="quadrant-container" id="quadrant-grid">
      <div class="quadrant-crosshair-h"></div>
      <div class="quadrant-crosshair-v"></div>
      <div class="quadrant-label quadrant-label--tl">Confident<br>but Growing</div>
      <div class="quadrant-label quadrant-label--tr">In Your<br>Element</div>
      <div class="quadrant-label quadrant-label--bl">Starting<br>Out</div>
      <div class="quadrant-label quadrant-label--br">Skilled but<br>Doubting</div>
      <div class="quadrant-axis quadrant-axis--top">High Confidence</div>
      <div class="quadrant-axis quadrant-axis--bottom">Low Confidence</div>
      <div class="quadrant-axis quadrant-axis--left">Low Competence</div>
      <div class="quadrant-axis quadrant-axis--right">High Competence</div>
      <div class="quadrant-dot" id="quadrant-dot"></div>
    </div>
    <div class="card-actions">
      <button class="btn" id="btn-skip">Skip</button>
      <button class="btn primary" id="btn-submit">Next</button>
    </div>
  `;

  const grid = $("#quadrant-grid");
  const dot = $("#quadrant-dot");

  const placePoint = (clientX, clientY) => {
    const rect = grid.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    dot.style.left = (x * 100) + "%";
    dot.style.top = (y * 100) + "%";
    dot.classList.add("placed");

    const competence = Math.round(x * 100);
    const confidence = Math.round((1 - y) * 100); // y is inverted
    const quadrant = confidence >= 50
      ? (competence >= 50 ? "In Your Element" : "Confident but Growing")
      : (competence >= 50 ? "Skilled but Doubting" : "Starting Out");
    state.widgetData = { competence, confidence, quadrant };
  };

  grid.addEventListener("click", (e) => placePoint(e.clientX, e.clientY));
  grid.addEventListener("touchend", (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    placePoint(t.clientX, t.clientY);
  }, { passive: false });
}

function renderRankWidget(area) {
  const items = ["Learning", "Earning", "Visibility", "Flexibility", "Challenge"];
  state.widgetData = { order: [...items] };

  area.innerHTML = `
    <p class="reflection-label">Drag or use arrows to rank your priorities</p>
    <ul class="rank-list" id="rank-list">
      ${items.map((item, i) => `
        <li class="rank-item" draggable="true" data-index="${i}">
          <span class="rank-number">${i + 1}</span>
          <span class="rank-text">${item}</span>
          <div class="rank-arrows">
            <button class="rank-arrow" data-dir="up" aria-label="Move up">\u25B2</button>
            <button class="rank-arrow" data-dir="down" aria-label="Move down">\u25BC</button>
          </div>
        </li>
      `).join("")}
    </ul>
    <div class="card-actions">
      <button class="btn" id="btn-skip">Skip</button>
      <button class="btn primary" id="btn-submit">Next</button>
    </div>
  `;

  const list = $("#rank-list");

  // Arrow button reordering (works on mobile)
  list.addEventListener("click", (e) => {
    const arrow = e.target.closest(".rank-arrow");
    if (!arrow) return;
    const dir = arrow.dataset.dir;
    const item = arrow.closest(".rank-item");
    if (dir === "up" && item.previousElementSibling) {
      list.insertBefore(item, item.previousElementSibling);
    } else if (dir === "down" && item.nextElementSibling) {
      list.insertBefore(item.nextElementSibling, item);
    }
    updateRankNumbers();
  });

  // Desktop drag-and-drop
  let dragItem = null;
  list.addEventListener("dragstart", (e) => {
    dragItem = e.target.closest(".rank-item");
    if (dragItem) dragItem.classList.add("dragging");
  });
  list.addEventListener("dragover", (e) => {
    e.preventDefault();
    const target = e.target.closest(".rank-item");
    if (target && target !== dragItem) {
      const rect = target.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        list.insertBefore(dragItem, target);
      } else {
        list.insertBefore(dragItem, target.nextSibling);
      }
    }
  });
  list.addEventListener("dragend", () => {
    if (dragItem) dragItem.classList.remove("dragging");
    dragItem = null;
    updateRankNumbers();
  });

  function updateRankNumbers() {
    const items = list.querySelectorAll(".rank-item");
    state.widgetData.order = [];
    items.forEach((item, i) => {
      item.querySelector(".rank-number").textContent = i + 1;
      state.widgetData.order.push(item.querySelector(".rank-text").textContent);
    });
  }
}

function getWidgetValue() {
  if (!state.activeWidget || !state.widgetData) return "";
  if (state.activeWidget === "quadrant") {
    const { competence, confidence, quadrant } = state.widgetData;
    return `Competence: ${competence}%, Confidence: ${confidence}% \u2014 "${quadrant}"`;
  }
  if (state.activeWidget === "rank") {
    return state.widgetData.order.map((item, i) => `${i + 1}. ${item}`).join(", ");
  }
  return "";
}

// ── Submit response ──
function submitResponse() {
  const card = state.drawnCards[state.drawnCards.length - 1];
  let text = "";

  if (state.activeWidget) {
    text = getWidgetValue();
  } else {
    const textarea = $("#response-textarea");
    if (!textarea) return;
    text = textarea.value.trim();
  }

  if (text) {
    state.responses.push({
      prompt: card.prompt,
      response: text,
      category: card.category,
      categoryName: card.categoryName,
      kept: null,
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
  state.activeWidget = null;
  state.widgetData = null;
  area.innerHTML = `
    <label for="response-textarea">Respond honestly. Write what comes first.</label>
    <textarea id="response-textarea" placeholder="Start writing... (Ctrl+Enter to submit)"></textarea>
    <div class="card-actions">
      <button class="btn" id="btn-skip">Skip</button>
      <button class="btn primary" id="btn-submit">Next</button>
    </div>
  `;
}

// ── Advance to next card or result ──
function advanceCard() {
  state.currentCardIndex++;

  if (state.currentCardIndex >= state.totalCards) {
    if (state.responses.length > 0) {
      if (state.mode === "quick") {
        showQuickResult();
      } else {
        showScreen("action");
      }
    } else {
      showScreen("home");
    }
  } else {
    drawNextCard();
  }
}

// ── Quick Result (Quick Pull only) ──
function showQuickResult() {
  const r = state.responses[0];
  const qScreen = $("#quick-result-screen");
  qScreen.querySelector("blockquote").textContent = `\u201C${r.response}\u201D`;
  qScreen.querySelector(".source").textContent = `\u2014 ${r.categoryName}`;
  showScreen("quick-result");
}

function finishQuickResult() {
  state.closure.action = $("#quick-action-input").value.trim();

  const session = {
    id: Date.now(),
    date: new Date().toISOString(),
    mode: "quick",
    responses: state.responses,
    closure: state.closure,
    synthesis: {
      themes: [],
      throughLine: "",
      keyQuote: { quote: state.responses[0]?.response || "", category: state.responses[0]?.categoryName || "" },
    },
  };

  try {
    const sessions = JSON.parse(localStorage.getItem("process_sessions") || "[]");
    sessions.unshift(session);
    localStorage.setItem("process_sessions", JSON.stringify(sessions));
  } catch (err) {
    console.warn("Couldn't save session:", err);
  }

  showScreen("home");
}

// ── Action step (Process Session only) ──
function finishAction() {
  state.closure.action = $("#action-input").value.trim();
  runSynthesis();
}

// ── Synthesis (Process Session only) ──
function runSynthesis() {
  const result = synthesize(state.responses);
  renderSynthesis(result);
  saveSession(result);
  showScreen("synthesis");
}

function renderSynthesis(result) {
  // Through-line
  $(".through-line").textContent = result.throughLine || "Complete more cards for deeper insights.";

  // Themes as styled word list
  const themesContainer = $(".themes-words");
  if (result.themes && result.themes.length > 0) {
    $(".themes-section").style.display = "block";
    themesContainer.innerHTML = result.themes
      .map(t => t.theme)
      .join('<span class="dot-sep">\u00b7</span>');
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

  // Responses dropdown (includes commitment)
  const responsesList = $(".responses-list");
  if (responsesList) {
    let responsesHtml = state.responses.map(r => `
      <div class="response-item">
        <div class="response-category">${escapeHtml(r.categoryName)}${r.kept === true ? " \u2022 Kept" : r.kept === false ? " \u2022 Discarded" : ""}</div>
        <div class="response-prompt">${escapeHtml(r.prompt)}</div>
        <div class="response-text">${escapeHtml(r.response)}</div>
      </div>
    `).join("");
    responsesList.innerHTML = responsesHtml;
  }

  // Action commitment (inside the dropdown)
  const closureSummary = $(".closure-summary");
  if (state.closure.action) {
    closureSummary.innerHTML = `
      <div class="closure-item" style="border-top: 1px solid var(--gray-100); margin-top: 8px;">
        <div class="closure-label">Your Commitment</div><p>${escapeHtml(state.closure.action)}</p>
      </div>
    `;
  } else {
    closureSummary.innerHTML = "";
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
    const dateStr = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
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
  const btn = $("#download-img-btn");
  const original = btn.textContent;
  btn.textContent = "Generating...";

  // Load card-back images for thumbnails
  const cardImages = state.drawnCards.map(card => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = card.back;
    return new Promise((resolve) => {
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });
  });

  Promise.all(cardImages).then((images) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const W = 800;
      const padding = 60;
      const headerH = 90;
      const thumbH = images.some(i => i) ? 170 : 0;

      // Build text lines
      let lines = [];
      state.responses.forEach((r) => {
        lines.push({ text: `[${r.categoryName}]`, size: 12, bold: true, space: 6 });
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

      const textHeight = lines.reduce((h, l) => h + l.size + (l.space || 0), 0);
      const totalHeight = headerH + thumbH + textHeight + padding * 2;
      canvas.width = W;
      canvas.height = totalHeight;

      // Black header band (true black)
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, headerH);
      ctx.fillStyle = "#f5f2ed";
      ctx.font = "italic 400 34px 'Georgia', serif";
      ctx.fillText("Process.", padding, 58);
      // OOA branding on right side of header
      ctx.font = "italic 400 14px 'Georgia', serif";
      ctx.fillStyle = "#8a857d";
      ctx.fillText("Out of Architecture", W - padding - ctx.measureText("Out of Architecture").width, 58);

      // Card thumbnails (2x size)
      if (thumbH > 0) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, headerH, W, thumbH);
        const thumbW = 90;
        const thumbHt = 126;
        const gap = 16;
        const validImages = images.filter(i => i);
        const totalThumbW = validImages.length * thumbW + (validImages.length - 1) * gap;
        let thumbX = (W - totalThumbW) / 2;
        validImages.forEach((img, i) => {
          if (img) {
            ctx.save();
            ctx.beginPath();
            const r = 3;
            const thumbY = headerH + 12;
            ctx.roundRect(thumbX, thumbY, thumbW, thumbHt, r);
            ctx.clip();
            ctx.drawImage(img, thumbX, thumbY, thumbW, thumbHt);
            ctx.restore();
            // Category name below
            ctx.fillStyle = "#8a857d";
            ctx.font = "500 11px Inter, sans-serif";
            const catName = state.drawnCards[i]?.categoryName || "";
            const tw = ctx.measureText(catName).width;
            ctx.fillText(catName, thumbX + (thumbW - tw) / 2, thumbY + thumbHt + 14);
            thumbX += thumbW + gap;
          }
        });
      }

      // Cream body
      const bodyY = headerH + thumbH;
      ctx.fillStyle = "#faf8f4";
      ctx.fillRect(0, bodyY, W, totalHeight - bodyY);

      let y = bodyY + padding;
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
      btn.textContent = original;
    } catch (err) {
      console.warn("Couldn't generate image:", err);
      btn.textContent = "Download failed";
      setTimeout(() => (btn.textContent = original), 2000);
    }
  });
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

  // Response area — event delegation for dynamic buttons
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

  // Action step (Process Session)
  $("#btn-finish-action").addEventListener("click", finishAction);

  // Quick result (Quick Pull)
  $("#btn-quick-done").addEventListener("click", finishQuickResult);

  // Share
  $("#share-text-btn").addEventListener("click", shareAsText);
  $("#download-img-btn").addEventListener("click", downloadAsImage);
  $("#btn-new-session").addEventListener("click", () => showScreen("home"));

  showScreen("home");
});
