# GitHub Pages deployment fix

This project is a Vite + React app. GitHub Pages cannot serve `index.html` directly from the repository root because the root `index.html` points at `/src/main.tsx`, which only works through Vite's dev/build pipeline.

## Required GitHub setting

Go to:

**Repository → Settings → Pages → Build and deployment → Source → GitHub Actions**

Then push this repository. The workflow at `.github/workflows/deploy.yml` will run:

```bash
npm ci
npm run build
```

and deploy the generated `dist` folder.

## Correct URL

The site is configured for:

```txt
https://kingofcoding9.github.io/Omni-Animator/
```

The Vite config already has:

```ts
base: '/Omni-Animator/'
```

That is correct for this repository URL.
