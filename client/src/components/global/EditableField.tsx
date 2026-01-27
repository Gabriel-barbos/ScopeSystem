import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


type EditableFieldProps = {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const EditableField = ({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <div className="space-y-2">
    <Label className="text-sm text-muted-foreground flex items-center gap-2">
      <Icon className="h-4 w-4" />
      {label}
    </Label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-[200px]"
    />
  </div>
);

export default EditableField;