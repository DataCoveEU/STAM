import { spawn } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const port = Number(process.env.PORT) || 3000
const contentTypes = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.map': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
}

const watcher = spawn('pnpm', ['tsdown', '--watch', '--no-dts'], { cwd: root, stdio: 'inherit' })

const server = createServer(async (request, response) => {
    const requestPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname)
    const pathname = requestPath === '/' ? '/example/leaflet.html' : requestPath
    const filePath = resolve(root, `.${normalize(pathname)}`)

    if (!relative(root, filePath) || relative(root, filePath).startsWith('..')) {
        response.writeHead(403)
        response.end('Forbidden')
        return
    }

    try {
        const fileStats = await stat(filePath)
        if (!fileStats.isFile()) throw new Error('Not a file')
        response.writeHead(200, {
            'Content-Type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
        })
        createReadStream(filePath).pipe(response)
    } catch {
        response.writeHead(404)
        response.end('Not found')
    }
})

server.listen(port, () => {
    console.log(`Leaflet example available at http://localhost:${port}/`)
})

const shutdown = () => {
    watcher.kill('SIGTERM')
    server.close()
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
watcher.once('exit', (code) => {
    if (code !== 0) process.exitCode = code ?? 1
})
