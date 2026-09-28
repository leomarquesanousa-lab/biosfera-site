'use server';
import { requireMutation } from '@/lib/auth/editorial';
import { fetchRemotePage, ImportError } from '@/lib/security/remote-page.mjs';
import { extractArticle } from '@/lib/editorial/import-article.mjs';
import { consumeLimit } from '@/server/services/request-limit';
export async function importArticle(url: string) {
  try {
    const user=await requireMutation();
    if(typeof url!=='string' || url.length>2048) return {error:'URL inválida.'};
    if(!await consumeLimit(`import:${user.id}`,10,600)) return {error:'Limite de importações atingido. Aguarde 10 minutos.'};
    const page=await fetchRemotePage(url);
    if(!page) return {error:'A fonte não retornou conteúdo.'};
    const article=extractArticle(page.html,url,page.url);
    if(!article.title && !article.body) return {error:'Não foi possível identificar a matéria. Preencha manualmente.'};
    return {article};
  } catch(error) {
    return {error:error instanceof ImportError?error.message:'Importação indisponível. Verifique sua sessão e tente novamente.'};
  }
}
