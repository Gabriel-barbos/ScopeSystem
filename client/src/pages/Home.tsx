import { Megaphone , Plus, MegaphoneOff, Share2  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {  Tag } from 'antd';
import PlatformCardGrid from "@/components/home/PlataformCardGrid";


export default function Home() {
  return (
    <div className="mx-auto flex  flex-col gap-6">

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
           <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                 <Megaphone className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
                    <div>
                        <CardTitle className="text-2xl">Avisos <Tag color='cyan'> Em desenvolvimento</Tag> </CardTitle>
                    </div>
                </div>  
            </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Criar aviso
          </Button>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Links úteis */}
      <Card>
    <CardHeader>
        <div className="flex items-center gap-2">
    <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Share2 className="h-6 w-6 text-primary" aria-hidden="true" />
             </div>
                <div>
                    <CardTitle className="text-xl">Links úteis <Tag color='cyan'> Em desenvolvimento</Tag></CardTitle>
                </div>
            </div>  
        </div>        
    </CardHeader>
        <CardContent>
                  <PlatformCardGrid />


          
        </CardContent>
      </Card>

    </div>
  );
}