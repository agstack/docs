// Point node_modules/.bin/sass at the embedded Dart Sass compiler.
//
// Docsy transpiles its SCSS with `transpiler: "dartsass"`, so Hugo shells out to
// a binary called `sass` found on PATH and drives it over the Dart Sass embedded
// protocol. Under `npm run`, node_modules/.bin comes first on PATH.
//
// Two packages in the tree claim the `sass` bin name:
//
//   sass-embedded   dist/bin/sass.js   speaks the embedded protocol  <- what Hugo needs
//   sass            sass.js            the plain CLI, which does not
//
// `sass` is not a dependency we asked for: it arrives under the
// sass-embedded-{all-unknown,unknown-all} fallback packages, and npm installs it
// even on platforms where those parents are skipped. Whichever of the two npm
// links last wins, and when it picks the plain CLI the build fails with
// "unsupported Dart Sass version detected" — Hugo's catch-all for a handshake it
// could not complete, which is misleading enough to be worth this note.
//
// Fixing the link here rather than in the task runner means every install path
// gets it: a local `./site init`, `npm ci` in the Docker entrypoint, and CI.
import { chmodSync, existsSync, lstatSync, rmSync, symlinkSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const target = join(root, 'node_modules', 'sass-embedded', 'dist', 'bin', 'sass.js');
const link = join(root, 'node_modules', '.bin', 'sass');

if (!existsSync(target)) {
  // No sass-embedded: either a partial install, or a tree that never needed it.
  process.exit(0);
}

// npm never chmods a bin it did not link, and Hugo execs this directly.
chmodSync(target, 0o755);

if (process.platform === 'win32') {
  // npm uses .cmd/.ps1 shims rather than symlinks here, so rewriting them is a
  // different job. Hugo will pick up a global `sass` if one is installed.
  console.warn('link-dart-sass: skipped on win32; install Dart Sass globally if the build cannot find it');
  process.exit(0);
}

try {
  if (lstatSync(link, { throwIfNoEntry: false })) rmSync(link);
  symlinkSync(relative(dirname(link), target), link);
} catch (err) {
  console.warn(`link-dart-sass: could not relink ${link}: ${err.message}`);
}
