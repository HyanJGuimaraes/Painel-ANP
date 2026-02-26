export interface FuelRecord {
  estado: string;
  municipio?: string;
  datas: string;
  etanol: number;
  gasolina: number;
  difNom: number;
  paridade: number;
  etanol_min?: number;
  etanol_max?: number;
  gasolina_min?: number;
  gasolina_max?: number;
  headroom?: number;
  demand_signal?: string;
}

export function calculateRecord(estado: string, datas: string, etanol: number, gasolina: number): FuelRecord {
  return {
    estado,
    datas,
    etanol,
    gasolina,
    difNom: parseFloat((gasolina - etanol).toFixed(2)),
    paridade: parseFloat(((etanol / gasolina) * 100).toFixed(2)),
    headroom: parseFloat(((gasolina * 0.70) - etanol).toFixed(2)),
    demand_signal: ((etanol / gasolina) * 100) < 66 ? "STRONG" : ((etanol / gasolina) * 100) > 70 ? "WEAK" : "NEUTRAL"
  };
}

export const sampleData: FuelRecord[] = [
  calculateRecord("GOIÁS", "03/11/2024 - 09/11/2024", 4.10, 6.12),
  calculateRecord("MATO GROSSO", "03/11/2024 - 09/11/2024", 3.70, 6.06),
  calculateRecord("MINAS GERAIS", "03/11/2024 - 09/11/2024", 4.20, 6.12),
  calculateRecord("SÃO PAULO", "03/11/2024 - 09/11/2024", 3.86, 5.92),

  calculateRecord("GOIÁS", "10/11/2024 - 16/11/2024", 4.38, 6.14),
  calculateRecord("MATO GROSSO", "10/11/2024 - 16/11/2024", 3.75, 6.00),
  calculateRecord("MINAS GERAIS", "10/11/2024 - 16/11/2024", 3.89, 6.17),
  calculateRecord("SÃO PAULO", "10/11/2024 - 16/11/2024", 3.91, 5.93),

  calculateRecord("GOIÁS", "17/11/2024 - 23/11/2024", 3.83, 6.00),
  calculateRecord("MATO GROSSO", "17/11/2024 - 23/11/2024", 3.81, 6.02),
  calculateRecord("MINAS GERAIS", "17/11/2024 - 23/11/2024", 4.40, 6.21),
  calculateRecord("SÃO PAULO", "17/11/2024 - 23/11/2024", 3.93, 5.98),

  calculateRecord("GOIÁS", "24/11/2024 - 30/11/2024", 3.83, 5.96),
  calculateRecord("MATO GROSSO", "24/11/2024 - 30/11/2024", 3.74, 5.98),
  calculateRecord("MINAS GERAIS", "24/11/2024 - 30/11/2024", 4.41, 6.24),
  calculateRecord("SÃO PAULO", "24/11/2024 - 30/11/2024", 3.95, 6.02),

  calculateRecord("GOIÁS", "01/12/2024 - 07/12/2024", 3.82, 5.93),
  calculateRecord("MATO GROSSO", "01/12/2024 - 07/12/2024", 3.97, 6.08),
  calculateRecord("MINAS GERAIS", "01/12/2024 - 07/12/2024", 4.39, 6.19),
  calculateRecord("SÃO PAULO", "01/12/2024 - 07/12/2024", 3.92, 5.98),

  calculateRecord("GOIÁS", "08/12/2024 - 14/12/2024", 4.48, 6.40),
  calculateRecord("MATO GROSSO", "08/12/2024 - 14/12/2024", 3.95, 6.05),
  calculateRecord("MINAS GERAIS", "08/12/2024 - 14/12/2024", 4.36, 6.18),
  calculateRecord("SÃO PAULO", "08/12/2024 - 14/12/2024", 3.91, 5.96),

  calculateRecord("GOIÁS", "15/12/2024 - 21/12/2024", 4.52, 6.43),
  calculateRecord("MATO GROSSO", "15/12/2024 - 21/12/2024", 3.86, 6.01),
  calculateRecord("MINAS GERAIS", "15/12/2024 - 21/12/2024", 4.40, 6.24),
  calculateRecord("SÃO PAULO", "15/12/2024 - 21/12/2024", 3.94, 5.96),

  calculateRecord("GOIÁS", "22/12/2024 - 28/12/2024", 4.53, 6.44),
  calculateRecord("MATO GROSSO", "22/12/2024 - 28/12/2024", 3.85, 6.00),
  calculateRecord("MINAS GERAIS", "22/12/2024 - 28/12/2024", 4.35, 6.16),
  calculateRecord("SÃO PAULO", "22/12/2024 - 28/12/2024", 3.94, 5.98),

  calculateRecord("GOIÁS", "29/12/2024 - 04/01/2025", 4.53, 6.43),
  calculateRecord("MATO GROSSO", "29/12/2024 - 04/01/2025", 3.82, 6.00),
  calculateRecord("MINAS GERAIS", "29/12/2024 - 04/01/2025", 4.34, 6.15),
  calculateRecord("SÃO PAULO", "29/12/2024 - 04/01/2025", 3.98, 6.03),

  calculateRecord("GOIÁS", "05/01/2025 - 11/01/2025", 4.53, 6.44),
  calculateRecord("MATO GROSSO", "05/01/2025 - 11/01/2025", 3.85, 6.00),
  calculateRecord("MINAS GERAIS", "05/01/2025 - 11/01/2025", 4.35, 6.16),
  calculateRecord("SÃO PAULO", "05/01/2025 - 11/01/2025", 3.93, 5.96),

  calculateRecord("GOIÁS", "12/01/2025 - 18/01/2025", 4.39, 6.44),
  calculateRecord("MATO GROSSO", "12/01/2025 - 18/01/2025", 4.04, 6.06),
  calculateRecord("MINAS GERAIS", "12/01/2025 - 18/01/2025", 4.39, 6.24),
  calculateRecord("SÃO PAULO", "12/01/2025 - 18/01/2025", 4.04, 6.06),

  calculateRecord("GOIÁS", "19/01/2025 - 25/01/2025", 4.47, 6.20),
  calculateRecord("MATO GROSSO", "19/01/2025 - 25/01/2025", 4.10, 6.10),
  calculateRecord("MINAS GERAIS", "19/01/2025 - 25/01/2025", 4.47, 6.16),
  calculateRecord("SÃO PAULO", "19/01/2025 - 25/01/2025", 4.47, 6.20),
];

export const ALL_STATES = ["GOIÁS", "MATO GROSSO", "MINAS GERAIS", "SÃO PAULO"];

export const STATE_ABBREVIATIONS: Record<string, string> = {
  "ACRE": "AC", "ALAGOAS": "AL", "AMAPÁ": "AP", "AMAPA": "AP", "AMAZONAS": "AM",
  "BAHIA": "BA", "CEARÁ": "CE", "CEARA": "CE", "DISTRITO FEDERAL": "DF",
  "ESPÍRITO SANTO": "ES", "ESPIRITO SANTO": "ES", "GOIÁS": "GO", "GOIAS": "GO",
  "MARANHÃO": "MA", "MARANHAO": "MA",
  "MATO GROSSO": "MT", "MATO GROSSO DO SUL": "MS",
  "MINAS GERAIS": "MG", "PARÁ": "PA", "PARA": "PA", "PARAÍBA": "PB", "PARAIBA": "PB",
  "PARANÁ": "PR", "PARANA": "PR", "PERNAMBUCO": "PE", "PIAUÍ": "PI", "PIAUI": "PI",
  "RIO DE JANEIRO": "RJ", "RIO GRANDE DO NORTE": "RN",
  "RIO GRANDE DO SUL": "RS", "RONDÔNIA": "RO", "RONDONIA": "RO", "RORAIMA": "RR",
  "SANTA CATARINA": "SC", "SÃO PAULO": "SP", "SAO PAULO": "SP", "SERGIPE": "SE",
  "TOCANTINS": "TO",
};

export const STATE_COLORS: Record<string, string> = {
  "SÃO PAULO": "hsl(199, 89%, 48%)",
  "MINAS GERAIS": "hsl(142, 71%, 45%)",
  "GOIÁS": "hsl(38, 92%, 50%)",
  "MATO GROSSO": "hsl(280, 65%, 60%)",
  "RIO DE JANEIRO": "hsl(340, 82%, 52%)",
  "BAHIA": "hsl(25, 95%, 53%)",
  "PARANÁ": "hsl(170, 70%, 45%)",
  "RIO GRANDE DO SUL": "hsl(210, 70%, 50%)",
  "CEARÁ": "hsl(60, 70%, 50%)",
  "PERNAMBUCO": "hsl(300, 60%, 50%)",
};

export function parseShortDate(datas: string): Date {
  const start = datas.split(" - ")[0];
  const [d, m, y] = start.split("/");
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
}

function parseCsvRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDecimalBR(val: string): number {
  return parseFloat(val.replace(/\./g, "").replace(",", "."));
}

export function parseCsvData(text: string): FuelRecord[] {
  const lines = text.trim().split("\n").filter(l => l.trim());
  if (lines.length < 2) return [];

  const header = parseCsvRow(lines[0]).map(h => h.toUpperCase().trim());

  // Detect ANP format (has PRODUTO column)
  const prodIdx = header.findIndex(h => h.includes("PRODUTO"));
  if (prodIdx >= 0) {
    return parseAnpFormat(lines, header);
  }

  // Legacy simple format: ESTADO;DATAS;ETANOL;GASOLINA
  return parseLegacyFormat(lines, header);
}

function parseAnpFormat(lines: string[], header: string[]): FuelRecord[] {
  const estadoIdx = header.findIndex(h => h.includes("ESTADO"));
  const prodIdx = header.findIndex(h => h.includes("PRODUTO"));
  const dataIniIdx = header.findIndex(h => h.includes("DATA INICIAL"));
  const dataFimIdx = header.findIndex(h => h.includes("DATA FINAL"));
  const precoIdx = header.findIndex(h => h.includes("PREÇO MÉDIO REVENDA") || h.includes("PRECO MEDIO REVENDA"));

  if (estadoIdx < 0 || prodIdx < 0 || precoIdx < 0) return [];

  // Group by estado+date, collect etanol and gasolina prices
  const map = new Map<string, { estado: string; datas: string; etanol?: number; gasolina?: number }>();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    if (cols.length <= precoIdx) continue;

    const produto = cols[prodIdx]?.toUpperCase().trim() || "";
    const estado = cols[estadoIdx]?.toUpperCase().trim() || "";
    const preco = parseDecimalBR(cols[precoIdx] || "");

    if (!estado || isNaN(preco)) continue;

    // Build date range string
    let datas = "";
    if (dataIniIdx >= 0 && dataFimIdx >= 0) {
      const di = cols[dataIniIdx]?.trim() || "";
      const df = cols[dataFimIdx]?.trim() || "";
      // Convert MM/DD/YYYY to DD/MM/YYYY
      const formatDate = (d: string) => {
        const parts = d.split("/");
        if (parts.length === 3) return `${parts[1]}/${parts[0]}/${parts[2]}`;
        return d;
      };
      datas = `${formatDate(di)} - ${formatDate(df)}`;
    } else if (dataIniIdx >= 0) {
      datas = cols[dataIniIdx]?.trim() || "";
    }

    const key = `${estado}|${datas}`;

    if (!map.has(key)) {
      map.set(key, { estado, datas });
    }
    const entry = map.get(key)!;

    if (produto.includes("ETANOL")) {
      entry.etanol = preco;
    } else if (produto.includes("GASOLINA")) {
      entry.gasolina = preco;
    }
  }

  const records: FuelRecord[] = [];
  for (const entry of map.values()) {
    if (entry.etanol != null && entry.gasolina != null) {
      records.push(calculateRecord(entry.estado, entry.datas, entry.etanol, entry.gasolina));
    }
  }
  return records;
}

function parseLegacyFormat(lines: string[], header: string[]): FuelRecord[] {
  const hasHeader = header.some(h => h.includes("ESTADO") || h.includes("DATAS"));
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const records: FuelRecord[] = [];

  for (const line of dataLines) {
    const cols = line.split(/[;\t,]/).map(c => c.trim());
    if (cols.length < 4) continue;

    const estado = cols[0].toUpperCase();
    let dateIdx = 1;
    if (/^\d+$/.test(cols[1])) dateIdx = 2;

    const datas = cols[dateIdx].replace(/"/g, "");
    const etanol = parseFloat(cols[dateIdx + 1].replace("R$", "").replace(",", ".").trim());
    const gasolina = parseFloat(cols[dateIdx + 2].replace("R$", "").replace(",", ".").trim());

    if (!isNaN(etanol) && !isNaN(gasolina) && estado && datas) {
      records.push(calculateRecord(estado, datas, etanol, gasolina));
    }
  }
  return records;
}
