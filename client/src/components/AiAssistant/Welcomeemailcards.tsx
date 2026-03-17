
import { useState, useCallback } from 'react'
import { Download, ClipboardCopy, Check, Mail } from 'lucide-react'
import { buildEmailHtml, downloadEml, copyAsRichText } from '@/utils/Emailutils'

export interface EmailData {
  nome: string
  login: string
  senha: string
}

interface Props {
  emails: EmailData[]
}


interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  successLabel: string
  onClick: () => Promise<void> | void
}

function ActionButton({ icon, label, successLabel, onClick }: ActionButtonProps) {
  const [done, setDone] = useState(false)

  const handleClick = useCallback(async () => {
    await onClick()
    setDone(true)
    setTimeout(() => setDone(false), 2000)
  }, [onClick])

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '6px',
        border: '1px solid hsl(var(--border))',
        background: done ? 'hsl(var(--accent))' : 'hsl(var(--card))',
        color: done ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      {done ? <Check size={13} /> : icon}
      {done ? successLabel : label}
    </button>
  )
}


function EmailCard({ data }: { data: EmailData }) {
  const { nome, login, senha } = data

  const handleDownload = useCallback(() => downloadEml(nome, login, senha), [nome, login, senha])
  const handleCopy = useCallback(
    () => copyAsRichText(buildEmailHtml(nome, login, senha)),
    [nome, login, senha]
  )

  return (
    <div
      style={{
        borderRadius: '10px',
        border: '1px solid hsl(var(--border))',
        background: 'hsl(var(--card))',
        overflow: 'hidden',
      }}
    >
      {/* Header do card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          background: 'hsl(var(--muted))',
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        <Mail size={14} style={{ color: 'hsl(var(--primary))', flexShrink: 0 }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
          {nome}
        </span>
      </div>

      {/* Credenciais */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <CredentialRow label="Login" value={login} mono />
        <CredentialRow label="Senha" value={senha} mono />
      </div>

      {/* Ações */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '10px 14px',
          borderTop: '1px solid hsl(var(--border))',
          flexWrap: 'wrap',
        }}
      >
        <ActionButton
          icon={<Download size={13} />}
          label="Baixar .eml"
          successLabel="Baixando..."
          onClick={handleDownload}
        />
        <ActionButton
          icon={<ClipboardCopy size={13} />}
          label="Copiar para Outlook"
          successLabel="Copiado!"
          onClick={handleCopy}
        />
      </div>
    </div>
  )
}


function CredentialRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
      <span
        style={{
          minWidth: '38px',
          color: 'hsl(var(--muted-foreground))',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: 'hsl(var(--foreground))',
          fontFamily: mono ? '"Geist Mono", "Fira Code", ui-monospace, monospace' : 'inherit',
          fontSize: mono ? '12.5px' : '13px',
        }}
      >
        {value}
      </span>
    </div>
  )
}


export function WelcomeEmailCards({ emails }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
      <span
        style={{
          fontSize: '12px',
          color: 'hsl(var(--muted-foreground))',
          marginBottom: '2px',
        }}
      >
        {emails.length === 1
          ? '1 e-mail de boas-vindas gerado'
          : `${emails.length} e-mails de boas-vindas gerados`}
      </span>

      {emails.map((email, i) => (
        <EmailCard key={`${email.login}-${i}`} data={email} />
      ))}
    </div>
  )
}