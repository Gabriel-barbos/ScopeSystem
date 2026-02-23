import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { InputWithIcon } from "../InputWithIcon";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Icons
import { User, FileUser } from "lucide-react";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";

import { message, Upload } from "antd";
import type { GetProp, UploadProps } from "antd";

//import services
import type { ClientPayload } from "@/services/ClientService";
import { useClientService, clientApi } from "@/services/ClientService";
import { useQuery } from "@tanstack/react-query";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

//zod schema de validação
const FormSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  description: z.string().optional(),
  type: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof FormSchema>;

// Props do componente
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
  if (!isJpgOrPng) {
    message.error("Apenas arquivos JPG/PNG são permitidos!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("A imagem deve ter menos de 2MB");
  }
  return isJpgOrPng && isLt2M;
};


export function ClientForm({ clientId, onSuccess, onCancel }: Props) {
  const isEditing = Boolean(clientId);

// Busca dados do cliente 
 const { data: client, isLoading: loadingClient } = useQuery({
  queryKey: ["client", clientId],
  queryFn: () => clientApi.getById(clientId!),
  enabled: !!clientId, 
});


//mutations 
const { createClient, updateClient } = useClientService();

const [imageUrl, setImageUrl] = useState<string>();
  
const [imageFile, setImageFile] = useState<File | null>(null);

  //react hook form
  const {
    register,
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "",
    },
  });

//prenche form ao editar
  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        description: client.description || "",
        type: client.type || "",
      });

      if (client.image?.[0]) {
        setImageUrl(client.image[0]);
      }
    }
  }, [client, reset]);

 //handle upload da imagem
  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.originFileObj) {
      const file = info.file.originFileObj;

      //Guarda o File real 
      setImageFile(file);

      // 2. Cria preview visual
      getBase64(file, (url) => {
        setImageUrl(url);
      });
    }
  };

  //submit do form
  async function onSubmit(data: ClientFormValues) {
    try {
      // Prepara o payload
      const payload: ClientPayload = {
        name: data.name,
        description: data.description,
        type: data.type,
        image: imageFile || undefined,
      };

      if (isEditing) {
        await updateClient.mutateAsync({
          id: clientId!,
          payload,
        });
        toast.success("Cliente atualizado com sucesso!");
      } else {

        await createClient.mutateAsync(payload);
        toast.success("Cliente criado com sucesso!");
      }

      // Fecha o drawer
      onSuccess();
    } catch (err: any) {
      console.error("Erro ao salvar cliente:", err);
      const errorMessage =
        err?.response?.data?.message || "Erro ao salvar cliente";
      toast.error(errorMessage);
    }
  }

//loading inicial - melhorar depois
  if (isEditing && loadingClient) {
    return (
      <div className="flex justify-center items-center p-10">
        <LoadingOutlined className="text-2xl" />
        <p className="ml-3 text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  //variaveis de loading
  const isSubmitting = createClient.isPending || updateClient.isPending;

 // upload button
  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <Label style={{ display: "block", marginTop: 8 }}>Logo</Label>
    </button>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
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

      <div className="space-y-1">
        <Label>Nome *</Label>
        <InputWithIcon
          icon={<User className="h-4 w-4" />}
          placeholder="Nome do cliente"
          error={errors.name?.message}
          {...register("name")}
        />
      </div>

      <div className="space-y-1">
        <Label>Descrição</Label>
        <InputWithIcon
          icon={<FileUser className="h-4 w-4" />}
          placeholder="ex: Empresa de software"
          error={errors.description?.message}
          {...register("description")}
        />
      </div>

      <div className="space-y-1">
        <Label>Tipo de Cliente</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cliente">Cliente</SelectItem>
                <SelectItem value="Sub-Cliente">Sub-Cliente</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
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