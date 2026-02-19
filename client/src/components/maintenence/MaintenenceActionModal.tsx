import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DOMPurify from "dompurify";
import type { MaintenanceRequest, Vehicle } from "@/services/MaintenenceRequestService";
import { useMaintenanceRequestService } from "@/services/MaintenenceRequestService";
import { ClientPicker } from "../global/ClientPicker";
import { toast } from "sonner";
import { useAuth } from "@/context/Authcontext";

interface VehicleForm {
  id: string;
  placa: string;
  chassi: string;
  endereco: string;
  responsavel: string;
  telResponsavel: string;
}

interface MaintenanceActionModalProps {
  request: MaintenanceRequest | null;
  open: boolean;
  onClose: () => void;
}

const statusOptions = [
  { value: "pending", label: "Criado" },
  { value: "waiting_address", label: "Aguardando Endereço" },
  { value: "waiting_responsible", label: "Aguardando Responsável" },
  { value: "cancelled", label: "Cancelado" },
];

export default function MaintenanceActionModal({
  request,
  open,
  onClose,
}: MaintenanceActionModalProps) {
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("pending");
  const [showDetails, setShowDetails] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<VehicleForm[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { user } = useAuth();
  const { updateMaintenanceRequest, createSchedules } = useMaintenanceRequestService();

  // Inicializa o form quando o request muda
  useEffect(() => {
    if (request) {
      setSubject(request.subject || "");
      setStatus(request.schedulingStatus || "pending");
      setClientId(request.client || null);

      // Carrega veículos existentes ou cria um vazio
      if (request.vehicles && request.vehicles.length > 0) {
        setVehicles(
          request.vehicles.map((v) => ({
            id: crypto.randomUUID(),
            placa: v.plate || "",
            chassi: v.vin || "",
            endereco: v.serviceAddress || "",
            responsavel: v.responsible || "",
            telResponsavel: v.responsiblePhone || "",
          }))
        );
      } else {
        setVehicles([
          {
            id: crypto.randomUUID(),
            placa: "",
            chassi: "",
            endereco: "",
            responsavel: "",
            telResponsavel: "",
          },
        ]);
      }
    }
  }, [request]);

  if (!request) return null;

  const sanitizedContent = DOMPurify.sanitize(request.description || "", {
    ALLOWED_TAGS: [
      "div",
      "p",
      "span",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "blockquote",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
      "ul",
      "ol",
      "li",
      "a",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ],
    ALLOWED_ATTR: ["style", "class", "href", "target", "rel", "title", "spellcheck"],
  });

  const handleAddVehicle = () => {
    setVehicles([
      ...vehicles,
      {
        id: crypto.randomUUID(),
        placa: "",
        chassi: "",
        endereco: "",
        responsavel: "",
        telResponsavel: "",
      },
    ]);
  };

  const handleRemoveVehicle = (id: string) => {
    if (vehicles.length > 1) {
      setVehicles(vehicles.filter((v) => v.id !== id));
    }
  };

  const handleVehicleChange = (id: string, field: keyof VehicleForm, value: string) => {
    setVehicles(vehicles.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  // Validação
  const validateForScheduleCreation = (): string[] => {
    const validationErrors: string[] = [];

    if (!clientId) {
      validationErrors.push("Cliente é obrigatório para criar agendamentos");
    }

    vehicles.forEach((vehicle, index) => {
      if (!vehicle.placa && !vehicle.chassi) {
        validationErrors.push(
          `Veículo #${index + 1}: Placa ou Chassi é obrigatório`
        );
      }
      if (!vehicle.endereco) {
        validationErrors.push(`Veículo #${index + 1}: Endereço é obrigatório`);
      }
      if (!vehicle.responsavel) {
        validationErrors.push(`Veículo #${index + 1}: Responsável é obrigatório`);
      }
      if (!vehicle.telResponsavel) {
        validationErrors.push(
          `Veículo #${index + 1}: Telefone do responsável é obrigatório`
        );
      }
    });

    return validationErrors;
  };

  // Determina automaticamente o status baseado nos dados preenchidos
  const determineStatus = (): string => {
    const hasAddress = vehicles.every((v) => v.endereco);
    const hasResponsible = vehicles.every((v) => v.responsavel && v.telResponsavel);

    if (!hasAddress && !hasResponsible) {
      return "pending";
    } else if (hasAddress && !hasResponsible) {
      return "waiting_responsible";
    } else if (!hasAddress && hasResponsible) {
      return "waiting_address";
    } else {
      return status; 
    }
  };

  // Editar solicitação (atualiza request)
  const handleUpdateRequest = async () => {
    try {
      const vehiclesData: Vehicle[] = vehicles.map((v) => ({
        plate: v.placa || undefined,
        vin: v.chassi || undefined,
        serviceAddress: v.endereco || undefined,
        responsible: v.responsavel || undefined,
        responsiblePhone: v.telResponsavel || undefined,
      }));

      const newStatus = determineStatus();

      await updateMaintenanceRequest.mutateAsync({
        id: request._id,
        payload: {
          subject,
          schedulingStatus: newStatus,
          vehicles: vehiclesData,
          client: clientId || undefined,
        },
      });

      toast.success("Solicitação atualizada com sucesso");
      onClose();
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Erro ao atualizar solicitação");
    }
  };

  // Criar agendamentos
  const handleCreateSchedules = async () => {
      console.log("user completo:", JSON.stringify(user));

    const validationErrors = validateForScheduleCreation();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    try {
      // Primeiro atualiza o request com os dados
      const vehiclesData: Vehicle[] = vehicles.map((v) => ({
        plate: v.placa || undefined,
        vin: v.chassi || undefined,
        serviceAddress: v.endereco || undefined,
        responsible: v.responsavel || undefined,
        responsiblePhone: v.telResponsavel || undefined,
      }));

      await updateMaintenanceRequest.mutateAsync({
        id: request._id,
        payload: {
          subject,
          vehicles: vehiclesData,
          client: clientId || undefined,
        },
      });

      // Depois cria os schedules
const result = await createSchedules.mutateAsync({
  
  id: request._id,
  createdBy: user?.name,
});
      toast.success(
        `${result.schedulesCreated} agendamento(s) criado(s) com sucesso!`
      );
      onClose();
    } catch (error: any) {
      console.error("Error creating schedules:", error);
      toast.error(
        error.response?.data?.error || "Erro ao criar agendamentos"
      );
    }
  };

  const canCreateSchedules = () => {
    return validateForScheduleCreation().length === 0;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold pr-8">
            Criar Agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-6">
          {/* Erros de validação */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Header Info - Subject & Status */}
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
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50 border border-border">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Categoria</span>
              <p className="text-sm font-medium">{request.category}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">
                E-mail do Contato
              </span>
              <p className="text-sm font-medium">{request.contactEmail}</p>
            </div>
          </div>

          {/* Vehicle Forms */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Veículos</h3>
              <div className="flex items-center gap-2">
                <ClientPicker value={clientId} onChange={setClientId} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVehicle}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar outro
                </Button>
              </div>
            </div>

            {vehicles.map((vehicle, index) => (
              <div
                key={vehicle.id}
                className="p-4 rounded-lg border border-border bg-card space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Veículo #{index + 1}
                  </span>
                  {vehicles.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVehicle(vehicle.id)}
                      className="h-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`placa-${vehicle.id}`}>
                      Placa {!vehicle.chassi && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id={`placa-${vehicle.id}`}
                      value={vehicle.placa}
                      onChange={(e) =>
                        handleVehicleChange(
                          vehicle.id,
                          "placa",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="ABC1D23"
                      className="uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`chassi-${vehicle.id}`}>
                      Chassi {!vehicle.placa && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id={`chassi-${vehicle.id}`}
                      value={vehicle.chassi}
                      onChange={(e) =>
                        handleVehicleChange(
                          vehicle.id,
                          "chassi",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="9BWZZZ377VT004251"
                      className="uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`endereco-${vehicle.id}`}>Endereço</Label>
                    <Input
                      id={`endereco-${vehicle.id}`}
                      value={vehicle.endereco}
                      onChange={(e) =>
                        handleVehicleChange(vehicle.id, "endereco", e.target.value)
                      }
                      placeholder="Rua, número, cidade"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`responsavel-${vehicle.id}`}>Responsável</Label>
                    <Input
                      id={`responsavel-${vehicle.id}`}
                      value={vehicle.responsavel}
                      onChange={(e) =>
                        handleVehicleChange(vehicle.id, "responsavel", e.target.value)
                      }
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`tel-${vehicle.id}`}>Tel. Responsável</Label>
                    <Input
                      id={`tel-${vehicle.id}`}
                      value={vehicle.telResponsavel}
                      onChange={(e) =>
                        handleVehicleChange(
                          vehicle.id,
                          "telResponsavel",
                          e.target.value
                        )
                      }
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Email Details - Expandable */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium">Ver detalhes do e-mail</span>
              {showDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showDetails && (
              <div className="p-4 border-t border-border">
                <div
                  className="email-content"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="secondary"
            onClick={handleUpdateRequest}
            disabled={updateMaintenanceRequest.isPending}
          >
            {updateMaintenanceRequest.isPending ? "Salvando..." : "Editar Solicitação"}
          </Button>
          <Button
            onClick={handleCreateSchedules}
            disabled={!canCreateSchedules() || createSchedules.isPending}
          >
            {createSchedules.isPending ? "Criando..." : "Criar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}