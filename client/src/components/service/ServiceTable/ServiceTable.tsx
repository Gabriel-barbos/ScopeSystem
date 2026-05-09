import React, { useState, useCallback, useMemo } from "react";
import { Button, Tag, Tooltip as AntTooltip } from "antd";
import { ClearOutlined, ReloadOutlined } from "@ant-design/icons";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useServiceService, type Service } from "@/services/ServiceService";
import { clientApi } from "@/services/ClientService";
import { useServiceFilters } from "./useServiceFilters";
import ServiceTableCore from "./ServiceTableCore";
import ServiceDrawer from "@/components/service/ServiceDrawer";
import "./serviceTable.styles.css";

const ServiceTable: React.FC = () => {
  const filters = useServiceFilters();

  const { data, isLoading, isFetching, refetch } = useServiceService(filters.queryParams);

  const services   = data?.data ?? [];
  const pagination = data?.pagination;

  // ─── Clientes para o filtro de coluna 

  const { data: allClients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: clientApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

  const clientOptions = useMemo(
    () => allClients.map((c: any) => ({ value: c._id, label: c.name })),
    [allClients]
  );

  // ─── Drawer 

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [drawerOpen,      setDrawerOpen]      = useState(false);

  const handleRowClick = useCallback((record: Service) => {
    setSelectedService(record);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedService(null), 300);
  }, []);

  // ─── Render 

  return (
    <>
      <div className="bg-card rounded-lg overflow-hidden border border-border">
        {/* ── Toolbar ── */}
        <div className="service-toolbar">
          <div className="service-toolbar-left">

            {/* Input de busca global — controlado com debounce no hook */}
            <div className="service-search-wrapper">
              <Search className="service-search-icon" />
              <input
                type="text"
                className="service-search-input"
                placeholder="Placa, chassi ou Device ID..."
                value={filters.globalSearch}
                onChange={(e) => filters.setGlobalSearch(e.target.value)}
                autoComplete="off"
              />
              {filters.globalSearch && (
                <button
                  className="service-search-clear"
                  onClick={() => filters.setGlobalSearch("")}
                  aria-label="Limpar busca"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {filters.activeFilterCount > 0 && (
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                onClick={filters.clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Limpar filtros
                <Tag color="blue" className="ml-1.5">{filters.activeFilterCount}</Tag>
              </Button>
            )}
          </div>

          <div className="service-toolbar-right">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {pagination?.total ?? 0} {pagination?.total === 1 ? "serviço" : "serviços"}
            </span>

            <AntTooltip title="Atualizar dados">
              <Button
                type="text"
                icon={<ReloadOutlined spin={isFetching} className={isFetching ? "text-primary" : ""} />}
                onClick={() => refetch()}
                disabled={isFetching}
              />
            </AntTooltip>
          </div>
        </div>

        {/* ── Tabela ── */}
        <ServiceTableCore
          data={services}
          isLoading={isLoading || isFetching}
          pagination={pagination}
          hasFilters={filters.activeFilterCount > 0}
          tableFilters={filters.tableFilters}
          onClearFilters={filters.clearAllFilters}
          onRowClick={handleRowClick}
          onTableChange={filters.handleTableChange}
          searchText={filters.searchText}
          searchedColumn={filters.searchedColumn}
          searchInput={filters.searchInput}
          onSearch={filters.handleSearch}
          onReset={filters.handleReset}
          clientOptions={clientOptions}
          currentPage={filters.page}
          pageLimit={filters.limit}
        />
      </div>

      <ServiceDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        service={selectedService}
      />
    </>
  );
};

export default ServiceTable;
