import { useToast } from "@/hooks/use-toast";
import {
  Toast, ToastClose, ToastDescription,
  ToastProvider, ToastTitle, ToastViewport,
} from "@/components/ui/toast";

export function ToasterBottomLeft() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport
        style={{
          position: 'fixed',
          bottom: '1rem',
          left: '1rem',
          right: 'auto',
          top: 'auto',
          zIndex: 9999,
          width: 420,
          maxWidth: '100vw',
        }}
      />
    </ToastProvider>
  );
}