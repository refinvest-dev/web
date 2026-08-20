# RefInvest Design System

Linear-inspired design system for a precise, information-dense trading journal and quantitative analysis platform.

## Core Principles

RefInvest should feel like a professional analytical tool, not a generic SaaS landing page or crypto exchange.

Prioritize precision, information density, clear hierarchy, fast scanning, predictable interaction, and accessibility.

Avoid excessive gradients, shadows, animation, oversized typography, decorative illustrations, unnecessary cards, and visual noise. Use whitespace for hierarchy, not decoration.

When uncertain, prefer the simpler, denser, more consistent, accessible, and less decorative solution.

## Color

Use semantic tokens. Never hard-code colors.

### Base

background-primary
background-secondary
background-tertiary
surface-default
surface-hover
surface-active
surface-selected
surface-elevated
text-primary
text-secondary
text-muted
text-disabled
text-inverse
border-subtle
border-default
border-strong

### Accent

accent
accent-hover
accent-active
accent-muted

Use accent for interaction, selection, links, and primary actions. Never use it for financial direction.

### Application State

success
warning
error
info
neutral

Keep application state colors separate from financial colors.

### Financial Direction

financial-positive
financial-negative

Use for P/L, returns, price movement, winning/losing trades, and performance direction. Default to green/red, but keep globally configurable.

Never rely on color alone. Use +/-, arrows, labels, or icons when useful.

## Typography

Use a clean sans-serif optimized for UI and numerical data.

Hierarchy: Display, Heading 1–3, Body, Body Small, Caption.

## Spacing, Shape & Elevation

Use spacing tokens: xs, sm, md, lg, xl, 2xl. Keep analytical interfaces compact; use larger spacing for major sections.

Use restrained radii: small for controls, small/medium for cards, medium for dialogs/popovers. Use pills only for badges, tags, and compact filters.

Prefer borders and surface contrast over shadows. Use elevation mainly for dialogs, dropdowns, and popovers.

## Layout

Use a consistent application shell:

Sidebar → Main Content → Page Header → Content

Prefer persistent/compact navigation, consistent containers, clear page headers, and dense but readable layouts. Do not wrap every element in a card.

## Components

Architecture:

Design System → Feature Components → Page Composition

Shared primitives:
Button, Input, Select, Dialog, Tabs, Card, Badge, Table, Tooltip, Dropdown, Skeleton.

Reuse existing primitives instead of creating duplicates. Generic UI components must not contain business logic. Feature components compose shared primitives.

## Tables & Metrics

Tables are first-class analytical UI.

Prioritize compact rows, numerical alignment, clear column hierarchy, readable hover states, sortable headers where useful, and sticky headers where useful.

Metrics should be immediately scannable. Do not make every metric visually dominant. Use financial tokens for P/L, returns, and performance.

## Charts

Prioritize accuracy and readability.

positive → financial-positive
negative → financial-negative
neutral/reference → text-muted
selected/highlight → accent

Use semantic chart tokens. Avoid decoration, excessive gridlines. Provide useful tooltips.

## Forms & Actions

Forms use:
Label
Input
Helper text
Error

Inputs need default, hover, focus, disabled, and error states.

Button hierarchy: Primary, Secondary, Tertiary/Ghost, Destructive.

Use primary actions sparingly.

## Data States

Every data-driven feature must handle:

Loading — use local skeletons or subtle indicators; avoid blocking the entire page.

Empty — explain what is missing and what the user can do next.

Error — explain the problem and provide retry/recovery when possible. Never expose raw backend errors.

## Interaction

Keep interactions fast and deliberate. Use subtle transitions; avoid decorative or delaying animation.

## Responsive & Accessibility

Support desktop, tablet, and mobile.

On small screens: collapse secondary navigation, prioritize essential information, horizontally scroll dense tables, simplify complex layouts, and preserve primary actions.

Use semantic HTML, keyboard navigation, visible focus states, accessible labels, and sufficient contrast. Never communicate state through color alone.

## v0 Rules

Treat generated UI as a starting point. Reuse existing primitives; use semantic color and spacing tokens; remove duplicates; preserve accessibility; follow FSD boundaries; avoid unnecessary dependencies; never create a parallel design system.

Adapt Linear's visual discipline to RefInvest's trading journal, strategy, backtesting, and quantitative analysis workflows. Do not copy Linear literally.