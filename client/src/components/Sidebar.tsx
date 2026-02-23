import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Package, CarFront ,Cpu, Store,ChartArea,SearchCheck,MailPlus , Users, LogOut, ChevronLeft, ChevronRight,BadgeMinus  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/context/Authcontext";
import { UserCard } from './UserCard';
import { getRoleLabel } from "@/utils/roleMapper";
import logo from "@/assets/logo.jpg";
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
  { name: 'Agendamentos', href: '/appointments', icon: Calendar, roles: [Roles.ADMIN, Roles.SCHEDULING, ] },
  { name: 'Validação', href: '/validation', icon: SearchCheck, roles: [Roles.ADMIN, Roles.VALIDATION] },
  { name: 'Serviços', href: '/services', icon: CarFront, roles: [Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT, Roles.VALIDATION, Roles.BILLING] },
  { name: 'Solicitações de Manutenção', href: '/maintenance-requests', icon: MailPlus, roles: [Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT] },
  { name: 'Relatórios', href: '/reports', icon: ChartArea, roles: [Roles.ADMIN, Roles.SUPPORT,Roles.BILLING] },
  { name: 'Produtos', href: '/products', icon: Cpu, roles: [Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT, Roles.VALIDATION, Roles.BILLING] },
  { name: 'Clientes', href: '/clients', icon: Store , roles: [Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT, Roles.VALIDATION, Roles.BILLING] },
  { name: 'Usuários', href: '/users', icon: Users, roles: [Roles.ADMIN] },
];

  // { name: 'Remoção', href: '/removal', icon: BadgeMinus, roles: [Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT]},   { name: 'Técnicos', href: '/technicians', icon: UserSearch, roles: [Roles.ADMIN, Roles.SCHEDULING, Roles.BILLING, Roles.BILLING] }


export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  return (
  <aside
  className={`flex h-dvh flex-col border-r border-sidebar-border/50 bg-sidebar-background shadow-lg transition-all duration-300 ease-in-out ${
    isCollapsed ? 'w-20' : 'w-64'
  }`}
>
      
      {/* Logo */}
    <div className="relative flex h-20 items-center justify-center border-b border-sidebar-border/50 px-3">
  {!isCollapsed && (
    <div className="flex h-full w-full items-center justify-center">
      <img
        src={logo}
        alt="Scope System Logo"
        className="max-h-16 w-auto object-contain"
      />
    </div>
  )}

  {isCollapsed && (
    <img
      src={logo}
      alt="Scope Logo"
      className="h-10 w-10 object-contain"
    />
  )}

  <Button
    variant="ghost"
    size="icon"
    onClick={() => setIsCollapsed(!isCollapsed)}
    className="absolute -right-4 top-6 h-8 w-8 rounded-lg bg-sidebar-background border border-sidebar-border/50 shadow-md hover:bg-sidebar-accent/50 transition-all z-10"
  >
    {isCollapsed ? (
      <ChevronRight className="h-4 w-4" />
    ) : (
      <ChevronLeft className="h-4 w-4" />
    )}
  </Button>
</div>

<nav
  className="flex-1 overflow-y-auto space-y-1.5 px-3 py-6 sidebar-scroll"
  aria-label="Main navigation"
>
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
