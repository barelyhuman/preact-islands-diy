import _generate from '@babel/generator'
import { parse as jsxParser } from '@babel/parser'
import fs from 'fs/promises'

const generate = _generate.default

const PREACT_IMPORT_AST = {
  type: 'ImportDeclaration',
  specifiers: [
    {
      type: 'ImportSpecifier',
      imported: {
        type: 'Identifier',
        name: 'h',
      },
      importKind: null,
      local: {
        type: 'Identifier',
        name: 'h',
      },
    },
  ],
  importKind: 'value',
  source: {
    type: 'StringLiteral',
    value: 'preact',
  },
}

export async function sourceToIslands(sourcePath) {
  const source = await fs.readFile(sourcePath, 'utf-8')
  const ast = jsxParser(source, {
    sourceType: 'module',
    ecmaVersion: 2020,
    plugins: ['jsx'],
  })

  const funcName = await getDefaultExportName(ast)
  const client = buildIslandClient(funcName, sourcePath)
  const server = buildIslandServer(funcName, ast)

  return { client, server }
}

async function getDefaultExportName(ast) {
  let funcName = ''
  for (let i = 0; i <= ast.program.body.length; i++) {
    const child = ast.program.body[i]
    if (child.type !== 'ExportDefaultDeclaration') {
      continue
    }

    if (child.declaration.type === 'Identifier') {
      funcName = child.declaration.name
      break
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
      break
    }
  }
  return funcName
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

function buildIslandServer(funcName, ast) {
  let hasPreactImport = false
  let hasHImport = false

  ast.program.body.forEach((child, index) => {
    if (child.type === 'ExportDefaultDeclaration') {
      if (child.declaration.type === 'Identifier') {
        ast.program.body.splice(index, 1)
        return
      }

      if (child.declaration.type === 'FunctionDeclaration') {
        const func = child.declaration
        ast.program.body.splice(index, 1, func)
        return
      }
    }
    if (child.type === 'ImportDeclaration') {
      if (
        child.source.type === 'StringLiteral' &&
        child.source.value === 'preact'
      ) {
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
    ast.program.body.unshift(PREACT_IMPORT_AST)
  }

  ast.program.body.push(modifyASTForIslandWrapper(funcName))
  return generate(ast).code
}

function getIslandName(name) {
  return 'island' + name.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export function modifyASTForIslandWrapper(name) {
  const islandName = getIslandName(name)
  return {
    type: 'ExportDefaultDeclaration',
    declaration: {
      type: 'FunctionDeclaration',
      id: {
        type: 'Identifier',
        name: `Island${name}`,
      },
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
                  type: 'StringLiteral',
                  value: islandName,
                },
                {
                  type: 'ObjectExpression',
                  properties: [
                    {
                      type: 'ObjectProperty',
                      method: false,
                      key: {
                        type: 'StringLiteral',
                        extra: {
                          rawValue: 'data-props',
                          raw: '"data-props"',
                        },
                        value: 'data-props',
                      },
                      computed: false,
                      shorthand: false,
                      value: {
                        type: 'CallExpression',
                        callee: {
                          type: 'MemberExpression',
                          object: {
                            type: 'Identifier',
                            name: 'JSON',
                          },
                          computed: false,
                          property: {
                            type: 'Identifier',
                            name: 'stringify',
                          },
                        },
                        arguments: [
                          {
                            type: 'Identifier',
                            name: 'props',
                          },
                        ],
                      },
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
                },
              ],
            },
          },
        ],
      },
    },
  }
}
