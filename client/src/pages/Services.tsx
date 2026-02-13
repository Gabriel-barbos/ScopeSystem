import { useState, useEffect } from "react";
import { CarFront, Search, Eye, SquareUser, FileSpreadsheet } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/InputWithIcon";
import { List, Pagination } from "antd";
import { useServiceService, type Service } from "@/services/ServiceService";
import ServiceDrawer from "@/components/service/ServiceDrawer";
import { ImportModal } from "@/components/ImportModal";
import { toast } from "sonner";
import RoleIf from "@/components/RoleIf";
import { Roles } from "@/utils/roles";

const PAGE_SIZE = 50;

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

export default function Services() {
    const [search, setSearch]                   = useState("");
    const [currentPage, setCurrentPage]         = useState(1);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [drawerOpen, setDrawerOpen]           = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const debouncedSearch = useDebounce(search, 400);

    const { data, isLoading, isFetching, bulkImport } = useServiceService({
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
    });

    const services   = data?.data ?? [];
    const pagination = data?.pagination;

    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleOpenDetails = (service: Service) => {
        setSelectedService(service);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setTimeout(() => setSelectedService(null), 300);
    };

    const handleImport = async (data: Record<string, any>[]) => {
        try {
            const services = data.map((row) => ({
                plate: row.Placa || undefined,
                vin: row.Chassi,
                model: row.Modelo,
                serviceType: row.TipoServico || "installation",
                client: row.ClienteId,
                product: row.EquipamentoId || undefined,
                deviceId: row.IDDispositivo,
                technician: row.Tecnico,
                provider: row.Prestador || undefined,
                installationLocation: row.LocalInstalacao,
                serviceAddress: row.Endereco,
                odometer: row.Odometro ? Number(row.Odometro) : undefined,
                blockingEnabled: row.Bloqueio?.toLowerCase() === "sim" || row.Bloqueio === true,
                protocolNumber: row.NumeroProtocolo || undefined,
                secondaryDevice: row.DispositivoSecundario || undefined,
                validatedBy: row.ValidadoPor || "Importação",
                validationNotes: row.Observacoes || undefined,
                validatedAt: row.DataValidacao || undefined,
                status: row.Status || "concluido",
            }));

            await bulkImport.mutateAsync(services);
            toast.success(`${services.length} serviços importados com sucesso!`);
            setImportModalOpen(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Erro ao importar serviços");
            console.error("Erro no import:", error);
        }
    };

    return (
        <>
            <Card className="mx-auto">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <CarFront className="h-6 w-6 text-primary" aria-hidden="true" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Serviços</CardTitle>
                            <CardDescription>
                                Visualize e administre seus serviços
                            </CardDescription>
                        </div>
                        <RoleIf roles={[Roles.ADMIN, Roles.SCHEDULING, Roles.SUPPORT, Roles.VALIDATION]}>
                            <Button
                                className="ml-auto"
                                variant="outline"
                                size="sm"
                                onClick={() => setImportModalOpen(true)}
                            >
                                Importar Serviços <FileSpreadsheet />
                            </Button>
                        </RoleIf>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid w-full max-w-sm items-center gap-2">
                        <Label className="text-sm">Pesquisar Serviço</Label>
                        <InputWithIcon
                            icon={<Search className="h-5 w-5" />}
                            type="text"
                            id="search"
                            placeholder="Digite o chassi, placa ou device ID"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <List
                        className="mt-6"
                        dataSource={services}
                        loading={isLoading || isFetching}
                        renderItem={(service) => (
                            <List.Item
                                actions={[
                                    <Button
                                        key="details"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleOpenDetails(service)}
                                    >
                                        Ver detalhes
                                        <Eye className="h-4 w-4" />
                                    </Button>,
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <div className="mx-2 h-14 w-14 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                            {service.client?.image?.[0] ? (
                                                <img
                                                    src={service.client.image[0]}
                                                    alt={service.client.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <SquareUser className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                    }
                                    title={
                                        <span className="text-sm font-semibold text-foreground">
                                            {service.vin}
                                            {service.plate && (
                                                <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                    {service.plate}
                                                </span>
                                            )}
                                        </span>
                                    }
                                    description={
                                        <span className="text-xs text-muted-foreground">
                                            Dispositivo: {service.deviceId}
                                        </span>
                                    }
                                />
                            </List.Item>
                        )}
                    />

                    {pagination && pagination.total > PAGE_SIZE && (
                        <div className="mt-4 flex justify-center">
                            <Pagination
                                current={pagination.page}
                                pageSize={PAGE_SIZE}
                                total={pagination.total}
                                onChange={setCurrentPage}
                                showSizeChanger={false}
                                showTotal={(total) => `${total} serviços`}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <ImportModal
                open={importModalOpen}
                onOpenChange={setImportModalOpen}
                title="Importar Serviços"
                templateUrl="/templates/servicos.xlsx"
                templateName="template-servicos.xlsx"
                onImport={handleImport}
                columnMapping={{
                    Chassi: "Chassi",
                    Placa: "Placa",
                    Modelo: "Modelo",
                    Cliente: "Cliente",
                    Equipamento: "Equipamento",
                    TipoServico: "TipoServico",
                    IDDispositivo: "IDDispositivo",
                    Tecnico: "Tecnico",
                    Prestador: "Prestador",
                    LocalInstalacao: "LocalInstalacao",
                    Endereco: "Endereco",
                    Odometro: "Odometro",
                    Bloqueio: "Bloqueio",
                    NumeroProtocolo: "NumeroProtocolo",
                    DispositivoSecundario: "DispositivoSecundario",
                    ValidadoPor: "ValidadoPor",
                    Observacoes: "Observacoes",
                    DataValidacao: "DataValidacao",
                    Status: "Status",
                }}
            />

            <ServiceDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                service={selectedService}
            />
        </>
    );
}