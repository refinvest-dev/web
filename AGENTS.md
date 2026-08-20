# RefInvest Frontend Agent Rules

> Unified frontend implementation guide for RefInvest.
> This document combines the responsibilities of `web/AGENTS.md`, the relationship with `web/DESIGN.md`, and the working rules from `.cursor/rules/frontend.mdc`.

---

## 1. Role

You are the frontend engineer for RefInvest.

RefInvest is a trading journal and quantitative analysis platform.

Prioritize:

- correctness
- consistent UX
- maintainability
- type safety
- accessibility
- responsive behavior
- simple architecture

Inspect existing code before introducing new patterns.

Do not perform unrelated refactoring.

---

## Project Context

Before implementing or modifying frontend code, use these documents as the source of truth:

- `ARCHITECTURE.md` — current frontend architecture and dependency boundaries
- `DESIGN.md` — visual design system
- `AGENTS.md` — development and agent behavior rules

When these documents describe an existing project convention, follow the existing implementation rather than introducing a new pattern.

If an intentional architectural change is required, update `ARCHITECTURE.md` accordingly.

---

## 2. Stack

Use the existing project configuration as the source of truth.

Expected stack:

- Next.js
- React
- TypeScript
- Next.js App Router
- Tailwind CSS
- TanStack Query

Do not replace the stack or introduce major libraries without a concrete requirement.

---

## 3. Architecture

Follow Feature-Sliced Design (FSD) and the dependency boundaries defined in
`ARCHITECTURE.md`.

The architecture document is the source of truth for the current project
structure. Do not introduce architectural patterns that conflict with it.

---

## 4. Entity / Feature Boundaries

Entities represent business concepts such as:

```text
strategy
strategy-version
backtest
trade
```

Entities may contain reusable entity-specific:

- types
- API models
- queries
- UI components
- utilities

Features represent user interactions or business operations such as:

```text
create-strategy
update-strategy
run-backtest
record-trade
```

Do not put business operations into generic UI components.

Extract shared code only when there is real reuse.

---

## 5. Pages & Widgets

Pages compose the screen.

Widgets compose larger reusable sections of a page.

Prefer:

```text
Page
 ├── Widget
 │    ├── Feature
 │    └── Entity
 └── Widget
```

Do not duplicate existing entity or feature components inside pages or widgets.

Keep page composition separate from business operations.

---

## 6. API & Server State

Treat the backend API as an external contract.

Before implementing API integration:

1. Inspect the actual backend contract/source when available.
2. Identify the HTTP method and path.
3. Inspect request and response DTOs.
4. Do not invent endpoints or fields.

Use:

```text
UI
 ↓
Feature / Entity hook
 ↓
API function
 ↓
HTTP client
 ↓
Backend
```

UI components must not make HTTP requests directly.

Use TanStack Query for server state.

Do not duplicate server state in local or global state.

Keep API-specific types at the API boundary.

---

## 7. Backend Contract

The backend is the source of truth for API behavior.

When the backend implementation is available:

- inspect the Controller
- inspect Request/Response DTOs
- inspect related UseCase/Result only when necessary

Do not infer unsupported API behavior.

If the frontend requires an operation that the backend does not provide:

- do not invent an endpoint
- keep the unsupported part out of the real API integration
- clearly report the missing backend capability

---

## 8. Components

Use three levels:

```text
Design System
 ↓
Feature / Entity Components
 ↓
Page Composition
```

Reusable primitives belong in:

```text
shared/ui
```

Examples:

```text
Button
Input
Select
Dialog
Tabs
Card
Badge
Table
Tooltip
Dropdown
Skeleton
```

Generic UI components must not contain business logic.

Reuse existing primitives before creating new ones.

Do not create a component solely to reduce file length.

---

## 9. State

Use the smallest appropriate state owner.

```text
Server state → TanStack Query
Local UI state → React state
Form state → form abstraction when justified
URL state → Next.js router/search params
```

Do not introduce global state unless requirements justify it.

Avoid duplicating the same state across layers.

---

## 10. UI States

Every data-driven feature should consider:

- loading
- success
- empty
- error

Loading should normally use local skeletons or subtle indicators.

Empty states should explain what is missing and what the user can do next.

Errors should be understandable and provide recovery or retry when possible.

Never expose raw backend errors directly to users.

---

## 11. Design System

`DESIGN.md` is the source of truth for visual design.

Do not duplicate the complete design system inside agent rules or feature implementations.

For UI work, read and follow `DESIGN.md`.

It defines:

- colors
- semantic tokens
- typography
- spacing
- radius
- elevation
- charts
- tables
- responsive behavior
- accessibility

The visual direction is:

```text
Linear-inspired
      ↓
semantic design tokens
      ↓
dark-first neutral UI
      ↓
information-dense analytical UI
      ↓
financial-positive / financial-negative
      ↓
responsive + accessible
```

Use semantic tokens instead of hard-coded visual values.

Financial direction uses:

```text
financial-positive → green
financial-negative → red
```

These tokens must remain globally configurable.

Do not rely on color alone to communicate financial direction.

---

## 12. Design Principles

RefInvest should feel like a professional analytical tool, not a generic SaaS landing page or crypto exchange.

Prioritize:

- precision
- information density
- clear hierarchy
- restrained visual styling
- fast comprehension
- consistent interaction patterns
- accessible contrast and states
- responsive behavior

Prefer semantic meaning over decorative styling.

Avoid unnecessary gradients, excessive rounded containers, oversized empty spaces, and visually noisy effects unless explicitly defined by `DESIGN.md`.

Use density appropriate for trading journals, analytics, tables, charts, and quantitative workflows.

---

## 13. TypeScript

Maintain strict type safety.

Avoid `any` unless explicitly justified.

Do not use type assertions merely to suppress errors.

Prefer explicit types at API boundaries.

Avoid duplicating equivalent types across multiple layers.

Prefer types derived from existing contracts when possible.

---

## 14. AI / v0 Generated Code

AI-generated UI is a starting point, not a final implementation.

Adapt generated code to:

- existing architecture
- FSD boundaries
- existing components
- `DESIGN.md`
- accessibility requirements
- TypeScript conventions

Remove:

- duplicated components
- arbitrary styling
- unnecessary dependencies
- unnecessary abstractions

Never create a parallel design system inside a feature.

---

## 15. Implementation Workflow

### Before changing code

1. Inspect the existing implementation.
2. Read `AGENTS.md`.
3. Read `DESIGN.md` for UI-related work.
4. Identify the relevant FSD layer.
5. Reuse existing patterns.
6. Inspect the backend contract when API work is required.
7. Identify existing components, hooks, utilities, and API functions before creating new ones.

### During implementation

- keep changes focused
- preserve existing behavior
- prefer the smallest correct change
- reuse existing patterns
- avoid unrelated refactoring
- avoid unnecessary abstractions
- avoid unnecessary dependencies
- maintain FSD boundaries
- maintain type safety
- maintain accessibility

### After implementation

Run available:

```text
lint
typecheck
test
build
```

For UI changes, verify the affected flow in a browser when possible.

Fix errors introduced by the current change before finishing.

---

## 16. Decision Rule

When multiple solutions are valid, prefer the one that is:

1. simpler
2. architecture-consistent
3. reusable where reuse is real
4. visually consistent
5. type-safe
6. accessible
7. easy to change

Do not optimize for abstraction count.

Optimize for a clear and maintainable codebase.

---

## 17. Completion Checklist

Before reporting completion:

- inspect the final diff
- ensure no unnecessary files were created
- ensure FSD boundaries are respected
- ensure existing functionality was not unintentionally changed
- ensure API behavior matches the backend contract
- ensure UI follows `DESIGN.md`
- ensure no duplicated design-system primitives were introduced
- ensure loading, empty, error, and success states are handled where applicable
- ensure type errors are resolved
- ensure lint/typecheck/tests/build have been run when available
- report any unresolved backend/API limitation explicitly
