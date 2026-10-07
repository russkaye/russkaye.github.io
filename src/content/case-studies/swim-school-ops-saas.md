---
title: Wiring a multi-location swim-school SaaS to its customers' booking system
summary: Mirrored enrollment data from a third-party booking system into a new platform — safely, across 7 locations.
context: US swim-school operations SaaS · AI Business Analyst (Contract) · 2026
order: 3
diagram: mirror
metrics:
  - { value: "~1,126", label: "commits in six weeks" }
  - { value: "7", label: "locations across the NY/NJ/CT Tri-State Area" }
  - { value: "3", label: "data surfaces mirrored" }
  - { value: "0", label: "raw PII handled" }
stack: [Python, FastAPI, PostgreSQL (row-level security), Playwright, Chrome DevTools Protocol, React, Railway]
---

## The problem

A US company building an operations platform for swim schools needed enrollment, family and student data from the booking system its customers already used. That data had to arrive complete and verifiable — and it was about children and their families, so mistakes were not an option.

## What I built

A reusable data-mirror pattern. Browser workers (Playwright driving Chrome through the DevTools Protocol) read the three source surfaces — Enrollments, Families and Students — and produce redacted, hash-verified evidence that repeatable import and verification scripts load into a multi-tenant Postgres database protected by row-level security.

## How it works

- **Read like a person, record like an auditor.** Workers capture redacted artifacts and content hashes, so every import can be checked against its source.
- **Repeatable, not one-off.** The same import and verification scripts run for every location.
- **Guardrails first.** No raw PII handling and no unsupervised production writes — enforced as rollout checks.
- **Ship fast, stay green.** About 1,126 of the team's 3,789 commits in six weeks, with migration and test gates kept green on a codebase of 250+ migrations.

## Results

Readiness checks for a 7-location rollout across the NY/NJ/CT Tri-State Area, with one mirror pattern serving all three data surfaces.

## What I'd do differently

- Pursue an official data feed in parallel with browser automation from day one.
- Add alerting on source-page layout changes before they break a scheduled mirror.
