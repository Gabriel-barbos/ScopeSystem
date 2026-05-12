import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputWithIcon } from "../global/InputWithIcon";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, ShieldCheck } from "lucide-react";
import { UserServiceInstance as UserService } from "@/services/UserService";
import { toast } from "sonner";
import { getRoleConfig } from "@/utils/badges";

// ── Roles disponíveis ──────────────────────────────────────────────────────────
const AVAILABLE_ROLES = [
  { value: "administrator", label: "Administrador" },
  { value: "validation",    label: "Validação"     },
  { value: "support",       label: "Suporte"       },
  { value: "scheduling",    label: "Agendamento"   },
  { value: "billing",       label: "Financeiro"    },
  { value: "commercial",    label: "Comercial"     },
  { value: "CX",            label: "CX"            },
  { value: "lab",           label: "Laboratório"   },
] as const;

// ── Schema ─────────────────────────────────────────────────────────────────────
const createFormSchema = (isEditing: boolean) =>
  z.object({
    name:     z.string().min(2, "Nome muito curto"),
    email:    z.string().email("Email inválido"),
    password: isEditing
      ? z.string().optional()
      : z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    roles: z.array(z.string()).min(1, "Selecione pelo menos uma função"),
  });

export type UserFormValues = z.infer<ReturnType<typeof createFormSchema>>;

type Props = {
  userId?:   string;
  onSuccess: () => void;
  onCancel:  () => void;
};

// ── Componente ─────────────────────────────────────────────────────────────────
export function UserForm({ userId, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(userId);

  const {
    register,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(createFormSchema(isEditing)),
    defaultValues: { name: "", email: "", password: "", roles: ["support"] },
  });

  const selectedRoles = watch("roles");

  // Carrega dados se for editar
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const user = await UserService.getById(userId);
        // Retrocompatível: prioriza roles[], cai para [role]
        const effectiveRoles =
          Array.isArray(user.roles) && user.roles.length > 0
            ? user.roles
            : user.role
            ? [user.role]
            : ["support"];

        reset({ name: user.name, email: user.email, password: "", roles: effectiveRoles });
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      }
    })();
  }, [userId, reset]);

  // Toggle de seleção de role
  function toggleRole(value: string) {
    const current = selectedRoles ?? [];
    const next = current.includes(value)
      ? current.filter((r) => r !== value)
      : [...current, value];
    setValue("roles", next, { shouldValidate: true });
  }

  async function onSubmit(data: UserFormValues) {
    try {
      setLoading(true);
      const payload = {
        name:  data.name,
        email: data.email,
        roles: data.roles,
        // mantém role singular para retrocompatibilidade
        role:  data.roles[0],
        ...(data.password ? { password: data.password } : {}),
      };

      if (isEditing) {
        await UserService.update(userId!, payload);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await UserService.create({ ...payload, password: data.password || "" });
        toast.success("Usuário criado com sucesso!");
      }
      onSuccess();
    } catch (err: any) {
      console.error("Erro ao salvar usuário:", err);
      toast.error(err?.response?.data?.message || "Erro ao salvar usuário");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-2 max-h-[75vh] overflow-y-auto">

      {/* Nome */}
      <div className="space-y-1">
        <Label>Nome</Label>
        <InputWithIcon
          icon={<User className="h-4 w-4" />}
          placeholder="Nome completo"
          error={errors.name?.message}
          {...register("name")}
        />
      </div>

      {/* Email */}
      <div className="space-y-1">
        <Label>Email</Label>
        <InputWithIcon
          icon={<Mail className="h-4 w-4" />}
          placeholder="email@dominio.com"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      {/* Senha */}
      <div className="space-y-1">
        <Label>Senha {isEditing && "(opcional)"}</Label>
        <InputWithIcon
          icon={<Lock className="h-4 w-4" />}
          type="password"
          placeholder={isEditing ? "Deixe vazio para não alterar" : "Senha"}
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      {/* Roles — multiselect com checkboxes estilizados */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <Label>Funções</Label>
          {selectedRoles?.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">
              {selectedRoles.length} selecionada{selectedRoles.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_ROLES.map(({ value, label }) => {
            const isSelected = selectedRoles?.includes(value);
            const badge = getRoleConfig(value);
            const Icon = badge.icon;

            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleRole(value)}
                className={`
                  flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium
                  transition-all duration-150 text-left
                  ${isSelected
                    ? `${badge.className} ring-2 ring-offset-1 ring-current/40`
                    : "border-border bg-background text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                  }
                `}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{label}</span>
                {isSelected && (
                  <span className="ml-auto text-[10px] font-bold opacity-70">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {errors.roles && (
          <p className="text-sm text-destructive">{errors.roles.message as string}</p>
        )}
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar"}
        </Button>
      </div>
    </form>
  );
}