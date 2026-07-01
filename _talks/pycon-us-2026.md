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
