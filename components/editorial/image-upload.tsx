'use client';
/* eslint-disable @next/next/no-img-element -- arquivos locais já redimensionados e convertidos no upload */
import { useState } from 'react';
import { EditorialImageUpload } from './editorial-image-upload';
function ExistingImageUpload({ label, value, onChange,endpoint='/api/editorial/upload' }: { label: string; value: string; onChange: (value: string) => void;endpoint?:string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <div className="image-upload">
    <label>{label}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { setError('O limite é 5 MB.'); return; }
      setBusy(true); setError('');
      try {
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) }, body: file });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        onChange(result.url);
      } catch (error) { setError(error instanceof Error ? error.message : 'Falha no envio.'); }
      finally { setBusy(false); }
    }} /></label>
    <small>JPEG, PNG ou WebP · Até 5 MB e 20 megapixels. {busy && 'Enviando…'}</small>
    {error && <p className="form-error" role="alert">{error}</p>}
    {value && <><img className="upload-preview" src={value} alt="Prévia da imagem enviada" /><button type="button" className="text-button" onClick={() => onChange('')}>Remover imagem do formulário</button></>}
  </div>;
}

export function ImageUpload(props: {label:string;value:string;onChange:(value:string)=>void;endpoint?:string}) {
  return props.endpoint && props.endpoint !== '/api/editorial/upload' ? <ExistingImageUpload {...props}/> : <EditorialImageUpload {...props}/>;
}
