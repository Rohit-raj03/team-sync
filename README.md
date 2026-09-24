# 🚀 TeamSync — Task Management Web App

> A modern, responsive task management and team collaboration dashboard inspired by the **[OCTOM Figma Design System](https://www.figma.com/design/8EWYdZE81j1t9j4tlNlP8B/Task--Management--Web-App-Design--Community-?node-id=0-1)**.

---

## 🎨 Figma Design Context & Specifications

This application implements the visual language and component architecture from the official **OCTOM Task Management UI Kit**.

### 1. Visual Language & Style

- **Aesthetic:** Crisp, modern SaaS productivity interface with soft floating cards, translucent gradients, pill-shaped controls, and dual-spline metric curves.
- **Elevation & Shadows:** Soft ambient drop shadows (`0 10px 30px -5px rgba(0, 0, 0, 0.04)`) with crisp `1px` borders (`#F1F5F9`).
- **Corner Radii:**
  - Cards & Dashboard Panels: `rounded-2xl` / `rounded-3xl` (16px – 24px)
  - Buttons, Search, & Filter Tabs: `rounded-full` (Pill style)
  - Form Inputs: `rounded-xl` (12px)

### 2. Design Tokens & Color Palette

| Token Role             | Hex Code                   | Purpose                                                     |
| :--------------------- | :------------------------- | :---------------------------------------------------------- |
| **Brand Primary**      | `#4F46E5` &rarr; `#2563EB` | Primary buttons, active sidebar highlights, brand gradients |
| **Primary Light**      | `#EEF2FF` / `#EFF6FF`      | Active background tints, icon containers, chip states       |
| **Canvas Background**  | `#F4F7FE` / `#F8FAFC`      | Main application background behind cards                    |
| **Card Surface**       | `#FFFFFF`                  | Floating widgets, modals, task cards, tables                |
| **Accent Cyan**        | `#06B6D4` / `#0EA5E9`      | "New Task" metric sparkline, secondary area chart           |
| **Accent Violet**      | `#8B5CF6`                  | "Task Completed" sparkline, progress badges                 |
| **Accent Rose**        | `#F43F5E` / `#FB7185`      | Urgent priority alerts, activity milestones                 |
| **Success Emerald**    | `#10B981`                  | Completed tasks, positive growth indicators (`+18%`)        |
| **Text Primary**       | `#0F172A` / `#1E293B`      | Metric values, headings, card titles                        |
| **Text Muted**         | `#64748B` / `#94A3B8`      | Subtitles, timestamps, metadata labels                      |
| **Borders & Dividers** | `#F1F5F9` / `#E2E8F0`      | Structural dividers and container outlines                  |

### 3. Core Screens & UI Modules (from Figma)

- **Header & Navigation Bar:**
  - Pill search bar with leading icon (`Search anything...`)
  - Notification center with badge alert
  - User profile chip with status indicator
  - Gradient quick-action CTA (`+ Create New Project`)
- **Metric Analytics Cards:**
  - **Task Completed:** Count metric, purple sparkline curve, `+18% from last week` pill badge
  - **New Task:** Velocity counter, cyan sparkline curve, `+12% from last week` pill badge
  - **Project Status:** Active sprint progress and health
- **"Task Done" Interactive Activity Chart:**
  - Dual-spline area chart with translucent indigo and cyan gradient fills
  - Timeframe toggles: `Daily`, `Weekly`, and `Monthly`
- **Task Management & Progress Feed:**
  - Task item rows with status icons, priority badges, and inline progress bars (`24% complete`, `65% complete`)
  - Team member avatar stacks and comment count indicators
- **Storage & Resource Capacity Widget:**
  - Circular progress ring (`76% Available Storage`)
  - Storage breakdown by categories: Media, Documents, and Code

---

## 🏗️ 4-Tier Project Architecture

The codebase follows a scalable 4-tier architecture designed for maintainability and team development:

```text
src/
├── app/                         # 1️⃣ APP LAYER
│   ├── App.jsx                  # Root router wrapper
│   ├── main.jsx                 # Entry point with providers
│   ├── store.js                 # Global Redux store configuration
│   ├── router/                  # AppRouter, ProtectedRoute, routes configuration
│   └── providers/               # AppProviders, QueryProvider
│
├── pages/                       # 2️⃣ PRESENTATION LAYER
│   ├── auth/                    # LoginPage, RegisterPage
│   ├── dashboard/               # DashboardPage (OCTOM layout)
│   ├── tasks/                   # TasksPage, TaskDetailsPage
│   ├── projects/                # ProjectsPage, ProjectDetailsPage
│   ├── team/                    # TeamPage
│   ├── profile/                 # ProfilePage
│   └── settings/                # SettingsPage
│
├── features/                    # 3️⃣ BUSINESS / FEATURE LAYER
│   ├── auth/                    # components, hooks, services, store, validation
│   ├── tasks/                   # components, hooks, services, store, utils, validation
│   ├── projects/                # components, hooks, services, store
│   ├── team/                    # components, hooks, services
│   └── notifications/           # components, hooks, services
│
└── shared/                      # 4️⃣ SHARED / INFRASTRUCTURE LAYER
    ├── components/
    │   ├── ui/                  # Button, Input, Modal, Dropdown, Badge, Avatar, Loader
    │   └── layout/              # Sidebar, Navbar, PageHeader, MainLayout
    ├── api/                     # Axios instance & apiClient with auth interceptors
    ├── hooks/                   # useDebounce, useModal
    ├── utils/                   # formatDate, formatTime, localStorage wrapper
    ├── constants/               # Route paths, task status & priority enums
    └── styles/                  # Tailwind CSS configuration and design tokens
```

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Routing:** [React Router v7](https://reactrouter.com/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) + `react-redux`
- **Data Fetching:** [TanStack Query v5](https://tanstack.com/query)
- **Icons:** [Lucide React](https://lucide.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/)

---

## 🚦 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

### 3. Build for Production

```bash
npm run build
```

Generates an optimized production build in the `dist/` directory.

### 4. Preview Production Build

```bash
npm run preview
```

---

## 📋 Figma Reference

- **Design Link:** [OCTOM Task Management Web App Design on Figma](https://www.figma.com/design/8EWYdZE81j1t9j4tlNlP8B/Task--Management--Web-App-Design--Community-?node-id=0-1)
- **Node ID:** `0-1`
