# Portfolio Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single placeholder `index.md` page with a full multi-page Jekyll portfolio (Home, About, Projects, Speaking & Writing, Contact) with a custom dark/light design system, replacing the `jekyll-theme-cayman` theme and fern parallax hero.

**Architecture:** Jekyll + GitHub Pages native build (no GitHub Actions, no new CI). Content is data-driven via two Jekyll collections (`_projects/`, `_talks/`) and one data file (`_data/writing.yml`), rendered through shared includes (`project-card.html`, `talk-card.html`) so adding a project or talk later means adding one file, not editing templates. Custom Sass replaces the Cayman theme. A small vanilla-JS toggle switches a `data-theme` attribute on `<html>`, persisted via `localStorage`.

**Tech Stack:** Jekyll (via the `github-pages` gem), Liquid templates, Sass (Jekyll's built-in Sass converter), vanilla JS, no frameworks, no build step beyond Jekyll's own.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-01-portfolio-site-redesign-design.md` — read it for full content/copy if anything below is ambiguous.
- **Ruby toolchain limitation:** this machine's system Ruby is 2.6.10; `bundle install` fails because the `github-pages` gem's dependency `ffi` requires Ruby ≥3.0. There is no rbenv/rvm/Homebrew Ruby available. **Per Tristan's explicit choice, do not attempt local `jekyll build`/`jekyll serve`.** Verify structural/content correctness with plain Ruby stdlib (`yaml`, no gems required — this runs fine on 2.6.10) and plain-text checks (`grep`, `test -f`). Verify the real rendered site only in the final task, by pushing to `main` (this repo's GitHub Pages source, confirmed via `gh api repos/tr9800a/tr9800a.github.io/pages` → `"build_type":"legacy","source":{"branch":"main"}`) and polling the Pages build API.
- Remain on Jekyll + GitHub Pages native build. No GitHub Actions workflow, no CMS, no analytics, no resume/CV download, no automatic GitHub-repo pulling — all out of scope per spec.
- Dark-mode default, light mode via a toggle persisted in `localStorage` under key `theme`, values `"dark"` (default/absent) or `"light"`.
- Accent color: cyan/teal, `#22d3ee` family in dark mode, `#0e7a90` family in light mode (for contrast).
- Heading/label font: a monospace family; body font: system sans-serif stack. No web-font download — use `ui-monospace`/system stacks to avoid a new asset dependency.
- All external links (GitHub, LinkedIn, ORCID, conference sites) open in a new tab: `target="_blank" rel="noopener"`.

---

### Task 1: Configure collections, drop the Cayman theme

**Files:**
- Modify: `_config.yml`

**Interfaces:**
- Produces: `site.projects` and `site.talks` collections (front matter only, no rendered per-item pages — `output: false`), consumed by Tasks 6, 7, 10.

- [ ] **Step 1: Write a failing check for the config**

```bash
ruby -ryaml -e '
cfg = YAML.load_file("_config.yml")
raise "theme key should be removed" if cfg.key?("theme")
raise "projects collection missing" unless cfg.dig("collections", "projects", "output") == false
raise "talks collection missing" unless cfg.dig("collections", "talks", "output") == false
raise "docs should be excluded" unless cfg["exclude"].include?("docs")
puts "OK"
'
```

Expected: raises `theme key should be removed` (fails) — `_config.yml` still has the old `theme:` line and no `collections:` key yet.

- [ ] **Step 2: Rewrite `_config.yml`**

```yaml
title: Tristan McKinnon's Digital Portfolio
email: tristan@tlmckconsulting.com
description: >-
  This is the digital portfolio of Tristan McKinnon, a data engineer and data educator.
baseurl: "" # the subpath of your site, e.g. /blog
url: "https://tr9800a.github.io" # the base hostname & protocol for your site

# Build settings
markdown: kramdown

# Exclude the Gemfile, node_modules, and design docs from being processed
exclude:
  - Gemfile
  - Gemfile.lock
  - vendor
  - node_modules
  - docs

# Custom CSS and JS
sass:
  style: compressed
  sass_dir: _sass
  css_dir: assets/css
  load_paths:
    - _sass

collections:
  projects:
    output: false
  talks:
    output: false
```

- [ ] **Step 3: Re-run the check from Step 1**

Run the same command as Step 1.
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add _config.yml
git commit -m "Configure projects/talks collections, drop Cayman theme"
```

---

### Task 2: Design tokens and base styles

**Files:**
- Create: `_sass/_variables.scss`
- Create: `_sass/_base.scss`

**Interfaces:**
- Produces: CSS custom properties `--color-bg`, `--color-bg-elevated`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-accent`, `--color-accent-contrast`, `--font-body`, `--font-mono`, `--radius`, `--max-width`, overridden under `[data-theme="light"]`. Consumed by every other Sass partial (Tasks 3) and by `assets/js/theme.js` (Task 5, via the `data-theme` attribute it toggles).

- [ ] **Step 1: Write a failing check**

```bash
test -f _sass/_variables.scss && test -f _sass/_base.scss
echo $?
```

Expected: non-zero exit (files don't exist yet).

- [ ] **Step 2: Create `_sass/_variables.scss`**

```scss
:root {
  --color-bg: #0a0e14;
  --color-bg-elevated: #10151d;
  --color-text: #e6edf3;
  --color-text-muted: #8b98a5;
  --color-border: #1f2733;
  --color-accent: #22d3ee;
  --color-accent-contrast: #04222b;
  --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  --radius: 8px;
  --max-width: 960px;
}

[data-theme="light"] {
  --color-bg: #f7f9fb;
  --color-bg-elevated: #ffffff;
  --color-text: #16202a;
  --color-text-muted: #52606d;
  --color-border: #dbe2e8;
  --color-accent: #0e7a90;
  --color-accent-contrast: #ffffff;
}
```

- [ ] **Step 3: Create `_sass/_base.scss`**

```scss
*, *::before, *::after {
  box-sizing: border-box;
}

html {
  color-scheme: dark;
}

[data-theme="light"] {
  color-scheme: light;
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  line-height: 1.6;
  transition: background-color 0.2s ease, color 0.2s ease;
}

h1, h2, h3 {
  font-family: var(--font-mono);
  line-height: 1.25;
  color: var(--color-text);
}

a {
  color: var(--color-accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

main {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}
```

- [ ] **Step 4: Re-run the check from Step 1**

Run: `test -f _sass/_variables.scss && test -f _sass/_base.scss && echo PASS`
Expected: `PASS`

- [ ] **Step 5: Commit**

```bash
git add _sass/_variables.scss _sass/_base.scss
git commit -m "Add dark/light design tokens and base styles"
```

---

### Task 3: Layout, component, and hero styles + Sass entry point

**Files:**
- Create: `_sass/_layout.scss`
- Create: `_sass/_components.scss`
- Create: `_sass/_hero.scss`
- Modify: `assets/css/style.css` → replace with `assets/css/style.scss`

**Interfaces:**
- Consumes: custom properties from Task 2 (`_sass/_variables.scss`).
- Produces: CSS classes consumed by includes/layouts written in Tasks 4, 6, 7, 8, 9, 10: `.site-nav`, `.site-nav__brand`, `.site-nav__links`, `.theme-toggle`, `.site-footer`, `.site-footer__links`, `.page-header`, `.page-header__subtitle`, `.section`, `.section__header`, `.card-grid`, `.card`, `.card__title`, `.card__eyebrow`, `.card__summary`, `.card__tags`, `.card__link`, `.button`, `.button--primary`, `.button--secondary`, `.skills-grid`, `.skills-group`, `.contact-list`, `.affiliations`, `.hero`, `.hero__content`, `.hero__eyebrow`, `.hero__title`, `.hero__subtitle`, `.hero__actions`.

- [ ] **Step 1: Write a failing check**

```bash
test -f _sass/_layout.scss && test -f _sass/_components.scss && test -f _sass/_hero.scss && test -f assets/css/style.scss
echo $?
```

Expected: non-zero exit.

- [ ] **Step 2: Create `_sass/_layout.scss`**

```scss
.site-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.site-nav__brand {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--color-text);
}

.site-nav__links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.75rem 0 0;
  padding: 0;
  flex-basis: 100%;
}

.theme-toggle {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  color: var(--color-text);
  cursor: pointer;
  font-size: 1rem;
  padding: 0.35rem 0.6rem;
}

.site-footer {
  border-top: 1px solid var(--color-border);
  padding: 2rem 1.5rem;
  text-align: center;
  color: var(--color-text-muted);
}

.site-footer__links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-bottom: 0.75rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header__subtitle {
  color: var(--color-text-muted);
}

.section {
  margin: 3rem 0;
}

.section__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

@media (min-width: 640px) {
  .site-nav__links {
    flex-direction: row;
    flex-basis: auto;
    margin-top: 0;
    gap: 1.25rem;
  }
}
```

- [ ] **Step 3: Create `_sass/_components.scss`**

```scss
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.25rem;
}

.card__title {
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
}

.card__eyebrow {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-accent);
  margin: 0 0 0.5rem;
}

.card__summary {
  color: var(--color-text-muted);
  margin: 0 0 0.75rem;
}

.card__tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0 0 0.75rem;
  padding: 0;
}

.card__tags li {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  color: var(--color-text-muted);
}

.card__link {
  font-weight: 600;
}

.button {
  display: inline-block;
  font-family: var(--font-mono);
  border-radius: var(--radius);
  padding: 0.6rem 1.1rem;
  border: 1px solid var(--color-accent);
}

.button--primary {
  background: var(--color-accent);
  color: var(--color-accent-contrast);
}

.button--primary:hover {
  text-decoration: none;
  opacity: 0.9;
}

.button--secondary {
  color: var(--color-accent);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.skills-group h3 {
  font-size: 0.95rem;
}

.skills-group ul {
  margin: 0;
  padding-left: 1.1rem;
  color: var(--color-text-muted);
}

.contact-list {
  list-style: none;
  padding: 0;
}

.contact-list li {
  margin-bottom: 0.6rem;
}

.affiliations {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}
```

- [ ] **Step 4: Create `_sass/_hero.scss`**

```scss
.hero {
  position: relative;
  padding: 4rem 1.5rem;
  margin: -2rem -1.5rem 3rem;
  background-color: var(--color-bg);
  background-image:
    radial-gradient(circle at 20% 30%, rgba(34, 211, 238, 0.15), transparent 40%),
    radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.1), transparent 35%),
    linear-gradient(var(--color-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
  background-size: auto, auto, 40px 40px, 40px 40px;
  overflow: hidden;
}

.hero__content {
  max-width: var(--max-width);
  margin: 0 auto;
}

.hero__eyebrow {
  font-family: var(--font-mono);
  color: var(--color-accent);
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.06em;
}

.hero__title {
  font-size: 2.5rem;
  margin: 0.5rem 0;
}

.hero__subtitle {
  color: var(--color-text-muted);
  max-width: 640px;
}

.hero__actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}
```

- [ ] **Step 5: Replace `assets/css/style.css` with `assets/css/style.scss`**

```bash
git rm assets/css/style.css
```

Create `assets/css/style.scss`:

```scss
---
---
@import "variables";
@import "base";
@import "layout";
@import "components";
@import "hero";
```

- [ ] **Step 6: Re-run the check from Step 1**

Run: `test -f _sass/_layout.scss && test -f _sass/_components.scss && test -f _sass/_hero.scss && test -f assets/css/style.scss && echo PASS`
Expected: `PASS`

- [ ] **Step 7: Commit**

```bash
git add _sass/_layout.scss _sass/_components.scss _sass/_hero.scss assets/css/style.scss
git commit -m "Add layout, component, and hero styles; replace style.css with Sass entry point"
```

---

### Task 4: Shared nav/footer includes and layouts

**Files:**
- Create: `_includes/nav.html`
- Create: `_includes/footer.html`
- Modify: `_layouts/default.html`
- Create: `_layouts/page.html`

**Interfaces:**
- Consumes: `site.title`, `site.email` (from `_config.yml`, Task 1); CSS classes from Task 3.
- Produces: the `default` layout (site chrome — nav, `<main>{{ content }}</main>`, footer, theme toggle button with `id="theme-toggle"`) and the `page` layout (extends `default`, adds an `<h1>{{ page.title }}</h1>` header) used by every content page in Tasks 6-10. The theme-toggle button's `id="theme-toggle"` is the hook Task 5's JS binds a click handler to.

- [ ] **Step 1: Write a failing check**

```bash
grep -q 'theme-toggle' _layouts/default.html
echo $?
```

Expected: non-zero (grep finds nothing — `_layouts/default.html` is still the old Cayman-based layout).

- [ ] **Step 2: Create `_includes/nav.html`**

```html
<nav class="site-nav">
  <a href="{{ '/' | relative_url }}" class="site-nav__brand">Tristan McKinnon</a>
  <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle color theme">🌓</button>
  <ul class="site-nav__links">
    <li><a href="{{ '/' | relative_url }}">Home</a></li>
    <li><a href="{{ '/about/' | relative_url }}">About</a></li>
    <li><a href="{{ '/projects/' | relative_url }}">Projects</a></li>
    <li><a href="{{ '/speaking/' | relative_url }}">Speaking &amp; Writing</a></li>
    <li><a href="{{ '/contact/' | relative_url }}">Contact</a></li>
  </ul>
</nav>
```

- [ ] **Step 3: Create `_includes/footer.html`**

```html
<footer class="site-footer">
  <div class="site-footer__links">
    <a href="mailto:{{ site.email }}">Email</a>
    <a href="https://www.linkedin.com/in/tristan-mckinnon/" target="_blank" rel="noopener">LinkedIn</a>
    <a href="https://github.com/tr9800a" target="_blank" rel="noopener">GitHub</a>
    <a href="https://orcid.org/0009-0001-4473-7042" target="_blank" rel="noopener">ORCID</a>
  </div>
  <p>&copy; {{ site.time | date: '%Y' }} {{ site.title }}</p>
</footer>
```

- [ ] **Step 4: Rewrite `_layouts/default.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% if page.title %}{{ page.title }} · {% endif %}{{ site.title }}</title>
    <meta name="description" content="{{ page.description | default: site.description }}">
    <link rel="stylesheet" href="{{ '/assets/css/style.css' | relative_url }}">
    <script>
      (function () {
        try {
          if (localStorage.getItem('theme') === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
          }
        } catch (e) {}
      })();
    </script>
</head>
<body>
    {% include nav.html %}
    <main>
        {{ content }}
    </main>
    {% include footer.html %}
    <script src="{{ '/assets/js/theme.js' | relative_url }}"></script>
</body>
</html>
```

- [ ] **Step 5: Create `_layouts/page.html`**

```html
---
layout: default
---
<header class="page-header">
  <h1>{{ page.title }}</h1>
  {% if page.subtitle %}<p class="page-header__subtitle">{{ page.subtitle }}</p>{% endif %}
</header>
{{ content }}
```

- [ ] **Step 6: Re-run the check from Step 1**

Run: `grep -q 'theme-toggle' _layouts/default.html && echo PASS`
Expected: `PASS`

- [ ] **Step 7: Commit**

```bash
git add _includes/nav.html _includes/footer.html _layouts/default.html _layouts/page.html
git commit -m "Add shared nav/footer includes and page layout"
```

---

### Task 5: Theme-toggle JS, remove old parallax script and fern image

**Files:**
- Create: `assets/js/theme.js`
- Modify/Delete: `assets/js/script.js` → delete
- Delete: `assets/images/ferns-med.jpg`

**Interfaces:**
- Consumes: `#theme-toggle` button (from Task 4's `_includes/nav.html`).
- Produces: click handler that flips `document.documentElement`'s `data-theme` attribute between absent (dark) and `"light"`, persisting the choice to `localStorage["theme"]`.

- [ ] **Step 1: Write a failing check**

```bash
grep -q "getElementById('theme-toggle')" assets/js/theme.js
echo $?
```

Expected: non-zero (`assets/js/theme.js` doesn't exist yet).

- [ ] **Step 2: Create `assets/js/theme.js`**

```javascript
document.addEventListener('DOMContentLoaded', function () {
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) {
    return;
  }

  toggle.addEventListener('click', function () {
    var isLight = root.getAttribute('data-theme') === 'light';
    var next = isLight ? 'dark' : 'light';

    if (next === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }

    try {
      localStorage.setItem('theme', next);
    } catch (e) {}
  });
});
```

- [ ] **Step 3: Remove the old parallax script and fern image**

```bash
git rm assets/js/script.js
git rm assets/images/ferns-med.jpg
```

- [ ] **Step 4: Re-run the check from Step 1**

Run: `grep -q "getElementById('theme-toggle')" assets/js/theme.js && echo PASS`
Expected: `PASS`

- [ ] **Step 5: Commit**

```bash
git add assets/js/theme.js
git commit -m "Add theme toggle script; remove old parallax script and fern image"
```

---

### Task 6: Projects collection, project-card include, Projects page

**Files:**
- Create: `_projects/pymayfly.md`
- Create: `_projects/aetherforge.md`
- Create: `_projects/ghost-driver.md`
- Create: `_projects/cobol-modernizer-toolkit.md`
- Create: `_projects/cfb-matchups.md`
- Create: `_projects/bacon-number-pipeline.md`
- Create: `_projects/crypto-journey.md`
- Create: `_includes/project-card.html`
- Create: `projects.md`

**Interfaces:**
- Consumes: `.card`, `.card__title`, `.card__summary`, `.card__tags`, `.card__link`, `.card-grid`, `page` layout (Tasks 3-4).
- Produces: `site.projects` items with fields `title`, `summary`, `tags` (array of strings), `repo_url`, `org`, `featured_order` (integer, 1-7, used by Task 10's homepage snapshot via `slice: 0, 3`). `_includes/project-card.html` takes a single parameter `project` (a project doc) — signature: `{% include project-card.html project=<doc> %}` — consumed by Task 10.

- [ ] **Step 1: Write a failing check**

```bash
ruby -ryaml -e '
files = Dir.glob("_projects/*.md").sort
raise "expected 7 project files, got #{files.size}" unless files.size == 7
files.each do |f|
  fm = File.read(f)[/\A---\n(.*?)\n---/m, 1]
  raise "#{f}: no front matter" unless fm
  data = YAML.safe_load(fm)
  %w[title summary tags repo_url org featured_order].each do |k|
    raise "#{f}: missing #{k}" unless data.key?(k)
  end
end
puts "OK: #{files.size} project files valid"
'
```

Expected: raises `expected 7 project files, got 0` (no files exist yet).

- [ ] **Step 2: Create the 7 project files**

`_projects/pymayfly.md`:
```markdown
---
title: pymayfly
summary: >-
  Identity-Per-Transaction credential library for regulated data pipelines —
  "like a mayfly, these credentials live for exactly one transaction."
  Published to PyPI.
tags: [Python, Security, PyPI]
repo_url: https://github.com/deterministic-systems-lab/pymayfly
org: deterministic-systems-lab
featured_order: 1
---
```

`_projects/aetherforge.md`:
```markdown
---
title: AetherForge
summary: >-
  Generates Unreal Engine levels from natural-language prompts: a Go
  orchestration service turns intent into a deterministic scene recipe
  (Poisson-disk scatter + spatial-hash overlap rejection), paired with a
  UE5 editor plugin that streams the result into the viewport.
tags: [Go, Unreal Engine, LLM]
repo_url: https://github.com/tr9800a/aetherforge
org: tr9800a
featured_order: 2
---
```

`_projects/ghost-driver.md`:
```markdown
---
title: ghost-driver
summary: >-
  Security research demonstrating 96% re-identification of "anonymized"
  fleet telemetry via a multi-pass spatiotemporal sieve algorithm, with a
  synthetic dataset for reproducibility.
tags: [Python, Privacy Research]
repo_url: https://github.com/tr9800a/ghost-driver
org: tr9800a
featured_order: 3
---
```

`_projects/cobol-modernizer-toolkit.md`:
```markdown
---
title: CobolBreaker
summary: >-
  LLM-assisted ETL pipeline that ingests legacy COBOL source, analyzes its
  structure, and generates modern documentation plus Java/Python migration
  scaffolding.
tags: [Python, LLM, Legacy Modernization]
repo_url: https://github.com/deterministic-systems-lab/cobol-modernizer-toolkit
org: deterministic-systems-lab
featured_order: 4
---
```

`_projects/cfb-matchups.md`:
```markdown
---
title: CFB Matchups & Advanced Analytics
summary: >-
  Graph-theory analytics engine for college football history, built on
  NetworkX and the CollegeFootballData API: strength-of-schedule/record
  metrics, connection chains, and shortest paths between programs.
tags: [Python, Graph Theory, Analytics]
repo_url: https://github.com/tr9800a/cfb-matchups
org: tr9800a
featured_order: 5
---
```

`_projects/bacon-number-pipeline.md`:
```markdown
---
title: Bacon Number Pipeline
summary: >-
  Graph-database pipeline that computes Bacon Numbers from IMDB data,
  paired with a React frontend exposing the results over GraphQL.
tags: [SQL, Graph Database, GraphQL, React]
repo_url: https://github.com/tr9800a/bacon-number-pipeline
org: tr9800a
featured_order: 6
---
```

`_projects/crypto-journey.md`:
```markdown
---
title: crypto-journey
summary: >-
  Educational blockchain transaction-lineage explorer that traces a
  cryptocurrency address's history, deployed as a serverless API.
tags: [Python, Blockchain, Education]
repo_url: https://github.com/tr9800a/crypto-journey
org: tr9800a
featured_order: 7
---
```

- [ ] **Step 3: Create `_includes/project-card.html`**

```html
<article class="card project-card">
  <h3 class="card__title">{{ include.project.title }}</h3>
  <p class="card__summary">{{ include.project.summary }}</p>
  {% if include.project.tags %}
  <ul class="card__tags">
    {% for tag in include.project.tags %}<li>{{ tag }}</li>{% endfor %}
  </ul>
  {% endif %}
  <a class="card__link" href="{{ include.project.repo_url }}" target="_blank" rel="noopener">View on GitHub →</a>
</article>
```

- [ ] **Step 4: Create `projects.md`**

```markdown
---
layout: page
title: Projects
permalink: /projects/
---
<div class="card-grid">
{% assign sorted_projects = site.projects | sort: "featured_order" %}
{% for project in sorted_projects %}
  {% include project-card.html project=project %}
{% endfor %}
</div>
```

- [ ] **Step 5: Re-run the check from Step 1**

Run the same Ruby command as Step 1.
Expected: `OK: 7 project files valid`

- [ ] **Step 6: Commit**

```bash
git add _projects _includes/project-card.html projects.md
git commit -m "Add projects collection, project card include, and Projects page"
```

---

### Task 7: Talks collection, talk-card include, writing data, Speaking & Writing page

**Files:**
- Create: `_talks/pycon-us-2026.md`
- Create: `_talks/ieee-bigdatasecurity-2026.md`
- Create: `_talks/usenix-pepr-2026.md`
- Create: `_talks/ahtbe-2026.md`
- Create: `_talks/pycon-korea-2026.md`
- Create: `_talks/aaai-2025.md`
- Create: `_talks/elsevier-chapter.md`
- Create: `_data/writing.yml`
- Create: `_includes/talk-card.html`
- Create: `speaking.md`

**Interfaces:**
- Consumes: `.card`, `.card__eyebrow`, `.card__title`, `.card__summary`, `.card__link`, `.card-grid`, `.section`, `page` layout (Tasks 3-4).
- Produces: `site.talks` items with fields `title`, `venue`, `date` (YYYY-MM-DD), `location` (optional string), `type` (`talk`|`workshop`|`chapter`), `summary`, `link` (optional URL), `featured_order` (optional integer, set only on the 3 talks featured on the homepage in Task 10). `site.data.writing` is an array of `{title, url}`. `_includes/talk-card.html` signature: `{% include talk-card.html talk=<doc> %}` — consumed by Task 10.

- [ ] **Step 1: Write a failing check**

```bash
ruby -ryaml -e '
files = Dir.glob("_talks/*.md").sort
raise "expected 7 talk files, got #{files.size}" unless files.size == 7
files.each do |f|
  fm = File.read(f)[/\A---\n(.*?)\n---/m, 1]
  raise "#{f}: no front matter" unless fm
  data = YAML.safe_load(fm)
  %w[title venue date type summary].each do |k|
    raise "#{f}: missing #{k}" unless data.key?(k)
  end
end
writing = YAML.load_file("_data/writing.yml")
raise "expected 4 writing entries, got #{writing.size}" unless writing.size == 4
writing.each do |w|
  raise "writing entry missing title/url" unless w["title"] && w["url"]
end
puts "OK: #{files.size} talk files + #{writing.size} writing entries valid"
'
```

Expected: raises `expected 7 talk files, got 0` (nothing exists yet).

- [ ] **Step 2: Create the 7 talk files**

`_talks/pycon-us-2026.md`:
```markdown
---
title: "Zero Trust in 200ms: Implementing Identity-Per-Transaction with Python and Serverless"
venue: PyCon US 2026
date: 2026-05-16
location: "Room 103ABC"
type: talk
featured_order: 1
summary: >-
  Building a serverless data pipeline that satisfies FedRAMP High while
  handling Protected Health Information is typically a nightmare of
  encryption management and rigid access controls. This talk dissects a
  production federal life-sciences pipeline that replaces static service
  accounts with ephemeral Python logic: an identity broker that mints a
  unique, cryptographically scoped IAM credential for every file
  transaction and destroys it milliseconds later, a streaming
  de-identification layer built on Python generators and Microsoft
  Presidio to tokenize PII in-memory before it reaches the data lake, and
  structured logging patterns that produce immutable, audit-ready JSON
  trails — showing how Python can solve the "Non-Human Identity" crisis in
  high-stakes environments.
link: https://us.pycon.org/2026/speaker/profile/148/
---
```

`_talks/ieee-bigdatasecurity-2026.md`:
```markdown
---
title: "Zero-Trust Data Engineering: A Reference Architecture for Serverless, FedRAMP-High Healthcare Pipelines"
venue: IEEE BigDataSecurity 2026
date: 2026-05-10
location: "Room A, Session BIGDATASECURITY 6"
type: talk
featured_order: 2
summary: >-
  As healthcare research migrates petabyte-scale genomic and clinical data
  to the cloud, traditional perimeter-based security models violate
  zero-trust principles and let a single compromised credential expose an
  entire data lake. This paper proposes a shift from identity-per-user to
  identity-per-transaction, presenting a serverless zero-trust reference
  architecture (AWS Lambda/Glue) that uses a just-in-time identity broker
  and a clean-room, streaming de-identification layer to scope permissions
  to the lifecycle of a single batch event. Evaluated in a production
  FedRAMP High environment, the architecture cuts the blast radius of a
  compromised identity by over 99.9% while preserving linear throughput
  scalability — proving that rigorous federal compliance doesn't have to
  come at the cost of cloud agility.
link: https://www.cloud-conf.net/datasec/2026/program.html
---
```

`_talks/usenix-pepr-2026.md`:
```markdown
---
title: "The Disposable Identity: Eliminating Non-Human Identity Risk in Federal Healthcare Pipelines"
venue: USENIX PEPR '26
date: 2026-06-01
location: "Santa Clara, CA"
type: talk
featured_order: 3
summary: >-
  Non-human identity — the long-lived, over-privileged service accounts
  powering automated pipelines — is the fastest-growing and
  least-examined attack surface in cloud data environments; in federal
  healthcare systems under FedRAMP High, a single compromised ingestion
  role can mean bucket-wide access for up to 90 days. This talk presents
  a production case study of an Identity-Per-Transaction (IPT) pipeline
  deployed for a federal life sciences agency that issues a unique,
  cryptographically scoped, ephemeral credential for every
  file-ingestion event and destroys it milliseconds later, including the
  operational realities of running it in production — latency,
  concurrency race conditions, and debugging credentials that no longer
  exist — plus an honest reckoning with the approach's limits: the
  identity broker remains a bounded but non-zero root of trust, and
  eliminating credential-mediated access risk is not the same as solving
  genomic data anonymization.
link: https://www.usenix.org/conference/pepr26/presentation/mckinnon
---
```

`_talks/ahtbe-2026.md`:
```markdown
---
title: "Hybrid NLP at Scale: Optimizing Clinical De-identification for High-Throughput FedRAMP Lakes"
venue: "AHTBE 2026 — 2nd International Conference on Advancement in Healthcare Technology and Biomedical Engineering"
date: 2026-08-21
location: "University Canada West, Vancouver, BC, Canada"
type: talk
summary: >-
  De-identifying unstructured clinical text at petabyte scale runs into a
  hard tradeoff: Transformer models like ClinicalBERT catch
  context-dependent PHI but are too slow for high-volume ingestion, while
  fast RegEx systems miss it and leak privacy. This paper introduces a
  hybrid triage architecture that uses lightweight heuristic scanning to
  process 90% of low-entropy clinical text at line speed, routing only
  ambiguous or high-context segments to a full Transformer model.
  Benchmarked in a production FedRAMP High environment, the hybrid
  approach matches full-model accuracy (F1 0.98) while cutting compute
  costs by 40% and ingestion latency by 60%, offering a practical
  blueprint for balancing privacy compliance with research velocity.
---
```

`_talks/pycon-korea-2026.md`:
```markdown
---
title: "Go-Live at Hour Three: An Observability War Room"
venue: PyCon Korea 2026 (Deep-Dive Workshop)
date: 2026-08-17
type: workshop
summary: >-
  A full-day, hands-on workshop simulating a live production incident:
  teams build a real observability stack — structured logging, metrics,
  alerting, contract tests, and trace correlation — against a
  working-but-blind data pipeline in the hours before a new partner
  integration goes live. When the partner goes live at hour three, staged
  waves of realistic failures (schema drift, unsized volume, poison
  records, silently wrong data) test whatever instrumentation the team
  chose to build, with missing signals added live as blind spots surface.
  Requires only Python and a laptop — no monitoring or security
  background needed — and ends with a retro on which signals mattered
  and where the team was still blind.
---
```

`_talks/aaai-2025.md`:
```markdown
---
title: "AI as a Collaborative Partner in Data Science Education"
venue: "AAAI 2025 Spring Symposium Series — Current and Future Varieties of Human-AI Collaboration"
date: 2025-03-31
location: "Burlingame, CA"
type: talk
summary: >-
  This talk explores how AI can partner with instructors and students to
  make data science education more engaging, effective, and equitable —
  from AI tutoring systems that give real-time, personalized feedback on
  coding assignments and support students with learning disabilities, to
  automated grading tools that free instructors for higher-level
  teaching, to collaborative projects where students and AI agents
  jointly tackle data analysis and modeling problems — while arguing that
  these gains must be paired with deliberate attention to bias, fairness,
  privacy, transparency, and accountability in AI's classroom deployment.
link: https://sites.google.com/view/aaai-human-ai-collaboration/
---
```

`_talks/elsevier-chapter.md`:
```markdown
---
title: "Synergistic Pedagogy: Integrating AI Collaborators into Data Science Education"
venue: "Chapter 15 in Generative AI Risks and Benefits within Human-Machine Teams (Elsevier)"
date: 2026-08-01
type: chapter
summary: >-
  Book chapter (corresponding author) on integrating AI collaborators
  into data science education. Forthcoming — publication pending.
---
```

- [ ] **Step 3: Create `_data/writing.yml`**

```yaml
- title: "Identity-Per-Transaction: What It Is and Why It Matters"
  url: "https://www.linkedin.com/pulse/identity-per-transaction-what-why-matters-tristan-mckinnon-s1ucc"
- title: "Real-Time Fraud Detection: Architecture Patterns for Fintech"
  url: "https://www.linkedin.com/pulse/real-time-fraud-detection-architecture-patterns-fintech-mckinnon-kqo0c"
- title: "Ethical Considerations in Data Engineering and AI: Building Systems That Serve Everyone"
  url: "https://www.linkedin.com/pulse/ethical-considerations-data-engineering-ai-building-systems-mckinnon-y4scc"
- title: "GraphQL: Simplifying Data Queries for Modern Applications"
  url: "https://www.linkedin.com/pulse/graphql-simplifying-data-queries-modern-applications-tristan-mckinnon-ztsyc"
```

- [ ] **Step 4: Create `_includes/talk-card.html`**

```html
<article class="card talk-card">
  <p class="card__eyebrow">
    {{ include.talk.venue }}{% if include.talk.date %} · {{ include.talk.date | date: "%B %-d, %Y" }}{% endif %}
  </p>
  <h3 class="card__title">{{ include.talk.title }}</h3>
  <p class="card__summary">{{ include.talk.summary }}</p>
  {% if include.talk.link %}<a class="card__link" href="{{ include.talk.link }}" target="_blank" rel="noopener">Learn more →</a>{% endif %}
</article>
```

- [ ] **Step 5: Create `speaking.md`**

```markdown
---
layout: page
title: Speaking & Writing
permalink: /speaking/
---
<section class="section">
  <div class="section__header">
    <h2>Speaking &amp; Publications</h2>
  </div>
  <div class="card-grid">
  {% assign sorted_talks = site.talks | sort: "date" | reverse %}
  {% for talk in sorted_talks %}
    {% include talk-card.html talk=talk %}
  {% endfor %}
  </div>
</section>

<section class="section">
  <div class="section__header">
    <h2>Writing</h2>
  </div>
  <div class="card-grid">
  {% for article in site.data.writing %}
    <article class="card">
      <h3 class="card__title">{{ article.title }}</h3>
      <a class="card__link" href="{{ article.url }}" target="_blank" rel="noopener">Read on LinkedIn →</a>
    </article>
  {% endfor %}
  </div>
  <p><a href="https://www.linkedin.com/in/tristan-mckinnon/recent-activity/articles/" target="_blank" rel="noopener">See all articles on LinkedIn →</a></p>
</section>
```

- [ ] **Step 6: Re-run the check from Step 1**

Run the same Ruby command as Step 1.
Expected: `OK: 7 talk files + 4 writing entries valid`

- [ ] **Step 7: Commit**

```bash
git add _talks _data/writing.yml _includes/talk-card.html speaking.md
git commit -m "Add talks collection, writing data, talk card include, and Speaking & Writing page"
```

---

### Task 8: About page

**Files:**
- Create: `about.md`

**Interfaces:**
- Consumes: `.section`, `.affiliations`, `.skills-grid`, `.skills-group`, `page` layout (Tasks 3-4).

- [ ] **Step 1: Write a failing check**

```bash
test -f about.md
echo $?
```

Expected: non-zero.

- [ ] **Step 2: Create `about.md`**

```markdown
---
layout: page
title: About
permalink: /about/
---
<section class="section">
  <p>I'm a Staff Data Engineer and Founder/PI of <a href="https://github.com/deterministic-systems-lab" target="_blank" rel="noopener">Deterministic Systems Lab</a>, where I design zero-trust data pipelines for regulated environments — healthcare, fintech, and federal systems under FedRAMP High. I'm currently pursuing a D.Eng in AI/ML at George Washington University, expected 2028.</p>
  <p class="affiliations">IEEE Computer Society · IEEE Technical Community on Data Engineering · IEEE Society on Social Implications of Technology · Technical Committee on Data Engineering</p>
</section>

<section class="section">
  <h2>Skills</h2>
  <div class="skills-grid">
    <div class="skills-group">
      <h3>Data Engineering &amp; Cloud</h3>
      <ul>
        <li>Python</li>
        <li>Serverless architecture (AWS Lambda, Glue, Step Functions)</li>
        <li>SQL &amp; graph databases</li>
        <li>High-throughput / high-volume pipeline design</li>
      </ul>
    </div>
    <div class="skills-group">
      <h3>Security &amp; Compliance</h3>
      <ul>
        <li>Zero-Trust architecture</li>
        <li>Identity-Per-Transaction / ephemeral credentialing</li>
        <li>FedRAMP High compliance</li>
        <li>Regulated environments (healthcare, fintech)</li>
        <li>PHI/HIPAA de-identification</li>
      </ul>
    </div>
    <div class="skills-group">
      <h3>AI/ML &amp; ML Engineering</h3>
      <ul>
        <li>ML engineering &amp; applied ML pipelines</li>
        <li>LLM-assisted tooling &amp; agentic systems</li>
        <li>Clinical NLP &amp; entity recognition</li>
        <li>Applied ML for education</li>
      </ul>
    </div>
    <div class="skills-group">
      <h3>Other</h3>
      <ul>
        <li>Go</li>
        <li>GraphQL/React</li>
        <li>Technical writing &amp; public speaking</li>
      </ul>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Re-run the check from Step 1**

Run: `test -f about.md && echo PASS`
Expected: `PASS`

- [ ] **Step 4: Commit**

```bash
git add about.md
git commit -m "Add About page with bio, affiliations, and skills"
```

---

### Task 9: Contact page

**Files:**
- Create: `contact.md`

Note: the old Contact section in `index.md` is removed by Task 10, which replaces `index.md` wholesale — no separate deletion needed here.

**Interfaces:**
- Consumes: `.section`, `.contact-list`, `page` layout (Tasks 3-4).

- [ ] **Step 1: Write a failing check**

```bash
test -f contact.md
echo $?
```

Expected: non-zero.

- [ ] **Step 2: Create `contact.md`**

```markdown
---
layout: page
title: Contact
permalink: /contact/
---
<section class="section">
  <p>Feel free to reach out.</p>
  <ul class="contact-list">
    <li><a href="mailto:{{ site.email }}">{{ site.email }}</a></li>
    <li><a href="https://www.linkedin.com/in/tristan-mckinnon/" target="_blank" rel="noopener">LinkedIn</a></li>
    <li><a href="https://github.com/tr9800a" target="_blank" rel="noopener">GitHub</a></li>
    <li><a href="https://orcid.org/0009-0001-4473-7042" target="_blank" rel="noopener">ORCID: 0009-0001-4473-7042</a></li>
  </ul>
</section>
```

- [ ] **Step 3: Re-run the check from Step 1**

Run: `test -f contact.md && echo PASS`
Expected: `PASS`

- [ ] **Step 4: Commit**

```bash
git add contact.md
git commit -m "Add Contact page"
```

---

### Task 10: Home page rewrite

**Files:**
- Modify: `index.md` (full rewrite)

**Interfaces:**
- Consumes: `site.projects` (Task 6), `site.talks` (Task 7), `.hero*` classes and `default` layout (Tasks 3-4), `project-card.html`/`talk-card.html` includes (Tasks 6-7).

- [ ] **Step 1: Write a failing check**

```bash
grep -q 'hero__title' index.md
echo $?
```

Expected: non-zero (`index.md` is still the old placeholder content).

- [ ] **Step 2: Rewrite `index.md`**

```markdown
---
layout: default
title: Home
---
<section class="hero">
  <div class="hero__content">
    <p class="hero__eyebrow">Staff Data Engineer · Founder/PI, Deterministic Systems Lab</p>
    <h1 class="hero__title">Tristan McKinnon</h1>
    <p class="hero__subtitle">I build zero-trust data pipelines for the most regulated environments in healthcare, fintech, and federal government — and speak and write about what actually breaks in production.</p>
    <div class="hero__actions">
      <a class="button button--primary" href="{{ '/projects/' | relative_url }}">View Projects</a>
      <a class="button button--secondary" href="{{ '/contact/' | relative_url }}">Get in Touch</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="section__header">
    <h2>Featured Projects</h2>
    <a href="{{ '/projects/' | relative_url }}">See all →</a>
  </div>
  <div class="card-grid">
  {% assign featured_projects = site.projects | sort: "featured_order" | slice: 0, 3 %}
  {% for project in featured_projects %}
    {% include project-card.html project=project %}
  {% endfor %}
  </div>
</section>

<section class="section">
  <div class="section__header">
    <h2>Speaking Highlights</h2>
    <a href="{{ '/speaking/' | relative_url }}">See all →</a>
  </div>
  <div class="card-grid">
  {% assign featured_talks = site.talks | where_exp: "t", "t.featured_order" | sort: "featured_order" %}
  {% for talk in featured_talks %}
    {% include talk-card.html talk=talk %}
  {% endfor %}
  </div>
</section>
```

- [ ] **Step 3: Re-run the check from Step 1**

Run: `grep -q 'hero__title' index.md && echo PASS`
Expected: `PASS`

- [ ] **Step 4: Commit**

```bash
git add index.md
git commit -m "Rewrite Home page with hero and featured project/talk snapshots"
```

---

### Task 11: Push, verify the real GitHub Pages build, validate rendered pages

**Files:** none (verification only).

**Interfaces:** none — this task consumes the finished site from Tasks 1-10 and verifies it end-to-end on the real GitHub Pages build (per Global Constraints, this repo's Pages source is `main`, legacy build type).

- [ ] **Step 1: Confirm the working tree is clean and push to `main`**

```bash
git status --short
git push origin main
```

Expected: `git status --short` prints nothing (everything from Tasks 1-10 is committed); the push succeeds.

- [ ] **Step 2: Poll the Pages build API until the new build finishes**

```bash
for i in $(seq 1 20); do
  status=$(gh api repos/tr9800a/tr9800a.github.io/pages/builds/latest -q '.status')
  echo "build status: $status"
  if [ "$status" != "queued" ] && [ "$status" != "building" ]; then
    break
  fi
  sleep 15
done
gh api repos/tr9800a/tr9800a.github.io/pages/builds/latest -q '{status, error}'
```

Expected: final status is `built` with `error.message` null. If it's `errored`, read the `error.message` field, fix the offending file (most likely a Liquid or YAML front-matter typo introduced in an earlier task), commit, push, and re-poll.

- [ ] **Step 3: Validate each live page's HTML with the W3C Nu Html Checker**

```bash
for path in "" "about/" "projects/" "speaking/" "contact/"; do
  echo "=== /$path ==="
  curl -s "https://tr9800a.github.io/$path" | \
    curl -s -H "Content-Type: text/html; charset=utf-8" \
      --data-binary @- "https://validator.w3.org/nu/?out=json" | \
    ruby -rjson -e 'd = JSON.parse(STDIN.read); errs = d["messages"].select { |m| m["type"] == "error" }; puts errs.empty? ? "no errors" : errs.map { |e| e["message"] }.join("\n")'
done
```

Expected: `no errors` for each of the 5 paths. If real errors appear, fix the corresponding page's markup, commit, push, wait for the rebuild (Step 2), and re-run this check.

- [ ] **Step 4: Verify WCAG AA contrast for the color tokens from Task 2**

```bash
ruby -e '
def linearize(c)
  c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
end

def luminance(hex)
  r, g, b = hex.scan(/../).map { |h| h.to_i(16) / 255.0 }
  0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
end

def contrast(hex1, hex2)
  l1 = luminance(hex1)
  l2 = luminance(hex2)
  lighter, darker = [l1, l2].sort.reverse
  (lighter + 0.05) / (darker + 0.05)
end

pairs = {
  "dark text/bg"    => ["e6edf3", "0a0e14"],
  "dark muted/bg"   => ["8b98a5", "0a0e14"],
  "dark accent/bg"  => ["22d3ee", "0a0e14"],
  "light text/bg"   => ["16202a", "f7f9fb"],
  "light muted/bg"  => ["52606d", "f7f9fb"],
  "light accent/bg" => ["0e7a90", "f7f9fb"],
}

failed = false
pairs.each do |name, (fg, bg)|
  ratio = contrast(fg, bg)
  ok = ratio >= 4.5
  failed ||= !ok
  puts format("%-16s %.2f:1 %s", name, ratio, ok ? "PASS" : "FAIL")
end
exit(failed ? 1 : 0)
'
```

Expected: all six pairs print `PASS` (each ≥ 4.5:1). If any print `FAIL`, darken/lighten that token in `_sass/_variables.scss` (Task 2) until it passes, then repeat Steps 1-2 to redeploy before continuing.

- [ ] **Step 5: Confirm expected content landed on each live page**

```bash
curl -s https://tr9800a.github.io/ | grep -q 'Tristan McKinnon' && echo "home: OK"
curl -s https://tr9800a.github.io/about/ | grep -q 'Deterministic Systems Lab' && echo "about: OK"
curl -s https://tr9800a.github.io/projects/ | grep -c 'project-card' | xargs -I{} echo "projects: {} cards (expect 7)"
curl -s https://tr9800a.github.io/speaking/ | grep -c 'talk-card' | xargs -I{} echo "speaking: {} cards (expect 7)"
curl -s https://tr9800a.github.io/contact/ | grep -q 'orcid.org/0009-0001-4473-7042' && echo "contact: OK"
```

Expected: `home: OK`, `about: OK`, `projects: 7 cards (expect 7)`, `speaking: 7 cards (expect 7)`, `contact: OK`.

- [ ] **Step 6: Spot-check external links**

```bash
for url in \
  "https://github.com/deterministic-systems-lab/pymayfly" \
  "https://github.com/tr9800a/aetherforge" \
  "https://github.com/tr9800a/ghost-driver" \
  "https://github.com/deterministic-systems-lab/cobol-modernizer-toolkit" \
  "https://github.com/tr9800a/cfb-matchups" \
  "https://github.com/tr9800a/bacon-number-pipeline" \
  "https://github.com/tr9800a/crypto-journey" \
  "https://orcid.org/0009-0001-4473-7042" \
  "https://sites.google.com/view/aaai-human-ai-collaboration/"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")
  echo "$code  $url"
done
```

Expected: `200` for each. Note: the LinkedIn article URLs in `_data/writing.yml` and the USENIX/PyCon speaker-profile links are known to reject bare `curl` (bot-blocking) even when the page is fine in a browser — treat non-200 on `linkedin.com`, `usenix.org`, and `pycon.org` URLs as inconclusive, not a failure, and ask Tristan to eyeball those manually.

- [ ] **Step 7: Report results to Tristan**

No commit for this task (verification only) — summarize the build status and any checks that failed or were inconclusive.
