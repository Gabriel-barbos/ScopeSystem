import { Megaphone, Plus, MegaphoneOff, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "antd";
import PlatformCardGrid from "@/components/home/PlataformCardGrid";
import { NoticeCard } from "@/components/home/NoticeCard";
import type { RoleType } from "@/utils/badges";

// Dados de exemplo — substitua pela sua fonte de dados real
const NOTICES: { id: number; title: string; description: string; createdAt: string; priority: "low" | "medium" | "high"; roles: RoleType[] }[] = [
  {
    id: 1,
    title: "Escala carnaval 2025",
    description: "Kadu descansa, Estagio tbm coitado e Raul na Ação",
    createdAt: "24 de fev. de 2025",
    priority: "high",
    roles: [, "Suporte"],
  },
  {
    id: 2,
    title: "Ovo de pascoa Top",
    description: "Todo mundo ganhará um ovo de pascoa top esse ano, fiquem ligados!",
    createdAt: "23 de fev. de 2025",
    priority: "medium",
    roles: ["Agendamento", "Validação", "Suporte", "Financeiro", "Comercial"],
  },
  {
    id: 3,
    title: "Emitir Nota Fiscal — Fevereiro",
    description: "Geral emitir NF e mandar no email do Celso mestre até dia 28/02.",
    createdAt: "22 de fev. de 2025",
    priority: "low",
    roles: ["Agendamento", "Validação", "Suporte", "Financeiro", "Comercial"],
  },
];

export default function Home() {
  const hasNotices = NOTICES.length > 0;

  return (
    <div className="mx-auto flex flex-col gap-6">

      {/* ── Avisos ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Megaphone className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl">
              Avisos <Tag color="cyan">Em desenvolvimento</Tag>
            </CardTitle>
          </div>

          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Criar aviso
          </Button>
        </CardHeader>

        <CardContent>
          {hasNotices ? (
            // Grid responsivo: 1 col mobile → 2 col md → 3 col lg
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {NOTICES.map((notice) => (
                <NoticeCard key={notice.id} {...notice} />
              ))}
            </div>
          ) : (
            // Estado vazio
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                <MegaphoneOff className="h-7 w-7 text-muted-foreground" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  0
                </span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Nenhum aviso publicado</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Crie avisos para notificar a equipe
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Links úteis ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Share2 className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl">
              Links úteis <Tag color="cyan">Em desenvolvimento</Tag>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <PlatformCardGrid />
        </CardContent>
      </Card>

    </div>
  );
}