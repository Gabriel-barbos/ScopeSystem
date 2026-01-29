import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/context/Authcontext";
import { Header } from "./Header";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: ReactNode;
}

const getInitials = (name: string = "") => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || "";
};

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userName={user?.name || "User"} userInitials={getInitials(user?.name)} />
        <main className="flex-1 overflow-y-auto bg-[hsl(var(--page-background))]">
          <div className="w-full max-w-[1800px] mx-auto px-4 py-6 overflow-visible">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}