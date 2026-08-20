RefInvest Web Architecture

1. Overview

RefInvest Web is a Next.js frontend for a trading journal and quantitative analysis platform.

Primary goals:

keep business concepts and user actions clearly separated

keep page composition simple

isolate backend/API concerns

keep server state synchronized through TanStack Query

make the structure predictable for both humans and coding agents

The architecture uses Feature-Sliced Design (FSD).

2. Stack

Next.js

React

TypeScript

Next.js App Router

Tailwind CSS

TanStack Query

The existing project configuration is the source of truth for exact versions and tooling.

3. FSD Layers

src/
├── app/
├── pages/
├── widgets/
├── features/
├── entities/
└── shared/

Dependency direction:

app → pages → widgets → features → entities → shared

A lower layer must not import from a higher layer.

app

Application initialization and composition:

providers

global configuration

routing integration

application-level setup

Do not place business features here.

pages

Page-level composition.

Pages combine widgets/features/entities to form a route-level screen. Keep business logic and large UI sections out of pages.

widgets

Large, reusable UI sections composed from features and entities.

Examples:

strategy-list
strategy-detail
backtest-overview
trade-history

A widget owns composition and presentation of a meaningful section, not generic UI primitives.

features

User interactions and business operations.

Examples:

create-strategy
update-strategy
create-strategy-version
run-backtest
record-trade

A feature may use entities and shared UI. Keep the interaction logic inside the feature rather than inside generic components.

entities

Reusable representations of business concepts.

Examples:

strategy
strategy-version
backtest
trade

An entity may contain its types/model, API/query logic, and reusable entity-specific UI.

Do not place user actions that belong to a feature here.

shared

Generic, business-independent infrastructure.

Typical areas:

shared/
├── ui/
├── api/
├── lib/
├── config/
└── types/

Shared code must not depend on business entities or features.

4. Typical Slice Structure

Use semantic subdirectories only when they provide a clear boundary.

Example:

entities/strategy/
├── api/
├── model/
└── ui/

features/create-strategy/
├── api/
├── model/
└── ui/

widgets/strategy-list/
└── ui/

Do not create empty or unnecessary directories. Follow existing project conventions when they already provide a suitable pattern.

5. API Architecture

The backend API is an external contract and the source of truth for API behavior.

UI
 ↓
Feature / Entity query or mutation
 ↓
API function
 ↓
HTTP client
 ↓
Backend

UI components must not make HTTP requests directly.

Before implementing an API integration, inspect the backend Controller and Request/Response DTOs. Do not invent endpoints, HTTP methods, request fields, or response fields.

Keep API-specific types at the API boundary. Transform data only when the frontend requires a different representation.

6. Server State

TanStack Query owns server state.

Backend data → TanStack Query cache → UI

Do not duplicate server state in React state or a global store.

Use local React state for ephemeral UI state and URL state for state that should be represented by the route/search parameters.

Global client state requires a concrete requirement and should not be introduced speculatively.

7. Routing

Use the Next.js App Router.

Route files belong to app/ and should primarily compose the appropriate page/widget structure.

Do not turn route files into large feature implementations.

8. Component Responsibility

shared/ui       → generic reusable primitives
entities        → reusable business-concept UI
features        → interaction-specific UI and logic
widgets         → large section composition
pages           → route-level composition
app             → application setup

Prefer composition over duplication.

Do not create a new abstraction solely to reduce file length. Extract code when it represents a meaningful boundary or has real reuse.

9. Design System

DESIGN.md is the source of truth for visual design.

Architecture should consume the design system rather than defining visual rules independently.

Financial direction uses semantic tokens:

financial-positive → green
financial-negative → red

Never hard-code financial colors inside feature components or charts.

10. Data & UI States

Data-driven features should explicitly handle:

loading

success

empty

error

State handling should live at the appropriate feature/widget boundary rather than being duplicated across low-level UI components.

11. Architectural Rules

Follow FSD dependency direction.

Keep pages focused on composition.

Keep business interactions in features.

Keep business concepts in entities.

Keep generic code in shared.

Keep HTTP access outside UI components.

Use TanStack Query for server state.

Treat the backend contract as authoritative.

Reuse existing patterns before introducing new abstractions.

Prefer the smallest architecture-consistent change.

Avoid unrelated refactoring.

Update this document when an intentional architectural decision changes the actual project structure.