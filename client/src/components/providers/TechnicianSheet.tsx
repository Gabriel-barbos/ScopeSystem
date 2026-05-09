import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, Building2, Wrench, Calendar, 
  Activity, ShieldAlert, Download, Hash
} from "lucide-react";

// Mock data para o histórico
const mockHistory = [
  { id: 1, type: "Instalação", date: "04/05/2026", client: "João Silva", technician: "Carlos Joaquim", chassis: "9BW ZZZ 37Z 4 T 000001", value: "R$ 150,00", status: "Concluído" },
  { id: 2, type: "Manutenção", date: "02/05/2026", client: "Maria Oliveira", technician: "Carlos Joaquim", chassis: "9BW ZZZ 37Z 4 T 000002", value: "R$ 80,00", status: "Concluído" },
  { id: 3, type: "Remoção", date: "30/04/2026", client: "Empresa XPTO", technician: "Carlos Joaquim", chassis: "9BW ZZZ 37Z 4 T 000003", value: "R$ 100,00", status: "Concluído" },
  { id: 4, type: "Instalação", date: "28/04/2026", client: "Carlos Mendes", technician: "Carlos Joaquim", chassis: "9BW ZZZ 37Z 4 T 000004", value: "R$ 120,00", status: "Concluído" },
];

interface TechnicianSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technician: any;
}

export function TechnicianSheet({ open, onOpenChange, technician }: TechnicianSheetProps) {
  if (!technician) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border border-border shadow-sm">
                <AvatarFallback className="text-lg font-semibold bg-muted text-muted-foreground">
                  {technician.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-xl font-semibold tracking-tight">{technician.name}</SheetTitle>
                <SheetDescription className="flex items-center gap-2 mt-1.5 text-xs">
                  <Building2 className="h-3.5 w-3.5" />
                  {technician.provider}
                  <Separator orientation="vertical" className="h-3.5 mx-1" />
                  <MapPin className="h-3.5 w-3.5" />
                  {technician.location}
                </SheetDescription>
              </div>
            </div>
            <Badge 
              variant={technician.status === 'Ativo' ? 'default' : technician.status === 'Ocupado' ? 'secondary' : 'outline'} 
              className={`text-xs font-semibold ${
                technician.status === 'Ativo' ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400' : 
                technician.status === 'Ocupado' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                'text-muted-foreground'
              }`}
            >
              {technician.status}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Tabela de Valores */}
          <Card className="shadow-none border-border/60">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Comissionamento
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col bg-muted/10 p-3 rounded-lg border border-border/40 hover:border-emerald-500/30 transition-colors">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Instalação</span>
                  <span className="font-bold text-foreground">{technician.installValue}</span>
                </div>
                <div className="flex flex-col bg-muted/10 p-3 rounded-lg border border-border/40 hover:border-amber-500/30 transition-colors">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Manutenção</span>
                  <span className="font-bold text-foreground">R$ 80,00</span>
                </div>
                <div className="flex flex-col bg-muted/10 p-3 rounded-lg border border-border/40 hover:border-rose-500/30 transition-colors">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Remoção</span>
                  <span className="font-bold text-foreground">R$ 100,00</span>
                </div>
                <div className="flex flex-col bg-muted/10 p-3 rounded-lg border border-border/40 hover:border-blue-500/30 transition-colors">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Valor KM</span>
                  <span className="font-bold text-foreground">{technician.kmValue}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtro e Indicadores de Serviços */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Desempenho
              </h3>
              <Select defaultValue="maio">
                <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maio" className="text-xs">Maio / 2026</SelectItem>
                  <SelectItem value="abril" className="text-xs">Abril / 2026</SelectItem>
                  <SelectItem value="marco" className="text-xs">Março / 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="shadow-none border-border/60 bg-muted/10 border-l-4 border-l-primary/70">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-primary/90">124</span>
                  <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 uppercase tracking-wider">Total</span>
                </CardContent>
              </Card>
              <Card className="shadow-none border-border/60 bg-muted/10 border-l-4 border-l-emerald-500/70">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-emerald-600">86</span>
                  <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 uppercase tracking-wider">Instalações</span>
                </CardContent>
              </Card>
              <Card className="shadow-none border-border/60 bg-muted/10 border-l-4 border-l-amber-500/70">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-amber-600">23</span>
                  <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 uppercase tracking-wider">Manutenções</span>
                </CardContent>
              </Card>
              <Card className="shadow-none border-border/60 bg-muted/10 border-l-4 border-l-rose-500/70">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-rose-600">15</span>
                  <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 uppercase tracking-wider">Remoções</span>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Histórico */}
          <Card className="shadow-none border-border/60">
            <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Histórico de Serviços
              </CardTitle>
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {mockHistory.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md border border-border/40 hover:bg-muted/30 transition-colors gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 border border-border/30 rounded-md ${
                        item.type === 'Instalação' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                        item.type === 'Manutenção' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' : 
                        'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                      }`}>
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="font-semibold text-sm text-foreground leading-none">
                          {item.type} <span className="font-normal text-muted-foreground mx-1">•</span> <span className="font-medium text-foreground/80">{item.client}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {item.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Hash className="h-3 w-3" />
                            {item.chassis}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">Técnico: <span className="text-foreground">{technician.name || item.technician}</span></p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 mt-2 sm:mt-0">
                      <p className="font-semibold text-sm text-foreground">{item.value}</p>
                      <Badge variant="secondary" className={`text-[10px] font-medium border-border/30 ${
                        item.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-muted text-muted-foreground'
                      }`}>{item.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-xs font-medium">Ver todo o histórico</Button>
            </CardContent>
          </Card>
        </div>

        <SheetFooter className="mt-8 pt-4 border-t border-border/40 flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2 font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
            <ShieldAlert className="h-4 w-4" />
            Desativar Técnico
          </Button>
          <div className="flex gap-3 w-full sm:w-auto">
            <SheetClose asChild>
              <Button variant="ghost" className="w-full sm:w-auto font-medium">Fechar</Button>
            </SheetClose>
            <Button className="w-full sm:w-auto font-medium">Salvar Alterações</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
