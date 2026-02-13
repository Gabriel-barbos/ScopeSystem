import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Avatar as AntAvatar,
  Select,
  Tag,
  Tooltip as AntTooltip,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ClearOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { InputRef } from "antd";
import Highlighter from "react-highlight-words";
import { useSearchParams } from "react-router-dom";
import { Store, Clock } from "lucide-react";

import { useScheduleService, Schedule } from "@/services/ScheduleService";
import { DateRangeFilter } from "../DataRangeFilter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  getStatusConfig,
  getServiceConfig,
  statusFilterOptions,
} from "@/utils/badges";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import ScheduleDrawer from "./ScheduleDrawer";
import ScheduleEmptyState from "./ScheduleEmptyState";
import "./ScheduleTable.styles.css";


type DataIndex = "vin" | "serviceType" | "status" | "createdBy";

//Helpers
const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatTimeAgo = (date: Date): string => {
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
  return (
    record.vin?.toLowerCase().includes(term) ||
    record.plate?.toLowerCase().includes(term) ||
    record.client?.name?.toLowerCase().includes(term) ||
    record.model?.toLowerCase().includes(term) ||
    record.orderNumber?.toLowerCase().includes(term) ||
    record.createdBy?.toLowerCase().includes(term) ||
    false
  );
};



const ScheduleTable: React.FC = () => {
  const {
    data: response,
    isLoading,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = useScheduleService();

  const schedules = response?.data ?? [];
  const pagination = response?.pagination;

  //URL Params 
  const [searchParams, setSearchParams] = useSearchParams();

  const globalSearch = searchParams.get("q") || "";

  const setGlobalSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // States para busca, filtros, seleção e drawer
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState("agora mesmo");
  const searchInput = useRef<InputRef>(null);

  //Atualiza tempo atrás a cada 30s
  useEffect(() => {
    if (dataUpdatedAt) setLastUpdated(new Date(dataUpdatedAt));
  }, [dataUpdatedAt]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(lastUpdated));
    }, 30_000);
    setTimeAgo(formatTimeAgo(lastUpdated));
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Dados filtrados pela busca global
  const filteredSchedules = useMemo(() => {
    if (!globalSearch) return schedules;
    return schedules.filter((s) => matchesGlobalSearch(s, globalSearch));
  }, [schedules, globalSearch]);

  // ── Opções de filtros ──
  const clientOptions = useMemo(() => {
    if (!schedules.length) return [];
    const map = new Map<string, string>();
    schedules.forEach((item) => map.set(item.client._id, item.client.name));
    return Array.from(map.entries()).map(([id, name]) => ({
      value: id,
      label: name,
    }));
  }, [schedules]);

  const serviceOptions = useMemo(() => {
    if (!schedules.length) return [];
    const services = new Set(
      schedules.map((item) => item.serviceType).filter(Boolean)
    );
    return Array.from(services).map((service) => ({
      value: service,
      label: getServiceConfig(service).label,
    }));
  }, [schedules]);

  // ── Contador de filtros ativos ──
  const [tableFilters, setTableFilters] = useState<Record<string, any>>({});

  const activeFilterCount = useMemo(() => {
    let count = globalSearch ? 1 : 0;
    Object.values(tableFilters).forEach((val) => {
      if (val && (Array.isArray(val) ? val.length > 0 : true)) count++;
    });
    return count;
  }, [tableFilters, globalSearch]);

  // ── Handlers ──
  const handleSearch = useCallback(
    (selectedKeys: string[], confirm: () => void, dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
    },
    []
  );

  const handleReset = useCallback((clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  }, []);

  const handleRowClick = useCallback((record: Schedule) => {
    setSelectedSchedule(record);
    setDrawerOpen(true);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
    setTableFilters({});
    setSearchText("");
    setSearchedColumn("");
  }, [setSearchParams]);

  const handleTableChange = useCallback(
    (_pagination: any, filters: Record<string, any>) => {
      setTableFilters(filters);
    },
    []
  );

  // ── Column Search Props Factory ──
  const getColumnSearchProps = useCallback(
    (dataIndex: DataIndex, getValue: (record: Schedule) => string): ColumnType<Schedule> => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-2 w-60">
          <Input
            ref={searchInput}
            placeholder="Buscar..."
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            className="mb-2"
          />
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<SearchOutlined />}
              onClick={() =>
                handleSearch(selectedKeys as string[], confirm, dataIndex)
              }
            >
              Buscar
            </Button>
            <Button
              size="small"
              onClick={() => clearFilters && handleReset(clearFilters)}
            >
              Limpar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined className={filtered ? "text-blue-500" : ""} />
      ),
      onFilter: (value, record) =>
        getValue(record)
          .toLowerCase()
          .includes((value as string).toLowerCase()),
      render: (text) =>
        searchedColumn === dataIndex ? (
          <Highlighter
            searchWords={[searchText]}
            textToHighlight={text?.toString() || ""}
          />
        ) : (
          text
        ),
    }),
    [searchText, searchedColumn, handleSearch, handleReset]
  );

  // ── Select Filter Factory ──
  const createSelectFilter = useCallback(
    (
      options: { value: string; label: string }[],
      placeholder: string,
      filterFn: (value: any, record: Schedule) => boolean,
      width = "w-64"
    ) => ({
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => (
        <div className={`p-3 ${width}`}>
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder={placeholder}
            options={options}
            value={selectedKeys}
            onChange={(values) => setSelectedKeys(values)}
            className="w-full mb-2"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            maxTagCount="responsive"
          />
          <Space className="w-full flex justify-between">
            <Button type="primary" size="small" onClick={() => confirm()}>
              Aplicar
            </Button>
            <Button size="small" onClick={() => clearFilters?.()}>
              Limpar
            </Button>
          </Space>
        </div>
      ),
      onFilter: filterFn,
    }),
    []
  );

  // ── Columns (memoizadas) ──
  const columns: ColumnsType<Schedule> = useMemo(
    () => [
      {
        title: "Cliente",
        key: "client",
        ...createSelectFilter(
          clientOptions,
          "Selecione os clientes",
          (value, record) => record.client._id === value,
          "w-72"
        ),
        render: (_, record) => (
          <Space>
            <AntAvatar
              shape="square"
              size="large"
              src={record.client.image?.[0]}
              icon={!record.client.image?.[0] ? <Store size={18} /> : undefined}
            />
            <span className="font-medium">{record.client.name}</span>
          </Space>
        ),
      },
      {
        title: "Chassi",
        dataIndex: "vin",
        key: "vin",
        ...getColumnSearchProps("vin", (r) => r.vin),
      },
      {
        title: "Data Agendada",
        key: "scheduledDate",
        filterDropdown: ({ setSelectedKeys, confirm, clearFilters }: any) => (
          <DateRangeFilter
            onChange={(dates) => {
              if (dates) {
                setSelectedKeys([`${dates[0]},${dates[1]}`]);
                confirm();
              }
            }}
            onClear={() => clearFilters?.()}
          />
        ),
        onFilter: (value: any, record: Schedule) => {
          if (!record.scheduledDate) return false;
          if (typeof value === "string") {
            const [start, end] = value.split(",");
            const recordDate = new Date(record.scheduledDate).getTime();
            return (
              recordDate >= new Date(start).getTime() &&
              recordDate <= new Date(end).getTime()
            );
          }
          return true;
        },
        sorter: (a: Schedule, b: Schedule) => {
          const dateA = a.scheduledDate
            ? new Date(a.scheduledDate).getTime()
            : Infinity;
          const dateB = b.scheduledDate
            ? new Date(b.scheduledDate).getTime()
            : Infinity;
          return dateA - dateB;
        },
        sortDirections: ["ascend", "descend"] as const,
        render: (_: any, record: Schedule) => {
          const date = record.scheduledDate
            ? new Date(record.scheduledDate)
            : null;
          const isValid = date && !isNaN(date.getTime());

          if (!isValid) {
            return (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border text-muted-foreground bg-muted">
                A definir
              </span>
            );
          }

          const isOverdue =
            date.getTime() < Date.now() &&
            record.status !== "concluido" &&
            record.status !== "cancelado";

          return (
            <span className={isOverdue ? "text-destructive font-semibold" : ""}>
              {date.toLocaleDateString("pt-BR")}
            </span>
          );
        },
      },
      {
        title: "Serviço",
        dataIndex: "serviceType",
        key: "serviceType",
        ...createSelectFilter(
          serviceOptions,
          "Selecione os serviços",
          (value, record) => record.serviceType === value
        ),
        render: (serviceType: string) => {
          const config = getServiceConfig(serviceType || "");
          const Icon = config.icon;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{config.label}</span>
            </span>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        ...createSelectFilter(
          statusFilterOptions,
          "Selecione os status",
          (value, record) => record.status === value
        ),
        render: (status: string) => {
          const config = getStatusConfig(status);
          const Icon = config.icon;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{config.label}</span>
            </span>
          );
        },
      },
      {
        title: "Criado por",
        dataIndex: "createdBy",
        key: "createdBy",
        ...getColumnSearchProps("createdBy", (r) => r.createdBy || ""),
        render: (createdBy: string) => (
          <div className="flex justify-center items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                    {getInitials(createdBy || "?")}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{createdBy}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
      {
        title: "Ações",
        key: "actions",
        width: 100,
        render: (_, record) => (
          <Button
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation(); // Evita conflito com onRow click
              handleRowClick(record);
            }}
          >
            Detalhes
          </Button>
        ),
      },
    ],
    [
      clientOptions,
      serviceOptions,
      getColumnSearchProps,
      createSelectFilter,
      handleRowClick,
    ]
  );

  // ── Verificação de filtros para empty state ──
  const hasAnyFilter = activeFilterCount > 0;

  return (
    <div className="bg-card rounded-lg overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="schedule-toolbar">
        <div className="schedule-toolbar-left">
          {/* Busca global */}
          <Input
            prefix={<SearchOutlined className="text-muted-foreground" />}
            placeholder="Buscar por chassi, placa, cliente..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            allowClear
            className="w-72"
          />

          {/* Indicador de filtros ativos */}
          {activeFilterCount > 0 && (
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Limpar filtros
              <Tag color="blue" className="ml-1.5">
                {activeFilterCount}
              </Tag>
            </Button>
          )}
        </div>

        <div className="schedule-toolbar-right">
          {/* Contador de resultados */}
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredSchedules.length}
            {pagination?.total
              ? ` de ${pagination.total}`
              : ""}{" "}
            agendamento{filteredSchedules.length !== 1 ? "s" : ""}
          </span>

          {/* Indicador de última atualização */}
          <AntTooltip title={`Última atualização: ${lastUpdated.toLocaleTimeString("pt-BR")}`}>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          </AntTooltip>

          {/* Botão de refresh */}
          <AntTooltip title="Atualizar dados">
            <Button
              type="text"
              icon={
                <ReloadOutlined
                  spin={isFetching}
                  className={isFetching ? "text-primary" : ""}
                />
              }
              onClick={() => refetch()}
              disabled={isFetching}
            />
          </AntTooltip>
        </div>
      </div>

      {/* ── Tabela ── */}
      <Table
        className="schedule-table"
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={filteredSchedules}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
        pagination={{
          pageSize: pagination?.limit ?? 10,
          total: globalSearch ? filteredSchedules.length : pagination?.total,
          current: pagination?.page,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total}`,
          size: "default",
        }}
        locale={{
          emptyText: (
            <ScheduleEmptyState
              hasFilters={hasAnyFilter}
              onClearFilters={clearAllFilters}
            />
          ),
        }}
      />

      {/* ── Drawer ── */}
      <ScheduleDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        schedule={selectedSchedule}
      />
    </div>
  );
};

export default ScheduleTable;