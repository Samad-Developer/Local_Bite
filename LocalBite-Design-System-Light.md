# LocalBite — Complete Design System (Light Theme)
## For Restaurant Admin Dashboard

---

## 1. Theme — Light Mode

```
Base background      #f5f5f5    → outermost page background (very light grey)
Surface              #ffffff    → cards, sidebar, panels (pure white)
Elevated             #f9f9f9    → hover states, input backgrounds, subtle areas
Border               #e5e7eb    → all borders and dividers
Border hover         #d1d5db    → border on hover

Brand / Primary      #f97316    → orange (buttons, active states, icons)
Primary hover        #ea6c0a    → darker orange on hover
Primary subtle       #fff7ed    → orange at soft opacity (active nav bg, badge bg)
Primary border       #fed7aa    → orange border for subtle elements

Text primary         #111111    → headings, important content
Text secondary       #6b7280    → labels, subtitles, nav items
Text muted           #9ca3af    → placeholders, timestamps, hints

Status colors:
  Success            #16a34a    → completed, available, paid, open
  Success subtle     #f0fdf4    → success badge background
  Success border     #bbf7d0    → success badge border
  Warning            #ca8a04    → preparing, pending
  Warning subtle     #fefce8    → warning badge background
  Warning border     #fde68a    → warning badge border
  Danger             #dc2626    → cancelled, unavailable, overdue
  Danger subtle      #fef2f2    → danger badge background
  Danger border      #fecaca    → danger badge border
  Info               #2563eb    → new, confirmed, info
  Info subtle        #eff6ff    → info badge background
  Info border        #bfdbfe    → info badge border
  Purple             #7c3aed    → confirmed status
  Purple subtle      #f5f3ff    → confirmed badge background
  Purple border      #ddd6fe    → confirmed badge border
```

---

## 2. Tailwind CSS Variables Setup

```css
/* globals.css */

:root {
  --background: #f5f5f5;
  --foreground: #111111;

  --card: #ffffff;
  --card-foreground: #111111;

  --border: #e5e7eb;
  --input: #f9f9f9;

  --primary: #f97316;
  --primary-foreground: #ffffff;

  --secondary: #f9f9f9;
  --secondary-foreground: #111111;

  --muted: #f9f9f9;
  --muted-foreground: #6b7280;

  --accent: #f9f9f9;
  --accent-foreground: #111111;

  --destructive: #dc2626;
  --destructive-foreground: #ffffff;

  --ring: #f97316;
  --radius: 0.5rem;
}

body {
  background-color: #f5f5f5;
  color: #111111;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

---

## 3. Typography System

```
Use only these 4 sizes — never deviate:

Page title          text-2xl font-bold text-[#111111]
  example: "Orders", "Menu Items", "Dashboard"

Section heading     text-lg font-semibold text-[#111111]
  example: "Recent Orders", "Top Selling Items"

Body / Labels       text-sm text-[#6b7280]
  example: form labels, table column headers, descriptions

Meta / Small        text-xs text-[#9ca3af]
  example: timestamps, counts, hints, badges

Font family: Inter (import from Google Fonts)
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  font-family: 'Inter', sans-serif;
```

---

## 4. Spacing Rules

```
Use only these — never use arbitrary values:

gap-1    4px    → between icon and text in same element
gap-2    8px    → between tightly related elements
gap-3    12px   → between form fields
gap-4    16px   → between cards, between nav items
gap-6    24px   → between sections on a page
gap-8    32px   → between major layout sections

p-2      8px    → small button padding
p-3      12px   → nav item padding, small card padding
p-4      16px   → standard card padding
p-6      24px   → large card padding, page padding

mb-1    → between label and input
mb-4    → between form groups
mb-6    → between page sections
```

---

## 5. Border Radius Rules

```
rounded-sm      → tags, tiny elements
rounded-md      → input fields, small buttons
rounded-lg      → buttons, table rows hover
rounded-xl      → cards, panels, modals
rounded-2xl     → large cards, drawers
rounded-full    → badges, avatars, pill buttons
```

---

## 6. Shadow Rules

```
Light theme uses shadows more than dark theme
Shadows give depth and separate layers naturally

Cards:
  shadow-sm + border
  box-shadow: 0 1px 3px rgba(0,0,0,0.06)
  border: 1px solid #e5e7eb

Elevated items (dropdowns, modals):
  shadow-lg
  box-shadow: 0 10px 25px rgba(0,0,0,0.1)

Sidebar:
  shadow-sm (right side only)
  border-right: 1px solid #e5e7eb

Header:
  shadow-sm (bottom only)
  border-bottom: 1px solid #e5e7eb

Drawers:
  shadow-2xl
  box-shadow: -10px 0 40px rgba(0,0,0,0.12)
```

---

## 7. Icon System

```
Library: Lucide React (already included with shadcn)
import { ShoppingBag, ChefHat, LayoutDashboard } from "lucide-react"

Sizes — use only these:
  w-4 h-4   16px   → table action buttons, inline icons
  w-5 h-5   20px   → sidebar nav icons, button icons
  w-6 h-6   24px   → stats card icons
  w-8 h-8   32px   → empty state icons (inside colored circle)
  w-12 h-12 48px   → large empty state illustrations

Icon colors:
  Nav icons default  → text-[#6b7280]
  Nav icons active   → text-[#f97316]
  Button icons       → inherit from button text color
  Stats card icons   → text-[#f97316]
  Action icons       → text-[#9ca3af] hover:text-[#111111]
```

---

## 8. Layout Structure

```
Full page layout:

┌─────────────────────────────────────────────────────────┐
│ SIDEBAR (fixed left, w-60, full height)                 │
│ ┌──────────────────────────────────────────────────┐    │
│ │                                                  │    │
│ │  Logo + App Name        height: 64px             │    │
│ │  border-bottom: 1px solid #e5e7eb                │    │
│ │                                                  │    │
│ │  nav section label (MANAGEMENT)                  │    │
│ │  Nav Item                                        │    │
│ │  Nav Item  ← active                              │    │
│ │  Nav Item                                        │    │
│ │                                                  │    │
│ │  nav section label (SYSTEM)                      │    │
│ │  Nav Item                                        │    │
│ │                                                  │    │
│ │  ─────────────────────── (absolute bottom)       │    │
│ │  Avatar  Name  Role                              │    │
│ │  Logout button                                   │    │
│ └──────────────────────────────────────────────────┘    │
│                                                         │
│ MAIN AREA (flex-1, flex-col)                            │
│ ┌──────────────────────────────────────────────────┐    │
│ │ HEADER (sticky top, h-16, border-bottom)         │    │
│ │ Page Title           🔔 Notifications  👤 Avatar  │    │
│ ├──────────────────────────────────────────────────┤    │
│ │                                                  │    │
│ │ PAGE CONTENT (overflow-y-auto, p-6)              │    │
│ │ (scrollable area)                                │    │
│ │                                                  │    │
│ └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘

Tailwind classes for layout:
  Outer wrapper:    flex h-screen bg-[#f5f5f5] overflow-hidden
  Sidebar:          w-60 flex-shrink-0 bg-white border-r border-[#e5e7eb] flex flex-col shadow-sm
  Main area:        flex-1 flex flex-col overflow-hidden
  Header:           h-16 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm
  Content:          flex-1 overflow-y-auto p-6
```

---

## 9. Sidebar Component Spec

```
Width: 240px (w-60)
Background: #ffffff
Right border: 1px solid #e5e7eb
Shadow: shadow-sm

LOGO AREA:
  height: 64px
  padding: px-4
  display: flex items-center gap-3
  Logo image: w-8 h-8 rounded-lg
  App name: text-base font-bold text-[#111111]

NAVIGATION SECTION LABEL:
  text-xs font-semibold uppercase tracking-wider
  color: #9ca3af
  padding: px-3 pt-6 pb-2
  examples: "MANAGEMENT", "SYSTEM"

NAV ITEM — Default:
  display: flex items-center gap-3
  padding: px-3 py-2
  border-radius: rounded-lg
  icon: w-5 h-5 color #6b7280
  text: text-sm color #6b7280
  cursor: pointer
  transition: all 150ms

NAV ITEM — Hover:
  background: #f9f9f9
  icon color: #111111
  text color: #111111

NAV ITEM — Active:
  background: #fff7ed (orange very subtle)
  icon color: #f97316
  text color: #f97316
  font-weight: font-medium

PENDING BADGE (on Orders nav item):
  background: #dc2626
  text: white text-xs font-medium
  padding: px-1.5 py-0.5
  border-radius: rounded-full
  position: ml-auto
  min-width: 20px text-center

BOTTOM USER SECTION:
  position: absolute bottom-0 left-0 right-0
  padding: p-4
  border-top: 1px solid #e5e7eb
  background: #ffffff
  display: flex items-center gap-3

  Avatar: w-8 h-8 rounded-full bg-[#f97316]
          flex items-center justify-center
          text-white text-sm font-semibold

  Name: text-sm font-medium text-[#111111]
  Role: text-xs text-[#6b7280]

  Logout button: ml-auto icon button ghost variant
```

---

## 10. Header Component Spec

```
Height: 64px (h-16)
Background: #ffffff
Bottom border: 1px solid #e5e7eb
Shadow: shadow-sm
Padding: px-6
Display: flex items-center justify-between
Position: sticky top-0 z-10

LEFT SIDE:
  Page title: text-xl font-semibold text-[#111111]
  Optional breadcrumb: text-xs text-[#9ca3af]
  example: "Menu / Items"

RIGHT SIDE (flex items-center gap-3):

  Restaurant open/close toggle:
    Open:   bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]
    Closed: bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]
    text-xs font-medium px-3 py-1 rounded-full cursor-pointer

  Notification bell:
    icon button w-9 h-9
    bg-[#f9f9f9] rounded-lg border border-[#e5e7eb]
    hover: border-[#d1d5db] bg-white
    bell icon w-4 h-4 text-[#6b7280]
    red dot if unread notifications

  Avatar:
    w-9 h-9 rounded-lg
    bg-[#f97316]
    text-white text-sm font-semibold
    first letter of owner name
    cursor-pointer
    dropdown: Profile, Settings, Logout
```

---

## 11. Stats Cards Component Spec

```
Grid: grid grid-cols-4 gap-4

Single Card:
  background: #ffffff
  border: 1px solid #e5e7eb
  border-radius: rounded-xl
  padding: p-6
  shadow: shadow-sm
  hover: shadow-md border-[#d1d5db] transition-all duration-200

INSIDE CARD:

  Top row (flex justify-between items-start):

    Left:
      Label: text-sm text-[#6b7280] font-medium mb-1
      example: "Total Orders Today"

    Right:
      Icon container: w-10 h-10 rounded-lg bg-[#fff7ed]
                      flex items-center justify-center
      Icon: w-5 h-5 text-[#f97316]

  Middle:
    Big number: text-3xl font-bold text-[#111111] mt-2

  Bottom:
    Positive trend:
      Arrow up icon: w-3 h-3 text-[#16a34a]
      Text: text-xs text-[#16a34a] "12% from yesterday"

    Negative trend:
      Arrow down icon: w-3 h-3 text-[#dc2626]
      Text: text-xs text-[#dc2626] "3% from yesterday"

    Neutral:
      Text: text-xs text-[#9ca3af] "Same as yesterday"

ICONS PER CARD:
  Total Orders      → ShoppingBag
  Revenue           → DollarSign
  Pending Orders    → Clock
  Avg Order Value   → TrendingUp
```

---

## 12. Status Badge Component Spec

```
Base classes:
  text-xs font-medium
  px-2.5 py-0.5
  rounded-full
  border

Per status:
  NEW:       bg-[#eff6ff]  text-[#2563eb]  border-[#bfdbfe]   "New"
  CONFIRMED: bg-[#f5f3ff]  text-[#7c3aed]  border-[#ddd6fe]   "Confirmed"
  PREPARING: bg-[#fefce8]  text-[#ca8a04]  border-[#fde68a]   "Preparing"
  READY:     bg-[#fff7ed]  text-[#f97316]  border-[#fed7aa]   "Ready"
  COMPLETED: bg-[#f0fdf4]  text-[#16a34a]  border-[#bbf7d0]   "Completed"
  CANCELLED: bg-[#fef2f2]  text-[#dc2626]  border-[#fecaca]   "Cancelled"

Order type badge:
  DINE_IN:   bg-[#f9f9f9] text-[#6b7280] border-[#e5e7eb]  "🍽 Dine In"
  TAKEAWAY:  bg-[#f9f9f9] text-[#6b7280] border-[#e5e7eb]  "🥡 Takeaway"
  DELIVERY:  bg-[#f9f9f9] text-[#6b7280] border-[#e5e7eb]  "🛵 Delivery"

Available badge:
  Available:   bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]  "● Available"
  Unavailable: bg-[#fef2f2] text-[#dc2626] border-[#fecaca]  "● Unavailable"
```

---

## 13. Button Variants Spec

```
PRIMARY BUTTON:
  bg-[#f97316] hover:bg-[#ea6c0a]
  text-white text-sm font-medium
  px-4 py-2 rounded-lg shadow-sm
  transition-colors duration-150
  active:scale-95

SECONDARY BUTTON:
  bg-white hover:bg-[#f9f9f9]
  text-[#111111] text-sm font-medium
  border border-[#e5e7eb] hover:border-[#d1d5db]
  px-4 py-2 rounded-lg shadow-sm
  transition-colors duration-150

GHOST BUTTON:
  bg-transparent hover:bg-[#f9f9f9]
  text-[#6b7280] hover:text-[#111111]
  px-3 py-2 rounded-lg
  transition-colors duration-150

DANGER BUTTON:
  bg-[#fef2f2] hover:bg-[#fee2e2]
  text-[#dc2626]
  border border-[#fecaca]
  px-4 py-2 rounded-lg
  transition-colors duration-150

ICON BUTTON (square):
  w-9 h-9 flex items-center justify-center
  rounded-lg
  bg-white hover:bg-[#f9f9f9]
  border border-[#e5e7eb] hover:border-[#d1d5db]
  icon: w-4 h-4 text-[#6b7280] hover:text-[#111111]
  shadow-sm
```

---

## 14. Input and Form Fields Spec

```
INPUT FIELD:
  background: #ffffff
  border: 1px solid #e5e7eb
  border-radius: rounded-lg
  padding: px-3 py-2
  text: text-sm text-[#111111]
  placeholder: text-[#9ca3af]
  height: h-10
  shadow: shadow-sm

  focus:
    border-color: #f97316
    outline: none
    ring: 2px ring-[#fed7aa] (soft orange ring)

  Tailwind:
    bg-white border-[#e5e7eb] text-[#111111]
    placeholder:text-[#9ca3af] rounded-lg px-3 py-2
    text-sm h-10 w-full shadow-sm
    focus:border-[#f97316] focus:outline-none
    focus:ring-2 focus:ring-[#fed7aa]
    transition-all duration-150

LABEL:
  text-sm font-medium text-[#374151]
  margin-bottom: mb-1.5
  display: block

FORM GROUP spacing:
  space-y-4 between form fields
  space-y-6 between form sections

SELECT:
  same as input field

TEXTAREA:
  same as input but min-h-[80px] resize-y

TOGGLE SWITCH:
  use shadcn Switch
  accent: #f97316

  Label row:
    flex items-center justify-between
    Label: text-sm font-medium text-[#111111]
    Sublabel: text-xs text-[#6b7280]
    Switch on right
```

---

## 15. Card Component Spec

```
BASE CARD:
  background: #ffffff
  border: 1px solid #e5e7eb
  border-radius: rounded-xl
  padding: p-6
  shadow: shadow-sm

CARD HEADER:
  flex items-center justify-between
  margin-bottom: mb-4 or mb-6
  border-bottom: 1px solid #f3f4f6 (very light)
  padding-bottom: pb-4

  Title: text-base font-semibold text-[#111111]
  Subtitle: text-sm text-[#6b7280]
  Action on right: secondary or ghost button

CLICKABLE CARD:
  cursor-pointer
  hover: shadow-md border-[#d1d5db]
  transition: all 200ms

CARD FOOTER:
  border-top: 1px solid #f3f4f6
  padding-top: pt-4
  margin-top: mt-4
  flex items-center justify-between
```

---

## 16. Table Component Spec

```
TABLE WRAPPER:
  background: #ffffff
  border: 1px solid #e5e7eb
  border-radius: rounded-xl
  overflow: hidden
  shadow: shadow-sm

TABLE HEADER ROW:
  background: #f9fafb
  border-bottom: 1px solid #e5e7eb

  Header cell:
    text-xs font-semibold uppercase tracking-wider
    color: #9ca3af
    padding: px-4 py-3

TABLE DATA ROW:
  border-bottom: 1px solid #f3f4f6
  last-child: no border
  hover: bg-[#f9fafb]
  transition: background 150ms
  cursor: pointer (if clickable)

  Data cell:
    padding: px-4 py-3.5
    text-sm text-[#111111] (primary)
    text-sm text-[#6b7280] (secondary)

TABLE PAGINATION:
  padding: px-4 py-3
  border-top: 1px solid #f3f4f6
  flex items-center justify-between
  text-sm text-[#6b7280]

ACTIONS COLUMN:
  last column, text-right
  flex items-center justify-end gap-1
  icon ghost buttons
  opacity-0 group-hover:opacity-100 transition-opacity
```

---

## 17. Kanban Board Spec (Orders Page)

```
BOARD WRAPPER:
  display: flex gap-4
  overflow-x: auto
  padding-bottom: pb-4
  min-height: calc(100vh - 200px)

KANBAN COLUMN:
  min-width: 280px
  flex-shrink: 0
  background: #f9fafb
  border: 1px solid #e5e7eb
  border-radius: rounded-xl
  display: flex flex-col

COLUMN HEADER:
  padding: p-4
  border-bottom: 1px solid #e5e7eb
  flex items-center justify-between
  background: #ffffff
  border-radius: rounded-t-xl

  Left:
    flex items-center gap-2
    Color dot: w-2.5 h-2.5 rounded-full
    Name: text-sm font-semibold text-[#111111]

  Right:
    Count: text-xs text-[#6b7280] bg-[#f3f4f6]
           px-2 py-0.5 rounded-full border border-[#e5e7eb]

COLUMN DOTS:
  NEW:       bg-[#2563eb]
  CONFIRMED: bg-[#7c3aed]
  PREPARING: bg-[#ca8a04]
  READY:     bg-[#f97316]
  COMPLETED: bg-[#16a34a]
  CANCELLED: bg-[#dc2626]

COLUMN BODY:
  flex-1 overflow-y-auto
  padding: p-3
  space-y-3

ORDER CARD (inside column):
  background: #ffffff
  border: 1px solid #e5e7eb
  border-radius: rounded-lg
  padding: p-3.5
  cursor: pointer
  shadow: shadow-sm
  hover: shadow-md border-[#d1d5db]
  transition: all 150ms

  TOP ROW: flex justify-between items-center mb-2
    Order number: text-sm font-semibold text-[#111111]
    Order type badge (small)

  CUSTOMER ROW: mb-2
    Name: text-sm text-[#111111]
    Phone: text-xs text-[#6b7280]

  ITEMS ROW: mb-3
    text-xs text-[#6b7280]
    "3 items · Rs. 2,450"

  BOTTOM ROW: flex justify-between items-center
    Time: text-xs text-[#9ca3af]

    Action button:
      text-xs font-medium px-2.5 py-1 rounded-md
      Accept:    bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]
      Preparing: bg-[#fefce8] text-[#ca8a04] border border-[#fde68a]
      Ready:     bg-[#fff7ed] text-[#f97316] border border-[#fed7aa]
      Complete:  bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]

  OVERDUE CARD:
    border-color: #fecaca (red border)
    time text: text-[#dc2626]
```

---

## 18. Drawer (Sheet) Spec

```
Using shadcn Sheet

DRAWER:
  width: 480px (sm:max-w-lg)
  background: #ffffff
  border-left: 1px solid #e5e7eb
  shadow: shadow-2xl (-10px 0 40px rgba(0,0,0,0.12))

DRAWER HEADER:
  padding: p-6
  border-bottom: 1px solid #f3f4f6

  Title: text-lg font-semibold text-[#111111]
  Subtitle: text-sm text-[#6b7280] mt-1

DRAWER CONTENT:
  padding: p-6
  overflow-y: auto
  flex-1
  space-y-4

DRAWER FOOTER:
  padding: p-6
  border-top: 1px solid #f3f4f6
  flex items-center gap-3 justify-end
  background: #f9fafb

  Cancel: secondary button
  Submit: primary button
```

---

## 19. Empty State Spec

```
CENTER CONTAINER:
  flex flex-col items-center justify-center
  py-16 px-8 text-center

ICON CIRCLE:
  w-16 h-16 rounded-2xl
  background: #f9fafb
  border: 1px solid #e5e7eb
  flex items-center justify-center
  margin-bottom: mb-4
  icon: w-8 h-8 text-[#9ca3af]

HEADING:
  text-base font-semibold text-[#111111]
  margin-bottom: mb-1

SUBTEXT:
  text-sm text-[#6b7280]
  max-width: max-w-xs
  margin-bottom: mb-6

EMPTY STATES:

  Menu Items:
    Icon: UtensilsCrossed
    Heading: "No menu items yet"
    Subtext: "Add your first item to start building your menu"
    Button: "Add First Item" (primary)

  Orders:
    Icon: ShoppingBag
    Heading: "No orders yet"
    Subtext: "Orders will appear here when customers place them"
    No button

  No search results:
    Icon: Search
    Heading: "No results found"
    Subtext: "Try adjusting your search or filter"
    Button: "Clear filters" (secondary)

  Categories:
    Icon: LayoutGrid
    Heading: "No categories yet"
    Subtext: "Create a category first before adding menu items"
    Button: "Add Category" (primary)
```

---

## 20. Loading Skeleton Spec

```
animate-pulse on wrapper

SKELETON COLORS (light theme):
  bg-[#f3f4f6]  → skeleton block
  bg-[#e5e7eb]  → slightly darker variation

STATS CARD SKELETON (x4):
  bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm

  Row 1: flex justify-between
    div h-4 w-32 bg-[#f3f4f6] rounded
    div w-10 h-10 bg-[#f3f4f6] rounded-lg

  div h-8 w-20 bg-[#f3f4f6] rounded mt-3
  div h-3 w-28 bg-[#f3f4f6] rounded mt-2

TABLE SKELETON (x5 rows):
  flex items-center px-4 py-3.5 border-b border-[#f3f4f6]

  div w-6 h-4 bg-[#f3f4f6] rounded
  div w-20 h-4 bg-[#f3f4f6] rounded ml-4
  div w-16 h-4 bg-[#f3f4f6] rounded ml-auto
  div w-20 h-5 bg-[#f3f4f6] rounded ml-4

MENU ITEM CARD SKELETON (x6):
  bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm

  div h-40 bg-[#f3f4f6]
  padding p-4
    div h-4 w-3/4 bg-[#f3f4f6] rounded mb-2
    div h-3 w-1/2 bg-[#f3f4f6] rounded mb-3
    div h-4 w-1/3 bg-[#f3f4f6] rounded

KANBAN CARD SKELETON (x3 per column):
  bg-white border border-[#e5e7eb] rounded-lg p-3.5 shadow-sm

  flex justify-between mb-2
    div h-4 w-16 bg-[#f3f4f6] rounded
    div h-4 w-16 bg-[#f3f4f6] rounded

  div h-4 w-24 bg-[#f3f4f6] rounded mb-1
  div h-3 w-32 bg-[#f3f4f6] rounded mb-3
  div h-7 w-20 bg-[#f3f4f6] rounded
```

---

## 21. Notification and Alert Spec

```
TOAST (use sonner):
  position: bottom-right
  light theme toasts with colored left border

  Success: white bg, green left border
  Error:   white bg, red left border
  Warning: white bg, yellow left border
  Info:    white bg, blue left border

INLINE BANNERS:

  Warning:
    bg-[#fefce8] border border-[#fde68a]
    rounded-lg p-4 flex items-center gap-3
    Icon: AlertTriangle text-[#ca8a04]
    Text: text-sm text-[#92400e]

  Danger:
    bg-[#fef2f2] border border-[#fecaca]
    Icon: AlertCircle text-[#dc2626]
    Text: text-sm text-[#991b1b]

  Info:
    bg-[#eff6ff] border border-[#bfdbfe]
    Icon: Info text-[#2563eb]
    Text: text-sm text-[#1e40af]

NEW ORDER ALERT:
  bg-[#eff6ff] border-b border-[#bfdbfe]
  flex items-center justify-between px-6 py-3

  Left: Bell icon text-[#2563eb] + "New order #1046"
        text-sm font-medium text-[#1e40af]
  Right: "View Order" button info colored

  Auto-dismiss 8 seconds
```

---

## 22. Menu Item Card Spec

```
CARD:
  background: #ffffff
  border: 1px solid #e5e7eb
  border-radius: rounded-xl
  overflow: hidden
  shadow: shadow-sm
  hover: shadow-md border-[#d1d5db]
  transition: all 200ms
  cursor: pointer

IMAGE AREA:
  height: 160px
  width: 100%
  object-fit: cover
  background: #f9fafb (fallback)

  If no image:
    flex items-center justify-center
    ImageOff icon w-8 h-8 text-[#d1d5db]

  TOP RIGHT (on image):
    Available toggle
    bg-white/80 backdrop-blur-sm
    rounded-full px-2 py-1 text-xs

  TOP LEFT (on image):
    Tag badges
    bg-[#f97316] text-white text-xs px-2 py-0.5 rounded-sm

CARD BODY: p-4

  Name: text-sm font-semibold text-[#111111] mb-0.5
  Category: text-xs text-[#6b7280] mb-3

  BOTTOM ROW: flex items-center justify-between
    Price: text-base font-bold text-[#111111]

    Actions: flex gap-1
      Edit: ghost icon button (Pencil)
      More: ghost icon button (MoreHorizontal)
        dropdown: Edit, Duplicate, Delete

  UNAVAILABLE STATE:
    image: opacity-40 grayscale
    name: text-[#9ca3af]
```

---

## 23. Order Detail Page Spec

```
PAGE LAYOUT: grid grid-cols-3 gap-6

LEFT COLUMN (col-span-1):

  Order Info Card (bg-white border rounded-xl shadow-sm p-6):
    Order number: text-2xl font-bold text-[#111111] "#1045"
    Status badge below number
    Time: text-sm text-[#6b7280] mt-1 "Placed 25 minutes ago"

    Divider: border-t border-[#f3f4f6] my-4

    Order Type:
      flex items-center gap-2
      Icon w-4 h-4 text-[#6b7280]
      text-sm text-[#111111]

    Divider

    Customer section:
      "CUSTOMER" section label
      Name: text-sm font-medium text-[#111111]
      Phone: flex items-center gap-1.5
             Phone icon w-3.5 h-3.5 text-[#9ca3af]
             text-sm text-[#6b7280]
      Address: same pattern with MapPin icon

    Divider

    Special Notes:
      "NOTES" label
      bg-[#f9fafb] border border-[#f3f4f6] rounded-lg p-3
      text-sm text-[#6b7280] italic

  Action Card (mt-4 bg-white border rounded-xl shadow-sm p-4):
    space-y-2
    Status button: full width primary
    Cancel button: full width danger
    Print button:  full width secondary

RIGHT COLUMN (col-span-2):

  Items Card (bg-white border rounded-xl shadow-sm):
    Header: px-6 py-4 border-b border-[#f3f4f6]
      "Order Items" text-base font-semibold

    Items list: px-6
      Each item: flex items-start gap-3 py-4 border-b border-[#f9fafb]

      Quantity circle:
        w-7 h-7 bg-[#f9fafb] border border-[#e5e7eb]
        rounded-md flex items-center justify-center
        text-sm font-semibold text-[#111111]

      Middle (flex-1):
        Item name: text-sm font-medium text-[#111111]
        Variant:   text-xs text-[#6b7280]
        Addons:    text-xs text-[#6b7280]

      Price: text-sm font-semibold text-[#111111]

    Pricing: px-6 py-4
      Each row: flex justify-between text-sm py-1
        Label: text-[#6b7280]
        Value: text-[#111111]

      Divider: border-t border-[#e5e7eb] my-3

      Total row:
        "Total" text-base font-bold text-[#111111]
        Amount text-base font-bold text-[#111111]

      Payment row below total:
        text-xs text-[#6b7280] mt-2
        Payment method + status badge
```

---

## 24. Responsive Breakpoints

```
lg: (1024px+) → full layout, all columns visible
md: (768px+)  → sidebar icon-only (w-16), content adjusts
sm: (640px-)  → sidebar hidden, hamburger in header

SIDEBAR MOBILE:
  hidden by default
  hamburger opens full sidebar as overlay drawer
  overlay: bg-black/30 behind sidebar
  close on overlay click

STATS CARDS:
  lg: grid-cols-4
  md: grid-cols-2
  sm: grid-cols-1

KANBAN:
  always horizontal scroll
  min-width per column: 260px

MENU GRID:
  lg: grid-cols-3
  md: grid-cols-2
  sm: grid-cols-1

ORDER DETAIL:
  lg: grid-cols-3
  md: grid-cols-1 stacked
```

---

## 25. Transitions and Animations

```
STANDARD:
  transition-colors duration-150 ease-in-out

CARDS:
  transition-all duration-200 ease-in-out

SIDEBAR ITEMS:
  transition: all 150ms ease

NEW ORDER FLASH:
  @keyframes flash {
    0%, 100% { border-color: #e5e7eb; }
    50%       { border-color: #f97316; box-shadow: 0 0 0 3px #fed7aa; }
  }
  animation: flash 1s ease-in-out 3

BUTTON PRESS:
  active:scale-95 transition-transform duration-75

SKELETON:
  animate-pulse (Tailwind built-in)
```

---

## 26. Shadcn Components to Install

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add sheet
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add switch
npx shadcn@latest add tabs
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add textarea
npx shadcn@latest add toast
npx shadcn@latest add table
npx shadcn@latest add card
npx shadcn@latest add tooltip
```

---

## 27. globals.css Complete Setup

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #f5f5f5;
  --foreground: #111111;
  --card: #ffffff;
  --card-foreground: #111111;
  --border: #e5e7eb;
  --input: #ffffff;
  --primary: #f97316;
  --primary-foreground: #ffffff;
  --secondary: #f9f9f9;
  --secondary-foreground: #111111;
  --muted: #f9fafb;
  --muted-foreground: #6b7280;
  --accent: #f9f9f9;
  --accent-foreground: #111111;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --ring: #f97316;
  --radius: 0.5rem;
}

* {
  border-color: #e5e7eb;
}

body {
  background-color: #f5f5f5;
  color: #111111;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Light scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f5f5f5;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Focus ring override */
*:focus-visible {
  outline: 2px solid #f97316;
  outline-offset: 2px;
}
```

---

## 28. Quick Reference — Most Used Class Combos

```
PAGE BACKGROUND:
bg-[#f5f5f5] min-h-screen

CARD:
bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm

CLICKABLE CARD:
bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm
hover:shadow-md hover:border-[#d1d5db] transition-all duration-200 cursor-pointer

INPUT:
bg-white border border-[#e5e7eb] text-[#111111]
placeholder:text-[#9ca3af] rounded-lg px-3 py-2
text-sm h-10 w-full shadow-sm
focus:border-[#f97316] focus:outline-none focus:ring-2
focus:ring-[#fed7aa] transition-all duration-150

LABEL:
text-sm font-medium text-[#374151] mb-1.5 block

PRIMARY BUTTON:
bg-[#f97316] hover:bg-[#ea6c0a] text-white text-sm
font-medium px-4 py-2 rounded-lg shadow-sm
transition-colors duration-150 active:scale-95

SECONDARY BUTTON:
bg-white hover:bg-[#f9f9f9] text-[#111111] text-sm
font-medium border border-[#e5e7eb] hover:border-[#d1d5db]
px-4 py-2 rounded-lg shadow-sm transition-colors duration-150

ICON BUTTON:
w-9 h-9 flex items-center justify-center rounded-lg
bg-white hover:bg-[#f9f9f9]
border border-[#e5e7eb] hover:border-[#d1d5db]
shadow-sm transition-colors duration-150

SECTION LABEL:
text-xs font-semibold uppercase tracking-wider text-[#9ca3af]

DIVIDER:
border-t border-[#f3f4f6] my-4

TEXT HIERARCHY:
Heading:   text-[#111111] font-semibold
Body:      text-[#6b7280] text-sm
Muted:     text-[#9ca3af] text-xs

TABLE HEADER CELL:
text-xs font-semibold uppercase tracking-wider text-[#9ca3af] px-4 py-3

TABLE ROW:
border-b border-[#f3f4f6] hover:bg-[#f9fafb]
transition-colors duration-150 cursor-pointer

SIDEBAR NAV ITEM DEFAULT:
flex items-center gap-3 px-3 py-2 rounded-lg
text-sm text-[#6b7280] hover:bg-[#f9f9f9]
hover:text-[#111111] transition-all duration-150 cursor-pointer

SIDEBAR NAV ITEM ACTIVE:
flex items-center gap-3 px-3 py-2 rounded-lg
text-sm text-[#f97316] font-medium bg-[#fff7ed]
```
