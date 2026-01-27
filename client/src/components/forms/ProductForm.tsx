import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// UI Components
import { InputWithIcon } from "../InputWithIcon";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Icons
import { User, FileUser,DollarSign,Tag,NotebookText } from "lucide-react";
import { LoadingOutlined, PlusOutlined,  } from "@ant-design/icons";

// Ant Upload
import { message, Upload } from "antd";
import type { GetProp, UploadProps } from "antd";

//import services
import type { ProductPayload } from "@/services/ProductService";
import { useProductService, productApi } from "@/services/ProductService";
import { useQuery } from "@tanstack/react-query";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

//zod schema de validação
const FormSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  description: z.string().optional(),
  category: z.string().optional(),
  // image não fica no schema pois é tratado separadamente
});

export type  ProductFormValues = z.infer<typeof FormSchema>;

// Props do componente
type Props = {
  productId?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

//utils de upload de imagem
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


export function ProductForm({ productId, onSuccess, onCancel }: Props) {
  const isEditing = Boolean(productId);

// Busca dados do produto (só se estiver editando)
 const { data: product, isLoading: loadingClient } = useQuery({
  queryKey: ["product", productId],
  queryFn: () => productApi.getById(productId!),
  enabled: !!productId, // só roda se estiver editando
});


// Mutações (create, update, delete)
const { createProduct, updateProduct } = useProductService();

//preview da imagem
  const [imageUrl, setImageUrl] = useState<string>();
  
  // Arquivo real para enviar ao backend
  const [imageFile, setImageFile] = useState<File | null>(null);

  //react hook form
  const {
    register,
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
    },
  });

//prenche form ao editar
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || "",
        category: product.category || "",
      });

      // Se tiver imagem, mostra no preview
      if (product.image?.[0]) {
        setImageUrl(product.image[0]);
      }
    }
  }, [product, reset]);

 //handle upload da imagem
  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.originFileObj) {
      const file = info.file.originFileObj;

      //Guarda o File real 
      setImageFile(file);

      // 2. Cria preview visual (base64)
      getBase64(file, (url) => {
        setImageUrl(url);
      });
    }
  };

  //submit do form
  async function onSubmit(data: ProductFormValues) {
    try {
      // Prepara o payload
      const payload: ProductPayload = {
        name: data.name,
        description: data.description,
        category: data.category,
        image: imageFile || undefined,
      };

      if (isEditing) {
        // Atualiza produto existente
        await updateProduct.mutateAsync({
          id: productId!,
          payload,
        });
        toast.success("Produto atualizado com sucesso!");
      } else {
        // Cria novo produto
        await createProduct.mutateAsync(payload);
        toast.success("Produto criado com sucesso!");
      }

      // Fecha o drawer
      onSuccess();
    } catch (err: any) {
      console.error("Erro ao salvar produto:", err);
      const errorMessage =
        err?.response?.data?.message || "Erro ao salvar produto";
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
  const isSubmitting = createProduct.isPending || updateProduct.isPending;

 // upload button
  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <Label style={{ display: "block", marginTop: 8 }}>Imagem</Label>
    </button>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className=" ">
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
          icon={<Tag  className="h-4 w-4" />}
          placeholder="Nome do produto"
          error={errors.name?.message}
          {...register("name")}
        />
      </div>

      <div className="space-y-1">
        <Label>Descrição</Label>
        <InputWithIcon
          icon={<NotebookText  className="h-4 w-4" />}
          placeholder="ex: Equipamento de som"
          error={errors.description?.message}
          {...register("description")}
        />
      </div>

      <div className="space-y-1">
        <Label>Tipo de produto</Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dispositivo">Dispositivo</SelectItem>
                <SelectItem value="Acessorio">Acessorio</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
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
            : "Criar Produto"}
        </Button>
      </div>
    </form>
  );
}