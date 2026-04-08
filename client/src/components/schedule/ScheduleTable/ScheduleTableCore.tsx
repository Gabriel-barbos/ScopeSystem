import React, { useCallback, useMemo } from "react";
import { Table, Input, Button, Space, Avatar as AntAvatar, Select } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { InputRef } from "antd";
import Highlighter from "react-highlight-words";
import { Store } from "lucide-react";

import { Schedule } from "@/services/ScheduleService";
import { DateRangeFilter } from "../../global/DataRangeFilter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getStatusConfig, getServiceConfig, statusFilterOptions } from "@/utils/badges";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ScheduleEmptyState from "../ScheduleEmptyState";
import { getInitials, DataIndex, TableFilters } from "./useScheduleFilters";

interface ScheduleTableCoreProps {
  data: Schedule[];
  isLoading: boolean;
  pagination?: { total: number; page: number; limit: number };
  hasFilters: boolean;
  tableFilters: TableFilters;
  onClearFilters: () => void;
  onRowClick: (record: Schedule) => void;
  onTableChange: (pagination: any, filters: any) => void;
  searchText: string;
  searchedColumn: string;
  searchInput: React.RefObject<InputRef>;
  onSearch: (keys: string[], confirm: () => void, dataIndex: DataIndex) => void;
  onReset: (clearFilters: () => void, dataIndex: DataIndex) => void;
  clientOptions: { value: string; label: string }[];
  serviceOptions: { value: string; label: string }[];
  hideServiceColumn?: boolean;
  currentPage: number;
  pageLimit: number;
}

const ScheduleTableCore: React.FC<ScheduleTableCoreProps> = ({
  data,
  isLoading,
  pagination,
  hasFilters,
  tableFilters,
  onClearFilters,
  onRowClick,
  onTableChange,
  searchText,
  searchedColumn,
  searchInput,
  onSearch,
  onReset,
  clientOptions,
  serviceOptions,
  hideServiceColumn = false,
  currentPage,
  pageLimit,
}) => {
  const getColumnSearchProps = useCallback(
    (dataIndex: DataIndex, _getValue: (r: Schedule) => string): ColumnType<Schedule> => ({
      filteredValue: tableFilters[dataIndex] ?? null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-2 w-60">
          <Input
            ref={searchInput}
            placeholder="Buscar..."
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => onSearch(selectedKeys as string[], confirm, dataIndex)}
            className="mb-2"
          />
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<SearchOutlined />}
              onClick={() => onSearch(selectedKeys as string[], confirm, dataIndex)}
            >
              Buscar
            </Button>
            <Button size="small" onClick={() => clearFilters && onReset(clearFilters, dataIndex)}>
              Limpar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined className={filtered ? "text-blue-500" : ""} />,
      render: (text) =>
        searchedColumn === dataIndex ? (
          <Highlighter searchWords={[searchText]} textToHighlight={text?.toString() || ""} />
        ) : (
          text
        ),
    }),
    [tableFilters, searchText, searchedColumn, searchInput, onSearch, onReset]
  );

  const createSelectFilter = useCallback(
    (
      columnKey: string,
      options: { value: string; label: string }[],
      placeholder: string,
      width = "w-64"
    ): Partial<ColumnType<Schedule>> => ({
      filteredValue: tableFilters[columnKey] ?? null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className={`p-3 ${width}`}>
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder={placeholder}
            options={options}
            value={selectedKeys as string[]}
            onChange={(values) => setSelectedKeys(values)}
            className="w-full mb-2"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            maxTagCount="responsive"
          />
          <Space className="w-full flex justify-between">
            <Button type="primary" size="small" onClick={() => confirm()}>Aplicar</Button>
            <Button size="small" onClick={() => clearFilters?.()}>Limpar</Button>
          </Space>
        </div>
      ),
    }),
    [tableFilters]
  );

  const columns: ColumnsType<Schedule> = useMemo(() => {
    const base: ColumnsType<Schedule> = [
      {
        title: "Cliente",
        key: "client",
        ...createSelectFilter("client", clientOptions, "Selecione os clientes", "w-72"),
        render: (_, record) => {
          const name    = record.client?.name ?? "Cliente Desconhecido";
          const image   = record.client?.image?.[0];
          const unknown = !record.client?._id;
          return (
            <Space>
              <AntAvatar shape="square" size="large" src={image} icon={!image ? <Store size={18} /> : undefined} />
              <span className={`font-medium ${unknown ? "text-muted-foreground italic" : ""}`}>{name}</span>
            </Space>
          );
        },
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
        filteredValue: tableFilters["scheduledDate"] ?? null,
        filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
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
        sorter: true,
        sortDirections: ["ascend", "descend"] as const,
        render: (_, record) => {
          const date    = record.scheduledDate ? new Date(record.scheduledDate) : null;
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
    ];

    if (!hideServiceColumn) {
      base.push({
        title: "Serviço",
        dataIndex: "serviceType",
        key: "serviceType",
        ...createSelectFilter("serviceType", serviceOptions, "Selecione os serviços"),
        render: (serviceType: string) => {
          const config = getServiceConfig(serviceType || "");
          const Icon   = config.icon;
          return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
              <Icon className="h-3.5 w-3.5" />
              <span>{config.label}</span>
            </span>
          );
        },
      });
    }

    base.push(
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        ...createSelectFilter("status", statusFilterOptions, "Selecione os status"),
        render: (status: string) => {
          const config = getStatusConfig(status);
          const Icon   = config.icon;
          return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
              <Icon className="h-3.5 w-3.5" />
              <span>{config.label}</span>
            </span>
          );
        },
      },
      {
        title: "Responsável",
        dataIndex: "responsible",
        key: "responsible",
        ...getColumnSearchProps("responsible", (r) => r.responsible || ""),
        render: (responsible: string) => (
          <div className="flex justify-center items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                    {getInitials(responsible || "?")}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent><p>{responsible}</p></TooltipContent>
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
            onClick={(e) => { e.stopPropagation(); onRowClick(record); }}
          >
            Detalhes
          </Button>
        ),
      }
    );

    return base;
  }, [
    clientOptions, serviceOptions, tableFilters,
    getColumnSearchProps, createSelectFilter,
    onRowClick, hideServiceColumn,
  ]);

  return (
    <Table
      className="schedule-table"
      rowKey="_id"
      loading={isLoading}
      columns={columns}
      dataSource={data}
      onChange={onTableChange}
      onRow={(record) => ({
        onClick: () => onRowClick(record),
        style: { cursor: "pointer" },
      })}
      pagination={{
        current:         currentPage,
        pageSize:        pageLimit,
        total:           pagination?.total ?? data.length,
        showSizeChanger: false,
        showTotal:       (total, range) => `${range[0]}-${range[1]} de ${total}`,
      }}
      locale={{
        emptyText: (
          <ScheduleEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
        ),
      }}
    />
  );
};

export default ScheduleTableCore;