import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Package, ShoppingCart, FileText, Users, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/context/Authcontext";
import { UserCard } from './UserCard';
import { getRoleLabel } from "@/utils/roleMapper";

import { Roles, canAccess, Role } from "@/utils/roles"

const getInitials = (name: string = "") => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || "";
};

// Lista de navegação com permissões
const navigation = [
  { name: 'Agendamentos', href: '/appointments', icon: Calendar, roles: undefined },
  { name: 'Produtos', href: '/products', icon: ShoppingCart, roles: undefined },
  { name: 'Clientes', href: '/clients', icon: FileText, roles: [Roles.ADMIN, Roles.SUPPORT] },
  { name: 'Usuários', href: '/users', icon: Users, roles: [Roles.ADMIN] },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  return (
    <aside className={`flex h-screen flex-col border-r border-sidebar-border/50 bg-sidebar-background shadow-lg transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border/50 px-4 relative">
        {!isCollapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/70 bg-clip-text text-transparent">
            Scope technology
          </h1>
        )}
        {isCollapsed && (
          <span className="text-xl font-bold text-sidebar-foreground mx-auto">SC</span>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 rounded-lg hover:bg-sidebar-accent/50 transition-all absolute -right-4 top-4 bg-sidebar-background border border-sidebar-border/50 shadow-md z-10"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1.5 px-3 py-6" aria-label="Main navigation">

        {navigation
          .filter(item => canAccess(user?.role, item.roles)) 
          .map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 relative 
                ${isCollapsed ? 'justify-center' : ''} 
                ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                  )}

                  <item.icon className="h-5 w-5" />

                  {!isCollapsed && <span>{item.name}</span>}
                </>
              )}
            </NavLink>
          ))}
      </nav>

      {/* FOOTER */}
      <div className="border-t border-sidebar-border/50 p-4 space-y-3">
        <UserCard 
          name={user?.name || "User"} 
          role={getRoleLabel(user?.role)} 
          initials={getInitials(user?.name)}
          isCollapsed={isCollapsed}
        />

        <div className="space-y-1.5">
          {!isCollapsed ? (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl py-2.5 transition-all"
              onClick={() => logout()}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-10 transition-all"
              onClick={() => logout()}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
