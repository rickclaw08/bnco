# CHANGELOG - Visual Upgrade v2

**Date:** 2026-03-04
**Author:** Kai (Frontend Lead)

---

## Critical Bug Fix: Service Worker

- Changed `CACHE_NAME` to `'bnco-v4'`
- Removed pre-caching of static assets in the install event (no more `addAll`)
- Install event now only calls `skipWaiting()` for immediate activation
- Fetch event changed to **network-first for everything** (was cache-first for statics)
- Cache is now only used as fallback when network fails
- Users will always get fresh content after deploys

## Logo Redesign

- Designed a new single-path SVG logo evoking a flowing Pilates spine curve
- Path: `M6 26 C10 22, 12 16, 14 10 C15 6, 18 4, 21 6 C24 8, 22 14, 18 18 C14 22, 20 26, 26 24`
- Sage green (#7C9082), stroke-width 2.5, round caps/joins
- Clean at 16x16 (favicon) and 128x128
- Replaced in all 3 instances in `index.html` (landing nav, footer, app nav)
- Replaced in `public/favicon.svg`

## Background Animations

### 1. Floating Particles (Landing Page)
- 18 dedicated `.lp` particle divs in the landing section
- Pure CSS keyframe animation (`floatParticle`) - no JS
- Sage green dots with opacity 0.05-0.13
- Varying sizes (3-6px), durations (10-21s), and delays
- Float upward with slight horizontal drift

### 2. Gradient Wave Animation (Hero)
- Slow-moving gradient on `.landing__hero-bg`
- Shifts between cream (#F5F0EB), light sage (#E8EDE9), and soft pink (#F0E8E4)
- 20-second animation cycle using `background-position` animation
- Layered with existing radial gradients for depth

### 3. Scroll-Triggered Fade-Ins
- Added `.reveal` class to landing page sections: stats, values, testimonials, bottom CTA
- IntersectionObserver in main.js triggers `.reveal--visible` class
- Elements fade in and slide up (30px) with 0.8s transition
- Separate observer for landing page and app sections

### 4. Logo Breathing Animation
- Both landing nav and app nav logos have `logoBreathe` animation
- Scales 1.0 to 1.03 over 4-second cycle
- Subtle, almost imperceptible motion that adds life

### 5. Hover Ripple on Cards
- Value prop cards and testimonial cards have cursor-following radial gradient
- CSS `::before` pseudo-element with `radial-gradient(circle, rgba(124,144,130,0.12) ...)`
- JS tracks mouse position and sets `--mouse-x`/`--mouse-y` custom properties
- Fades in on hover, follows cursor

## 3D Depth Effects

### 1. Button Depth
- Primary buttons: `box-shadow: 0 4px 6px rgba(124,144,130,0.25), 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)`
- Hover: translateY(-2px) with stronger shadow lift
- Active: translateY(1px) with compressed shadow (press effect)

### 2. Text Shadows on Headings
- Landing page headings: `text-shadow: 0 2px 4px rgba(0,0,0,0.08)`
- Applied to: landing title, values heading, testimonials heading, bottom CTA title

### 3. Card Elevation
- Default: `box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)`
- Hover: `box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)` + translateY(-2px)
- Applied to all `.card` elements, value prop cards, testimonial cards

### 4. Glass Morphism on Auth Modal
- `backdrop-filter: blur(20px)`
- `background: rgba(255,255,255,0.85)`
- Creates a frosted glass effect over the backdrop

## Branding Cleanup

- Replaced all "BNCO Health" references with "BNCO"
- Fixed in: `ios/App/App/public/index.html` (title, footer)
- Fixed in: `ios/App/App/public/lobby.html` (title, footer)
- Verified: `grep -r "BNCO Health" dist/` returns zero matches

## Build Verification

- `npx vite build` exits successfully (code 0)
- `grep -r "BNCO Health" dist/` confirms zero references
- All 10 modules transformed, 6 output files generated
