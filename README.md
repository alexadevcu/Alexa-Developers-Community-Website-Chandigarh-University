# Alexa Developers Community (ADC) - Chandigarh University

Welcome to the official web platform for the **Alexa Developers Community (ADC)** at Chandigarh University. 

This platform serves as the central hub for the community, showcasing our leadership, events, achievements, and technical initiatives. It is designed to be a highly performant, visually stunning, and dynamic single-page application (SPA).

---

## 🌟 Project Overview

ADC CU is a student-led collective pioneering Voice Interfaces, Edge AI integrations, and next-generation developer tooling. This web application reflects that mission by offering a sleek, interactive user experience paired with a powerful, hidden Content Management System (CMS) that allows community leaders to manage content in real-time without writing code.

---

## 🛠️ Architecture & Tech Stack

This project is built using modern web technologies to ensure scalability, speed, and ease of maintenance.

### **Frontend Engine**
- **React 19 (via Vite):** The core UI framework, chosen for its fast rendering and robust component ecosystem.
- **TypeScript:** Enforces type safety across the application, reducing runtime errors and improving code readability.
- **React Router DOM:** Handles client-side routing, enabling seamless, instant page transitions without full page reloads.

### **Styling & Animations**
- **Tailwind CSS:** A utility-first CSS framework used for rapid UI development and implementing a cohesive design system.
- **Framer Motion:** Powers the fluid, hardware-accelerated animations, scroll reveals, and interactive micro-interactions throughout the site.
- **Lucide React:** A clean, modern icon library used across all components.

### **Backend & Database (BaaS)**
- **Supabase:** The entire backend infrastructure is powered by Supabase.
  - **PostgreSQL Database:** Stores all structured data (Events, Team Members, Hall of Fame).
  - **Supabase Auth:** Handles secure administrator login and session management.
  - **Supabase Storage:** Manages the uploading and serving of dynamic assets like event posters.

### **Deployment & Orchestration**
- **Vercel:** The application is easily deployable on Vercel. Because this is a React SPA, routing is explicitly handled via the `vercel.json` file at the root, which rewrites all incoming URL requests back to `index.html`.
- **Docker:** Multi-stage `Dockerfile` and `docker-compose.yml` are included for isolated development and scalable production deployment behind an Nginx reverse proxy.

---

## 🧭 Core Features & How They Work

### 1. Dynamic Public Pages
The public-facing website pulls data directly from the Supabase database in real-time.
- **Home:** Features a high-impact hero video, dynamic faculty mentor listings, and a showcase of past sponsors.
- **Events:** Displays chronological lists of upcoming and past events. Posters are fetched from Supabase Storage.
- **Team:** A categorized, responsive grid (Presidents, Leads, Members) showcasing both the current roster and a historical archive of past batches.
- **Legacy:** Features the heritage of the chapter, highlighting past Presidents and Vice Presidents, their placements, and their community impact.
- **Hall of Fame:** Highlights exceptional achievements and global representations by community members.

### 2. Admin Dashboard (CMS)
The platform includes a hidden, authenticated Admin Panel (accessible via `/admin`) that allows core team members to manage the website's content.

**Admin Capabilities:**
- **Authentication:** Protected by Supabase Auth and a custom `<ProtectedRoute>` wrapper. Unauthenticated users are redirected to a secure login screen.
- **Event Management:** Create, edit, or delete events. Upload posters directly to Supabase storage, and toggle event registration statuses.
- **Team Management:** Add or update team members. Features advanced local **Search** and **Sort** (by Name, Role, Batch, or Custom Order Index) to easily manage large rosters.
- **Legacy Management:** Manage the chapter's alumni leaders, tracking their tenures, current placements, and key contributions with role constraints.
- **Hall of Fame Management:** Curate top achievements with specialized categorizations.

### 3. Database Structure
The application relies on three primary Supabase tables:
1. `events`: Stores event metadata (Name, Date, Status, Description, Poster URL, Registration Link).
2. `team_members`: Stores member profiles (Name, Role, Category, LinkedIn, Bio, Batch Year, Current/Past Status, Order Index).
3. `legacy_members`: Stores historical leadership profiles (Name, Role, Tenure, Company, Location, Bio, Contributions).
4. `hall_of_fame`: Stores achievement records (Member Name, Event Name, Category, Photo URL).

*(All tables are ordered predictably using dedicated `order_index` or timestamp columns).*

---

## 🎨 UI/UX Design Philosophy

The application is built with a premium, modern aesthetic in mind:
- **Glassmorphism:** Extensive use of `backdrop-blur`, semi-transparent white/dark overlays, and glowing atmospheric orbs to create depth.
- **GPU Optimization:** Heavy visual effects (like deep blurs) are optimized using `transform-gpu` and hardware acceleration to prevent visual artifacts on mobile browsers (like iOS Safari).
- **Responsive Layouts:** Complex CSS grids that gracefully degrade from 5-column desktop views down to optimized mobile layouts.
- **Graceful Fallbacks:** If a profile photo or event poster is missing, the system automatically injects beautiful, theme-aware placeholder icons to preserve the layout integrity.

---

*This README serves as the architectural source of truth for the ADC CU web platform. It is designed to help future developers, leads, and contributors understand the ecosystem at a glance.*
