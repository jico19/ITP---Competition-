import { Fragment } from 'react'

const SECTION_HEADINGS = new Set([
  'steps:',
  'rules:',
  'cleanup rules:',
  'price bands:',
  'characters:',
  'build this page:',
  'example:',
])

const EXAMPLE_HEADINGS = new Set([
  'example input:',
  'example output:',
  'example call:',
  'example return:',
])

const ORDERED_ITEM = /^(\s*)(\d+)\.\s+(.*)$/
const BULLET_ITEM = /^(\s*)-\s+(.*)$/

function isHeading(line) {
  const key = line.trim().toLowerCase()
  return SECTION_HEADINGS.has(key) || EXAMPLE_HEADINGS.has(key)
}

function isBlockStart(line) {
  return isHeading(line) || ORDERED_ITEM.test(line) || BULLET_ITEM.test(line)
}

function indentClass(spaces) {
  if (spaces >= 4) return 'pl-8'
  if (spaces >= 2) return 'pl-5'
  if (spaces >= 1) return 'pl-3'
  return 'pl-0'
}

function parseDescription(text) {
  const lines = String(text ?? '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index += 1
      continue
    }

    const key = line.trim().toLowerCase()

    if (SECTION_HEADINGS.has(key)) {
      blocks.push({ kind: 'heading', text: line.trim() })
      index += 1
      continue
    }

    if (EXAMPLE_HEADINGS.has(key)) {
      const payload = []
      index += 1
      while (index < lines.length && lines[index].trim() && !isHeading(lines[index])) {
        payload.push(lines[index])
        index += 1
      }
      blocks.push({ kind: 'example', label: line.trim(), lines: payload })
      continue
    }

    const ordered = line.match(ORDERED_ITEM)
    if (ordered) {
      const items = []
      while (index < lines.length) {
        const match = lines[index].match(ORDERED_ITEM)
        if (!match) break
        items.push({ indent: match[1].length, marker: match[2], text: match[3] })
        index += 1
      }
      blocks.push({ kind: 'ordered', items })
      continue
    }

    const bullet = line.match(BULLET_ITEM)
    if (bullet) {
      const items = []
      while (index < lines.length) {
        const match = lines[index].match(BULLET_ITEM)
        if (!match) break
        items.push({ indent: match[1].length, text: match[2] })
        index += 1
      }
      blocks.push({ kind: 'bullet', items })
      continue
    }

    const paragraph = []
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
      paragraph.push(lines[index].trim())
      index += 1
    }
    blocks.push({ kind: 'paragraph', text: paragraph.join(' ') })
  }

  return blocks
}

function InlineText({ children }) {
  const parts = String(children ?? '').split(/(`[^`]+`)/g)

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={index}
          className="border border-line bg-surface-2 px-1 font-mono text-[0.9em] text-fg"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}

export default function ProblemDescription({ text, className = '' }) {
  const blocks = parseDescription(text)

  return (
    <div className={`mt-4 max-w-3xl space-y-4 text-sm leading-7 text-fg ${className}`}>
      {blocks.map((block, blockIndex) => {
        if (block.kind === 'heading') {
          return (
            <h3
              key={blockIndex}
              className="border-b border-dashed border-line pb-2 text-xs font-bold uppercase tracking-widest text-fg-muted"
            >
              ### {block.text}
            </h3>
          )
        }

        if (block.kind === 'ordered') {
          return (
            <ol key={blockIndex} className="list-none space-y-1">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className={`flex gap-3 ${indentClass(item.indent)}`}>
                  <span className="shrink-0 font-mono tabular-nums text-fg-muted">{item.marker}.</span>
                  <span><InlineText>{item.text}</InlineText></span>
                </li>
              ))}
            </ol>
          )
        }

        if (block.kind === 'bullet') {
          return (
            <ul key={blockIndex} className="list-none space-y-1">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className={`flex gap-3 ${indentClass(item.indent)}`}>
                  <span className="shrink-0 font-mono text-fg-muted">-</span>
                  <span><InlineText>{item.text}</InlineText></span>
                </li>
              ))}
            </ul>
          )
        }

        if (block.kind === 'example') {
          return (
            <div key={blockIndex}>
              <p className="border-b border-dashed border-line pb-2 text-xs font-bold uppercase tracking-widest text-fg-muted">
                ### {block.label}
              </p>
              <pre className="mt-2 overflow-x-auto border border-line-strong bg-surface-2 px-4 py-3 font-mono text-sm leading-6 text-fg">
                {block.lines.join('\n')}
              </pre>
            </div>
          )
        }

        return (
          <p key={blockIndex} className="whitespace-pre-wrap">
            <InlineText>{block.text}</InlineText>
          </p>
        )
      })}
    </div>
  )
}
