import * as esbuild from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'
import manifestPlugin from 'esbuild-plugin-manifest'
import glob from 'tiny-glob'
import Watcher from 'watcher'

const watch = process.argv.slice(2).includes('-w')

const entryPoints = await glob('./src/client/**/*.js', { absolute: true })

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

const client = () =>
  esbuild.build({
    ...commonConfig,
    entryPoints: entryPoints,
    splitting: true,
    // because of this, it's right now limited to esm
    // https://github.com/evanw/esbuild/issues/16
    format: 'esm',
    platform: 'browser',
    outdir: 'dist/js',
    plugins: [
      manifestPlugin({
        shortNames: true,
        generate(entries) {
          const filtered = Object.fromEntries(
            Object.entries(entries)
              .map(([k, v]) => (/\.mount\.js$/.test(k) ? [k, v] : []))
              .filter(x => x[0])
          )
          return filtered
        },
      }),
    ],
  })

const server = () =>
  esbuild.build({
    ...commonConfig,
    platform: 'node',
    entryPoints: ['src/server/app.js'],
    plugins: [nodeExternalsPlugin()],
    outfile: 'dist/server.js',
  })

async function main() {
  // need the manifest to exist before building server
  await client()
  await server()
  // process.exit(0)
}

// if watching, watcher will execute an
// initial build
!watch && (await main())

if (watch) {
  const gPaths = await glob('./src/**/*.js', { absolute: true })
  const watcher = new Watcher(gPaths)
  watcher.on('error', error => {
    console.log(error instanceof Error) // => true, "Error" instances are always provided on "error"
  })

  watcher.on('close', () => {
    process.exit(0)
  })

  watcher.on('all', async () => {
    await main()
  })
}
