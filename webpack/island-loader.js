const path = require('path')
const fs = require('fs')

function buildIslandClient(name, importPath) {
  const ce = 'island' + name.replace(/([A-Z])/g, '-$1').toLowerCase()
  return `import { h, hydrate } from 'preact'; 
  
customElements.define("${ce}", class Island${name} extends HTMLElement { 
  async connectedCallback() {
      const c =await import(${JSON.stringify(importPath)}); 
      const props = JSON.parse(this.dataset.props || '{}'); hydrate(h(c.default, props), this);
  } 
})`
}

module.exports = function (source) {
  if (!this.resourcePath.endsWith('.island.js')) {
    return source
  }

  const genPath = path.resolve(__dirname, '../.generated')
  fs.mkdirSync(genPath, { recursive: true })
  const fileName = path.basename(this.resourcePath)
  const fpath = path.join(genPath, fileName.replace('.js', '.client.js'))

  let funcName
  let modified = source
    .replace(/(export default function (\w+))/, (_ignore, _ignore2, name) => {
      funcName = name
      return 'function Component'
    })
    .replace('export default', '')

  const code = buildIslandClient(
    funcName,
    path.relative(path.resolve('.generated'), this.resourcePath)
  )
  fs.writeFileSync(fpath, code, 'utf8')

  const ce = 'island' + funcName.replace(/([A-Z])/g, '-$1').toLowerCase()

  modified =
    modified +
    `export default function Island${funcName}(props){return h("${ce}", { "data-props": JSON.stringify(
          props
        ) }, h(Component,
          props));}`

  return modified
}
