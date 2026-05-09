import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import type { InputRef } from "antd";
import type { ServiceFilters } from "@/services/ServiceService";

export type TableFilters = Record<string, string[] | null>;

const LIMIT = 50;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useServiceFilters() {
  const [page,          setPage]          = useState(1);
  const [tableFilters,  setTableFilters]  = useState<TableFilters>({});
  const [globalSearch,  setGlobalSearchRaw] = useState("");

  const debouncedSearch = useDebounce(globalSearch, 400);

  const setGlobalSearch = useCallback((val: string) => {
    setGlobalSearchRaw(val);
    setPage(1);
  }, []);

  // ─── Derivar queryParams 

  const queryParams: ServiceFilters = useMemo(() => {
    // Filtros por coluna 
    const client      = tableFilters["client"]?.[0]      || undefined;
    const vin         = tableFilters["vin"]?.[0]         || undefined;
    const deviceId    = tableFilters["deviceId"]?.[0]    || undefined;
    const serviceType = tableFilters["serviceType"]?.[0] || undefined;

    let validatedAtStart: string | undefined;
    let validatedAtEnd:   string | undefined;
    const dateRange = tableFilters["validatedAt"]?.[0];
    if (dateRange) {
      const [start, end] = dateRange.split(",");
      validatedAtStart = start;
      validatedAtEnd   = end;
    }

    return {
      page,
      limit: LIMIT,
      client,
      vin,
      deviceId,
      serviceType,
      validatedAtStart,
      validatedAtEnd,
      // globalSearch → só o param "search", nunca misturar com vin/deviceId
      // O backend faz $or entre vin, plate e deviceId para esse param
      search: debouncedSearch || undefined,
    };
  }, [page, tableFilters, debouncedSearch]);

  // ─── Highlight para colunas com filtro de input 

  const [searchText,     setSearchText]     = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  // ─── Handlers da tabela 

  const handleTableChange = useCallback((pagination: any, filters: TableFilters) => {
    setTableFilters(filters);
    setPage(pagination.current ?? 1);
  }, []);

  const handleSearch = useCallback(
    (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
      confirm();
      setSearchText(selectedKeys[0] ?? "");
      setSearchedColumn(dataIndex);
      setPage(1);
    },
    []
  );

  const handleReset = useCallback((clearFilters: () => void, dataIndex: string) => {
    clearFilters();
    setTableFilters((prev) => ({ ...prev, [dataIndex]: null }));
    setSearchText("");
    setSearchedColumn("");
  }, []);

  const clearAllFilters = useCallback(() => {
    setTableFilters({});
    setGlobalSearchRaw("");
    setSearchText("");
    setSearchedColumn("");
    setPage(1);
  }, []);

  // ─── Contador de filtros ativos 

  const activeFilterCount = useMemo(() => {
    let count = debouncedSearch ? 1 : 0;
    count += Object.values(tableFilters).filter((v) => v?.length).length;
    return count;
  }, [tableFilters, debouncedSearch]);

  return {
    queryParams,
    page,
    limit: LIMIT,
    globalSearch,
    setGlobalSearch,
    tableFilters,
    searchText,
    searchedColumn,
    searchInput,
    activeFilterCount,
    handleTableChange,
    handleSearch,
    handleReset,
    clearAllFilters,
  };
}
