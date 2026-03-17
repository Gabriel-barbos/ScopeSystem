
export function buildEmailHtml(nome: string, login: string, senha: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1a3c6e;padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">
                Bem-vindo(a) à plataforma Mzone X
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#333;font-size:15px;">Prezado(a), bom dia!</p>
              <p style="margin:0 0 24px;color:#333;font-size:15px;">
                Seus dados de acesso à plataforma <strong>Mzone X</strong> foram criados com sucesso.
                Abaixo estão suas credenciais:
              </p>

              <!-- Credenciais -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f8f9fa;border-radius:6px;border:1px solid #e0e0e0;margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e0e0e0;">
                    <span style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Usuário</span><br/>
                    <strong style="color:#1a3c6e;font-size:15px;">${nome}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e0e0e0;">
                    <span style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Login</span><br/>
                    <strong style="color:#1a3c6e;font-size:15px;font-family:monospace;">${login}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;">
                    <span style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">Senha</span><br/>
                    <strong style="color:#1a3c6e;font-size:15px;font-family:monospace;">${senha}</strong>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <p style="margin:0 0 16px;color:#333;font-size:15px;">
                Acesse a plataforma pelo link abaixo:
              </p>
              <p style="margin:0 0 24px;">
                <a href="https://live.mzoneweb.net/mzonex/"
                  style="display:inline-block;background:#1a3c6e;color:#fff;padding:12px 24px;
                  border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
                  Acessar Mzone X
                </a>
              </p>

              <!-- Treinamento -->
              <p style="margin:0 0 8px;color:#333;font-size:15px;">
                Para conhecer melhor a plataforma, acesse nosso treinamento:
              </p>
              <p style="margin:0 0 24px;">
                <a href="https://youtu.be/q_JXfKN8LVI"
                  style="color:#1a3c6e;font-size:14px;text-decoration:underline;">
                  https://youtu.be/q_JXfKN8LVI
                </a>
              </p>

              <p style="margin:0;color:#555;font-size:14px;">
                Em caso de dúvidas, entre em contato com o suporte.<br/>
                Atenciosamente, <strong>Equipe Mzone</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0f0f0;padding:16px 32px;text-align:center;">
              <p style="margin:0;color:#999;font-size:12px;">
                © 2026 Mzone · Todos os direitos reservados
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

export function downloadEml(nome: string, login: string, senha: string): void {
  const html = buildEmailHtml(nome, login, senha)
  const subject = 'Bem-vindo(a) à plataforma Mzone X — Seus dados de acesso'

  const eml = [
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ].join('\r\n')

  const blob = new Blob([eml], { type: 'message/rfc822' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `boas-vindas-${login}.eml`
  a.click()

  URL.revokeObjectURL(url)
}

export async function copyAsRichText(html: string): Promise<void> {
  const blob = new Blob([html], { type: 'text/html' })
  const item = new ClipboardItem({ 'text/html': blob })
  await navigator.clipboard.write([item])
}