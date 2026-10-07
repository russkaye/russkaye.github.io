---
title: Cutting LLM spend 74% across 30 production agents
summary: Moved a bank's production AI agents from frontier models to open-weight models — without users noticing a quality drop.
context: Philippine digital bank · AI Specialist · 2026
order: 1
diagram: cost
metrics:
  - { value: "−74%", label: "monthly model spend" }
  - { value: "30", label: "production agents migrated" }
  - { value: "3", label: "open-weight model families" }
  - { value: "2 wks", label: "user acceptance gate per agent" }
stack: [Onyx, GLM, Kimi, DeepSeek, RAG, LLM evaluation]
---

## The problem

The bank ran dozens of internal AI agents — fraud review, AML (anti-money-laundering) review, and a general assistant for employees — all on frontier models. Usage grew, and so did the bill. The question was blunt: can cheaper open-weight models do the same work without the people who rely on these agents noticing?

## What I built

I owned the migration end to end: choosing which open-weight models to trial (GLM, Kimi, DeepSeek; Qwen evaluated), choosing which agents to test first, running each switch through a user acceptance gate, and monitoring after release. IT handled the purchasing; everything else was mine.

## How it works

- **Choose the test agents deliberately.** I picked which agents to trial on each open-weight model instead of switching everything at once.
- **Swap the model, not the agent.** Each agent kept its prompts, document sets and tools — only the model behind it changed.
- **Two weeks of real use.** Every switched agent ran with its actual users for two weeks. Only if output quality held consistently did it pass UAT and get released to production.
- **Watch after release.** Monitoring continued after go-live.

## Results

30 production agents now run on open-weight models (10 on GLM, 15 on Kimi, 5 on DeepSeek), and monthly model spend fell about 74%.

## What I'd do differently

- Add an automated regression set per agent (golden questions with expected answers) so UAT starts from a measured baseline instead of only user judgment.
- Track cost and quality on one dashboard per agent from day one, not after the first batch.
