# Awareometer

A lightweight, playful comparison game built with Next.js, React, TypeScript, and Tailwind CSS.

## What it does

Users answer one fast question over and over:

**Which is more aware?**

The prototype includes:

- instant two-card comparison gameplay
- a lightweight selection confirmation animation
- an intentionally minimal play screen with no extra counters or survey chrome
- a small footer explaining the project and giving a contact email
- local session persistence so refreshes keep progress
- modular mock data and pairing utilities for later backend work
- a centralized local image manifest with one unique asset per entity
- a coherent illustration strategy so the prototype stays visually consistent
- a mixed real-image/local-illustration asset pipeline with recorded license metadata

## Tech stack

- Next.js
- React
- TypeScript
- Tailwind CSS

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`

## Project structure

- `app/` - app router entrypoints and global styles
- `components/` - UI building blocks and game stages
- `public/images/entities/` - local entity artwork used by the comparison cards
- `public/images/entities-photo/` - optional photo-based alternative asset set from verified free sources
- `lib/data/entities.ts` - editable mock entity list
- `lib/data/entity-asset-manifest.ts` - combined asset manifest used for provenance and handoff
- `lib/data/entity-image-manifest.ts` - centralized image paths, alt text, and source references
- `lib/data/photo-source-manifest.json` - Wikimedia Commons replacement pipeline and download targets
- `lib/data/manual-photo-metadata.json` - manual metadata for non-Commons sourced local assets
- `lib/data/downloaded-photo-metadata.json` - metadata fetched from Wikimedia Commons for downloaded photo assets
- `lib/data/photo-backed-slugs.ts` - current set of entities using sourced local photos in the app
- `lib/game/pairing.ts` - random pair generation logic
- `lib/game/session.ts` - response recording and session persistence helpers
- `scripts/generate-entity-illustrations.mjs` - regenerates the local illustration asset set
- `scripts/download-wikimedia-images.mjs` - downloads verified Wikimedia Commons assets for entries with fixed file titles
- `scripts/fetch-wikimedia-metadata.mjs` - fetches source page, attribution, and license data for downloaded Commons assets
- `lib/types.ts` - shared app types

## Notes for future extension

- Responses are currently stored in local state and `localStorage`.
- Pairing logic is intentionally isolated so it can later be replaced by ranking or adaptive matching.
- Each entity now includes `slug`, `image_url`, `image_alt`, `image_source`, `image_credit`, `image_style`, and `is_active` so the seed data shape is closer to a future backend model.
- Most entities now resolve to sourced local photo assets under `public/images/entities-photo/`.
- The combined manifest in `lib/data/entity-asset-manifest.ts` records local path, alt text, source page, direct file URL when available, license, attribution, and fallback notes.
- `npm run fetch:commons` downloads directly curated Wikimedia Commons files, and `node scripts/fetch-wikimedia-metadata.mjs` records their license metadata locally.
- The current explicit fallback illustrations are limited to `chatgpt` only. The five human-state entities now use downloaded local Unsplash photos.
