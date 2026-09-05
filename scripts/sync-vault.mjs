#!/usr/bin/env node
// Mirrors thought/publish/<collection>/*.md from the Obsidian vault into content/<collection>/
// in this repo. Only files placed under the vault's `publish/` folder are ever touched —
// nothing else in the vault is read. Run with --watch to keep syncing as you edit notes.
//
// Publishing to the live site still requires reviewing and committing the resulting
// changes in content/ — this script only updates the working tree.

import { watch } from 'chokidar';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const CONTENT_ROOT = path.join(REPO_ROOT, 'content');

const VAULT_PUBLISH_ROOT =
  process.env.VAULT_PUBLISH_DIR ||
  path.join(
    process.env.HOME,
    'Library/Mobile Documents/iCloud~md~obsidian/Documents/thought/publish'
  );

const VAULT_PICTURES_DIR = path.join(
  path.dirname(VAULT_PUBLISH_ROOT),
  'pictures'
);

const COLLECTIONS = ['blog', 'food', 'movies', 'music', 'now', 'projects', 'travel', 'vibes'];

// Tracks which content/ files this script created, so a one-shot run can detect
// vault-side deletions without ever touching hand-written files it didn't sync itself.
const MANIFEST_PATH = path.join(__dirname, '.vault-sync-manifest.json');

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function saveManifest(entries) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify([...entries].sort(), null, 2));
}

function manifestKey(collection, filename) {
  return `${collection}/${filename}`;
}

function collectionFor(filePath) {
  const rel = path.relative(VAULT_PUBLISH_ROOT, filePath);
  const [collection] = rel.split(path.sep);
  return COLLECTIONS.includes(collection) ? collection : null;
}

function convertObsidianMarkdown(raw) {
  return raw
    .replace(/!\[\[([^\]|]+)(\|[^\]]*)?\]\]/g, (_, file) => `![](${path.basename(file.trim())})`)
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, _target, alias) => alias)
    .replace(/\[\[([^\]]+)\]\]/g, (_, target) => target);
}

function findAsset(name, noteDir) {
  const local = path.join(noteDir, name);
  if (fs.existsSync(local)) return local;
  const fromPictures = path.join(VAULT_PICTURES_DIR, name);
  if (fs.existsSync(fromPictures)) return fromPictures;
  return null;
}

function copyReferencedAssets(raw, noteDir, destDir) {
  const names = new Set();
  for (const m of raw.matchAll(/!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) names.add(m[1].trim());
  for (const m of raw.matchAll(/^\s*(?:image|photo):\s*(.+)\s*$/gm)) {
    const v = m[1].trim();
    if (!/^https?:\/\//.test(v)) names.add(v.replace(/^["']|["']$/g, ''));
  }
  for (const name of names) {
    const src = findAsset(name, noteDir);
    if (src) {
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, path.join(destDir, path.basename(src)));
    } else {
      console.warn(`  warning: could not find asset "${name}" referenced by a synced note`);
    }
  }
}

function syncFile(collection, srcPath) {
  const destDir = path.join(CONTENT_ROOT, collection);
  fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, path.basename(srcPath));
  const raw = fs.readFileSync(srcPath, 'utf8');
  fs.writeFileSync(destPath, convertObsidianMarkdown(raw));
  copyReferencedAssets(raw, path.dirname(srcPath), destDir);
  console.log(`synced   ${collection}/${path.basename(srcPath)}`);
}

function removeFile(collection, srcPath) {
  const destPath = path.join(CONTENT_ROOT, collection, path.basename(srcPath));
  if (fs.existsSync(destPath)) {
    fs.rmSync(destPath);
    console.log(`removed  ${collection}/${path.basename(srcPath)} (deleted from vault publish folder)`);
  }
}

if (!fs.existsSync(VAULT_PUBLISH_ROOT)) {
  console.error(`Vault publish folder not found: ${VAULT_PUBLISH_ROOT}`);
  process.exit(1);
}

const watchMode = process.argv.includes('--watch');
const liveManifest = new Set(watchMode ? loadManifest() : []);
const seenThisRun = new Set();

// Watch the directory itself (not a glob string) — chokidar's glob matching
// breaks on the space in "Mobile Documents" in the iCloud vault path.
const watcher = watch(VAULT_PUBLISH_ROOT, {
  ignoreInitial: false,
  persistent: watchMode,
  depth: 5,
});

watcher
  .on('add', (p) => {
    if (!p.endsWith('.md')) return;
    const c = collectionFor(p);
    if (!c) return;
    syncFile(c, p);
    const key = manifestKey(c, path.basename(p));
    seenThisRun.add(key);
    if (watchMode) {
      liveManifest.add(key);
      saveManifest(liveManifest);
    }
  })
  .on('change', (p) => {
    if (!p.endsWith('.md')) return;
    const c = collectionFor(p);
    if (c) syncFile(c, p);
  })
  .on('unlink', (p) => {
    if (!p.endsWith('.md')) return;
    const c = collectionFor(p);
    if (!c) return;
    removeFile(c, p);
    const key = manifestKey(c, path.basename(p));
    seenThisRun.delete(key);
    if (watchMode) {
      liveManifest.delete(key);
      saveManifest(liveManifest);
    }
  })
  .on('ready', () => {
    if (watchMode) {
      console.log(`Watching ${VAULT_PUBLISH_ROOT} for changes... (Ctrl+C to stop)`);
      return;
    }
    // One-shot mode: anything in the previous manifest that wasn't seen this run
    // was deleted from the vault's publish folder since the last sync — remove it.
    const previousManifest = new Set(loadManifest());
    for (const key of previousManifest) {
      if (!seenThisRun.has(key)) {
        const [collection, filename] = key.split('/');
        const destPath = path.join(CONTENT_ROOT, collection, filename);
        if (fs.existsSync(destPath)) {
          fs.rmSync(destPath);
          console.log(`removed  ${key} (no longer in vault publish folder)`);
        }
      }
    }
    saveManifest(seenThisRun);
    console.log('Initial sync complete.');
    watcher.close();
  });
