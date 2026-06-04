import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Building2, Mail, Phone, User, Trash, SquarePen, Wrench, CalendarRange } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { providerApi, useProviderService } from "@/services/ProviderService";
import { UniversalDrawer } from "@/components/global/UniversalDrawer";
import { ProviderForm } from "@/components/forms/ProviderForm";
import { ConfirmModal } from "@/components/global/ConfirmModal";
import RoleIf from "@/components/layout/RoleIf";
import { Roles } from "@/utils/roles";

export default function ProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("contatos");
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider", id],
    queryFn: () => providerApi.getById(id!),
    enabled: !!id,
  });

  const { deleteProvider } = useProviderService();

  const handleDelete = async () => {
    try {
      await deleteProvider.mutateAsync(id!);
      toast.success("Prestador excluído com sucesso!");
      navigate("/providers");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || "Erro ao excluir o prestador";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Carregando prestador...
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <h2 className="text-xl font-medium">Prestador não encontrado</h2>
        <Button onClick={() => navigate("/providers")}>Voltar para Prestadores</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-6">
      {/* Voltar / Breadcrumb */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/providers")}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para listagem
        </Button>
      </div>

      {/* Header Card */}
      <Card className="overflow-hidden border border-muted/80 shadow-sm relative">
        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-primary/40 via-primary/80 to-primary/40" />
        <CardContent className="p-6 pt-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 shrink-0 rounded-2xl overflow-hidden bg-muted flex items-center justify-center border border-muted-foreground/15 shadow-sm">
                {provider.image ? (
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-muted-foreground opacity-50" />
                )}
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{provider.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarRange className="h-3.5 w-3.5" />
                    Cadastrado em{" "}
                    {new Date(provider.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {provider.contacts.length} {provider.contacts.length === 1 ? "contato" : "contatos"}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações */}
            <RoleIf roles={[Roles.ADMIN, Roles.SUPPORT]}>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDrawerOpen(true)}
                  className="gap-2 border-muted hover:bg-muted h-9"
                >
                  <SquarePen className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive h-9"
                >
                  <Trash className="h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </RoleIf>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-12 w-full justify-start rounded-none border-b bg-transparent p-0 mb-6 gap-2">
          <TabsTrigger
            value="contatos"
            className="relative h-12 rounded-none border-b-2 border-transparent px-4 md:px-6 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent flex items-center gap-2 transition-colors"
          >
            <User className="h-4 w-4" />
            Contatos
          </TabsTrigger>
          <TabsTrigger
            value="tecnicos"
            className="relative h-12 rounded-none border-b-2 border-transparent px-4 md:px-6 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent flex items-center gap-2 transition-colors"
          >
            <Wrench className="h-4 w-4" />
            Técnicos
          </TabsTrigger>
        </TabsList>

        {/* Tab Contatos */}
        <TabsContent value="contatos" className="mt-0 outline-none">
          {provider.contacts.length === 0 ? (
            <Card className="border border-dashed bg-muted/10">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <User className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum contato cadastrado.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Edite o prestador para adicionar novos contatos.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {provider.contacts.map((contact) => (
                <Card key={contact._id} className="border border-muted/70 bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                  <CardContent className="p-4 space-y-3.5">
                    <div className="flex items-center gap-2.5 border-b border-muted/50 pb-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold text-sm text-foreground truncate">{contact.name}</span>
                    </div>

                    <div className="space-y-2">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/75 group-hover:text-primary" />
                          <span className="truncate group-hover:underline">{contact.phone}</span>
                        </a>
                      )}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
                        >
                          <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/75 group-hover:text-primary" />
                          <span className="truncate group-hover:underline">{contact.email}</span>
                        </a>
                      )}
                      {!contact.phone && !contact.email && (
                        <span className="text-[11px] italic text-muted-foreground/45">Sem informações de contato</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Técnicos (Em Desenvolvimento) */}
        <TabsContent value="tecnicos" className="mt-0 outline-none">
          <Card className="border border-dashed bg-muted/10">
            <CardContent className="flex flex-col items-center justify-center p-16 text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Wrench className="h-7 w-7 text-primary animate-pulse" />
              </div>
              <Badge variant="secondary" className="mb-2 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 dark:bg-yellow-950 dark:text-yellow-400 rounded-full px-2.5 py-0.5">
                Em desenvolvimento
              </Badge>
              <h3 className="text-base font-semibold text-foreground">Gestão de Técnicos</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1.5">
                Em desenvolvimento, Gabriel esta dando seu melhor !!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Drawer */}
      <UniversalDrawer
        open={isEditDrawerOpen}
        onOpenChange={(open) => setIsEditDrawerOpen(open)}
        title="Editar Prestador"
        icon={<SquarePen />}
        styleType="edit"
      >
        <ProviderForm
          providerId={provider._id}
          onCancel={() => setIsEditDrawerOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["provider", id] });
            setIsEditDrawerOpen(false);
          }}
        />
      </UniversalDrawer>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={(open) => setIsDeleteModalOpen(open)}
        title="Excluir prestador"
        description={`Tem certeza que deseja excluir "${provider.name}"? Esta ação não poderá ser desfeita.`}
        confirmText="Excluir"
        onConfirm={handleDelete}
      />
    </div>
  );
}
