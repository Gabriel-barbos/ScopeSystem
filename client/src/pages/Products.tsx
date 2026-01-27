import { useState } from "react";
import { SquareUser, SatelliteDish, Plus, Search, SquarePen, CirclePlus, ShoppingCart, MoreVertical, Plug2, Pen, Trash, Cable } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UniversalDrawer } from "@/components/UniversalDrawer";
import { ProductForm } from "@/components/forms/ProductForm";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useProductService } from "@/services/ProductService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List } from "antd";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RoleIf from "@/components/RoleIf";
import { Roles } from "@/utils/roles";
// Badge customizado por categoria
function CategoryBadge({ category }: { category?: string }) {
  if (!category) return null;

  const styles = {
    "Dispositivo": {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-400",
      icon: SatelliteDish ,
    },
    "Acessorio": {
      bg: "bg-purple-50 dark:bg-purple-500/10",
      border: "border-purple-200 dark:border-purple-800",
      text: "text-purple-700 dark:text-purple-400",
      icon: Cable,
    },
    "Outros": {
      bg: "bg-green-50 dark:bg-green-500/10",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-700 dark:text-green-400",
      icon: Plug2,
    },
  };

  const style = styles[category as keyof typeof styles];
  if (!style) return null;

  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${style.bg} ${style.border} ${style.text} text-xs font-medium`}>
      <Icon className="h-3 w-3" />
      {category}
    </span>
  );
}


//detail modal

function ProductDetailsModal({ product, open, onOpenChange }: { product: any; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Produto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {product.image?.[0] && (
            <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
              <img
                src={product.image[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{product.name}</p>
            </div>

            {product.category && (
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <div className="mt-1">
                  <CategoryBadge category={product.category} />
                </div>
              </div>
            )}

            {product.description && (
              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="text-sm">{product.description}</p>
              </div>
            )}

            {product.price && (
              <div>
                <p className="text-sm text-muted-foreground">Preço</p>
                <p className="font-medium">{product.price}</p>
              </div>
            )}

      
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default function Products() {
  const { data: product, isLoading } = useProductService();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { deleteProduct } = useProductService();
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "Produto Comum" | "Acessorio" | "Material">("all");
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);

  const filteredProducts = (product ?? [])
    .filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((product) => {
      if (activeTab === "all") return true;
      return product.category === activeTab;
    });

  function openCreate() {
    setEditingProductId(null);
    setIsDrawerOpen(true);
  }

  function openEdit(productId: string) {
    setEditingProductId(productId);
    setIsDrawerOpen(true);
  }

  return (
    <Card className="mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <ShoppingCart className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-2xl">Produtos</CardTitle>
            <CardDescription>Criar e gerenciar produtos</CardDescription>
          </div>
          <Button className="ml-auto" size="sm" onClick={openCreate}>
            Cadastrar Produto <Plus />
          </Button>
          <UniversalDrawer
            open={isDrawerOpen}
            onOpenChange={(open) => {
              setIsDrawerOpen(open);
              if (!open) setEditingProductId(null);
            }}
            title={editingProductId ? "Editar Produto" : "Cadastrar Produto"}
            icon={editingProductId ? <SquarePen /> : <CirclePlus />}
            styleType={editingProductId ? "edit" : "create"}
          >
            <ProductForm
              productId={editingProductId ?? undefined}
              onCancel={() => {
                setIsDrawerOpen(false);
                setEditingProductId(null);
              }}
              onSuccess={async () => {
                setIsDrawerOpen(false);
                setEditingProductId(null);
              }}
            />
          </UniversalDrawer>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1 max-w-sm">
            <Label htmlFor="search" className="text-sm text-muted-foreground mb-2 block">
              Buscar produto
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="Digite o nome do produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
          className="mt-6"
        >
          <TabsList>
            <TabsTrigger value="all">Todos ({product?.length})</TabsTrigger>
            <TabsTrigger value="Dispositivo">
              <SatelliteDish className="mr-1.5 h-4 w-4" />
              Dispositivos
            </TabsTrigger>
            <TabsTrigger value="Acessorio">
              <Cable className="mr-1.5 h-4 w-4" />
              Acessório
            </TabsTrigger>
            <TabsTrigger value="Outros">
              <Plug2 className="mr-1.5 h-4 w-4" />
              Outros
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <List
              dataSource={filteredProducts}
              renderItem={(product) => (
                <List.Item
                  key={product._id}
                  actions={[
                    <Button
                      key="view"
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewingProduct(product)}
                    >
                      <MoreVertical />
                    </Button>,

                          <RoleIf roles={[Roles.ADMIN]}>

                       
                    <Button
                      key="edit"
                      variant="secondary"
                      size="sm"
                      onClick={() => openEdit(product._id)}
                    >
                      <Pen />
                    </Button>,
                    <Button
                      key="delete"
                      variant="default"
                      size="sm"
                      className="bg-transparent hover:bg-destructive/10 text-destructive border-red-600/30 border-2"
                      onClick={() => setDeleteProductId(product._id)}
                    >
                      <Trash />
                    </Button>,
                       </RoleIf>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="mx-2 h-14 w-14 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {product.image?.[0] ? (
                          <img
                            src={product.image[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Plug2 className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    }
                    title={product.name}
                    description={
                      <div className="flex items-center gap-2 mt-1">
                        <CategoryBadge category={product.category} />
                      </div>
                    }
                  />
                  <ConfirmModal
                    open={deleteProductId === product._id}
                    onOpenChange={(open) => !open && setDeleteProductId(null)}
                    title="Excluir produto"
                    description={`Tem certeza que deseja excluir "${product.name}"?`}
                    confirmText="Excluir"
                    onConfirm={() => {
                      deleteProduct.mutate(product._id);
                      setDeleteProductId(null);
                    }}
                  />

                  <ProductDetailsModal
                    product={viewingProduct}
                    open={viewingProduct !== null}
                    onOpenChange={(open) => !open && setViewingProduct(null)}
                  />
                </List.Item>
              )}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}