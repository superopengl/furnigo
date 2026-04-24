---
name: Business idea review
description: Feasibility assessment of Furnigo as a one-man startup — scope concerns, phased approach, and strategy for reaching non-Chinese Australian clients
type: project
originSessionId: f06ca76c-5246-4a27-8857-c6410b584085
---
## Business Viability

- Core idea is sound: concierge furniture sourcing from Foshan for Australian buyers. Real pain point, high ticket sizes, good margins.
- This is a **service business with an app**, not a tech business. Revenue comes from executing trips/logistics, not from the software.
- Requires freight forwarder partnerships, customs broker relationships, and local delivery partners before any code matters.

## Technical Scope — Too Large for One Person

The original spec (React Native + Next.js admin + Fastify API + Agent Gateway + AWS infra) is 8-12 months full-time for one engineer. Specific over-engineering:
- AI agent gateway with local/remote LLM routing — premature optimization at zero users
- Full admin portal with 4 roles — only one admin exists
- Custom real-time WebSocket chat from scratch — massive effort
- 11-status order lifecycle and 9-status shipment tracking — manual process at launch

## Recommended Phased Approach

- **Phase 0:** Validate with zero custom code — use WeChat for chat, Notion/Airtable for catalog, Google Sheets for orders. Lead 1-2 real trips.
- **Phase 1:** Build only what WeChat can't do — simple Next.js web app (not React Native) with product browsing, wishlist + cost estimation, order status dashboard. Skip chat, admin portal, AI, real-time features.
- **Phase 2:** Add AI after having real conversation data from 10-20 clients. Skip local LLM routing until 1000+ messages/day.

## Reaching Non-Chinese Australian Clients

**Reframe the pitch:**
- Lead with outcome (quality + 40-60% savings + customization), not mechanism (Foshan/China sourcing). "Factory-direct" resonates universally.

**Build trust visually:**
- Factory-to-living-room before/after photos, video walkthroughs of factories, real client home testimonials, material close-ups.

**Two service models:**
- **Trip-takers (smaller audience):** Market as a curated 3-day experience. Price as a package. Furniture savings of $5-15K easily justify a $2-3K trip cost.
- **Remote sourcing (larger audience, more scalable):** Client describes needs, you source on their behalf from Foshan, send photos/videos, negotiate, ship. Batch multiple clients per trip. This is where volume is.

**Channels (not WeChat):**
- Instagram / TikTok — "factory vs. retail" comparison reels (viral format)
- Facebook home renovation / interior design groups
- Houzz / Pinterest — where people plan homes
- Google SEO/ads — "custom furniture Australia", "solid wood dining table Melbourne"
- Display homes / staging partnerships

**Pricing transparency:**
- Non-Chinese Australians expect clear landed prices, not 5-component cost breakdowns.
- Show one delivered-to-door price including shipping, customs, delivery. Absorb margin variance to remove buyer uncertainty.

**First validation step:**
- Create an Instagram account, post 10 factory-vs-retail comparisons. If non-Chinese Australians engage, you have a channel. No app needed to test this.
