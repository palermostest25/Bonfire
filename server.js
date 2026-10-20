// Self-hosted server: serves the built app from ./dist and replaces the
// Cloudflare Worker signaling store with an in-memory one at /signal/<key>.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const PORT = Number(process.env.PORT) || 8080
const DIST = join(import.meta.dirname, 'dist')
const TTL = 6 * 60 * 60 * 1000
const MAX_BODY = 64 * 1024

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.otf': 'font/otf',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
}

const rooms = new Map()
setInterval(() => {
  const now = Date.now()
  for (const [key, { expires }] of rooms) if (expires < now) rooms.delete(key)
}, 60 * 1000).unref()

function signal(req, res, key) {
  if (!/^[\w-]{1,64}$/.test(key)) return send(res, 404, 'not found')
  if (req.method === 'GET') {
    const entry = rooms.get(key)
    if (!entry || entry.expires < Date.now()) return send(res, 404, 'waiting')
    return send(res, 200, entry.value)
  }
  if (req.method === 'PUT') {
    let body = ''
    req.on('data', chunk => {
      body += chunk
      if (body.length > MAX_BODY) req.destroy()
    })
    req.on('end', () => {
      rooms.set(key, { value: body, expires: Date.now() + TTL })
      send(res, 200, 'ok')
    })
    return
  }
  send(res, 405, 'method not allowed')
}

async function file(res, pathname) {
  const path = normalize(join(DIST, decodeURIComponent(pathname)))
  if (!path.startsWith(DIST)) return send(res, 404, 'not found')
  let target = path
  try {
    if ((await stat(target)).isDirectory()) target = join(target, 'index.html')
  } catch {
    target = join(DIST, 'index.html')
  }
  try {
    const data = await readFile(target)
    const cache = target.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache'
    res.writeHead(200, { 'Content-Type': TYPES[extname(target)] ?? 'application/octet-stream', 'Cache-Control': cache })
    res.end(data)
  } catch {
    send(res, 404, 'not found')
  }
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'text/plain' })
  res.end(body)
}

createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost')
  if (pathname === '/healthz') return send(res, 200, 'ok')
  if (pathname.startsWith('/signal/')) return signal(req, res, pathname.slice('/signal/'.length))
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'method not allowed')
  file(res, pathname)
}).listen(PORT, () => console.log(`bonfire listening on :${PORT}`))
