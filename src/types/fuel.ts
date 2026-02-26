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
