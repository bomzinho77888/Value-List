import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const baseDir = path.resolve(__dirname)
const petsDir = path.join(baseDir, 'Pets')
const valuesDir = path.join(baseDir, 'Values')

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
        normalValue: valContent.normalValue ?? 'N/A',
        goldenValue: valContent.goldenValue ?? 'N/A',
        rainbowValue: valContent.rainbowValue ?? 'N/A',
        darkMatterValue: valContent.darkMatterValue ?? 'N/A',
        demand: valContent.demand ?? 'N/A',
        trend: valContent.trend ?? 'N/A',
        relPath: rel.replace(/\\/g, '/')
      })
    }
  }
}

walk(petsDir)

allPets.sort((a, b) => {
  const numA = parseInt(a.id, 10) || 0
  const numB = parseInt(b.id, 10) || 0
  return numA - numB
})

if (!fs.existsSync(path.join(baseDir, 'public'))) {
  fs.mkdirSync(path.join(baseDir, 'public'))
}

fs.writeFileSync(path.join(baseDir, 'collection.json'), JSON.stringify(allPets, null, 2), 'utf-8')
fs.writeFileSync(path.join(baseDir, 'public', 'collection.json'), JSON.stringify(allPets, null, 2), 'utf-8')

console.log(`Successfully generated collection.json with ${allPets.length} pets!`)
