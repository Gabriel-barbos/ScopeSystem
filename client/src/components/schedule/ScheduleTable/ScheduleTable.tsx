import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Input, Button, Tag, Switch, Tooltip as AntTooltip } from "antd";
import { SearchOutlined, ClearOutlined, ReloadOutlined } from "@ant-design/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CalendarClock, History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useScheduleService, Schedule } from "@/services/ScheduleService";
import { clientApi } from "@/services/ClientService";
import { useScheduleFilters, TabKey } from "./useScheduleFilters";
import { getServiceConfig } from "@/utils/badges";
import ScheduleTableCore from "./ScheduleTableCore";
import ScheduleDrawer from "../ScheduleDrawer";
import ServiceHistorySection from "../ServiceHistorySection";
import "./scheduleTable.styles.css";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all",          label: "Todos" },
  { key: "installation", label: "Instalações" },
  { key: "maintenance",  label: "Manutenções" },
];

const ScheduleTable: React.FC = () => {
  const [dataUpdatedAt, setDataUpdatedAt] = useState<number | undefined>();

  const filters = useScheduleFilters(dataUpdatedAt);

  const {
    isLoading,
    isFetching,
    dataUpdatedAt: queryDataUpdatedAt,
    refetch,
    scheduleList,
    vinServices,
    isVinSearch,
    pagination,
  } = useScheduleService(filters.queryParams);

  useEffect(() => {
    if (queryDataUpdatedAt) setDataUpdatedAt(queryDataUpdatedAt);
  }, [queryDataUpdatedAt]);

  const { data: allClients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: clientApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

  const clientOptions = useMemo(
    () => allClients.map((c) => ({ value: c._id, label: c.name })),
    [allClients]
  );

  const serviceOptions = useMemo(() => {
    const types = new Set(scheduleList.map((s) => s.serviceType).filter(Boolean));
    return Array.from(types).map((s) => ({ value: s as string, label: getServiceConfig(s as string).label }));
  }, [scheduleList]);

  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [drawerOpen,        setDrawerOpen]        = useState(false);

  const handleRowClick = useCallback((record: Schedule) => {
    setSelectedSchedule(record);
    setDrawerOpen(true);
  }, []);

  return (
    <div className="bg-card rounded-lg overflow-hidden">
      <div className="schedule-toolbar">
        <div className="schedule-toolbar-left">
          <Input
            prefix={<SearchOutlined className="text-muted-foreground" />}
            placeholder="Buscar por chassi ou placa..."
            value={filters.globalSearch}
            onChange={(e) => filters.setGlobalSearch(e.target.value)}
            allowClear
            className="w-72"
          />

          {/* Toggle "somente pendentes" — oculto no modo VIN search */}
          {!isVinSearch && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch
                size="small"
                checked={filters.showOnlyPending}
                onChange={filters.setShowOnlyPending}
              />
              <span>Somente pendentes</span>
            </div>
          )}

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

        <div className="schedule-toolbar-right">
          {/* Contador diferenciado no modo VIN */}
          {isVinSearch ? (
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {scheduleList.length} pendente{scheduleList.length !== 1 ? "s" : ""}&nbsp;·&nbsp;{vinServices.length} no histórico
            </span>
          ) : (
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {pagination?.total ?? 0} agendamento{pagination?.total !== 1 ? "s" : ""}
            </span>
          )}

          <AntTooltip title={`Última atualização: ${filters.lastUpdated.toLocaleTimeString("pt-BR")}`}>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {filters.timeAgo}
            </span>
          </AntTooltip>

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

      {/* Tabs de tipo de serviço — ocultas no modo VIN */}
      {!isVinSearch && (
        <div className="px-4 pt-3">
          <Tabs value={filters.activeTab} onValueChange={(v) => filters.setActiveTab(v as TabKey)}>
            <TabsList>
              {TABS.map(({ key, label }) => (
                <TabsTrigger key={key} value={key}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* ── Modo VIN: cabeçalho da seção de agendamentos pendentes ── */}
      {isVinSearch && (
        <div className="flex items-center gap-2 px-5 pt-4 pb-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            <CalendarClock className="h-3.5 w-3.5" />
            Agendamento Pendente ({scheduleList.length})
          </div>
          <div className="flex-1 h-px bg-amber-200/60 dark:bg-amber-800/40" />
        </div>
      )}

      {/* Tabela principal de schedules */}
      <ScheduleTableCore
        data={scheduleList}
        isLoading={isLoading || isFetching}
        pagination={isVinSearch ? undefined : pagination}
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
        serviceOptions={serviceOptions}
        hideServiceColumn={!isVinSearch && filters.activeTab !== "all"}
        currentPage={filters.page}
        pageLimit={filters.limit}
      />

      {/* ── Modo VIN: seção de histórico de serviços ── */}
      {isVinSearch && (
        <div className="px-4 pb-4">
          {vinServices.length > 0 ? (
            <ServiceHistorySection services={vinServices} />
          ) : !isFetching && (
            <>
              <div className="flex items-center gap-2 px-1 pt-2 pb-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <History className="h-3.5 w-3.5" />
                  Histórico de Serviços (0)
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>
              <p className="text-xs text-muted-foreground px-1 py-2">
                Nenhum serviço realizado encontrado para este veículo.
              </p>
            </>
          )}
        </div>
      )}

      {/* Drawer de agendamento */}
      <ScheduleDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        schedule={selectedSchedule}
      />
    </div>
  );
};

export default ScheduleTable;