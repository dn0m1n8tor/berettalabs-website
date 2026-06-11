# Berettalabs — Cybersecurity Website

Modern, cyber-security-themed website for **Berettalabs**, a penetration testing and
offensive security firm. Built as a fast, static, multi-page site with a dark theme,
brand-red accents (`#b80404`) and the **Ubuntu** typeface.

🔗 **Live site:** _enabled via GitHub Pages — URL appears here after the first deploy_

## 🎥 Demo

<!-- Record a short screen capture of the site (Windows: Win+G Game Bar, or ScreenToGif),
     save it as demo.mp4 / demo.gif in an `assets/` folder, and it will render below. -->

> _A demo recording will appear here. To add it, drop `demo.gif` (or `demo.mp4`) into
> an `assets/` folder and commit — the embed below picks it up automatically._

<!-- ![Berettalabs website demo](assets/demo.gif) -->

## ✨ Features

- **24 pages** — Home, About, Services overview + 11 individual service pages,
  Case Studies + 3 case studies, Blog + 3 articles, FAQ and Contact.
- **Services dropdown** in the header listing every service.
- Animated hero terminal, scroll reveals, animated stat counters, glitch effect.
- Fully **responsive** with a mobile slide-out menu and accordion dropdown.
- Accessible: respects `prefers-reduced-motion`.
- **No build step required to deploy** — pure HTML/CSS/JS.

## 🛠 Project structure

```
.
├── index.html              # Home
├── about.html              # About
├── services.html           # Services overview
├── case-studies.html       # Case studies overview
├── blog.html               # Blog index
├── faq.html                # FAQ
├── contact.html            # Contact
├── services/               # 11 individual service pages
├── cases/                  # 3 case-study detail pages
├── blog/                   # 3 article pages
├── css/style.css           # All styles
├── js/main.js              # All interactions
└── build.js                # Generator that produces every page (DRY)
```

## ✏️ Editing the site

The header, footer, navigation and all page content live in **one place** — `build.js`.
After editing it, regenerate every page:

```bash
node build.js
```

Then commit and push — the live site redeploys automatically.

For small one-off tweaks you can also edit the generated `.html` files directly, but
re-running `build.js` will overwrite them, so prefer editing `build.js`.

## 🚀 Deployment

Pushing to the `main` branch triggers the GitHub Actions workflow in
`.github/workflows/deploy.yml`, which publishes the site to GitHub Pages. The live URL
always reflects the latest committed version.

---

© 2026 Berettalabs. All rights reserved.
