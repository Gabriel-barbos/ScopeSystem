# Corporate Web Application

A professional corporate web application skeleton built with React, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- 🎨 **Design System**: Complete HSL-based color system with light/dark theme support
- 🧭 **Navigation**: Sidebar navigation with active route highlighting
- 👤 **User Interface**: User card with avatar, theme toggle, and logout functionality
- 📱 **Responsive**: Mobile-friendly layout with clean component architecture
- ♿ **Accessible**: ARIA labels, keyboard navigation, and semantic HTML
- 🎯 **Type-Safe**: Built with TypeScript for better developer experience

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx          # Main layout wrapper
│   ├── Sidebar.tsx         # Left navigation sidebar
│   ├── Header.tsx          # Top header with user greeting
│   ├── UserCard.tsx        # User information display
│   └── ThemeToggle.tsx     # Light/dark theme switcher
├── pages/
│   ├── Appointments.tsx    # Appointments page
│   ├── Stock.tsx           # Stock management page
│   ├── Products.tsx        # Products catalog page
│   ├── Clients.tsx         # Clients management page
│   └── Users.tsx           # Users administration page
├── styles/
│   └── index.css           # Design system & global styles
└── App.tsx                 # Routes configuration
```

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Steps

```sh
# 1. Clone the repository
git clone <YOUR_GIT_URL>

# 2. Navigate to project directory
cd <YOUR_PROJECT_NAME>

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Files

- **src/index.css**: Design system with HSL colors and CSS variables for theming
- **src/components/Layout.tsx**: Main layout structure
- **src/components/Sidebar.tsx**: Navigation sidebar with routing
- **src/App.tsx**: Application routes and configuration
- **tailwind.config.ts**: Tailwind CSS configuration

## Design System

The design system uses HSL colors for easy theme customization:

- Primary: Professional blue (`214 95% 50%`)
- Background: Light gray / Dark charcoal
- Cards: White / Dark gray
- Fully supports light and dark modes

Toggle theme using the button in the sidebar footer.

## Navigation

The sidebar includes the following routes:

- `/appointments` - Appointments management
- `/stock` - Inventory control
- `/products` - Product catalog
- `/clients` - Client information
- `/users` - User administration

Active routes are highlighted with visual indicators and `aria-current` for accessibility.

## Technologies

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **React Router** - Routing
- **next-themes** - Theme management
- **Lucide React** - Icons

## Deployment

Build the production version:

```sh
npm run build
```

The `dist` folder will contain the production-ready files.

## License

This is a skeleton project for corporate applications.
