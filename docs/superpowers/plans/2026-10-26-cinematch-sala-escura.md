# CineMatch "Sala escura" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar o CineMatch na identidade "Sala escura" (preto + âmbar, Bebas Neue) e tirar a chave do TMDb do navegador com um proxy na Vercel.

**Architecture:** Lógica pura testável em `src/utils/format.ts`, `src/utils/hero.ts` e `api/_tmdb.ts` (lista permitida do proxy). Um cliente único `src/services/tmdb.ts` fala com `/api/tmdb/*`; em produção quem responde é a função `api/tmdb.ts` (via rewrite do `vercel.json`), em dev um middleware do Vite que usa o mesmo `api/_tmdb.ts`. Componentes visuais novos (`PosterCard`, `MovieRow`, `HeroBanner`, `PosterGrid`, `PageHeader`, `Skeleton*`) substituem os antigos; páginas só compõem.

**Tech Stack:** Vue 3, Vite 6, Tailwind 3, Pinia, VueUse, lucide-vue-next, Vitest (novo), Vercel Functions (Node, assinatura Web `GET(request)`).

**Spec:** `docs/superpowers/specs/2026-10-26-cinematch-sala-escura-design.md` (mock: `docs/superpowers/specs/2026-10-26-cinematch-direcoes-mock.html`, opção A)

## Global Constraints

- Cores: fundo `#070707`, superfícies `#111113`/`#18181b`, borda `#26262b`, acento `#fbbf24`. Títulos de cartaz em Bebas Neue; interface em Inter.
- Nenhuma ocorrência de `api_key`, `VITE_TMDB_API_KEY` ou `api.themoviedb.org` em `src/` nem em `dist/` após o build.
- Proxy aceita só `GET` e só: `movie/<id>`, `movie/<id>/{credits,videos,recommendations,watch/providers}`, `movie/{popular,top_rated,now_playing}`, `search/movie`, `discover/movie`, `genre/movie/list`. Resto → 403.
- Formatos pt-BR: `★ 7,6`, `19 out. 2026`, `1h 52min`. Valor ausente nunca vira "NaN", "undefined" ou "0,0" — some.
- Tailwind continua v3. Sem migração de framework. Sem `vue3-carousel` e sem `axios` no fim.
- Sem rolagem horizontal da página em 360px. Foco visível âmbar. Imagens fora do hero com `loading="lazy"`.
- Rotas: `/`, `/em-cartaz`, `/em-alta`, `/top-rated`, `/explorar`, `/buscar`, `/filme/:id`.

## Review Focus

1. Filme sem `backdrop_path`/`poster_path` → hero pula o filme; card mostra placeholder com o título (teste em `hero.test.ts`; visual).
2. Caminho malicioso no proxy (`movie/../account`, `person/1`, `search/person`, `movie/1/account_states`, `%2e%2e`) → 403 (teste em `_tmdb.test.ts`).
3. Dados faltando (`release_date: ""`, `runtime: 0`, `vote_average: 0`) → strings vazias (teste em `format.test.ts`).
4. Abrir/atualizar `/filme/<id>` direto → 200 (prévia da Vercel, Task 6).
5. 360px: fileiras rolam por dentro, página com overflow 0 (puppeteer, Task 6).

---

### Task 1: Vitest + formatação + seleção do hero

**Files:** Create `src/utils/format.ts`, `src/utils/format.test.ts`, `src/utils/hero.ts`, `src/utils/hero.test.ts`; Modify `package.json` (devDeps `vitest`, script `"test": "vitest run"`).

**Produces:**
- `formatNota(v?: number | null): string` — `7.493 → "7,5"`, `10 → "10,0"`, `0|null|undefined → ""`.
- `formatData(iso?: string | null): string` — `"2026-10-19" → "19 out. 2026"`, `"2026-05-01" → "1 mai. 2026"`; vazio/inválido → `""`. Parse manual (sem `new Date`, evita fuso). Meses: `jan. fev. mar. abr. mai. jun. jul. ago. set. out. nov. dez.`
- `formatDuracao(min?: number | null): string` — `112 → "1h 52min"`, `60 → "1h"`, `45 → "45min"`, `0|null → ""`.
- `ano(iso?: string | null): string` — `"2026-10-19" → "2026"`, vazio → `""`.
- `filmesDoHero<T extends { backdrop_path?: string | null; poster_path?: string | null }>(filmes: T[], max = 5): T[]` — só com backdrop E pôster, na ordem, até `max`.

- [ ] Escrever os testes acima (todos os casos listados), rodar `npx vitest run` → FAIL (módulos inexistentes).
- [ ] Implementar; `npx vitest run` → PASS.
- [ ] Commit `feat: pt-BR formatters and hero selection with tests`.

### Task 2: Proxy do TMDb, cliente único, fim da chave no navegador

**Files:** Create `api/_tmdb.ts`, `api/_tmdb.test.ts`, `api/tmdb.ts`, `vercel.json`, `src/services/tmdb.ts`; Modify `vite.config.ts`, `.env.example`, `src/composables/useMovies.ts`, `src/composables/useMovieDetail.ts`, `src/pages/Home.vue`, `src/pages/Explore.vue`, `package.json` (remove `axios`, `@types/axios`); `tsconfig` para incluir `api/` no type-check se preciso.

**Produces:**
- `api/_tmdb.ts`: `resolverAlvo(caminho: string, query: URLSearchParams, apiKey: string): URL | null` — normaliza (rejeita `..`, `%2e`, `//`, barra inicial), testa contra a lista permitida (Global Constraints, regex ancoradas), devolve `https://api.themoviedb.org/3/<caminho>?<query sem 'path' e sem 'api_key'>&api_key=<key>` e acrescenta `language=pt-BR` se ausente (exceto `watch/providers`, que fica sem). `null` = proibido.
- `api/tmdb.ts`: `export async function GET(request: Request): Promise<Response>` — lê `path` da query, `TMDB_API_KEY` do env (sem chave → 500 `{ error }`), `resolverAlvo` → `null` → 403; faz `fetch`, devolve corpo e status do TMDb com `content-type: application/json` e, se 200, `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`.
- `vercel.json`: rewrites na ordem — `{ "source": "/api/tmdb/:path*", "destination": "/api/tmdb?path=:path*" }`, depois `{ "source": "/((?!api/).*)", "destination": "/index.html" }`.
- `vite.config.ts`: plugin com `configureServer` e `configurePreviewServer` que atende `/api/tmdb/*` com `resolverAlvo` + `fetch`, chave de `loadEnv(mode, cwd, '').TMDB_API_KEY`.
- `src/services/tmdb.ts`: `tmdb<T>(caminho: string, params?: Record<string, string | number | undefined>): Promise<T>` — `fetch('/api/tmdb/' + caminho + '?' + params sem undefined)`, lança `Error` se `!ok`. Mais `IMG = (tam: 'w185'|'w342'|'w500'|'w1280', path?: string|null) => string | null`.
- `useMovies`/`useMovieDetail` mantêm os mesmos nomes e retornos, agora via `tmdb()`; `searchMovies` usa `search/movie`; ganham `getNowPlayingMovies(page)` e `getGenres()` (com cache em módulo).

- [ ] Testes de `resolverAlvo`: permitidos (`movie/popular`, `movie/123`, `movie/123/watch/providers`, `search/movie`, `discover/movie`, `genre/movie/list`) devolvem URL com `api_key` e sem `path`; proibidos (`person/1`, `search/person`, `movie/../account`, `movie/%2e%2e/x`, `movie/1/account_states`, `/movie/popular`, `movie//popular`) → `null`; `api_key` vinda do cliente é descartada. `npx vitest run api` → FAIL, implementar, → PASS.
- [ ] Chave local: `npx vercel link --yes --project cinematch` + `npx vercel env pull .env.local`; copiar o valor de `VITE_TMDB_API_KEY` para `TMDB_API_KEY` num `.env` (gitignored). Se a variável vier vazia (marcada como sensível), pedir a chave ao João.
- [ ] Implementar `api/tmdb.ts`, `vercel.json`, plugin do Vite, `src/services/tmdb.ts`; migrar as chamadas; remover `axios`.
- [ ] `grep -rnE "api_key|VITE_TMDB|themoviedb.org/3" src` → nada. `npm run build` → ok. `npm run dev` com `.env` local (`TMDB_API_KEY`) carrega a Home atual.
- [ ] Commit `feat: TMDb proxy on Vercel; API key never reaches the browser`.

### Task 3: Fundação visual + navbar + cards

**Files:** Modify `tailwind.config.js` (tokens `app.*` novos, `fontFamily.display: ['Bebas Neue']`, `sans: ['Inter']`), `index.html` (fontes, `theme-color`), `src/assets/tailwind.css`, `src/App.vue`, `src/components/Navbar.vue`, `src/router/index.ts` (rotas novas apontando por enquanto para um placeholder) ; Create `src/components/PosterCard.vue`, `src/components/MovieRow.vue`, `src/components/PosterGrid.vue`, `src/components/PageHeader.vue`, `src/components/ui/SkeletonPoster.vue`; Delete `src/style.css`, `src/components/CardSizeToggle.vue`, `src/components/MovieCard.vue`, `src/utils/movieGrid.ts`, `cardSize` do store.

**Produces:**
- `PosterCard` props `{ movie: { id; title; poster_path?; vote_average?; release_date? }, eager?: boolean }` — `router-link` para `/filme/:id`, pôster `w342`, nota `★ x,y` sobreposta (some se vazia), título + ano abaixo, placeholder com título se sem pôster.
- `MovieRow` props `{ titulo: string; filmes: Movie[]; verTudo?: string; carregando?: boolean }` — scroll nativo com `scroll-snap`, setas no desktop (rolam ~80% da largura), skeletons quando carregando.
- `PosterGrid` props `{ filmes; carregando; fim?: boolean }` + emit `mais` via IntersectionObserver.
- `PageHeader` props `{ titulo: string; subtitulo?: string }` com slot para filtros.
- Navbar: transparente com degradê no topo da Home e do Detalhe, sólida (`bg-app-bg/90 backdrop-blur`) ao rolar >40px ou nas outras páginas; links Início, Em cartaz, Em alta, Mais bem avaliados, Explorar com ativo âmbar; busca em ícone que expande o campo com sugestões (pôster `w185` + título + ano), Enter vai para `/buscar?q=`; celular: logo + busca + menu em painel de tela cheia.
- Botão "Topo" vira ícone redondo âmbar.

- [ ] Implementar; `npm run build` → ok; `npx vitest run` → PASS.
- [ ] Commit `feat: Sala escura foundation, navbar and poster components`.

### Task 4: Início, Em cartaz, Em alta, Mais bem avaliados, Explorar, Busca

**Files:** Create `src/components/HeroBanner.vue`, `src/pages/NowPlaying.vue`, `src/pages/Popular.vue`; Modify `src/pages/Home.vue`, `TopRated.vue`, `Explore.vue`, `Search.vue`, `src/router/index.ts`, `src/components/ui/AppInput.vue`, `AppSelect.vue` (tema).

**Produces:**
- `HeroBanner` props `{ filmes: Movie[]; generos: Record<number,string> }` — usa `filmesDoHero`; backdrop `w1280` (primeiro com `fetchpriority="high"`), degradês do mock, selo "● Em cartaz", título Bebas Neue, meta `★ nota · ano · gênero · gênero`, sinopse com `line-clamp-3`, botões "▶ Ver trailer" (`/filme/:id#trailer`) e "Detalhes"; troca a cada 7s com fade, pausa em hover/foco, indicadores clicáveis com `aria-label`. Altura ~78vh desktop, ~70vh celular (no celular o texto fica embaixo, sinopse 2 linhas). Skeleton enquanto carrega.
- Home: Hero + fileiras "Em cartaz" (`/em-cartaz`), "Em alta" (`/em-alta`), "Mais bem avaliados" (`/top-rated`).
- NowPlaying/Popular/TopRated: `PageHeader` + `PosterGrid` com scroll infinito.
- Explore: `PageHeader` + busca, gênero e ordenação (opções atuais) + `PosterGrid`. Search: idem, só campo.
- Estados vazio/erro com "Tentar de novo".

- [ ] Implementar; `npm run build` → ok; conferir no dev em 1280 e 390.
- [ ] Commit `feat: hero, rows and grid pages in Sala escura`.

### Task 5: Detalhe do filme

**Files:** Modify `src/pages/MovieDetail.vue`.

- Topo: backdrop `w1280` como fundo (degradê igual ao hero; sem backdrop → fundo liso com brilho âmbar suave), pôster `w500`, título Bebas Neue, meta `★ nota · ano · duração`, gêneros em chips de borda âmbar, direção/roteiro, sinopse, "Onde assistir" (logos `w45` com link). Em seguida `<section id="trailer">` (aspect-video, só se houver), elenco em fileira (foto `w185`, nome, personagem, placeholder com iniciais), recomendados com `MovieRow`.
- Ao trocar de `:id`, rola ao topo, ou à âncora `#trailer` se ela estiver na URL e existir.
- Skeleton do topo enquanto carrega; "Filme não encontrado" com link para o Início.

- [ ] Implementar; `npm run build` → ok; conferir um filme com e sem trailer.
- [ ] Commit `feat: movie detail page in Sala escura`.

### Task 6: Verificação, prévia na Vercel e README

**Files:** Modify `README.md` (visual novo, proxy, como rodar com `TMDB_API_KEY`); scripts de verificação fora do repo.

- [ ] `npx vitest run` e `npm run build` → ok; `grep -rE "api_key|themoviedb.org/3" dist` → nada.
- [ ] Puppeteer no `vite preview` em 1280×800 e 390×844: `/`, `/em-cartaz`, `/explorar`, `/buscar?q=batman`, `/filme/<id>` com e sem trailer → screenshots, `scrollWidth - innerWidth = 0`, 0 erros de console.
- [ ] Criar `TMDB_API_KEY` na Vercel (Production + Preview) com `npx vercel env add`, usando o valor do `.env` local. Push da branch; na prévia: `/filme/<id>` direto → 200, `/api/tmdb/movie/popular` → 200 com JSON, `/api/tmdb/person/1` → 403, nenhuma requisição do navegador a `api.themoviedb.org`.
- [ ] Commit `docs: README for the new CineMatch`.
- [ ] Mostrar prints antes/depois ao João; merge em `main` só com o ok dele.
