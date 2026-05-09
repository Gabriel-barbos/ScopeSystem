import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SquareUser, Building2, CircleUserRound, ArrowLeft, Truck, Receipt, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientService } from "@/services/ClientService";
import { ClientFrotaTab } from "@/components/clients/ClientFrotaTab";
import { ClientBillingTab } from "@/components/clients/ClientBillingTab";
import { ClientAjustesTab } from "@/components/clients/ClientAjustesTab";
import { EXPERIMENTAL_CLIENT_DETAIL } from "@/config/experimental";
import { Tag } from "antd";
function getTypeLabel(type?: string): string {
  if (type === "subCliente") return "Sub Cliente";
  if (type === "Cliente") return "Cliente principal";
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

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: clients, isLoading } = useClientService();
  const [activeTab, setActiveTab] = useState("frota");

  // Redirect se a flag estiver desligada
  useEffect(() => {
    if (!EXPERIMENTAL_CLIENT_DETAIL) {
      navigate("/clients", { replace: true });
    }
  }, [navigate]);

  if (!EXPERIMENTAL_CLIENT_DETAIL) return null;

  const client = clients?.find((c) => c._id === id);

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center">Carregando detalhes...</div>;
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <h2 className="text-xl font-medium">Cliente não encontrado</h2>
        <Button onClick={() => navigate("/clients")}>Voltar para Clientes</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/clients")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para listagem
        </Button>
        <Tag color="blue">Protótipo</Tag>
      </div>

      <Card className="overflow-hidden border-2 border-muted shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="h-18 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted flex items-center justify-center ring-1 ring-border shadow-sm">
              {client.image?.[0] ? (
                <img
                  src={client.image[0]}
                  alt={client.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <SquareUser className="h-10 w-10 text-muted-foreground opacity-50" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{client.name}</h1> 
              
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {client.type && (
                  <Badge variant="outline" className={`gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${getTypeBadgeClass(client.type)}`}>
                    <TypeIcon type={client.type} className="h-3.5 w-3.5" />
                    {getTypeLabel(client.type)}
                  </Badge>
                )}
                
                {client.parent && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <span className="opacity-70">Sub-cliente de:</span>
                    <span className="font-medium text-foreground">{client.parent.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-12 w-full justify-start rounded-none border-b bg-transparent p-0 mb-6 gap-2">
          <TabsTrigger 
            value="frota" 
            className="relative h-12 rounded-none border-b-2 border-transparent px-4 md:px-6 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent flex items-center gap-2 transition-colors"
          >
            <Truck className="h-4 w-4" />
            Frota
          </TabsTrigger>
          <TabsTrigger 
            value="faturamento" 
            className="relative h-12 rounded-none border-b-2 border-transparent px-4 md:px-6 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent flex items-center gap-2 transition-colors"
          >
            <Receipt className="h-4 w-4" />
            Faturamento
          </TabsTrigger>
          <TabsTrigger 
            value="ajustes" 
            className="relative h-12 rounded-none border-b-2 border-transparent px-4 md:px-6 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent flex items-center gap-2 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frota" className="mt-0 outline-none">
          <ClientFrotaTab clientId={client._id} />
        </TabsContent>

        <TabsContent value="faturamento" className="mt-0 outline-none">
          <ClientBillingTab clientId={client._id} />
        </TabsContent>

        <TabsContent value="ajustes" className="mt-0 outline-none">
          <ClientAjustesTab clientId={client._id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
