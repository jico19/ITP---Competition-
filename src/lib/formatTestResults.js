export function formatTestResults(results) {
  const lines = []

  results.forEach((result, index) => {
    const label = `case ${index + 1}${result.visible ? '' : ' (hidden)'}`
    lines.push({
      kind: result.passed ? 'pass' : 'fail',
      text: `${result.passed ? '[✓]' : '[!]'} ${label} ${result.passed ? 'AC' : 'WA'}`,
    })
    if (!result.visible) return

    if (result.stdout) lines.push({ kind: 'stdout', text: result.stdout.replace(/\n$/, '') })
    if (result.error) {
      lines.push({
        kind: 'error',
        text: `[!] error (line ${result.line ?? '?'}): ${result.error}`,
      })
    }
    if (!result.passed && !result.error) {
      lines.push({ kind: 'muted', text: `  expected: ${JSON.stringify(result.expected)}` })
      lines.push({ kind: 'muted', text: `  got:      ${JSON.stringify(result.got)}` })
    }
  })

  return lines
}
