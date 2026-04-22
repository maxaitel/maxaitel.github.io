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

The production output is written to `docs/`.

## Deploy on GitHub Pages

Push to `main` and GitHub Pages serves the prebuilt files from `docs/`.

The custom domain file lives in `public/CNAME` and is copied into the build output.
`public/.nojekyll` is also copied into the build output so Pages serves the static output directly.

## Stack

- Vite
- React
- Tailwind CSS
