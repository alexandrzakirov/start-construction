# START CONSTRUCTION, INC. — Project Handoff to Claude Code
# Paste this entire file into Claude Code to continue development

---

## PROJECT CONTEXT

You are continuing development of a business management PWA for:
- **Company:** Start Construction, Inc.
- **Type:** California S-Corporation
- **Industry:** Construction (HVAC, general contracting)
- **CSLB License:** #1123785
- **Location:** Sacramento/Rocklin, CA area
- **Owner:** Solo operator, mixed W2 + business income

---

## WHAT EXISTS ALREADY

A fully functional PWA (Progressive Web App) has been built with these pages:

### Current Pages (index.html — single file PWA):
1. **Home (Dashboard)** — alerts, stats, quick links to IRS/FTB/SOS/Gusto/CSLB
2. **Compliance** — insurance expiry tracking, Secretary of State SI-200 deadlines
3. **Insurance** — 5 policy cards (GL, Workers Comp, Auto, Bond, Umbrella)
4. **Money (Distributions)** — shareholder distribution log, estimated tax deadlines
5. **Tasks (Checklist)** — 18 annual compliance tasks with progress bar
6. **Docs** — 28 document deadlines with auto-generator for 8 document types
7. **Vault** — file upload/storage/view/download with 18-item required docs checklist
8. **Settings** — company info, payroll, SOS dates, data export

### Document Generator currently produces:
- Annual Meeting Minutes
- Q1/Q2/Q3/Q4 Distribution Resolutions
- W-9 Request Letter
- Major Decision Resolution
- Client Construction Contract

### Tech stack:
- Pure HTML/CSS/JS — no framework, no build tools
- localStorage for all data (VAULT_KEY, sc_pwa_v1)
- PWA with service worker for offline support
- Deployed on Netlify (drag & drop)
- Light gray color scheme (#dde0e4 background)

---

## WHAT NEEDS TO BE BUILT NEXT

### PRIORITY 1 — Real Cloud Storage (most important)
Current localStorage is limited to ~50MB and lost if browser cache cleared.

**Option A (recommended): Supabase**
- Free tier: 500MB database + 1GB file storage
- Has JavaScript SDK, works from browser
- Store metadata in Postgres, files in Supabase Storage
- Auth: magic link email (no password needed)
- Setup: create project at supabase.com, get anon key

```javascript
// Target integration
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Upload file
await supabase.storage.from('vault').upload(path, file)

// Save metadata
await supabase.from('documents').insert({ name, category, path, size })

// Get files
const { data } = await supabase.from('documents').select('*')
```

**Option B: Google Drive API**
- Files go directly into user's Google Drive folder
- OAuth2 login required
- More complex setup but familiar to user

---

### PRIORITY 2 — Email/SMS Reminders
Send automatic alerts when:
- Insurance expiring in 60 days → email reminder
- Insurance expiring in 30 days → email + SMS
- SI-200 due in 30 days → email
- Estimated tax deadline in 7 days → email + SMS
- Document deadline overdue → immediate alert

**Recommended stack:**
- **Resend** (resend.com) — free 3,000 emails/month, simple API
- **Twilio** — SMS ($0.0079/message)
- **Cron job** via Supabase Edge Functions or Netlify Functions

```javascript
// Netlify Function example (netlify/functions/check-deadlines.js)
export const handler = async () => {
  // 1. Load all compliance dates from Supabase
  // 2. Check which ones are within 60/30/7 days
  // 3. Send email via Resend API
  // 4. Send SMS via Twilio if within 7 days
}
```

---

### PRIORITY 3 — Gusto Payroll Integration
Gusto has a REST API (developer.gusto.com).

**What to pull automatically:**
- Latest payroll run date and amount
- Year-to-date W2 wages
- Form 941 status (filed/not filed)
- Contractor payments (for 1099 tracking)

**Setup needed:**
- Gusto Developer account at dev.gusto.com
- OAuth2 app registration
- Scopes: payrolls:read, employees:read, tax_documents:read

---

### PRIORITY 4 — Real PDF Generation
Current doc generator produces plain text for printing.
Need actual formatted PDFs ready to sign.

**Recommended: pdf-lib (pure JavaScript)**
```javascript
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

async function generateResolutionPDF(data) {
  const doc = await PDFDocument.create()
  const page = doc.addPage([612, 792]) // Letter size
  // Add company header, content, signature line
  const pdfBytes = await doc.save()
  // Download or upload to Supabase
}
```

---

### PRIORITY 5 — Subcontractor Tracker
Track all 1099 subcontractors:
- Name, EIN/SSN, W-9 on file (yes/no)
- Payments by month
- Running total (flag when approaching $600)
- Auto-generate 1099-NEC list in January

---

## FILE STRUCTURE TO CREATE

```
start-construction-app/
├── index.html              (current PWA — keep as fallback)
├── package.json
├── vite.config.js          (or use vanilla JS with no bundler)
├── src/
│   ├── main.js
│   ├── pages/
│   │   ├── dashboard.js
│   │   ├── compliance.js
│   │   ├── insurance.js
│   │   ├── distributions.js
│   │   ├── checklist.js
│   │   ├── documents.js
│   │   ├── vault.js
│   │   ├── subcontractors.js   (NEW)
│   │   └── settings.js
│   ├── lib/
│   │   ├── supabase.js         (NEW)
│   │   ├── pdf-generator.js    (NEW)
│   │   ├── reminders.js        (NEW)
│   │   └── gusto.js            (NEW)
│   └── styles/
│       └── main.css
├── netlify/
│   └── functions/
│       └── check-deadlines.js  (NEW — cron reminders)
└── netlify.toml
```

---

## ENVIRONMENT VARIABLES NEEDED

```env
# Supabase
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[key]

# Email (Resend)
RESEND_API_KEY=[key]
NOTIFICATION_EMAIL=info@startconstruction.com

# SMS (Twilio) — optional
TWILIO_ACCOUNT_SID=[sid]
TWILIO_AUTH_TOKEN=[token]
TWILIO_PHONE=[number]
OWNER_PHONE=[cell number]

# Gusto — when ready
GUSTO_CLIENT_ID=[id]
GUSTO_CLIENT_SECRET=[secret]
```

---

## DESIGN SYSTEM (keep consistent)

```css
/* Colors — LIGHT GRAY THEME (owner requested, black reflects on phone) */
--bg: #dde0e4
--surface: #e8eaed
--surface2: #d4d7db
--border: #c2c6cc
--accent: #b56e00      /* amber/orange */
--green: #166638
--red: #b52a1c
--yellow: #7a5500
--blue: #1450a0
--text: #1a1e24

/* Fonts */
--display: 'Syne', sans-serif      /* headers, nav, buttons */
--mono: 'JetBrains Mono', monospace /* data, codes, dates */
```

---

## COMPANY DATA (pre-fill everywhere)

```javascript
const COMPANY = {
  name: 'Start Construction, Inc.',
  type: 'California S-Corporation',
  cslb: '1123785',
  state: 'California',
  city: 'Sacramento/Rocklin area',
}
```

---

## INSTRUCTIONS FOR CLAUDE CODE

1. **Start with Supabase setup** — this unblocks everything else
   - Create schema: documents, insurance, distributions, checklist, settings
   - Migrate existing localStorage data format to Supabase tables
   - Keep localStorage as offline cache/fallback

2. **Then add email reminders** — highest business value
   - Netlify scheduled function running daily
   - Check all expiry dates in Supabase
   - Send Resend emails for upcoming deadlines

3. **Then improve PDF generation** — current text output → real PDFs

4. **Keep the PWA working** — must still install on iPhone/Android

5. **Deploy to Netlify** — user already has account, drag & drop workflow

---

## EXISTING PWA FILES

The current working PWA is a single `index.html` file (~100KB).
It is deployed at a Netlify URL.
All current functionality must be preserved during migration.

The owner uses this app:
- Primarily on iPhone (Safari)
- Sometimes on Windows PC (Chrome)
- Needs offline capability when at job sites

---

## START HERE

Begin with:
```
1. Create package.json and project structure
2. Set up Supabase project and schema
3. Create supabase.js client module
4. Migrate vault storage from localStorage to Supabase Storage
5. Test file upload/download still works
6. Then move to email reminders
```

Ask me for Supabase URL and keys once you've created the project at supabase.com
