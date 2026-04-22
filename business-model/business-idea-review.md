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

## Go-to-Market Strategy — Private Referral Network

**Model:** High-touch, few clients, big tickets. No public social media. Avoid exhausting energy on low-value inquiries from random browsers.

**Target clients:** People who just purchased property or completed home renovation — they must buy furniture, they're spending big, and they're at the decision point.

**Referral partners:**
- **Builders** — hand over clients at project completion when furniture buying begins
- **Real estate agents** — connect with recent property buyers who need to furnish
- **Private networking** — word-of-mouth through personal and community connections

**What's in it for partners:** Referral fee, reciprocal referrals, or value-add for their own clients ("we can also help you furnish your new home at factory-direct pricing").

**Two service models:**
- **Trip-takers:** Clients who want to visit Foshan in person. Market as a curated 3-day experience. Furniture savings of $5-15K easily justify trip cost.
- **Remote sourcing (higher volume, more scalable):** Client describes needs, you source on their behalf in Foshan, send photos/videos, negotiate, ship. Batch multiple clients per trip.

## What to Build

With referral-based acquisition, the app is a **client servicing tool**, not a discovery platform. Clients arrive pre-qualified through partners.

**What you need:**
1. **A polished pitch for referral partners** — one-pager or short deck: what you offer, what's in it for them, how the client handoff works.
2. **A simple, professional website** — not a product catalog. Just credibility. When a builder says "check out Furnigo," the client Googles you. They need to see a legit operation with photos of real furniture in real Australian homes.
3. **The client servicing app** — a private workspace per client: their wishlist, photos from the trip or your sourcing visits, communication, order status tracking.

**What you can skip:**
- Product discovery/browsing — clients come to you with needs, not to browse
- Public-facing AI chatbot — you're talking to them directly
- Complex admin portal — you're the only operator
- Real-time WebSocket chat — WeChat or WhatsApp for direct communication
- LLM routing / local AI — no volume to justify it

## Recommended Phased Approach

- **Phase 0:** Validate with zero custom code — use WeChat/WhatsApp for client communication, Notion/Airtable for wishlist tracking, Google Sheets for orders. Build referral partner relationships. Lead 1-2 real sourcing trips.
- **Phase 1:** Build a simple credibility website + client workspace app (Next.js). Core features: wishlist with photo upload and cost estimation, order status dashboard. Skip everything else.
- **Phase 2:** Add AI features after having real conversation data from 10-20 clients. Focus AI on wishlist summarization and cost estimation — the parts that save you time.

## Reaching Non-Chinese Australian Clients

**Reframe the pitch:**
- Lead with outcome (quality + 40-60% savings + customization), not mechanism (Foshan/China sourcing). "Factory-direct" resonates universally.

**Build trust visually:**
- Factory-to-living-room before/after photos, video walkthroughs of factories, real client home testimonials, material close-ups. Use these on the website and in pitch materials — not for social media grinding.

**Pricing transparency:**
- Non-Chinese Australians expect clear landed prices, not 5-component cost breakdowns.
- Show one delivered-to-door price including shipping, customs, delivery. Absorb margin variance to remove buyer uncertainty.
