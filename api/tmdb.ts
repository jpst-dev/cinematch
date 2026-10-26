import { responderTmdb } from "./_tmdb.js"; // extensão obrigatória no ESM da Vercel

// /api/tmdb/<caminho> chega aqui como ?path=<caminho> (rewrite do vercel.json).
export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams;
  return responderTmdb(query.get("path") ?? "", query, process.env.TMDB_API_KEY);
}
