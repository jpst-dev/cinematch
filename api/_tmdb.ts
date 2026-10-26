// Lista do que o site pode pedir ao TMDb através do proxy. Qualquer outro caminho é recusado.
const PERMITIDOS = [
  /^movie\/(popular|top_rated|now_playing)$/,
  /^movie\/\d+$/,
  /^movie\/\d+\/(credits|videos|recommendations|watch\/providers)$/,
  /^search\/movie$/,
  /^discover\/movie$/,
  /^genre\/movie\/list$/,
];

const BASE = "https://api.themoviedb.org/3/";

export function resolverAlvo(caminho: string, query: URLSearchParams, apiKey: string): URL | null {
  if (!PERMITIDOS.some((re) => re.test(caminho))) return null;

  const url = new URL(caminho, BASE);
  for (const [k, v] of query) {
    if (k !== "api_key" && k !== "path") url.searchParams.append(k, v);
  }
  url.searchParams.set("api_key", apiKey);
  if (!caminho.endsWith("watch/providers") && !url.searchParams.has("language")) {
    url.searchParams.set("language", "pt-BR");
  }
  return url;
}

// Usado pela função da Vercel e pelo servidor do Vite: mesma regra nos dois.
export async function responderTmdb(caminho: string, query: URLSearchParams, apiKey?: string): Promise<Response> {
  const json = (corpo: unknown, status: number) =>
    new Response(JSON.stringify(corpo), { status, headers: { "content-type": "application/json" } });

  if (!apiKey) return json({ error: "TMDB_API_KEY ausente" }, 500);
  const url = resolverAlvo(caminho, query, apiKey);
  if (!url) return json({ error: "Caminho não permitido" }, 403);

  const res = await fetch(url);
  const headers = new Headers({ "content-type": "application/json" });
  if (res.ok) headers.set("cache-control", "s-maxage=3600, stale-while-revalidate=86400");
  return new Response(await res.text(), { status: res.status, headers });
}
