# Fortress Fund — Copilot Instructions

You are building Fortress Fund, a production-grade wealth management and investment platform.
Repository: mustardir/fantastic-couscous
Website: fortress-fund.com

## Tech Stack
- Next.js 14 App Router + TypeScript (strict mode)
- pnpm monorepo + Turborepo
- shadcn/ui + Tailwind CSS v4
- Prisma 5 + Neon PostgreSQL
- iron-session (auth)
- bcryptjs (password hashing)
- Zod (validation)
- Recharts (charts)
- Vercel (deployment)
- t3-env (env validation)

## Monorepo Structure
```text
fantastic-couscous/
├── apps/
│   ├── web/                         ← investor frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   └── register/page.tsx
│   │   │   │   ├── (dashboard)/
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── dashboard/page.tsx
│   │   │   │   │   ├── accounts/page.tsx
│   │   │   │   │   ├── transactions/page.tsx
│   │   │   │   │   ├── investments/page.tsx
│   │   │   │   │   ├── analytics/page.tsx
│   │   │   │   │   ├── transfers/page.tsx
│   │   │   │   │   ├── budgets/page.tsx
│   │   │   │   │   ├── cards/page.tsx
│   │   │   │   │   ├── settings/page.tsx
│   │   │   │   │   └── notifications/page.tsx
│   │   │   │   ├── api/
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   ├── login/route.ts
│   │   │   │   │   │   ├── logout/route.ts
│   │   │   │   │   │   └── me/route.ts
│   │   │   │   │   ├── dashboard/route.ts
│   │   │   │   ���   ├── accounts/route.ts
│   │   │   │   │   ├── transactions/route.ts
│   │   │   │   │   ├── investments/route.ts
│   │   │   │   │   ├── analytics/route.ts
│   │   │   │   │   ├── transfers/route.ts
│   │   │   │   │   └── notifications/route.ts
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/              ← shadcn components
│   │   │   │   ├── dashboard/       ← dashboard widgets
│   │   │   │   ├── auth/            ← login/register forms
│   │   │   │   └── shared/          ← navbar, sidebar, footer
│   │   │   ├── lib/
│   │   │   │   ├── session.ts       ← iron-session config
│   │   │   │   ├── auth.ts          ← auth helpers
│   │   │   │   └── utils.ts         ← cn() and helpers
│   │   │   ├── hooks/
│   │   │   │   └── useSession.ts    ← client auth hook
│   │   │   └── env.ts               ← t3-env validation
│   │   ├── package.json             ← name: "web"
│   │   └── next.config.ts
│   └── admin/                       ← admin panel
│       ├── src/
│       │   ├── app/
│       │   │   ├── login/page.tsx
│       │   │   ├── (admin)/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── dashboard/page.tsx
│       │   │   │   ├── users/page.tsx
│       │   │   │   ├── transactions/page.tsx
│       │   │   │   └── investments/page.tsx
│       │   │   └── api/
│       │   │       ├── auth/login/route.ts
│       │   │       ├── users/route.ts
│       │   │       ├── transactions/route.ts
│       │   │       └── investments/route.ts
│       │   └── lib/
│       │       └── session.ts
│       └── package.json             ← name: "admin"
├── packages/
│   └── db/
│       ├── prisma/
│       │   └── schema.prisma
│       ├── index.ts                 ← exports prisma client
│       └── package.json             ← name: "@fortress/db"
├── turbo.json
├── pnpm-workspace.yaml
└── .github/
    └── copilot-instructions.md
```

## Environment Variables
Managed on Vercel. Pulled locally with: vercel env pull apps/web/.env.local
Always import from "@/env", NEVER use process.env directly.

```ts
// apps/web/src/env.ts
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),
    SESSION_SECRET: z.string().min(32),
    NODE_ENV: z.enum(["development", "test", "production"])
      .default("development"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_APP_NAME: z.string().default("Fortress Fund"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
```

## Prisma Schema
```prisma
// packages/db/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id           String        @id @default(cuid())
  email        String        @unique
  passwordHash String
  role         Role          @default(USER)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  profile      UserProfile?
  wallets      Wallet[]
  transactions Transaction[]
  investments  Investment[]
  auditLogs    AuditLog[]
}

model UserProfile {
  id        String  @id @default(cuid())
  userId    String  @unique
  fullName  String?
  phone     String?
  address   String?
  avatarUrl String?
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Wallet {
  id           String        @id @default(cuid())
  userId       String
  currency     String        @default("USD")
  balance      Decimal       @default(0) @db.Decimal(18, 2)
  createdAt    DateTime      @default(now())
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
}

model Transaction {
  id          String            @id @default(cuid())
  userId      String
  walletId    String
  type        TransactionType
  amount      Decimal           @db.Decimal(18, 2)
  description String?
  status      TransactionStatus @default(PENDING)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  wallet      Wallet            @relation(fields: [walletId], references: [id])
}

model Investment {
  id        String           @id @default(cuid())
  userId    String
  name      String
  type      InvestmentType
  amount    Decimal          @db.Decimal(18, 2)
  returns   Decimal          @default(0) @db.Decimal(18, 2)
  status    InvestmentStatus @default(ACTIVE)
  startDate DateTime         @default(now())
  endDate   DateTime?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String
  meta      Json?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}

enum Role {
  USER
  ADMIN
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  TRANSFER
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
}

enum InvestmentType {
  STOCKS
  BONDS
  CRYPTO
  REAL_ESTATE
  FUND
}

enum InvestmentStatus {
  ACTIVE
  CLOSED
  PENDING
}
```

## Auth System

```ts
// apps/web/src/lib/session.ts
import { getIronSession, SessionOptions } from "iron-session"
import { cookies } from "next/headers"
import { env } from "@/env"

export interface SessionData {
  userId: string
  email: string
  role: "USER" | "ADMIN"
}

export const sessionOptions: SessionOptions = {
  cookieName: "fortress-session",
  password: env.SESSION_SECRET,
  cookieOptions: {
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session.userId) {
    return null
  }
  return session
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session.userId || session.role !== "ADMIN") {
    return null
  }
  return session
}
```

```ts
// apps/web/src/middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const session = request.cookies.get("fortress-session")

  if (!isPublic && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
}
```

## API Response Format
Every API route must return this exact shape:
```ts
// Success
return Response.json({ success: true, data: result })

// Error
return Response.json({ success: false, error: "message" }, { status: 400 })

// Unauthorized
return Response.json({ success: false, error: "Unauthorized" }, { status: 401 })
```

## API Route Template
Every API route must follow this exact pattern:
```ts
import { prisma } from "@fortress/db"
import { getSession } from "@/lib/session"
import { z } from "zod"

// GET example
export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await prisma.something.findMany({
      where: { userId: session.userId }
    })
    return Response.json({ success: true, data })
  } catch (error) {
    return Response.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

// POST example with Zod
const schema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1).max(255),
})

export async function POST(req: Request) {
  const session = await getSession()
  if (!session.userId) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ success: false, error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const data = await prisma.something.create({
      data: { userId: session.userId, ...parsed.data }
    })
    return Response.json({ success: true, data })
  } catch (error) {
    return Response.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
```

## Page → API Mapping
Replace ALL seed.ts imports with real API calls:

| Page | API Route | Method |
|---|---|---|
| dashboard | /api/dashboard | GET |
| accounts | /api/accounts | GET |
| transactions | /api/transactions?page=1&limit=20 | GET |
| investments | /api/investments | GET |
| analytics | /api/analytics | GET |
| transfers | /api/transfers | GET + POST |
| budgets | /api/budgets | GET + POST |
| cards | /api/cards | GET |
| settings | /api/settings | GET + PATCH |
| notifications | /api/notifications | GET + PATCH |

## Demo Accounts (seed data)
- investor@fortress-fund.com / password: Demo1234!
- admin@fortress-fund.com / password: Admin1234!

## Coding Rules — NEVER break these
1. Never use `any` type
2. Never use process.env — always import from "@/env"
3. Never import from seed.ts
4. Never create PrismaClient directly — import from "@fortress/db"
5. Never use float for money — always Decimal
6. Never skip Zod validation on POST/PATCH routes
7. Never skip auth check on any API route
8. Always use Server Components by default
9. Only add "use client" when using useState/useEffect/event handlers
10. Always handle loading and error states on every page
11. Admin routes must verify session.role === "ADMIN"
12. All Decimal values use .toNumber() only for display

## Build Order
Generate files in this exact order:
1. packages/db/prisma/schema.prisma
2. packages/db/index.ts
3. apps/web/src/env.ts
4. apps/web/src/lib/session.ts
5. apps/web/src/middleware.ts
6. apps/web/src/app/api/auth/login/route.ts
7. apps/web/src/app/api/auth/logout/route.ts
8. apps/web/src/app/api/auth/me/route.ts
9. apps/web/src/app/(auth)/login/page.tsx
10. apps/web/src/app/(auth)/register/page.tsx
11. apps/web/src/app/(dashboard)/layout.tsx
12. apps/web/src/app/api/dashboard/route.ts
13. apps/web/src/app/(dashboard)/dashboard/page.tsx
14. Repeat steps 12-13 for each remaining page
15. apps/admin (full admin panel last)
