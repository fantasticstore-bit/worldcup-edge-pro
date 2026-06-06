# Push To GitHub Private Repo

Local repo status:

```text
Commit: cc574b8 Initial WorldCup Edge Pro beta
```

Important:
- Use a new private repository.
- Suggested name: `worldcup-edge-pro`
- Do not use the STW Geofleet repo.
- Do not upload API keys or local SQLite data.

## Create The Repo

On GitHub:

1. Click `New repository`
2. Repository name: `worldcup-edge-pro`
3. Visibility: `Private`
4. Do not add README, .gitignore, or license from GitHub
5. Create repository

## Connect Local Repo

Replace `YOUR_GITHUB_USER` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USER/worldcup-edge-pro.git
git branch -M main
git push -u origin main
```

## Streamlit Deploy

After the GitHub push:

1. Open Streamlit Community Cloud
2. New app
3. Repository: `worldcup-edge-pro`
4. Branch: `main`
5. Main file: `streamlit_app.py`
6. Deploy

Expected public demo URL:

```text
https://worldcup-edge-pro.streamlit.app
```

## Safety Check

The `.gitignore` excludes:

```text
data/*.sqlite
.env
.streamlit/secrets.toml
.DS_Store
.codex_tmp/
```
