import { Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Stock() {
  return (
    <Card className="mx-auto max-w-5xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-2xl">Stock</CardTitle>
            <CardDescription>Monitor and manage inventory levels</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">Stock content will be displayed here</p>
        </div>
      </CardContent>
    </Card>
  );
}
