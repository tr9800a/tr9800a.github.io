# Portfolio Site Redesign

## Purpose & Audience

The site is a general professional hub, slanted toward a job search. Primary audience: hiring managers/recruiters evaluating Tristan for data engineering / ML engineering roles, secondarily conference organizers and collaborators. The redesign must present substantially more content than today (one placeholder page) in a way that's easy to scan and credible to a technical audience.

## Current State

- Jekyll site on GitHub Pages, using `jekyll-theme-cayman` with custom CSS/JS overrides.
- Single `index.md` page: About (2 sentences), empty Skills list, one Project, one Speaking Engagement, a Writing section that links to a LinkedIn feed, and Contact.
- Fern-photo parallax hero background.
- No mobile-specific design considerations beyond the theme defaults.

## Architecture & Tech Approach

- Remain on **Jekyll + GitHub Pages** (native Pages build, no GitHub Actions needed) — matches current hosting and requires no new CI.
- Drop the `jekyll-theme-cayman` dependency; replace with fully custom Sass under `_sass/`, compiled via Jekyll's built-in Sass support (already configured in `_config.yml`).
- Introduce two **Jekyll collections**:
  - `_projects/` — one Markdown file per project, front matter: `title`, `summary`, `tags` (tech stack), `repo_url`, `org` (personal or `deterministic-systems-lab`), `featured_order`.
  - `_talks/` — one Markdown file per speaking engagement / publication, front matter: `title`, `venue`, `date`, `location`, `type` (`talk`, `workshop`, `paper`, `chapter`), `summary`, `link` (if any).
- `_includes/` for shared partials: `nav.html`, `footer.html`, `project-card.html`, `talk-card.html`, `theme-toggle.html`.
- `_layouts/`: `default.html` (site chrome: nav, footer, theme toggle, meta tags) and `page.html` (adds a page-title header for interior pages, extends `default.html`).
- Vanilla JS (`assets/js/theme.js`) for the light/dark toggle: reads/writes `localStorage`, toggles a `data-theme` attribute on `<html>`, defaults to dark when unset. No JS framework, no build step beyond Jekyll's own.
- Remove `assets/images/ferns-med.jpg` and the associated `.parallax` CSS/JS; replace with a CSS/SVG-based abstract background (node/graph motif) scoped to the home hero only.

## Site Structure & Navigation

Global nav (all pages): **Home · About · Projects · Speaking & Writing · Contact**

### Home (`index.md`)
- Hero: name, one-line positioning statement, abstract node/graph background, primary CTA links (e.g. "View Projects", "Contact").
- Snapshot sections pulling from the collections: 2-3 featured projects, 2-3 most recent/upcoming talks — each with a "see all" link to the full page.

### About (`about.md`)
- Bio: Staff Data Engineer, Founder/PI of Deterministic Systems Lab, pursuing a D.Eng in AI/ML at George Washington University (expected 2028).
- Affiliations line: IEEE Computer Society, IEEE Technical Community on Data Engineering, IEEE Society on Social Implications of Technology, Technical Committee on Data Engineering.
- Skills, grouped:
  - **Data Engineering & Cloud** — Python; serverless architecture (AWS Lambda, Glue, Step Functions); SQL & graph databases; high-throughput / high-volume pipeline design.
  - **Security & Compliance** — Zero-Trust architecture; Identity-Per-Transaction / ephemeral credentialing; FedRAMP High compliance; regulated environments (healthcare, fintech); PHI/HIPAA de-identification.
  - **AI/ML & ML Engineering** — ML engineering & applied ML pipelines; LLM-assisted tooling & agentic systems; clinical NLP & entity recognition; applied ML for education.
  - **Other** — Go; GraphQL/React; technical writing & public speaking.

### Projects (`projects.md`)
All 7 projects, rendered from `_projects/` collection, newest/most-relevant first:

1. **pymayfly** — Identity-Per-Transaction credential library for regulated data pipelines ("like a mayfly, these credentials live for exactly one transaction"). Published to PyPI. `deterministic-systems-lab/pymayfly`.
2. **aetherforge** — Generates Unreal Engine levels from natural-language prompts: a Go orchestration service turns intent into a deterministic scene recipe (Poisson-disk scatter + spatial-hash overlap rejection), paired with a UE5 editor plugin. `tr9800a/aetherforge`.
3. **ghost-driver** — Security research demonstrating 96% re-identification of "anonymized" fleet telemetry via a multi-pass spatiotemporal sieve algorithm, with a synthetic reproducibility dataset. `tr9800a/ghost-driver`.
4. **cobol-modernizer-toolkit** — LLM-assisted ETL pipeline that ingests legacy COBOL, analyzes structure, and generates modern documentation and Java/Python migration scaffolding. `deterministic-systems-lab/cobol-modernizer-toolkit`.
5. **cfb-matchups** — Graph-theory analytics engine for college football history (NetworkX + CollegeFootballData API): strength of schedule/record metrics, connection chains, shortest paths. `tr9800a/cfb-matchups`.
6. **bacon-number-pipeline** — Graph-database pipeline computing Bacon Numbers from IMDB data, paired with a React/GraphQL frontend. `tr9800a/bacon-number-pipeline`.
7. **crypto-journey** — Educational blockchain/crypto transaction lineage explorer, deployed as a serverless API. `tr9800a/crypto-journey`.

(Note: 7 entries total — pymayfly, aetherforge, ghost-driver, cobol-modernizer-toolkit, cfb-matchups, bacon-number-pipeline, crypto-journey — all confirmed by Tristan across the two selection rounds.)

### Speaking & Writing (`speaking.md`)
All entries from `_talks/` collection, reverse-chronological. Content confirmed/drafted with Tristan:

1. **PyCon US 2026** — "Zero Trust in 200ms: Implementing Identity-Per-Transaction with Python and Serverless." Sat, 12:00-12:30pm, Room 103ABC.
   > Building a serverless data pipeline that satisfies FedRAMP High while handling Protected Health Information is typically a nightmare of encryption management and rigid access controls. This talk dissects a production federal life-sciences pipeline that replaces static service accounts with ephemeral Python logic: an identity broker that mints a unique, cryptographically scoped IAM credential for every file transaction and destroys it milliseconds later, a streaming de-identification layer built on Python generators and Microsoft Presidio to tokenize PII in-memory before it reaches the data lake, and structured logging patterns that produce immutable, audit-ready JSON trails — showing how Python can solve the "Non-Human Identity" crisis in high-stakes environments.

2. **IEEE BigDataSecurity 2026** — "Zero-Trust Data Engineering: A Reference Architecture for Serverless, FedRAMP-High Healthcare Pipelines." Session BIGDATASECURITY 6, May 10 2026, 14:30-15:30 ET, Room A.
   > As healthcare research migrates petabyte-scale genomic and clinical data to the cloud, traditional perimeter-based security models violate zero-trust principles and let a single compromised credential expose an entire data lake. This paper proposes a shift from identity-per-user to identity-per-transaction, presenting a serverless zero-trust reference architecture (AWS Lambda/Glue) that uses a just-in-time identity broker and a clean-room, streaming de-identification layer to scope permissions to the lifecycle of a single batch event. Evaluated in a production FedRAMP High environment, the architecture cuts the blast radius of a compromised identity by over 99.9% while preserving linear throughput scalability — proving that rigorous federal compliance doesn't have to come at the cost of cloud agility.

3. **USENIX PEPR '26** — "The Disposable Identity: Eliminating Non-Human Identity Risk in Federal Healthcare Pipelines."
   > Non-human identity — the long-lived, over-privileged service accounts powering automated pipelines — is the fastest-growing and least-examined attack surface in cloud data environments; in federal healthcare systems under FedRAMP High, a single compromised ingestion role can mean bucket-wide access for up to 90 days. This talk presents a production case study of an Identity-Per-Transaction (IPT) pipeline deployed for a federal life sciences agency that issues a unique, cryptographically scoped, ephemeral credential for every file-ingestion event and destroys it milliseconds later, including the operational realities of running it in production — latency, concurrency race conditions, and debugging credentials that no longer exist — plus an honest reckoning with the approach's limits: the identity broker remains a bounded but non-zero root of trust, and eliminating credential-mediated access risk is not the same as solving genomic data anonymization.

4. **AHTBE 2026** (2nd International Conference on Advancement in Healthcare Technology and Biomedical Engineering, University Canada West, Vancouver BC — Aug 21-22, 2026) — "Hybrid NLP at Scale: Optimizing Clinical De-identification for High-Throughput FedRAMP Lakes."
   > De-identifying unstructured clinical text at petabyte scale runs into a hard tradeoff: Transformer models like ClinicalBERT catch context-dependent PHI but are too slow for high-volume ingestion, while fast RegEx systems miss it and leak privacy. This paper introduces a hybrid triage architecture that uses lightweight heuristic scanning to process 90% of low-entropy clinical text at line speed, routing only ambiguous or high-context segments to a full Transformer model. Benchmarked in a production FedRAMP High environment, the hybrid approach matches full-model accuracy (F1 0.98) while cutting compute costs by 40% and ingestion latency by 60%, offering a practical blueprint for balancing privacy compliance with research velocity.

5. **PyCon Korea 2026 (deep-dive workshop)** — "Go-Live at Hour Three: An Observability War Room."
   > A full-day, hands-on workshop simulating a live production incident: teams build a real observability stack — structured logging, metrics, alerting, contract tests, and trace correlation — against a working-but-blind data pipeline in the hours before a new partner integration goes live. When the partner goes live at hour three, staged waves of realistic failures (schema drift, unsized volume, poison records, silently wrong data) test whatever instrumentation the team chose to build, with missing signals added live as blind spots surface. Requires only Python and a laptop — no monitoring or security background needed — and ends with a retro on which signals mattered and where the team was still blind.

6. **AAAI 2025 Spring Symposium Series** (Symposium on Current and Future Varieties of Human-AI Collaboration, Burlingame, CA, Mar 31-Apr 2 2025) — "AI as a Collaborative Partner in Data Science Education."
   > This talk explores how AI can partner with instructors and students to make data science education more engaging, effective, and equitable — from AI tutoring systems that give real-time, personalized feedback on coding assignments and support students with learning disabilities, to automated grading tools that free instructors for higher-level teaching, to collaborative projects where students and AI agents jointly tackle data analysis and modeling problems — while arguing that these gains must be paired with deliberate attention to bias, fairness, privacy, transparency, and accountability in AI's classroom deployment.

7. **Elsevier book chapter** — Chapter 15, "Synergistic Pedagogy: Integrating AI Collaborators into Data Science Education," in *Generative AI Risks and Benefits within Human-Machine Teams* (Tristan McKinnon, corresponding author). Publication forthcoming (expected August 2026) — list as "Forthcoming 2026" until a public link exists.

**Writing** (same page, own subsection): 4 featured LinkedIn articles + a link to the full LinkedIn articles feed. A 5th candidate ("Real-Time Data Processing with Kafka...") could not be verified under Tristan's byline via search and was dropped rather than risk a fabricated link:
- "Identity-Per-Transaction: What It Is and Why It Matters" — `https://www.linkedin.com/pulse/identity-per-transaction-what-why-matters-tristan-mckinnon-s1ucc`
- "Real-Time Fraud Detection: Architecture Patterns for Fintech" — `https://www.linkedin.com/pulse/real-time-fraud-detection-architecture-patterns-fintech-mckinnon-kqo0c`
- "Ethical Considerations in Data Engineering and AI: Building Systems That Serve Everyone" — `https://www.linkedin.com/pulse/ethical-considerations-data-engineering-ai-building-systems-mckinnon-y4scc`
- "GraphQL: Simplifying Data Queries for Modern Applications" — `https://www.linkedin.com/pulse/graphql-simplifying-data-queries-modern-applications-tristan-mckinnon-ztsyc`

Note: these URLs were found via web search, not verified by direct fetch (LinkedIn blocks scraping). Tristan should spot-check the links after the content is drafted, before the site goes live.

### Contact (`contact.md`)
Email (mailto), LinkedIn, GitHub, ORCID (`0009-0001-4473-7042`). No resume/CV download (explicitly declined).

## Visual Design System

- **Theme**: dark-mode default, light-mode available via toggle (persisted in `localStorage`, defaults to dark on first visit).
- **Accent color**: cyan/teal (e.g. `#22d3ee` family) on both themes, adjusted for contrast in light mode.
- **Typography**: a monospace accent face (e.g. JetBrains Mono, system-ui monospace fallback) for headings, nav, and tags; a standard system sans-serif stack for body copy.
- **Hero background**: CSS/SVG abstract node-graph pattern (static or subtly animated), replacing the fern photo. Home page only — interior pages use a plain themed background to keep focus on content.
- **Cards**: consistent bordered card component (`project-card`, `talk-card`) with hover state, used across Home snapshot, Projects, and Speaking & Writing.

## Responsiveness & Accessibility

- Mobile-first layout via CSS flexbox/grid; nav collapses to a simple stacked/menu form below a defined breakpoint.
- Both themes checked for WCAG AA contrast on text/background and accent-on-background combinations.
- Semantic HTML throughout (`nav`, `main`, `article`, `section`, heading hierarchy); no images requiring alt text are introduced by this redesign (hero background is decorative CSS/SVG, marked `aria-hidden` or applied via CSS `background-image`/inline SVG rather than an `<img>`).

## Out of Scope

- No CMS, no build pipeline beyond Jekyll's native GitHub Pages build, no analytics.
- No automatic GitHub repo pulling (projects are curated, not generated).
- No resume/CV download.
- No blog/long-form authoring on-site (writing lives on LinkedIn; this site links out).

## Testing / QA Plan

Since there's no application logic to unit test, verification is manual and pre-commit:

1. `bundle exec jekyll serve` locally; review every page in both light and dark themes.
2. Check responsive behavior at common breakpoints (mobile ~375px, tablet ~768px, desktop ~1280px+).
3. Run an HTML validator (e.g. W3C validator or `html-proofer` if available) against the built `_site/`.
4. Link-check all external URLs (GitHub repos, LinkedIn articles/profile, ORCID, conference pages) for reachability.
5. Confirm the light/dark toggle persists across page navigation and browser reloads.
