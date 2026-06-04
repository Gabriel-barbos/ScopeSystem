import { ShieldUser, User, Mail, Phone, ChevronRight } from "lucide-react";
import type { Provider } from "@/services/ProviderService";
import { Badge } from "@/components/ui/badge";

type Props = {
  provider: Provider;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
};

export function ProviderCard({ provider, onClick }: Omit<Props, "onEdit" | "onDelete">) {
  return (
    <div
      className="group relative flex flex-col border border-muted bg-card hover:border-primary/45 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 cursor-pointer overflow-hidden rounded-xl h-full justify-between"
      onClick={onClick}
    >
      {/* Decorative accent top line */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary/40 via-primary/80 to-primary/40 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Main card body */}
      <div className="flex flex-col p-5 pt-6 flex-1">
        {/* Header section */}
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-muted-foreground/15 shadow-sm group-hover:border-primary/20 transition-colors duration-300">
            {provider.image ? (
              <img
                src={provider.image}
                alt={provider.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <ShieldUser className="h-7 w-7 text-muted-foreground/60" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-foreground leading-tight truncate group-hover:text-primary transition-colors duration-200" title={provider.name}>
              {provider.name}
            </h3>
            
            <div className="mt-1.5 flex items-center gap-2">
              <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-medium tracking-wide bg-primary/5 text-primary border border-primary/10 rounded-full">
                {provider.contacts.length > 0
                  ? `${provider.contacts.length} ${provider.contacts.length === 1 ? 'Contato' : 'Contatos'}`
                  : "Sem contatos"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="my-4 border-t border-dashed border-muted" />

        {/* Contacts section */}
        <div className="flex-1 space-y-2.5">
          {provider.contacts.length === 0 ? (
            <div className="flex items-center justify-center h-12 text-xs text-muted-foreground/60 border border-dashed rounded-lg bg-muted/10">
              Nenhum contato cadastrado
            </div>
          ) : (
            provider.contacts.slice(0, 2).map((contact) => (
              <div key={contact._id} className="space-y-1 bg-muted/20 border border-muted/50 rounded-lg p-2.5 hover:bg-muted/30 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                  <span className="text-xs font-medium text-foreground/80 truncate">
                    {contact.name}
                  </span>
                </div>
                
                {(contact.phone || contact.email) && (
                  <div className="flex flex-col gap-1 pl-5 text-[11px] text-muted-foreground">
                    {contact.phone && (
                      <span className="flex items-center gap-1.5 truncate">
                        <Phone className="h-3 w-3 opacity-70 shrink-0" />
                        {contact.phone}
                      </span>
                    )}
                    {contact.email && (
                      <span className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3 w-3 opacity-70 shrink-0" />
                        {contact.email}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {provider.contacts.length > 2 && (
            <p className="text-[11px] text-muted-foreground/60 text-right font-medium pr-1">
              + {provider.contacts.length - 2} mais...
            </p>
          )}
        </div>
      </div>

      {/* Footer bar */}
      <div className="px-5 py-3 bg-muted/10 border-t border-muted/50 flex items-center justify-end text-[10px] text-muted-foreground group-hover:text-primary transition-colors duration-300">
        <span className="uppercase font-bold tracking-wider flex items-center gap-1">
          Ver Detalhes
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
