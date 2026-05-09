import React, { useCallback, useMemo } from "react";
import { Table, Input, Button, Space, Avatar as AntAvatar, Select } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { InputRef } from "antd";
import Highlighter from "react-highlight-words";
import { Router, SquareUser } from "lucide-react";

import type { Service } from "@/services/ServiceService";
import { DateRangeFilter } from "@/components/global/DataRangeFilter";
import { getServiceConfig } from "@/utils/badges";
import type { TableFilters } from "./useServiceFilters";

// Opções fixas de tipo de serviço
const SERVICE_TYPE_OPTIONS = [
  { value: "installation",   label: "Instalação" },
  { value: "maintenance",    label: "Manutenção" },
  { value: "removal",        label: "Remoção" },
  { value: "reinstallation", label: "Reinstalação" },
  { value: "diagnostic",     label: "Diagnóstico" },
];

interface Props {
  data: Service[];
  isLoading: boolean;
  pagination?: { total: number; page: number; limit: number };
  hasFilters: boolean;
  tableFilters: TableFilters;
  onClearFilters: () => void;
  onRowClick: (record: Service) => void;
  onTableChange: (pagination: any, filters: any) => void;
  searchText: string;
  searchedColumn: string;
  searchInput: React.RefObject<InputRef>;
  onSearch: (keys: string[], confirm: () => void, dataIndex: string) => void;
  onReset: (clearFilters: () => void, dataIndex: string) => void;
  clientOptions: { value: string; label: string }[];
  currentPage: number;
  pageLimit: number;
}

const ServiceTableCore: React.FC<Props> = ({
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
  currentPage,
  pageLimit,
}) => {
  // ─── Filter helpers 

  const getColumnSearchProps = useCallback(
    (dataIndex: string): ColumnType<Service> => ({
      filteredValue: tableFilters[dataIndex] ?? null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-2 w-56">
          <Input
            ref={searchInput}
            placeholder="Buscar..."
            value={selectedKeys[0] as string}
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

  const getSelectFilterProps = useCallback(
    (
      columnKey: string,
      options: { value: string; label: string }[],
      placeholder: string
    ): Partial<ColumnType<Service>> => ({
      filteredValue: tableFilters[columnKey] ?? null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-3 w-72">
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

  // ─── Definição de colunas 

  const columns: ColumnsType<Service> = useMemo(() => [
    {
      title: "Cliente",
      key: "client",
      width: 220,
      ...getSelectFilterProps("client", clientOptions, "Selecione o cliente"),
      render: (_, record) => {
        const name  = record.client?.name ?? "Desconhecido";
        const image = record.client?.image?.[0];
        return (
          <Space>
            <AntAvatar
              shape="square"
              size={36}
              src={image}
              icon={!image ? <SquareUser size={16} /> : undefined}
            />
            <span className="font-medium text-sm">{name}</span>
          </Space>
        );
      },
    },
    {
      title: "Chassi",
      dataIndex: "vin",
      key: "vin",
      width: 190,
      ...getColumnSearchProps("vin"),
      render: (vin: string) => (
        <span className="font-mono text-sm font-semibold">{vin}</span>
      ),
    },
    {
      title: "Dispositivo",
      dataIndex: "deviceId",
      key: "deviceId",
      width: 150,
      ...getColumnSearchProps("deviceId"),
      render: (deviceId: string) => (
        <span className="font-mono text-sm font-semibold">{deviceId}</span>
      ),
    },
    {
      title: "Data de Instalação",
      key: "validatedAt",
      width: 160,
      filteredValue: tableFilters["validatedAt"] ?? null,
      filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
        <DateRangeFilter
          onChange={(dates) => {
            if (dates) {
              setSelectedKeys([`${dates[0]},${dates[1]}`]);
              confirm();
            }
          }}
          onClear={() => {
            clearFilters?.();
            confirm();
          }}
        />
      ),
      render: (_, record) => {
        if (!record.validatedAt) return <span className="text-muted-foreground text-xs">—</span>;
        const d = new Date(record.validatedAt);
        return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
      },
    },
    {
      title: "Tipo de Serviço",
      dataIndex: "serviceType",
      key: "serviceType",
      width: 160,
      ...getSelectFilterProps("serviceType", SERVICE_TYPE_OPTIONS, "Tipo de serviço"),
      render: (serviceType: string) => {
        const config = getServiceConfig(serviceType || "");
        const Icon   = config.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
            <Icon className="h-3 w-3" />
            {config.label}
          </span>
        );
      },
    },
    {
      title: "Equipamento",
      key: "product",
      width: 140,
      render: (_, record) =>
        record.product?.name ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Router className="h-3.5 w-3.5 shrink-0" />
            {record.product.name}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      title: "",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={(e) => { e.stopPropagation(); onRowClick(record); }}
        >
          Detalhes
        </Button>
      ),
    },
  ], [clientOptions, tableFilters, getColumnSearchProps, getSelectFilterProps, onRowClick]);

  // ─── Render 

  return (
    <Table
      className="service-table"
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
        emptyText: hasFilters ? (
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <p className="text-sm">Nenhum serviço encontrado para os filtros aplicados.</p>
            <Button size="small" onClick={onClearFilters}>Limpar filtros</Button>
          </div>
        ) : (
          <div className="py-12 text-sm text-muted-foreground">Nenhum serviço encontrado.</div>
        ),
      }}
      scroll={{ x: 900 }}
    />
  );
};

export default ServiceTableCore;
