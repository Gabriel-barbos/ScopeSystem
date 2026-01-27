import { useState } from "react";
import { SquareUser, Store, Plus, Search, SquarePen, CirclePlus, CircleUserRound, Building2, Pen, Trash } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { InputWithIcon } from "@/components/InputWithIcon";
import { UniversalDrawer } from "@/components/UniversalDrawer";
import { ClientForm } from "@/components/forms/ClientForm";
import { ConfirmModal } from "@/components/ConfirmModal"
import { useClientService } from "@/services/ClientService";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs";
import { List } from "antd";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


export default function Clients() {

  const { data: clients, isLoading } = useClientService();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { deleteClient } = useClientService();
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "Simples" | "Mensalidade">("all");


  
//search and filtered clients
  const filteredClients = (clients ?? [])
    .filter((client) =>
      client.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((client) => {
      if (activeTab === "all") return true;
      return client.type === activeTab;
    });

  // abrir drawer em modo criar
  function openCreate() {
    setEditingClientId(null);
    setIsDrawerOpen(true);
  }

  // abrir drawer em modo editar para um cliente específico
  function openEdit(clientId: string) {
    setEditingClientId(clientId);
    setIsDrawerOpen(true);
  }

  function getTypeBadgeVariant(type?: string) {
  if (type === "Mensalidade") return "default";
  if (type === "Avulso Simples") return "secondary";
  return "default";
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
          <Button className="ml-auto" size="sm" onClick={openCreate}>
            Cadastrar Cliente <Plus />
          </Button>

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
          <InputWithIcon icon={<Search className="h-5 w-5" />} type="text" id="search" placeholder="Digite o nome do cliente" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
          className="mt-6"
        >
          <TabsList>
            <TabsTrigger value="all">Todos ({clients?.length})</TabsTrigger>
            <TabsTrigger value="Cliente"> <CircleUserRound className="m-1" /> Simples</TabsTrigger>
            <TabsTrigger value="Sub-Cliente"> <Building2 className="m-1" />Sub-Cliente</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>

            <List
              dataSource={filteredClients}
              renderItem={(client) => (
                <List.Item key={client._id}
                  actions={[
                    <Button
                      key="edit"
                      variant="secondary"
                      size="sm"
                      onClick={() => openEdit(client._id)}
                    >
                      <Pen />
                    </Button>,
                    <Button
                      key="delete"
                      variant="default"
                      size="sm"
                      className="bg-transparent hover:bg-destructive/10 text-destructive border-red-600/30 border-2"
                      onClick={() => setDeleteClientId(client._id)}
                    >
                      <Trash />
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="mx-2 h-14 w-14 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {client.image?.[0] ? (
                          <img
                            src={client.image[0]}
                            alt={client.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          
                          <SquareUser  className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    }
                    title={client.name}
                    description={<div className="flex items-center gap-2">

                      {client.type && (
                        <Badge variant={getTypeBadgeVariant(client.type)} className="gap-1">
                          {client.type === "Mensalidade" ? (
                            <Building2 className="h-3 w-3" />
                          ) : (
                            <CircleUserRound className="h-3 w-3" />
                          )}
                          {client.type}
                        </Badge>
                      )}
                    </div>}
                  />
                  <ConfirmModal
                    open={deleteClientId === client._id}
                    onOpenChange={(open) => !open && setDeleteClientId(null)}
                    title="Excluir cliente"
                    description={`Tem certeza que deseja excluir "${client.name}"?`}
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
