import type { Mode } from '../../services/aiService'

const descriptions: Record<Mode, { title: string; description: string }> = {
  email: {
    title: 'Responder e-mails',
    description:
      'Cole o e-mail do cliente e descreva a solução. A IA elabora uma resposta profissional pronta para envio.',
  },
  acessos: {
    title: 'Criar acessos',
    description:
      'Informe o e-mail do novo usuário. A IA gera as instruções de criação de credenciais conforme o padrão da empresa.',
  },
  duvidas: {
    title: 'Dúvidas técnicas',
    description:
      'Selecione a categoria e faça sua pergunta. A IA responde com base no conhecimento registrado.',
  },
}

interface WelcomeScreenProps {
  mode: Mode
}

export function WelcomeScreen({ mode }: WelcomeScreenProps) {
  const { title, description } = descriptions[mode]

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  )
}