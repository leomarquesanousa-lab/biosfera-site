'use client';
import { useState, useTransition } from 'react';
import { importArticle } from '@/app/admin/import-action';
import type { Taxonomy } from '@/lib/editorial/types';
import type { ImportedArticle } from '@/lib/editorial/import-types';
import { NewsForm } from './news-form';
export function NewsComposer({authors,categories}:{authors:Taxonomy[];categories:Taxonomy[]}) {
  const [imported,setImported]=useState<ImportedArticle>();
  const [revision,setRevision]=useState(0);
  const [error,setError]=useState('');
  const [pending,startTransition]=useTransition();
  return <><details className="import-panel"><summary>Importar matéria por URL</summary><p>Prepare um rascunho editável a partir de uma fonte externa. Revise o conteúdo, a autoria e os direitos de republicação antes de publicar. Importar substitui os campos ainda não salvos abaixo.</p><form onSubmit={event=>{
    event.preventDefault();const url=String(new FormData(event.currentTarget).get('url') || '');
    if(!window.confirm('Preencher o formulário com esta importação? Os campos ainda não salvos serão substituídos.'))return;
    setError('');startTransition(async()=>{const result=await importArticle(url);if(result.error)setError(result.error);else if(result.article){setImported(result.article);setRevision(value=>value+1);}});
  }}><label>URL da matéria<input type="url" name="url" required maxLength={2048} placeholder="https://…" /></label><button className="button" disabled={pending}>{pending?'Importando…':'Importar'}</button></form>{error && <p className="form-error" role="alert">{error}</p>}{imported && <p className="success-message" role="status">Importação preparada como rascunho. Nada foi publicado ou salvo automaticamente.</p>}</details>
    <NewsForm key={revision} imported={imported} authors={authors} categories={categories} />
  </>;
}
