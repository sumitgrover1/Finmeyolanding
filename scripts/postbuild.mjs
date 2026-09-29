import { cp, access } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Next.js's standalone build deliberately leaves out `public/` and
 * `.next/static/` — it expects your deployment to place them next to
 * `server.js`. Miss that and the site boots but every stylesheet, script and
 * image 404s, which is the single most common "it works locally" failure on a
 * managed host.
 *
 * So we do it here, as part of `npm run build`. Any host that runs the build and
 * then starts `.next/standalone/server.js` — Hostinger, cPanel's Node.js
 * Selector, a plain VPS — gets a complete directory with no extra steps.
 */

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const standalone = path.join(root, '.next', 'standalone');

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(standalone))) {
  // Not a standalone build (someone changed next.config.mjs) — nothing to do.
  console.log('[postbuild] no standalone output, skipping asset copy');
  process.exit(0);
}

for (const [from, to] of [
  [path.join(root, 'public'), path.join(standalone, 'public')],
  [path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static')],
]) {
  if (!(await exists(from))) continue;
  await cp(from, to, { recursive: true });
  console.log(`[postbuild] copied ${path.relative(root, from)} -> ${path.relative(root, to)}`);
}
