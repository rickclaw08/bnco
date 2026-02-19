# Google Analytics 4 Setup Instructions

## How to Activate GA4 on ClawOps Website

1. Go to https://analytics.google.com
2. Create a new GA4 property for "ClawOps"
3. Set up a Web data stream with URL: https://clawops.com
4. Copy your Measurement ID (format: G-XXXXXXXXXX)
5. In `index.html` and `404.html`, find the placeholder `G-XXXXXXXXXX` and replace it with your actual Measurement ID
6. Commit and deploy

## What's Already Done

- GA4 script tags are added to both `index.html` and `404.html`
- They use the placeholder `G-XXXXXXXXXX` which needs to be replaced
- The gtag is configured with `send_page_view: true`

## Verification

After replacing the ID and deploying:
1. Visit your site
2. Check GA4 Realtime report to confirm data is flowing
3. Set up any custom events or conversions as needed
