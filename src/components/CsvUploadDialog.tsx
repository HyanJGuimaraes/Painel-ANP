import { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { FuelRecord, parseCsvData } from "@/data/sampleData";

interface CsvUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (records: FuelRecord[]) => void;
}

export default function CsvUploadDialog({ open, onClose, onImport }: CsvUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<FuelRecord[]>([]);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = (f: File) => {
    setError("");
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const records = parseCsvData(text);
        if (records.length === 0) {
          setError("Nenhum registro válido encontrado. Verifique o formato do arquivo.");
          setPreview([]);
        } else {
          setPreview(records);
        }
      } catch {
        setError("Erro ao processar o arquivo.");
        setPreview([]);
      }
    };
    reader.readAsText(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleConfirm = () => {
    if (preview.length > 0) {
      onImport(preview);
      setFile(null);
      setPreview([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="glass-card w-full max-w-lg p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Importar Dados CSV</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/30"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Arraste um arquivo CSV ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground/60">
            Formato: ESTADO; DATAS; ETANOL; GASOLINA
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.txt,.tsv"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>

        {file && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {file.name}
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-unfavorable">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {preview.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-favorable">
              <CheckCircle className="h-4 w-4" />
              {preview.length} registros encontrados
            </div>
            <div className="mt-2 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Importar Dados
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
