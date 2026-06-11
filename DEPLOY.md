# Berettalabs Website — Deploy & Update Guide

Everything you need to update and re-deploy the site. **No secrets are stored in this
file** — the GitHub token lives in a Windows environment variable (see "Authentication").

## 📍 Key locations

| What | Where |
|---|---|
| Local project | `F:\Project\berettalabs new` |
| GitHub repo | https://github.com/dn0m1n8tor/berettalabs-website |
| Live site | https://dn0m1n8tor.github.io/berettalabs-website/ |
| GitHub CLI | `C:\Program Files\GitHub CLI\gh.exe` |

## ✏️ How to update the site

1. Edit **`build.js`** — it holds all page content plus the shared header, footer and
   nav. (Editing the generated `.html` files directly works too, but `build.js` will
   overwrite them on the next build, so prefer editing `build.js`.)
2. Regenerate all pages:
   ```powershell
   node build.js
   ```
3. Commit and push:
   ```powershell
   git add -A
   git commit -m "Update site"
   git push
   ```
4. The GitHub Actions workflow (`.github/workflows/deploy.yml`) republishes the live
   site automatically in ~20 seconds. No manual deploy step needed.

## 🔑 Authentication (token stored securely, NOT in this repo)

The token is read from the `GH_TOKEN` environment variable, which `gh` and `git` use
automatically. To set it once (run in PowerShell — use the `!` prefix in Claude Code so
the value never enters chat):

```powershell
[Environment]::SetEnvironmentVariable('GH_TOKEN', '<your-new-token>', 'User')
```

Open a **new** terminal afterwards so the variable is loaded. Then `git push` just works.

Create the token at https://github.com/settings/tokens/new with scopes **`repo`** and
**`workflow`**.

> ⚠️ Never paste the token into a chat, a commit, or any file inside this folder — this
> repo is public, so anything committed here is published to the internet.

## 🔁 Useful commands

```powershell
# Watch the latest deploy
& "C:\Program Files\GitHub CLI\gh.exe" run list --repo dn0m1n8tor/berettalabs-website --limit 3

# Re-run a deploy manually
& "C:\Program Files\GitHub CLI\gh.exe" workflow run deploy.yml --repo dn0m1n8tor/berettalabs-website

# Check the live site responds
Invoke-WebRequest "https://dn0m1n8tor.github.io/berettalabs-website/" -UseBasicParsing | Select StatusCode
```

## 🧱 Project structure

```
build.js                 # Generator — edit this, then run `node build.js`
index.html               # Home (generated)
about / services / ...   # Generated pages
services/ cases/ blog/   # Generated detail pages
css/style.css            # Styles
js/main.js               # Interactions
.github/workflows/       # Auto-deploy to GitHub Pages
```
