import { useEffect, useState } from "react";
import {
  Users as UsersIcon,
  Calendar,
  Headset,
  Shield,
  Wrench,
  UserPlus,
  Pen,
  Trash,
  UserPen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { List } from "antd";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { UniversalDrawer } from "@/components/UniversalDrawer";
import { UserForm } from "@/components/forms/UserForm"; 
import { ConfirmModal } from "@/components/ConfirmModal";
import { getRoleLabel } from "@/utils/roleMapper";

import { UserServiceInstance as UserService } from "@/services/UserService";

const roleConfig: Record<string, { color: string; icon: React.ElementType }> = {
  Administrador: { color: "bg-purple-500/15 text-purple-600", icon: Shield },
  Suporte: { color: "bg-blue-500/15 text-blue-600", icon: Headset },
  Agendamento: { color: "bg-amber-500/15 text-amber-600", icon: Calendar },
  validação: { color: "bg-green-500/15 text-green-600", icon: Wrench },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function RoleBadge({ role }: { role: string }) {
  const config = roleConfig[role] || {
    color: "bg-green-500/15 text-green-600",
    icon: Wrench,
  };
  const Icon = config.icon;
  return (
    <Badge
      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${config.color}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {role}
    </Badge>
  );
}

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = UserService.subscribe(setUsers);
    UserService.getAll();
    return unsubscribe;
  }, []);

  // abrir drawer em modo criar
  function openCreate() {
    setEditingUserId(null);
    setIsDrawerOpen(true);
  }

  // abrir drawer em modo editar para um usuário específico
  function openEdit(userId: string) {
    setEditingUserId(userId);
    setIsDrawerOpen(true);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <UsersIcon className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-2xl">Usuários</CardTitle>
            <CardDescription>Administrar usuários e permissões</CardDescription>
          </div>

          <Button className="ml-auto" size="sm" onClick={openCreate}>
            Criar Usuário <UserPlus />
          </Button>

          <UniversalDrawer
            open={isDrawerOpen}
            onOpenChange={(open) => {
              setIsDrawerOpen(open);
              if (!open) setEditingUserId(null); 
            }}
            title={editingUserId ? "Editar Usuário" : "Cadastrar Usuário"}
            icon={editingUserId ? <UserPen /> : <UserPlus />}
            styleType={editingUserId ? "edit" : "create"}
          >
            <UserForm
              userId={editingUserId ?? undefined}
              onCancel={() => {
                setIsDrawerOpen(false);
                setEditingUserId(null);
              }}
              onSuccess={async () => {
                await UserService.getAll(true);//refresh 
                setIsDrawerOpen(false);
                setEditingUserId(null);
              }}
            />
          </UniversalDrawer>
        </div>
      </CardHeader>

      <CardContent>
        <List
          dataSource={users}
          renderItem={(user: any) => (
            <List.Item
              key={user.id}
              actions={[
                <Button
                  key="edit"
                  variant="secondary"
                  size="sm"
                  onClick={() => openEdit(user.id)}
                >
                  <Pen />
                </Button>,
                <Button
                  key="delete"
                  variant="default"
                  size="sm"
                  className="bg-transparent hover:bg-destructive/10 text-destructive border-red-600/30 border-2"
                  onClick={() => setDeleteUserId(user.id)}
                >
                  <Trash />
                </Button>,
              ]}
            >
              <ConfirmModal
                open={deleteUserId === user.id}
                onOpenChange={(open) => !open && setDeleteUserId(null)}
                title="Excluir usuário"
                description={`Tem certeza que deseja excluir "${user.name}"?`}
                confirmText="Excluir"
                onConfirm={async () => {
                  await UserService.remove(user.id);
                  setDeleteUserId(null);
                }}
              />

              <List.Item.Meta
                avatar={
                  <Avatar className="h-10 w-10 left-2">
                    <AvatarFallback className="bg-primary/30 text-primary text-sm font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                }
                title={
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-base font-medium text-foreground">
                      {user.name}
                    </span>
                    <RoleBadge role={getRoleLabel(user.role)} />
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </CardContent>
    </Card>
  );
}
