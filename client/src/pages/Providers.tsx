import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldUser,
  Plus,
  Search,
  CirclePlus,
  SquarePen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UniversalDrawer } from "@/components/global/UniversalDrawer";
import { ProviderForm } from "@/components/forms/ProviderForm";
import { ConfirmModal } from "@/components/global/ConfirmModal";
import { ProviderCard } from "@/components/providers/ProviderCard";
import { useProviderService } from "@/services/ProviderService";
import RoleIf from "@/components/layout/RoleIf";
import { Roles } from "@/utils/roles";

export default function Providers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: response, isLoading } = useProviderService({ limit: 100 });

  const providers = response?.data ?? [];

  const filtered = providers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditingId(null);
    setIsDrawerOpen(true);
  }

  return (
    <Card className="mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <ShieldUser className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Prestadores</CardTitle>
            <CardDescription>Gerencie os prestadores</CardDescription>
          </div>

          <RoleIf roles={[Roles.ADMIN, Roles.SUPPORT]}>
            <Button className="ml-auto" size="sm" onClick={openCreate}>
              Novo Prestador <Plus className="ml-1 h-4 w-4" />
            </Button>
          </RoleIf>

          <UniversalDrawer
            open={isDrawerOpen}
            onOpenChange={(open) => {
              setIsDrawerOpen(open);
              if (!open) setEditingId(null);
            }}
            title={editingId ? "Editar Prestador" : "Novo Prestador"}
            icon={editingId ? <SquarePen /> : <CirclePlus />}
            styleType={editingId ? "edit" : "create"}
          >
            <ProviderForm
              providerId={editingId ?? undefined}
              onCancel={() => {
                setIsDrawerOpen(false);
                setEditingId(null);
              }}
              onSuccess={() => {
                setIsDrawerOpen(false);
                setEditingId(null);
              }}
            />
          </UniversalDrawer>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search */}
        <div className="mb-6 max-w-sm">
          <Label htmlFor="search-provider" className="text-sm text-muted-foreground mb-2 block">
            Buscar prestador
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-provider"
              type="text"
              placeholder="Digite o nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            Carregando prestadores...
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <ShieldUser className="h-10 w-10 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground text-sm">
              {search ? "Nenhum prestador encontrado" : "Nenhum prestador cadastrado"}
            </p>
          </div>
        )}

        {/* Grid de Cards */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((provider) => (
              <ProviderCard
                key={provider._id}
                provider={provider}
                onClick={() => navigate(`/providers/${provider._id}`)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
