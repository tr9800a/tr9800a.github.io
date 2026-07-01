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
