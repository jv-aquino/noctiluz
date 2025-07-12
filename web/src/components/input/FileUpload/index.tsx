import { Upload, X } from "lucide-react";
import { ReactNode, useCallback, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FileUploadInputProps {
  arquivo: { name: string; url: string } | null;
  handleFileUpload: (file: { name: string; url: string } | null) => void;
  children: ReactNode;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

function FileUploadInput({ 
  arquivo, 
  handleFileUpload, 
  children, 
  accept = ".svg,.webp,.avif,.png,.jpg,.jpeg",
  maxSize = 5, // 5MB default
  className = ""
}: FileUploadInputProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Tamanho máximo: ${maxSize}MB`;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedTypes.some(type => 
      type.startsWith('.') ? type === fileExtension : file.type.match(type.replace('*', '.*'))
    )) {
      return `Tipo de arquivo não suportado. Tipos aceitos: ${accept}`;
    }

    return null;
  }, [accept, maxSize]);

  const uploadToS3 = useCallback(async (file: File) => {
    setUploading(true);
    setProgress(null);
    setError(null);
    try {
      // 1. Get presigned URL
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('Upload API error:', data);
        throw new Error(data.error || "Erro ao obter URL de upload");
      }
      const { uploadUrl, fileUrl } = await res.json();
      
      // 2. Upload file to S3
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.timeout = 30000; // 30 seconds timeout
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setProgress(progress);
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            // Create a File-like object with .url
            handleFileUpload({ name: file.name, url: fileUrl });
            setProgress(100);
            resolve();
          } else {
            console.error('XHR failed with status:', xhr.status);
            console.error('XHR response:', xhr.responseText);
            reject(new Error(`Falha ao enviar arquivo para S3. Status: ${xhr.status}`));
          }
        };
        xhr.onerror = () => {
          reject(new Error("Erro de rede ao enviar arquivo"));
        };
        xhr.ontimeout = () => {
          reject(new Error("Timeout ao enviar arquivo"));
        };
        xhr.send(file);
      });
    } catch (err: unknown) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : "Erro desconhecido ao fazer upload");
      handleFileUpload(null);
    } finally {
      setUploading(false);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    uploadToS3(file);
  }, [validateFile, uploadToS3]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    handleFileUpload(null);
    setError(null);
    // Reset the file input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [handleFileUpload]);

  // Reset input when arquivo changes
  useEffect(() => {
    if (!arquivo && inputRef.current) {
      inputRef.current.value = '';
    }
  }, [arquivo]);

  return ( 
    <div className={cn("space-y-2", className)}>
      {children}
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver && "border-blue-400 bg-blue-50",
          error && "border-red-300 bg-red-50",
          !isDragOver && !error && "border-gray-300 hover:border-gray-400"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          id="file-upload"
          ref={inputRef}
          disabled={uploading}
          key={arquivo?.url || 'empty'} // Force re-render when arquivo changes
        />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className={cn("h-8 w-8", error ? "text-red-400" : "text-gray-400")} />
            <span className={cn("text-sm font-medium", error ? "text-red-700" : "text-gray-700")}>
              {isDragOver ? 'Solte o arquivo aqui' : 'Arraste o Arquivo'}
            </span>
            <span className={cn("text-xs", error ? "text-red-500" : "text-gray-500")}>
              ou Clique para fazer o upload
            </span>
            <span className="text-xs text-gray-400">
              Máximo: {maxSize}MB
            </span>
          </label>
        
        {uploading && (
          <div className="mt-2 text-sm text-blue-600 bg-blue-100 p-2 rounded">
            Enviando arquivo... {progress !== null ? `${progress}%` : null}
          </div>
        )}
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}
        
        {arquivo && !error && (
          <div className="mt-2 flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-100 p-2 rounded">
            <span>Arquivo selecionado: {arquivo.name}</span>
            {arquivo.url && (
              <a href={arquivo.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline ml-2">Ver arquivo</a>
            )}
            <button
              type="button"
              onClick={handleRemoveFile}
              className={cn("text-red-500 hover:text-red-700 transition-colors")}
              aria-label="Remover arquivo"
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
   );
}

export default FileUploadInput;