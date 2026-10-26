import { defineConfig, loadEnv, type Plugin, type Connect } from 'vite'
import vue from '@vitejs/plugin-vue'
import { responderTmdb } from './api/_tmdb'

// Em dev e no preview, /api/tmdb/* é atendido aqui com a mesma regra da função da Vercel.
const proxyTmdb = (apiKey?: string): Plugin => {
  const middleware: Connect.NextHandleFunction = async (req, res, next) => {
    if (!req.url?.startsWith('/api/tmdb/')) return next()
    const url = new URL(req.url, 'http://localhost')
    const resposta = await responderTmdb(url.pathname.slice('/api/tmdb/'.length), url.searchParams, apiKey)
    res.statusCode = resposta.status
    resposta.headers.forEach((v, k) => res.setHeader(k, v))
    res.end(await resposta.text())
  }
  return {
    name: 'proxy-tmdb',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue(), proxyTmdb(loadEnv(mode, process.cwd(), '').TMDB_API_KEY)],
}))
