import { UserSearch } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Technicians() {
  return (
    <Card className="mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <UserSearch className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-2xl">Técnicos</CardTitle>
            <CardDescription>Monitor and manage technician information</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">Técnicos content will be displayed here</p>
        </div>
      </CardContent>
    </Card>
  );
}
