# Deploy Streamlit Demo

This is the fastest public demo path for WorldCup Edge Pro.

The Streamlit app is demo-only:
- no real API keys
- no SQLite database
- no real betting history
- no bookmaker account handling
- no auto-betting

## Files Used

- `streamlit_app.py`
- `requirements.txt`
- `.gitignore`

## Step 1 - Create Private GitHub Repo

Suggested repo name:

```text
worldcup-edge-pro
```

Keep the repository private for now.

Do not commit:
- `.env`
- `.streamlit/secrets.toml`
- `data/worldcup_model.sqlite`
- API keys
- personal betting logs

## Step 2 - Push Code

From this folder:

```bash
git init
git add .gitignore README.md LAUNCH_7_DAYS.md SALES_DEMO_SCRIPT.md BETA_MESSAGES.md BETA_OUTREACH_TRACKER.csv streamlit_app.py requirements.txt static app scripts run_pro.py
git commit -m "Initial WorldCup Edge Pro beta"
```

Then create the private repo on GitHub and push.

## Step 3 - Deploy On Streamlit Community Cloud

Create a new app and choose:

```text
Repository: worldcup-edge-pro
Branch: main
Main file path: streamlit_app.py
```

The generated URL will look like:

```text
https://worldcup-edge-pro.streamlit.app
```

## Step 4 - Test Public Demo

Check:
- Assistant loads
- Daily Sheet loads
- Book Finder loads
- Performance Preview loads
- Beta Access form does not collect sensitive data
- Disclaimer is visible

## Step 5 - Send To Testers

Message:

```text
Here is the public demo:
https://worldcup-edge-pro.streamlit.app

It is analytics-only: no profit promises, no auto-betting, no bookmaker account handling.
The key concept is simple: do not enter below minimum odds.
```

## When To Move Beyond Streamlit

Move to a full hosted product only after payment intent:
- 5 users accept or pay 79 EUR beta
- users ask for private login
- users ask for live daily sheets
- users ask to save their own tracker online

Then build:
- real auth
- database online
- Stripe
- production hosting
- terms/privacy
