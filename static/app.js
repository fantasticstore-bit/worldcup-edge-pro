const state = {
  filter: "all",
  search: "",
  matches: [],
  odds: [],
  bookmakers: [],
  topPlays: [],
  performance: null,
  productStatus: null,
  finder: null,
  assistant: null,
  marketPulse: null,
  dailyReport: null,
  demo: localStorage.getItem("worldcupEdgeDemoMode") === "1",
  summary: null,
  detailMatch: null,
};

const fmtPct = (value) => value === null || value === undefined ? "-" : `${(value * 100).toFixed(1)}%`;
const fmtNum = (value, digits = 2) => value === null || value === undefined ? "-" : Number(value).toFixed(digits);

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function loadAll() {
  document.querySelector("#subtitle").textContent = "Aggiorno modello...";
  document.body.classList.toggle("demo-mode", state.demo);
  document.querySelector("#demoMode").textContent = state.demo ? "Demo on" : "Demo off";
  if (state.demo) {
    const demo = await api("/api/demo_bundle");
    state.summary = demo.summary;
    state.assistant = demo.assistant;
    state.marketPulse = demo.market_pulse;
    renderSummary(demo.summary);
    renderAssistant(demo.assistant);
    renderMarketPulse(demo.market_pulse);
    renderCommercialRoadmap();
    renderDailyReport({
      generated_for: "Demo",
      assistant: demo.assistant,
      market_pulse: demo.market_pulse,
      legal_note: "Demo mode: dati finti, nessuna API privata e nessun bookmaker reale.",
    });
    document.querySelector("#subtitle").textContent = "Demo mode attiva · dati dimostrativi";
    return;
  }
  const [summary, matches, bets, topPlays, performance, productStatus, assistant] = await Promise.all([
    api("/api/summary"),
    api(`/api/matches?status=${state.filter}&search=${encodeURIComponent(state.search)}`),
    api("/api/bets"),
    api("/api/top_plays?limit=10"),
    api("/api/performance"),
    api("/api/product_status"),
    api("/api/assistant?country=nl"),
  ]);
  state.summary = summary;
  state.matches = matches.matches;
  state.topPlays = topPlays.plays;
  state.performance = performance;
  state.productStatus = productStatus;
  state.assistant = assistant;
  renderSummary(summary);
  renderAssistant(assistant);
  renderTopPlays(state.topPlays);
  renderMatches(state.matches);
  renderBets(bets.bets);
  renderPerformance(performance);
  renderProductStatus(productStatus);
  renderCommercialRoadmap();
  renderControls(summary.controls);
  if (!state.finder) await loadFinder();
  await Promise.all([loadOdds(), loadBookmakers(), loadMarketPulse(), loadDailyReport()]);
}

async function unlockApp() {
  const error = document.querySelector("#loginError");
  const username = document.querySelector("#loginUser").value.trim();
  const password = document.querySelector("#loginPassword").value.trim();
  const accepted = document.querySelector("#acceptDisclaimer").checked;
  error.textContent = "";
  if (!accepted) {
    error.textContent = "Accetta il disclaimer per continuare.";
    return;
  }
  if (!username || !password) {
    error.textContent = "Inserisci username e password.";
    return;
  }
  document.querySelector("#unlockApp").disabled = true;
  document.querySelector("#unlockApp").textContent = "Controllo...";
  try {
    await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem("worldcupEdgeLoggedIn", "1");
    localStorage.setItem("worldcupEdgeDisclaimer", "1");
    document.querySelector("#accessGate").classList.add("hidden");
    await loadAll();
  } catch (err) {
    error.textContent = err.message || "Login non riuscito.";
  } finally {
    document.querySelector("#unlockApp").disabled = false;
    document.querySelector("#unlockApp").textContent = "Entra";
  }
}

function initAccessGate() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") === "1") {
    state.demo = true;
    localStorage.setItem("worldcupEdgeDemoMode", "1");
    document.querySelector("#accessGate").classList.add("hidden");
    loadAll().catch((error) => {
      document.querySelector("#subtitle").textContent = error.message;
    });
    return;
  }
  if (state.demo) {
    document.querySelector("#accessGate").classList.add("hidden");
    loadAll().catch((error) => {
      document.querySelector("#subtitle").textContent = error.message;
    });
    return;
  }
  const loggedIn = localStorage.getItem("worldcupEdgeLoggedIn") === "1";
  const accepted = localStorage.getItem("worldcupEdgeDisclaimer") === "1";
  if (loggedIn && accepted) {
    document.querySelector("#accessGate").classList.add("hidden");
    loadAll().catch((error) => {
      document.querySelector("#subtitle").textContent = error.message;
    });
    return;
  }
  document.querySelector("#accessGate").classList.remove("hidden");
}

function renderSummary(data) {
  document.querySelector("#subtitle").textContent =
    `${data.matches} partite, ${data.value_spots} value spot, ${data.missing_odds} senza quote`;
  document.querySelector("#kpis").innerHTML = [
    ["Bankroll", `${fmtNum(data.bankroll_current)} u`],
    ["P/L", `${fmtNum(data.tracked_profit)} u`],
    ["Exposure", `${fmtNum(data.open_exposure)} / ${fmtNum(data.max_exposure)} u`],
    ["ROI", fmtPct(data.roi)],
    ["Risk", data.risk_status],
    ["Value spot", data.value_spots],
  ].map(([label, value]) => `<div class="kpi"><span>${label}</span><strong>${value}</strong></div>`).join("");
  document.querySelector("#betsTotal").textContent =
    `${data.bets_count} bet · exposure ${fmtNum(data.open_exposure)} u · strike ${fmtPct(data.strike_rate)}`;
}

function renderAssistant(data) {
  if (!data) return;
  document.querySelector("#assistantTitle").textContent = data.plan.title;
  document.querySelector("#assistantPrimary").textContent = data.plan.primary;
  document.querySelector("#assistantRules").innerHTML = `
    <span>${data.plan.rule}</span>
    <span>${data.country_label} · ${data.risk_status}</span>
  `;
  document.querySelector("#assistantBankroll").innerHTML = `
    <div><span>Bankroll</span><strong>${fmtNum(data.bankroll)} u</strong></div>
    <div><span>Spazio rimasto</span><strong>${fmtNum(data.remaining_exposure)} u</strong></div>
    <p>${data.plan.bankroll_note}</p>
  `;
  document.querySelector("#assistantCards").innerHTML = data.cards.map((card, index) => `
    <article class="assistant-card ${card.tone}">
      <div class="assistant-card-head">
        <span>#${index + 1} · ${card.grade}</span>
        <strong>${card.action}</strong>
      </div>
      <button class="match-link" data-detail="${card.match_id}">${card.match}</button>
      <div class="micro">${card.match_id} · ${card.date} ${card.time || ""}</div>
      <div class="assistant-pick">${card.pick}</div>
      <div class="assistant-checks">
        <span>Stake <strong>${fmtNum(card.stake)} u</strong></span>
        <span>Min quota <strong>${fmtNum(card.min_playable_odds)}</strong></span>
        <span>Best <strong>${fmtNum(card.best_odds)}</strong></span>
      </div>
      <div class="quote-alert ${card.tone}">${card.price_status || "Controlla quota"}</div>
      <div class="assistant-book">
        <span>${card.country_best_odds ? `${fmtNum(card.country_best_odds)} ${card.country_best_bookmaker}` : `${fmtNum(card.best_odds)} ${card.best_bookmaker || ""}`}</span>
        <small>${card.country_best_odds ? "Migliore nel paese" : "Migliore nel feed"}</small>
      </div>
      <p>${card.why}</p>
      <div class="play-actions">
        <button class="bet-btn" data-detail="${card.match_id}">Dettaglio</button>
        <button class="bet-btn" data-find-books="${card.match_id}">Book</button>
        <button class="bet-btn" data-bet="${card.match_id}">Salva</button>
      </div>
    </article>
  `).join("") || `<div class="assistant-empty">Nessuna giocata pronta: aspetta quote migliori o aggiorna il feed.</div>`;
}

async function loadMarketPulse() {
  const data = await api("/api/market_pulse");
  state.marketPulse = data;
  renderMarketPulse(data);
}

function renderMarketPulse(data) {
  document.querySelector("#marketPulse").innerHTML = (data?.items || []).map((item) => `
    <article class="pulse-card ${item.tone}">
      <strong>${item.label}</strong>
      <span>${item.match_id} · ${item.pick}</span>
      <p>${item.match}</p>
      <div class="micro">mediana ${fmtNum(item.previous)} → ${fmtNum(item.latest)} · delta ${fmtNum(item.delta)}</div>
    </article>
  `).join("") || `<p class="micro">Non ci sono ancora abbastanza movimenti quota.</p>`;
}

async function loadDailyReport() {
  const data = await api("/api/daily_report?country=nl");
  state.dailyReport = data;
  renderDailyReport(data);
}

function renderDailyReport(data) {
  if (!data) return;
  const cards = data.assistant?.cards || [];
  document.querySelector("#dailyTotal").textContent = `${cards.length} righe · ${data.generated_for}`;
  document.querySelector("#dailyReport").innerHTML = `
    <div class="daily-head">
      <div>
        <span class="micro">WorldCup Edge Pro</span>
        <h2>Daily Betting Sheet</h2>
        <p>${data.assistant.plan.primary}</p>
      </div>
      <div>
        <strong>${fmtNum(data.assistant.bankroll)} u</strong>
        <span>bankroll</span>
      </div>
    </div>
    <div class="daily-rule">${data.assistant.plan.rule}</div>
    <div class="daily-table">
      <table>
        <thead><tr><th>Match</th><th>Pick</th><th>Azione</th><th>Stake</th><th>Min quota</th><th>Top prezzo</th><th>Nota</th></tr></thead>
        <tbody>
          ${cards.map((card) => `
            <tr>
              <td><strong>${card.match}</strong><div class="micro">${card.match_id} · ${card.date} ${card.time || ""}</div></td>
              <td>${card.pick}</td>
              <td><span class="daily-pill ${card.tone}">${card.action}</span></td>
              <td>${fmtNum(card.stake)} u</td>
              <td>${fmtNum(card.min_playable_odds)}</td>
              <td>${fmtNum(card.country_best_odds || card.best_odds)} ${card.country_best_bookmaker || card.best_bookmaker || ""}</td>
              <td>${card.price_status || card.why}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <div class="daily-legal">${data.legal_note}</div>
  `;
}

function renderCommercialRoadmap() {
  const items = [
    ["Demo mode", "Pronta per mostrare il prodotto senza API o dati personali."],
    ["Report giornaliero", "Pronto per stampa, demo commerciale e vendita B2C."],
    ["Pagamenti", "Step cloud: Stripe Checkout, licenze utenti e rinnovi."],
    ["Hosting", "Step cloud: backend online, database remoto, login per clienti."],
    ["iOS wrapper", "Step app: versione mobile con login e report, senza auto-betting."],
    ["Compliance", "Privacy policy, terms, responsible use e review Apple."],
  ];
  const target = document.querySelector("#commercialRoadmap");
  if (!target) return;
  target.innerHTML = items.map(([title, text]) => `
    <article class="roadmap-card">
      <strong>${title}</strong>
      <p>${text}</p>
    </article>
  `).join("");
}

function renderProductStatus(data) {
  document.querySelector("#productVersion").textContent = data.version;
  document.querySelector("#readinessScore").textContent = `${data.readiness_score}%`;
  document.querySelector("#releaseStatus").textContent = data.release_status;
  document.querySelector("#productPositioning").textContent = data.positioning;
  document.querySelector("#productChecklist").innerHTML = data.checklist.map((item) => `
    <article class="check-item ${item.status}">
      <div>
        <strong>${item.label}</strong>
        <p>${item.detail}</p>
      </div>
      <span>${item.status}</span>
    </article>
  `).join("");
  renderCommercialRoadmap();
}

async function loadFinder(matchId = null) {
  const country = document.querySelector("#finderCountry").value || "nl";
  const selectedMatch = matchId || document.querySelector("#finderMatch").value || "";
  const data = await api(`/api/book_finder?country=${encodeURIComponent(country)}&match_id=${encodeURIComponent(selectedMatch)}`);
  state.finder = data;
  renderFinder(data);
}

function renderFinder(data) {
  document.querySelector("#finderTotal").textContent = `${data.country_label || ""} · ${data.prices.length} quote feed`;
  const countrySelect = document.querySelector("#finderCountry");
  if (!countrySelect.options.length) {
    countrySelect.innerHTML = data.countries.map((item) => `<option value="${item.code}">${item.label}</option>`).join("");
  }
  countrySelect.value = data.country;
  const matchSelect = document.querySelector("#finderMatch");
  if (!matchSelect.options.length) {
    matchSelect.innerHTML = data.matches.map((item) => `
      <option value="${item.match_id}">${item.match_id} · ${item.home_team} - ${item.away_team}</option>
    `).join("");
  }
  if (data.match) matchSelect.value = data.match.match_id;
  document.querySelector("#finderSummary").innerHTML = data.match ? `
    <strong>${data.match.home_team} - ${data.match.away_team}</strong>
    <span>${data.match.match_id} · ${data.match.match_date} ${data.match.utc_time || ""}</span>
    <p>${data.note}</p>
  ` : `<p>Nessuna partita selezionata</p>`;
  document.querySelector("#finderOutcomes").innerHTML = data.outcomes.map((item) => `
    <article class="finder-card">
      <span>${item.label}</span>
      <strong>${item.best ? fmtNum(item.best.odds) : "-"}</strong>
      <p>${item.best ? item.best.bookmaker : "Nessuna quota nel feed paese"}</p>
    </article>
  `).join("");
  document.querySelector("#finderPrices").innerHTML = `
    <table>
      <thead><tr><th>Book</th><th>1</th><th>X</th><th>2</th><th>Ora</th></tr></thead>
      <tbody>
        ${data.prices.map((row) => `
          <tr>
            <td>${row.bookmaker}</td>
            <td>${fmtNum(row.home_odds)}</td>
            <td>${fmtNum(row.draw_odds)}</td>
            <td>${fmtNum(row.away_odds)}</td>
            <td>${row.updated_at || "-"}</td>
          </tr>
        `).join("") || `<tr><td colspan="5">Nessuna quota feed per questo paese</td></tr>`}
      </tbody>
    </table>
  `;
  document.querySelector("#finderLinks").innerHTML = data.manual_links.map((item) => `
    <a class="mini-row finder-link" href="${item.url}" target="_blank" rel="noreferrer">
      <div>
        <strong>${item.bookmaker}</strong>
        <div class="micro">${item.in_feed ? "presente nel feed" : "controllo manuale"}</div>
      </div>
      <span>Apri</span>
    </a>
  `).join("") || `<p class="micro">Nessun link rapido configurato</p>`;
}

function renderTopPlays(rows) {
  document.querySelector("#topPlaysTotal").textContent = `${rows.length} shortlist`;
  document.querySelector("#topPlays").innerHTML = rows.map((row, index) => `
    <article class="play-card">
      <div class="play-rank">
        <strong>#${index + 1}</strong>
        <span class="grade">${row.play_grade}</span>
      </div>
      <div>
        <button class="match-link" data-detail="${row.match_id}">${row.home_team} - ${row.away_team}</button>
        <div class="micro">${row.match_id} · ${row.date} ${row.time || ""}</div>
      </div>
      <div class="play-pick">${row.recommendation}</div>
      <div class="play-metrics">
        <span>Score <strong>${fmtNum(row.pro_score, 1)}</strong></span>
        <span>EV <strong>${fmtPct(row.best_ev)}</strong></span>
        <span>Conf <strong>${fmtPct(row.confidence)}</strong></span>
        <span>Stake <strong>${fmtNum(row.suggested_stake)} u</strong></span>
      </div>
      <div class="price-badge ${priceTone(row.price_alert)}">${row.price_alert} · ${fmtPct(row.price_gap)}</div>
      <div class="micro">${fmtNum(row.pick_best_odds)} ${row.pick_best_bookmaker || ""}</div>
      <div class="play-note">${row.price_note || row.risk_note}</div>
      <div class="play-actions">
        <button class="bet-btn" data-detail="${row.match_id}">Dettaglio</button>
        <button class="bet-btn" data-find-books="${row.match_id}">Book</button>
        <button class="bet-btn" data-bet="${row.match_id}">Salva</button>
      </div>
    </article>
  `).join("") || `<p class="micro">Nessuna play pronta</p>`;
}

function priceTone(alert) {
  if (["BEST PRICE", "GOOD PRICE", "ENTRA ORA", "ENTER"].includes(alert)) return "good";
  if (["WATCH", "SMALL ONLY", "ASPETTA", "WAIT"].includes(alert)) return "watch";
  if (["PREZZO PERSO", "PRICE LOST"].includes(alert)) return "bad";
  return "";
}

function renderMatches(rows) {
  const html = rows.map((row) => {
    const best = bestOutcome(row);
    const statusClass = row.recommendation === "SKIP" ? "skip" : row.recommendation === "ADD ODDS" ? "missing" : "";
    const betButton = best && row.recommendation !== "SKIP" && row.recommendation !== "ADD ODDS"
      ? `<button class="bet-btn" data-bet="${row.match_id}">Salva</button>`
      : "";
    return `
      <tr>
        <td>
          <button class="match-link" data-detail="${row.match_id}">${row.home_team} - ${row.away_team}</button>
          <div class="micro">${row.match_id} · Gruppo ${row.group} · ${row.date} ${row.time || ""}</div>
          <div class="micro">${row.venue || ""}</div>
        </td>
        <td class="numbers">
          <span>1 ${fmtPct(row.home_prob)}</span>
          <span>X ${fmtPct(row.draw_prob)}</span>
          <span>2 ${fmtPct(row.away_prob)}</span>
        </td>
        <td class="numbers">
          ${oddsLine(row)}
          <span class="micro">Overround ${fmtPct(row.overround)}</span>
          <span class="micro">${row.odds_mode || ""}${row.bookmaker_filter_active ? " · filtro book" : ""}</span>
        </td>
        <td class="numbers">
          <span>EV ${fmtPct(row.best_ev)}</span>
          <span>Edge ${fmtPct(row.best_edge)}</span>
        </td>
        <td>${fmtPct(row.kelly)}</td>
        <td>
          <div class="confidence">
            <div class="confidence-bar"><span style="width:${Math.round((row.confidence || 0) * 100)}%"></span></div>
            <span>${fmtPct(row.confidence)}</span>
          </div>
        </td>
        <td>
          <span class="pill ${statusClass}">${row.recommendation}</span>
          <div class="micro explain">${explainLine(row)}</div>
        </td>
        <td class="numbers">
          <button class="bet-btn" data-detail="${row.match_id}">Dettaglio</button>
          ${betButton}
        </td>
      </tr>
    `;
  }).join("");
  document.querySelector("#matches").innerHTML = html || `<tr><td colspan="7">Nessun match trovato</td></tr>`;
}

function explainLine(row) {
  const items = row.explanation || [row.reason];
  return items.slice(0, 3).map((item) => `<div>${item}</div>`).join("");
}

function oddsLine(row) {
  if (!row.outcomes.length) return `<span>-</span>`;
  return row.outcomes.map((item, idx) => {
    const label = idx === 0 ? "1" : idx === 1 ? "X" : "2";
    const best = item.best_bookmaker ? ` · best ${fmtNum(item.best_odds)} ${item.best_bookmaker}` : "";
    return `${label} ${fmtNum(item.odds)} <span class="micro">${item.bookmaker || ""}${best}</span>`;
  }).join("<br>");
}

function bestOutcome(row) {
  if (!row.outcomes.length) return null;
  return [...row.outcomes].sort((a, b) => b.ev - a.ev)[0];
}

function confidenceLabel(value) {
  if ((value || 0) >= 0.55) return "Strong";
  if ((value || 0) >= 0.25) return "Playable small";
  return "Watch";
}

function renderBets(rows) {
  document.querySelector("#betsRows").innerHTML = rows.map((row) => `
    <tr data-bet-row="${row.id}">
      <td>${row.created_at}</td>
      <td>${row.match_id}</td>
      <td>${row.selection}</td>
      <td>${fmtNum(row.odds)}</td>
      <td>${fmtNum(row.stake)} u</td>
      <td>${fmtPct(row.ev)}</td>
      <td>
        <span class="clv ${clvTone(row.clv_status)}">${fmtPct(row.clv)}</span>
        <div class="micro">${row.clv_status}</div>
        <div class="micro">now ${fmtNum(row.current_best_odds)} ${row.current_best_bookmaker || ""}</div>
      </td>
      <td><input class="profit-input" type="number" step="0.1" placeholder="auto" value="${Number(row.result_profit || 0) === 0 ? "" : fmtNum(row.result_profit)}"></td>
      <td>
        <select class="status-input">
          ${["planned", "open", "won", "lost", "push", "void"].map((status) =>
            `<option value="${status}" ${row.status === status ? "selected" : ""}>${status}</option>`
          ).join("")}
        </select>
      </td>
      <td><button class="bet-btn" data-update-bet="${row.id}">OK</button></td>
    </tr>
  `).join("") || `<tr><td colspan="10">Nessuna bet salvata</td></tr>`;
}

function clvTone(status) {
  if (status === "Beat market") return "good";
  if (status === "Drifting") return "bad";
  return "watch";
}

function renderPerformance(data) {
  const totals = data.totals;
  document.querySelector("#performanceTotal").textContent = `${totals.bets} bet · ${totals.settled_bets} settled`;
  document.querySelector("#performanceKpis").innerHTML = [
    ["P/L", `${fmtNum(totals.profit)} u`],
    ["ROI", fmtPct(totals.roi)],
    ["Strike", fmtPct(totals.strike_rate)],
    ["Avg CLV", fmtPct(totals.avg_clv)],
    ["Beat Mkt", fmtPct(totals.beat_market_rate)],
    ["Avg Stake", `${fmtNum(totals.avg_stake)} u`],
  ].map(([label, value]) => `<div class="kpi"><span>${label}</span><strong>${value}</strong></div>`).join("");
  renderEquity(data.equity);
  renderPerfTable("#statusPerf", data.by_status);
  renderPerfTable("#gradePerf", data.by_grade);
  renderPerfTable("#pricePerf", data.by_price_alert);
  renderMiniList("#bestBetsList", data.best_bets, "result_profit");
  renderMiniList("#worstBetsList", data.worst_bets, "result_profit");
  renderMiniList("#bestClvList", data.best_clv, "clv");
}

function renderEquity(points) {
  const box = document.querySelector("#equityChart");
  document.querySelector("#equityTotal").textContent = points.length ? `${fmtNum(points[points.length - 1].equity)} u` : "0.00 u";
  if (!points.length) {
    box.innerHTML = `<p class="micro">Nessuna bet ancora salvata</p>`;
    return;
  }
  const values = points.map((point) => point.equity);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = Math.max(max - min, 1);
  box.innerHTML = points.map((point) => {
    const height = 10 + ((point.equity - min) / range) * 82;
    const cls = point.equity >= 0 ? "pos" : "neg";
    return `<span class="${cls}" style="height:${height}px" title="${point.match_id} · ${fmtNum(point.equity)} u"></span>`;
  }).join("");
}

function renderPerfTable(selector, rows) {
  document.querySelector(selector).innerHTML = `
    <table>
      <thead><tr><th>Tipo</th><th>Bet</th><th>P/L</th><th>ROI</th><th>CLV</th></tr></thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td>${row.label}</td>
            <td>${row.bets}</td>
            <td>${fmtNum(row.profit)} u</td>
            <td>${fmtPct(row.roi)}</td>
            <td>${fmtPct(row.avg_clv)}</td>
          </tr>
        `).join("") || `<tr><td colspan="5">Nessun dato</td></tr>`}
      </tbody>
    </table>
  `;
}

function renderMiniList(selector, rows, metric) {
  document.querySelector(selector).innerHTML = rows.map((row) => `
    <div class="mini-row">
      <div>
        <strong>${row.match_id} · ${row.selection}</strong>
        <div class="micro">${row.status} · ${row.current_play_grade || "No grade"} · ${row.current_price_alert || "No price"}</div>
      </div>
      <span>${metric === "clv" ? fmtPct(row.clv) : `${fmtNum(row.result_profit)} u`}</span>
    </div>
  `).join("") || `<p class="micro">Nessun dato</p>`;
}

async function loadOdds() {
  const data = await api("/api/odds?limit=160");
  state.odds = data.odds;
  renderOdds(data.odds);
}

async function loadBookmakers() {
  const data = await api("/api/bookmakers");
  state.bookmakers = data.bookmakers;
  renderBookmakers(data.bookmakers);
}

function renderOdds(rows) {
  document.querySelector("#oddsTotal").textContent = `${rows.length} snapshot recenti`;
  document.querySelector("#oddsRows").innerHTML = rows.map((row) => `
    <tr>
      <td>${row.updated_at || "-"}</td>
      <td>
        <div class="match-title">${row.home_team || row.match_key} - ${row.away_team || ""}</div>
        <div class="micro">${row.match_id || ""}</div>
      </td>
      <td>${row.bookmaker || "-"}</td>
      <td>${fmtNum(row.home_odds)}</td>
      <td>${fmtNum(row.draw_odds)}</td>
      <td>${fmtNum(row.away_odds)}</td>
      <td>${row.source || "-"}</td>
    </tr>
  `).join("") || `<tr><td colspan="7">Nessuna quota caricata</td></tr>`;
}

function renderBookmakers(rows) {
  const enabled = rows.filter((row) => Number(row.enabled) === 1).length;
  document.querySelector("#bookmakerTotal").textContent = `${enabled}/${rows.length} attivi`;
  document.querySelector("#bookmakerList").innerHTML = rows.map((row) => `
    <label class="bookmaker-item">
      <input type="checkbox" data-bookmaker="${escapeAttr(row.bookmaker)}" ${Number(row.enabled) === 1 ? "checked" : ""}>
      <span>
        <strong>${row.bookmaker}</strong>
        <span class="micro">${row.rows_count} quote · ${row.latest || ""}</span>
      </span>
    </label>
  `).join("") || `<p class="micro">Nessun bookmaker disponibile</p>`;
}

function escapeAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function renderControls(controls) {
  document.querySelectorAll("[data-control]").forEach((input) => {
    const key = input.dataset.control;
    if (document.activeElement !== input) input.value = controls[key] ?? "";
  });
}

function openBet(matchId) {
  const row = state.detailMatch?.match_id === matchId
    ? state.detailMatch
    : state.matches.find((item) => item.match_id === matchId) || state.topPlays.find((item) => item.match_id === matchId);
  if (!row) return;
  const best = bestOutcome(row);
  if (!row || !best) return;
  document.querySelector("#betMatchId").value = row.match_id;
  document.querySelector("#betSelection").value = row.recommendation;
  document.querySelector("#betOdds").value = best.best_odds || best.odds;
  document.querySelector("#betProb").value = best.model_prob;
  document.querySelector("#betEv").value = best.ev;
  document.querySelector("#betKelly").value = best.kelly;
  document.querySelector("#betStake").value = row.suggested_stake || "";
  document.querySelector("#stakeSuggestion").textContent =
    row.suggested_stake
      ? `Stake suggerito: ${fmtNum(row.suggested_stake)} u (${fmtNum(row.suggested_units)} unità, ${row.stake_mode})`
      : "Stake suggerito non disponibile";
  document.querySelector("#betSummary").textContent =
    `${row.match_id}: ${row.recommendation} @ ${fmtNum(best.best_odds || best.odds)} ${best.best_bookmaker || ""} · EV ${fmtPct(best.ev)} · Kelly ${fmtPct(best.kelly)}`;
  document.querySelector("#betDialog").showModal();
}

async function openDetail(matchId) {
  const row = await api(`/api/match?match_id=${encodeURIComponent(matchId)}`);
  state.detailMatch = row;
  const best = bestOutcome(row);
  document.querySelector("#detailTitle").textContent = `${row.home_team} - ${row.away_team}`;
  document.querySelector("#detailSubtitle").textContent = `${row.match_id} · Gruppo ${row.group} · ${row.date} ${row.time || ""} · ${row.venue || ""}`;
  document.querySelector("#detailBody").innerHTML = renderDetail(row, best);
  document.querySelector("#detailSaveBet").disabled = !best || row.recommendation === "SKIP" || row.recommendation === "ADD ODDS";
  document.querySelector("#matchDialog").showModal();
}

function renderDetail(row, best) {
  const movement = row.line_movement;
  const timing = row.timing_alert;
  const warnings = detailWarnings(row, best, movement);
  return `
    <div class="detail-grid">
      <div class="detail-card"><span>Pick</span><strong>${row.recommendation}</strong></div>
      <div class="detail-card timing-card ${timing?.tone || ""}"><span>Timing</span><strong>${timing?.label || row.price_alert || "-"}</strong></div>
      <div class="detail-card"><span>Best odds</span><strong>${fmtNum(row.pick_best_odds)} ${row.pick_best_bookmaker || ""}</strong></div>
      <div class="detail-card"><span>Median odds</span><strong>${fmtNum(row.pick_median_odds)}</strong></div>
      <div class="detail-card"><span>Confidence</span><strong>${confidenceLabel(row.confidence)} · ${fmtPct(row.confidence)}</strong></div>
      <div class="detail-card"><span>Fair odds</span><strong>${best ? fmtNum(best.fair_odds) : "-"}</strong></div>
      <div class="detail-card"><span>EV / Edge</span><strong>${fmtPct(row.best_ev)} / ${fmtPct(row.best_edge)}</strong></div>
      <div class="detail-card"><span>Kelly</span><strong>${fmtPct(row.kelly)}</strong></div>
      <div class="detail-card"><span>Stake</span><strong>${fmtNum(row.suggested_stake)} u</strong></div>
      <div class="detail-card"><span>Overround</span><strong>${fmtPct(row.overround)}</strong></div>
    </div>
    <div class="warning-list">
      ${timing ? `<div class="warning ${timing.tone === "good" ? "good" : ""} ${timing.tone === "bad" ? "bad" : ""}">${timing.note}</div>` : ""}
      ${warnings.map((item) => `<div class="warning ${item.good ? "good" : ""}">${item.text}</div>`).join("")}
    </div>
    ${renderMovement(movement)}
    <h2>Bookmaker Snapshot</h2>
    <div class="detail-table">
      <table>
        <thead><tr><th>Ora</th><th>Book</th><th>1</th><th>X</th><th>2</th><th>Fonte</th></tr></thead>
        <tbody>
          ${(row.odds_snapshots || []).slice(0, 80).map((item) => `
            <tr>
              <td>${item.updated_at || "-"}</td>
              <td>${item.bookmaker || "-"}</td>
              <td>${fmtNum(item.home_odds)}</td>
              <td>${fmtNum(item.draw_odds)}</td>
              <td>${fmtNum(item.away_odds)}</td>
              <td>${item.source || "-"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function detailWarnings(row, best, movement) {
  const items = [];
  if (row.recommendation === "SKIP" || row.recommendation === "ADD ODDS") {
    items.push({ text: row.reason, good: false });
    return items;
  }
  items.push({ text: `${row.reason}: quota migliore ${fmtNum(row.pick_best_odds)} su ${row.pick_best_bookmaker}.`, good: true });
  if ((row.confidence || 0) < 0.25) items.push({ text: "Segnale Watch: edge presente ma fragile, stake minimo o osservazione.", good: false });
  if ((row.kelly || 0) < 0.007) items.push({ text: "Kelly basso: il modello suggerisce esposizione piccola.", good: false });
  if ((row.pick_best_odds || 0) >= 7.5) items.push({ text: "Quota alta: volatilità elevata, non trattarla come pick forte solo per EV alto.", good: false });
  if ((row.price_gap || 0) > 0) items.push({ text: `Best price sopra mediana di ${fmtPct(row.price_gap)}: ${row.price_note}`, good: row.price_alert === "BEST PRICE" || row.price_alert === "GOOD PRICE" });
  if (movement?.direction === "down") items.push({ text: `La quota mediana sta scendendo (${fmtNum(movement.delta)}): il mercato si sta muovendo contro il prezzo disponibile.`, good: false });
  if (movement?.direction === "up") items.push({ text: `La quota mediana sta salendo (+${fmtNum(movement.delta)}): potrebbe convenire aspettare o verificare conferma.`, good: false });
  return items;
}

function renderMovement(movement) {
  if (!movement || !movement.points?.length) {
    return `<div class="movement"><h2>Movimento quota</h2><p class="micro">Non ci sono ancora abbastanza snapshot storici.</p></div>`;
  }
  const points = [...movement.points].reverse();
  const values = points.map((point) => point.median_odds);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 0.01);
  return `
    <div class="movement">
      <h2>Movimento quota · ${movement.selection}</h2>
      <div class="spark">
        ${points.map((point) => `<span title="${point.updated_at} · ${fmtNum(point.median_odds)}" style="height:${12 + ((point.median_odds - min) / range) * 40}px"></span>`).join("")}
      </div>
      <p class="micro">Ultima mediana ${fmtNum(movement.latest?.median_odds)} · precedente ${fmtNum(movement.previous?.median_odds)} · delta ${fmtNum(movement.delta)}</p>
    </div>
  `;
}

async function saveBet(event) {
  event.preventDefault();
  try {
    await api("/api/bets", {
      method: "POST",
      body: JSON.stringify({
        match_id: document.querySelector("#betMatchId").value,
        selection: document.querySelector("#betSelection").value,
        odds: document.querySelector("#betOdds").value,
        stake: document.querySelector("#betStake").value,
        model_probability: document.querySelector("#betProb").value,
        ev: document.querySelector("#betEv").value,
        kelly: document.querySelector("#betKelly").value,
        notes: document.querySelector("#betNotes").value || "Saved from playable best odds",
      }),
    });
    document.querySelector("#betDialog").close();
    await loadAll();
  } catch (error) {
    document.querySelector("#stakeSuggestion").textContent = error.message;
  }
}

async function saveControls() {
  const payload = {};
  document.querySelectorAll("[data-control]").forEach((input) => {
    payload[input.dataset.control] = Number(input.value);
  });
  await api("/api/controls", { method: "POST", body: JSON.stringify(payload) });
  await loadAll();
}

async function importOdds() {
  const csv = document.querySelector("#csvImport").value.trim();
  if (!csv) return;
  await api("/api/import_odds", { method: "POST", body: JSON.stringify({ csv }) });
  document.querySelector("#csvImport").value = "";
  await loadAll();
}

async function fetchOddsApi() {
  const payload = {
    api_key: document.querySelector("#oddsApiKey").value,
    sport: document.querySelector("#oddsSport").value,
    bookmakers: document.querySelector("#oddsBookmakers").value,
  };
  const button = document.querySelector("#fetchOddsApi");
  button.disabled = true;
  button.textContent = "Aggiorno...";
  try {
    const result = await api("/api/fetch_odds_api", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    button.textContent = `${result.inserted} quote`;
    await loadAll();
  } finally {
    setTimeout(() => {
      button.disabled = false;
      button.textContent = "Aggiorna API";
    }, 1200);
  }
}

async function saveBookmakers() {
  const enabled = [...document.querySelectorAll("[data-bookmaker]:checked")].map((input) => input.dataset.bookmaker);
  await api("/api/bookmakers", {
    method: "POST",
    body: JSON.stringify({ enabled }),
  });
  await loadAll();
}

function setAllBookmakers(checked) {
  document.querySelectorAll("[data-bookmaker]").forEach((input) => {
    input.checked = checked;
  });
}

async function updateBet(id) {
  const row = document.querySelector(`[data-bet-row="${id}"]`);
  await api("/api/bets/update", {
    method: "POST",
    body: JSON.stringify({
      id,
      status: row.querySelector(".status-input").value,
      result_profit: row.querySelector(".profit-input").value,
    }),
  });
  await loadAll();
}

async function applyProfile(profile) {
  await api("/api/profile", {
    method: "POST",
    body: JSON.stringify({ profile }),
  });
  await loadAll();
}

document.querySelectorAll(".nav").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.view}`).classList.add("active");
  });
});

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", async () => {
    document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.filter = button.dataset.filter;
    await loadAll();
  });
});

document.querySelector("#search").addEventListener("input", async (event) => {
  state.search = event.target.value;
  await loadAll();
});
document.querySelector("#refresh").addEventListener("click", async () => {
  const button = document.querySelector("#refresh");
  button.disabled = true;
  button.textContent = "...";
  try {
    await loadAll();
  } finally {
    button.disabled = false;
    button.textContent = "↻";
  }
});
document.querySelector("#demoMode").addEventListener("click", async () => {
  state.demo = !state.demo;
  localStorage.setItem("worldcupEdgeDemoMode", state.demo ? "1" : "0");
  const loggedIn = localStorage.getItem("worldcupEdgeLoggedIn") === "1";
  const accepted = localStorage.getItem("worldcupEdgeDisclaimer") === "1";
  if (!state.demo && (!loggedIn || !accepted)) {
    document.querySelector("#accessGate").classList.remove("hidden");
    return;
  }
  await loadAll();
});
document.querySelector("#printDaily").addEventListener("click", () => window.print());
document.querySelector("#saveControls").addEventListener("click", saveControls);
document.querySelector("#loadFinder").addEventListener("click", () => loadFinder());
document.querySelector("#finderCountry").addEventListener("change", () => loadFinder());
document.querySelector("#finderMatch").addEventListener("change", () => loadFinder());
document.querySelector("#importOdds").addEventListener("click", importOdds);
document.querySelector("#fetchOddsApi").addEventListener("click", fetchOddsApi);
document.querySelector("#saveBooks").addEventListener("click", saveBookmakers);
document.querySelector("#selectAllBooks").addEventListener("click", () => setAllBookmakers(true));
document.querySelector("#selectNoBooks").addEventListener("click", () => setAllBookmakers(false));
document.querySelector("#confirmBet").addEventListener("click", saveBet);
document.querySelector("#unlockApp").addEventListener("click", unlockApp);
document.querySelector("#loginPassword").addEventListener("keydown", (event) => {
  if (event.key === "Enter") unlockApp();
});
document.querySelector("#loginUser").addEventListener("keydown", (event) => {
  if (event.key === "Enter") unlockApp();
});
document.querySelector("#detailSaveBet").addEventListener("click", (event) => {
  event.preventDefault();
  if (state.detailMatch) {
    document.querySelector("#matchDialog").close();
    openBet(state.detailMatch.match_id);
  }
});
document.querySelectorAll("[data-profile]").forEach((button) => {
  button.addEventListener("click", () => applyProfile(button.dataset.profile));
});

document.addEventListener("click", (event) => {
  const detailButton = event.target.closest("[data-detail]");
  if (detailButton) {
    event.preventDefault();
    openDetail(detailButton.dataset.detail);
    return;
  }
  const betButton = event.target.closest("[data-bet]");
  if (betButton) {
    event.preventDefault();
    openBet(betButton.dataset.bet);
    return;
  }
  const updateButton = event.target.closest("[data-update-bet]");
  if (updateButton) {
    event.preventDefault();
    updateBet(updateButton.dataset.updateBet);
    return;
  }
  const finderButton = event.target.closest("[data-find-books]");
  if (finderButton) {
    event.preventDefault();
    document.querySelectorAll(".nav").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
    document.querySelector('[data-view="finder"]').classList.add("active");
    document.querySelector("#finder").classList.add("active");
    loadFinder(finderButton.dataset.findBooks);
  }
});

initAccessGate();
