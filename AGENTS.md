# AI Business OS — Engineering Guide

Version: 1.0

This repository is the ONLY source of truth for AI Business OS.

Never create a new project when the existing repository already exists.

---

# Project Identity

AI Business OS is not a dashboard.

It is the daily operating workspace for founders of small businesses.

Everything follows the VITRINE Manifesto and the Visual Language.

The objective is timeless software rather than trendy software.

Whenever a design decision conflicts with modern SaaS conventions, prefer the VITRINE philosophy.

---

# Repository Rules

Always inspect the existing repository before making changes.

Never scaffold a new Next.js project.

Never create temporary workspaces.

Never generate replacement projects.

Never generate tar.gz archives unless explicitly requested.

Never rewrite the architecture.

Always extend the existing codebase.

If functionality already exists, improve it instead of replacing it.

---

# Git Rules

Always work inside the current git repository.

Before changing code:

- inspect current branch
- inspect git status
- inspect latest commits if needed

Never initialize another git repository.

Never overwrite unrelated files.

When a task is complete, summarize which files were changed.

Never modify files unrelated to the requested task.

---

# Architecture

Prefer modular architecture.

Avoid giant components.

Extract reusable UI.

Keep business logic separate from presentation.

Directory responsibilities:

src/app
Application routes

src/components
Reusable UI

src/lib
Utilities

src/data
Mock data

src/hooks
Hooks

Never duplicate components.

Refactor instead.

---

# TypeScript

Strict mode.

No "any".

No unnecessary type assertions.

Prefer explicit interfaces.

Keep types reusable.

---

# React

Prefer Server Components.

Use Client Components only where required.

Keep state local whenever possible.

Avoid prop drilling.

---

# Design System

Everything follows Volume I (Manifesto).

Everything follows Volume II (Visual Language).

Never redesign existing pages without instruction.

Preserve spacing rhythm.

Preserve typography hierarchy.

Preserve colour budgets.

Never invent a new visual language.

---

# Motion

Motion is meaningful.

No decorative animation.

No count-up animations.

No unnecessary fades.

Money never rolls.

Hover is subtle.

Opening sequence follows the Manifesto.

---

# Components

Every component should:

- have one responsibility
- be reusable
- be composable
- avoid hidden side effects

Prefer composition over inheritance.

---

# AI Features

The AI has:

- no avatar
- no face
- no personality
- no name

AI suggestions become facts only after explicit user acceptance.

Warmth belongs only to machine-generated content.

---

# Code Style

Readable over clever.

Simple over complex.

Small commits.

Small files.

Consistent naming.

Avoid deep nesting.

---

# Routing

Never break existing routes.

When adding routes:

- loading.tsx
- error.tsx

should exist where appropriate.

---

# Performance

Avoid unnecessary renders.

Lazy-load heavy sections.

Prefer server rendering.

Keep bundle size small.

---

# Accessibility

Keyboard navigation first.

Visible focus states.

Semantic HTML.

Proper labels.

Colour must never be the only signal.

---

# Before Every Task

1. Read this AGENTS.md.
2. Inspect the repository.
3. Understand existing architecture.
4. Reuse existing components.
5. Implement only the requested feature.
6. Verify imports.
7. Verify routes.
8. Explain what changed.

---

# Forbidden

Do NOT:

- create another repository
- scaffold another Next.js app
- rewrite the design system
- replace existing architecture
- duplicate components
- invent new design language
- ignore VITRINE
- ignore Visual Language

---

# Working Style

Act as a senior staff engineer.

Think before coding.

Question architectural decisions when necessary.

Optimize for long-term maintainability.

Prefer fewer, better components.

Every change should make the repository better than before.

If uncertain, inspect the existing implementation before writing code.