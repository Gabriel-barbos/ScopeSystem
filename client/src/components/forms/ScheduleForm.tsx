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
  Folder
} from "lucide-react";
import { LoadingOutlined } from "@ant-design/icons";

// UI Components
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


type Client = {
  _id: string;
  name: string;
  image?: string;
};

type Product = {
  _id: string;
  name: string;
};


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
  orderNumber: z.string().optional(),
  createdBy: z.string().optional(),
});

export type ScheduleFormValues = z.infer<typeof FormSchema>;



type Props = {
  scheduleId?: string;
  onSuccess: () => void;
  onCancel: () => void;
};


export default function ScheduleForm({
  scheduleId,
  onSuccess,
  onCancel,
}: Props) {
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
      vehicleGroup: "",
    },
  });

  const serviceType = watch("serviceType");

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
   
      {/* Veículo */}
      <div className="space-y-1  ">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Placa</Label>
            <InputWithIcon
              icon={<Hash className="h-4 w-4" />}
              placeholder="Placa"
              {...register("plate")}
            />
          </div>

          <div className="flex-1">
            <Label>Número do pedido</Label>
            <InputWithIcon
              icon={<Hash className="h-4 w-4" />}
              placeholder="Numero do pedido"
              {...register("orderNumber")}
            />
          </div>
        </div>

        <div>
          <Label>Chassi *</Label>
          <InputWithIcon
            icon={<KeySquare className="h-4 w-4" />}
            placeholder="VIN"
            {...register("vin")}
          />
          {errors.vin && (
            <p className="text-sm text-red-500">{errors.vin.message}</p>
          )}
        </div>

        <div>
          <Label>Modelo</Label>
          <InputWithIcon
            icon={<Car className="h-4 w-4" />}
            placeholder="Modelo"
            {...register("model")}
          />
        </div>
      </div>

      {/* Tipo de Serviço */}
      <div className="space-y-1">
        <Label>Tipo do serviço</Label>
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
      </div>

  
      {/* Cliente */}
      <div className="space-y-1">
        <Label>Cliente</Label>
        <Controller
          name="client"
          control={control}
          render={({ field }) => (
            <Popover open={openClient} onOpenChange={setOpenClient}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {field.value
                    ? clients.find((c) => c._id === field.value)?.name
                    : "Selecione o cliente"}
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
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
                              field.value === client._id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={client.image} />
                            <AvatarFallback>
                              {client.name[0]}
                            </AvatarFallback>
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
      </div>

      {/* Produto */}
     
        <div className="space-y-1">
          <Label>Produto</Label>
          <Controller
            name="product"
            control={control}
            render={({ field }) => (
              <Popover open={openProduct} onOpenChange={setOpenProduct}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {field.value
                      ? products.find((p) => p._id === field.value)?.name
                      : "Selecione o produto"}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
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
     

      {/* Data */}
      <div className="space-y-1">
        <Label>Data do Agendamento</Label>
        <Controller
          name="scheduledDate"
          control={control}
          render={({ field }) => (
            <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between">
                  {field.value
                    ? new Date(field.value).toLocaleDateString("pt-BR")
                    : "Selecionar data"}
                  <CalendarSearch />
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

        <div>
          <Label>Grupo de veiculos</Label>
          <InputWithIcon
            icon={<Folder className="h-4 w-4" />}
            placeholder="Grupo de veiculos"
            {...register("vehicleGroup")}
          />
        </div>

             <div>
          <Label>Prestador</Label>
          <InputWithIcon
            icon={<ShieldUser className="h-4 w-4" />}
            placeholder="Prestador"
            {...register("provider")}
          />
        </div>

      {/* Notas */}
      <div>
        <Label>Notas</Label>
        <Textarea placeholder="Notas adicionais" {...register("notes")} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
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
