# Theme Guide

Design system for theclawops.com. All pages must follow these standards.

## Colors

### Primary Palette
- **Background:** Dark navy (#0a0a1a or similar deep dark)
- **Accent:** Light green (#4ade80) - used for CTAs, highlights, active states
- **Text Primary:** White (#ffffff) or near-white (#f0f0f0)
- **Text Secondary:** Gray (#9ca3af or similar muted gray)
- **Card/Section BG:** Slightly lighter navy (#111827 or similar)

### Usage Rules
- Green (#4ade80) for: buttons, links, highlights, borders on hover, active indicators
- Never use green for large text blocks (readability)
- Cards/sections: subtle border or shadow to distinguish from background
- Error states: red (#ef4444)
- Warning states: amber (#f59e0b)

## Typography

### Fonts
- Check repo for specific font imports (likely system fonts or Google Fonts)
- Headings: Bold, larger sizes, clear hierarchy
- Body: Regular weight, readable size (16px minimum)
- Code/technical: Monospace font

### Hierarchy
- H1: Page title, one per page
- H2: Section headers
- H3: Sub-sections
- Body: 16px minimum, 1.5-1.7 line height
- Small text: 14px minimum (never smaller)

## Layout

### Page Structure
```
[Navigation Bar]
  - Logo (left)
  - Nav links (center or right)
  - CTA button (right, green)

[Hero Section]
  - Large heading
  - Subtext
  - Primary CTA button

[Content Sections]
  - Alternating layouts
  - Cards for features/services
  - Proper spacing (padding: 4-8rem vertical)

[Footer]
  - Links (legal, social)
  - Copyright
  - Secondary CTA
```

### Responsive Breakpoints
- Mobile: < 768px (single column, stacked layout)
- Tablet: 768px - 1024px (adjusted grid)
- Desktop: > 1024px (full layout)

### Spacing
- Section padding: 4rem (mobile) to 8rem (desktop) vertical
- Content max-width: 1200px, centered
- Card gap: 1.5-2rem
- Button padding: 0.75rem 2rem

## Components

### Buttons
```css
/* Primary CTA */
background: #4ade80;
color: #0a0a1a;
padding: 0.75rem 2rem;
border-radius: 0.5rem;
font-weight: 600;
transition: all 0.2s;

/* Hover */
background: #22c55e;
transform: translateY(-2px);
```

### Cards
```css
background: #111827;
border: 1px solid rgba(74, 222, 128, 0.1);
border-radius: 0.75rem;
padding: 2rem;

/* Hover */
border-color: rgba(74, 222, 128, 0.3);
```

### Forms
```css
input, textarea {
  background: #1a1a2e;
  border: 1px solid #333;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}

input:focus {
  border-color: #4ade80;
  outline: none;
}
```

### Navigation
- Fixed or sticky at top
- Semi-transparent background with backdrop blur
- Logo on left, links centered or right
- Mobile: hamburger menu

## Animations

- Subtle transitions on hover (0.2-0.3s)
- No excessive animations (performance + professionalism)
- Animated crab logo: OpenClaw-inspired, keep lightweight
- Scroll-triggered fade-ins acceptable (subtle)

## Imagery

- All images must have alt text
- Optimize images (compress, use WebP when possible)
- Lazy load below-the-fold images
- Icons: use SVG or icon font (consistent style)

## Accessibility

- Color contrast ratio: 4.5:1 minimum for text
- Focus indicators visible on all interactive elements
- Semantic HTML (header, main, section, footer, nav)
- aria-labels on icon-only buttons
- Skip navigation link for screen readers

## Brand Voice (Content)

- Direct, clear, confident
- No em dashes
- Short paragraphs
- Action-oriented headlines
- Specific numbers over vague claims
