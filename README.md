# WorldCup Edge

Private local betting model for the 2026 World Cup.

## Run

Seed the local database from the workbook:

```bash
/Users/ciobez/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/seed_from_excel.py
```

Start the local app:

```bash
/Users/ciobez/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 run_pro.py
```

Then open:

```text
http://127.0.0.1:8782
```

Current beta port:

```text
http://127.0.0.1:8783
```

Private login:

```text
Username: ciobez
Password: set with WORLD_CUP_EDGE_PASSWORD
```

For custom local credentials:

```bash
WORLD_CUP_EDGE_USER="YOUR-USER" WORLD_CUP_EDGE_PASSWORD="YOUR-PASSWORD" python3 run_pro.py
```

## CSV Odds Format

```csv
home_team,away_team,home_odds,draw_odds,away_odds,bookmaker
Mexico,South Africa,1.55,4.90,8.40,Manual
```

## Odds Workflow

- Use `Quote` to review recent odds snapshots.
- Use `Book Finder` to select country and match, then compare the top 1-X-2 prices plus local bookmaker links.
- Use `Bookmaker giocabili` to enable only books you can actually use.
- Import CSV rows when you have odds from another source.
- Use `Aggiorna API` with a The Odds API key to pull `h2h` decimal odds.
- `Odds mode = Median` is safer and avoids mixing the best price from different books too aggressively.
- `Odds mode = Best odds` is more aggressive and assumes you can actually place each best available price.

## Bankroll Workflow

- Set bankroll, unit size, max stake, and stake mode in `Model`.
- The bet slip auto-fills the suggested stake from the model.
- When a tracked bet is marked won/lost/push/void with empty P/L, the app calculates the result automatically.
- `Top Plays` ranks the best shortlist by score, grade, EV, confidence, stake, and risk note.
- Price badges show whether the current best price is strong versus the market median.
- Match detail includes a timing alert using price movement when enough snapshots exist.
- `Backup CSV` exports the full bet tracker.
- Duplicate open bets for the same match and pick are blocked.
- Bet tracker shows CLV against the current best price.
- Dashboard risk compares open exposure with the max exposure setting.
- `Performance Lab` tracks P/L, ROI, strike rate, average CLV, beat-market rate, equity, and splits by status, grade, and price alert.
- `Product Status` shows commercial readiness, checklist, positioning, and responsible-use disclaimer.
- Private login protects the demo experience before the dashboard loads.
- `Guida` explains the simple 1000-unit workflow for non-technical users.
- `Daily Report` shows a printable betting sheet with action, stake, minimum odds, and price status.
- `Demo mode` can be opened with `http://127.0.0.1:8783/?demo=1` and uses only fake/safe data.
- `Market Pulse` highlights whether top-play prices are stable, rising, or falling.
- Red `NON GIOCARE` alerts mean the available price is below the model's minimum playable odds.
- The app is analytics-only: no guaranteed profit, no auto-betting, and no bookmaker account handling.

## 7 Day Beta Launch

- `LAUNCH_7_DAYS.md` contains the operating plan to validate paid demand before cloud billing.
- `SALES_DEMO_SCRIPT.md` contains the short demo script and sales questions.
- The landing page includes a beta plan section and a local waitlist form.
- The waitlist form stores leads only in browser localStorage for now; use Stripe/cloud only after payment intent is real.

## Streamlit Public Demo

- `streamlit_app.py` is a standalone demo-only app for Streamlit Community Cloud.
- `requirements.txt` contains the Streamlit dependency.
- `DEPLOY_STREAMLIT.md` explains how to deploy it from a private GitHub repo.
- The Streamlit demo intentionally uses fake/safe data only.

## Real Web App Deploy

- `DEPLOY_RENDER.md` explains how to deploy the actual local app experience online.
- `app/seed_data.json` lets a fresh server start with the World Cup teams and schedule.
- `run_pro.py` reads `PORT` and `HOST`, so it works on Render/Railway/Fly.
- `THE_ODDS_API_KEY` can be set as a server environment variable for live odds refresh.
