import { PublicCatalog } from '@/components/programming/public';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{slug:string}>}){return <PublicCatalog kind="presenters" slug={(await params).slug}/>;}