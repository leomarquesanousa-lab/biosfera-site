import { test,expect,type BrowserContext } from '@playwright/test';
import { Pool } from 'pg';
import { randomUUID,randomBytes,createHash } from 'node:crypto';
if(process.env.BIOSFERA_E2E!=='1')throw new Error('Use npm run test:e2e.');
const pool=new Pool({connectionString:process.env.DATABASE_URL});
test.afterAll(()=>pool.end());
test.setTimeout(60000);
async function auth(context:BrowserContext) {
  const user=(await pool.query("SELECT id FROM users WHERE role='OWNER' LIMIT 1")).rows[0];
  const token=randomBytes(32).toString('hex');
  await pool.query("INSERT INTO sessions(id,user_id,token_hash,expires_at) VALUES($1,$2,$3,now()+interval '1 hour')",[randomUUID(),user.id,createHash('sha256').update(token).digest('hex')]);
  await context.addCookies([{name:'__Host-biosfera_session',value:token,domain:'localhost',path:'/',secure:true,httpOnly:true,sameSite:'Lax'}]);
}
test('home: zero, uma, duas e mais notícias, destaque, cronologia, sem duplicar e layout',async({page})=>{
  await pool.query("UPDATE news SET status='ARCHIVED'");
  const author=randomUUID(),category=randomUUID();
  await pool.query("INSERT INTO authors(id,name,slug) VALUES($1,'Equipe home','equipe-home')",[author]);
  await pool.query("INSERT INTO categories(id,name,slug) VALUES($1,'Cultura','cultura-home')",[category]);
  async function article(slug:string,status:string,featured=false,days=0) {
    const id=randomUUID();
    await pool.query("INSERT INTO news(id,title,slug,body,excerpt,author_id,status,published_at,scheduled_at,featured) VALUES($1,$2,$2,'Conteúdo da notícia','Resumo editorial',$3,$4,now()-$5*interval '1 day',now()+interval '1 day',$6)",[id,slug,author,status,days,featured]);
    await pool.query('INSERT INTO news_categories(news_id,category_id) VALUES($1,$2)',[id,category]);return id;
  }
  await article('rascunho-oculto','DRAFT',true);await article('arquivo-oculto','ARCHIVED',true);const scheduled=await article('agendada-futura','SCHEDULED',true);
  await page.goto('/');
  await expect(page.getByText('ACOMPANHE A BIOSFERA',{exact:true})).toBeVisible();
  await expect(page.locator('.portal-home .news-card')).toHaveCount(0);
  await expect(page.locator('.portal-home')).not.toContainText('Nenhuma notícia');
  const first=await article('noticia-unica','PUBLISHED',false,3);
  await page.reload();
  await expect(page.locator('.home-headlines .news-card')).toHaveCount(1);
  await expect(page.locator('.single-headline')).toHaveCount(1);
  await expect(page.getByText('ACOMPANHE A BIOSFERA',{exact:true})).toHaveCount(0);
  await article('noticia-recente','PUBLISHED');
  await article('destaque-antigo','PUBLISHED',true,10);
  await page.reload();
  await expect(page.locator('.home-headlines .news-card')).toHaveCount(2);
  await expect(page.locator('.home-headlines .news-card h2').first()).toHaveText('destaque-antigo');
  await expect(page.locator('.home-headlines .news-card h2').nth(1)).toHaveText('noticia-recente');
  await expect(page.locator('.home-latest .news-card h2')).toHaveText('noticia-unica');
  await pool.query('UPDATE news SET featured=true WHERE id=$1',[first]);
  await page.reload();
  await expect(page.locator('.home-headlines .news-card h2')).toHaveText(['noticia-unica','destaque-antigo']);
  const titles=await page.locator('.portal-home .news-card h2').allTextContents();
  expect(new Set(titles).size).toBe(titles.length);
  for(const name of ['rascunho-oculto','arquivo-oculto','agendada-futura'])expect(titles).not.toContain(name);
  await pool.query("UPDATE news SET scheduled_at=now()-interval '1 minute' WHERE id=$1",[scheduled]);
  await page.reload();await expect(page.locator('.home-headlines')).toContainText('agendada-futura');
  await page.setViewportSize({width:1440,height:1000});
  for(const row of ['.broadcast-row','.community-row','.headline-grid']) {
    const boxes=await page.locator(`${row}>*`).evaluateAll(elements=>elements.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y})));
    expect(Math.abs(boxes[0].y-boxes[1].y)).toBeLessThan(2);expect(boxes[1].x).toBeGreaterThan(boxes[0].x);
  }
  await page.screenshot({path:'test-results/home21-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const mobile=await page.locator('.broadcast-row>*').evaluateAll(elements=>elements.map(el=>el.getBoundingClientRect().y));expect(mobile[1]).toBeGreaterThan(mobile[0]);
  await page.screenshot({path:'test-results/home21-mobile.png',fullPage:true});
});
test('câmera só carrega após clique e controles da home usam o mesmo áudio persistente',async({page})=>{
  let cameraRequests=0;
  await page.route('https://playerv.tvr.ovh/**',route=>{cameraRequests++;return route.fulfill({contentType:'text/html',body:'<p>Player de teste</p>'});});
  const bytes=Buffer.alloc(44+8000*2*60);bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(8000,24);bytes.writeUInt32LE(16000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(bytes.length-44,40);
  await page.route('https://s1.dvr.ovh:6696/stream',route=>route.fulfill({contentType:'audio/wav',body:bytes}));
  await page.goto('/');await expect(page.locator('.camera-frame iframe')).toHaveCount(0);expect(cameraRequests).toBe(0);
  await page.getByRole('button',{name:'Assistir ao vivo'}).click();
  await expect(page.locator('.camera-frame iframe')).toHaveAttribute('src','https://playerv.tvr.ovh/video-premium/video36282/true/false/');
  await expect.poll(()=>cameraRequests).toBe(1);
  await page.getByRole('button',{name:'Fechar transmissão'}).click();await expect(page.locator('.camera-frame iframe')).toHaveCount(0);
  await expect(page.locator('audio')).toHaveCount(1);
  const audio=await page.locator('audio').elementHandle();
  await page.getByRole('button',{name:'Iniciar transmissão',exact:true}).click();
  await expect(page.locator('.radio-player [role="status"]')).toContainText('Você está ouvindo');
  await expect(page.getByRole('button',{name:'Pausar rádio',exact:true})).toBeVisible();
  await page.getByRole('slider',{name:'Volume da transmissão',exact:true}).fill('0.3');
  await expect(page.getByRole('slider',{name:'Volume',exact:true})).toHaveValue('0.3');
  await page.locator('.main-nav').getByRole('link',{name:'Notícias',exact:true}).click();
  await expect(page).toHaveURL(/\/noticias$/);
  expect(await audio!.evaluate(el=>el===document.querySelector('audio') && !(el as HTMLAudioElement).paused)).toBe(true);
});
test('pedido musical valida, persiste, limita spam e aparece apenas no painel autorizado',async({page,context})=>{
  await pool.query('DELETE FROM song_requests');await pool.query("DELETE FROM request_limits WHERE key LIKE 'song:%'");
  await page.goto('/');
  const form=page.locator('.song-form');
  await form.getByLabel('Seu nome',{exact:true}).fill('Ouvinte de teste');
  await form.getByLabel('Música / artista',{exact:true}).fill('Canção solicitada');
  await form.locator('[name="website"]').fill('bot');
  await form.getByRole('button',{name:'Pedir música'}).click();
  await expect(form.getByRole('alert')).toContainText('Aguarde');
  expect((await pool.query('SELECT count(*)::int AS total FROM song_requests')).rows[0].total).toBe(0);
  await form.locator('[name="website"]').fill('');
  await expect.poll(async()=>Date.now()-Number(await form.locator('[name="started_at"]').inputValue())).toBeGreaterThan(2100);
  for(let i=0;i<4;i++) {
    await form.getByLabel('Seu nome',{exact:true}).fill('Ouvinte de teste');await form.getByLabel('Música / artista',{exact:true}).fill(`Canção solicitada ${i}`);
    await form.getByRole('button',{name:'Pedir música'}).click();
    if(i<3)await expect(form.getByRole('status')).toContainText('Pedido recebido');else await expect(form.getByRole('alert')).toContainText('Limite de pedidos');
  }
  expect((await pool.query('SELECT count(*)::int AS total FROM song_requests')).rows[0].total).toBe(3);
  await page.goto('/admin/pedidos-musicais');await expect(page).toHaveURL(/\/admin\/login$/);
  await auth(context);await page.goto('/admin/pedidos-musicais');await expect(page.getByRole('cell',{name:'Canção solicitada 0',exact:true})).toBeVisible();
});
test('importador administrativo rejeita URL interna e não cria ou publica notícia',async({page,context})=>{
  await auth(context);
  const before=Number((await pool.query('SELECT count(*) FROM news')).rows[0].count);
  await page.goto('/admin/noticias/nova');await page.getByText('Importar matéria por URL',{exact:true}).click();
  await page.getByLabel('URL da matéria',{exact:true}).fill('http://127.0.0.1');page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Importar',exact:true}).click();
  await expect(page.locator('.import-panel .form-error')).toContainText('bloqueado');
  await expect(page.getByLabel('Status',{exact:true})).toHaveValue('DRAFT');
  expect(Number((await pool.query('SELECT count(*) FROM news')).rows[0].count)).toBe(before);
});
