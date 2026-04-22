# Max Aitel Personal Site

Personal website built with Vite, React, and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL printed in the terminal.

## Build

```bash
npm run build
```

The production output is written to `dist/`.

## Deploy on GitHub Pages

Push to `main` and GitHub Actions will build and deploy the site to GitHub Pages.

The custom domain file lives in `public/CNAME` and is copied into the build output.
`public/.nojekyll` is also copied into the build output for GitHub Pages compatibility.

## Stack

- Vite
- React
- Tailwind CSS
