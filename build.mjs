import * as esbuild from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'
import escodegen from 'escodegen'
import fs from 'fs/promises'
import path from 'path'
import glob from 'tiny-glob'
import * as url from 'url'
import Watcher from 'watcher'
import {
  buildIslandClient,
  wrapSourceWithIslandWrapper,
} from './utils/island.mjs'

const watch = process.argv.slice(2).includes('-w')

const commonConfig = {
  bundle: true,
  logLevel: 'info',
  jsx: 'automatic',
  loader: {
    '.js': 'jsx',
  },
  target: 'node14',
  format: 'cjs',
  jsxImportSource: 'preact',
}

const generateManifest = async () => {
  const entryPoints = await glob('./**/*.client.js', {
    absolute: false,
    cwd: './.generated',
  })
  await fs.writeFile(
    './.generated/client.js',
    entryPoints.map(x => `import "./${x}";`).join('\n'),
    'utf8'
  )
}

const client = async () => {
  esbuild.build({
    ...commonConfig,
    entryPoints: ['./.generated/client.js'],
    minify: true,
    splitting: true,
    // because of this, it's right now limited to esm
    // https://github.com/evanw/esbuild/issues/16
    format: 'esm',
    platform: 'browser',
    outdir: 'dist/js',
  })
}

const server = () =>
  esbuild.build({
    ...commonConfig,
    platform: 'node',
    entryPoints: ['src/server/app.js'],
    plugins: [nodeExternalsPlugin(), preactIslandPlugin()],
    outfile: 'dist/server.js',
  })

function preactIslandPlugin() {
  return {
    name: 'preact-island-plugin',
    setup: async function (build) {
      build.onLoad({ filter: /\.island\.js$/ }, async args => {
        const ogFilePath = args.path

        const { funcName, ast } = await wrapSourceWithIslandWrapper(ogFilePath)

        const genPath = await createGeneratedDir()
        const fileName = path.basename(ogFilePath)
        const fpath = path.join(genPath, fileName.replace('.js', '.client.js'))
        const code = buildIslandClient(
          funcName,
          path.relative(genPath, ogFilePath)
        )

        await fs.writeFile(fpath, code, 'utf8')

        return {
          contents: escodegen.generate(ast),
          loader: 'jsx',
        }
      })
    },
  }
}

async function main() {
  await server()
  await generateManifest()
  await client()
}

// if watching, watcher will execute an
// initial build
!watch && (await main())

if (watch) {
  const gPaths = await glob('./src/**/*.js', { absolute: true })
  const watcher = new Watcher(gPaths)
  watcher.on('error', error => {
    console.error(error)
  })

  watcher.on('close', () => {
    process.exit(0)
  })

  watcher.on('all', async () => {
    await main()
  })
}

async function createGeneratedDir() {
  const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
  const genPath = path.resolve(__dirname, './.generated')
  await fs.mkdir(genPath, { recursive: true })
  return genPath
}
