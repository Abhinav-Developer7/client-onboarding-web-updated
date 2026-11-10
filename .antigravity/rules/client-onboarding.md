# Client Onboarding Management System - Project Rules & Guidelines

These workspace rules define the architectural standards, technical stack constraints, domain logic, and development workflows for the **Client Onboarding Management System** project. Antigravity and any contributing agents must strictly adhere to these rules.

---

## 1. Operating & Permission Protocol

> [!IMPORTANT]
> **User Permission Required:** The agent must **NOT** execute new implementation phases, scaffold application code, or make major architectural modifications without the user's explicit permission. Always present the proposed plan and await confirmation.

---

## 2. Technology Stack & Constraints

### Frontend
- **Framework:** React + Vite (ES Modules)
- **Styling:** **Plain CSS ONLY**.
  - **STRICT PROHIBITION:** Do **NOT** install, import, or use Tailwind CSS, styled-components, or any other utility CSS frameworks.
  - Follow the modular Plain CSS architecture with CSS variables for design tokens.
- **Routing:** React Router (`react-router-dom`)
- **Form Management & Validation:** React Hook Form + Zod (using `@hookform/resolvers/zod`)
- **Icons:** `lucide-react`

### Backend
- **Runtime & Framework:** Node.js + Express.js (ES Modules)
- **Database:** MongoDB with Mongoose ODM
- **Validation:** Zod schemas mirroring client-side rules for request validation
- **Authentication:** JWT stored in HTTP-only, secure, SameSite cookies (used **strictly** for internal staff/admin dashboard access)
- **Security:** Helmet, CORS (properly configured for frontend origin and credentials), rate limiting (`express-rate-limit`), sanitization

---

## 3. Architecture & User Access Model

The system consists of two distinct components:

1. **Public Onboarding Portal (3-Form Stepper):**
   - **No authentication required:** Accessible by prospective clients to submit onboarding details sequentially.
   - Form navigation: Form 1 -> Form 2 -> Form 3 -> Review & Submit -> Confirmation screen with Reference ID.
2. **Internal Management Dashboard:**
   - **Staff / Admin Authentication required:** Protected by JWT cookie verification.
   - Provides review, search, status filtering, and status updates (`new`, `under_review`, `approved`, `rejected`).

---

## 4. Form Specifications & Conditional Logic

### Form 1: Customer & Legal Details
- `customerType`: Dropdown (`Business` / `Individual`) — Required
- `businessLegalName`: Text input — Required
- `pan`: Text input with PAN regex validation (`^[A-Z]{5}[0-9]{4}[A-Z]{1}$`) — Required

### Form 2: Address & Tax Specifics
- `address`: Structured object (`line1`, `city`, `state`, `postalCode`, `country`) — Required
- `currency`: Dropdown (`INR`, `USD`, `EUR`, `AED`, `GBP`, etc.) — Required
- `gstTreatment`: Dropdown (`Registered - Regular`, `Registered - Composition`, `Unregistered`, `Consumer`, `Overseas / Export`) — Required
- **Conditional Fields (GSTIN & Place of Supply):**
  - **Rule:** If `gstTreatment` requires registration (`Registered - Regular` or `Registered - Composition`), `gstin` and `placeOfSupply` are **rendered and required**.
  - If unregistered, consumer, or export, **hide and clear** `gstin` and `placeOfSupply`.
  - **Backend Validation:** The backend Zod schema must enforce this exact conditional rule (GSTIN must only be accepted/validated if treatment requires it).

### Form 3: Communication & Contact Info
- `customerLanguage`: Dropdown (`English`, `Malayalam`, `Hindi`, etc.) — Required
- `contactPerson`: Text input — Required
- `email`: Valid email format — Required
- `phone`: Primary telephone/mobile number with country code — Required
- `alternatePhone`: Backup contact number — Optional

### Submission Handling
- Generate a unique sequential/timestamped Reference ID upon submission (e.g. `CL-2026-0001`).
- Initial status: `new`.

---

## 5. CSS & Styling Standards

1. **Design Tokens:** Centralize colors, typography, spacing, border radii, shadows, and transitions in `src/styles/variables.css`.
2. **Global Resets:** Maintain base HTML elements and box-sizing in `src/styles/global.css`.
3. **Component-Scoped Styles:** Colocate CSS files with their respective React components (e.g., `Stepper.jsx` with `Stepper.css`, `InputField.jsx` with `InputField.css`).
4. **Layout:** Use standard CSS Grid and Flexbox for all layout alignments.
5. **Mobile-First Responsiveness:** Write base styles for mobile viewports, applying `@media (min-width: ...)` breakpoints in `src/styles/responsive.css` or component files.

---

## 6. Directory Structure Conventions

```text
Client onboarding Web/
├── GEMINI.md
├── AGENTS.md
├── .agents/
│   └── rules/
│       └── client-onboarding.md
├── Backend/
│   ├── src/
│   │   ├── config/          # Database and environment config
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, error, rate-limit middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express route definitions
│   │   ├── validators/      # Zod validation schemas
│   │   └── server.js        # Entry point
│   └── package.json
└── Frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/      # Modular UI components (Stepper, FormFields, Sidebar)
    │   ├── pages/           # Route views (OnboardingWizard, AdminDashboard, etc.)
    │   ├── styles/          # Plain CSS variables, globals, and responsive styles
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## 7. Phased Implementation Roadmap

1. **Phase 1: Setup & Environment Configuration** (Backend Express + MongoDB connection, shared linting/configs)
2. **Phase 2: Public 3-Form Stepper UI** (Plain CSS forms with dynamic conditional rendering for GSTIN/Place of Supply)
3. **Phase 3: Validation & Submission Logic** (Zod schemas, React Hook Form integration, API client, success page)
4. **Phase 4: Staff Authentication & Admin Dashboard** (JWT cookie auth, submission data tables, filtering, status updates)
5. **Phase 5: End-to-End Testing & Verification** (Validation testing, responsive UI verification)

