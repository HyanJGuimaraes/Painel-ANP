import { FuelRecord } from "@/types/fuel";

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
