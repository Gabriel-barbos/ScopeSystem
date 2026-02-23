import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Schedule, useScheduleService } from "@/services/ScheduleService";
import type { SchedulePayload } from "@/services/ScheduleService";
import {
  Pencil,
  Trash2,
  Car,
  Hash,
  Wrench,
  CalendarCheck,
  ContactRound,
  KeySquare,
  SatelliteDish,
  X,
  Check,
  ChevronsUpDown,
  CalendarSearch,
  UserCog,
  Folder,
  MapPin,
  Phone,
  User,
  ClipboardList,
} from "lucide-react";
import { getStatusConfig } from "@/utils/badges";
import InfoField from "@/components/global/InfoField";
import EditableField from "@/components/global/EditableField";
import { clientApi } from "@/services/ClientService";
import { productApi } from "@/services/ProductService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmModal } from "@/components/ConfirmModal";


type ScheduleDrawerProps = {
  open: boolean;
  onClose: () => void;
  schedule: Schedule | null;
};

type Client = {
  _id: string;
  name: string;
  image?: string[];
};

type Product = {
  _id: string;
  name: string;
};


const isMaintenance = (serviceType: string) => serviceType === "maintenance";

const formatServiceType = (type: string) => {
  const types: Record<string, string> = {
    installation: "Instalação",
    maintenance: "Manutenção",
    removal: "Remoção",
  };
  return types[type] || type;
};


const ScheduleDrawer = ({ open, onClose, schedule }: ScheduleDrawerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState<Schedule | null>(null);

  const [openCalendar, setOpenCalendar] = useState(false);
  const [openClient, setOpenClient] = useState(false);
  const [openProduct, setOpenProduct] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const { updateSchedule, deleteSchedule } = useScheduleService();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isEditing && schedule) loadData();
  }, [isEditing, schedule]);

  if (!schedule) return null;

  const statusBadge = getStatusConfig(
    isEditing ? editedSchedule?.status || schedule.status : schedule.status
  );
  const StatusIcon = statusBadge.icon;

  const loadData = async () => {
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
  };

  const handleEdit = () => {
    setEditedSchedule({ ...schedule });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedSchedule(null);
    setIsEditing(false);
    setOpenCalendar(false);
    setOpenClient(false);
    setOpenProduct(false);
  };

  const handleSave = async () => {
    if (!editedSchedule) return;
    try {
      const payload: SchedulePayload = {
        plate: editedSchedule.plate,
        vin: editedSchedule.vin,
        model: editedSchedule.model,
        provider: editedSchedule.provider,
        vehicleGroup: editedSchedule.vehicleGroup,
        client:
          typeof editedSchedule.client === "string"
            ? editedSchedule.client
            : editedSchedule.client._id,
        serviceType: editedSchedule.serviceType,
        product: editedSchedule.product
          ? typeof editedSchedule.product === "string"
            ? editedSchedule.product
            : editedSchedule.product._id
          : undefined,
        scheduledDate: editedSchedule.scheduledDate,
        notes: editedSchedule.notes,
        status: editedSchedule.status,
        createdBy: editedSchedule.createdBy,
        // Campos exclusivos de manutenção
        serviceAddress: editedSchedule.serviceAddress,
        responsible: editedSchedule.responsible,
        responsiblePhone: editedSchedule.responsiblePhone,
        situation: editedSchedule.situation,
      };

      await updateSchedule.mutateAsync({ id: editedSchedule._id, payload });

      toast.success("Agendamento atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedule", editedSchedule._id] });

      setIsEditing(false);
      setEditedSchedule(null);
      setOpenCalendar(false);
      setOpenClient(false);
      setOpenProduct(false);
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar agendamento");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSchedule.mutateAsync(schedule._id);
      toast.success("Agendamento excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setOpenDeleteModal(false);
      onClose();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir agendamento");
    }
  };

  const updateField = <K extends keyof Schedule>(field: K, value: Schedule[K]) => {
    if (editedSchedule) setEditedSchedule({ ...editedSchedule, [field]: value });
  };

  const currentData = isEditing ? editedSchedule : schedule;
  if (!currentData) return null;

  const selectedClient = clients.find(
    (c) =>
      c._id ===
      (typeof currentData.client === "string"
        ? currentData.client
        : currentData.client._id)
  );

  const selectedProduct = products.find(
    (p) =>
      p._id ===
      (typeof currentData.product === "string"
        ? currentData.product
        : currentData.product?._id)
  );

  const showMaintenanceFields = isMaintenance(currentData.serviceType);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="min-h-[50vh] max-h-[68vh] h-auto flex flex-col"
      >
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {schedule.client.image?.[0] && (
                <img
                  src={schedule.client.image[0]}
                  alt={schedule.client.name}
                  className="w-14 h-14 rounded-lg object-contain bg-white"
                />
              )}
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <Input
                    value={currentData.vin}
                    onChange={(e) => updateField("vin", e.target.value)}
                    className="w-40 h-9"
                    placeholder="VIN"
                  />
                ) : (
                  <span className="text-lg font-semibold">{currentData.vin}</span>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.className}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  <span>{statusBadge.label}</span>
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel} className="gap-2">
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="gap-2"
                    disabled={updateSchedule.isPending}
                  >
                    <Check className="h-4 w-4" />
                    {updateSchedule.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenDeleteModal(true)}
                    className="gap-2 text-red-500 hover:text-red-600"
                    disabled={deleteSchedule.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteSchedule.isPending ? "Excluindo..." : "Excluir"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 flex justify-between py-6">
          <div className="flex gap-12">
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <EditableField icon={KeySquare} label="Placa" value={currentData.plate || ""} onChange={(v) => updateField("plate", v)} placeholder="AAA-0000" />
                  <EditableField icon={Hash} label="Chassi" value={currentData.vin} onChange={(v) => updateField("vin", v)} />
                  <EditableField icon={Car} label="Modelo" value={currentData.model} onChange={(v) => updateField("model", v)} />
                </>
              ) : (
                <>
                  <InfoField icon={KeySquare} label="Placa" value={currentData.plate || "Não informada"} />
                  <InfoField icon={Hash} label="Chassi" value={currentData.vin} />
                  <InfoField icon={Car} label="Modelo" value={currentData.model} />
                </>
              )}
            </div>

            <div className="space-y-4">
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <ContactRound className="h-4 w-4" />
                    Cliente
                  </label>
                  <Popover open={openClient} onOpenChange={setOpenClient}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[200px] justify-between">
                        {selectedClient ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={selectedClient.image?.[0]} />
                              <AvatarFallback>{selectedClient.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{selectedClient.name}</span>
                          </div>
                        ) : (
                          "Selecione o cliente"
                        )}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[200px]">
                      <Command>
                        <CommandInput placeholder="Buscar cliente..." />
                        <CommandList>
                          <CommandEmpty>Nenhum cliente encontrado</CommandEmpty>
                          <CommandGroup>
                            {clients.map((client) => (
                              <CommandItem key={client._id} onSelect={() => { updateField("client", client._id as any); setOpenClient(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", selectedClient?._id === client._id ? "opacity-100" : "opacity-0")} />
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={client.image?.[0]} />
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
                </div>
              ) : (
                <InfoField icon={ContactRound} label="Cliente" value={currentData.client.name} />
              )}

              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Tipo de Serviço
                  </label>
                  <Select value={currentData.serviceType} onValueChange={(v) => updateField("serviceType", v)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="installation">Instalação</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="removal">Remoção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <InfoField icon={Wrench} label="Tipo de Serviço" value={formatServiceType(currentData.serviceType)} />
              )}

              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <SatelliteDish className="h-4 w-4" />
                    Equipamento
                  </label>
                  <Popover open={openProduct} onOpenChange={setOpenProduct}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[200px] justify-between">
                        {selectedProduct?.name || "Selecione o produto"}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[200px]">
                      <Command>
                        <CommandInput placeholder="Buscar produto..." />
                        <CommandList>
                          <CommandEmpty>Nenhum produto encontrado</CommandEmpty>
                          <CommandGroup>
                            {products.map((product) => (
                              <CommandItem key={product._id} onSelect={() => { updateField("product", product._id as any); setOpenProduct(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", selectedProduct?._id === product._id ? "opacity-100" : "opacity-0")} />
                                {product.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <InfoField icon={SatelliteDish} label="Equipamento" value={currentData.product?.name || "Não informado"} />
              )}
            </div>

            <div className="space-y-4">
              {isEditing ? (
                <>
                  <EditableField icon={UserCog} label="Prestador" value={currentData.provider || ""} onChange={(v) => updateField("provider", v)} placeholder="Nome do prestador" />
                  <EditableField icon={Folder} label="Grupo de Veículos" value={currentData.vehicleGroup || ""} onChange={(v) => updateField("vehicleGroup", v)} placeholder="Nome do grupo de veículos" />
                </>
              ) : (
                <>
                  <InfoField icon={UserCog} label="Prestador" value={currentData.provider || "Não informado"} />
                  <InfoField icon={Folder} label="Grupo de Veículos" value={currentData.vehicleGroup || "Não informado"} />
                </>
              )}
            </div>

     
            {showMaintenanceFields && (
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <EditableField icon={MapPin} label="Endereço do serviço" value={currentData.serviceAddress || ""} onChange={(v) => updateField("serviceAddress", v)} placeholder="Endereço completo" />
                    <EditableField icon={User} label="Responsável" value={currentData.responsible || ""} onChange={(v) => updateField("responsible", v)} placeholder="Nome do responsável" />
                    <EditableField icon={Phone} label="Telefone do responsável" value={currentData.responsiblePhone || ""} onChange={(v) => updateField("responsiblePhone", v)} placeholder="(00) 00000-0000" />
                    <EditableField icon={ClipboardList} label="Situação" value={currentData.situation || ""} onChange={(v) => updateField("situation", v)} placeholder="Situação atual" />
                  </>
                ) : (
                  <>
                    <InfoField icon={MapPin} label="Endereço do serviço" value={currentData.serviceAddress || "Não informado"} />
                    <InfoField icon={User} label="Responsável" value={currentData.responsible || "Não informado"} />
                    <InfoField icon={Phone} label="Telefone do responsável" value={currentData.responsiblePhone || "Não informado"} />
                    <InfoField icon={ClipboardList} label="Situação" value={currentData.situation || "Não informado"} />
                  </>
                )}
              </div>
            )}
          </div>

          <div className="w-[380px] flex flex-col gap-4">
            {isEditing && (
              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground">Status</label>
                <Select value={currentData.status} onValueChange={(v) => updateField("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="criado">Criado</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isEditing ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  Data agendada
                </label>
                <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-between">
                      {currentData.scheduledDate
                        ? new Date(currentData.scheduledDate).toLocaleDateString("pt-BR")
                        : "Selecionar data"}
                      <CalendarSearch className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={currentData.scheduledDate ? new Date(currentData.scheduledDate) : undefined}
                      onSelect={(date) => {
                        if (date) updateField("scheduledDate", date.toISOString());
                        setOpenCalendar(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <InfoField
                icon={CalendarCheck}
                label="Data agendada"
                value={
                  currentData.scheduledDate
                    ? new Date(currentData.scheduledDate).toLocaleDateString("pt-BR")
                    : "Não informado"
                }
              />
            )}

            <div className="flex-1 flex flex-col min-h-0">
              <span className="text-sm text-muted-foreground mb-2 block">Observações</span>
              <Textarea
                value={currentData.notes || ""}
                onChange={(e) => isEditing && updateField("notes", e.target.value)}
                readOnly={!isEditing}
                placeholder={isEditing ? "Adicione observações..." : "Sem observações"}
                className="h-150 resize-none"
              />
            </div>
          </div>
        </div>

        <SheetFooter className="border-t pt-2">
          <div className="w-full flex items-center justify-between text-sm text-muted-foreground">
            <span>Criado por {schedule.createdBy || "Sistema"}</span>
            <span>
              Última modificação em{" "}
              {schedule.updatedAt
                ? new Date(schedule.updatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Não informado"}
            </span>
            <span>Número do pedido: #{schedule.orderNumber}</span>
          </div>
        </SheetFooter>
      </SheetContent>

      <ConfirmModal
        open={openDeleteModal}
        onOpenChange={(open) => !open && setOpenDeleteModal(false)}
        title="Excluir agendamento"
        description={`Tem certeza que deseja excluir este agendamento do cliente "${schedule.client.name}"?`}
        confirmText="Excluir"
        onConfirm={handleDelete}
      />
    </Sheet>
  );
};

export default ScheduleDrawer;