import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Schedule, useScheduleService, type SchedulePayload } from "@/services/ScheduleService";
import {
  Pencil, Trash2, Car, Hash, Wrench, CalendarCheck, ContactRound,
  KeySquare, SatelliteDish, X, Check, ChevronsUpDown, CalendarSearch,
  UserCog, Folder, MapPin, Phone, User, ClipboardList, Navigation,
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

// ─── Types ────────────────────────────────────────────────────────────────────

type ScheduleDrawerProps = { open: boolean; onClose: () => void; schedule: Schedule | null };
type Client = { _id: string; name: string; image?: string[] };
type Product = { _id: string; name: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isMaintenance = (t: string) => t === "maintenance";

const SERVICE_TYPES: Record<string, string> = {
  installation: "Instalação",
  maintenance: "Manutenção",
  removal: "Remoção",
};

const getClientId = (c: Schedule["client"]) => (typeof c === "string" ? c : c._id);
const getProductId = (p: Schedule["product"]) => (typeof p === "string" ? p : p?._id);

// ─── Field wrapper: alterna entre InfoField e EditableField ───────────────────

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
    <EditableField icon={icon} label={label} value={value} onChange={onChange!} placeholder={placeholder} />
  ) : (
    <InfoField icon={icon} label={label} value={value || "Não informado"} />
  );

// ─── Component ────────────────────────────────────────────────────────────────

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
  }, [isEditing]);

  if (!schedule) return null;

  const data = isEditing ? editedSchedule : schedule;
  if (!data) return null;

  const isMaint = isMaintenance(data.serviceType);
  const statusBadge = getStatusConfig(data.status);
  const StatusIcon = statusBadge.icon;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const updateField = <K extends keyof Schedule>(field: K, value: Schedule[K]) =>
    setEditedSchedule((prev) => prev && { ...prev, [field]: value });

  const resetEditState = () => {
    setEditedSchedule(null);
    setIsEditing(false);
    setOpenCalendar(false);
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

  const selectedClient = clients.find((c) => c._id === getClientId(data.client));
  const selectedProduct = products.find((p) => p._id === getProductId(data.product));

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleEdit = () => { setEditedSchedule({ ...schedule }); setIsEditing(true); };
  const handleCancel = resetEditState;

  const handleSave = async () => {
    if (!editedSchedule) return;
    try {
      const payload: SchedulePayload = {
        plate: editedSchedule.plate,
        vin: editedSchedule.vin,
        model: editedSchedule.model,
        provider: editedSchedule.provider,
        vehicleGroup: editedSchedule.vehicleGroup,
        client: getClientId(editedSchedule.client)!,
        serviceType: editedSchedule.serviceType,
        product: getProductId(editedSchedule.product),
        scheduledDate: editedSchedule.scheduledDate,
        notes: editedSchedule.notes,
        status: editedSchedule.status,
        createdBy: editedSchedule.createdBy,
        serviceAddress: editedSchedule.serviceAddress,
        serviceLocation: editedSchedule.serviceLocation,
        responsible: editedSchedule.responsible,
        situation: editedSchedule.situation,
        ...(isMaintenance(editedSchedule.serviceType) && {
          responsiblePhone: editedSchedule.responsiblePhone,
          condutor: editedSchedule.condutor,
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

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="min-h-[50vh] max-h-[72vh] h-auto flex flex-col">

        {/* Header */}
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {typeof schedule.client !== "string" && schedule.client.image?.[0] && (
                <img src={schedule.client.image[0]} alt={schedule.client.name}
                  className="w-14 h-14 rounded-lg object-contain bg-white" />
              )}
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">{data.vin}</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.className}`}>
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
                  <Button size="sm" onClick={handleSave} className="gap-2" disabled={updateSchedule.isPending}>
                    <Check className="h-4 w-4" />
                    {updateSchedule.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
                    <Pencil className="h-4 w-4" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setOpenDeleteModal(true)}
                    className="gap-2 text-red-500 hover:text-red-600" disabled={deleteSchedule.isPending}>
                    <Trash2 className="h-4 w-4" />
                    {deleteSchedule.isPending ? "Excluindo..." : "Excluir"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 flex justify-between py-6 overflow-y-auto">
          <div className="flex gap-12 flex-wrap">

            {/* Coluna 1 — Veículo */}
            <div className="space-y-4">
              <Field editing={isEditing} icon={KeySquare} label="Placa"  value={data.plate || ""} onChange={(v) => updateField("plate", v)} placeholder="AAA-0000" />
              <Field editing={isEditing} icon={Hash}     label="Chassi" value={data.vin}          onChange={(v) => updateField("vin", v)} />
              <Field editing={isEditing} icon={Car}      label="Modelo" value={data.model}        onChange={(v) => updateField("model", v)} />
            </div>

            {/* Coluna 2 — Cliente / Serviço / Equipamento */}
            <div className="space-y-4">

              {/* Cliente */}
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <ContactRound className="h-4 w-4" /> Cliente
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
                        ) : "Selecione o cliente"}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[200px]">
                      <Command>
                        <CommandInput placeholder="Buscar cliente..." />
                        <CommandList>
                          <CommandEmpty>Nenhum cliente encontrado</CommandEmpty>
                          <CommandGroup>
                            {clients.map((c) => (
                              <CommandItem key={c._id} onSelect={() => { updateField("client", c._id as any); setOpenClient(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", selectedClient?._id === c._id ? "opacity-100" : "opacity-0")} />
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={c.image?.[0]} />
                                  <AvatarFallback>{c.name[0]}</AvatarFallback>
                                </Avatar>
                                {c.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <InfoField icon={ContactRound} label="Cliente"
                  value={typeof data.client === "string" ? data.client : data.client.name} />
              )}

              {/* Tipo de Serviço */}
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Wrench className="h-4 w-4" /> Tipo de Serviço
                  </label>
                  <Select value={data.serviceType} onValueChange={(v) => updateField("serviceType", v)}>
                    <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SERVICE_TYPES).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <InfoField icon={Wrench} label="Tipo de Serviço" value={SERVICE_TYPES[data.serviceType] ?? data.serviceType} />
              )}

              {/* Equipamento */}
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <SatelliteDish className="h-4 w-4" /> Equipamento
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
                            {products.map((p) => (
                              <CommandItem key={p._id} onSelect={() => { updateField("product", p._id as any); setOpenProduct(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", selectedProduct?._id === p._id ? "opacity-100" : "opacity-0")} />
                                {p.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <InfoField icon={SatelliteDish} label="Equipamento" value={data.product?.name || "Não informado"} />
              )}
            </div>

            {/* Coluna 3 — Prestador / Grupo / Responsável */}
            <div className="space-y-4">
              <Field editing={isEditing} icon={UserCog} label="Prestador"         value={data.provider || ""}     onChange={(v) => updateField("provider", v)}     placeholder="Nome do prestador" />
              <Field editing={isEditing} icon={Folder}  label="Grupo de Veículos" value={data.vehicleGroup || ""} onChange={(v) => updateField("vehicleGroup", v)} placeholder="Nome do grupo" />
              <Field editing={isEditing} icon={User}    label="Responsável"       value={data.responsible || ""}  onChange={(v) => updateField("responsible", v)}  placeholder="Nome do responsável" />
            </div>

            {/* Coluna 4 — Endereço / Local / Situação */}
            <div className="space-y-4">
              <Field editing={isEditing} icon={MapPin}      label="Endereço do serviço" value={data.serviceAddress || ""}  onChange={(v) => updateField("serviceAddress", v)}  placeholder="Endereço completo" />
              <Field editing={isEditing} icon={Navigation}  label="Local do serviço"    value={data.serviceLocation || ""} onChange={(v) => updateField("serviceLocation", v)} placeholder="Local / referência" />
              <Field editing={isEditing} icon={ClipboardList} label="Situação"          value={data.situation || ""}       onChange={(v) => updateField("situation", v)}        placeholder="Situação atual" />
            </div>

            {/* Coluna 5 — Somente Manutenção */}
            {isMaint && (
              <div className="space-y-4">
                <Field editing={isEditing} icon={Phone}  label="Telefone do responsável" value={data.responsiblePhone || ""} onChange={(v) => updateField("responsiblePhone", v)} placeholder="(00) 00000-0000" />
                <Field editing={isEditing} icon={UserCog} label="Condutor"               value={data.condutor || ""}         onChange={(v) => updateField("condutor", v)}         placeholder="Nome do condutor" />
              </div>
            )}
          </div>

          {/* Painel direito — Status / Data / Observações */}
          <div className="w-[380px] flex flex-col gap-4 shrink-0">

            {/* Status (só em edição) */}
            {isEditing && (
              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground">Status</label>
                <Select value={data.status} onValueChange={(v) => updateField("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["criado","agendado","concluido","cancelado","atrasado"].map((s) => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Data agendada */}
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" /> Data agendada
                </label>
                <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-between">
                      {data.scheduledDate ? new Date(data.scheduledDate).toLocaleDateString("pt-BR") : "Selecionar data"}
                      <CalendarSearch className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar mode="single"
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
              </div>
            ) : (
              <InfoField icon={CalendarCheck} label="Data agendada"
                value={data.scheduledDate ? new Date(data.scheduledDate).toLocaleDateString("pt-BR") : "Não informado"} />
            )}

            {/* Observações */}
            <div className="flex-1 flex flex-col min-h-0">
              <span className="text-sm text-muted-foreground mb-2 block">Observações</span>
              <Textarea
                value={data.notes || ""}
                onChange={(e) => isEditing && updateField("notes", e.target.value)}
                readOnly={!isEditing}
                placeholder={isEditing ? "Adicione observações..." : "Sem observações"}
                className="h-full resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="border-t pt-2">
          <div className="w-full flex items-center justify-between text-sm text-muted-foreground">
            <span>Criado por {schedule.createdBy || "Sistema"}</span>
            <span>
              Criado em {schedule.createdAt
                ? new Date(schedule.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                : "Não informado"}
            </span>
            <span>Número do pedido: #{schedule.orderNumber}</span>
          </div>
        </SheetFooter>
      </SheetContent>

      <ConfirmModal
        open={openDeleteModal}
        onOpenChange={(v) => !v && setOpenDeleteModal(false)}
        title="Excluir agendamento"
        description={`Tem certeza que deseja excluir o agendamento do cliente "${typeof schedule.client === "string" ? schedule.client : schedule.client.name}"?`}
        confirmText="Excluir"
        onConfirm={handleDelete}
      />
    </Sheet>
  );
};

export default ScheduleDrawer;