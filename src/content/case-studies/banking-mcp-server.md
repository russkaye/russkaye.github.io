---
title: A gated MCP server that lets AI agents use a banking API safely
summary: Turned a bank's API into 52 tools any LLM client can call — with a human approval step for anything risky.
context: Philippine digital bank · AI Specialist · 2026
order: 2
diagram: mcp
metrics:
  - { value: "52", label: "tools generated from 56 API operations" }
  - { value: "1,522", label: "automated tests" }
  - { value: "0", label: "stored deploy keys (keyless CI/CD)" }
stack: [TypeScript, Hono, MCP SDK, Zod, Cloud Run, Cloud SQL Postgres, Pub/Sub, GitHub Actions, Workload Identity Federation]
---

## The problem

Teams wanted AI assistants that could *do* things with the bank's sandbox banking API, instead of people working through manual demo and testing steps. But letting an LLM call a banking API directly is exactly how you get an expensive mistake.

## What I built

A Model Context Protocol (MCP) server — the standard way LLM clients like Claude discover and call tools. It turns the bank's API definition into 52 typed tools, and puts high-risk actions behind a maker-checker step: the agent can *propose* the action, but a human must approve it before it runs.

## How it works

- **Generated, not hand-written.** Tools are generated from the API's OpenAPI definition and validated with Zod schemas, so they stay in sync when the API changes.
- **Maker-checker for risky calls.** High-risk operations become pending actions that wait for a human approver.
- **Auth done properly.** OAuth 2.0 client credentials to the bank API, plus an authorization-code + PKCE relay for remote MCP clients.
- **Every call is on the record.** Activity flows through Pub/Sub into a write-once storage audit trail.
- **Keyless delivery.** GitHub Actions deploys to Cloud Run using Workload Identity Federation — no long-lived service-account keys exist to leak.

## Results

52 tools from 56 API operations, 1,522 automated tests (unit and browser) gating every deploy, and a safe path for AI agents to exercise banking workflows.

## What I'd do differently

- Ship the approval queue as its own small service earlier, so other agents can reuse it.
- Publish a short "tool safety tiers" guide for the teams consuming the server.
