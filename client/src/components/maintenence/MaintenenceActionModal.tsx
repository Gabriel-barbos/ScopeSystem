import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DOMPurify from "dompurify";
import type { MaintenanceRequest, Vehicle } from "@/services/MaintenenceRequestService";
import { useMaintenanceRequestService } from "@/services/MaintenenceRequestService";
import { clientApi } from "@/services/ClientService";
import { ClientPicker } from "../global/ClientPicker";
import { ResponsiblePicker } from "../global/ResponsiblePicker";
import { toast } from "sonner";
import { useAuth } from "@/context/Authcontext";

interface VehicleForm {
  id: string;
  placa: string;
  chassi: string;
  model?: string;
  serviceAddress: string;
  condutor: string;
  responsiblePhone: string;
  responsible: string;
}

interface MaintenanceActionModalProps {
  request: MaintenanceRequest | null;
  open: boolean;
  onClose: () => void;
}

const statusOptions = [
  { value: "pending",             label: "Criado" },
  { value: "waiting_address",     label: "Aguardando Endereço" },
  { value: "waiting_responsible", label: "Aguardando Responsável" },
  { value: "cancelled",           label: "Cancelado" },
];

const emptyVehicle = (responsible = ""): VehicleForm => ({
  id: crypto.randomUUID(),
  placa: "",
  chassi: "",
  model: "",
  serviceAddress: "",
  condutor: "",
  responsiblePhone: "",
  responsible,
});

export default function MaintenanceActionModal({
  request,
  open,
  onClose,
}: MaintenanceActionModalProps) {
  const { user } = useAuth();
  const { updateMaintenanceRequest, createSchedules } = useMaintenanceRequestService();

  const [subject, setSubject]         = useState("");
  const [status, setStatus]           = useState("pending");
  const [showDetails, setShowDetails] = useState(false);
  const [clientId, setClientId]       = useState<string | null>(null);
  const [clientName, setClientName]   = useState<string | null>(null);
  const [errors, setErrors]           = useState<string[]>([]);
  const [submitted, setSubmitted]     = useState(false);
  const [vehicles, setVehicles]       = useState<VehicleForm[]>([emptyVehicle(user?.name ?? "")]);


  useEffect(() => {
    if (!request || !open) return;

    setSubject(request.subject || "");
    setStatus(request.schedulingStatus || "pending");
    setSubmitted(false);
    setErrors([]);
    setShowDetails(false);

    const savedClientId =
      typeof request.client === "string"
        ? request.client
        : (request.client as any)?._id ?? null;

    setClientId(savedClientId);

    if (savedClientId) {
      if (typeof request.client === "object" && (request.client as any)?.name) {
        setClientName((request.client as any).name);
      } else {
        clientApi
          .getById(savedClientId)
          .then((c) => setClientName(c.name))
          .catch(() => setClientName(null));
      }
    } else {
      setClientName(null);
    }

    setVehicles(
      request.vehicles?.length
        ? request.vehicles.map((v) => ({
            id:               crypto.randomUUID(),
            placa:            v.plate            || "",
            chassi:           v.vin              || "",
            model:            v.model            || "",
            serviceAddress:   v.serviceAddress   || "",
            condutor:         v.condutor         || "",
            responsiblePhone: v.responsiblePhone || "",
            responsible:      v.responsible      || user?.name || "",
          }))
        : [emptyVehicle(user?.name ?? "")]
    );
  }, [request, open]);


  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsInitialized(false);
      return;
    }
    const timer = setTimeout(() => setIsInitialized(true), 100);
    return () => clearTimeout(timer);
  }, [open, request]);

  useEffect(() => {
    if (!isInitialized) return;

    if (!clientId) {
      setClientName(null);
      return;
    }

    clientApi
      .getById(clientId)
      .then((c) => setClientName(c.name))
      .catch(() => setClientName(null));
  }, [clientId, isInitialized]);

  if (!request) return null;

  const sanitizedContent = DOMPurify.sanitize(request.description || "", {
    ALLOWED_TAGS: [
      "div", "p", "span", "br", "strong", "em", "b", "i", "u",
      "blockquote", "table", "thead", "tbody", "tr", "td", "th",
      "ul", "ol", "li", "a", "h1", "h2", "h3", "h4", "h5", "h6",
    ],
    ALLOWED_ATTR: ["style", "class", "href", "target", "rel", "title", "spellcheck"],
  });

  const fieldError = (value: string | undefined) =>
    submitted && !value ? "border-destructive focus-visible:ring-destructive" : "";

  const handleAddVehicle = () =>
    setVehicles((prev) => [...prev, emptyVehicle(vehicles[0]?.responsible ?? user?.name ?? "")]);

  const handleRemoveVehicle = (id: string) => {
    if (vehicles.length > 1)
      setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVehicleChange = (id: string, field: keyof VehicleForm, value: string) =>
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)));

  const handleResponsibleChange = (name: string) =>
    setVehicles((prev) => prev.map((v) => ({ ...v, responsible: name })));

  const validateForScheduleCreation = (): string[] => {
    const errs: string[] = [];
    if (!clientId) errs.push("Cliente é obrigatório para criar agendamentos");
    vehicles.forEach((v, i) => {
      const n = i + 1;
      if (!v.chassi)           errs.push(`Veículo #${n}: Chassi é obrigatório`);
      if (!v.model)            errs.push(`Veículo #${n}: Modelo é obrigatório`);
      if (!v.serviceAddress)   errs.push(`Veículo #${n}: Endereço é obrigatório`);
      if (!v.condutor)         errs.push(`Veículo #${n}: Condutor é obrigatório`);
      if (!v.responsiblePhone) errs.push(`Veículo #${n}: Telefone do responsável é obrigatório`);
    });
    return errs;
  };

  const buildVehiclesPayload = (): Vehicle[] =>
    vehicles.map((v) => ({
      plate:            v.placa            || undefined,
      vin:              v.chassi           || undefined,
      model:            v.model            || undefined,
      serviceAddress:   v.serviceAddress   || undefined,
      condutor:         v.condutor         || undefined,
      responsiblePhone: v.responsiblePhone || undefined,
      responsible:      v.responsible      || undefined,
    }));

  const handleUpdateRequest = async () => {
    try {
      await updateMaintenanceRequest.mutateAsync({
        id: request._id,
        payload: {
          subject,
          schedulingStatus: status,
          vehicles: buildVehiclesPayload(),
          client: clientId || undefined,
        },
      });
      toast.success("Solicitação atualizada com sucesso");
      onClose();
    } catch {
      toast.error("Erro ao atualizar solicitação");
    }
  };

  const handleCreateSchedules = async () => {
    setSubmitted(true);
    const validationErrors = validateForScheduleCreation();
    if (validationErrors.length > 0) { setErrors(validationErrors); return; }
    setErrors([]);

    try {
      await updateMaintenanceRequest.mutateAsync({
        id: request._id,
        payload: {
          subject,
          schedulingStatus: status,
          vehicles: buildVehiclesPayload(),
          client: clientId || undefined,
        },
      });
      const result = await createSchedules.mutateAsync({ id: request._id, createdBy: user?.name });
      toast.success(`${result.schedulesCreated} agendamento(s) criado(s) com sucesso!`);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao criar agendamentos");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold pr-8">Criar Agendamento</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-6">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((err, i) => <li key={i} className="text-sm">{err}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Assunto da manutenção"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

         <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Cliente</span>
            <p className="text-sm font-medium">{request.category}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">E-mail do Contato</span>
            <p className="text-sm font-medium">{request.contactEmail}</p>
          </div>
        </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Veículos</h3>
              <div className="flex items-center gap-2">

                <ClientPicker value={clientId} onChange={setClientId} />

                {clientName && (
                  <span className="text-xs px-2 py-1 rounded-md bg-primary/10 border border-primary/20 font-medium text-primary">
                    {clientName}
                  </span>
                )}

                <ResponsiblePicker
                  value={vehicles[0]?.responsible ?? ""}
                  onChange={handleResponsibleChange}
                  placeholder="Atribuir responsável"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddVehicle} className="gap-2">
                  <Plus className="h-4 w-4" /> Adicionar outro
                </Button>
              </div>
            </div>

            {vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="p-4 rounded-lg border border-border bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Veículo #{index + 1}</span>
                  {vehicles.length > 1 && (
                    <Button type="button" variant="ghost" size="sm"
                      onClick={() => handleRemoveVehicle(vehicle.id)}
                      className="h-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Placa <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                    <Input
                      value={vehicle.placa}
                      onChange={(e) => handleVehicleChange(vehicle.id, "placa", e.target.value.toUpperCase())}
                      placeholder="ABC1D23"
                      className="uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chassi <span className="text-destructive">*</span></Label>
                    <Input
                      value={vehicle.chassi}
                      onChange={(e) => handleVehicleChange(vehicle.id, "chassi", e.target.value.toUpperCase())}
                      placeholder="9BWZZZ377VT004251"
                      className={`uppercase ${fieldError(vehicle.chassi)}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Modelo <span className="text-destructive">*</span></Label>
                    <Input
                      value={vehicle.model}
                      onChange={(e) => handleVehicleChange(vehicle.id, "model", e.target.value.toUpperCase())}
                      placeholder="VW T-CROSS"
                      className={fieldError(vehicle.model)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Endereço <span className="text-destructive">*</span></Label>
                    <Input
                      value={vehicle.serviceAddress}
                      onChange={(e) => handleVehicleChange(vehicle.id, "serviceAddress", e.target.value)}
                      placeholder="Rua, número, cidade"
                      className={fieldError(vehicle.serviceAddress)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Condutor <span className="text-destructive">*</span></Label>
                    <Input
                      value={vehicle.condutor}
                      onChange={(e) => handleVehicleChange(vehicle.id, "condutor", e.target.value)}
                      placeholder="Nome do condutor"
                      className={fieldError(vehicle.condutor)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tel. Responsável <span className="text-destructive">*</span></Label>
                    <Input
                      value={vehicle.responsiblePhone}
                      onChange={(e) => handleVehicleChange(vehicle.id, "responsiblePhone", e.target.value)}
                      placeholder="(11) 98765-4321"
                      className={fieldError(vehicle.responsiblePhone)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium">Ver detalhes do e-mail</span>
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showDetails && (
              <div className="p-4 border-t border-border">
                <div className="email-content" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="secondary" onClick={handleUpdateRequest} disabled={updateMaintenanceRequest.isPending}>
            {updateMaintenanceRequest.isPending ? "Salvando..." : "Editar Solicitação"}
          </Button>
          <Button onClick={handleCreateSchedules} disabled={createSchedules.isPending}>
            {createSchedules.isPending ? "Criando..." : "Criar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}