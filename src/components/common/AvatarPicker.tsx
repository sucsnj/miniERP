import React, { useRef, useState } from 'react';
import { validateAvatarFile } from '@/services/avatarService';
import { useToast } from '@/hooks/useToast';
import Button from './Button';

interface AvatarPickerProps {
  value?: string | null;
  fallback: string;
  size?: number;
  label?: string;
  caption?: string;
  disabled?: boolean;
  onUpload: (file: File) => Promise<void>;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({
  value,
  fallback,
  size = 64,
  label = 'Alterar foto',
  caption,
  disabled = false,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      validateAvatarFile(file);
      await onUpload(file);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao atualizar a foto.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const initial = (fallback.trim().charAt(0) || '?').toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {value ? (
        <img
          src={value}
          alt={`Foto de ${fallback}`}
          width={size}
          height={size}
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <span
          aria-hidden="true"
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: Math.round(size * 0.42),
            fontWeight: 700,
          }}
        >
          {initial}
        </span>
      )}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        isLoading={uploading}
        disabled={disabled}
      >
        {uploading ? 'Enviando...' : label}
      </Button>
      {caption && (
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>{caption}</p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={handleFileChange}
        hidden
      />
    </div>
  );
};

export default AvatarPicker;
