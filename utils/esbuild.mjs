import fs from 'fs/promises'
import path from 'path'
import { sourceToIslands } from './island.mjs'

export function preactIslandPlugin({ cwd } = { cwd: '.' }) {
  return {
    name: 'preact-island-plugin',
    setup: async function (build) {
      build.onLoad({ filter: /\.island\.js$/ }, async args => {
        const ogFilePath = args.path

        const { server, client } = await sourceToIslands(ogFilePath)

        const genPath = await createGeneratedDir({ cwd })
        const fileName = path.basename(ogFilePath)
        const fpath = path.join(genPath, fileName.replace('.js', '.client.js'))
        await fs.writeFile(fpath, client, 'utf8')

        return {
          contents: server,
          loader: 'jsx',
        }
      })
    },
  }
}

async function createGeneratedDir({ cwd }) {
  const genPath = path.resolve(cwd, './.generated')
  await fs.mkdir(genPath, { recursive: true })
  return genPath
}
