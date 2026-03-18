import { useState } from 'react'
import { BookOpenCheck, Trash2, Eye } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { aiApi, type Knowledge, type Mode } from '../../services/aiService'

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'email', label: 'E-mail' },
  { value: 'acessos', label: 'Acessos' },
  { value: 'equipamento', label: 'Equipamento' },
  { value: 'plataforma', label: 'Plataforma' },
  { value: 'conhecimento', label: 'Conhecimento' },
]

function KnowledgeDetailDialog({ item, onClose }: { item: Knowledge; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState(item.content)
  const [saving, setSaving] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => aiApi.deleteKnowledge(item._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      onClose()
    },
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await aiApi.updateKnowledge(item._id, content)
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            Modo: <strong>{MODE_OPTIONS.find((m) => m.value === item.mode)?.label}</strong>
          </p>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-40"
          />
          <div className="flex justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Knowledge List ────────────────────────────────────────────────────────
function KnowledgeList({ filterMode }: { filterMode: Mode }) {
  const [selected, setSelected] = useState<Knowledge | null>(null)

  const { data = [], isLoading } = useQuery<Knowledge[]>({
    queryKey: ['knowledge', filterMode],
    queryFn: () => aiApi.fetchKnowledge(filterMode),
  })

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>
  if (!data.length) return <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>

  return (
    <>
      <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
        {data.map((item) => (
          <li
            key={item._id}
            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
          >
            <span className="truncate font-medium">{item.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 shrink-0 gap-1"
              onClick={() => setSelected(item)}
            >
              <Eye className="h-3.5 w-3.5" />
              Ver
            </Button>
          </li>
        ))}
      </ul>

      {selected && (
        <KnowledgeDetailDialog item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

// ─── Main Modal ────────────────────────────────────────────────────────────
export function KnowledgeModal() {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<Mode>('email')
  const [listMode, setListMode] = useState<Mode>('email')
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) return
    setSaving(true)
    try {
      await aiApi.saveKnowledge({ name, mode, content })
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      setName('')
      setContent('')
    } finally {
      setSaving(false)
    }
  }

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
          <DialogTitle>Base de Conhecimento</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="cadastrar">
          <TabsList className="w-full">
            <TabsTrigger value="cadastrar" className="flex-1">Cadastrar</TabsTrigger>
            <TabsTrigger value="registrados" className="flex-1">Registrados</TabsTrigger>
          </TabsList>

          {/* ── Cadastrar ── */}
          <TabsContent value="cadastrar" className="flex flex-col gap-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Nome</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Procedimento de reset"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Modo</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MODE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Conteúdo</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Descreva o conhecimento..."
                className="min-h-40"
              />
            </div>

            <Button onClick={handleSave} disabled={saving || !name.trim() || !content.trim()}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </TabsContent>

          {/* ── Registrados ── */}
          <TabsContent value="registrados" className="flex flex-col gap-3 pt-2">
            <div className="grid gap-1.5">
              <Label>Filtrar por modo</Label>
              <Select value={listMode} onValueChange={(v) => setListMode(v as Mode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <KnowledgeList filterMode={listMode} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}