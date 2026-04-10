# BenkyouLab Management System 🎌

Platform manajemen kursus bahasa Jepang — dibangun untuk edge dengan Cloudflare.

## ⚙️ Tech Stack

- **Frontend**: SvelteKit + TypeScript + Tailwind CSS v4
- **Backend**: SvelteKit API routes (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite) + Drizzle ORM
- **Auth**: Better Auth (session-based, httpOnly cookies)
- **Deployment**: Cloudflare Pages + Workers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account (for deployment)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database (Local)

```bash
# Create local D1 database
npx wrangler d1 create benkyoulab-db

# Update wrangler.toml with the database_id from the command above

# Generate migrations
npx drizzle-kit generate

# Apply migrations locally
npx wrangler d1 execute benkyoulab-db --local --file=./drizzle/0000_*.sql

# (Optional) Seed sample data
npx wrangler d1 execute benkyoulab-db --local --file=./seed.sql
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### Default Login (after seeding)

- **Admin**: admin@benkyoulab.com
- **Password**: Set via Better Auth registration or modify seed data

## 📦 Project Structure

```
src/
├── lib/
│   ├── components/        # UI components
│   │   ├── layout/        # Sidebar, Navbar
│   │   └── ui/            # Base components
│   ├── server/
│   │   ├── db/            # Schema, DB client
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Password, session utils
│   │   └── auth.ts        # Better Auth config
│   ├── auth-client.ts     # Client-side auth
│   └── utils/             # Shared utilities
├── routes/
│   ├── login/             # Auth pages
│   ├── logout/
│   └── (app)/             # Protected app pages
│       ├── dashboard/
│       ├── students/
│       ├── teachers/
│       ├── classes/
│       ├── payments/
│       └── reports/
├── hooks.server.ts        # Auth middleware
├── app.css                # Global styles + design tokens
└── app.d.ts               # Type declarations
```

## 🗄️ Database Schema

11 tables: `users`, `sessions`, `accounts`, `verifications` (Better Auth), `students`, `teachers`, `classes`, `class_sessions`, `enrollments`, `attendance`, `progress`, `invoices`, `payments`

## 🔐 Authentication

- **Better Auth** with Drizzle adapter + D1
- Session-based (httpOnly secure cookies)
- Roles: `owner`, `teacher`, `student`
- Per-request auth instance (D1 binding is request-scoped)

## 🚢 Deploy to Cloudflare

### 1. Create D1 Database

```bash
npx wrangler d1 create benkyoulab-db
# Copy the database_id to wrangler.toml
```

### 2. Set Up Environment Variables
Set up required secrets in your Cloudflare dashboard or via Wrangler CLI:
```bash
npx wrangler pages secret put BETTER_AUTH_SECRET
# Enter a secure random string for authentication
```
You also must configure your `wrangler.toml` specifying `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET` inside the `[vars]` section for the build.

*Note: The password hashing mechanism inside `src/lib/server/auth.ts` has been optimized using WebCrypto `PBKDF2` to bypass the Cloudflare Workers 50ms CPU strict limit (Error 1102) seamlessly.*

### 3. Apply Migrations (Remote)

```bash
npx drizzle-kit generate
npx wrangler d1 execute benkyoulab-db --remote --file=./drizzle/0000_*.sql
```

### 4. Deploy

```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare
```

## 📋 Features

- ✅ Student management (CRUD, JLPT levels, enrollment)
- ✅ Teacher management (CRUD, specialization, availability)
- ✅ Class scheduling (conflict detection, calendar view)
- ✅ Progress tracking (per session, per student)
- ✅ Payment & invoicing (confirmation-based, print-to-PDF)
- ✅ Dashboard (stats, recent activity, quick actions)
- ✅ Dark mode + responsive design
- ✅ Edge-optimized (Cloudflare Workers)

## 📝 License

Private — BenkyouLab © 2026
