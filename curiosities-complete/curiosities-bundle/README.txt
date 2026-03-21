curIosities — Full Bundle
=========================

STANDALONE HTML FILES (open directly in browser):
  trove-website.html        — Marketing website (full design, works offline)
  curiosities-preview.html  — App preview (full design, works offline)

REACT PWA SOURCE (deploy to Lovable.dev / GitHub):
  react-app/                — Full Vite + React + TypeScript source
    src/pages/Landing.tsx   — Main landing page (all design ported here)
    src/index.css           — Orb border system + all custom CSS
    src/utils/bsvPrice.ts   — BSV price logic (100k sats = ~3p)
    src/components/         — All app components including MobileCameraFlow.tsx

TO PUSH TO GITHUB:
  cd react-app
  git remote set-url origin https://github.com/shepherd-cmd/trovebsv.git
  git push -u origin main --force
