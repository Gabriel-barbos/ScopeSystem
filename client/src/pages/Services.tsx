import { useState } from "react";
import { CarFront, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useServiceService, type BulkImportServicePayload } from "@/services/ServiceService";
import { ImportModal } from "@/components/global/ImportModal";
import { toast } from "sonner";
import RoleIf from "@/components/layout/RoleIf";
import { Roles } from "@/utils/roles";
import { SERVICE_IMPORT_COLUMNS } from "@/utils/ServiceImportConfig";
import ServiceTable from "@/components/service/ServiceTable/ServiceTable";

export default function Services() {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const { bulkImport } = useServiceService();

  const handleImport = async (data: Record<string, any>[]) => {
    try {
      const services = data.map((row) => ({
        ...row,
        serviceType: row.serviceType || "installation",
        validatedBy: row.validatedBy || "Importação",
        status:      row.status      || "concluido",
      })) as BulkImportServicePayload[];

      await bulkImport.mutateAsync(services);
      toast.success(`${services.length} serviços importados com sucesso!`);
      setImportModalOpen(false);
    } catch (error: any) {
      const serverError = error?.response?.data;
      const details: string[] = serverError?.details ?? [];

      if (details.length > 0) {
        toast.error(serverError?.error || "Erro ao importar serviços", {
          description: (
            <ul className="mt-1 space-y-0.5 text-xs list-disc list-inside max-h-40 overflow-auto">
              {details.map((d: string, i: number) => <li key={i}>{d}</li>)}
            </ul>
          ),
          duration: 8000,
        });
      } else {
        toast.error(serverError?.error || "Erro ao importar serviços");
      }
    }
  };

  return (
    <>
      <Card className="mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CarFront className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Serviços</CardTitle>
              <CardDescription>Visualize e administre seus serviços</CardDescription>
            </div>
            <RoleIf roles={[Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT, Roles.VALIDATION]}>
              <Button
                className="ml-auto"
                variant="outline"
                size="sm"
                onClick={() => setImportModalOpen(true)}
              >
                Importar Serviços <FileSpreadsheet className="ml-1.5 h-4 w-4" />
              </Button>
            </RoleIf>
          </div>
        </CardHeader>

        <CardContent>
          <ServiceTable />
        </CardContent>
      </Card>

      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        title="Importar Serviços"
        templateUrl="/templates/servicos.xlsx"
        templateName="template-servicos.xlsx"
        onImport={handleImport}
        importColumns={SERVICE_IMPORT_COLUMNS}
      />
    </>
  );
}