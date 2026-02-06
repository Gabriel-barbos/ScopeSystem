import { useEffect, useState } from "react";
import {
  Users as UsersIcon,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { UniversalDrawer } from "@/components/UniversalDrawer";
import { UserForm } from "@/components/forms/UserForm";
import { ConfirmModal } from "@/components/ConfirmModal";
import { getRoleLabel } from "@/utils/roleMapper";
import { UserServiceInstance as UserService } from "@/services/UserService";

import { getRoleConfig } from "@/utils/badges";


function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function RoleBadge({ role }: { role: string }) {
  const roleBadge = getRoleConfig(role);
  const Icon = roleBadge.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${roleBadge.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{roleBadge.label}</span>
    </span>
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

  function openCreate() {
    setEditingUserId(null);
    setIsDrawerOpen(true);
  }

  function openEdit(userId: string) {
    setEditingUserId(userId);
    setIsDrawerOpen(true);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <UsersIcon className="h-6 w-6 text-primary" />
          </div>

          <div>
            <CardTitle className="text-2xl">Usuários</CardTitle>
            <CardDescription>
              Administrar usuários e permissões
            </CardDescription>
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
                await UserService.getAll(true);
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
                  <Avatar className="h-10 w-10">
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
                <RoleBadge role={user.role} />
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
