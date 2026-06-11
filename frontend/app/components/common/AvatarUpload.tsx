'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import Avatar from './Avatar';

const MAX_SIZE_MB = 2;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface AvatarUploadProps {
  initials: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  uploading?: boolean;
  onUpload: (base64: string) => void;
}

export default function AvatarUpload({ initials, src, size = 'xl', uploading = false, onUpload }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Only JPG, PNG, WebP or GIF images are allowed.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) onUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    if (!uploading) inputRef.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      className={`avatar-upload${dragging ? ' avatar-upload--dragging' : ''}`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      title="Click or drag an image to change avatar"
    >
      <Avatar initials={initials} src={src} size={size} />

      <div className="avatar-upload__overlay">
        {uploading
          ? <i className="fas fa-spinner fa-spin" />
          : <i className="fas fa-camera" />
        }
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  );
}
