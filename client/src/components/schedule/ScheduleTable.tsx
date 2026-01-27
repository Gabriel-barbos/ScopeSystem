import React, { useRef, useState } from "react";
import { Table, Input, Button, Space, Avatar as AntAvatar, Select } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType, ColumnType } from "antd/es/table";
import Highlighter from "react-highlight-words";

import { Store } from "lucide-react";

import { useScheduleService, Schedule } from "@/services/ScheduleService";
import { DateRangeFilter } from "../DataRangeFilter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  getStatusConfig,
  getServiceConfig,
  statusFilterOptions
} from "@/utils/badges";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import ScheduleDrawer from "./ScheduleDrawer";

type DataIndex = "vin" | "serviceType" | "status" | "createdBy";

// Função para pegar iniciais
const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ScheduleTable: React.FC = () => {
  const { data, isLoading } = useScheduleService();

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchInput = useRef<any>(null);

  // Opções de clientes para o filtro
  const clientOptions = React.useMemo(() => {
    if (!data) return [];
    const map = new Map<string, string>();
    data.forEach((item) => {
      map.set(item.client._id, item.client.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({
      value: id,
      label: name,
    }));
  }, [data]);

  // Opções de serviços únicos com tradução
  const serviceOptions = React.useMemo(() => {
    if (!data) return [];
    const services = new Set(data.map((item) => item.serviceType).filter(Boolean));
    return Array.from(services).map((service) => ({
      value: service,
      label: getServiceConfig(service).label,
    }));
  }, [data]);

  const handleSearch = (
    selectedKeys: string[],
    confirm: () => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex,
    getValue: (record: Schedule) => string
  ): ColumnType<Schedule> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
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
  });

  const columns: ColumnsType<Schedule> = [
    {
      title: "Cliente",
      key: "client",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-3 w-72">
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder="Selecione os clientes"
            options={clientOptions}
            value={selectedKeys}
            onChange={(values) => {
              setSelectedKeys(values);
            }}
            className="w-full mb-2"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            maxTagCount="responsive"
          />
          <Space className="w-full flex justify-between">
            <Button
              type="primary"
              size="small"
              onClick={() => confirm()}
            >
              Aplicar
            </Button>
            <Button
              size="small"
              onClick={() => clearFilters?.()}
            >
              Limpar
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => record.client._id === value,
      render: (_, record) => (
        record.client.image?.[0] ? (
              <Space>
            <AntAvatar
              shape="square"
              size="large"
              src={record.client.image?.[0]}
             
            />
            
            <span className="text-style-bold">{record.client.name}</span>
          </Space>
          
        ) : (
          <Space>
            <AntAvatar
                icon={<Store />}
              shape="square"
              size="large"
              src={record.client.image?.[0]}
            />
            <span>{record.client.name}</span>
          </Space>
        )
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
          }}
        />
      ),
      onFilter: (value, record) => {
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
      sorter: (a, b) => {
        const dateA = a.scheduledDate
          ? new Date(a.scheduledDate).getTime()
          : Infinity;

        const dateB = b.scheduledDate
          ? new Date(b.scheduledDate).getTime()
          : Infinity;

        return dateA - dateB;
      },
      sortDirections: ["ascend", "descend"],
      render: (_, record) => {
        const date = record.scheduledDate
          ? new Date(record.scheduledDate)
          : null;

        const isValidDate = date && !isNaN(date.getTime());

        if (!isValidDate) {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border text-muted-foreground bg-muted">
              A definir
            </span>
          );
        }

        return date.toLocaleDateString("pt-BR");
      },
    },

    {
      title: "Serviço",
      dataIndex: "serviceType",
      key: "serviceType",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-3 w-64">
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder="Selecione os serviços"
            options={serviceOptions}
            value={selectedKeys}
            onChange={(values) => {
              setSelectedKeys(values);
            }}
            className="w-full mb-2"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            maxTagCount="responsive"
          />
          <Space className="w-full flex justify-between">
            <Button
              type="primary"
              size="small"
              onClick={() => confirm()}
            >
              Aplicar
            </Button>
            <Button
              size="small"
              onClick={() => clearFilters?.()}
            >
              Limpar
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => record.serviceType === value,
      render: (serviceType) => {
        const config = getServiceConfig(serviceType || "");
        const Icon = config.icon;

        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
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
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-3 w-64">
          <Select
            mode="multiple"
            allowClear
            placeholder="Selecione os status"
            options={statusFilterOptions}
            value={selectedKeys}
            onChange={(values) => {
              setSelectedKeys(values);
            }}
            className="w-full mb-2"
            maxTagCount="responsive"
          />
          <Space className="w-full flex justify-between">
            <Button
              type="primary"
              size="small"
              onClick={() => confirm()}
            >
              Aplicar
            </Button>
            <Button
              size="small"
              onClick={() => clearFilters?.()}
            >
              Limpar
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const config = getStatusConfig(status);
        const Icon = config.icon;

        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
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
      ...getColumnSearchProps("createdBy", (r) => r.createdBy),
      render: (createdBy) => (
        <div className="flex justify-center items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                  {getInitials(createdBy)}
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
  onClick={() => {
    setSelectedSchedule(record);
    setDrawerOpen(true);
  }}
>
  Detalhes
</Button>
      ),
    },
  ];

  return (
    <>
      <Table
        className="bg-card rounded-lg"
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
      />

<ScheduleDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  schedule={selectedSchedule}
/>
    </>
  );
};

export default ScheduleTable;