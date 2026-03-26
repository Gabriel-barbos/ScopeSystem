export function buildEmailHtml(nome: string, login: string, senha: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:#eef1f6;font-family:Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef1f6;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table width="580" cellpadding="0" cellspacing="0" border="0"
          style="max-width:580px;background:#ffffff;border-radius:10px;overflow:hidden;
                 box-shadow:0 4px 16px rgba(0,0,0,0.10);">

          <!-- ═══ HEADER BAND (topo azul escuro) ═══ -->
          <tr>
            <td style="background:#0f2d5e;padding:0;line-height:0;font-size:0;" height="6">
              <!-- accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" style="background:#0f2d5e;height:6px;font-size:0;line-height:0;">&nbsp;</td>
                  <td width="34%" style="background:#2e7df7;height:6px;font-size:0;line-height:0;">&nbsp;</td>
                  <td width="33%" style="background:#0f2d5e;height:6px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ HEADER CONTENT ═══ -->
          <tr>
            <td style="background:#0f2d5e;padding:36px 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- "M" monogram badge simulado por tabela -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                      <tr>
                        <td style="background:#2e7df7;border-radius:10px;width:48px;height:48px;
                                   text-align:center;vertical-align:middle;">
                          <span style="color:#ffffff;font-size:22px;font-weight:700;
                                       font-family:Arial,sans-serif;letter-spacing:-1px;">Mzone</span>
                        </td>
                      </tr>
                    </table>

                    <h1 style="margin:0 0 8px;color:#ffffff;font-size:22px;
                               font-weight:700;font-family:Arial,sans-serif;line-height:1.3;">
                      Bem-vindo(a) à plataforma
                    </h1>
                    <h1 style="margin:0;color:#7eb8ff;font-size:22px;
                               font-weight:700;font-family:Arial,sans-serif;line-height:1.3;">
                      Mzone X
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ BODY ═══ -->
          <tr>
            <td style="padding:36px 40px 0;">

              <p style="margin:0 0 6px;color:#0f2d5e;font-size:17px;
                         font-weight:700;font-family:Arial,sans-serif;">
                Olá, ${nome}!
              </p>
              <p style="margin:0 0 28px;color:#555555;font-size:14px;
                         line-height:1.6;font-family:Arial,sans-serif;">
                Sua conta na plataforma <strong style="color:#0f2d5e;">Mzone X</strong>
                foi criada com sucesso. Guarde suas credenciais abaixo em local seguro.
              </p>

              <!-- ── Credenciais card ── -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#f4f8ff;border-radius:8px;
                       border-left:4px solid #2e7df7;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px 0;">
                    <p style="margin:0 0 16px;color:#0f2d5e;font-size:11px;
                               font-weight:700;font-family:Arial,sans-serif;
                               text-transform:uppercase;letter-spacing:1px;">
                      &#128274;&nbsp; Dados de Acesso
                    </p>
                  </td>
                </tr>

                <!-- Usuário -->
                <tr>
                  <td style="padding:0 24px 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="background:#ffffff;border-radius:6px;
                             border:1px solid #d6e4ff;">
                      <tr>
                        <td style="padding:14px 18px;">
                          <span style="display:block;color:#8a9ab5;font-size:11px;
                                       font-family:Arial,sans-serif;text-transform:uppercase;
                                       letter-spacing:.8px;margin-bottom:5px;">
                            Usuário
                          </span>
                          <span style="color:#0f2d5e;font-size:15px;
                                       font-weight:700;font-family:Arial,sans-serif;">
                            ${nome}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Login -->
                <tr>
                  <td style="padding:0 24px 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="background:#ffffff;border-radius:6px;
                             border:1px solid #d6e4ff;">
                      <tr>
                        <td style="padding:14px 18px;">
                          <span style="display:block;color:#8a9ab5;font-size:11px;
                                       font-family:Arial,sans-serif;text-transform:uppercase;
                                       letter-spacing:.8px;margin-bottom:5px;">
                            Login
                          </span>
                          <span style="color:#0f2d5e;font-size:15px;font-weight:700;
                                       font-family:Courier New,Courier,monospace;">
                            ${login}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Senha -->
                <tr>
                  <td style="padding:0 24px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="background:#ffffff;border-radius:6px;
                             border:1px solid #d6e4ff;">
                      <tr>
                        <td style="padding:14px 18px;">
                          <span style="display:block;color:#8a9ab5;font-size:11px;
                                       font-family:Arial,sans-serif;text-transform:uppercase;
                                       letter-spacing:.8px;margin-bottom:5px;">
                            Senha Provisória
                          </span>
                          <span style="color:#0f2d5e;font-size:15px;font-weight:700;
                                       font-family:Courier New,Courier,monospace;">
                            ${senha}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ── Aviso de segurança ── -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#fffbeb;border-radius:6px;
                       border:1px solid #f5d87a;margin-bottom:28px;">
                <tr>
                  <td style="padding:12px 16px;">
                    <p style="margin:0;color:#7a5c00;font-size:12px;
                               line-height:1.6;font-family:Arial,sans-serif;">
                      <strong>&#9888;&nbsp;Recomendação de segurança:</strong>
                      Altere sua senha no primeiro acesso. Nunca compartilhe
                      suas credenciais com terceiros.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- ── Botão Acessar ── -->
              <p style="margin:0 0 10px;color:#333333;font-size:14px;
                         font-family:Arial,sans-serif;">
                Acesse a plataforma pelo botão abaixo:
              </p>
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#2e7df7;border-radius:6px;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
                      href="https://live.mzoneweb.net/mzonex/"
                      style="height:44px;v-text-anchor:middle;width:200px;"
                      arcsize="10%" fillcolor="#2e7df7" strokecolor="#2e7df7">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:Arial,sans-serif;
                                     font-size:14px;font-weight:700;">
                        Acessar Mzone X →
                      </center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="https://live.mzoneweb.net/mzonex/"
                      style="display:inline-block;background:#2e7df7;color:#ffffff;
                             padding:13px 28px;border-radius:6px;text-decoration:none;
                             font-size:14px;font-weight:700;font-family:Arial,sans-serif;
                             letter-spacing:.3px;">
                      Acessar Mzone X &rarr;
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- ── Divider ── -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin-bottom:24px;">
                <tr>
                  <td style="border-top:1px solid #e8ecf2;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- ── Treinamento ── -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin-bottom:32px;">
                <tr>
                  <td valign="top" width="32"
                    style="padding-top:2px;font-size:18px;line-height:1;">
                    &#127916;
                  </td>
                  <td>
                    <p style="margin:0 0 4px;color:#0f2d5e;font-size:14px;
                               font-weight:700;font-family:Arial,sans-serif;">
                      Treinamento da plataforma
                    </p>
                    <p style="margin:0 0 6px;color:#555555;font-size:13px;
                               font-family:Arial,sans-serif;line-height:1.5;">
                      Assista ao vídeo e aproveite ao máximo todos os recursos:
                    </p>
                    <a href="https://youtu.be/q_JXfKN8LVI"
                      style="color:#2e7df7;font-size:13px;
                             font-family:Arial,sans-serif;text-decoration:underline;">
                      https://youtu.be/q_JXfKN8LVI
                    </a>
                  </td>
                </tr>
              </table>

              <!-- ── Assinatura ── -->
              <p style="margin:0 0 36px;color:#777777;font-size:13px;
                         line-height:1.6;font-family:Arial,sans-serif;">
                Em caso de dúvidas, entre em contato com nosso suporte.<br/>
                Atenciosamente,<br/>
                <strong style="color:#0f2d5e;">Equipe Mzone</strong>
              </p>

            </td>
          </tr>

          <!-- ═══ FOOTER ═══ -->
          <tr>
            <td style="background:#f4f6fb;padding:20px 40px;
                       border-top:1px solid #e4e9f2;border-radius:0 0 10px 10px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;color:#aaaaaa;font-size:11px;
                               font-family:Arial,sans-serif;text-align:center;">
                      &copy; 2026 Mzone &middot; Todos os direitos reservados
                    </p>
                    <p style="margin:0;color:#bbbbbb;font-size:11px;
                               font-family:Arial,sans-serif;text-align:center;">
                      Este é um e-mail automático, por favor não responda diretamente.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
  <!-- /Wrapper -->

</body>
</html>`.trim()
}

export function downloadEml(nome: string, login: string, senha: string): void {
  const html = buildEmailHtml(nome, login, senha)
  const subject = 'Bem-vindo(a) à plataforma Mzone X — Seus dados de acesso'

  const eml = [
    'MIME-Version: 1.0',
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: quoted-printable',
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