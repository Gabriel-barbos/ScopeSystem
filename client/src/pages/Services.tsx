import { useState, useMemo } from "react";
import { CarFront, Plus, Search, Eye, SquareUser } from "lucide-react";
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

const PAGE_SIZE = 20;

export default function Services() {
    const { data: services, isLoading } = useServiceService();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    
    // Estados do Drawer
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const filtered = useMemo(() => {
        const list = services ?? [];
        if (!search.trim()) return list;

        const query = search.toLowerCase();
        return list.filter(
            (s) =>
                s.vin.toLowerCase().includes(query) ||
                s.plate?.toLowerCase().includes(query) ||
                s.deviceId.toLowerCase().includes(query)
        );
    }, [services, search]);

    const effectivePage =
        filtered.length <= (currentPage - 1) * PAGE_SIZE ? 1 : currentPage;

    const paginated = useMemo(() => {
        const start = (effectivePage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, effectivePage]);

    // Handler para abrir o drawer
    const handleOpenDetails = (service: Service) => {
        setSelectedService(service);
        setDrawerOpen(true);
    };

    // Handler para fechar o drawer
    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        // Opcional: limpar o serviço selecionado após a animação de fechamento
        setTimeout(() => setSelectedService(null), 300);
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
                        <Button className="ml-auto" size="sm">
                            Importar Serviços <Plus />
                        </Button>
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
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <List
                        className="mt-6"
                        dataSource={paginated}
                        loading={isLoading}
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
                                            {service.client.image?.[0] ? (
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

                    {filtered.length > PAGE_SIZE && (
                        <div className="mt-4 flex justify-center">
                            <Pagination
                                current={effectivePage}
                                pageSize={PAGE_SIZE}
                                total={filtered.length}
                                onChange={setCurrentPage}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Service Drawer */}
            <ServiceDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                service={selectedService}
            />
        </>
    );
}