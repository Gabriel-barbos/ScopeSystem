import { useState } from 'react'
import { BookOpenCheck  } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { aiApi } from '../../services/aiService'

export function KnowledgeModal() {
  const [mode, setMode] = useState('email')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      await aiApi.saveKnowledge({ mode, category: mode === 'duvidas' ? category : undefined, content })
      setContent('')
      setCategory('')
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Base de Conhecimento</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="cadastrar">
          <TabsList className="w-full">
            <TabsTrigger value="cadastrar" className="flex-1">Cadastrar</TabsTrigger>
            <TabsTrigger value="registrados" className="flex-1">Registrados</TabsTrigger>
          </TabsList>

          <TabsContent value="cadastrar" className="flex flex-col gap-4 pt-2">
            <div className="grid gap-1.5">
              <Label>Modo</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="acessos">Acessos</SelectItem>
                  <SelectItem value="duvidas">Dúvidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === 'duvidas' && (
              <div className="grid gap-1.5">
                <Label>Categoria</Label>
                <input
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Equipamento X"
                />
              </div>
            )}

            <div className="grid gap-1.5">
              <Label>Conteúdo</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Descreva o conhecimento..."
                className="min-h-32"
              />
            </div>

            <Button onClick={handleSave} disabled={saving || !content.trim()}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </TabsContent>

          <TabsContent value="registrados" className="pt-2">
            <p className="text-sm text-muted-foreground">
              {/* Lista de conhecimentos registrados — implementar com useQuery */}
              Em breve: listagem com edição e remoção.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}