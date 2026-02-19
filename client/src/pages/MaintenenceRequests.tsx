import { MailPlus, AlertCircle, Inbox, RefreshCw } from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import MaintenanceCard from "@/components/maintenence/MaintenenceCard";
import { useMaintenanceRequestService } from "@/services/MaintenenceRequestService";

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-destructive">
      <AlertCircle className="h-8 w-8" />
      <p className="text-sm font-medium">Erro ao carregar solicitações</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
      <Inbox className="h-10 w-10 text-muted-foreground" />
      <p className="text-sm font-medium text-muted-foreground">
        Nenhuma solicitação em aberto
      </p>
      <p className="text-xs text-muted-foreground/70">
        Solicitações concluídas não são exibidas aqui
      </p>
    </div>
  );
}

export default function MaintenenceRequests() {
  const { data, isLoading, isError, refetch } = useMaintenanceRequestService();

  const requests = (data?.data ?? []).filter(
    (r) => r.schedulingStatus !== "completed"
  );

  const renderContent = () => {
    if (isLoading) return <LoadingSkeleton />;
    if (isError) return <ErrorState onRetry={refetch} />;
    if (requests.length === 0) return <EmptyState />;

    return (
      <div className="flex flex-col gap-3">
        {requests.map((request) => (
          <MaintenanceCard
            key={request._id}
            request={request}
            onOpen={(req) => console.log("Abrir:", req.ticketNumber)}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <MailPlus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              Solicitações de Manutenção
            </CardTitle>
            <CardDescription>
              Acompanhe e gerencie as solicitações em andamento
              {!isLoading && !isError && requests.length > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {requests.length}
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}