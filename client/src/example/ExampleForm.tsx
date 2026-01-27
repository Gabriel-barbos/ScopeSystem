import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// UI
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { LoadingOutlined } from "@ant-design/icons";

/* ======================================================
   🔁 ALTERAR AQUI — SERVICE
====================================================== */
// Exemplo: ProductService, VehicleService, etc
import { useClientService, clientApi } from "@/services/ClientService";
import type { ClientPayload } from "@/services/ClientService";

/* ======================================================
   🔁 ALTERAR AQUI — SCHEMA
====================================================== */
const FormSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().optional(),
  status: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

/* ======================================================
   PROPS PADRÃO
====================================================== */
type Props = {
  id?: string;          // id do registro (edição)
  onSuccess: () => void;
  onCancel: () => void;
};

/* ======================================================
   COMPONENT
====================================================== */
export function ExampleForm({ id, onSuccess, onCancel }: Props) {
  const isEditing = Boolean(id);

  /* ======================================================
     🔁 ALTERAR AQUI — FETCH BY ID
  ====================================================== */
  const { data, isLoading } = useQuery({
    queryKey: ["entity", id],
    queryFn: () => clientApi.getById(id!),
    enabled: isEditing,
  });

  /* ======================================================
     🔁 ALTERAR AQUI — MUTATIONS
  ====================================================== */
  const { createClient, updateClient } = useClientService();

  /* ======================================================
     FORM
  ====================================================== */
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "",
    },
  });

  /* ======================================================
     PREENCHE FORM (EDIÇÃO)
  ====================================================== */
  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        description: data.description ?? "",
        status: data.status ?? "",
      });
    }
  }, [data, reset]);

  /* ======================================================
     SUBMIT
  ====================================================== */
  async function onSubmit(values: FormValues) {
    try {
      const payload: ClientPayload = {
        ...values,
      };

      if (isEditing) {
        await updateClient.mutateAsync({ id: id!, payload });
        toast.success("Registro atualizado com sucesso");
      } else {
        await createClient.mutateAsync(payload);
        toast.success("Registro criado com sucesso");
      }

      onSuccess();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Erro ao salvar registro"
      );
    }
  }

  /* ======================================================
     LOADING INICIAL
  ====================================================== */
  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <LoadingOutlined className="text-xl" />
        <span className="ml-3 text-muted-foreground">
          Carregando dados...
        </span>
      </div>
    );
  }

  const isSubmitting =
    createClient.isPending || updateClient.isPending;

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ================= FIELD: NAME ================= */}
      <div className="space-y-1">
        <Label>Nome *</Label>
        <Input
          placeholder="Digite o nome"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* ================= FIELD: DESCRIPTION ================= */}
      <div className="space-y-1">
        <Label>Descrição</Label>
        <Input
          placeholder="Descrição opcional"
          {...register("description")}
        />
      </div>

      {/* ================= FIELD: STATUS ================= */}
      <div className="space-y-1">
        <Label>Status</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Salvando..."
            : isEditing
            ? "Salvar"
            : "Criar"}
        </Button>
      </div>
    </form>
  );
}
