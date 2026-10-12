// Deletes the caller's JourFund account: trade images in Storage, rate-limit rows, then the auth user
// (every public table cascades from auth.users). Needs a valid session; with MFA on, an aal2 session.
// verify_jwt is off (like push-api) so the browser's CORS preflight passes; the session is checked below.
import {createClient} from 'npm:@supabase/supabase-js@2.57.4';

const BUCKET = 'fundedtrack-trade-images';
const origins = new Set(['https://facundobenitez01.github.io', 'https://jourfund.com', 'https://www.jourfund.com']);
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {auth: {persistSession: false, autoRefreshToken: false}});

function cors(req: Request) {
  const origin = req.headers.get('Origin');
  return {'Access-Control-Allow-Headers': 'authorization,apikey,content-type', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Vary': 'Origin', ...(origin && origins.has(origin) ? {'Access-Control-Allow-Origin': origin} : {})};
}
function claims(token: string): Record<string, unknown> {
  try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { return {}; }
}
async function listAll(prefix: string): Promise<string[]> {
  const files: string[] = [];
  const folders = [prefix];
  while (folders.length) {
    const folder = folders.pop()!;
    for (let offset = 0; ; offset += 1000) {
      const {data, error} = await db.storage.from(BUCKET).list(folder, {limit: 1000, offset});
      if (error) throw error;
      for (const item of data) {
        const path = folder + '/' + item.name;
        if (item.id === null) folders.push(path); else files.push(path);
      }
      if (data.length < 1000) break;
    }
  }
  return files;
}

Deno.serve(async req => {
  const headers = cors(req);
  const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {status, headers: {...headers, 'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
  const origin = req.headers.get('Origin');
  if (origin !== null && !origins.has(origin)) return json({error: 'Origen no permitido'}, 403);
  if (req.method === 'OPTIONS') return new Response(null, {headers});
  if (req.method !== 'POST') return json({error: 'POST requerido'}, 405);
  try {
    const bearer = req.headers.get('Authorization')?.match(/^Bearer (.+)$/)?.[1];
    if (!bearer) return json({error: 'Iniciá sesión'}, 401);
    const {data, error} = await db.auth.getUser(bearer);
    if (error || !data.user) return json({error: 'Tu sesión venció. Volvé a iniciar sesión.'}, 401);
    const user = data.user;
    const body = await req.json().catch(() => ({}));
    if (body?.confirm !== 'DELETE_MY_ACCOUNT') return json({error: 'Falta la confirmación.'}, 400);
    const mfa = (user.factors || []).some(f => f.status === 'verified');
    if (mfa && claims(bearer).aal !== 'aal2') return json({error: 'Confirmá tu código de autenticación antes de eliminar la cuenta.'}, 403);

    const files = await listAll(user.id);
    for (let i = 0; i < files.length; i += 100) {
      const {error: removeError} = await db.storage.from(BUCKET).remove(files.slice(i, i + 100));
      if (removeError) throw removeError;
    }
    const {error: purgeError} = await db.rpc('jourfund_purge_user', {target: user.id});
    if (purgeError) throw purgeError;
    const {error: deleteError} = await db.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;
    return json({ok: true, images: files.length});
  } catch (e) {
    console.error('delete-account failure', e instanceof Error ? e.message : 'unknown');
    return json({error: 'No se pudo eliminar la cuenta. Intentá de nuevo en unos minutos.'}, 500);
  }
});
