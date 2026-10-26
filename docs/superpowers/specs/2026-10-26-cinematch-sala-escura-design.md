# CineMatch — identidade "Sala escura" + chave no servidor

## Intenção

O CineMatch está no portfólio do João (jteixeira.dev) e é aberto por recrutadores
e avaliadores técnicos. Hoje ele parece um projeto antigo: visual de template
(cinza + roxo genérico), dados crus ("Nota: 7.493", "2026-10-07"), e dois
problemas técnicos visíveis para quem olha com atenção — a chave do TMDb exposta
no navegador e links diretos de filme que dão 404.

O objetivo é que ele fique bonito e bem estruturado, **no mesmo nível do DealsGamer**
(dealsgamer.com), com identidade própria e forte: a direção escolhida é a
**A · Sala escura** (estilo Netflix), aprovada no mock
`docs/superpowers/specs/2026-10-26-cinematch-direcoes-mock.html` (opção A; as opções B e C foram descartadas).

## Objetivos

1. Identidade "Sala escura" em todas as telas: Início, Detalhe, Mais bem avaliados,
   Explorar, Busca, navbar e estados (carregando, vazio, erro).
2. Dados formatados em pt-BR: nota `★ 7,6`, data `19 out. 2026`, duração `1h 52min`.
3. Chave do TMDb só no servidor (função da Vercel), nunca no bundle.
4. Links diretos (`/filme/123`, `/explorar`…) funcionam ao abrir ou atualizar.
5. Bom no celular (360–430px) e no desktop (1280+).

## Não-objetivos

- Migrar para Nuxt/SSR, contas de usuário, favoritos, "minha lista".
- Mudar as fontes de dados ou as funcionalidades existentes (busca com sugestões,
  filtros do Explorar, scroll infinito, trailer, elenco, onde assistir, recomendados).
- Versão em inglês.

## Anti-objetivos (seria fracasso mesmo funcionando)

- Parecer um clone da Netflix (logo vermelho, mesma marca). A identidade é própria:
  preto + âmbar, título de cartaz.
- Qualquer chamada ao TMDb saindo do navegador com `api_key`.
- Hero com imagem quebrada ou texto ilegível quando o filme não tem imagem larga.
- Rolagem horizontal da página no celular.

## Abordagens consideradas

1. **Reformar o projeto atual** (Vue 3 + Vite + Tailwind 3 + Pinia) e adicionar uma
   função da Vercel em `api/` como proxy do TMDb. **Escolhida pelo João.**
   Aproveita toda a lógica que funciona; poucos dias.
2. Migrar para Nuxt como o DealsGamer — SSR e SEO por filme, mas é reescrever, e os
   dois projetos do portfólio mostrariam a mesma coisa.
3. Começar do zero — mesmo resultado que a 1, jogando fora código que funciona.

## Identidade visual (decidido no mock A)

- **Fundo** preto quase puro `#070707`; superfícies `#111113` / `#18181b`; bordas `#26262b`.
- **Acento âmbar** `#fbbf24` (luz de cinema): logo, nota, selo, botão principal, foco.
- **Tipografia**: títulos de cartaz em **Bebas Neue** (logo `CINEMATCH`, título do
  filme no hero e no detalhe); interface em **Inter**.
- **Navbar** transparente sobre o hero, com degradê preto em cima; ao rolar, fica
  sólida (preto com blur). Links: Início, Em alta, Mais bem avaliados, Explorar. Busca
  vira um ícone que abre o campo (mantém as sugestões com pôster).
- **Hero (Início)**: imagem larga do filme (backdrop `w1280`) ocupando a largura,
  degradê do preto da esquerda e de baixo; selo "● Em cartaz", título em Bebas Neue,
  meta (`★ 7,6 · 2026 · Gênero · Gênero`), sinopse curta (3 linhas), botões
  "▶ Ver trailer" (âmbar) e "Detalhes" (vidro). Alterna entre os 5 primeiros filmes
  em cartaz que tenham backdrop, a cada ~7s, com indicador; pausa no hover.
- **Fileiras** (Início): "Em cartaz", "Em alta" (populares), "Mais bem avaliados" —
  rolagem horizontal com setas no desktop e arraste no celular; cada fileira tem
  "Ver tudo →" para a página correspondente. Pôster com cantos 6px, zoom leve no hover
  e nota sobreposta.
- **Detalhe**: backdrop como fundo do topo da página (mesmo degradê do hero), pôster
  ao lado, título em Bebas Neue, meta formatada, gêneros como chips com borda âmbar,
  direção/roteiro, sinopse, "Onde assistir" com logos. Abaixo: trailer, elenco
  (fileira com fotos redondas ou retrato), recomendados (fileira).
- **Grades** (Mais bem avaliados, Explorar, Busca): cabeçalho da página em Bebas
  Neue, grade de pôsteres responsiva com o mesmo card das fileiras; filtros do
  Explorar como selects estilizados no tema.
- **Estados**: skeletons no formato do pôster e do hero (não spinner genérico);
  vazio e erro com mensagem e ação ("Tentar de novo").

## Decisões técnicas

- **Proxy**: função Vercel `api/tmdb/[...path].ts` repassa `GET` para
  `https://api.themoviedb.org/3/<path>` adicionando `api_key` da env `TMDB_API_KEY`
  e `language=pt-BR` quando ausente. Só aceita caminhos sob `movie/`, `search/`,
  `discover/`, `genre/` (lista permitida) e só `GET`. Responde com
  `Cache-Control: s-maxage=3600, stale-while-revalidate=86400` (dados públicos; reduz
  chamadas ao TMDb). Erros do TMDb repassam o status.
- **Cliente**: um único módulo de API (`src/services/tmdb.ts`) chamado por todos os
  composables e páginas; base `/api/tmdb`. Remove todas as chamadas diretas com
  `VITE_TMDB_API_KEY` (há algumas espalhadas em Home, Explore e useMovieDetail).
- **Desenvolvimento local**: `vite.config.ts` com proxy `/api/tmdb` → TMDb injetando
  a chave de `TMDB_API_KEY` do `.env` (lida só no Node, não exposta ao bundle), para
  `npm run dev` funcionar sem `vercel dev`. `.env.example` atualizado.
- **SPA na Vercel**: `vercel.json` com rewrite de tudo que não é `/api/*` nem arquivo
  para `/index.html`.
- **Formatação**: funções puras em `src/utils/format.ts` (`formatNota`,
  `formatData`, `formatDuracao`, `ano`), com testes Vitest. Vitest entra como
  dependência de desenvolvimento (o projeto não tem testes hoje).
- **Fontes** Bebas Neue e Inter via Google Fonts no `index.html` com `preconnect`
  e `display=swap`.
- Remover `src/style.css` (resto do template do Vite, não importado) e o seletor de
  tamanho de card (`CardSizeToggle`, `cardSize` no store, `movieGrid.ts`) — não combina
  com a identidade de fileiras; o João foi avisado.
- `vue3-carousel` sai se as fileiras forem feitas com scroll nativo (`scroll-snap`);
  a escolha é do builder.

## Restrições

- Sem migração de framework; Tailwind continua na v3.
- Acessibilidade: contraste AA no texto sobre imagem (degradê garante), foco visível
  âmbar, `alt` nos pôsteres, botões com nome acessível, hero com controle de pausa
  implícito no hover/foco.
- Desempenho: imagens com `loading="lazy"` fora do hero; hero com `w1280`, pôsteres
  `w342`.

## Entrega e publicação

- Branch `jpst-dev/sala-escura` no repositório `jpst-dev/cinematch`.
- Antes de publicar: prints antes/depois (desktop e celular) para o João aprovar.
- Na Vercel: criar `TMDB_API_KEY` (o João dá acesso pela CLI; usar `npx vercel`),
  merge em `main` só com o ok dele. Depois, recomendar trocar a chave antiga no TMDb,
  que ficou pública.
- Atualizar o README do CineMatch (features e o proxy) e o screenshot do projeto no
  portfólio (`jteixeira`, `public/projetos/`) em seguida, como tarefa separada.

## Deixado para o builder

- Estrutura de componentes (ex.: `HeroBanner`, `MovieRow`, `PosterCard`, `PageHeader`).
- Scroll nativo vs. `vue3-carousel` nas fileiras.
- Ícones (lucide-vue-next já está instalado).
- Detalhes de animação, desde que discretos.

## Decisões tomadas por mim (Claude) após a revisão do builder

Revise estas — são escolhas minhas, não do João:

- **Rotas novas**: `/em-cartaz` (now_playing) e `/em-alta` (popular) viram páginas de
  grade com scroll infinito, como `/top-rated`. O link "Em alta" da navbar e o
  "Ver tudo →" de cada fileira levam a elas. O Início deixa de ter grade infinita
  (vira hero + fileiras). Links: Início, Em cartaz, Em alta, Mais bem avaliados, Explorar.
- **"▶ Ver trailer" no hero** leva ao detalhe do filme na âncora `#trailer`
  (`/filme/:id#trailer`), sem modal — evita buscar vídeos dos 5 filmes do hero.
  No detalhe, sem trailer, a seção some e a âncora cai no topo.
- **Busca só de filmes**: o proxy permite `search/movie` (não `search/` inteiro) e o
  placeholder vira "Buscar filmes". Lista permitida exata: `movie/…`, `search/movie`,
  `discover/movie`, `genre/movie/list`.
- **Navbar no celular**: logo + ícone de busca + botão de menu; o menu abre um painel
  de tela cheia escuro com os links grandes.
- **Vercel**: o projeto `cinematch` existe e está ligado ao GitHub (preset Vite,
  `main` publica em produção, branches geram prévia). `TMDB_API_KEY` é criada para
  Production e Preview antes do push da branch; a prévia da branch é onde o proxy é
  verificado antes do merge.
- **HTTP**: `axios` sai; o cliente usa `fetch` (uma dependência a menos).
