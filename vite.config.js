import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin customizado para API endpoints que lêem as pastas Pets, Values e servem Images diretamente
function valueListApiPlugin() {
  return {
    name: 'valuelist-api-plugin',
    configureServer(server) {
      // 1. Endpoint /api/collection que lê diretamente das pastas Pets e Values
      server.middlewares.use('/api/collection', (req, res, next) => {
        try {
          const baseDir = path.resolve(__dirname)
          const petsDir = path.join(baseDir, 'Pets')
          const valuesDir = path.join(baseDir, 'Values')

          // Ler todos os arquivos JSON de Pets recursivamente
          const allPets = []
          function walk(dir) {
            const files = fs.readdirSync(dir)
            for (const f of files) {
              const full = path.join(dir, f)
              const stat = fs.statSync(full)
              if (stat.isDirectory()) {
                walk(full)
              } else if (f.endsWith('.json')) {
                const rel = path.relative(petsDir, full)
                const valPath = path.join(valuesDir, rel)

                const petContent = JSON.parse(fs.readFileSync(full, 'utf-8'))
                let valContent = {}
                if (fs.existsSync(valPath)) {
                  valContent = JSON.parse(fs.readFileSync(valPath, 'utf-8'))
                }

                allPets.push({
                  ...petContent,
                  normalValue: valContent.normalValue ?? 'N/F',
                  goldenValue: valContent.goldenValue ?? 'N/F',
                  rainbowValue: valContent.rainbowValue ?? 'N/F',
                  darkMatterValue: valContent.darkMatterValue ?? 'N/F',
                  demand: valContent.demand ?? 'N/F',
                  trend: valContent.trend ?? 'N/F',
                  relPath: rel.replace(/\\/g, '/')
                })
              }
            }
          }

          walk(petsDir)

          // Ordenar numericamente por ID para manter a ordem exata do jogo (Cat, Dog, Bunny...)
          allPets.sort((a, b) => {
            const numA = parseInt(a.id, 10) || 0
            const numB = parseInt(b.id, 10) || 0
            return numA - numB
          })

          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(allPets))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: e.message }))
        }
      })

      // 2. Servir a pasta Images/ diretamente
      server.middlewares.use('/Images', (req, res, next) => {
        const pathname = req.url.split('?')[0]
        const decodedUrl = decodeURIComponent(pathname)
        const filePath = path.join(__dirname, 'Images', decodedUrl)
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader('Content-Type', 'image/png')
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
          fs.createReadStream(filePath).pipe(res)
        } else {
          next()
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), valueListApiPlugin()],
  server: {
    port: 3000,
    open: true
  }
})
