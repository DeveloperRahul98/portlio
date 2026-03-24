# Portlio — Product Requirements Document

**Version:** 1.0
**Date:** 2026-03-24
**Author:** Solo Developer
**Status:** Active Development

---

## 1. Overview

### What is Portlio?
Portlio is a lightweight client portal SaaS for freelancers and small agencies. Freelancers create a shareable, branded portal per client — giving clients a real-time, beautiful view of their project: status, updates, files, and invoices. No more email threads. No more "what's the status?" messages.

### The Problem
Freelancers currently manage client communication across email, Google Drive, Notion, WhatsApp, and spreadsheets. This creates:
- Fragmented information clients can't easily access
- Repeated "what's happening with my project?" questions
- Unprofessional presentation that hurts trust
- Hours wasted on status update calls

### The Solution
One shareable link per client. That's it. The client opens the link and sees everything in one beautiful, organized view. No signup required for clients.

### Market Validation
Existing tools (Dubsado: $20-$40/mo, HoneyBook: $19-$39/mo, Notion: complex setup) are too expensive, too complex, or too generic for solo freelancers. Portlio is lean, focused, and affordable.

---

## 2. Target Users

### Primary User: The Freelancer / Agency (Paying Customer)
- **Who:** Freelance designers, developers, copywriters, marketers, video editors, consultants
- **Pain:** Loses hours managing client communication and looks unprofessional
- **Goal:** Impress clients, reduce admin overhead, get paid faster
- **Tech level:** Comfortable with web tools, not necessarily technical
- **Willingness to pay:** $10-$30/month for anything that saves 2+ hours/week

### Secondary User: The Client (End User, No Payment)
- **Who:** The freelancer's clients — small business owners, startup founders, marketing managers
- **Pain:** Never knows what's happening with their project
- **Goal:** Visibility into project progress without having to ask
- **Tech level:** Non-technical — needs zero-friction access (no login)
- **Experience:** Opens a link, immediately understands the project status

---

## 3. Core Features (MVP)

### Priority Legend
- 🔴 P0 — Must have for MVP launch
- 🟡 P1 — Important, ship in Week 3-4
- 🟢 P2 — Post-MVP, next iteration

---

### 3.1 Authentication (Freelancer)
| Feature | Priority | Notes |
|---------|----------|-------|
| Email + password signup | 🔴 P0 | Via Supabase Auth |
| Email + password login | 🔴 P0 | |
| Auth session persistence | 🔴 P0 | Middleware-protected routes |
| Google OAuth login | 🟢 P2 | Post-MVP |
| Password reset | 🟡 P1 | Via Supabase magic link |

### 3.2 Portal Management (Freelancer Dashboard)
| Feature | Priority | Notes |
|---------|----------|-------|
| Create a new portal | 🔴 P0 | Name, client email, project title, accent color |
| List all portals | 🔴 P0 | Cards showing status + last update |
| Edit portal settings | 🟡 P1 | Rename, change color |
| Delete portal | 🟡 P1 | With confirmation |
| Copy shareable link | 🔴 P0 | One-click copy button |
| Custom portal slug | 🟡 P1 | Auto-generated initially |

### 3.3 Project Status Tracker
| Feature | Priority | Notes |
|---------|----------|-------|
| 4-phase status: Kickoff → In Progress → Review → Complete | 🔴 P0 | |
| Freelancer can update status | 🔴 P0 | |
| Status visible on client view | 🔴 P0 | |
| Status change triggers email to client | 🟡 P1 | Via Resend |

### 3.4 Updates Feed
| Feature | Priority | Notes |
|---------|----------|-------|
| Freelancer posts text updates | 🔴 P0 | Markdown support |
| Updates shown as timeline on client view | 🔴 P0 | |
| Email notification to client on new update | 🟡 P1 | Via Resend |
| Delete/edit an update | 🟡 P1 | |
| Pin an update | 🟢 P2 | |

### 3.5 File Sharing
| Feature | Priority | Notes |
|---------|----------|-------|
| Freelancer uploads files to portal | 🔴 P0 | Via Supabase Storage |
| Client can download files | 🔴 P0 | Signed URLs |
| File type icons | 🔴 P0 | PDF, image, doc, etc. |
| Delete a file | 🟡 P1 | |
| Max file size: 50MB per file | 🔴 P0 | Supabase free tier limit |
| Drag and drop upload | 🟡 P1 | Via react-dropzone |

### 3.6 Invoice View
| Feature | Priority | Notes |
|---------|----------|-------|
| Create invoice with line items | 🔴 P0 | Item name + price |
| Auto-calculated total | 🔴 P0 | |
| Invoice status: Draft / Sent / Paid | 🔴 P0 | |
| Mark invoice as Sent | 🔴 P0 | Client can see it |
| Currency selection | 🟡 P1 | USD default |
| Invoice notes field | 🟡 P1 | Payment terms etc. |
| PDF export | 🟢 P2 | Post-MVP |
| Payment link (Stripe) | 🟢 P2 | Post-MVP |

### 3.7 Client Portal (Public View)
| Feature | Priority | Notes |
|---------|----------|-------|
| No login required for client | 🔴 P0 | Access by unique slug URL |
| Branded with accent color | 🔴 P0 | Set by freelancer |
| Shows: status, updates, files, invoice | 🔴 P0 | |
| Mobile responsive | 🔴 P0 | |
| SEO meta tags (project title) | 🟡 P1 | |
| Password protection option | 🟢 P2 | |

### 3.8 Email Notifications
| Feature | Priority | Notes |
|---------|----------|-------|
| Email to client when update posted | 🟡 P1 | Resend |
| Email to client when status changes | 🟡 P1 | Resend |
| "View portal" CTA in email | 🟡 P1 | |
| Email to freelancer when client views portal | 🟢 P2 | |

---

## 4. User Flows

### Flow 1: Freelancer Onboarding
```
Signup → Confirm email → Redirect to /dashboard → Empty state with "Create your first portal" CTA → Fill form → Portal created → Copy link → Share with client
```

### Flow 2: Freelancer Managing a Project
```
/dashboard → Click portal card → Portal management page → Post update → Upload files → Update status → Add invoice → Copy link (done)
```

### Flow 3: Client Viewing Their Portal
```
Receives link → Opens /portal/[slug] → Sees branded portal → Views status, updates, files, invoice → No login required
```

### Flow 4: Freelancer Sending Invoice
```
Portal management → Invoice tab → Add line items → Save → Change status to "Sent" → Client can now see invoice on their portal
```

---

## 5. Database Schema

```sql
-- profiles (extends Supabase auth.users)
profiles: id, full_name, avatar_url, created_at

-- clients (portals)
clients: id, user_id, name, email, company, portal_slug, accent_color, created_at

-- projects
projects: id, client_id, title, description, status, created_at, updated_at

-- updates (activity timeline)
updates: id, project_id, content, created_at

-- files
files: id, project_id, file_name, storage_path, file_size, file_type, created_at

-- invoices
invoices: id, project_id, line_items (jsonb), total, currency, status, notes, created_at
```

### Row Level Security (RLS)
- Freelancers can only CRUD their own data
- Client portal routes: public read-only access (by slug)
- Files: Supabase Storage with RLS on the bucket

---

## 6. Technical Architecture

```
Next.js 14 (App Router)
├── app/
│   ├── page.tsx                    → Landing page
│   ├── (auth)/login/               → Login
│   ├── (auth)/signup/              → Signup
│   ├── dashboard/                  → Portal list (protected)
│   ├── dashboard/new/              → Create portal (protected)
│   ├── dashboard/[slug]/           → Manage portal (protected)
│   └── portal/[slug]/              → Public client view
├── components/
│   ├── landing/                    → Hero, Features, Pricing
│   ├── dashboard/                  → Sidebar, PortalCard, CreateForm
│   └── portal/                    → Status, Updates, Files, Invoice
└── lib/
    ├── supabase/                   → Client + Server instances
    └── types.ts                    → TypeScript interfaces
```

### API Routes (Next.js Route Handlers)
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/portals` | POST | Required | Create new portal |
| `/api/portals/[slug]` | PATCH | Required | Update portal |
| `/api/updates` | POST | Required | Post new update |
| `/api/files/upload` | POST | Required | Upload file metadata |
| `/api/files/[id]` | DELETE | Required | Delete file |
| `/api/invoices` | POST/PATCH | Required | Create/update invoice |
| `/api/notify` | POST | Required | Send email via Resend |

---

## 7. UI/UX Design Principles

### Design Language
- **Dark-first theme** — Navy/indigo color palette (#030711 background)
- **Glass morphism** — Cards with backdrop-blur and semi-transparent backgrounds
- **Gradient accents** — Indigo-to-violet gradients for primary actions
- **Smooth animations** — Framer Motion spring animations for all interactions
- **Accent color system** — Each portal has a unique color that themes the client view

### Color System
| Token | Value | Usage |
|-------|-------|-------|
| `bg-base` | `#030711` | Page background |
| `bg-surface` | `#0F1729` | Card/panel backgrounds |
| `primary` | `#6366F1` | Buttons, links, active states |
| `primary-gradient` | `indigo-500 → violet-500` | Hero text, CTA |
| `border` | `rgba(99,102,241,0.2)` | Card borders |
| `text-primary` | `#F9FAFB` | Main text |
| `text-muted` | `#6B7280` | Secondary text |

### Typography
- Font: Geist Sans (Next.js default)
- Hero: 64px, font-black, gradient
- Section headers: 32-40px, font-bold
- Body: 16px, regular
- Labels: 12-14px, medium

### Component Patterns
- Portal cards: Glass card with left accent border in portal color
- Status phases: Horizontal pill steps with filled/outlined state
- Updates: Left-bordered timeline with animated entrance
- File cards: Icon + filename + size + download button
- Invoice rows: Clean table with subtle alternating rows

---

## 8. Monetization Strategy

### Pricing Tiers (Post-MVP)
| Tier | Price | Limits |
|------|-------|--------|
| **Free** | $0/mo | 1 active portal, 100MB storage |
| **Pro** | $15/mo | Unlimited portals, 5GB storage, custom colors |
| **Agency** | $49/mo | Team members, white-label, priority support |

### Revenue Projections
- 100 Pro users = $1,500/month
- 500 Pro users = $7,500/month (scale target)
- 50 Agency users = $2,450/month

### Distribution Channels
1. ProductHunt launch (free)
2. Twitter/X dev community
3. Indie Hackers post
4. Cold outreach to freelancer communities (Contra, Toptal)
5. SEO: "client portal for freelancers", "share project status with client"

---

## 9. Free Tool Stack

| Tool | Purpose | Free Limit |
|------|---------|-----------|
| Vercel | Hosting | Unlimited personal projects |
| Supabase | DB + Auth + Storage | 500MB DB, 1GB storage, 50MB files |
| Resend | Email | 3,000 emails/month |
| Next.js | Framework | Open source |
| shadcn/ui | UI components | Open source |
| Framer Motion | Animations | Open source |
| Tailwind CSS | Styling | Open source |
| GitHub | Version control | Free |

**Total cost to run MVP: $0/month**

---

## 10. Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Time to first portal | < 3 minutes |
| Demo completion rate | 100% (smooth demo for boss) |
| Mobile score (Lighthouse) | > 90 |
| Page load time | < 2s |
| Core features working | 100% P0 items |

---

## 11. Out of Scope (MVP)

- Stripe payments
- Real-time chat / messaging
- Multiple team members per account
- White-label / custom domain
- Mobile app (iOS/Android)
- Zapier / webhook integrations
- Time tracking
- Project contracts / e-signatures

---

## 12. Build Timeline

| Week | Focus |
|------|-------|
| **Week 1** | Auth, dashboard, portal creator |
| **Week 2** | Status tracker, updates feed, file upload, public client view |
| **Week 3** | Invoice builder, email notifications, polish |
| **Week 4** | Landing page, onboarding, deploy, demo prep |

---

## 13. Demo Script (For Boss)

1. **Open the landing page** — "This is Portlio, a client portal tool for freelancers"
2. **Sign up** as a freelancer (takes 10 seconds)
3. **Create a portal** for "Acme Corp" — pick a project title and blue accent color
4. **Post an update**: "Design mockups v1 are ready for your review"
5. **Upload a file**: design_mockup_v1.pdf
6. **Add an invoice**: "Design Services - $3,000" — mark as Sent
7. **Copy the portal link** and open it in a new tab (incognito)
8. **Show the client view**: beautiful, branded, no login — they see everything
9. **Ask the boss**: "What would you pay for this as a freelancer?" — answer is usually $15-20/month

---

*End of PRD — v1.0*
