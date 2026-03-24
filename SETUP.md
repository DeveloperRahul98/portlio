# Portlio — Setup Guide

## Prerequisites
- Node.js 18+
- A free [Supabase](https://supabase.com) account
- A free [Resend](https://resend.com) account (for email notifications)

---

## Step 1: Clone & Install

```bash
cd d:/Research/portlio
npm install
```

---

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name (e.g., `portlio`) and a strong password
3. Wait ~2 minutes for the project to be created

### Run the Database Schema

1. In your Supabase project → **SQL Editor** → **New query**
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

### Create the Storage Bucket

1. In Supabase → **Storage** → **New bucket**
2. Name: `portal-files`
3. Public: **OFF** (we use signed URLs)
4. File size limit: `52428800` (50MB)

Then run this in the SQL Editor:
```sql
create policy "Authenticated users can upload"
on storage.objects for insert to authenticated
with check (bucket_id = 'portal-files');

create policy "Owner can manage their files"
on storage.objects for all to authenticated
using (auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public can read with signed URL"
on storage.objects for select
using (bucket_id = 'portal-files');
```

### Get Your API Keys

1. Supabase project → **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 3: Set Up Resend (Email Notifications)

1. Go to [resend.com](https://resend.com) → Sign up free
2. **API Keys** → Create new key
3. Copy the key → `RESEND_API_KEY`

---

## Step 4: Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 5: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 6: Deploy to Vercel (Free)

1. Push your code to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **Import Project**
3. Select your repo
4. Add all environment variables from `.env.local`
5. Change `NEXT_PUBLIC_APP_URL` to your Vercel URL
6. Deploy!

---

## Demo Script (For Your Boss)

1. Open the app → Landing page
2. Click **Get started free** → Sign up
3. Click **New Portal**
4. Fill in: Client = "Acme Corp", Project = "Website Redesign", pick blue
5. Click **Create portal**
6. Post an update: "Initial wireframes are ready for review"
7. Go to **Files** tab → Upload a PDF
8. Go to **Invoice** tab → Add "Design Services" for $3000 → Save
9. Click **Copy link** at the top
10. Open the link in an incognito tab
11. Show your boss: beautiful, branded client portal, no login needed

**Pitch**: "This is what $15/month looks like. Competitors charge $200+."

---

## Project Structure

```
portlio/
├── app/
│   ├── page.tsx              → Landing page
│   ├── (auth)/               → Login + Signup
│   ├── dashboard/            → Freelancer portal management
│   └── portal/[slug]/        → Public client view
├── components/
│   ├── landing/              → Hero, Features, Pricing
│   ├── dashboard/            → Sidebar, PortalCard, CopyLink
│   └── portal/               → StatusTracker, Updates, Files, Invoice
├── lib/
│   ├── supabase/             → Client + Server instances
│   └── types.ts              → TypeScript interfaces
├── supabase/
│   └── schema.sql            → Full DB schema with RLS
├── PRD-Portlio.md            → Full Product Requirements Doc
└── SETUP.md                  → This file
```
