import { useState } from "react"
import { useForm } from "react-hook-form"
import { ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useResellerUnitsMutations } from "@/services/ResellerUnits"
import { useAuth } from "@/context/Authcontext"


interface FormValues {
  unit_number: string
  old_reseller: string
  new_reseller: string
}

interface ChangeResellerModalProps {
  unitNumber?: string
  /** Modo controlado: abre/fecha externamente sem precisar do trigger interno */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}


export function ChangeResellerModal({ unitNumber, open: openProp, onOpenChange }: ChangeResellerModalProps) {
  const { user } = useAuth()
  const { createOne } = useResellerUnitsMutations()
  // modo autônomo: gerencia o próprio estado; modo controlado: usa o prop
  const isControlled = openProp !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const open = isControlled ? openProp! : internalOpen
  const setOpen = isControlled
    ? (val: boolean) => onOpenChange?.(val)
    : setInternalOpen

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      unit_number: unitNumber ?? "",
      old_reseller: "",
      new_reseller: "",
    },
  })


  function onSubmit(values: FormValues) {
    createOne.mutate(
      { ...values, askedBy: user?.name ?? "" },
      {
        onSuccess: () => {
          toast.success("Solicitação de troca de reseller enviada com sucesso!")
          reset()
          setOpen(false)
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Ocorreu um erro inesperado.")
        },
      }
    )
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline">Solicitar Troca de Reseller</Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Troca de Reseller</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para solicitar a troca de reseller.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => { e.stopPropagation(); handleSubmit(onSubmit)(e); }}
          className="flex flex-col gap-6 py-2"
        >

          {/* ID em destaque */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="unit_number" className="text-sm font-semibold">
              ID da Unidade
            </Label>
            <Input
              id="unit_number"
              placeholder="Digite o ID do dispositivo"
              disabled={!!unitNumber}
              className={!!unitNumber ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
              {...register("unit_number", { required: "ID obrigatório" })}
            />
            {errors.unit_number && (
              <p className="text-xs text-destructive">{errors.unit_number.message}</p>
            )}
            {!!unitNumber && (
              <p className="text-xs text-muted-foreground">
                ID definido automaticamente.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold">Troca de Reseller</Label>
            <div className="flex items-center gap-3">

              <div className="flex flex-1 flex-col gap-1">
                <span className="text-xs text-muted-foreground">Antigo</span>
                <Input
                  id="old_reseller"
                  placeholder="Reseller atual"
                  {...register("old_reseller", { required: "Obrigatório" })}
                />
                {errors.old_reseller && (
                  <p className="text-xs text-destructive">{errors.old_reseller.message}</p>
                )}
              </div>

              <ArrowRight className="mt-4 shrink-0 text-muted-foreground" size={18} />

              <div className="flex flex-1 flex-col gap-1">
                <span className="text-xs text-muted-foreground">Novo</span>
                <Input
                  id="new_reseller"
                  placeholder="Reseller novo"
                  {...register("new_reseller", { required: "Obrigatório" })}
                />
                {errors.new_reseller && (
                  <p className="text-xs text-destructive">{errors.new_reseller.message}</p>
                )}
              </div>

            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={createOne.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createOne.isPending} className="w-full sm:w-auto">
              {createOne.isPending
                ? <><Loader2 className="mr-2 size-4 animate-spin" /> Enviando...</>
                : "ENVIAR"
              }
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  )
}