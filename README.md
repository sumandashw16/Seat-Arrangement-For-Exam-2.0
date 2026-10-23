# Seat Arrangement Planner 🎓

A production-grade, deterministic examination seating arrangement web application built with **React 19**, **TypeScript (Strict Mode)**, **Tailwind CSS**, and a decoupled **pure TypeScript seating engine** tested with **Vitest**.

---

## 🌟 Key Features

- **Decoupled Seating Engine**: Pure mathematical core in `/src/engine` with zero DOM or UI dependencies, enabling fast, isolated unit and invariant testing.
- **Strict Invariant Enforcement**:
  - **Cheating Prevention (L/R Alternation)**: Alternates Left and Right seats between Circuital and Non-Circuital branches across successive rows.
  - **1 or 2 Students Per Bench**: Global switch applying uniform placement logic.
  - **Leftover Handling**: Unpaired sections and section remainders are isolated 1-per-bench in vacant halls or trailing benches.
  - **Sorted Hall Priority**: Halls are prioritized by bench capacity descending, with ties broken by entry order.
- **Rich Input Capabilities**:
  - Dynamic examination halls with customizable columns (aisles) and rows (depth).
  - Circuital and Non-Circuital branch categories.
  - Multiple roll number ranges per section.
  - Ad-hoc additional rolls (e.g. lateral entries) and excluded rolls (e.g. detained or dropout students).
- **Interactive Visual Outputs**:
  - Full room bench matrix layout with clearly labeled **`▲ FRONT OF ROOM — FACE THIS SIDE (BOARD / PODIUM) ▲`** podium banner.
  - Distinct HSL color assignment for every branch section.
  - Live search by Roll Number with instant highlight and jump-to-seat scrolling.
  - Interactive section filters.
- **Export & Persistence**:
  - **Print / PDF**: Clean, printer-friendly CSS stylesheet with page breaks per examination room.
  - **CSV Export**: Detailed bench-by-bench seat schedule with Room, Column, Row, Side, Roll, Branch, and Section.
  - **JSON Export & Backup**: Single-plan or bulk-backup JSON export.
  - **Browser LocalStorage**: Auto-saving drafts and a full Saved Plans manager with rename and restore capabilities.
  - **One-Click Demo Data**: Instantly populates a realistic university scenario to test allocation across multiple halls.

---

## 🏗️ Project Architecture

```
/src
  /engine                  # Pure TypeScript seating engine
    types.ts               # Core type contracts
    config.ts              # Algorithm configuration & invariants
    resolveStudents.ts     # Range expansion, exclusions, deduplication
    validate.ts            # Input validation & error reporting
    seating.ts             # Deterministic placement algorithm
    __tests__/             # 41 Vitest test cases
  /components
    /InputForm             # Settings, Room list, Stream cards, Validation banner
    /Output                # Summary KPIs, Room bench grid, Search, Legend, Exports
    /SaveLoad              # Save plan modal, Saved plans drawer, JSON import/export
    App.tsx                # Main view orchestrator
  /state
    useFormState.ts        # Input form state + debounced draft auto-save
    useSavedLayouts.ts     # LocalStorage CRUD and JSON backup/restore
  /lib
    utils.ts               # Color generation, CSV serializer, file downloads
  index.css                # Dark mode glassmorphism styling & @media print rules
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm**

### Installation

```bash
# Clone the repository and navigate into the project directory
cd "Seat Arrangement 2.0"

# Install dependencies
npm install
```

### Running Locally

```bash
# Start Vite development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### Running Test Suite

```bash
# Run all Vitest engine unit & invariant tests
npm test
```

### Production Build

```bash
# Typecheck and compile production bundle
npm run build
```

---

## 🧪 Seating Invariants & Testing

The test suite validates 41 comprehensive test scenarios including:
1. **1 Pair, Equal Sections, 2 Per Bench**: Verifies strict `L/R` swap alternation on consecutive benches.
2. **1 Per Bench Mode**: Verifies single-seat `C, N, C, N` room progression.
3. **Unequal Sections**: Verifies proper split into paired phase and 1-per-bench leftover placement.
4. **Room Spanning**: Verifies uninterrupted global bench progression crossing hall boundaries.
5. **Non-Circuital Surplus**: Verifies reverse asymmetry when non-circuital students exceed circuital students.
6. **Data Resolution**: Verifies range expansion, additionals, exclusions, and ascending sort.
7. **Negative Invariants**: Rejects seat deficits, duplicate roll numbers across sections, non-numeric ranges, and invalid dimensions.
