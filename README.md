# agstack/docs

Documentation site for [AgStack](https://github.com/agstack) projects — Hugo +
[Docsy](https://www.docsy.dev/), deployed to GitHub Pages.

Documentation that lives in a component repository's `docs/` directory is pulled in
as a git submodule and mounted into the content tree, so it is written and reviewed
next to the code it describes. Everything else is authored here.

## Quick start

```bash
git clone --recurse-submodules https://github.com/agstack/docs.git
cd docs
./site serve        # http://localhost:1313/
```

`./site` is a plain POSIX shell script — there is nothing to install to use it, and
every command below implies the setup step, so there is no separate bootstrap to
remember. If you already cloned without `--recurse-submodules` it will fix that
too: `./site init` runs `git submodule update --init --recursive` first. Without
the submodules the build fails loudly rather than publishing empty sections.

Requirements: Node ≥ 24 and npm ≥ 11.18. Hugo itself is pinned in `package.json`
(`hugo-extended`) and installed by `npm ci`, so there is nothing to install globally.

> The deployed site is a GitHub Pages *project* site, so its `baseURL` carries the
> `/docs/` path — and a Hugo server serves from whatever path `baseURL`
> has. `config/development/hugo.toml` overrides it back to the root for local use,
> which is why the local site is at `http://localhost:1313/` while the published
> one is under `/docs/`. `hugo server` picks up that override
> automatically; `hugo` (and CI) build with the production value.

| Command | What it does |
|---|---|
| `./site init` | Fetch submodules, install Hugo and theme dependencies |
| `./site serve` | Live-reloading server on :1313 |
| `./site build` | Production build into `public/` |
| `./site check` | Build and fail on unresolved imported cross-links |
| `./site update` | Bump imported-docs submodules to their tracked branch tip |
| `./site clean` | Remove build output |

Anything after the command goes to Hugo, so `./site serve --navigateToChanged`
works. The Hugo flags themselves live in the `scripts` block of `package.json`, so
the script, `docker compose` and CI cannot drift apart.

`init` is idempotent and skips work it has already done — it reinstalls only when
the pinned Hugo binary is missing or cannot run, which is why `./site serve` on a
warm checkout starts immediately rather than reinstalling every time.

## With Docker instead

Needs no Node and no Hugo on the host — only Docker with Compose v2 or later.
Nothing else to run first: a bare `git clone` is enough.

```bash
git clone https://github.com/agstack/docs.git
cd docs
docker compose up serve                  # http://localhost:1313/
```

| Command | What it does |
|---|---|
| `docker compose up serve` | Live-reloading server on :1313 |
| `docker compose run --rm build` | Production build into `./public` |
| `docker compose down` | Stop the server |
| `docker compose build` | Rebuild the image (only needed if the `Dockerfile` changes) |

Notes worth knowing:

- **Submodules are fetched for you.** The entrypoint runs
  `git submodule update --init --recursive` inside the container against the bind
  mount when `external/` or the theme is missing, so cloning without
  `--recurse-submodules` is fine. If that is not possible — no network, or `/src`
  is not a git checkout — it exits 1 explaining what to run, rather than building
  a site with silently empty sections.
- **Hugo is not baked into the image.** The Dockerfile is plain `node:24` and runs
  `npm ci`, which installs the exact `hugo-extended` pinned in `package.json`. The
  container, CI and a local checkout therefore build with the same binary, and the
  version is bumped in one place.
- **The first run is slow.** It fetches submodules and downloads the Hugo binary.
  Later runs reuse both, because `node_modules/` lives in the working tree rather
  than in a container volume. To start over, `rm -rf node_modules`.
- **`node_modules/` is shared with the host.** On Linux that is a feature — install
  once, use either path. If it was installed on a macOS or Windows host, the
  platform-specific `hugo-extended` and `sass-embedded` binaries will not run in
  the container; the entrypoint detects that (it checks Hugo actually runs, not
  just that the file exists) and reinstalls automatically.
- **Nothing comes back root-owned.** The container runs as uid 1000, so the
  fetched submodules, `node_modules/`, `public/` and `resources/` all stay
  editable on the host. The `Dockerfile` also avoids named volumes for this
  reason: Docker creates a volume's mountpoint inside the bind mount as root,
  which is enough to break both the submodule checkout and `npm ci`.
- **Editing `docker-entrypoint.sh` needs no image rebuild** — it is read from the
  bind mount, not copied into the image.
- **SELinux hosts need the `:z` mount flag**, which `docker-compose.yml` sets. A
  checkout under `$HOME` is labelled `user_home_t`, which container processes are
  not allowed to read, so without it the mount fails with `Permission denied`
  even though every file is world-readable. `:z` relabels the tree to
  `container_file_t`; note that this changes the labels on your working copy.
- **If your host account is not uid 1000**, put `APP_UID` and `APP_GID` in a
  `.env` file next to `docker-compose.yml` so files written into the mount stay
  yours:

  ```
  APP_UID=1001
  APP_GID=1001
  ```

### Troubleshooting

| Symptom | Cause |
|---|---|
| `cannot open /src/docker-entrypoint.sh: Permission denied` | SELinux, and the `:z` flag was removed or the file is mounted some other way |
| Files in `public/` owned by someone else | `APP_UID`/`APP_GID` do not match your host account |
| `hugo: not found`, or Hugo exits immediately | `node_modules` installed on a different platform — delete it and re-run |
| A production build in `public/` has root-relative URLs and unminified CSS | `docker compose up serve` is still running; its watcher rebuilt `public/` with the development config. Stop it first. |

## What is wired in

| Section | Source | Wiring |
|---|---|---|
| `/pancake/` | [`agstack/pancake`](https://github.com/agstack/pancake) `docs/` (9 files) | submodule → Hugo mount → content adapter |
| `/inatrace/` | authored here | placeholder; the INATrace repos have no `docs/` tree yet |
| `/contributing/` | authored here | local |

`pancake` is deliberately the only live import: it and `palefire` are the only AgStack
repositories today with a substantial `docs/` directory. Everything else documents
itself in a `README.md`, which is a content problem rather than a pipeline problem.

## Adding a repository

See [`content/contributing/multi-repo.md`](content/contributing/multi-repo.md),
which also records the known costs of this approach. The short version is four steps:
add the submodule, add a module mount into `assets/imported/<repo>`, copy the content
adapter, write a section index.

## Layout

```
config/
├── _default/hugo.toml                      config; [module] mounts wire in submodules
└── development/hugo.toml                   local-only: serve from / instead of /docs/
assets/
├── icons/logo.svg                          navbar mark, monochrome (currentColor)
└── scss/_variables_project.scss            brand palette, taken from the logo
static/                                     full lockup, colour mark, favicons
content/                                    sections live at the root: the site IS the docs
├── _index.md                               landing page + documentation index
├── contributing/multi-repo.md              how the pipeline works
├── inatrace/_index.md                      placeholder section
└── pancake/
    ├── _index.md                           section index (authored here)
    └── _content.gotmpl                     content adapter (imported files -> pages)
external/pancake/                           submodule, pinned by commit
layouts/
├── _markup/render-link.html                rewrites `*.md` cross-links to permalinks
└── _td-content-after-header.html           provenance banner on imported pages
themes/docsy/                               submodule, pinned to v0.17.0
site                                        task runner: init, serve, build, check, update, clean
scripts/link-dart-sass.mjs                  postinstall; points node_modules/.bin/sass at the
                                            embedded compiler Hugo needs (see the file for why)
.github/workflows/ci.yml                    build + cross-link check on every pull request
.github/workflows/deploy.yml                push to main -> build -> gh-pages branch
.github/dependabot.yml                      weekly submodule pointer bumps
Dockerfile                                  node:24 base; Hugo comes from npm ci
docker-compose.yml                          `serve` and `build` services
docker-entrypoint.sh                        installs deps, guards on empty submodules
```

## Deployment

Every push to `main` builds the site and force-pushes `public/` to the **`gh-pages`**
branch of this repository, which GitHub Pages serves. Pull requests run the same
build without deploying.

| Workflow | Trigger | What it does |
|---|---|---|
| `.github/workflows/ci.yml` | pull request | `./site check` |
| `.github/workflows/deploy.yml` | push to `main`, manual dispatch | `./site check`, then push `public/` to `gh-pages` |

Both check out with `submodules: recursive` and install nothing globally: `npm ci`
pulls the same pinned `hugo-extended` a local checkout and the container use. Main
is gated on `check` rather than `build`, so an unresolved cross-link in imported
documentation fails the deploy instead of publishing a broken page.

`gh-pages` holds a **single orphan commit** that is replaced on every deploy. It is
generated output, so there is nothing to recover from its history, and force-pushing
keeps the repository from growing a copy of the rendered site per commit. Never
commit to that branch by hand — the next deploy discards it.

One-time setup on the repository:

1. **Settings → Pages → Source**: *Deploy from a branch*, branch **`gh-pages`**,
   folder **`/ (root)`**. The branch appears in that list only after the first
   deploy has run, so push to `main` (or run the workflow manually) first.
2. Nothing else. The deploy authenticates with the built-in `GITHUB_TOKEN` and the
   workflow requests `contents: write` for it — no deploy key or PAT.

`baseURL` in `config/_default/hugo.toml` is set to `https://agstack.github.io/docs/`,
where a GitHub Pages *project* site for `agstack/docs` publishes. `static/.nojekyll`
is copied into the output so Pages serves the built HTML as-is instead of running it
through Jekyll.

To serve from a custom domain such as `docs.agstack.org`, change `baseURL`, add the
domain in Settings → Pages, create the DNS record — and **also add a `static/CNAME`
file** containing the bare domain. Setting the domain in Settings commits a `CNAME`
to `gh-pages`, and because each deploy replaces that branch wholesale the next one
would delete it and silently drop the custom domain; putting it in `static/` means
Hugo emits it on every build. Note that `agstack.org`
itself is not GitHub Pages — it is WordPress on Pantheon — so only a subdomain is in
play. Set the custom domain on **this repository**, not on an `agstack.github.io`
org-site repo: a domain set there is inherited by every project site in the
organisation.

## License

A page keeps the licence of the repository it was written in — this site renders
other projects' documentation, and displaying a document does not re-license it.

| Content | Licence |
|---|---|
| Documentation authored here (`content/`) | [CC BY-SA 4.0](LICENSE) |
| The site itself — `layouts/`, `assets/`, `config/`, Docker, CI | [Apache-2.0](LICENSE-CODE) |
| Documentation imported from a component repository | that repository's licence — currently [EUPL-1.2](https://github.com/agstack/pancake/blob/main/LICENSE) for PANCAKE |

Imported pages state their licence in the banner at the top of every page, driven
by `$license` in that section's content adapter. The full explanation is at
[`content/contributing/licensing.md`](content/contributing/licensing.md).
