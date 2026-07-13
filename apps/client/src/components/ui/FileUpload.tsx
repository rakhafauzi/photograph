import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import { toast } from 'sonner';

interface FileUploadProps {
  onUpload: (url: string) => void;
  folder?: 'portfolio' | 'package' | 'testimonial' | 'payment' | 'logo' | 'general';
  className?: string;
  accept?: string;
  currentImage?: string;
}

const allowedImageMimes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];

export default function FileUpload({
  onUpload,
  folder = 'general',
  className,
  accept = 'image/*',
  currentImage,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response.data.data;
      setPreview(data.url);
      onUpload(data.url);
      toast.success('Gambar berhasil diupload');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Gagal upload gambar';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }, [folder, onUpload]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    if (!allowedImageMimes.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, WebP, GIF, HEIC, atau HEIF.');
      return;
    }

    // Show local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    handleUpload(file);
  }, [handleUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const removeImage = () => {
    setPreview(null);
    onUpload('');
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleClick}
              className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/40 transition-colors"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="p-2 rounded-lg bg-red-500/50 text-white hover:bg-red-500/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-dark-surface/60 flex items-center justify-center">
              <Loader className="w-6 h-6 theme-accent-text animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          disabled={isUploading}
          className={cn(
            'w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all',
            isDragging
              ? 'theme-accent-border theme-accent-surface'
              : 'border-gray-200 dark:border-dark-border hover:theme-accent-border hover:theme-accent-surface-subtle',
            isUploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <>
              <Loader className="w-8 h-8 theme-accent-text animate-spin" />
              <span className="text-sm text-gray-500 dark:text-dark-text-secondary">Mengupload...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full theme-accent-surface flex items-center justify-center">
                <Upload className="w-6 h-6 theme-accent-text" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-dark-text">
                  Klik atau drag gambar ke sini
                </p>
                <p className="text-xs text-gray-400 dark:text-dark-text-tertiary mt-1">
                  JPG, PNG, WebP, GIF, HEIC, atau HEIF hingga 5MB
                </p>
              </div>
            </>
          )}
        </button>
      )}
    </div>
  );
}
