import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { clientApi, type Client } from "@/services/ClientService";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, ChevronDown, Search, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Step3ClientsProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

function buildTree(clients: Client[]) {
  const roots = clients.filter((c) => !c.parent?._id);
  const childMap = new Map<string, Client[]>();

  for (const c of clients) {
    if (c.parent?._id) {
      const arr = childMap.get(c.parent._id) ?? [];
      arr.push(c);
      childMap.set(c.parent._id, arr);
    }
  }

  return { roots, childMap };
}

function ClientAvatar({ client, selected, small = false }: { client: Client; selected: boolean; small?: boolean }) {
  const initials = client.name.slice(0, 2).toUpperCase();

  return (
    <Avatar className={cn("border", small ? "h-8 w-8" : "h-10 w-10", selected ? "border-primary/40" : "border-border")}>
      <AvatarImage src={client.image?.[0]} alt={client.name} className="object-cover" />
      <AvatarFallback className={cn("text-xs font-semibold", selected ? "bg-primary/10 text-primary" : "bg-muted")}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

function SubClientButton({
  client,
  selected,
  onToggle,
}: {
  client: Client;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex min-h-14 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all",
            "hover:border-primary/40 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            selected ? "border-primary bg-primary/5 text-primary" : "border-border bg-background"
          )}
        >
          <ClientAvatar client={client} selected={selected} small />
          <span className="min-w-0 flex-1 break-words text-xs font-medium leading-tight">
            {client.name}
          </span>
          {selected && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[300px] text-xs">
        <p className="font-medium">{client.name}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function ParentClientGroup({
  parent,
  children,
  visibleChildren,
  selected,
  expanded,
  forceExpanded,
  onToggleParent,
  onToggleChild,
  onToggleExpand,
}: {
  parent: Client;
  children: Client[];
  visibleChildren: Client[];
  selected: string[];
  expanded: boolean;
  forceExpanded: boolean;
  onToggleParent: () => void;
  onToggleChild: (id: string) => void;
  onToggleExpand: () => void;
}) {
  const parentSelected = selected.includes(parent._id);
  const selectedChildren = children.filter((child) => selected.includes(child._id)).length;
  const isExpanded = expanded || forceExpanded;
  const hasChildren = children.length > 0;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-all duration-200",
        parentSelected ? "border-primary/70 shadow-sm shadow-primary/10" : "border-border"
      )}
    >
      <div className="flex min-h-24 items-center gap-3 p-4">
        <button
          type="button"
          onClick={onToggleParent}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ClientAvatar client={parent} selected={parentSelected} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn("min-w-0 flex-1 break-words text-sm font-semibold leading-snug cursor-pointer", parentSelected && "text-primary")}>
                    {parent.name}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px] text-xs">
                  <p className="font-semibold">{parent.name}</p>
                </TooltipContent>
              </Tooltip>
              {parentSelected && <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={3} />}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {hasChildren && (
                <Badge variant="secondary" className="h-5 px-2 text-[10px]">
                  {children.length} subclientes
                </Badge>
              )}
              {selectedChildren > 0 && (
                <Badge className="h-5 px-2 text-[10px]">
                  {selectedChildren} selecionado{selectedChildren !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </button>

        {hasChildren && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onToggleExpand}
            disabled={forceExpanded}
            aria-label={isExpanded ? "Recolher subclientes" : "Expandir subclientes"}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
          </Button>
        )}
      </div>

      {isExpanded && visibleChildren.length > 0 && (
        <div className="border-t bg-muted/20 p-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {visibleChildren.map((child) => (
              <SubClientButton
                key={child._id}
                client={child}
                selected={selected.includes(child._id)}
                onToggle={() => onToggleChild(child._id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Step3Clients({ selected, onChange }: Step3ClientsProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: clientApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

  const { roots, childMap } = useMemo(() => buildTree(clients), [clients]);

  const normalizedSearch = search.trim().toLowerCase();
  const allSelected = selected.length === 0;

  const visibleRoots = useMemo(() => {
    if (!normalizedSearch) return roots;

    return roots.filter((parent) => {
      const children = childMap.get(parent._id) ?? [];
      return (
        parent.name.toLowerCase().includes(normalizedSearch) ||
        children.some((child) => child.name.toLowerCase().includes(normalizedSearch))
      );
    });
  }, [childMap, normalizedSearch, roots]);

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedParentIds = selected.filter((id) => (childMap.get(id) ?? []).length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Clientes</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">Filtre por clientes (opcional)</p>
        </div>
        {!allSelected && (
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => onChange([])}>
            <X className="h-3.5 w-3.5" />
            Limpar seleção
          </Button>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            className="h-10 pl-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={() => onChange([])}
          className={cn(
            "flex h-10 items-center gap-2.5 rounded-lg border px-3 text-sm transition-all",
            allSelected
              ? "border-primary bg-primary/5 font-medium text-primary"
              : "border-border bg-card text-muted-foreground hover:bg-accent/40"
          )}
        >
          <div className={cn("flex h-7 w-7 items-center justify-center rounded-full", allSelected ? "bg-primary text-primary-foreground" : "bg-muted")}>
            <Users className="h-3.5 w-3.5" />
          </div>
          <span className="min-w-0 flex-1 truncate text-left">Todos os clientes</span>
          {allSelected && <Check className="h-3.5 w-3.5" />}
        </button>
      </div>

      {selectedParentIds.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2 dark:border-blue-900/50 dark:bg-blue-950/20">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-blue-500" />
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {selectedParentIds.length > 1
              ? `${selectedParentIds.length} clientes pai selecionados: subclientes incluídos automaticamente`
              : "Cliente pai selecionado: subclientes incluídos automaticamente"}
          </p>
        </div>
      )}

      <div className="max-h-[420px] overflow-y-auto pr-1 sidebar-scroll">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Carregando clientes...
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {visibleRoots.map((parent) => {
              const children = childMap.get(parent._id) ?? [];
              const visibleChildren = normalizedSearch
                ? children.filter((child) => child.name.toLowerCase().includes(normalizedSearch))
                : children;

              return (
                <ParentClientGroup
                  key={parent._id}
                  parent={parent}
                  children={children}
                  visibleChildren={visibleChildren}
                  selected={selected}
                  expanded={expanded.has(parent._id)}
                  forceExpanded={!!normalizedSearch}
                  onToggleParent={() => toggle(parent._id)}
                  onToggleChild={toggle}
                  onToggleExpand={() => toggleExpand(parent._id)}
                />
              );
            })}
          </div>
        )}

        {!isLoading && visibleRoots.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Nenhum cliente encontrado
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <p className="text-xs font-medium text-primary">
          {selected.length} cliente{selected.length !== 1 ? "s" : ""} selecionado{selected.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
