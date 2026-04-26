import * as XLSX from "xlsx";
import type { BulkValidationItem } from "@/services/ServiceService";
import { cleanString, normalizeVin, normalizePlate } from "@/utils/importHelpers";
import { parseExcelDate } from "@/utils/Exceldateutils";

export interface ParsedRow extends BulkValidationItem {
  _line: number;
}

/** Normaliza valores booleanos de planilha (Sim/Não/S/N/Yes/No/1/0) */
function parseSheetBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value;
  const s = String(value).trim().toLowerCase();
  if (["sim", "s", "true", "1", "yes", "y"].includes(s)) return true;
  if (["não", "nao", "n", "false", "0", "no"].includes(s)) return false;
  return null;
}

/** Normaliza odômetro: remove "km", pontos de milhar, troca vírgula por ponto */
function parseOdometer(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  const cleaned = String(value)
    .replace(/\s*(km|KM|Km)\s*$/i, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  const num = Number(cleaned);
  return isNaN(num) ? null : num;
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
            vin: normalizeVin(row["Chassi"]),
            validationData: {
              deviceId:             cleanString(row["ID Dispositivo"])             || null,
              technician:           cleanString(row["Técnico"])                    || null,
              installationLocation: cleanString(row["Local de Instalação"])        || null,
              plate:                normalizePlate(row["Placa"])                   || null,
              product:              cleanString(row["Produto"])                    || null,
              odometer:             parseOdometer(row["Odômetro"]),
              blockingEnabled:      parseSheetBoolean(row["Bloqueio Ativo"]),
              protocolNumber:       cleanString(row["Nº Protocolo"])              || null,
              validationNotes:      cleanString(row["Notas de Validação"])         || null,
              secondaryDevice:      cleanString(row["Dispositivo Secundário"])     || null,
              validatedBy:          cleanString(row["Validado por"])               || null,
              validatedAt:          parseExcelDate(row["Data de Validação"])       ?? null,
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
