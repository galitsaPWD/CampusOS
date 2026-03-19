# CampusOS Product Spec
> Drop this file into your project root.
> At the start of every Antigravity session: "Read CAMPUSOS.md first. We are building CampusOS. Today's task: [paste the day's task]"

---

## Product
CampusOS is a browser-based study operating system.
It looks like Windows 98. It runs AI-powered student productivity tools.
Each tool is a desktop icon. Click it, it opens in a retro-styled window.
Built by a student, for students.

---

## Core Apps
| App | Icon | Version | Description |
|---|---|---|---|
| StudyAI | 📄 | V1 — Active | StudyAI engine. Upload PDF → 4 study sections. |
| Vault | 📁 | V1 — Active | Upload history grouped by subject. |
| System | ⚙️ | V1 — Active | Settings: theme, wallpaper, username. |
| CardDeck | 🃏 | V2 — Locked | Auto-generate flashcards from notes. |
| QuizMe | ❓ | V2 — Locked | Interactive quiz from exam questions. |
| Cal | 📅 | V3 — Locked | Deadline and assignment tracker. |
| FocusTime | ⏱️ | V3 — Locked | Pomodoro focus timer. |
| StudyAI | 🧠 | V4 — Locked | AI study planner + YouTube summarizer. |
| Trash | 🗑️ | Decorative | Classic OS trash bin. No function. |

---

## V1 Scope — One Feature Only
**StudyAI (StudyAI engine)**
Upload a lecture PDF → AI generates 4 exam-ready study sections.
That is the entire V1. Nothing else ships.

---

## StudyAI — The Core Feature

### What It Does
Student uploads a lecture PDF.
CampusOS extracts the text, chunks it if needed, sends it to Gemini.
Gemini returns 4 structured study sections.
Result is cached in the database — never regenerated unless requested.

### The 4 Output Sections
```
📄 Summary
3–4 sentence overview. Written for a student.
What is this lecture about?
NEVER use "TL;DR" anywhere in the UI. Always "Summary".

🧠 Key Concepts
5–8 bullet points.
Format: Term — definition. Why it matters for exams.

❓ Possible Exam Questions
5–10 questions a professor might ask.
Each has: probability score, difficulty, hint.

📖 Key Terms
5–8 vocabulary terms + short definition.
```

### Gemini JSON Schema
```json
{
  "subject": "string — inferred subject name e.g. Computer Networks",
  "summary": "string — 3-4 sentences, written for a student",
  "keyConcepts": [
    {
      "term": "string",
      "definition": "string — one sentence",
      "whyItMatters": "string — exam relevance"
    }
  ],
  "examQuestions": [
    {
      "question": "string",
      "type": "definition | application | compare-contrast | calculation",
      "probabilityScore": 0,
      "difficulty": "easy | medium | hard",
      "hint": "string — guides without giving away the answer"
    }
  ],
  "keyTerms": [
    {
      "term": "string",
      "definition": "string — short"
    }
  ]
}
```

### Probability Score Badges
- 70–100 → green badge (`#dcfce7` bg, `#166534` text) — study this first
- 40–69 → yellow badge (`#fef9c3` bg, `#854d0e` text) — medium priority
- 0–39 → gray badge — lower priority

### Gemini Prompt Rules
- Instruct: return ONLY valid JSON — no markdown, no backticks, no preamble
- Tone: "Write the summary as if explaining to a university student before their exam"
- Include: "Do not use slang. Use clear academic language."
- Include: "Never use the word TL;DR"
- Specify the JSON schema explicitly in the prompt

---

## PDF Processing Pipeline

### Full Flow
```
Student uploads PDF (max 10MB)
  ↓
UploadThing stores file → Supabase Storage
  ↓
File URL sent to Python FastAPI on Railway
  ↓
PyMuPDF extracts raw text
  ↓
Edge case checks (see below)
  ↓
Chunking check:
  if text < 15,000 words → send to Gemini directly (1 API call)
  if text > 15,000 words → chunk → summarize each → combine → final call (2 API calls max)
  ↓
Gemini returns structured JSON
  ↓
Result saved to Supabase via Prisma (cached forever)
  ↓
Streamed to frontend → displayed in StudyAI window
  ↓
Streak counter incremented
```

### Chunking Logic
```python
def chunk_text(text, chunk_size=3000):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

def process_pdf(text):
    if len(text.split()) < 15000:
        return summarize(text)        # 1 Gemini call

    chunks = chunk_text(text)
    summaries = [summarize(c) for c in chunks]
    combined = " ".join(summaries)
    return summarize(combined)        # 2 Gemini calls max
```

### Edge Cases
| Situation | Action |
|---|---|
| Extracted text < 100 chars | Error: "This PDF contains only images. Upload a text-based PDF." |
| File size > 10MB | Block before upload. Show size error. |
| Empty PDF | Detect zero text before Gemini call. Show retry message. |
| Corrupted file | Catch PyMuPDF error. Show clear message. |
| Non-English PDF | Gemini handles natively. Output matches input language. |

### Performance Rules
- Cache `extractedText` in DB after first parse — never re-parse the same PDF twice
- Stream Gemini output — show Summary first as it arrives, do not wait for full response
- Max 2 Gemini calls per PDF regardless of length
- Show labeled progress steps in UI: "Reading PDF..." → "Identifying concepts..." → "Generating questions..." → "Done!"
- Ping Railway FastAPI health check on page load — prevents cold start delay on first upload

---

## Design System — True Retro Experience

### The Rule
**100% Authentic Retro Experience. No modern hybrid elements.**

| Outside — OS Chrome | Inside — Window Content |
|---|---|
| Press Start 2P font | Monospace / System Sans Serif |
| Dark navy gradient background | White window body `#ffffff` |
| Win95 beveled borders on frame | Classic boxes and beveled dividers |
| Win95 system icons | Solid accent colors |
| Legacy icon squares | Readable 10–12px text |
| CampusOS watermark 5.5% opacity | No modern shadows or cards |

### Colors
```
Desktop background:   #0f1024 → #1b1e46   (dark navy, NOT pitch black)
Window frame:         #c0c0c0             (classic Win95 gray)
Window title bar:     #0f0f2e → #1e1e4e   (dark gradient)
Window body:          #ffffff             (clean white)
Accent:               #4f46e5             (indigo)
Taskbar:              rgba(8,8,20,0.97)
Taskbar border:       rgba(99,102,241,0.25)
Streak badge:         #fbbf24             (amber)
Prob high badge:      #dcfce7 bg / #166534 text
Prob mid badge:       #fef9c3 bg / #854d0e text
```

### Window Chrome
```
Outer frame:
  border-top:    2px solid #e8e8e8
  border-left:   2px solid #e8e8e8
  border-right:  2px solid #404040
  border-bottom: 2px solid #404040

Title bar:
  background:    linear-gradient(to right, #0f0f2e, #1e1e4e)
  border-bottom: 1px solid rgba(99,102,241,0.3)
  text font:     Press Start 2P 7px white

Close buttons (macOS dots):
  red:    #ff5f57
  yellow: #febc2e
  green:  #28c840

Window body:
  outer padding background: #c0c0c0
  inner content background: #ffffff
  inner border-top/left:    2px solid #808080
  inner border-right/bottom: 2px solid #dfdfdf

Scrollbar: Win95 style — 12px wide, gray track, beveled thumb
```

### Desktop Icons
```
Container:      70×70px area, padding 6px
Image:          40×40px, solid background or simple gradient
Label font:     Press Start 2P 7px
Label color:    rgba(255,255,255,0.85)
Label shadow:   0 1px 4px rgba(0,0,0,0.8)
Hover state:    background rgba(255,255,255,0.08)
Locked state:   grayscale(1) opacity(0.3)
```

| App | Icon Gradient |
|---|---|
| StudyAI 📄 | `#1e40af → #3b82f6` (blue) |
| Vault 📁 | `#374151 → #9ca3af` (gray) |
| System ⚙️ | `#374151 → #9ca3af` (gray) |
| CardDeck 🃏 | `#6d28d9 → #a78bfa` (purple) |
| QuizMe ❓ | `#065f46 → #34d399` (green) |
| Cal 📅 | `#92400e → #f59e0b` (orange) |
| FocusTime ⏱️ | `#0e7490 → #22d3ee` (teal) |
| StudyAI 🧠 | `#9d174d → #f472b6` (pink) |
| Trash 🗑️ | `#7f1d1d → #f87171` (red) |

### Watermark
```
Text:       "CampusOS"
Position:   absolute center of desktop
Font:       Press Start 2P 30px, letter-spacing 4px
Color:      rgba(255,255,255,0.055)
Sub-text:   "YOUR STUDY DESKTOP"
Sub-font:   Press Start 2P 7px, letter-spacing 7px
Sub-color:  rgba(255,255,255,0.03)
Sub-margin: 8px top
```

### Taskbar
```
Height:       40px
Background:   rgba(8,8,20,0.97)
Border-top:   1px solid rgba(99,102,241,0.25)

Start button:
  background: linear-gradient(135deg, #3730a3, #4f46e5)
  border-radius: 6px
  font: Press Start 2P 7px white
  text: "🪟 Campus"

Open app pills:
  background: rgba(255,255,255,0.07)
  border: 1px solid rgba(255,255,255,0.1)
  border-radius: 5px
  font: Inter 10px

Streak badge:
  font: Press Start 2P 7px
  color: #fbbf24
  background: rgba(251,191,36,0.1)
  border: 1px solid rgba(251,191,36,0.2)
  border-radius: 5px

Clock:
  font: Press Start 2P 7px
  color: rgba(255,255,255,0.4)
```

### Beta Badge
```
Position:     absolute top-right of desktop (12px from edges)
Text:         "🟡 BETA"
Font:         Press Start 2P 7px
Color:        #fbbf24
Background:   rgba(251,191,36,0.15)
Border:       1px solid rgba(251,191,36,0.3)
Border-radius: 5px
```

---

## Retention & Habit System

| Hook | Version | Trigger | Psychology |
|---|---|---|---|
| Study Streak | V1 | Upload PDF or view result | Fear of breaking streak |
| Beta Badge | V1 | Always visible | Scarcity + exclusivity |
| Locked Icons | V1 | Always visible | Curiosity + aspiration |
| Daily Study Prompt | V2 | On desktop open | Personalized nudge |
| Weekly Report Email | V3 | Every Sunday | Re-engagement |

### Streak Implementation (V1)
- Show on taskbar: `🔥 4` in Press Start 2P amber
- Increment when: student uploads a PDF or views a past result on a given day
- Reset when: student skips a day (compare `lastActiveDate` to today)
- Toast on increment: "🔥 Streak Day 4!" shown 2.5 seconds
- Milestone toasts at 7, 30, 100 days

---

## Tech Stack
```
Framework:    Next.js 14 App Router
Styling:      Tailwind CSS + shadcn/ui
Retro UI:     98.css → npm install 98.css
              NEVER build Win95 CSS from scratch
Fonts:        Press Start 2P (OS chrome only) — Google Fonts
              Inter (window content only) — Google Fonts
Auth:         Supabase Auth
              Methods: email + password, magic link
              Enable email confirmation to prevent spam
Database:     Supabase PostgreSQL via Prisma ORM
Storage:      Supabase Storage (PDFs)
Uploads:      UploadThing — 10MB max per file
PDF Parsing:  PyMuPDF via FastAPI (Python microservice on Railway)
AI:           Gemini 2.5 Flash-Lite — free: 1,000 req/day
Python Host:  Railway (backup: Render.com)
Web Host:     Vercel
Payments:     Stripe — V2 only, NOT in V1
Email:        Resend — V3 only, 3,000 emails/month free
```

---

## Database Schema (V1)
```prisma
model User {
  id             String    @id @default(cuid())
  supabaseId     String    @unique
  email          String    @unique
  username       String
  theme          String    @default("classic")
  wallpaper      String    @default("night")
  streakCount    Int       @default(0)
  lastActiveDate DateTime?
  isPaid         Boolean   @default(false)
  createdAt      DateTime  @default(now())
  results        StudyAIResult[]
}

model StudyAIResult {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  title         String
  fileUrl       String
  extractedText String   // cached — never re-parse
  subject       String
  summary       String
  keyConcepts   Json
  examQuestions Json
  keyTerms      Json
  createdAt     DateTime @default(now())
}
```

---

## Routes (V1)
```
/                   Landing page — retro OS themed marketing
/sign-up            Supabase Auth signup → redirect to /desktop
/sign-in            Supabase Auth login → redirect to /desktop
/desktop            Main OS desktop — all icons, taskbar, watermark, streak
/desktop/studyai    StudyAI — PDF upload + 4-section result
/desktop/vault      Vault — history grouped by subject
/settings           System — theme, wallpaper, username
/pricing            Free vs Pro — no Stripe yet
```

---

## Freemium Model
```
BETA (V1):
  Everything free and unlimited
  Beta badge on desktop
  Goal: hook students before limits are introduced

FREE (V2+):
  StudyAI:    10 uploads/month
  Streak:     full access
  Vault:      full access
  Themes:     3 built-in
  Wallpapers: 5 built-in

PAID (~$6/month, V2+):
  StudyAI:          unlimited
  CardDeck:         included
  QuizMe:           included
  Daily Prompt:     included
  Custom wallpaper: upload your own
  Animated wallpapers
  Premium themes:   Vaporwave, Midnight, Forest
  Premium icons:    Neon, Cute/Y2K, Frosted Glass
  Widgets:          clock, weather, quote
```

---

## V1 → V5 Roadmap
```
V1    StudyAI + OS shell + Streak          validate    1 week
V1.1  Boot screen + shareable links        polish      after feedback
V2    CardDeck + QuizMe + Stripe           deepen      month 2
V3    Cal + FocusTime + weekly email       retain      month 3–4
V4    StudyAI planner + YouTube summary    personalize month 5–6
V5    Group rooms + mobile + university    scale       month 7–9
```

---

## 1-Week Build Plan
```
Day 1 — OS Shell
  Next.js + Tailwind + 98.css + fonts installed
  Desktop: bg gradient, watermark, 9 icons, taskbar, window component
  Window has Win95 chrome + macOS dots + correct fonts
  Push to GitHub → deploy to Vercel (blank app live on real URL)

Day 2 — Auth + Database
  Supabase Auth — email + magic link, email confirmation enabled
  Prisma schema — User + StudyAIResult tables
  /desktop route protected — redirects to /sign-in if not logged in

Day 3 — PDF Pipeline
  UploadThing — PDF only, 10MB limit
  FastAPI on Railway — health check endpoint at /health
  PyMuPDF text extraction
  Chunking logic — auto-chunk if > 15,000 words
  All edge cases handled (image-only, empty, corrupt, too large)
  End-to-end test: upload PDF → get extracted text back

Day 4 — AI Integration
  Gemini 2.5 Flash-Lite API call
  Structured JSON prompt with full schema
  Streaming response to frontend
  All 4 sections shown: Summary, Key Concepts,
  Possible Exam Questions with prob badges, Key Terms
  Result saved to DB (cached)

Day 5 — Vault + Streak + Settings
  StudyAIResult saved on completion
  Vault page — results grouped by subject
  Streak logic — increment on upload/view, reset on skip day
  Streak toast notification
  Settings page — username, theme picker, wallpaper picker
  Beta badge on desktop

Day 6 — Landing Page + Polish
  Retro OS themed landing page
  Empty states for StudyAI and Vault
  All error messages for PDF edge cases
  Sample PDF demo button — pre-processed, instant result
  Locked icons — grayed out + "Coming in V2" tooltip
  Mobile responsive check

Day 7 — Launch
  Full flow test: sign up → upload → see result → check vault
  Final bug fixes
  Share with 10 real students
  Watch what they do
  DO NOT add any new features
```

---

## Build Rules (Non-Negotiable)
1. Build V1 only — never implement V2+ features
2. Use 98.css — NEVER build Win95 CSS from scratch
3. No draggable windows in V1 — tools open as full-page routes
4. Minimize/maximize buttons are decorative only in V1
5. NEVER use "TL;DR" — always "Summary"
6. Feature is called StudyAI — app/icon is called StudyAI
7. Icon names: StudyAI, CardDeck, Cal, FocusTime, QuizMe, Vault, System, Trash
8. No Stripe in V1
9. No document chat — no vectors, no embeddings, no RAG
10. Always chunk PDFs over 15,000 words — max 2 Gemini calls per PDF
11. Always cache extractedText — never re-parse the same file twice
12. Stream Gemini output — never wait for full response before showing UI
13. One task per prompt — never ask the AI to build everything at once
14. When in doubt — build the simpler version

---

## All Links
```
Vercel:           https://vercel.com
Supabase:         https://supabase.com
UploadThing:      https://uploadthing.com
Railway:          https://railway.app
Render (backup):  https://render.com
Gemini API key:   https://aistudio.google.com
shadcn/ui:        https://ui.shadcn.com
98.css:           https://github.com/jdan/98.css
Press Start 2P:   https://fonts.google.com/specimen/Press+Start+2P
Resend (V3):      https://resend.com
Stripe (V2):      https://stripe.com
```
