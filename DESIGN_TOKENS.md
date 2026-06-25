# MedLive Healthcare — Design Tokens (Figma)

Use these tokens when building or syncing designs in Figma. All values match `src/app/globals.css`.

## Brand — Teal (Primary)

| Token | Hex | Usage |
|-------|-----|-------|
| primary-50 | `#f0fdfa` | Light backgrounds, hover states |
| primary-100 | `#ccfbf1` | Icon containers, secondary btn hover |
| primary-200 | `#99f6e4` | Borders, accents |
| primary-500 | `#14b8a6` | Focus rings, links |
| primary-600 | `#0d9488` | Primary buttons, badges |
| primary-700 | `#0f766e` | Button gradient end, nav active |
| primary-800 | `#115e59` | Announcement bar, CTA gradient |
| primary-900 | `#134e4a` | Dark accents |

## Neutrals

| Token | Hex | Usage |
|-------|-----|-------|
| surface | `#ffffff` | Cards, inputs |
| surface-muted | `#f8fafc` | Page sections, image bg |
| surface-subtle | `#f1f5f9` | Hover backgrounds |
| border | `#e2e8f0` | Card & input borders |
| text-primary | `#0f172a` | Headings, body |
| text-secondary | `#475569` | Descriptions |
| text-muted | `#94a3b8` | Placeholders, captions |

## Semantic

| Token | Hex |
|-------|-----|
| success | `#059669` |
| success-bg | `#ecfdf5` |
| danger | `#dc2626` |
| warning | `#d97706` |

## Typography

- **Font:** Plus Jakarta Sans (Google Fonts)
- **Weights:** 400 (body), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
- **Section eyebrow:** 12px / bold / uppercase / tracking 0.1em / primary-600
- **Section title:** 24–30px / bold / tracking -0.02em
- **Body:** 14px / regular
- **Product price:** 20px / extrabold

## Spacing & Layout

- **Container max-width:** 1280px (`max-w-7xl`)
- **Horizontal padding:** 16px mobile · 24px tablet · 32px desktop
- **Section vertical padding:** 48–64px
- **Card padding:** 16–20px
- **Grid gap (products):** 20px

## Border Radius

| Token | Value |
|-------|-------|
| radius-sm | 8px |
| radius-md | 12px |
| radius-lg | 16px |
| radius-xl | 20px |
| radius-2xl | 24px |
| radius-full | 9999px |

## Shadows

| Token | Value |
|-------|-------|
| shadow-xs | `0 1px 2px rgba(15,23,42,0.04)` |
| shadow-sm | `0 2px 8px rgba(15,23,42,0.06)` |
| shadow-md | `0 8px 24px rgba(15,23,42,0.08)` |
| shadow-primary | `0 8px 24px rgba(13,148,136,0.22)` |

## Components

### Primary Button
- Gradient: primary-600 → primary-700 (135°)
- Text: white, semibold
- Radius: 16px
- Shadow: shadow-primary
- Padding: 14px 32px (lg)

### Secondary Button
- Background: primary-50
- Border: 1px primary-200
- Text: primary-700

### Card
- Background: white
- Border: 1px border
- Radius: 20px
- Shadow: shadow-xs
- Hover: border primary-200, shadow-md, translateY -2px

### Input
- Border: 1px border
- Radius: 16px
- Focus: border primary-500 + ring 3px rgba(20,184,166,0.15)

### Sale Badge
- Gradient: #059669 → #10b981
- Text: white, bold, 11px

## Figma Setup Tips

1. Create color styles from the table above (name: `Primary/600`, etc.).
2. Create text styles for eyebrow, title, body, price.
3. Use Auto Layout with 8px base grid.
4. Component variants: Button (primary / secondary / ghost), Card (default / hover).
