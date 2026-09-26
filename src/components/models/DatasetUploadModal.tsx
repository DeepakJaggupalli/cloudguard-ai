import React, { useState } from 'react';
import { Upload, X, CheckCircle2, FileText, Loader2 } from 'lucide-react';

interface DatasetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadDataset: (file: File) => Promise<any>;
}

export const DatasetUploadModal: React.FC<DatasetUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadDataset,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const res = await onUploadDataset(selectedFile);
      setUploadSuccess(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadSuccess(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 duration-150 space-y-4">
        <button onClick={handleClose} disabled={isUploading} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-blue-100 text-blue-600">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Dataset Corpus & Retrain Models</h3>
            <p className="text-xs text-slate-500">Ingest CSV dataset files (`vm_monitoring.csv`) directly into ML pipeline</p>
          </div>
        </div>

        {uploadSuccess ? (
          <div className="py-4 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Dataset Retraining Complete</h4>
            <p className="text-xs text-slate-600">
              Retrained all anomaly models on <strong className="font-mono">{uploadSuccess.samplesTrained}</strong> samples from <span className="font-mono font-semibold">{uploadSuccess.filename}</span>.
            </p>
            <button onClick={handleClose} className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-md">
              Done & Return to Registry
            </button>
          </div>
        ) : (
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Select or drop dataset CSV file (`.csv` or `.zip`)</p>
              <p className="text-[11px] text-slate-500 mt-1">Must contain VM telemetry features (CPU, RAM, Latency, IOPS)</p>
              
              <input
                type="file"
                accept=".csv,.zip"
                onChange={handleFileChange}
                className="mt-4 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {selectedFile && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between text-xs text-blue-900">
                <span className="font-mono font-semibold truncate">{selectedFile.name}</span>
                <span className="font-mono text-[11px] text-blue-700 font-bold">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={handleClose} disabled={isUploading} className="px-4 py-2 border border-slate-300 rounded-md font-semibold text-slate-700">
                Cancel
              </button>
              <button type="submit" disabled={!selectedFile || isUploading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md flex items-center gap-2">
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                Upload & Retrain Pipeline
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
