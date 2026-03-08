# LiveSheet

> A **real-time collaborative spreadsheet** — Google Sheets meets Excel, built from scratch with Next.js 16, React 19, Firebase 12, and a custom formula engine. Features a Minimalism with microinteractions design system with light/dark mode.

## ✨ Feature Matrix

### Core Spreadsheet
| Feature | Status |
|---------|--------|
| Cell editing (double-click / Enter / F2 / Escape) | ✅ |
| Multi-cell drag selection | ✅ |
| Shift+Click & Shift+Arrow range selection | ✅ |
| Formula bar with cell reference display | ✅ |
| Column/Row resize (drag header edge) | ✅ |

### Formula Engine
| Feature | Example | Status |
|---------|---------|--------|
| SUM | `=SUM(A1:A10)` | ✅ |
| AVG / AVERAGE | `=AVG(A1:A10)` | ✅ |
| COUNT | `=COUNT(A1:B5)` | ✅ |
| MIN / MAX | `=MIN(A1:A10)` | ✅ |
| IF (conditional) | `=IF(A1>10,"High","Low")` | ✅ |
| Arithmetic | `=A1+B1*2` | ✅ |
| Comparisons | `=A1>B1` | ✅ |
| Nested formulas | `=SUM(A1,IF(B1>0,B1,0))` | ✅ |
| Circular dependency detection | — | ✅ |

### Formatting
| Feature | Status |
|---------|--------|
| Bold / Italic / Underline | ✅ |
| Font family (7 fonts) | ✅ |
| Font size (8–36pt) | ✅ |
| Text color (20 vibrant colors) | ✅ |
| Background color (20 vibrant colors + Transparent) | ✅ |
| Text alignment (Left / Center / Right) | ✅ |
| Number format (Text, Number, Currency, Percent, Date) | ✅ |
| Conditional formatting (gt / lt / eq rules) | ✅ |

### Data Management
| Feature | Status |
|---------|--------|
| CSV Export | ✅ |
| CSV Import (with quoted field parsing) | ✅ |
| Column sorting (A→Z / Z→A) | ✅ |
| Copy / Cut / Paste (Ctrl+C/X/V) | ✅ |
| Undo / Redo (Ctrl+Z / Ctrl+Y) | ✅ |

### Row & Column Operations
| Feature | Status |
|---------|--------|
| Column resize (drag header edge) | ✅ |
| Row resize (drag row header edge) | ✅ |
| Insert row above / below | ✅ |
| Delete row | ✅ |
| Insert column left / right | ✅ |
| Delete column | ✅ |
| Right-click context menu | ✅ |

### Advanced Features
| Feature | Status |
|---------|--------|
| Cell comments (red triangle indicator) | ✅ |
| Data validation types | ✅ |
| Charts — Bar, Line, Pie (Canvas API) | ✅ |
| Gridlines toggle | ✅ |
| Zoom control (50%–200%) | ✅ |

### Collaboration
| Feature | Status |
|---------|--------|
| Real-time cell sync (Firestore) | ✅ |
| Presence indicators (colored dots) | ✅ |
| Live cursor tracking | ✅ |
| Cell ownership borders | ✅ |
| Google Sign-In | ✅ |
| Anonymous Sign-In | ✅ |
| Write-state indicator | ✅ |
| 1-Click Document Sharing (Copy Link) | ✅ |

### UI / UX
| Feature | Status |
|---------|--------|
| Minimalism with microinteractions design | ✅ |
| Dark mode / Light mode toggle | ✅ |
| Spring animations on UI elements | ✅ |
| Glowing hover borders and lift effects | ✅ |
| Custom scrollbar styling | ✅ |
| Responsive layout | ✅ |

---

## 🏗 Architecture

```
Browser (Client)
├── Pages (Landing, Dashboard, Editor)
├── Components (SpreadsheetGrid, SheetCell, Toolbar, FormulaBar, ContextMenu, Chart, etc.)
├── Context Providers (SpreadsheetContext, UserContext)
├── Engine Layer (Formula Parser, Dependency Graph, Undo/Redo, Conditional Formatting, Sorting)
├── Hooks Layer (useCells, usePresence, useDocument, useKeyboardNavigation, useUndoRedo)
│
└── Firebase SDK ──▶ Firebase Backend
                    ├── Firestore (documents/, cells/, presence/)
                    ├── Realtime Database (presence/ for disconnect cleanup)
                    └── Authentication (Google OAuth, Anonymous Auth)
```

### Data Flow

1. **Authentication** → User signs in → `UserContext` stores identity
2. **Dashboard** → Firestore `documents` collection lists spreadsheets
3. **Editor** → Opening a document subscribes to `cells/{docId}` for real-time data
4. **Cell Editing** → `SpreadsheetContext.onCellChange()` → updates local state + pushes to Firestore
5. **Formulas** → Recursive-descent parser tokenizes, parses, and evaluates with cell reference resolution
6. **Presence** → `usePresence` writes to Firestore presence collection + RTDB for disconnect
7. **Undo/Redo** → Command stacks replay via context callbacks

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Arrow Keys` | Navigate between cells |
| `Tab` / `Shift+Tab` | Next / Previous column |
| `Enter` / `Shift+Enter` | Next / Previous row |
| `F2` | Edit selected cell |
| `Escape` | Cancel editing |
| `Delete` / `Backspace` | Clear cell content |
| `Ctrl+C` | Copy selection |
| `Ctrl+X` | Cut selection |
| `Ctrl+V` | Paste |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Shift+Arrow` | Extend selection range |
| Any character key | Start typing in cell |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4 + Custom CSS |
| **Backend** | Firebase 12 |
| **Database** | Firestore + Realtime Database |
| **Auth** | Firebase Auth (Google + Anonymous) |
| **Language** | TypeScript 5 |
| **Date Library** | date-fns 4 |

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone <repo-url>
cd live-sheet

# 2. Install dependencies
npm install

# 3. Set up Firebase (see Setup_Guide.md for details)
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

> 📖 See **Setup_Guide.md** for detailed Firebase configuration instructions.

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
