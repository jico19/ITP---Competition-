export function formatTestResults(results) {
  const lines = []

  results.forEach((result, index) => {
    const label = `Test ${index + 1}${result.visible ? '' : ' (hidden)'}`
    lines.push({
      kind: result.passed ? 'pass' : 'fail',
      text: `${result.passed ? '✓' : '✗'} ${label}`,
    })
    if (!result.visible) return

    if (result.stdout) lines.push({ kind: 'stdout', text: result.stdout.replace(/\n$/, '') })
    if (result.error) {
      lines.push({
        kind: 'error',
        text: `${result.error}${result.line ? ` (line ${result.line})` : ''}`,
      })
    }
    if (!result.passed && !result.error) {
      lines.push({ kind: 'muted', text: `  Expected: ${JSON.stringify(result.expected)}` })
      lines.push({ kind: 'muted', text: `  Got:      ${JSON.stringify(result.got)}` })
    }
  })

  return lines
}
