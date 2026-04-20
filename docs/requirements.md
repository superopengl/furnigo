# Requirements

## Overview

Furnigo helps Australian residents buy home furniture from Foshan, China. The core service is arranging overseas trips where clients visit local shops and factories in person. Products are browsed in-app as inspiration and general guidance — actual selection, pricing, and purchasing happens on the ground during the trip. Prices shown are indicative ranges only, not fixed retail prices.

## Target Users

- **Clients:** Australian residents looking for quality home furniture sourced from Foshan, China
- **Human Agents:** Salespeople, tour guides, drivers, customer service reps operating in both Australia and China
- **Admins:** Internal Furnigo staff managing the platform via the admin portal

## Core Services

### 1. Product Inspiration
- Browse a curated (not exhaustive) selection of furniture examples from Foshan
- Products serve as style and price-range references, not exact purchase listings
- AI assistant helps clients articulate their style preferences and budget
- Agents share relevant product examples in chat during trip planning

### 2. In-Trip Shopping Assistant (Key Use Case)
- While visiting shops and factories in Foshan, clients use the app as a live shopping journal
- Client takes a photo of an item they like and posts it in the conversation with a memo
- Client can add wishlist items with photo, notes, price discussed, and quantity
- AI can summarize the full wishlist at any point during or after the trip
- AI provides total cost estimation including item prices and estimated shipping to Australia
- Agents can add notes or advice directly against wishlist items in chat

### 2. Overseas Trip Arrangement (Core Service)
- Arrange trips to Foshan furniture markets for clients
- Flight and hotel booking assistance
- Factory and shop visit scheduling
- Tour guide assignment
- Itinerary planning
- All actual product selection and pricing happens in-person during the trip

### 3. Purchase Guidance
- In-factory purchase support during the trip
- Quality inspection guidance
- Price negotiation tips
- Order consolidation from multiple factories

### 4. Shipping & Logistics
- Container consolidation and shipping from Foshan to Australia
- Shipping tracking with status updates
- Estimated delivery timelines

### 5. Customs Clearance
- Australian customs documentation
- Quarantine and biosecurity compliance
- Duty and tax calculation
- Clearance status tracking

### 6. Door-to-Door Delivery & Setup
- Last-mile delivery to client's home
- Furniture assembly and setup
- Damage inspection and claims

## Chat Experience

The core UX is a WeChat-style group chat thread per order/inquiry:

### Three Roles
- **Client** — the buyer
- **Assistant (AI)** — provides instant responses, promotions, summaries, and order management
- **Agent (Human)** — salesperson, tour guide, driver, or specialist who joins as needed

### Chat Capabilities
- Text messages, images, voice messages
- AI-generated conversation summaries (catch up on long threads)
- Promotional messages and product cards
- Order status cards (inline in chat)
- Seamless handoff between AI and human agents

## Authentication & Access

- **Invitation-only registration:** Clients must have a valid invitation code to register. Codes are distributed by agents or admins.
- **Passwordless login:** Users sign in via OTP (one-time password) sent to their mobile number or email. No passwords.
- **Long-lived sessions:** Mobile app tokens last 12 months. Users stay signed in unless they explicitly log out or their token is revoked.
- **Multi-device support:** Users can be signed in on multiple devices. They can view and revoke sessions.

## User Stories

### Client
- As a client, I want to register using an invitation code I received from a Furnigo agent
- As a client, I want to sign in with my phone number or email via OTP (no password)
- As a client, I want to stay signed in on my phone without re-authenticating frequently
- As a client, I want to browse furniture examples for style and price-range inspiration
- As a client, I want to describe my needs and get AI suggestions on what to look for on my trip
- As a client, I want to take a photo of an item in a shop and add it to my wishlist with a memo
- As a client, I want to ask the AI to summarize my wishlist and show a total cost estimate including shipping
- As a client, I want to track my order (placed during my trip) from factory to my front door
- As a client, I want to chat with a human agent when the AI can't help
- As a client, I want summaries of long chat threads so I can catch up quickly

### Human Agent
- As an agent, I want to see the AI's conversation summary before I join a thread
- As an agent, I want to be notified when a client needs human assistance
- As an agent, I want to send product cards in chat
- As an agent, I want to update order status from the field (factory, warehouse, delivery)

### Admin
- As an admin, I want to manage the product catalogue (add, edit, deactivate products)
- As an admin, I want to manage manufacturers and their product ranges
- As an admin, I want to generate and distribute invitation codes to prospective clients
- As an admin, I want to view and search all conversations across all clients
- As an admin, I want to intervene in a conversation by sending a message directly
- As an admin, I want to disable the AI in a specific conversation if needed
- As an admin, I want to view and manage all orders and their statuses
- As an admin, I want to see analytics on revenue, active users, and AI costs
- As an admin, I want to create and schedule promotions
- As an admin, I want to deactivate or force-logout any user

### System
- The AI should handle simple queries (FAQs, status checks) without human intervention
- The AI should escalate complex queries (complaints, custom orders) to human agents
- The system should route to local LLM for simple messages to save cost
- The system should use remote LLM (Claude API) for complex reasoning tasks
