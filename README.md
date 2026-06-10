# SQL Tutor 2.0 (Relational Telemetry & Learning Console)

SQL Tutor 2.0 is a production-grade, full-stack monorepo learning platform designed to teach SQL interactively through hands-on challenge execution. Built with a responsive, skeuomorphic hardware console aesthetic (Space Grotesk typography, CRT scanlines, rotating radar sweepers, and gold/cyan accent glows), it provides a premium space telemetry dashboard layout. 

**Core platform features (such as running queries, unlocking curriculum maps, tracking streaks, and managing workspaces) work 100% locally and do not require AI keys.**

---

## 🚀 Key Features &  UX Optimizations

### 1. Unified Hardware Telemetry Console
* **Full-Screen Edge-to-Edge Grid**: The main dashboard features a borderless, full-screen viewport layout that scales perfectly across devices, presenting database telemetry in a highly engaging hardware console chassis.
* **5-Column KPI Dashboard**:
  * **Relay Link**: Live database connection status indicator.
  * **Daily Streak**: Dynamic tracker showing consecutive days active (Flame status).
  * **Daily Target**: Daily `0/1` challenge solves tracker (Bullseye target).
  * **Weekly Goal**: Weekly `0/5` solves milestone tracker.
  * **Console Rank**: Combined Level & total XP telemetry.
* **Tactile CRT Radar Screen**: A dark terminal screen displaying dynamic sync stats, completion cycles, and frame rates layered under rotating radar sweeper animations and CRT scanline filters.
* **Manual Override Controls**: A interactive toggle switch controlling manual telemetry overrides.

### 2. Dual Off-White & Dark Themes
* **Stillwater-Inspired Light Mode**: Features a premium warm off-white/sandy canvas (`#F4EFE5`) matching minimal design aesthetics, layered with faint gold-brown grid lines and soft corner radial glows.
* **Flexible Theme Adaptation**: Core Tailwind classes (`bg-bg`, `bg-surface`, `border-border`, `text-muted`, `text-accent`) are mapped directly to CSS custom properties. Toggling theme states instantly recalculates all component colors, input borders, tables, select boxes, and chassis elements.
* **Tactile Theme Toggler**: Clickable Sun/Moon buttons are integrated in both the global navigation bar and the skeuomorphic console header, syncing theme settings automatically with browser `localStorage`.

### 3. High-Performance API Caching
* **Instant Client-Side Navigation**: Integrates an in-memory promise caching layer for all API GET requests (such as paths, progress summaries, and datasets). This eliminates loading flashes, skeleton delays, and layout shifts during navigation.
* **Auto-Invalidation**: Mutation actions (such as POST attempts, user sign-in, or logout) automatically flush the cache to guarantee real-time data syncs immediately when progress updates.

### 4. Interactive Level Map & Challenge Player
* **Level Roadmap Grid**: An interactive game roadmap that renders all 50 levels as bubble paths. Completed levels show checks, current levels glow with their track colors, and locked levels display padlock overrides.
* **In-Challenge Progress Tracker**: Renders the active module path sequence directly under instructions inside the challenge player, allowing students to check off levels or replay completed sections without returning to the main menu.
* **Automated Next Navigation**: Shows an automated `Next Challenge →` link immediately inside success banners upon successful query execution, facilitating fluid progression.

### 5. Multi-Layer SQL Validation
* **AST & Structure Engine**: Validates queries not only by checking database return rows but also performing Abstract Syntax Tree (AST) structure analysis to check for the correct use of aggregates, JOIN operations, subqueries, and grouping expressions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend client** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Monaco Code Editor, Lucide Icons |
| **Backend API** | NestJS, Prisma ORM, SQLite (local development) / PostgreSQL support (production) |
| **SQL Engine** | `sql.js` (WebAssembly-based SQLite database runner executing inside the browser) |
| **Monorepo** | npm Workspaces |

---

## 📁 Repository Structure

```text
sql-tutor/
├── apps/
│   ├── api/            # NestJS API backend (Auth, Progress, AI, Challenges)
│   └── web/            # Next.js web application (Dashboard, Paths, Workspace, Settings)
├── packages/
│   ├── shared/         # Common TypeScript interfaces, mock datasets, and 50 challenges
│   └── validation/     # AST parser and query validation engine
├── src/                # Legacy Vite prototype files (index.html, App.jsx)
├── package.json        # Workspace monorepo setup
└── .gitignore          # Repository security configurations
```

---

## ⚙️ Environment Configuration

1. Copy `.env.example` in the project root to `.env`.
2. Copy `apps/api/.env.example` to `apps/api/.env` (or configure parameters inside the root `.env`).
3. Set the following parameters:
   * `PORT=4000`: Port for the API backend.
   * `DATABASE_URL="file:./dev.db"`: Development SQLite database path.
   * `JWT_SECRET`: Secret token signature key.
   * `AI_ENABLED=false`: Set to `true` only if you want to configure optional AI debugger help.
   * `AI_PROVIDER` / `AI_API_KEY`: API parameters for Claude (Anthropic), OpenAI, or Gemini (Google) if AI is enabled.

---

## 🏃 Local Setup & Running Commands

### 1. Install Dependencies
Install all packages and workspaces from the monorepo root:
```bash
npm install
```

### 2. Build Shared Libraries
Compile the workspace shared libraries required by the NestJS and Next.js applications:
```bash
npm run build -w @sql-tutor/shared
npm run build -w @sql-tutor/validation
```

### 3. Initialize the Database
Configure, push, and seed the local SQLite database. The seed script populates 3 rich relational datasets (HR Database, E-Commerce Store, Public Library) and creates the curriculum maps:
```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes to SQLite
npm run db:push

# Run seed scripts
npm run db:seed
```

### 4. Run Development Servers
Start both the backend API and frontend Next.js server in development mode:
```bash
# Start NestJS API (port 4000) & Next.js Web App (port 3000) concurrently
npm run dev
```

* **Web UI Console**: [http://localhost:3000](http://localhost:3000)
* **API Telemetry Endpoint**: [http://localhost:4000/v1](http://localhost:4000/v1)

---

## 🔒 Security Configuration

The project root [.gitignore](./.gitignore) file ignores:
* Local environment files (`.env`, `.env.local`, `.env.*`).
* Personal certificates, tokens, and SSL keys (`*.pem`, `*.key`, `secrets.json`, etc.).
* SQLite database binaries and transactional logs (`*.db`, `*.db-journal`).
* Editor configs (`.idea/`, `.vscode/settings.json`) and system metadata (`.DS_Store`).
