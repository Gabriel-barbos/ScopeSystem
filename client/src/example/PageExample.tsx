import { useEffect, useState } from "react";
import {
  Users as ClientsIcon,
  UserPlus,
  Pen,
  Trash,
  UserPen,
  Mail,
  Phone,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { List } from "antd";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UniversalDrawer } from "@/components/UniversalDrawer";
import { ClientForm } from "@/components/client/ClientForm";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ClientServiceInstance as ClientService } from "@/services/ClientService";
import type { Client } from "@/services/ClientService";

// ============================================
// HELPER FUNCTIONS
// ============================================

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // ============================================
  // CARREGAMENTO E SUBSCRIÇÃO
  // ============================================

  useEffect(() => {
    const unsubscribe = ClientService.subscribe(setClients);
    ClientService.getAll();
    return unsubscribe;
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  function openCreate() {
    setEditingClientId(null);
    setIsDrawerOpen(true);
  }

  function openEdit(clientId: string) {
    setEditingClientId(clientId);
    setIsDrawerOpen(true);
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <ClientsIcon className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-2xl">Clientes</CardTitle>
            <CardDescription>Gerenciar cadastro de clientes</CardDescription>
          </div>

          <Button className="ml-auto" size="sm" onClick={openCreate}>
            Criar Cliente <UserPlus />
          </Button>

          {/* DRAWER UNIVERSAL */}
          <UniversalDrawer
            open={isDrawerOpen}
            onOpenChange={(open) => {
              setIsDrawerOpen(open);
              if (!open) setEditingClientId(null);
            }}
            title={editingClientId ? "Editar Cliente" : "Cadastrar Cliente"}
            icon={editingClientId ? <UserPen /> : <UserPlus />}
            styleType={editingClientId ? "edit" : "create"}
          >
            <ClientForm
              clientId={editingClientId ?? undefined}
              onCancel={() => {
                setIsDrawerOpen(false);
                setEditingClientId(null);
              }}
              onSuccess={async () => {
                await ClientService.getAll(true); // Refresh
                setIsDrawerOpen(false);
                setEditingClientId(null);
              }}
            />
          </UniversalDrawer>
        </div>
      </CardHeader>

      <CardContent>
        <List
          dataSource={clients}
          renderItem={(client: Client) => (
            <List.Item
              key={client.id}
              actions={[
                <Button
                  key="edit"
                  variant="secondary"
                  size="sm"
                  onClick={() => openEdit(client.id)}
                >
                  <Pen />
                </Button>,
                <Button
                  key="delete"
                  variant="default"
                  size="sm"
                  className="bg-transparent hover:bg-destructive/10 text-destructive border-red-600/30 border-2"
                  onClick={() => setDeleteClientId(client.id)}
                >
                  <Trash />
                </Button>,
              ]}
            >
              {/* MODAL DE CONFIRMAÇÃO */}
              <ConfirmModal
                open={deleteClientId === client.id}
                onOpenChange={(open) => !open && setDeleteClientId(null)}
                title="Excluir cliente"
                description={`Tem certeza que deseja excluir "${client.name}"?`}
                confirmText="Excluir"
                onConfirm={async () => {
                  await ClientService.remove(client.id);
                  setDeleteClientId(null);
                }}
              />

              {/* CONTEÚDO DO ITEM */}
              <List.Item.Meta
                avatar={
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/30 text-primary text-sm font-semibold">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                }
                title={
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-foreground">
                      {client.name}
                    </span>
                  </div>
                }
                description={
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {client.phone}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </CardContent>
    </Card>
  );
}