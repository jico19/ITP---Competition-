function splitLines(text) {
  return String(text ?? '').replace(/\r\n/g, '\n').split('\n')
}

function hintStart(lines) {
  return lines.findIndex((line) => {
    const key = line.trim().toLowerCase()
    return key === '**hints**' || key === 'hints:'
  })
}

export function getHints(description) {
  const lines = splitLines(description)
  const start = hintStart(lines)
  if (start < 0) return []

  const hints = []
  for (let index = start + 1; index < lines.length; index += 1) {
    const match = lines[index].match(/^\s*-\s+(.*)$/)
    if (!match) break
    hints.push(match[1].trim())
  }
  return hints
}

export function descriptionWithoutHints(description) {
  const lines = splitLines(description)
  const start = hintStart(lines)
  if (start < 0) return String(description ?? '')
  return lines.slice(0, start).join('\n').trimEnd()
}
