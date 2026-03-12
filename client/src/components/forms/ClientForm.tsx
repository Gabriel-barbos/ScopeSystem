import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { User, FileUser, ChevronsUpDown, Check } from "lucide-react";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
import type { GetProp, UploadProps } from "antd";

import { InputWithIcon } from "../InputWithIcon";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

import type { ClientPayload } from "@/services/ClientService";
import { useClientService, clientApi } from "@/services/ClientService";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const FormSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  description: z.string().optional(),
  parent: z.string().optional().nullable(),
});

export type ClientFormValues = z.infer<typeof FormSchema>;

// Tipo derivado do campo parent
type ClientType = "Cliente" | "subCliente";

type Props = {
  clientId?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

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

export function ClientForm({ clientId, onSuccess, onCancel }: Props) {
  const isEditing = Boolean(clientId);
  const [openParent, setOpenParent] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: client, isLoading: loadingClient } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => clientApi.getById(clientId!),
    enabled: !!clientId,
  });

  const { data: allClients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: clientApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

  const mainClients = allClients.filter(
    (c) => !c.parent && c._id !== clientId
  );

  const { createClient, updateClient } = useClientService();

  const {
    register,
    reset,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: "", description: "", parent: null },
  });

  const parentValue = watch("parent");
  const nameValue = watch("name");

  // Pai selecionado e tipo derivado
  const selectedParent = mainClients.find((c) => c._id === parentValue) ?? null;
  const clientType: ClientType = selectedParent ? "subCliente" : "Cliente";

  // Prefixo do cliente
  const namePrefix = selectedParent ? `${selectedParent.name} - ` : "";

  const displayName = nameValue.startsWith(namePrefix)
    ? nameValue.slice(namePrefix.length)
    : nameValue;

  useEffect(() => {
    if (selectedParent) {
      const baseName = nameValue.includes(" - ")
        ? nameValue.split(" - ").slice(1).join(" - ")
        : nameValue;
      setValue("name", `${selectedParent.name} - ${baseName}`);
    } else {
      // Remove prefixo ao desmarcar o pai
      const baseName = nameValue.includes(" - ")
        ? nameValue.split(" - ").slice(1).join(" - ")
        : nameValue;
      setValue("name", baseName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentValue]);

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        description: client.description || "",
        parent: client.parent?._id ?? null,
      });
      if (client.image?.[0]) setImageUrl(client.image[0]);
    }
  }, [client, reset]);

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.originFileObj) {
      const file = info.file.originFileObj;
      setImageFile(file);
      getBase64(file, (url) => setImageUrl(url));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value;

    if (namePrefix && !typed.startsWith(namePrefix)) {
      const afterPrefix = typed.length > namePrefix.length
        ? typed.slice(namePrefix.length)
        : "";
      setValue("name", `${namePrefix}${afterPrefix}`, { shouldValidate: true });
      return;
    }

    setValue("name", typed, { shouldValidate: true });
  };

  async function onSubmit(data: ClientFormValues) {
    try {
      const type: ClientType = data.parent ? "subCliente" : "Cliente";

      const payload: ClientPayload = {
        name: data.name,
        description: data.description,
        parent: data.parent || null,
        type,
        image: imageFile || undefined,
      };

      if (isEditing) {
        await updateClient.mutateAsync({ id: clientId!, payload });
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await createClient.mutateAsync(payload);
        toast.success("Cliente criado com sucesso!");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao salvar cliente");
    }
  }

  if (isEditing && loadingClient) {
    return (
      <div className="flex justify-center items-center p-10">
        <LoadingOutlined className="text-2xl" />
        <p className="ml-3 text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  const isSubmitting = createClient.isPending || updateClient.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
      <div className="flex justify-center">
        <Upload
          name="avatar"
          listType="picture-circle"
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
            <button style={{ border: 0, background: "none" }} type="button">
              <PlusOutlined />
              <Label style={{ display: "block", marginTop: 8 }}>Logo</Label>
            </button>
          )}
        </Upload>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={clientType === "Cliente" ? "default" : "secondary"}>
          {clientType === "Cliente" ? "Cliente" : "Sub-cliente"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {clientType === "Cliente"
            ? "Nenhum cliente pai vinculado"
            : `Vinculado a: ${selectedParent?.name}`}
        </span>
      </div>

      <div className="space-y-1">
        <Label>Nome *</Label>

        {namePrefix ? (
          <div className="flex items-center border rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden">
            <span className="flex items-center gap-1 pl-3 pr-1 text-sm text-muted-foreground whitespace-nowrap select-none">
              <User className="h-4 w-4 shrink-0" />
              {namePrefix}
            </span>
            <input
              className="flex-1 h-9 bg-transparent pr-3 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Nome do sub-cliente"
              value={displayName}
              onChange={(e) =>
                setValue("name", `${namePrefix}${e.target.value}`, {
                  shouldValidate: true,
                })
              }
            />
          </div>
        ) : (
          <InputWithIcon
            icon={<User className="h-4 w-4" />}
            placeholder="Nome do cliente"
            error={errors.name?.message}
            {...register("name")}
            onChange={handleNameChange}
          />
        )}

        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Descrição</Label>
        <InputWithIcon
          icon={<FileUser className="h-4 w-4" />}
          placeholder="ex: Empresa de software"
          {...register("description")}
        />
      </div>

      <div className="space-y-1">
        <Label>Cliente Principal</Label>
        <p className="text-xs text-muted-foreground">
          Preencha apenas se este for um sub-cliente
        </p>
        <Controller
          name="parent"
          control={control}
          render={({ field }) => (
            <Popover open={openParent} onOpenChange={setOpenParent}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  {selectedParent ? (
                    <span className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={selectedParent.image?.[0]} />
                        <AvatarFallback>
                          {selectedParent.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      {selectedParent.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Nenhum (cliente principal)
                    </span>
                  )}
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-72">
                <Command>
                  <CommandInput placeholder="Buscar cliente..." />
                  <CommandList>
                    <CommandEmpty>Nenhum cliente encontrado</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          field.onChange(null);
                          setOpenParent(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !field.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="text-muted-foreground">
                          Nenhum (cliente principal)
                        </span>
                      </CommandItem>
                      {mainClients.map((c) => (
                        <CommandItem
                          key={c._id}
                          onSelect={() => {
                            field.onChange(c._id);
                            setOpenParent(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === c._id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
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
          )}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Salvando..."
            : isEditing
            ? "Salvar alterações"
            : "Criar cliente"}
        </Button>
      </div>
    </form>
  );
}