# CoachMe360 Design Guidelines

## Design Approach: Material Design 3 System

**Rationale:** CoachMe360 is a data-intensive enterprise application requiring clarity, consistency, and professional credibility. Material Design 3 provides robust patterns for complex dashboards, forms, and data visualization while maintaining accessibility and responsive design principles.

**Core Principles:**
- Clarity over decoration: Information hierarchy guides every decision
- Trust through consistency: Predictable patterns reduce cognitive load
- Data-first aesthetics: Visualizations are the hero, not decorative elements
- Professional credibility: Design signals expertise and reliability

---

## Color Palette

**Light Mode:**
- Primary: 220 70% 50% (Professional blue - trust, stability)
- Primary Container: 220 90% 95% (Subtle backgrounds for cards)
- On Primary: 0 0% 100% (White text on primary)
- Surface: 0 0% 98% (Main background)
- Surface Variant: 220 20% 96% (Elevated cards, panels)
- Outline: 220 20% 80% (Borders, dividers)
- On Surface: 220 15% 20% (Primary text)
- On Surface Variant: 220 10% 45% (Secondary text)

**Dark Mode:**
- Primary: 220 75% 65% (Lighter blue for contrast)
- Primary Container: 220 50% 25% (Darker container)
- On Primary: 220 15% 10% (Dark text on primary)
- Surface: 220 15% 12% (Main background)
- Surface Variant: 220 15% 18% (Elevated cards)
- Outline: 220 10% 30% (Borders)
- On Surface: 220 5% 95% (Primary text)
- On Surface Variant: 220 5% 70% (Secondary text)

**Semantic Colors:**
- Success: 140 60% 45% (Goals achieved, positive feedback)
- Warning: 35 90% 55% (Pulse alerts, attention needed)
- Error: 0 70% 50% (Derailment risks, critical gaps)
- Info: 200 80% 50% (AI insights, tips)

**Data Visualization Palette:**
- Self-assessment: 220 70% 50% (Primary blue)
- 360 Feedback: 280 60% 55% (Purple - distinct from self)
- Pulse Trends: 140 55% 45% (Green - team health)
- Chart accents: Use 6-color scale from primary hue variations

---

## Typography

**Families:**
- Primary: Inter (Google Fonts) - Clean, professional, excellent at small sizes
- Monospace: JetBrains Mono (Google Fonts) - For data, metrics, scores

**Scale:**
- Display: 48px/1.1/600 (Dashboard headers)
- H1: 32px/1.2/600 (Page titles)
- H2: 24px/1.3/600 (Section headers)
- H3: 20px/1.4/500 (Card titles)
- Body Large: 16px/1.5/400 (Primary content)
- Body: 14px/1.5/400 (Standard text)
- Caption: 12px/1.4/400 (Labels, metadata)
- Overline: 11px/1.3/500/uppercase (Category labels)

**Weight Strategy:**
- 400 Regular: Body text, descriptions
- 500 Medium: Subheadings, labels, emphasis
- 600 Semibold: Titles, headers, CTA buttons

---

## Layout System

**Spacing Primitives:** Use Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24, 32

**Spacing Strategy:**
- Component padding: p-4 (mobile), p-6 (tablet), p-8 (desktop)
- Section spacing: space-y-6 (mobile), space-y-8 (desktop)
- Card gaps: gap-4 (mobile), gap-6 (desktop)
- Page margins: px-4 (mobile), px-8 (tablet), px-12 (desktop)

**Grid System:**
- Container max-width: max-w-7xl (1280px)
- Dashboard: 12-column grid with 6-unit gaps
- Form layouts: max-w-2xl for readability
- Data tables: Full width with horizontal scroll on mobile

---

## Component Library

**Navigation:**
- Top app bar: Fixed, surface-variant background, 64px height, shadow on scroll
- Left sidebar (desktop): 240px width, collapsible to 64px icon-only
- Mobile: Bottom navigation bar (5 items max) or drawer menu
- Breadcrumbs: On all pages except dashboard home

**Cards & Containers:**
- Elevated cards: surface-variant background, rounded-lg (8px), shadow-sm
- Outlined cards: 1px outline border, no shadow (for secondary content)
- Dashboard widgets: Consistent 4:3 aspect ratio for charts
- Card padding: p-6 (desktop), p-4 (mobile)

**Forms:**
- Input fields: Filled variant (material design), outlined on focus
- Label above input, helper text below in caption size
- Field height: 56px (touch-friendly)
- Validation: Inline error messages with error color, success with checkmark icon
- Multi-step forms: Stepper component for self-assessment and 360 flows

**Buttons:**
- Primary: Filled, primary color, 44px height minimum, px-6 padding
- Secondary: Outlined, primary outline, same dimensions
- Text buttons: For tertiary actions, no background
- Icon buttons: 40px square, circular ripple effect
- Button labels: 500 weight, 14px size, uppercase tracking

**Data Visualization:**
- Radar chart: Primary (self) vs purple (360), 8-10 axis max, gridlines at 20% intervals
- Line charts: 2-3 series max per chart, distinct colors from palette
- Bar charts: Horizontal for competency comparisons, vertical for time series
- Pulse visualization: Stacked bar or line chart with 3 metrics, weekly granularity
- Chart legends: Below charts, horizontal layout, interactive toggles

**Feedback & Notifications:**
- Toast notifications: Bottom center, 4-second duration, dismissible
- Inline alerts: 4px left border, colored background at 10% opacity
- Empty states: Centered illustration, 2-line explanation, primary CTA
- Loading states: Circular spinner on primary color, skeleton screens for lists

**Role-play Chat (Feedback Buddy):**
- Message bubbles: User on right (primary container), AI on left (surface-variant)
- Avatar icons: 32px circles, user initials vs AI icon
- Timestamp: Caption size, on-surface-variant color
- Input: Fixed bottom, 56px height, send button integrated

**Dialogs & Modals:**
- Modal width: max-w-lg (512px), max-w-2xl for complex forms
- Header: H2 title, close button top-right
- Content: p-6 padding, scrollable if needed
- Actions: Right-aligned, primary + text button pattern
- Backdrop: Black at 40% opacity

**Tables:**
- Header row: Surface-variant background, 500 weight text
- Row height: 52px (comfortable), 40px (compact mode)
- Hover state: Surface-variant at 50% opacity
- Sortable columns: Caret icon, clickable header
- Row actions: Icon buttons revealed on hover (desktop)

---

## Animation Guidelines

**Use sparingly - only for functional feedback:**
- Page transitions: 200ms ease-in-out fade
- Chart loading: Smooth 600ms spring animation
- Button ripple: Material Design standard
- Drawer/modal: 250ms slide + fade
- Toast entry/exit: 200ms slide-up

**Prohibited:**
- Decorative parallax effects
- Auto-playing animations
- Continuous motion backgrounds
- Scroll-triggered animations (except lazy loading)

---

## Images

**Hero Section:** No large hero image - this is a utility application, not a marketing site. Dashboard is the entry point.

**Supporting Images:**
- Avatar placeholders: Colored circles with initials (no photos needed)
- Empty state illustrations: Simple, flat, single-color line drawings at 240px max width
- Onboarding graphics: Optional step-by-step visual guides at 320px width
- Icon library: Material Icons via CDN - use outline variant for consistency

**Image Strategy:** Minimal imagery. Focus on data visualization and functional UI components. Icons serve as visual anchors, not decorative photos.