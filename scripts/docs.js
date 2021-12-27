const docs = require('../docs.json')

const repo = 'https://github.com/MathisBullinger/snatchblock'
let readme = `# SnatchBlock - a strictly typed TypeScript utility library.

This is my (WIP) personal collection of TypeScript helper functions and utilities that
I use across different projects.

Think an opionated version of lodash, but with first-class types.
`
const paramReplace = { __namedParameters: 'funs' }

const indCont = require('fs').readFileSync(
  require('path').resolve(__dirname, '../src/index.ts'),
  'utf8'
)

const resImport = ({ fileName, line } = {}) => {
  if (!fileName) return 'src/string.ts'
  if (!fileName.endsWith('index.ts')) return fileName
  return `src/${indCont.split('\n')[line - 1].match(/\w+(?=')/)[0]}.ts`
}

let exps = docs.children
  .find(({ name }) => name === 'index')
  .children.filter(v => v.kindString === 'Reference')
  .map(v => [v.id, resImport(v.sources?.[0])])

let cats = exps.reduce(
  (a, [id, file]) => ({ ...a, [file]: [...(a[file] ?? []), id] }),
  {}
)

const alias = { ds: 'Data Structures' }
cats = Object.entries(cats)
  .sort(([, a], [, b]) => Math.min(...a) - Math.min(...b))
  .map(([file, ids]) => {
    const [name] = file.match(/\w+?(?=\.ts$)/)
    return [
      alias[name] ?? name[0].toUpperCase() + name.slice(1),
      ids
        .filter(v => {
          const [, info] = getNode(v)
          return info.kindString !== 'Variable' || info.type.type !== 'query'
        })
        .sort(),
    ]
  })

readme += '\n\n'
for (const [name, ids] of cats) {
  readme += `- __\`${name.toLowerCase()}\`__\n`
  ids.forEach(id => {
    const name = getNode(id)[0]
    readme += `    - [${name}](#${name})\n`
  })
}
readme += '\n\n'

for (const [name, ids] of cats)
  readme += `\n## ${name}\n\n${ids.map(docItem).join('\n\n---\n\n')}`

function docItem(id) {
  const [name, info] = getNode(id)
  const node = info.signatures?.[0] ?? info

  let docNode
  try {
    docNode = node.comment
      ? node
      : getNode(node.type.types[0].declaration.signatures[0].type.id)[1]
  } catch (e) {
    console.log('no doc node for', name)
  }

  let descr = docNode?.comment?.shortText ?? ''
  if (descr && docNode?.comment?.text) descr += `\n\n${docNode.comment.text}`
  const see = docNode?.comment?.tags?.filter(({ tag }) => tag === 'see') ?? []
  if (see.length)
    descr += `\n\n<sub>see ${new Intl.ListFormat('en').format(
      see.map(({ text }) => `${text.replace(/\n*$/, '')}`)
    )}</sub>`

  if (descr)
    descr = descr
      .replace(/(?<=^|\n)(.?)/g, '> $1')
      .replace(/\{@link\s(\w+)\}/g, '[$1](#$1)')

  const parenthHeur = expr =>
    expr.includes('=>') && !/^[{(\[]/.test(expr) ? `(${expr})` : expr

  const postProcess = str =>
    str
      .replace(/λ<([^>]+),\s*any>/g, 'λ<$1>')
      .replace(/\[\.{3}([A-Z])\[\]\]/g, '$1[]')

  const formatNode = (node, name) => postProcess(_formatNode(node, name))

  function _formatNode(node, name) {
    if (node.target)
      node =
        typeof node.target === 'number' ? getNode(node.target) : node.target

    if (node.name === 'default') node.name = name

    if (['Call signature', 'Constructor signature'].includes(node.kindString)) {
      const isClass = node.kindString === 'Constructor signature'
      if (isClass) delete node.type.typeArguments
      let ret = formatNode(node.type, name)
      if (ret === 'undefined') ret = 'void'
      const argStr = `(${
        node.parameters
          ?.map(
            v =>
              `${v.flags?.isRest ? '...' : ''}${
                paramReplace[v.name] ?? v.name
              }${v.flags.isOptional ? '?' : ''}: ${formatNode(v, name)}`
          )
          .join(', ') ?? ''
      })`
      if (!isClass) return `${argStr} => ${ret}`
      const gen = !node.typeParameter
        ? ''
        : `<${node.typeParameter
            .filter(v => !v.default)
            .map(v => v.name)
            .join(', ')}>`
      return `class ${ret}${gen}${argStr}`
    }

    if (!node.type) {
      if (node.signatures?.length) return formatNode(node.signatures[0], name)
      if (node.children) {
        if (node.children[0].name === 'constructor')
          return formatNode(node.children[0], name)
        return `{${node.children
          .map(
            v => `${v.name}: ${formatNode(v.type ?? v.signatures?.[0])}`,
            name
          )
          .join(', ')}}`
      }
      throw node
    }

    if (typeof node.type === 'object') return formatNode(node.type, name)
    if (node.type === 'reference') {
      const name = node.name
      if (name === 'default') console.log('default', node)
      if (!node.typeArguments?.length) return name
      return `${name}<${node.typeArguments
        .map(v => formatNode(v, name))
        .join(', ')}>`
    }
    if (node.type === 'intrinsic') return node.name
    if (node.type === 'literal') return JSON.stringify(node.value)
    if (node.type === 'predicate')
      return `${node.name} is ${formatNode(node.targetType, name)}`
    if (node.type === 'indexedAccess')
      return `${formatNode(node.objectType, name)}[${formatNode(
        node.indexType,
        name
      )}]`
    if (node.type === 'array') return `${formatNode(node.elementType, name)}[]`
    if (node.type === 'reflection') return formatNode(node.declaration, name)
    if (node.type === 'tuple')
      return `[${
        node.elements?.map(v => formatNode(v, name)).join(', ') ?? ''
      }]`
    if (node.type === 'rest') return `...${formatNode(node.elementType, name)}`
    if (node.type === 'template-literal') return `\`\${string}\``
    if (node.type === 'mapped')
      return `{[${node.parameter} in ${formatNode(
        node.parameterType,
        name
      )}]: ${formatNode(node.templateType, name)}}`
    if (node.type === 'conditional') {
      if (
        (node.trueType.name === 'never') !==
        (node.falseType.name === 'never')
      )
        return formatNode(
          node.falseType.name === 'never' ? node.trueType : node.falseType,
          name
        )
      return `${formatNode(node.checkType)}${
        node.extendsType ? ` extends ${formatNode(node.extendsType, name)}` : ''
      } ? ${formatNode(node.trueType, name)} : ${formatNode(
        node.falseType,
        name
      )}`
    }
    if (node.type === 'intersection') {
      if (node.types.every(({ type }) => type === 'reflection'))
        return formatNode(node.types[0], name)
      return node.types
        .filter(({ type }) => type !== 'query')
        .map(v => formatNode(v, name))
        .map(parenthHeur)
        .join(' & ')
    }
    if (node.type === 'union')
      return node.types
        .map(v => formatNode(v, name))
        .filter(v => v !== 'undefined')
        .map(parenthHeur)
        .join(' | ')

    if (node.type === 'query') return `<${node.queryType.name}>`

    if (node.type === 'named-tuple-member') throw 0

    console.warn(`unknown node type ${node.type}:`, node)
    return '???'
  }

  function examples(sig) {
    const examples = sig?.comment?.tags?.filter(({ tag }) => tag === 'example')
    if (!examples?.length) return ''
    return `\n\n#### Example${examples.length > 1 ? 's' : ''}\n${examples
      .map(
        ({ text }) =>
          `\`\`\`ts\n${text.replace(/(^[`\n]+)|([`\n]+$)/g, '')}\n\`\`\``
      )
      .join('\n\n')}`
  }

  const srcs = findSources(info)
  const src = srcs
    ? `<sup><sup>_[source](${repo}/blob/main/${srcs[0].fileName}#L${srcs[0].line})_</sup></sup>`
    : (console.warn(`couldn't find source for ${name} ${id}`), '')

  let code = ''
  try {
    code = `\`\`\`hs\n${formatNode(info, name)}\n\`\`\``
  } catch (e) {
    if (e !== 0) throw e
  }

  return `#### \`${name}\` 
  
${code}

${src}

${descr ?? ''}${examples(docNode)}`
}

require('fs').writeFileSync(
  require('path').resolve(__dirname, '../README.md'),
  readme
)

function getNode(id, node = docs, path = []) {
  if (node?.id === id)
    return [
      node.name,
      ...(!node.target
        ? [node, path]
        : getNode(node.target, docs, [...path, node]).slice(1)),
    ]

  if (!node.children?.length) return
  for (const child of node.children) {
    let match = getNode(id, child, [...path, node])
    if (match) return match
  }
}

function findSources(node) {
  if (node.sources) return node.sources
  return getNode(node.type.types[0].declaration.signatures[0].type.id)[1]
    .sources
}
