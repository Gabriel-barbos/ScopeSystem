import { useState, useEffect, useCallback } from "react";
import { CarFront, Search, Eye, SquareUser, FileSpreadsheet, Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getServiceConfig } from "@/utils/badges";

const PAGE_SIZE = 50;

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

function CopyVin({ vin }: { vin: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(vin).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    }, [vin]);

    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 group/copy"
            title="Copiar chassi"
        >
            <span className="text-sm font-semibold text-foreground">
                {vin}
            </span>
            <span className="opacity-0 group-hover/copy:opacity-100 transition-opacity">
                {copied
                    ? <Check className="h-3.5 w-3.5 text-green-500" />
                    : <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                }
            </span>
        </button>
    );
}

function ServiceBadge({ type, config }: { type: string; config: ReturnType<typeof getServiceConfig> }) {
    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${config.className}`}>
            <Icon className="h-3 w-3" />
            {config.label}
        </span>
    );
}

function ServiceItem({ service, onOpen }: { service: Service; onOpen: (s: Service) => void }) {
    const svcConfig = getServiceConfig(service.serviceType);

    return (
        <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl border bg-card hover:bg-accent/30 hover:border-primary/20 transition-all duration-150 group">
            {/* Service type badge */}
           
            {/* Avatar */}
            <div className="shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center ring-1 ring-border">
                {service.client?.image?.[0] ? (
                    <img src={service.client.image[0]} alt={service.client.name} className="h-full w-full object-cover" />
                ) : (
                    <SquareUser className="h-5 w-5 text-muted-foreground" />
                )}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <CopyVin vin={service.vin} />
                
                     <div className="hidden sm:block shrink-0">
                <ServiceBadge type={service.serviceType} config={svcConfig} />
            </div>

                </div>
                    {service.plate && (
                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-mono font-medium border ">
                            {service.plate}
                        </span>
                    )}
                <span className="text-xs text-muted-foreground font-mono mx-2">{service.deviceId}</span>
            </div>

            {/* Action */}
            <Button
                variant="ghost"
                size="sm"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onOpen(service)}
            >
                <Eye className="h-4 w-4 mr-1.5" />
                Detalhes
            </Button>
        </div>
    );
}

export default function Services() {
    const [search, setSearch]                   = useState("");
    const [currentPage, setCurrentPage]         = useState(1);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [drawerOpen, setDrawerOpen]           = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const debouncedSearch = useDebounce(search, 400);

    // Bug fix: quando a busca muda, isFetching=true mas placeholderData mostra dados antigos.
    // Usamos `isSearching` para ocultar a lista antiga durante nova busca, evitando falso "não encontrado".
    const [isSearching, setIsSearching] = useState(false);
    useEffect(() => { setIsSearching(true); }, [debouncedSearch]);

    const { data, isLoading, isFetching, bulkImport } = useServiceService({
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
    });

    // Quando o fetch terminar, libera a lista
    useEffect(() => { if (!isFetching) setIsSearching(false); }, [isFetching]);

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
        }
    };

    const showLoading = isLoading || isSearching;

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
                            <Button className="ml-auto" variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
                                Importar Serviços <FileSpreadsheet className="ml-1.5 h-4 w-4" />
                            </Button>
                        </RoleIf>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="flex items-end gap-4 mb-6">
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label className="text-sm">Pesquisar Serviço</Label>
                            <InputWithIcon
                                icon={<Search className="h-5 w-5" />}
                                type="text"
                                id="search"
                                placeholder="Chassi, placa ou device ID"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        {pagination && (
                            <span className="text-sm text-muted-foreground pb-0.5">
                                {pagination.total} registros
                            </span>
                        )}
                    </div>

                    <List
                        dataSource={showLoading ? [] : services}
                        loading={showLoading}
                        locale={{ emptyText: "Nenhum serviço encontrado" }}
                        split={false}
                        className="flex flex-col gap-2"
                        renderItem={(service) => (
                            <List.Item className="!p-0 !border-0 mb-2">
                                <div className="w-full">
                                    <ServiceItem service={service} onOpen={handleOpenDetails} />
                                </div>
                            </List.Item>
                        )}
                    />

                    {pagination && pagination.total > PAGE_SIZE && (
                        <div className="mt-6 flex justify-center">
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
                    Chassi: "Chassi", Placa: "Placa", Modelo: "Modelo",
                    Cliente: "Cliente", Equipamento: "Equipamento", TipoServico: "TipoServico",
                    IDDispositivo: "IDDispositivo", Tecnico: "Tecnico", Prestador: "Prestador",
                    LocalInstalacao: "LocalInstalacao", Endereco: "Endereco", Odometro: "Odometro",
                    Bloqueio: "Bloqueio", NumeroProtocolo: "NumeroProtocolo",
                    DispositivoSecundario: "DispositivoSecundario", ValidadoPor: "ValidadoPor",
                    Observacoes: "Observacoes", DataValidacao: "DataValidacao", Status: "Status",
                }}
            />

            <ServiceDrawer open={drawerOpen} onClose={handleCloseDrawer} service={selectedService} />
        </>
    );
}