import console from 'node:console'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const outputPath = path.join(root, 'docs', 'AGENT_FILE_MAP.md')

const sections = [
  {
    title: 'Pages',
    dir: 'app/pages',
    filter: (file) => file.endsWith('.vue'),
  },
  {
    title: 'Composables',
    dir: 'app/composables',
    filter: (file) => file.endsWith('.ts'),
  },
  {
    title: 'Presentation ViewModels',
    dir: 'src/presentation/view-models',
    filter: (file) => file.endsWith('.ts'),
  },
  {
    title: 'Application UseCases',
    dir: 'src/application/use-cases',
    filter: (file) => file.endsWith('.ts'),
  },
  {
    title: 'Application DTOs',
    dir: 'src/application/dto',
    filter: (file) => file.endsWith('.ts'),
  },
  {
    title: 'Application Ports',
    dir: 'src/application/ports',
    filter: (file) => file.endsWith('.ts'),
  },
  {
    title: 'Domain Repositories',
    dir: 'src/domain/repositories',
    filter: (file) => file.endsWith('.ts'),
  },
  {
    title: 'Infrastructure ServiceLocators',
    dir: 'src/infrastructure',
    filter: (file) => file.endsWith('service-locator.ts'),
  },
  {
    title: 'Infrastructure RemoteDataSources',
    dir: 'src/infrastructure',
    filter: (file) => file.includes('/remote/') && file.endsWith('.ts'),
  },
  {
    title: 'Infrastructure Repository Implementations',
    dir: 'src/infrastructure',
    filter: (file) =>
      (file.includes('/repositories/') || file.includes('/repository')) && file.endsWith('.ts'),
  },
  {
    title: 'Server API',
    dir: 'server/api',
    filter: (file) => file.endsWith('.ts'),
  },
  {
    title: 'Server Utils',
    dir: 'server/utils',
    filter: (file) => file.endsWith('.ts'),
  },
]

async function walk(dir, base = dir) {
  const absoluteDir = path.join(root, dir)
  try {
    const entries = await fs.readdir(absoluteDir, { withFileTypes: true })
    const files = await Promise.all(
      entries.map(async (entry) => {
        const relativePath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          return walk(relativePath, base)
        }

        return [relativePath]
      }),
    )

    return files.flat().sort()
  } catch {
    return []
  }
}

function groupByFeature(files) {
  const groups = new Map()

  for (const file of files) {
    const parts = file.split(path.sep)
    const feature =
      parts.find((part) =>
        [
          'auth',
          'appointments',
          'assistants',
          'dashboard',
          'patients',
          'services',
          'calendar',
          'settings',
        ].includes(part),
      ) ?? 'shared'

    if (!groups.has(feature)) {
      groups.set(feature, [])
    }

    groups.get(feature).push(file)
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
}

async function main() {
  const lines = []

  lines.push('# Agent File Map')
  lines.push('')
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('Este archivo se genera con `pnpm docs:update` y muestra la distribucion actual del codigo por capa y feature.')
  lines.push('')

  for (const section of sections) {
    const allFiles = await walk(section.dir)
    const matching = allFiles.filter(section.filter)

    lines.push(`## ${section.title}`)
    lines.push('')

    if (matching.length === 0) {
      lines.push('_Sin archivos detectados._')
      lines.push('')
      continue
    }

    for (const [feature, files] of groupByFeature(matching)) {
      lines.push(`### ${feature}`)
      lines.push('')

      for (const file of files) {
        lines.push(`- \`${file}\``)
      }

      lines.push('')
    }
  }

  await fs.writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8')
  console.log(`Generated ${path.relative(root, outputPath)}`)
}

await main()
