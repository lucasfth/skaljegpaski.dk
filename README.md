<div align="center">
  <img src="./public/logo512.png" alt="Lucas Hanson's personal logo" width="64" />

  <h1>Skal jeg på ski?</h1>

  <p>A tiny Danish countdown for the next ski trip.</p>

  <p>
    <a href="https://skaljegpaski.dk"><strong>Open website ↗</strong></a>
  </p>

  <p>
    <img alt="MIT License" src="https://img.shields.io/github/license/lucasfth/skaljegpaski.dk?style=flat-square" />
    <img alt="HTML" src="https://img.shields.io/badge/HTML-E34F26?style=flat-square&logo=html5&logoColor=white" />
    <img alt="CSS" src="https://img.shields.io/badge/CSS-663399?style=flat-square&logo=css&logoColor=white" />
    <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  </p>
</div>

## 01 · About

Should I go skiing? The answer is always **JA**.

Pick a departure date and time to start a live countdown. The site adds the date to the URL for sharing and saves it in your browser for the next visit.

## 02 · Features

- Live countdown in Danish
- Shareable dates through the `date` URL parameter
- Local date persistence using `localStorage`
- Native device sharing with a clipboard fallback
- Responsive, dependency-free HTML, CSS, and JavaScript

## 03 · Run locally

No dependencies. No build step.

```bash
git clone git@github.com:lucasfth/skaljegpaski.dk.git
cd skaljegpaski.dk
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## 04 · License

Licensed under the [MIT License](./LICENSE).
