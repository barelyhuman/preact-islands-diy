import { transform } from '@babel/core'
import pluginTransform from '@babel/plugin-transform-react-jsx'
import * as acorn from 'acorn'
import jsx from 'acorn-jsx'
import fs from 'fs/promises'

const jsxParser = acorn.Parser.extend(jsx())

const preactImportAST = {
  type: 'ImportDeclaration',
  specifiers: [
    {
      type: 'ImportSpecifier',
      imported: {
        type: 'Identifier',
        name: 'h',
      },
      local: {
        type: 'Identifier',
        name: 'h',
      },
    },
  ],
  source: {
    type: 'Literal',
    value: 'preact',
  },
}

export function buildIslandClient(name, importPath) {
  const islandName = getIslandName(name)
  return `import { h, hydrate } from 'preact'; 
  
customElements.define("${islandName}", class Island${name} extends HTMLElement { 
  async connectedCallback() {
      const c =await import(${JSON.stringify(importPath)}); 
      const props = JSON.parse(this.dataset.props || '{}'); hydrate(h(c.default, props), this);
  } 
})`
}

function getIslandName(name) {
  return 'island' + name.replace(/([A-Z])/g, '-$1').toLowerCase()
}

const convertJSXToBrowser = code => {
  const transformedCode = transform(code, {
    sourceType: 'unambiguous',
    plugins: [
      [pluginTransform, { runtime: 'automatic', importSource: 'preact' }],
    ],
  }).code

  return transformedCode
}

export async function wrapSourceWithIslandWrapper(ogFilePath) {
  const fileData = await fs.readFile(ogFilePath, 'utf-8')

  const ast = jsxParser.parse(convertJSXToBrowser(fileData), {
    sourceType: 'module',
    ecmaVersion: 2020,
  })

  const exportDefs = []

  let funcName = ''
  let hasPreactImport = false
  let hasHImport = false

  // TODO: simplify
  ast.body.forEach((child, index) => {
    if (child.type === 'ExportDefaultDeclaration') {
      exportDefs.push(child)

      if (child.declaration.type === 'Identifier') {
        funcName = child.declaration.name
        ast.body.splice(index, 1)
        return
      }

      if (child.declaration.type === 'FunctionDeclaration') {
        const func = child.declaration
        if (func.id && func.id.type === 'Identifier') {
          funcName = func.id.name
        } else {
          throw new Error(
            `[island-loader] ${ogFilePath} doesn't export a named default`
          )
        }
        ast.body.splice(index, 1, func)
        return
      }
    }

    if (child.type === 'ImportDeclaration') {
      if (child.source.type === 'Literal' && child.source.value === 'preact') {
        hasPreactImport = true
      }
      if (
        hasPreactImport &&
        child.specifiers.findIndex(x => x.imported.name === 'h') > -1
      ) {
        hasHImport = true
      }
    }
  })

  if (!hasHImport) {
    ast.body.unshift(preactImportAST)
  }

  ast.body.push(buildIslandServerAST(funcName))

  return {
    funcName,
    ast,
  }
}

export function buildIslandServerAST(name) {
  const islandName = getIslandName(name)
  return {
    type: 'ExportDefaultDeclaration',
    declaration: {
      type: 'FunctionDeclaration',
      id: {
        type: 'Identifier',
        name: `Island${name}`,
      },
      expression: false,
      generator: false,
      async: false,
      params: [
        {
          type: 'Identifier',
          name: 'props',
        },
      ],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'ReturnStatement',
            argument: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'h',
              },
              arguments: [
                {
                  type: 'Literal',
                  value: islandName,
                },
                {
                  type: 'ObjectExpression',
                  properties: [
                    {
                      type: 'Property',
                      method: false,
                      shorthand: false,
                      computed: false,
                      key: {
                        type: 'Literal',
                        value: 'data-props',
                        raw: '"data-props"',
                      },
                      value: {
                        type: 'CallExpression',
                        callee: {
                          type: 'MemberExpression',
                          object: {
                            type: 'Identifier',
                            name: 'JSON',
                          },
                          property: {
                            type: 'Identifier',
                            name: 'stringify',
                          },
                          computed: false,
                          optional: false,
                        },
                        arguments: [
                          {
                            type: 'Identifier',
                            name: 'props',
                          },
                        ],
                        optional: false,
                      },
                      kind: 'init',
                    },
                  ],
                },
                {
                  type: 'CallExpression',

                  callee: {
                    type: 'Identifier',
                    name: 'h',
                  },
                  arguments: [
                    {
                      type: 'Identifier',
                      name: name,
                    },
                    {
                      type: 'Identifier',
                      name: 'props',
                    },
                  ],
                  optional: false,
                },
              ],
              optional: false,
            },
          },
        ],
      },
    },
  }
}
