const path = require('path')
const fs = require('fs')

function buildIslandClient(name, importPath) {
  const ce = getIslandName(name)
  return `import { h, hydrate } from 'preact'; 
  
customElements.define("${ce}", class Island${name} extends HTMLElement { 
  async connectedCallback() {
      const c =await import(${JSON.stringify(importPath)}); 
      const props = JSON.parse(this.dataset.props || '{}'); hydrate(h(c.default, props), this);
  } 
})`
}

function getComponentName(source) {
  const matched = source.match(/export default function (\w+)/)
  return matched[1]
}

function getIslandName(name) {
  return 'island' + name.replace(/([A-Z])/g, '-$1').toLowerCase()
}

function createGeneratedDir() {
  const genPath = path.resolve(__dirname, '../.generated')
  fs.mkdirSync(genPath, { recursive: true })
  return genPath
}

module.exports = function (source) {
  if (!this.resourcePath.endsWith('.island.js')) {
    return source
  }

  const genPath = createGeneratedDir()
  const fileName = path.basename(this.resourcePath)
  const fpath = path.join(genPath, fileName.replace('.js', '.client.js'))

  let funcName = getComponentName(source)

  let modified = source
    .replace(/(export default function (\w+))/, (_ignore, _ignore2, name) => {
      return 'function Component'
    })
    .replace('export default', '')

  const code = buildIslandClient(
    funcName,
    path.relative(genPath, this.resourcePath)
  )

  fs.writeFileSync(fpath, code, 'utf8')

  const islandName = getIslandName(funcName)

  modified =
    modified +
    `export default function Island${funcName}(props){return h("${islandName}", { "data-props": JSON.stringify(
          props
        ) }, h(Component,
          props));}`

  return modified
}
