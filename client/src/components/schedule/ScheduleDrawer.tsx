import { useState, useEffect } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Schedule, useScheduleService, type SchedulePayload,
} from "@/services/ScheduleService";
import {
  Pencil, Trash2, Car, Hash, Wrench, CalendarCheck, ContactRound,
  KeySquare, SatelliteDish, X, Check, ChevronsUpDown, CalendarSearch,
  UserCog, Folder, MapPin, Phone, User, ClipboardList, Navigation,
  FileText,
} from "lucide-react";
import { getStatusConfig } from "@/utils/badges";
import InfoField from "@/components/global/InfoField";
import EditableField from "@/components/global/EditableField";
import { ResponsiblePicker } from "@/components/global/ResponsiblePicker";
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

type Client = { _id: string; name: string; image?: string[] };
type Product = { _id: string; name: string };


const SERVICE_TYPES: Record<string, string> = {
  installation: "Instalação",
  maintenance: "Manutenção",
  removal: "Remoção",
};

const STATUS_OPTIONS = [
  { value: "criado",     label: "Criado" },
  { value: "agendado",   label: "Agendado" },
  { value: "concluido",  label: "Concluído" },
  { value: "cancelado",  label: "Cancelado" },
  { value: "atrasado",   label: "Atrasado" },
];


const isMaintenance = (t: string) => t === "maintenance";
const getClientId = (c: Schedule["client"]) => (typeof c === "string" ? c : c._id);
const getProductId = (p: Schedule["product"]) => (typeof p === "string" ? p : p?._id);
const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();


type FieldProps = {
  editing: boolean;
  icon: React.ElementType;
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
};

const Field = ({ editing, icon, label, value, onChange, placeholder }: FieldProps) =>
  editing ? (
    <EditableField
      icon={icon} label={label} value={value}
      onChange={onChange!} placeholder={placeholder}
    />
  ) : (
    <InfoField icon={icon} label={label} value={value || "Não informado"} />
  );

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
    {children}
  </p>
);


const ScheduleDrawer = ({ open, onClose, schedule }: ScheduleDrawerProps) => {
  const [isEditing, setIsEditing]       = useState(false);
  const [editedSchedule, setEditedSchedule] = useState<Schedule | null>(null);
  const [openClient, setOpenClient]     = useState(false);
  const [openProduct, setOpenProduct]   = useState(false);
  const [clients, setClients]           = useState<Client[]>([]);
  const [products, setProducts]         = useState<Product[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [openCalendar, setOpenCalendar] = useState(false);
  const [openOrderDateCalendar, setOpenOrderDateCalendar] = useState(false);

  const { updateSchedule, deleteSchedule } = useScheduleService();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isEditing && schedule) loadData();
  }, [isEditing]);

  if (!schedule) return null;

  const data = isEditing ? editedSchedule : schedule;
  if (!data) return null;

  const isMaint    = isMaintenance(data.serviceType);
  const statusBadge = getStatusConfig(data.status);
  const StatusIcon  = statusBadge.icon;

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const updateField = <K extends keyof Schedule>(field: K, value: Schedule[K]) =>
    setEditedSchedule((prev) => prev && { ...prev, [field]: value });

  const resetEditState = () => {
    setEditedSchedule(null);
    setIsEditing(false);
    setOpenCalendar(false);
    setOpenOrderDateCalendar(false);
    setOpenClient(false);
    setOpenProduct(false);
  };

  const loadData = async () => {
    try {
      const [c, p] = await Promise.all([clientApi.getAll(), productApi.getAll()]);
      setClients(c.data ?? c);
      setProducts(p.data ?? p);
    } catch {
      toast.error("Erro ao carregar dados");
    }
  };

  const selectedClient  = clients.find((c) => c._id === getClientId(data.client));
  const selectedProduct = products.find((p) => p._id === getProductId(data.product));

  const clientName = !data.client
    ? "Cliente Desconhecido"
    : typeof data.client === "string"
    ? data.client
    : data.client.name;

  const clientImage =
    typeof data.client !== "string" ? data.client?.image?.[0] : undefined;

  const formattedDate = data.scheduledDate
    ? new Date(data.scheduledDate).toLocaleDateString("pt-BR")
    : "Não informado";

  const formattedCreatedAt = schedule.createdAt
    ? new Date(schedule.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "Não informado";

    const formattedOrderDate = data.orderDate
  ? new Date(data.orderDate).toLocaleDateString("pt-BR")
  : "Não informado";

  const handleEdit   = () => { setEditedSchedule({ ...schedule }); setIsEditing(true); };
  const handleCancel = resetEditState;

  const handleSave = async () => {
    if (!editedSchedule) return;
    try {
      const payload: SchedulePayload = {
        plate:           editedSchedule.plate,
        vin:             editedSchedule.vin,
        model:           editedSchedule.model,
        provider:        editedSchedule.provider,
        vehicleGroup:    editedSchedule.vehicleGroup,
        client:          getClientId(editedSchedule.client)!,
        serviceType:     editedSchedule.serviceType,
        product:         getProductId(editedSchedule.product),
        scheduledDate:   editedSchedule.scheduledDate,
        notes:           editedSchedule.notes,
        status:          editedSchedule.status,
        createdBy:       editedSchedule.createdBy,
        serviceAddress:  editedSchedule.serviceAddress,
        serviceLocation: editedSchedule.serviceLocation,
        responsible:     editedSchedule.responsible,
        situation:       editedSchedule.situation,
        ...(isMaintenance(editedSchedule.serviceType) && {
          responsiblePhone: editedSchedule.responsiblePhone,
          condutor:         editedSchedule.condutor,
          orderDate: editedSchedule.orderDate,
        }),
      };
      await updateSchedule.mutateAsync({ id: editedSchedule._id, payload });
      toast.success("Agendamento atualizado!");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedule", editedSchedule._id] });
      resetEditState();
      onClose();
    } catch {
      toast.error("Erro ao atualizar agendamento");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSchedule.mutateAsync(schedule._id);
      toast.success("Agendamento excluído!");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setOpenDeleteModal(false);
      onClose();
    } catch {
      toast.error("Erro ao excluir agendamento");
    }
  };


  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="min-h-[55vh] max-h-[78vh] h-auto flex flex-col gap-0 p-0"
      >

        {/* ── Header ── */}
     <SheetHeader className="px-6 py-4 border-b">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      {schedule.client && typeof schedule.client !== "string" && schedule.client.image?.[0] && (
        <img
          src={schedule.client.image[0]}
          alt={schedule.client.name}
          className="w-14 h-14 rounded-lg object-contain bg-white"
        />
      )}
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold">{data.vin}</span>
        <span className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
          statusBadge.className
        )}>
          <StatusIcon className="h-3.5 w-3.5" />
          {statusBadge.label}
        </span>
      </div>
    </div>

    <div className="flex gap-2">
      {isEditing ? (
        <>
          <Button variant="outline" size="sm" onClick={handleCancel} className="gap-2">
            <X className="h-4 w-4" /> Cancelar
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
            <Pencil className="h-4 w-4" /> Editar
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

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-0 h-full divide-x">

            {/* ── Coluna principal ── */}
            <div className="flex-1 px-6 py-5 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">

                {/* Seção: Veículo */}
                <div className="space-y-4">
                  <SectionTitle>Veículo</SectionTitle>
                  <Field editing={isEditing} icon={KeySquare} label="Placa"
                    value={data.plate || ""} onChange={(v) => updateField("plate", v)}
                    placeholder="AAA-0000"
                  />
                  <Field editing={isEditing} icon={Hash} label="Chassi"
                    value={data.vin} onChange={(v) => updateField("vin", v)}
                  />
                  <Field editing={isEditing} icon={Car} label="Modelo"
                    value={data.model} onChange={(v) => updateField("model", v)}
                  />
                </div>

                {/* Seção: Serviço */}
                <div className="space-y-4">
                  <SectionTitle>Serviço</SectionTitle>

                  {/* Cliente */}
                  {isEditing ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <ContactRound className="h-3.5 w-3.5" /> Cliente
                      </label>
                      <Popover open={openClient} onOpenChange={setOpenClient}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between h-auto py-1.5">
                            {selectedClient ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={selectedClient.image?.[0]} />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(selectedClient.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm truncate">{selectedClient.name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                Selecione o cliente
                              </span>
                            )}
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[240px]" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar cliente..." />
                            <CommandList>
                              <CommandEmpty>Nenhum cliente encontrado</CommandEmpty>
                              <CommandGroup>
                                {clients.map((c) => (
                                  <CommandItem
                                    key={c._id}
                                    value={c.name}
                                    onSelect={() => {
                                      updateField("client", c._id as any);
                                      setOpenClient(false);
                                    }}
                                  >
                                    <Avatar className="h-6 w-6 mr-2">
                                      <AvatarImage src={c.image?.[0]} />
                                      <AvatarFallback className="text-xs">
                                        {getInitials(c.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="flex-1 truncate">{c.name}</span>
                                    <Check className={cn(
                                      "h-4 w-4 shrink-0",
                                      selectedClient?._id === c._id ? "opacity-100" : "opacity-0"
                                    )} />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ) : (
                    <InfoField icon={ContactRound} label="Cliente" value={clientName} />
                  )}

                  {/* Tipo de serviço */}
                  {isEditing ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Wrench className="h-3.5 w-3.5" /> Tipo de Serviço
                      </label>
                      <Select
                        value={data.serviceType}
                        onValueChange={(v) => updateField("serviceType", v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SERVICE_TYPES).map(([val, label]) => (
                            <SelectItem key={val} value={val}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <InfoField
                      icon={Wrench} label="Tipo de Serviço"
                      value={SERVICE_TYPES[data.serviceType] ?? data.serviceType}
                    />
                  )}

                  {/* Equipamento */}
                  {isEditing ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <SatelliteDish className="h-3.5 w-3.5" /> Equipamento
                      </label>
                      <Popover open={openProduct} onOpenChange={setOpenProduct}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between h-auto py-1.5">
                            <span className="text-sm truncate">
                              {selectedProduct?.name || (
                                <span className="text-muted-foreground">Selecione o produto</span>
                              )}
                            </span>
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[240px]" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar produto..." />
                            <CommandList>
                              <CommandEmpty>Nenhum produto encontrado</CommandEmpty>
                              <CommandGroup>
                                {products.map((p) => (
                                  <CommandItem
                                    key={p._id}
                                    value={p.name}
                                    onSelect={() => {
                                      updateField("product", p._id as any);
                                      setOpenProduct(false);
                                    }}
                                  >
                                    <span className="flex-1">{p.name}</span>
                                    <Check className={cn(
                                      "h-4 w-4 shrink-0",
                                      selectedProduct?._id === p._id ? "opacity-100" : "opacity-0"
                                    )} />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ) : (
                    <InfoField
                      icon={SatelliteDish} label="Equipamento"
                      value={data.product?.name || "Não informado"}
                    />
                  )}
                </div>

                {/* Seção: Atribuição */}
                <div className="space-y-4">
                  <SectionTitle>Atribuição</SectionTitle>

                  {/* Responsável — sempre visível, com ResponsiblePicker em edição */}
                  {isEditing ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> Responsável
                      </label>
                      <ResponsiblePicker
                        value={data.responsible || ""}
                        onChange={(name) => updateField("responsible", name)}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> Responsável
                      </span>
                      {data.responsible ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                              {getInitials(data.responsible)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{data.responsible}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Não atribuído</span>
                      )}
                    </div>
                  )}

                  <Field editing={isEditing} icon={UserCog} label="Prestador"
                    value={data.provider || ""} onChange={(v) => updateField("provider", v)}
                    placeholder="Nome do prestador"
                  />
                  <Field editing={isEditing} icon={Folder} label="Grupo de Veículos"
                    value={data.vehicleGroup || ""} onChange={(v) => updateField("vehicleGroup", v)}
                    placeholder="Nome do grupo"
                  />
                </div>

                {/* Seção: Localização */}
                <div className="space-y-4">
                  <SectionTitle>Localização</SectionTitle>
                  <Field editing={isEditing} icon={MapPin} label="Endereço do serviço"
                    value={data.serviceAddress || ""} onChange={(v) => updateField("serviceAddress", v)}
                    placeholder="Endereço completo"
                  />
                  <Field editing={isEditing} icon={Navigation} label="Local do serviço"
                    value={data.serviceLocation || ""} onChange={(v) => updateField("serviceLocation", v)}
                    placeholder="Local / referência"
                  />
                  <Field editing={isEditing} icon={ClipboardList} label="Situação"
                    value={data.situation || ""} onChange={(v) => updateField("situation", v)}
                    placeholder="Situação atual"
                  />
                </div>

                {/* Seção: Manutenção — sempre na grid, condicional */}
                {isMaint && (
                  <div className="space-y-4">
                    <SectionTitle>Manutenção</SectionTitle>
                    <Field editing={isEditing} icon={Phone} label="Telefone do responsável"
                      value={data.responsiblePhone || ""}
                      onChange={(v) => updateField("responsiblePhone", v)}
                      placeholder="(00) 00000-0000"
                    />
                    <Field editing={isEditing} icon={UserCog} label="Condutor"
                      value={data.condutor || ""} onChange={(v) => updateField("condutor", v)}
                      placeholder="Nome do condutor"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── Painel lateral direito ── */}
            <div className="w-[300px] shrink-0 flex flex-col gap-5 px-5 py-5 bg-muted/30">

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <SectionTitle>Status</SectionTitle>
                {isEditing ? (
                  <Select
                    value={data.status}
                    onValueChange={(v) => updateField("status", v)}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border w-fit",
                    statusBadge.className
                  )}>
                    <StatusIcon className="h-3 w-3" />
                    {statusBadge.label}
                  </span>
                )}
              </div>

              <Separator />
                <div className="flex flex-col gap-1.5">
  <SectionTitle>Data do Pedido</SectionTitle>
  {isEditing ? (
    <Popover open={openOrderDateCalendar} onOpenChange={setOpenOrderDateCalendar}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between bg-background">
          <span className="text-sm">
            {data.orderDate
              ? new Date(data.orderDate).toLocaleDateString("pt-BR")
              : "Selecionar data"}
          </span>
          <CalendarSearch className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Calendar
          mode="single"
          selected={data.orderDate ? new Date(data.orderDate) : undefined}
          onSelect={(date) => {
            if (date) updateField("orderDate", date.toISOString());
            setOpenOrderDateCalendar(false);
          }}
        />
      </PopoverContent>
    </Popover>
  ) : (
    <div className="flex items-center gap-2 text-sm">
      <CalendarSearch className="h-4 w-4 text-muted-foreground" />
      <span>{formattedOrderDate}</span>
    </div>
  )}
</div>

              {/* Data agendada */}
              <div className="flex flex-col gap-1.5">
                <SectionTitle>Data agendada</SectionTitle>
                {isEditing ? (
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between bg-background">
                        <span className="text-sm">
                          {data.scheduledDate
                            ? new Date(data.scheduledDate).toLocaleDateString("pt-BR")
                            : "Selecionar data"}
                        </span>
                        <CalendarSearch className="h-3.5 w-3.5 opacity-60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={data.scheduledDate ? new Date(data.scheduledDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            updateField("scheduledDate", date.toISOString());
                            updateField("status", "agendado");
                          }
                          setOpenCalendar(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    <span>{formattedDate}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Observações */}
              <div className="flex flex-col gap-1.5 flex-1 min-h-0">
                <SectionTitle>Observações</SectionTitle>
                <Textarea
                  value={data.notes || ""}
                  onChange={(e) => isEditing && updateField("notes", e.target.value)}
                  readOnly={!isEditing}
                  placeholder={isEditing ? "Adicione observações..." : "Sem observações"}
                  className={cn(
                    "flex-1 resize-none min-h-[120px] text-sm",
                    !isEditing && "bg-transparent border-dashed cursor-default"
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <SheetFooter className="border-t px-6 py-3">
          <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3 w-3" />
              Criado por <strong className="text-foreground ml-1">{schedule.createdBy || "Sistema"}</strong>
            </span>
            <span>Pedido: #{schedule.orderNumber}</span>
            <span>Criado em: {formattedCreatedAt}</span>
          </div>
        </SheetFooter>
      </SheetContent>

      <ConfirmModal
        open={openDeleteModal}
        onOpenChange={(v) => !v && setOpenDeleteModal(false)}
        title="Excluir agendamento"
        description={`Deseja excluir o agendamento do cliente "${clientName}"?`}
        confirmText="Excluir"
        onConfirm={handleDelete}
      />
    </Sheet>
  );
};

export default ScheduleDrawer;