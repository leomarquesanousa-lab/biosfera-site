import 'server-only';
import { getPool } from '@/lib/db/pool';
import { getSettings } from './settings';
import { portalTimezone } from './ads';
import { text,EditorialError } from '@/lib/editorial/validation';
export async function operationalSettings(){const [settings,timezone,chat]=await Promise.all([getSettings(),portalTimezone(),getPool().query("SELECT value FROM settings WHERE key='CHAT_ENABLED'")]);return {SITE_NAME:settings.siteName,RADIO_STREAM_URL:settings.radioStreamUrl,LIVE_CAMERA_EMBED_URL:settings.liveCameraEmbedUrl,PORTAL_TIMEZONE:timezone,CHAT_ENABLED:chat.rows[0]?.value==='true'};}
export async function saveSettings(form:FormData,userId:string){
 const values:Record<string,string>={SITE_NAME:text(form,'SITE_NAME',120,true),PORTAL_TIMEZONE:text(form,'PORTAL_TIMEZONE',100,true),CHAT_ENABLED:form.get('CHAT_ENABLED')==='on'?'true':'false'};
 try{new Intl.DateTimeFormat('pt-BR',{timeZone:values.PORTAL_TIMEZONE});}catch{throw new EditorialError('Fuso horário inválido. Use um identificador IANA, como America/Sao_Paulo.');}
 for(const key of ['RADIO_STREAM_URL','LIVE_CAMERA_EMBED_URL']){const value=text(form,key,2048,true);try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)throw new Error();values[key]=u.href;}catch{throw new EditorialError('Rádio e câmera exigem URLs HTTPS sem credenciais.');}}
 const client=await getPool().connect();try{await client.query('BEGIN');const owner=await client.query("SELECT id FROM users WHERE id=$1 AND role='OWNER' AND active FOR SHARE",[userId]);if(!owner.rowCount)throw new EditorialError('Somente OWNER pode alterar configurações.');for(const [key,value] of Object.entries(values))await client.query('INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=now()',[key,value]);await client.query("INSERT INTO audit_log(user_id,action,entity,metadata) VALUES($1,'settings.updated','settings',$2)",[userId,JSON.stringify({keys:Object.keys(values)})]);await client.query('COMMIT');}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}
