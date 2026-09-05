# maeve-site

Personal site built with Astro + Tailwind, backed by content collections for blog, food,
movies, music, now, projects, travel, and vibes.

## Commands

| Command                   | Action                                        |
| :------------------------ | :--------------------------------------------- |
| `npm install`              | Installs dependencies                          |
| `npm run dev`               | Starts local dev server at `localhost:4321`    |
| `npm run build`             | Build the production site to `./dist/`         |
| `npm run preview`           | Preview the build locally before deploying     |
| `npm run sync-vault`        | One-shot sync from the Obsidian vault's `publish/` folder into `content/` |
| `npm run sync-vault:watch`  | Keep syncing as notes in the vault change      |

## Publishing from Obsidian

Content is authored in the vault at
`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/thought/publish/`, under a subfolder
per collection (`blog/`, `food/`, `movies/`, `music/`, `now/`, `projects/`, `travel/`,
`vibes/`). Only notes placed in that `publish/` folder are ever read — nothing else in the
vault is touched.

To publish a note:

1. Write it anywhere in the vault, then move (or copy) it into the matching
   `publish/<collection>/` folder once it's ready to go live. Frontmatter must match the
   schema for that collection in `src/content.config.ts`.
2. Run `npm run sync-vault` (or leave `npm run sync-vault:watch` running while you write) to
   mirror it into `content/<collection>/`. Obsidian `[[wikilinks]]` are flattened to plain
   text and `![[embeds]]` are converted to markdown image syntax, with the referenced image
   copied alongside the note.
3. Review the diff in `content/`, then commit and push as usual — the sync script only
   updates the working tree, it never commits or deploys anything itself.

Deleting a note from the vault's `publish/` folder and re-running the sync removes the
corresponding file from `content/` too. The script only ever deletes files it previously
synced (tracked in `scripts/.vault-sync-manifest.json`, gitignored), so hand-written content
files are never touched by it.
