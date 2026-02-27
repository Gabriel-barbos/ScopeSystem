import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  KeySquare,
  ChevronsUpDown,
  Check,
  ShieldUser,
  CalendarSearch,
  Car,
  Hash,
  Folder,
  MapPin,
  Navigation,
  User,
  Phone,
  StickyNote,
  Wrench,
} from "lucide-react";
import { LoadingOutlined } from "@ant-design/icons";

import { InputWithIcon } from "../InputWithIcon";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { productApi } from "@/services/ProductService";
import { scheduleApi, useScheduleService } from "@/services/ScheduleService";
import type { SchedulePayload } from "@/services/ScheduleService";
import { clientApi } from "@/services/ClientService";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/context/Authcontext";

type Client = { _id: string; name: string; image?: string };
type Product = { _id: string; name: string };

const FormSchema = z.object({
  plate: z.string().optional(),
  vin: z.string().regex(/^[A-HJ-NPR-Z0-9]{17}$/, "Chassi inválido"),
  model: z.string().min(2, "Modelo é obrigatório"),
  scheduledDate: z.string().optional(),
  serviceType: z.string().min(1, "Tipo de serviço é obrigatório"),
  notes: z.string().optional(),
  client: z.string().min(1, "Cliente é obrigatório"),
  vehicleGroup: z.string().optional(),
  provider: z.string().optional(),
  product: z.string().optional(),
  status: z.string().optional(),
  condutor: z.string().optional(),
  responsiblePhone: z.string().optional(),
  serviceAddress: z.string().optional(),
  serviceLocation: z.string().optional(),
  orderNumber: z.string().optional(),
  createdBy: z.string().optional(),
});

export type ScheduleFormValues = z.infer<typeof FormSchema>;

type Props = {
  scheduleId?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 pb-1 border-b border-dashed">
      {children}
    </p>
  );
}

export default function ScheduleForm({ scheduleId, onSuccess, onCancel }: Props) {
  const isEditing = Boolean(scheduleId);
  const { user } = useAuth();

  const [openCalendar, setOpenCalendar] = useState(false);
  const [openClient, setOpenClient] = useState(false);
  const [openProduct, setOpenProduct] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const { data: schedule, isLoading } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => scheduleApi.getById(scheduleId!),
    enabled: !!scheduleId,
  });

  const { createSchedule, updateSchedule } = useScheduleService();

  const {
    register,
    reset,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      plate: "",
      vin: "",
      model: "",
      scheduledDate: "",
      serviceType: "",
      notes: "",
      client: "",
      product: "",
      status: "",
      createdBy: "",
      orderNumber: "",
      provider: "",
      serviceAddress: "",
      serviceLocation: "",
      condutor: "",
      responsiblePhone: "",
      vehicleGroup: "",
    },
  });

  const serviceType = watch("serviceType");
  const isMaintenance = serviceType === "maintenance";

  useEffect(() => {
    async function loadData() {
      try {
        const [clientsRes, productsRes] = await Promise.all([
          clientApi.getAll(),
          productApi.getAll(),
        ]);
        setClients(clientsRes.data ?? clientsRes);
        setProducts(productsRes.data ?? productsRes);
      } catch {
        toast.error("Erro ao carregar dados");
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (schedule) {
      reset({
        plate: schedule.plate,
        vin: schedule.vin,
        model: schedule.model,
        scheduledDate: schedule.scheduledDate,
        serviceType: schedule.serviceType,
        notes: schedule.notes,
        orderNumber: schedule.orderNumber,
        client: schedule.client._id,
        product: schedule.product?._id,
        status: schedule.status,
        createdBy: schedule.createdBy,
        provider: schedule.provider,
        vehicleGroup: schedule.vehicleGroup || "",
        serviceAddress: schedule.serviceAddress || "",
        serviceLocation: schedule.serviceLocation || "",
        condutor: schedule.condutor || "",
        responsiblePhone: schedule.responsiblePhone || "",
      });
    }
  }, [schedule, reset]);

  async function onSubmit(data: ScheduleFormValues) {
    try {
      const payload: SchedulePayload = {
        plate: data.plate,
        vin: data.vin,
        model: data.model,
        client: data.client,
        provider: data.provider,
        serviceType: data.serviceType,
        ...(data.product && { product: data.product }),
        scheduledDate: data.scheduledDate || undefined,
        notes: data.notes,
        status: data.scheduledDate ? "agendado" : "criado",
        createdBy: user?.name || "",
        orderNumber: data.orderNumber,
        vehicleGroup: data.vehicleGroup,
        serviceAddress: data.serviceAddress,
        serviceLocation: data.serviceLocation,
        // Manutenção apenas
        ...(isMaintenance && {
          condutor: data.condutor,
          responsiblePhone: data.responsiblePhone,
        }),
      };

      if (isEditing && scheduleId) {
        await updateSchedule.mutateAsync({ id: scheduleId, payload });
        toast.success("Agendamento atualizado com sucesso");
      } else {
        await createSchedule.mutateAsync(payload);
        toast.success("Agendamento criado com sucesso");
      }

      onSuccess();
    } catch {
      toast.error("Erro ao salvar agendamento");
    }
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <LoadingOutlined className="text-2xl" />
        <p className="ml-3 text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-4">

      {/* ── Veículo ── */}
      <div className="space-y-3">
        <SectionLabel>Veículo</SectionLabel>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Placa</Label>
            <InputWithIcon
              icon={<Hash className="h-4 w-4" />}
              placeholder="ABC-1234"
              {...register("plate")}
            />
          </div>
          <div className="space-y-1">
            <Label>Nº do Pedido</Label>
            <InputWithIcon
              icon={<Hash className="h-4 w-4" />}
              placeholder="Pedido"
              {...register("orderNumber")}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Chassi *</Label>
          <InputWithIcon
            icon={<KeySquare className="h-4 w-4" />}
            placeholder="17 caracteres"
            {...register("vin")}
          />
          {errors.vin && (
            <p className="text-xs text-red-500">{errors.vin.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Modelo</Label>
            <InputWithIcon
              icon={<Car className="h-4 w-4" />}
              placeholder="Modelo"
              {...register("model")}
            />
          </div>
          <div className="space-y-1">
            <Label>Grupo de Veículos</Label>
            <InputWithIcon
              icon={<Folder className="h-4 w-4" />}
              placeholder="Grupo"
              {...register("vehicleGroup")}
            />
          </div>
        </div>
      </div>

      {/* ── Serviço ── */}
      <div className="space-y-3">
        <SectionLabel>Serviço</SectionLabel>

        <div className="space-y-1">
          <Label>Tipo de Serviço *</Label>
          <Controller
            name="serviceType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="installation">Instalação</SelectItem>
                  <SelectItem value="removal">Remoção</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.serviceType && (
            <p className="text-xs text-red-500">{errors.serviceType.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Cliente *</Label>
          <Controller
            name="client"
            control={control}
            render={({ field }) => (
              <Popover open={openClient} onOpenChange={setOpenClient}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal">
                    {field.value
                      ? clients.find((c) => c._id === field.value)?.name
                      : "Selecione o cliente"}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-72">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>Nenhum cliente encontrado</CommandEmpty>
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem
                            key={client._id}
                            onSelect={() => {
                              field.onChange(client._id);
                              setOpenClient(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === client._id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={client.image} />
                              <AvatarFallback>{client.name[0]}</AvatarFallback>
                            </Avatar>
                            {client.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.client && (
            <p className="text-xs text-red-500">{errors.client.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Produto</Label>
          <Controller
            name="product"
            control={control}
            render={({ field }) => (
              <Popover open={openProduct} onOpenChange={setOpenProduct}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal">
                    {field.value
                      ? products.find((p) => p._id === field.value)?.name
                      : "Selecione o produto"}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-72">
                  <Command>
                    <CommandInput placeholder="Buscar produto..." />
                    <CommandList>
                      <CommandGroup>
                        {products.map((product) => (
                          <CommandItem
                            key={product._id}
                            onSelect={() => {
                              field.onChange(product._id);
                              setOpenProduct(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === product._id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {product.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Prestador</Label>
            <InputWithIcon
              icon={<ShieldUser className="h-4 w-4" />}
              placeholder="Prestador"
              {...register("provider")}
            />
          </div>
          <div className="space-y-1">
            <Label>Data do Agendamento</Label>
            <Controller
              name="scheduledDate"
              control={control}
              render={({ field }) => (
                <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between font-normal">
                      {field.value
                        ? new Date(field.value).toLocaleDateString("pt-BR")
                        : "Selecionar"}
                      <CalendarSearch className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date?.toISOString());
                        setOpenCalendar(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
        </div>
      </div>

      {/* ── Local do Serviço (sempre visível) ── */}
      <div className="space-y-3">
        <SectionLabel>Local do Serviço</SectionLabel>

        <div className="space-y-1">
          <Label>Endereço</Label>
          <InputWithIcon
            icon={<MapPin className="h-4 w-4" />}
            placeholder="Rua, número, bairro..."
            {...register("serviceAddress")}
          />
        </div>

        <div className="space-y-1">
          <Label>Local do Serviço</Label>
          <InputWithIcon
            icon={<Navigation className="h-4 w-4" />}
            placeholder="Portão lateral, galpão 2..."
            {...register("serviceLocation")}
          />
        </div>
      </div>

      {/* ── Manutenção (condicional) ── */}
      {isMaintenance && (
        <div className="space-y-3">
          <SectionLabel>
            <span className="flex items-center gap-1.5">
              <Wrench className="h-3 w-3" />
              Dados da Manutenção
            </span>
          </SectionLabel>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Condutor</Label>
              <InputWithIcon
                icon={<User className="h-4 w-4" />}
                placeholder="Nome do condutor"
                {...register("condutor")}
              />
            </div>
            <div className="space-y-1">
              <Label>Tel. Responsável</Label>
              <InputWithIcon
                icon={<Phone className="h-4 w-4" />}
                placeholder="(11) 99999-9999"
                {...register("responsiblePhone")}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Observações ── */}
      <div className="space-y-3">
        <SectionLabel>Observações</SectionLabel>
        <div className="space-y-1">
          <Textarea
            placeholder="Informações adicionais sobre o agendamento..."
            className="resize-none min-h-[80px]"
            {...register("notes")}
          />
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          {isEditing ? "Atualizar" : "Criar"} Agendamento
        </Button>
      </div>
    </form>
  );
}