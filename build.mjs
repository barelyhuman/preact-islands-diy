import * as esbuild from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'
import fs from 'fs/promises'
import glob from 'tiny-glob'
import * as url from 'url'
import Watcher from 'watcher'
import { preactIslandPlugin } from './utils/esbuild.mjs'

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
    plugins: [
      nodeExternalsPlugin(),
      preactIslandPlugin({
        cwd: url.fileURLToPath(new URL('.', import.meta.url)),
      }),
    ],
    outfile: 'dist/server.js',
  })

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
