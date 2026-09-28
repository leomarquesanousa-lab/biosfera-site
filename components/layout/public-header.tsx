'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Brand } from '@/components/brand';
import { HeaderListen } from '@/components/radio/radio-player';
const menu=[['/','Início'],['/noticias','Notícias'],['/radio','Rádio'],['/programacao','Programação'],['/videos','Vídeos'],['/contato','Contato']];
export function PublicHeader({siteName}:{siteName:string}){
 const [open,setOpen]=useState(false);const pathname=usePathname();
 return <header className="portal-header"><div className="site-header container"><Link className="header-brand" href="/" aria-label={`${siteName} — início`} onClick={()=>setOpen(false)}><Brand light/></Link>
 <nav id="portal-navigation" className={`main-nav ${open?'is-open':''}`} aria-label="Navegação principal"><div>{menu.map(([href,label])=><Link href={href} key={href} aria-current={pathname===href?'page':undefined} onClick={()=>setOpen(false)}>{label}</Link>)}<Link href="/busca" className="search-link" aria-label="Buscar no portal" onClick={()=>setOpen(false)}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><span>Buscar</span></Link></div></nav>
 <div className="header-actions"><HeaderListen/><button className="menu-toggle" aria-label={open?'Fechar menu':'Abrir menu'} aria-expanded={open} aria-controls="portal-navigation" onClick={()=>setOpen(!open)}><span aria-hidden="true">{open?'×':'☰'}</span></button></div></div></header>;
}
