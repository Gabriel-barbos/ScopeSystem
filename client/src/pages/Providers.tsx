import { useState } from "react";
import { 
  ShieldUser, Plus, Search, MapPin, Building2, MoreVertical, 
  Edit2, Trash2, ExternalLink, Mail, Phone, Wrench, Filter
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TechnicianSheet } from "@/components/providers/TechnicianSheet";

// Mock Data para Técnicos
const mockTechnicians = [
  {
    id: 1,
    name: "Carlos Joaquim",
    initials: "CE",
    location: "São Paulo, SP",
    provider: "Unique Tech",
    installValue: "R$ 150,00",
    kmValue: "R$ 1,50",
    status: "Ativo",
    avatarColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
  },
  {
    id: 2,
    name: "Yuri Roberto",
    initials: "YR",
    location: "Aparecida, SP",
    provider: "Scope",
    installValue: "R$ 120,00",
    kmValue: "R$ 1,20",
    status: "Ativo",
    avatarColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
  },
  {
    id: 3,
    name: "Matheus Mendes",
    initials: "MM",
    location: "Itaquera, SP",
    provider: "ICOMON",
    installValue: "R$ 140,00",
    kmValue: "R$ 1,20",
    status: "Inativo",
    avatarColor: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
  },
  {
    id: 4,
    name: "João Pedro Santos",
    initials: "JP",
    location: "Curitiba, PR",
    provider: "MP",
    installValue: "R$ 160,00",
    kmValue: "R$ 1,80",
    status: "Ativo",
    avatarColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
  },
  {
    id: 5,
    name: "Max James",
    initials: "MJ",
    location: "Recife, PE",
    provider: "Unique Tech",
    installValue: "R$ 200,00",
    kmValue: "R$ 2,50",
    status: "Ativo",
    avatarColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
  }
];

// Mock Data para Prestadores
const mockProviders = [
  {
    id: 1,
    name: "Unique Tech",
    photo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop",
    techniciansCount: 42,
    location: "São Paulo, SP",
    email: "contato@techconnect.com.br",
    phone: "(11) 98765-4321"
  },
  {
    id: 2,
    name: "Scope",
    photo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop",
    techniciansCount: 83,
    location: "Aparecida, SP",
    email: "[EMAIL_ADDRESS]",
    phone: "(19) 99876-5432"
  },
  {
    id: 3,
    name: "Ronaldo instaladores",
    photo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop",
    techniciansCount: 7,
    location: "Belo Horizonte, MG",
    email: "[EMAIL_ADDRESS]",
    phone: "(31) 97654-3210"
  },
  {
    id: 4,
    name: "MP",
    photo: "https://images.unsplash.com/photo-1435575653489-b0873ec954e2?w=400&h=400&fit=crop",
    techniciansCount: 15,
    location: "Curitiba, PR",
    email: "contato@sultelecom.sul",
    phone: "(41) 98888-7777"
  }
];

export default function Providers() {
  const [activeTab, setActiveTab] = useState("tecnicos");
  const [selectedTech, setSelectedTech] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleOpenTech = (tech: any) => {
    setSelectedTech(tech);
    setIsSheetOpen(true);
  };

  return (
    <div className="w-full  mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-2 sm:p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 shadow-inner">
            <ShieldUser className="h-7 w-7 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              Prestadores
              <Badge variant="secondary" className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/25 transition-colors border-cyan-500/20">
                Protótipo
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Gerencie seus prestadores de serviço e técnicos de campo.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button className="w-full md:w-auto bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all hover:scale-[1.02]">
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === "tecnicos" ? "Cadastrar Técnico" : "Novo Prestador"}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <Tabs defaultValue="tecnicos" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="bg-muted/50 p-1 border shadow-sm h-12">
            <TabsTrigger value="tecnicos" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 h-10 rounded-md transition-all">
              <Wrench className="h-4 w-4 mr-2" />
              Técnicos
            </TabsTrigger>
            <TabsTrigger value="prestadores" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 h-10 rounded-md transition-all">
              <Building2 className="h-4 w-4 mr-2" />
              Prestadores
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={`Buscar ${activeTab === 'tecnicos' ? 'técnico' : 'prestador'}...`} 
                className="pl-9 h-10 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary/30 transition-all rounded-lg"
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 shadow-sm border-muted-foreground/20 rounded-lg">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Tab: Técnicos */}
        <TabsContent value="tecnicos" className="space-y-4 outline-none">
          <div className="rounded-xl border border-muted-foreground/15 bg-card shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-foreground h-12">Técnico</TableHead>
                    <TableHead className="font-semibold text-foreground h-12">Localização</TableHead>
                    <TableHead className="font-semibold text-foreground h-12">Prestador</TableHead>
                    <TableHead className="font-semibold text-foreground h-12 text-right">Valor Instalação</TableHead>
                    <TableHead className="font-semibold text-foreground h-12 text-right">Valor KM</TableHead>
                    <TableHead className="font-semibold text-foreground h-12 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTechnicians.map((tech) => (
                    <TableRow key={tech.id} className="hover:bg-muted/40 transition-colors group">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-11 w-11 border-2 border-background shadow-sm transition-transform group-hover:scale-105">
                            <AvatarFallback className={`font-medium ${tech.avatarColor}`}>
                              {tech.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground text-base">{tech.name}</span>
                            <Badge 
                              variant={tech.status === 'Ativo' ? 'default' : tech.status === 'Ocupado' ? 'secondary' : 'outline'} 
                              className={`w-fit text-[10px] uppercase font-bold h-4.5 px-1.5 mt-1 tracking-wider ${
                                tech.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400' : 
                                tech.status === 'Ocupado' ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400' : 
                                'text-muted-foreground'
                              }`}
                            >
                              {tech.status}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">{tech.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span className="text-sm font-medium text-foreground/80">{tech.provider}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md font-semibold text-sm border border-emerald-100 dark:border-emerald-900/30">
                          {tech.installValue}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center justify-center bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-md font-semibold text-sm border border-blue-100 dark:border-blue-900/30">
                          {tech.kmValue}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors rounded-lg">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground rounded-lg data-[state=open]:bg-muted">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 shadow-lg border-muted-foreground/15">
                              <DropdownMenuLabel className="font-semibold">Opções do Técnico</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenTech(tech)}>Ver Perfil Completo</DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">Histórico de Serviços</DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">Atribuir OS</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer">
                                Desativar Técnico
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Prestadores */}
        <TabsContent value="prestadores" className="outline-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {mockProviders.map((provider) => (
              <Card key={provider.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-muted/60 hover:border-primary/30 flex flex-col items-center p-6 text-center bg-card/60 backdrop-blur-sm">
                <Avatar className="h-24 w-24 mb-4 shadow-sm border-2 border-muted transition-transform duration-300 group-hover:scale-105">
                  <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                    {provider.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                  <AvatarImage src={provider.photo} className="object-cover" />
                </Avatar>
                
                <CardTitle className="text-xl font-bold line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                  {provider.name}
                </CardTitle>
                
                <Badge variant="secondary" className="mb-6 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors px-3 py-1 text-sm">
                  {provider.techniciansCount} Técnicos
                </Badge>
                
                <Button 
                  className="w-full mt-auto group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 rounded-lg font-semibold shadow-sm hover:shadow-md" 
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <TechnicianSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        technician={selectedTech} 
      />
    </div>
  );
}
