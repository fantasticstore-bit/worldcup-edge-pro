# Deploy The Real Web App

Use this path when you want the same HTML/JS/Python app that runs on the Mac to be online.

This is different from Streamlit:
- Streamlit = quick demo rebuilt in Streamlit.
- Render/Railway/Fly = the real app served online.

## What Is Included

- `static/index.html`
- `static/app.js`
- `static/styles.css`
- `app/server.py`
- `app/betting_core.py`
- `app/seed_data.json`
- `run_pro.py`

The online app auto-seeds:
- 48 teams
- 72 matches

It does not commit:
- local SQLite database
- API keys
- private bet history

## Render Setup

1. Open Render.
2. Create a new Web Service.
3. Connect GitHub repo:

```text
fantasticstore-bit/worldcup-edge-pro
```

4. Use:

```text
Build command: pip install -r requirements.txt
Start command: python3 run_pro.py
```

5. Add environment variables:

```text
WORLD_CUP_EDGE_USER=ciobez
WORLD_CUP_EDGE_PASSWORD=<private password>
THE_ODDS_API_KEY=<private odds api key>
```

Do not paste these into GitHub.

## After Deploy

Open:

```text
https://worldcup-edge-pro.onrender.com
```

Then:
- login
- go to Quote
- click Aggiorna API
- verify 72 matches
- verify Top Plays
- verify Assistant
- verify Daily Report

## Important

The first deploy creates a new SQLite database on the server. On free hosting this storage may reset after redeploy/sleep depending on provider. For serious customers, move to a managed database.

For beta validation, this is fine.
