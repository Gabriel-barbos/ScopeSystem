import * as XLSX from "xlsx";
import type { BulkValidationItem } from "@/services/ServiceService";

export interface ParsedRow extends BulkValidationItem {
  _line: number;
}

export function parseValidationSheet(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });

        resolve(
          rows.map((row, idx): ParsedRow => ({
            _line: idx + 2,
            vin: row["Chassi"]?.toString().trim() ?? "",
            validationData: {
              deviceId:             row["ID Dispositivo"]?.toString().trim()        ?? null,
              technician:           row["Técnico"]?.toString().trim()               ?? null,
              installationLocation: row["Local de Instalação"]?.toString().trim()   ?? null,
              plate:                row["Placa"]?.toString().trim()                 ?? null,
              product:              row["Produto"]?.toString().trim()               ?? null,
              odometer:             row["Odômetro"] != null ? Number(row["Odômetro"]) : null,
              blockingEnabled:      row["Bloqueio Ativo"]?.toString()               ?? null,
              protocolNumber:       row["Nº Protocolo"]?.toString().trim()          ?? null,
              validationNotes:      row["Notas de Validação"]?.toString().trim()    ?? null,
              secondaryDevice:      row["Dispositivo Secundário"]?.toString().trim() ?? null,
              validatedBy:          row["Validado por"]?.toString().trim()          ?? null,
              validatedAt:          (row["Data de Validação"] as string | Date | null) ?? null,
            },
          }))
        );
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function downloadValidationTemplate() {
  const headers = [
    "Chassi",
    "ID Dispositivo",
    "Técnico",
    "Local de Instalação",
    "Placa",
    "Produto",
    "Odômetro",
    "Bloqueio Ativo",
    "Nº Protocolo",
    "Notas de Validação",
    "Dispositivo Secundário",
    "Validado por",
    "Data de Validação",
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Validação");
  XLSX.writeFile(wb, "template_validacao_lote.xlsx");
}
