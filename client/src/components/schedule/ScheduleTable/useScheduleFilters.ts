import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import type { InputRef } from "antd";
import { useSearchParams } from "react-router-dom";
import { Schedule } from "@/services/ScheduleService";
import { getServiceConfig } from "@/utils/badges";

export type TabKey = "all" | "installation" | "maintenance";
export type DataIndex = "vin" | "serviceType" | "status" | "createdBy";

const COMPLETED_STATUSES = ["concluido", "cancelado"];

const TAB_SERVICE_MAP: Record<TabKey, string | null> = {
  all: null,
  installation: "installation",
  maintenance: "maintenance",
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "agora mesmo";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
};

const matchesGlobalSearch = (record: Schedule, search: string): boolean => {
  const term = search.toLowerCase();
  return !!(
    record.vin?.toLowerCase().includes(term) ||
    record.plate?.toLowerCase().includes(term) ||
    record.client?.name?.toLowerCase().includes(term) ||
    record.model?.toLowerCase().includes(term) ||
    record.orderNumber?.toLowerCase().includes(term) ||
    record.createdBy?.toLowerCase().includes(term)
  );
};


export type TableFilters = Record<string, string[] | null>;

export function useScheduleFilters(
  schedules: Schedule[],
  dataUpdatedAt?: number
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const globalSearch = searchParams.get("q") || "";
  const activeTab = (searchParams.get("tab") as TabKey) || "all";

  const setGlobalSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      value ? params.set("q", value) : params.delete("q");
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setActiveTab = useCallback(
    (tab: TabKey) => {
      const params = new URLSearchParams(searchParams);
      tab === "all" ? params.delete("tab") : params.set("tab", tab);
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Estado único para todos os filtros da tabela
  const [tableFilters, setTableFilters] = useState<TableFilters>({});
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  // Necessário apenas para o highlight 
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  // Tempo desde última atualização
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState("agora mesmo");

  useEffect(() => {
    if (dataUpdatedAt) setLastUpdated(new Date(dataUpdatedAt));
  }, [dataUpdatedAt]);

  useEffect(() => {
    const interval = setInterval(
      () => setTimeAgo(formatTimeAgo(lastUpdated)),
      30_000
    );
    setTimeAgo(formatTimeAgo(lastUpdated));
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Filtragem global 
  const filteredSchedules = useMemo(() => {
    let result = schedules;

    if (globalSearch) {
      result = result.filter((s) => matchesGlobalSearch(s, globalSearch));
    }

    const serviceFilter = TAB_SERVICE_MAP[activeTab];
    if (serviceFilter) {
      result = result.filter((s) => s.serviceType === serviceFilter);
    }

    if (showOnlyPending) {
      result = result.filter((s) => !COMPLETED_STATUSES.includes(s.status));
    }

    return result;
  }, [schedules, globalSearch, activeTab, showOnlyPending]);

  const tabCounts = useMemo(() => {
    const base = globalSearch
      ? schedules.filter((s) => matchesGlobalSearch(s, globalSearch))
      : schedules;

    const apply = (list: Schedule[]) =>
      showOnlyPending
        ? list.filter((s) => !COMPLETED_STATUSES.includes(s.status))
        : list;

    return {
      all: apply(base).length,
      installation: apply(
        base.filter((s) => s.serviceType === "installation")
      ).length,
      maintenance: apply(
        base.filter((s) => s.serviceType === "maintenance")
      ).length,
    };
  }, [schedules, globalSearch, showOnlyPending]);

  const clientOptions = useMemo(() => {
    const map = new Map<string, string>();
    schedules.forEach((item) => map.set(item.client._id, item.client.name));
    return Array.from(map.entries()).map(([id, name]) => ({
      value: id,
      label: name,
    }));
  }, [schedules]);

  const serviceOptions = useMemo(() => {
    const services = new Set(
      schedules.map((item) => item.serviceType).filter(Boolean)
    );
    return Array.from(services).map((service) => ({
      value: service,
      label: getServiceConfig(service).label,
    }));
  }, [schedules]);

  const activeFilterCount = useMemo(() => {
    let count = globalSearch ? 1 : 0;
    if (showOnlyPending) count++;
    if (activeTab !== "all") count++;
    Object.values(tableFilters).forEach((val) => {
      if (val && val.length > 0) count++;
    });
    return count;
  }, [tableFilters, globalSearch, showOnlyPending, activeTab]);

  // Handlers da tabela
  const handleSearch = useCallback(
    (selectedKeys: string[], confirm: () => void, dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0] ?? "");
      setSearchedColumn(dataIndex);
    },
    []
  );

  const handleReset = useCallback(
    (clearFilters: () => void, dataIndex: DataIndex) => {
      clearFilters(); 
      setTableFilters((prev) => ({ ...prev, [dataIndex]: null }));
      setSearchText("");
      setSearchedColumn("");
    },
    []
  );

 
  const handleTableChange = useCallback(
    (_pagination: any, filters: TableFilters) => {
      setTableFilters(filters);
    },
    []
  );

  // Limpa TUDO
  const clearAllFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
    setTableFilters({});     
    setSearchText("");
    setSearchedColumn("");
    setShowOnlyPending(false);
  }, [setSearchParams]);

  return {
    globalSearch,
    setGlobalSearch,
    activeTab,
    setActiveTab,
    showOnlyPending,
    setShowOnlyPending,
    tableFilters,
    handleTableChange,
    searchText,
    searchedColumn,
    searchInput,
    handleSearch,
    handleReset,
    filteredSchedules,
    tabCounts,
    clientOptions,
    serviceOptions,
    activeFilterCount,
    lastUpdated,
    timeAgo,
    clearAllFilters,
  };
}