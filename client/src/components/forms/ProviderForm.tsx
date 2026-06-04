import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, User, Phone, Mail, Building2 } from "lucide-react";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
import type { GetProp, UploadProps } from "antd";
import { useQuery } from "@tanstack/react-query";

import { InputWithIcon } from "../global/InputWithIcon";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { providerApi, useProviderService, type ProviderPayload } from "@/services/ProviderService";

// ─── Upload helpers (mesmo padrão do ProductForm/ClientForm) ──────────────────

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) message.error("Apenas arquivos JPG/PNG são permitidos!");
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) message.error("A imagem deve ter menos de 2MB");
  return isJpgOrPng && isLt2M;
};

// ─── Schema ──────────────────────────────────────────────────────────────────

const ContactSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
});

const FormSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  contacts: z.array(ContactSchema),
});

export type ProviderFormValues = z.infer<typeof FormSchema>;

// ─── Props ───────────────────────────────────────────────────────────────────

type Props = {
  providerId?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function ProviderForm({ providerId, onSuccess, onCancel }: Props) {
  const isEditing = Boolean(providerId);

  const [imageUrl, setImageUrl] = useState<string>();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider", providerId],
    queryFn: () => providerApi.getById(providerId!),
    enabled: !!providerId,
  });

  const { createProvider, updateProvider } = useProviderService();

  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      contacts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  });

  // Preenche o form ao editar
  useEffect(() => {
    if (provider) {
      reset({
        name: provider.name,
        contacts: provider.contacts.map(({ name, phone, email }) => ({
          name,
          phone: phone ?? "",
          email: email ?? "",
        })),
      });
      if (provider.image) setImageUrl(provider.image);
    }
  }, [provider, reset]);

  // Handle upload — igual ao ProductForm/ClientForm
  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.originFileObj) {
      const file = info.file.originFileObj;
      setImageFile(file);
      getBase64(file, (url) => setImageUrl(url));
    }
  };

  async function onSubmit(data: ProviderFormValues) {
    try {
      const payload: ProviderPayload = {
        name: data.name,
        image: imageFile || undefined,
        contacts: data.contacts.map((c) => ({
          name: c.name,
          phone: c.phone || undefined,
          email: c.email || undefined,
        })),
      };

      if (isEditing) {
        await updateProvider.mutateAsync({ id: providerId!, payload });
        toast.success("Prestador atualizado com sucesso!");
      } else {
        await createProvider.mutateAsync(payload);
        toast.success("Prestador cadastrado com sucesso!");
      }

      onSuccess();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || "Erro ao salvar prestador";
      toast.error(errorMessage);
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

  const isSubmitting = createProvider.isPending || updateProvider.isPending;

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <Label style={{ display: "block", marginTop: 8 }}>Logo</Label>
    </button>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-[calc(100vh-8.5rem)] justify-between">
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-5 pb-6">
        {/* Upload de imagem — igual ao ProductForm/ClientForm */}
        <div className="flex justify-center">
          <Upload
            name="avatar"
            listType="picture-circle"
            className="avatar-uploader"
            showUploadList={false}
            customRequest={({ onSuccess }) => onSuccess?.("ok")}
            beforeUpload={beforeUpload}
            onChange={handleChange}
          >
            {imageUrl ? (
              <img
                draggable={false}
                src={imageUrl}
                alt="avatar"
                style={{ width: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              uploadButton
            )}
          </Upload>
        </div>

        {/* Nome */}
        <div className="space-y-1">
          <Label>Nome *</Label>
          <InputWithIcon
            icon={<Building2 className="h-4 w-4" />}
            placeholder="Nome do prestador"
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        {/* Contatos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Contatos</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => append({ name: "", phone: "", email: "" })}
              className="h-8 gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-xl bg-muted/10">
              Nenhum contato adicionado
            </p>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="group/contact relative border border-muted/80 rounded-xl p-4 space-y-3 bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center justify-between border-b border-muted/60 pb-2">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Contato #{index + 1}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground/80">Nome *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/75" />
                  <Input
                    placeholder="Nome do contato"
                    className="pl-9 h-9 text-sm focus-visible:ring-primary/20"
                    {...register(`contacts.${index}.name`)}
                  />
                </div>
                {errors.contacts?.[index]?.name && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.contacts[index]?.name?.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground/80">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/75" />
                  <Input
                    placeholder="11999990000"
                    className="pl-9 h-9 text-sm focus-visible:ring-primary/20"
                    {...register(`contacts.${index}.phone`)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground/80">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/75" />
                  <Input
                    placeholder="email@exemplo.com"
                    type="email"
                    className="pl-9 h-9 text-sm focus-visible:ring-primary/20"
                    {...register(`contacts.${index}.email`)}
                  />
                </div>
                {errors.contacts?.[index]?.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.contacts[index]?.email?.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-3 pt-4 border-t bg-background mt-auto">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Salvando..."
            : isEditing
            ? "Salvar alterações"
            : "Cadastrar Prestador"}
        </Button>
      </div>
    </form>
  );
}
