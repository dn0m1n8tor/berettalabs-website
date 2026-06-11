# Berettalabs — Cybersecurity Website

Modern, cyber-security-themed website for **Berettalabs**, a penetration testing and
offensive security firm. Built as a fast, static, multi-page site with a dark theme,
brand-red accents (`#b80404`) and the **Ubuntu** typeface.

🔗 **Live site:** **https://dn0m1n8tor.github.io/berettalabs-website/**

## 🎥 Demo

The **live GitHub Pages site is the demo** — it's interactive, animated, and always
reflects the latest committed version. Click the live link above.

> Want a recorded clip too? Capture ~20s with Windows `Win+G` Game Bar (or ScreenToGif),
> save it as `assets/demo.gif`, commit, and uncomment the line below to embed it.

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
