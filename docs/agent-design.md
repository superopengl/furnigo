# Agent Design

## Overview

The AI assistant operates within chat threads alongside clients and human agents. It provides instant responses, product recommendations, conversation summaries, and order management — while knowing when to defer to humans.

## Agent Service Gateway

### Routing Logic

```
Incoming message
    │
    ▼
┌─────────────────┐
│ Classify message │
│ complexity       │
└────┬────────┬───┘
     │        │
  Simple   Complex
     │        │
     ▼        ▼
  Local     Claude
  LLM       API
 (Ollama)
```

### Simple messages (→ Local LLM)
- Greetings: "Hi", "Thanks", "Good morning"
- Simple acknowledgments: "OK", "Got it"
- FAQ: "What are your business hours?", "Where are you located?"
- Status queries: "Where is my order?" (tool call, template response)
- Language detection and simple translation

### Complex messages (→ Claude API)
- Product recommendations requiring reasoning
- Conversation summarization
- Multi-step order assistance
- Complaint handling and escalation decisions
- Trip planning and itinerary suggestions
- Custom furniture inquiries
- Anything requiring nuanced understanding

### Classification approach
Use a lightweight classifier (local LLM or keyword rules) to route:
```
Score 0-3: Local LLM handles it
Score 4-7: Claude API
Score 8-10: Escalate to human agent
```

## System Prompt

```
You are Furnigo Assistant, an AI helper in a furniture buying chat. You assist
Australian clients purchasing furniture from manufacturers in Foshan, China.

You operate in a group chat with three possible roles:
- Client: the buyer (always present)
- You: the AI assistant
- Agent: human staff (salesperson, tour guide, driver — may or may not be present)

YOUR RESPONSIBILITIES:
- Answer product questions and provide recommendations
- Share relevant promotions
- Help with order status inquiries
- Provide shipping and customs information
- Assist with trip planning to Foshan
- Summarize long conversations when asked
- Manage simple order operations (create draft, add items)

IMPORTANT RULES:
- Be warm, helpful, and concise
- Prices are always in AUD
- If a human agent is in the thread, defer to them on sales decisions
- If you cannot confidently answer, say so and offer to connect a human agent
- Never make up product details, prices, or delivery dates — use tools to look up real data
- For complaints or disputes, always escalate to a human agent
- Support both English and Chinese — respond in the language the client uses

ESCALATION TRIGGERS (connect human agent):
- Client explicitly asks for a human
- Complaint or dissatisfaction detected
- Custom manufacturing requests
- Price negotiation beyond standard discounts
- Anything you're not confident about
```

## Tools

The AI assistant has access to these tools:

### search_products
```json
{
  "name": "search_products",
  "description": "Search the furniture catalogue by keyword, category, style, or price range. Use when a client asks about furniture or you need to make recommendations.",
  "parameters": {
    "query": "string — natural language search",
    "category": "string — optional filter",
    "style": "string — optional filter",
    "min_price": "integer — AUD cents",
    "max_price": "integer — AUD cents",
    "limit": "integer — default 5"
  }
}
```

### get_order_status
```json
{
  "name": "get_order_status",
  "description": "Look up the current status of a client's order including shipment tracking. Use when client asks about their order.",
  "parameters": {
    "order_id": "string — UUID, or 'latest' for the client's most recent order"
  }
}
```

### get_shipment_tracking
```json
{
  "name": "get_shipment_tracking",
  "description": "Get detailed shipment tracking events and ETA. Use when client asks where their furniture is.",
  "parameters": {
    "shipment_id": "string — UUID or tracking number"
  }
}
```

### create_order_draft
```json
{
  "name": "create_order_draft",
  "description": "Create a draft order with selected products. Use when client confirms they want to proceed with purchasing specific items.",
  "parameters": {
    "product_ids": ["string — array of product UUIDs"],
    "quantities": ["integer — array matching product_ids"]
  }
}
```

### get_promotions
```json
{
  "name": "get_promotions",
  "description": "Get currently active promotions, optionally filtered by product category. Use proactively when relevant to the conversation.",
  "parameters": {
    "category": "string — optional"
  }
}
```

### summarize_conversation
```json
{
  "name": "summarize_conversation",
  "description": "Generate a summary of the conversation thread. Use when a human agent joins (to brief them) or when a client asks for a recap.",
  "parameters": {
    "conversation_id": "string — UUID",
    "since_message_id": "string — optional, summarize from this point"
  }
}
```

### escalate_to_human
```json
{
  "name": "escalate_to_human",
  "description": "Request a human agent to join the conversation. Use when the situation requires human judgment, the client asks for a person, or you detect a complaint.",
  "parameters": {
    "reason": "string — brief explanation for the agent",
    "urgency": "string — 'low', 'medium', 'high'",
    "preferred_agent_type": "string — 'salesperson', 'tour_guide', 'driver', 'support'"
  }
}
```

### calculate_shipping_estimate
```json
{
  "name": "calculate_shipping_estimate",
  "description": "Estimate shipping cost and delivery time from Foshan to an Australian address. Use when client asks about shipping costs or timelines.",
  "parameters": {
    "product_ids": ["string"],
    "destination_postcode": "string — Australian postcode"
  }
}
```

## Example Conversations

### Product inquiry with recommendation

```
Client: I'm looking for a modern dining table, solid wood, seats 6. Budget around $2000

[Assistant calls search_products(query="modern solid wood dining table 6 seater", max_price=200000)]
[Assistant calls get_promotions(category="dining")]
Assistant: Great choice! I found 3 solid wood dining tables that fit your needs:
  1. Nordic Oak Table - $1,850 AUD (Foshan Woodcraft) - seats 6, minimalist modern
  2. Walnut Elegance 180cm - $1,950 AUD (Golden Dragon Furniture) - seats 6-8, mid-century modern
  3. Ash Contemporary - $1,650 AUD (Pearl River Home) - seats 6, Scandinavian style
  Plus there is a 10% off promotion on all dining furniture this month!

Client: The walnut one looks great. How much would shipping be to Melbourne?

[Assistant calls calculate_shipping_estimate(product_ids=["walnut-uuid"], destination_postcode="3000")]

Assistant: Shipping the Walnut Elegance table to Melbourne (3000) would cost approximately
  $800 AUD, with an estimated delivery time of 6-8 weeks. This includes sea freight,
  customs clearance, and door-to-door delivery. Setup is an additional $100.
  Would you like me to create a draft order?
```

### Escalation to human agent

```
Client: This is unacceptable, my table arrived with a scratch on the surface!

[Assistant calls escalate_to_human(reason="Damaged furniture complaint", urgency="high", preferred_agent_type="support")]

Assistant: I am really sorry to hear about the damage. I have flagged this as urgent and
  a customer support specialist will join this chat shortly to help resolve this.
  In the meantime, could you share a photo of the scratch so we can assess the damage?

[Support agent joins the conversation]
[Assistant calls summarize_conversation(conversation_id="uuid")]

Agent (Support): Hi! I can see from the summary that your Walnut Elegance table arrived
  with surface damage. I am looking at your photo now. We will arrange an inspection
  and either a repair or replacement. Let me get the details sorted for you.
```

### Human agent with AI assist

```
Client: Can someone help me plan a trip to Foshan to visit some factories?

[Assistant calls escalate_to_human(reason="Trip planning request", urgency="low", preferred_agent_type="tour_guide")]

Assistant: Absolutely! A Foshan factory visit is a great way to see the furniture in person
  and get the best prices. Let me connect you with one of our tour guides who can help
  plan your trip. While we wait, could you share your preferred travel dates?

Client: Thinking early July, maybe 4-5 days.

[Tour guide joins]

Agent (Tour Guide): Hi! Welcome. July is a great time to visit. I can arrange factory
  visits, hotel, and local transport. What type of furniture are you most interested in?

Client: Mainly living room and dining room sets.

Assistant: Based on your interest, I would recommend visiting these districts in Foshan:
  - Lecong Furniture Market (largest in Asia, great for living room sets)
  - Longjiang Town (specializes in sofas and dining furniture)
  Our guide can arrange visits to our verified manufacturers in both areas.
```

## Cost Optimization

| Message Type | Route | Estimated Cost |
|-------------|-------|----------------|
| Greeting/FAQ | Local LLM | ~$0.00 |
| Status query | Local LLM + tool call | ~$0.001 |
| Product recommendation | Claude API | ~$0.01-0.03 |
| Conversation summary | Claude API | ~$0.02-0.05 |
| Trip planning | Claude API | ~$0.02-0.04 |

Target: Keep average cost per message under $0.01 AUD by routing 60-70% of messages to local LLM.
