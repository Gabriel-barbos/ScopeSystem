import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Input, Button, Tag, Switch, Tooltip as AntTooltip } from "antd";
import { SearchOutlined, ClearOutlined, ReloadOutlined } from "@ant-design/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock } from "lucide-react";

import { useScheduleService, Schedule } from "@/services/ScheduleService";
import { useScheduleFilters, TabKey } from "./useScheduleFilters";
import { getServiceConfig } from "@/utils/badges";
import ScheduleTableCore from "./ScheduleTableCore";
import ScheduleDrawer from "../ScheduleDrawer";
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
    data: response,
    isLoading,
    isFetching,
    dataUpdatedAt: queryDataUpdatedAt,
    refetch,
  } = useScheduleService(filters.queryParams);

  useEffect(() => {
    if (queryDataUpdatedAt) setDataUpdatedAt(queryDataUpdatedAt);
  }, [queryDataUpdatedAt]);

  const schedules  = response?.data       ?? [];
  const pagination = response?.pagination;

  // clientOptions e serviceOptions derivados da página atual
  const clientOptions = useMemo(() => {
    const map = new Map<string, string>();
    schedules.forEach((s) => { if (s.client?._id) map.set(s.client._id, s.client.name); });
    return Array.from(map.entries()).map(([id, name]) => ({ value: id, label: name }));
  }, [schedules]);

  const serviceOptions = useMemo(() => {
    const services = new Set(schedules.map((s) => s.serviceType).filter(Boolean));
    return Array.from(services).map((s) => ({ value: s, label: getServiceConfig(s).label }));
  }, [schedules]);

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

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch
              size="small"
              checked={filters.showOnlyPending}
              onChange={filters.setShowOnlyPending}
            />
            <span>Somente pendentes</span>
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

        <div className="schedule-toolbar-right">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {pagination?.total ?? 0} agendamento{pagination?.total !== 1 ? "s" : ""}
          </span>

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

      <ScheduleTableCore
        data={schedules}
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
        serviceOptions={serviceOptions}
        hideServiceColumn={filters.activeTab !== "all"}
        currentPage={filters.page}
        pageLimit={filters.limit}
      />

      <ScheduleDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        schedule={selectedSchedule}
      />
    </div>
  );
};

export default ScheduleTable;