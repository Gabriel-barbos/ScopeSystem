import { MailPlus, Loader2, AlertCircle, Inbox } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MaintenanceCard from "@/components/maintenence/MaintenenceCard";
import { useMaintenanceRequestService } from "@/services/MaintenenceRequestService";



export default function MaintenenceRequests() {
      const { data, isLoading, isError } = useMaintenanceRequestService();
      const requests = data?.data ?? [];

  return (
    <Card className="mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <MailPlus  className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-2xl">Solicitações de Manutenção</CardTitle>
            <CardDescription>Monitor and manage maintenance requests</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading...</p>}  {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <p className="text-sm">Erro ao carregar solicitações</p>
          </div>
        )}

        {!isLoading && !isError && requests.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border">
            <Inbox className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma solicitação encontrada
            </p>
          </div>
        )}

        {!isLoading && !isError && requests.length > 0 && (
          <div className="flex flex-col gap-3">
            {requests.map((request) => (
              <MaintenanceCard
                key={request._id}
                request={request}
                onOpen={(req) => console.log("Abrir:", req.ticketNumber)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
