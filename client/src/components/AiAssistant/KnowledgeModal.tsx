import { useState } from 'react'
import { BookOpenCheck, Trash2, Eye, Plus, Search, Brain } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { aiApi, type Knowledge, type Mode } from '../../services/aiService'


const MODE_OPTIONS: { value: Mode; label: string; color: string }[] = [
  { value: 'email',        label: 'E-mail',        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { value: 'acessos',      label: 'Acessos',       color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  { value: 'equipamento',  label: 'Equipamento',   color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
  { value: 'plataforma',   label: 'Plataforma',    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800' },
  { value: 'conhecimento', label: 'Conhecimento',  color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
]

function getModeOption(value: Mode) {
  return MODE_OPTIONS.find((m) => m.value === value)
}


function ModeBadge({ mode }: { mode: Mode }) {
  const opt = getModeOption(mode)
  if (!opt) return null
  return (
    <Badge variant="outline" className={`text-xs font-medium ${opt.color}`}>
      {opt.label}
    </Badge>
  )
}



function KnowledgeDetailDialog({ item, onClose }: { item: Knowledge; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState(item.content)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const updateMutation = useMutation({
    mutationFn: () => aiApi.updateKnowledge(item._id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      toast.success('Conhecimento atualizado!')
      onClose()
    },
    onError: () => toast.error('Erro ao atualizar conhecimento.'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => aiApi.deleteKnowledge(item._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      toast.success('Conhecimento removido.')
      onClose()
    },
    onError: () => toast.error('Erro ao remover conhecimento.'),
  })

  const isDirty = content !== item.content

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              {item.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Modo:</span>
              <ModeBadge mode={item.mode} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Conteúdo</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-48 resize-none text-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remover
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateMutation.mutate()}
                  disabled={!isDirty || updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de deleção separada do Dialog principal */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover conhecimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>"{item.name}"</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── KnowledgeList ───────────────────────────────────────────────────────────

function KnowledgeList() {
  const [selected, setSelected] = useState<Knowledge | null>(null)
  const [filterMode, setFilterMode] = useState<Mode | 'all'>('all')
  const [search, setSearch] = useState('')

  const { data = [], isLoading } = useQuery<Knowledge[]>({
    queryKey: ['knowledge', 'all'],
    queryFn: () => aiApi.fetchAllKnowledge(),
  })

  const filtered = data.filter((item) => {
    const matchMode = filterMode === 'all' || item.mode === filterMode
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchMode && matchSearch
  })

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Select value={filterMode} onValueChange={(v) => setFilterMode(v as Mode | 'all')}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue placeholder="Todos os modos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {MODE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contagem */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'} encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          Carregando...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
          <Brain className="h-8 w-8 opacity-30" />
          <p className="text-sm">Nenhum registro encontrado</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1">
          {filtered.map((item) => (
            <li
              key={item._id}
              className="flex items-center justify-between rounded-lg border bg-card px-3 py-2.5 text-sm hover:bg-accent/40 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <ModeBadge mode={item.mode} />
                <span className="truncate font-medium text-sm">{item.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 shrink-0 h-7 gap-1 text-xs"
                onClick={() => setSelected(item)}
              >
                <Eye className="h-3 w-3" />
                Ver
              </Button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <KnowledgeDetailDialog item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

// ─── KnowledgeCreate ─────────────────────────────────────────────────────────
// Formulário de criação. Captura o erro 409 do backend e exibe toast claro.

function KnowledgeCreate() {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<Mode>('email')
  const [name, setName] = useState('')
  const [content, setContent] = useState('')

  const createMutation = useMutation({
    mutationFn: () => aiApi.saveKnowledge({ name: name.trim(), mode, content: content.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      toast.success('Conhecimento salvo com sucesso!')
      setName('')
      setContent('')
    },
    onError: (err: any) => {
      // O backend retorna 409 quando o nome já existe (name é unique no schema)
      const msg = err?.response?.data?.error
      if (err?.response?.status === 409) {
        toast.error('Já existe um registro com esse nome. Use um nome diferente.')
      } else {
        toast.error(msg ?? 'Erro ao salvar conhecimento.')
      }
    },
  })

  const canSubmit = name.trim().length > 0 && content.trim().length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nome *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Procedimento de reset"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Modo *</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Conteúdo *</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Descreva o conhecimento que a IA deve aprender..."
          className="min-h-52 resize-none text-sm"
        />
        <p className="text-xs text-muted-foreground text-right">{content.length} caracteres</p>
      </div>

      <Button
        onClick={() => createMutation.mutate()}
        disabled={!canSubmit || createMutation.isPending}
        className="gap-1.5"
      >
        <Plus className="h-4 w-4" />
        {createMutation.isPending ? 'Salvando...' : 'Salvar conhecimento'}
      </Button>
    </div>
  )
}

// ─── KnowledgeModal ───────────────────────────────────────────────────────────
// Modal principal. Dois sub-componentes controlam as abas.

export function KnowledgeModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <BookOpenCheck className="h-4 w-4" />
          Ensinar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Base de Conhecimento
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <Tabs defaultValue="cadastrar" className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="cadastrar" className="flex-1 gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Cadastrar
            </TabsTrigger>
            <TabsTrigger value="registrados" className="flex-1 gap-1.5">
              <BookOpenCheck className="h-3.5 w-3.5" />
              Registrados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cadastrar" className="pt-4">
            <KnowledgeCreate />
          </TabsContent>

          <TabsContent value="registrados" className="pt-4 flex flex-col gap-3">
            <KnowledgeList />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}