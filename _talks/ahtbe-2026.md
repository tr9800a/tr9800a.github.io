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
