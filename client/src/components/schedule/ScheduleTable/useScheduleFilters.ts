import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import type { InputRef } from "antd";
import { useSearchParams } from "react-router-dom";
import { ScheduleQueryParams } from "@/services/ScheduleService";
import { getServiceConfig } from "@/utils/badges";

export type TabKey    = "all" | "installation" | "maintenance";
export type DataIndex = "vin" | "serviceType" | "status" | "client" | "responsible";

const TAB_SERVICE_MAP: Record<TabKey, string | null> = {
  all:          null,
  installation: "installation",
  maintenance:  "maintenance",
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

export type TableFilters = Record<string, string[] | null>;

export function useScheduleFilters(dataUpdatedAt?: number) {
  const [searchParams, setSearchParams] = useSearchParams();

  const globalSearch = searchParams.get("q")   || "";
  const activeTab    = (searchParams.get("tab") as TabKey) || "all";

  const [tableFilters,    setTableFilters]    = useState<TableFilters>({});
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [page,            setPage]            = useState(1);
  const limit = 50;

  // ─── Derivar params server-side ──────────────────────────────────────────

  const serviceType = useMemo(() => {
    const colFilter = tableFilters["serviceType"];
    if (colFilter?.length) return colFilter.join(",");
    const tabService = TAB_SERVICE_MAP[activeTab];
    return tabService ?? undefined;
  }, [activeTab, tableFilters]);

  const status = useMemo(() => {
    const colFilter = tableFilters["status"];
    if (colFilter?.length) return colFilter.join(",");
    if (showOnlyPending)   return "criado,agendado";
    return undefined;
  }, [tableFilters, showOnlyPending]);

  const client = useMemo(() => {
    const colFilter = tableFilters["client"];
    return colFilter?.length ? colFilter.join(",") : undefined;
  }, [tableFilters]);

  const queryParams: ScheduleQueryParams = useMemo(() => ({
    page,
    limit,
    search:      globalSearch || undefined,
    serviceType,
    status,
    client,
  }), [page, limit, globalSearch, serviceType, status, client]);

  // ─── Highlight only ──────────────────────────────────────────────────────

  const [searchText,     setSearchText]     = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  // ─── Tempo desde última atualização ──────────────────────────────────────

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeAgo,     setTimeAgo]     = useState("agora mesmo");

  useEffect(() => {
    if (dataUpdatedAt) setLastUpdated(new Date(dataUpdatedAt));
  }, [dataUpdatedAt]);

  useEffect(() => {
    const interval = setInterval(() => setTimeAgo(formatTimeAgo(lastUpdated)), 30_000);
    setTimeAgo(formatTimeAgo(lastUpdated));
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // ─── Setters com reset de página ─────────────────────────────────────────

  const setGlobalSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    value ? params.set("q", value) : params.delete("q");
    setSearchParams(params, { replace: true });
    setPage(1);
  }, [searchParams, setSearchParams]);

  const setActiveTab = useCallback((tab: TabKey) => {
    const params = new URLSearchParams(searchParams);
    tab === "all" ? params.delete("tab") : params.set("tab", tab);
    setSearchParams(params, { replace: true });
    setPage(1);
  }, [searchParams, setSearchParams]);

  const handleShowOnlyPending = useCallback((value: boolean) => {
    setShowOnlyPending(value);
    setPage(1);
  }, []);

  // ─── Handlers da tabela ──────────────────────────────────────────────────

  const handleTableChange = useCallback((pagination: any, filters: TableFilters) => {
    setTableFilters(filters);
    setPage(pagination.current ?? 1);
  }, []);

  const handleSearch = useCallback((
    selectedKeys: string[],
    confirm: () => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0] ?? "");
    setSearchedColumn(dataIndex);
    setPage(1);
  }, []);

  const handleReset = useCallback((clearFilters: () => void, dataIndex: DataIndex) => {
    clearFilters();
    setTableFilters((prev) => ({ ...prev, [dataIndex]: null }));
    setSearchText("");
    setSearchedColumn("");
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
    setTableFilters({});
    setSearchText("");
    setSearchedColumn("");
    setShowOnlyPending(false);
    setPage(1);
  }, [setSearchParams]);

  // ─── Contagem de filtros ativos ───────────────────────────────────────────

  const activeFilterCount = useMemo(() => {
    let count = globalSearch ? 1 : 0;
    if (showOnlyPending) count++;
    if (activeTab !== "all") count++;
    Object.values(tableFilters).forEach((val) => { if (val?.length) count++; });
    return count;
  }, [tableFilters, globalSearch, showOnlyPending, activeTab]);

  return {
    globalSearch,   setGlobalSearch,
    activeTab,      setActiveTab,
    showOnlyPending, setShowOnlyPending: handleShowOnlyPending,
    tableFilters,   handleTableChange,
    searchText,     searchedColumn, searchInput,
    handleSearch,   handleReset,
    activeFilterCount, clearAllFilters,
    lastUpdated,    timeAgo,
    queryParams,
    page,           limit,
  };
}