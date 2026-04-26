# Requirements

## Overview

Furnigo helps Australian residents buy home furniture from Foshan, China. The core service is arranging overseas trips where clients visit local shops and factories in person. Products are browsed in-app as inspiration and general guidance — actual selection, pricing, and purchasing happens on the ground during the trip. Prices shown are indicative ranges only, not fixed retail prices.

## Target Users

- **Clients:** Australian residents looking for quality home furniture sourced from Foshan, China
- **Human Agents:** Salespeople, tour guides, drivers, customer service reps operating in both Australia and China
- **Admins:** Internal Furnigo staff managing the platform via the admin portal

## Core Services

### 1. Overseas Trip Arrangement (Core Service)
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

The core UX is a WeChat-style group chat chat per order/inquiry:

### Two Roles
- **Client** — the buyer
- **Agent (Human)** — salesperson, tour guide, driver, or specialist who joins as needed

### Chat Capabilities
- Text messages, images, voice messages
- Order status cards (inline in chat)

## Authentication & Access

- **Unified passwordless auth:** Users enter their email and verify via OTP. If the email is new, an account is created automatically. No separate registration or login flow.
- **Stateless JWT:** Token contains user ID and expiry (12 months), signed server-side. No backend token storage. Users stay signed in until the token expires.

## User Stories

### Client
- As a client, I want to enter my email and verify via OTP to sign in or create my account automatically
- As a client, I want to stay signed in on my phone without re-authenticating frequently
- As a client, I want to chat with a human agent

### Human Agent
- As an agent, I want to be notified when a client needs assistance

### Admin
- As an admin, I want to view and manage registered clients
- As an admin, I want to view and search all chats across all clients
- As an admin, I want to intervene in a chat by sending a message directly
- As an admin, I want to deactivate or force-logout any user

## Legal Requirements

### Privacy Policy
Furnigo collects and processes personal information for providing services, including but not limited to:
- Client contact details (name, email)
- Communication records from our chat support system  
- Furniture order information and preferences
- Payment information for transactions with manufacturers in China

We implement appropriate security measures to protect your personal information and comply with Australian privacy laws.

### Terms of Use
These terms govern the use of Furnigo's website, mobile application and services. They cover:
- Acceptable use of our Services
- Furniture ordering processes and transactions with Foshan manufacturers  
- Intellectual property rights
- User account responsibilities
- Limitation of liability
