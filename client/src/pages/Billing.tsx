import { useState } from "react";
import { Receipt } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ClientPicker } from "@/components/global/ClientPicker";
import { ClientBillingTab } from "@/components/clients/ClientBillingTab";
import { EXPERIMENTAL_CLIENT_DETAIL } from "@/config/experimental";
import { Tag } from "antd";
export default function Billing() {
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  if (!EXPERIMENTAL_CLIENT_DETAIL) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-medium text-muted-foreground">Módulo de Faturamento Desativado</h2>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full  space-y-6">
      <Card className="mx-auto border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-2xl">Faturamento <Tag color="cyan">Protótipo</Tag></CardTitle>
              <CardDescription>Gerencie cobranças e mensalidades dos clientes</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-0 pb-0">
          <div className="bg-card border rounded-lg p-4 mb-6 shadow-sm">
            <div className="max-w-md space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mr-3">
                Selecione o Cliente
              </label>
              <ClientPicker 
                value={selectedClientId} 
                onChange={(val) => setSelectedClientId(val || "")} 
              />
            </div>
          </div>

          {selectedClientId ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ClientBillingTab clientId={selectedClientId} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-4 border rounded-lg border-dashed">
              <div className="bg-muted p-4 rounded-full">
                <Receipt className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-lg">Nenhum cliente selecionado</h3>
                <p className="text-sm text-muted-foreground">Selecione um cliente acima para visualizar seus dados de faturamento.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
