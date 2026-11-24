import { copyFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
const require = createRequire(import.meta.url)
const pyodideSource = dirname(require.resolve('pyodide/package.json'))
const pyodideTarget = 'public/pyodide'
const pyodideFiles = ['pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']

function copyPyodide() {
  mkdirSync(pyodideTarget, { recursive: true })
  for (const file of pyodideFiles) {
    copyFileSync(join(pyodideSource, file), join(pyodideTarget, file))
  }
}

export default defineConfig({
  plugins: [
    {
      name: 'copy-pyodide-assets',
      buildStart: copyPyodide,
      configureServer: copyPyodide,
    },
    react(),
    tailwindcss(),
  ],
})
