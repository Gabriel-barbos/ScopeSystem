
type InfoFieldProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
};
const InfoField = ({ icon: Icon, label, value }: InfoFieldProps) => (
  <div className="flex items-center gap-3">
    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
    <div className="min-w-0">
      <span className="text-sm text-muted-foreground block">{label}</span>
      <p className="font-medium truncate">{value}</p>
    </div>
  </div>
);

export default InfoField;