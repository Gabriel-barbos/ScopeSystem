import { useState } from "react";
import { SquareUser, Store, Plus, Search, SquarePen, CirclePlus, CircleUserRound, Building2, Pen, Trash, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputWithIcon } from "@/components/InputWithIcon";
import { UniversalDrawer } from "@/components/UniversalDrawer";
import { ClientForm } from "@/components/forms/ClientForm";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useClientService } from "@/services/ClientService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List } from "antd";
import { Badge } from "@/components/ui/badge";
import RoleIf from "@/components/RoleIf";
import { Roles } from "@/utils/roles";


type ClientType = "Cliente" | "subCliente";
type ActiveTab = "all" | ClientType;

function getTypeLabel(type?: string): string {
  if (type === "subCliente") return "Sub Cliente";
  if (type === "Cliente") return "Cliente";
  return type ?? "";
}

function TypeIcon({ type, className }: { type?: string; className?: string }) {
  if (type === "subCliente") return <Building2 className={className} />;
  return <CircleUserRound className={className} />;
}

function getTypeBadgeClass(type?: string): string {
  if (type === "subCliente")
    return "bg-violet-100 text-violet-700 border border-violet-300 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-700";
  if (type === "Cliente")
    return "bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700";
  return "";
}


export default function Clients() {
  const { data: clients, isLoading } = useClientService();
  const { deleteClient } = useClientService();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");

  const allClients = clients ?? [];
  const countCliente = allClients.filter((c) => c.type === "Cliente").length;
  const countSubCliente = allClients.filter((c) => c.type === "subCliente").length;

  const filteredClients = allClients
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter((c) => (activeTab === "all" ? true : c.type === activeTab))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));

  function openCreate() {
    setEditingClientId(null);
    setIsDrawerOpen(true);
  }

  function openEdit(clientId: string) {
    setEditingClientId(clientId);
    setIsDrawerOpen(true);
  }

  return (
    <Card className="mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Store className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>

          <div>
            <CardTitle className="text-2xl">Clientes</CardTitle>
            <CardDescription>Visualize e administre seus clientes</CardDescription>
          </div>

          <RoleIf roles={[Roles.ADMIN, Roles.SUPPORT, Roles.COMMERCIAL, Roles.CX]}>
            <Button className="ml-auto" size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Cadastrar Cliente
            </Button>
          </RoleIf>

          <UniversalDrawer
            open={isDrawerOpen}
            onOpenChange={(open) => {
              setIsDrawerOpen(open);
              if (!open) setEditingClientId(null);
            }}
            title={editingClientId ? "Editar Cliente" : "Cadastrar Cliente"}
            icon={editingClientId ? <SquarePen /> : <CirclePlus />}
            styleType={editingClientId ? "edit" : "create"}
          >
            <ClientForm
              clientId={editingClientId ?? undefined}
              onCancel={() => {
                setIsDrawerOpen(false);
                setEditingClientId(null);
              }}
              onSuccess={async () => {
                setIsDrawerOpen(false);
                setEditingClientId(null);
              }}
            />
          </UniversalDrawer>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid w-full max-w-sm items-center gap-2">
          <Label className="text-sm">Pesquisar cliente</Label>
          <InputWithIcon
            icon={<Search className="h-5 w-5" />}
            type="text"
            id="search"
            placeholder="Digite o nome do cliente"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ActiveTab)}
          className="mt-6"
        >
          <TabsList className="h-10">
            <TabsTrigger value="all" className="gap-2">
              <Users className="h-4 w-4" />
              Todos
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {allClients.length}
              </span>
            </TabsTrigger>

            <TabsTrigger value="Cliente" className="gap-2">
              <CircleUserRound className="h-4 w-4" />
              Clientes
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {countCliente}
              </span>
            </TabsTrigger>

            <TabsTrigger value="subCliente" className="gap-2">
              <Building2 className="h-4 w-4" />
              Sub Clientes
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {countSubCliente}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {!isLoading && filteredClients.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                <Users className="h-10 w-10 opacity-30" />
                <p className="text-sm">Nenhum cliente encontrado</p>
              </div>
            )}

            <List
              loading={isLoading}
              dataSource={filteredClients}
              renderItem={(client) => (
                <List.Item
                  key={client._id}
                  className="rounded-lg px-2 transition-colors hover:bg-muted/40"
                  actions={[
                    <RoleIf
                      key="actions"
                      roles={[Roles.ADMIN, Roles.SUPPORT, Roles.COMMERCIAL, Roles.CX]}
                    >
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(client._id)}
                          className="gap-1.5"
                        >
                          <Pen className="h-3.5 w-3.5" />
                          Editar
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteClientId(client._id)}
                        >
                          <Trash className="h-3.5 w-3.5" />
                          Excluir
                        </Button>
                      </div>
                    </RoleIf>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="mx-2 h-12 w-12 rounded-xl overflow-hidden bg-muted flex items-center justify-center ring-1 ring-border">
                        {client.image?.[0] ? (
                          <img
                            src={client.image[0]}
                            alt={client.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <SquareUser className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    }
                    title={
                      <span className="font-medium text-foreground">{client.name}</span>
                    }
                    description={
                      client.type ? (
                        <Badge
                          variant="outline"
                          className={`mt-1 gap-1.5 text-xs font-medium ${getTypeBadgeClass(client.type)}`}
                        >
                          <TypeIcon type={client.type} className="h-3 w-3" />
                          {getTypeLabel(client.type)}
                        </Badge>
                      ) : null
                    }
                  />

                  <ConfirmModal
                    open={deleteClientId === client._id}
                    onOpenChange={(open) => !open && setDeleteClientId(null)}
                    title="Excluir cliente"
                    description={`Tem certeza que deseja excluir "${client.name}"? Esta ação não pode ser desfeita.`}
                    confirmText="Excluir"
                    onConfirm={() => {
                      deleteClient.mutate(client._id);
                      setDeleteClientId(null);
                    }}
                  />
                </List.Item>
              )}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}