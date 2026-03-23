import DOMPurify from "dompurify";

interface ThreadMessage {
  direction: "IN" | "OUT";
  author: { name: string; email: string; type: string };
  content: string;
}

function parseThreadDescription(description: string): ThreadMessage[] | null {
  const normalized = description.replace(/\\n/g, "\n");

  if (!normalized.includes("--- IN |") && !normalized.includes("--- OUT |")) {
    return null;
  }

  const messages: ThreadMessage[] = [];
  const blocks = normalized.split(/(?=--- (?:IN|OUT) \| )/);

  for (const block of blocks) {
    const match = block.match(/^--- (IN|OUT) \| (\{[\s\S]*?\}) ---\n([\s\S]*)$/);
    if (!match) continue;

    const direction = match[1] as "IN" | "OUT";
    const authorJson = match[2];
    const content = match[3].trim();

    let author = { name: "Desconhecido", email: "", type: "" };
    try {
      const parsed = JSON.parse(authorJson);
      author = {
        name: parsed.name || "Desconhecido",
        email: parsed.email || "",
        type: parsed.type || "",
      };
    } catch {
      // fallback
    }

    messages.push({ direction, author, content });
  }

  return messages.length > 0 ? messages : null;
}

const ALLOWED_TAGS = [
  "div", "p", "span", "br", "strong", "em", "b", "i", "u",
  "blockquote", "table", "thead", "tbody", "tr", "td", "th",
  "ul", "ol", "li", "a", "h1", "h2", "h3", "h4", "h5", "h6",
];
const ALLOWED_ATTR = ["style", "class", "href", "target", "rel", "title", "spellcheck"];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function EmailThread({ description }: { description: string }) {
  const messages = parseThreadDescription(description);

  if (!messages) {
    const sanitized = DOMPurify.sanitize(description, { ALLOWED_TAGS, ALLOWED_ATTR });
    return <div className="email-content" dangerouslySetInnerHTML={{ __html: sanitized }} />;
  }

  return (
    <div className="flex flex-col gap-3 py-1">
      {messages.map((msg, i) => {
        const isSupport = msg.direction === "OUT";
        const sanitized = DOMPurify.sanitize(msg.content, { ALLOWED_TAGS, ALLOWED_ATTR });
        const initials = getInitials(msg.author.name);

        return (
          <div key={i} className={`flex gap-3 ${isSupport ? "flex-row-reverse" : "flex-row"}`}>

            {/* Avatar */}
            <div
              className={`
                flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold mt-0.5
                ${isSupport
                  ? "bg-primary/10 text-primary ring-1 ring-primary/25"
                  : "bg-muted text-muted-foreground ring-1 ring-border"
                }
              `}
            >
              {initials}
            </div>

            {/* Conteúdo */}
            <div className={`flex flex-col gap-1 min-w-0 max-w-[82%] ${isSupport ? "items-end" : "items-start"}`}>

              {/* Header */}
              <div className={`flex items-center gap-1.5 text-xs ${isSupport ? "flex-row-reverse" : "flex-row"}`}>
                <span className="font-medium text-foreground">{msg.author.name}</span>
                {isSupport && (
                  <span className="px-1.5 py-px rounded-sm bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wide border border-primary/20">
                    Suporte
                  </span>
                )}
                {msg.author.email && (
                  <span className="text-muted-foreground text-[11px] hidden sm:inline truncate">
                    {msg.author.email}
                  </span>
                )}
              </div>

              {/* Balão */}
              <div
                className={`
                  w-full rounded-xl px-4 py-3 text-sm leading-relaxed
                  ${isSupport
                    ? "bg-primary/5 border border-primary/15 rounded-tr-sm"
                    : "bg-muted/50 border border-border rounded-tl-sm"
                  }
                `}
              >
                {sanitized ? (
                  <div
                    className="email-content"
                    dangerouslySetInnerHTML={{ __html: sanitized }}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground italic">Sem conteúdo</p>
                )}
              </div>

            </div>
          </div>
        );
      })}

      <style>{`
        .email-content img { max-width: 100%; height: auto; border-radius: 6px; margin-top: 6px; }
        .email-content p { margin: 0 0 4px 0; }
        .email-content div { margin: 0; }
      `}</style>
    </div>
  );
}