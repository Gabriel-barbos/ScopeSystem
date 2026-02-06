import { BadgeMinus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Removal() {
  return (
    <Card className="mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <BadgeMinus  className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-2xl">Remoção</CardTitle>
            <CardDescription>Contabilizar Remoções</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
            
      </CardContent>
    </Card>
  );
}
