# Home Purchase Simulator - AI Coding Agent Guide

## Project Overview

Next.js 16 app comparing home financing options (cash, mortgage, mixed, pledge) using financial projections. Single-page app with sidebar inputs + main dashboard showing 30-year projections.

## Architecture

### Core Structure

- **Monorepo**: Root has `justfile` for commands, app lives in `web/`
- **State Management**: Single `ProjectionData` state object in [page.tsx](web/src/app/[locale]/page.tsx), lifted up and passed to Sidebar (inputs) + MainContent (visualizations)
- **Financial Engine**: [math.ts](web/src/lib/math.ts) (PMT calculations with Decimal.js) → [projection.ts](web/src/lib/projection.ts) (30-year amortization) → UI rendering
- **i18n**: `next-intl` with route-based locales `[locale]/`, messages in [src/messages/](web/src/messages/)

### Data Flow

```
User Input (Sidebar) → handlePropertyChange → setState(ProjectionData)
  → useMemo(calculateScenario) → MainContent renders metrics/charts
```

## Key Conventions

### Financial Precision

- **Always use `Decimal.js`** for monetary calculations (see [calculatePMT](web/src/lib/math.ts#L27-L80))
- Convert to Decimal immediately, operate in Decimal, only call `.toNumber()` at final UI render
- Example pattern:
  ```typescript
  const result = calculatePMT(rate, periods, pv).toDecimalPlaces(2).toNumber();
  ```

### State Structure

- `ProjectionData` interface is the single source of truth (defined in [projection.ts](web/src/lib/projection.ts#L27-L60))
- Never mutate state directly; always use `setState((prev) => ({...prev, ...}))` pattern
- Category-based grouping: `property`, `mortgage`, `investing`, `pledge` (matches sidebar sections)

### Component Patterns

- **"use client"** required for all interactive components (state, hooks, event handlers)
- Prefer composition: [SidebarInputs.tsx](web/src/components/SidebarInputs.tsx) exports `InputGroup`, `Section`, `Toggle`, `SegmentControl` composables
- Icons from `lucide-react`, styling with Tailwind utility classes

### Internationalization

- All user-facing text goes through `useTranslations("Namespace")` hook
- Structure JSON messages with nested keys matching component hierarchy: `Sidebar.property.price`
- Maintain parallel structure in [en.json](web/src/messages/en.json) and [es.json](web/src/messages/es.json)
- Use `useFormatter()` for currency/number formatting

### Styling Guidelines

- Consistent color palette: indigo-600 (primary), slate-50/100/200 (backgrounds), slate-400/500/800 (text hierarchy)
- Cards use `<Card>` component wrapper (see [Card.tsx](web/src/components/Card.tsx))
- Badges for status: `<Badge type="warning" | "success" | "danger">`
- Responsive: `md:` breakpoint for desktop, stack vertically on mobile

## Development Workflow

### Commands (via `just`)

```bash
just all              # Install deps + start dev server
just install-web-deps # npm install in web/
just start-web-dev    # npm run dev (Next.js dev server)
```

### Adding Financial Features

1. Update `ProjectionData` interface in [projection.ts](web/src/lib/projection.ts)
2. Modify `calculateScenario()` or `generateProjections()` logic
3. Add corresponding input fields in [Sidebar.tsx](web/src/components/Sidebar.tsx)
4. Reflect results in [MainContent.tsx](web/src/app/[locale]/MainContent.tsx) metrics/charts
5. Add translations to both locale JSON files

### Testing Financial Calculations

- Verify with known Excel/spreadsheet results
- Check edge cases: 0% interest, 100% down payment, 0 pledge amount
- Ensure Decimal.js used for all intermediate steps (no floating-point drift)

## Critical Implementation Details

### Amortization Logic

- Monthly loop inside yearly loop (see [generateProjections](web/src/lib/projection.ts#L66-L108))
- Balance reduction: `balance -= (monthlyPayment - interest)`
- Net worth = `propertyValue - balance + investmentValue - pledgeAmount`

### Mortgage Stress Testing

- Variable mortgages add +2.5% to rate for stress scenario
- Separate `stressPayment` calculated but displayed as reference only
- See [getMortgageRates](web/src/lib/math.ts#L86-L105)

### Recharts Integration

- Use `<ResponsiveContainer>` wrapper always
- Data transformation: map projections to `{year, netWorth, propertyValue, balance}`
- Custom tooltips for localized currency formatting

## Common Pitfalls

- ❌ Don't use `parseFloat()` for financial math—use Decimal.js
- ❌ Don't hardcode strings—always use `t("key")` from next-intl
- ❌ Don't forget `"use client"` directive on interactive components
- ❌ Don't mutate `ProjectionData` state directly—always spread `...prev`
