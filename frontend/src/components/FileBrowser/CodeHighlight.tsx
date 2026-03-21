import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

// Import additional languages
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-css'

interface CodeHighlightProps {
  code: string
  language: string
}

const languageMap: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  json: 'json',
  yaml: 'yaml',
  bash: 'bash',
  sql: 'sql',
  css: 'css',
  html: 'html',
  text: 'plaintext',
}

export default function CodeHighlight({ code, language }: CodeHighlightProps) {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [code, language])

  const prismLanguage = languageMap[language] || 'plaintext'

  return (
    <pre className="!bg-gray-900 !p-4 rounded-lg overflow-auto">
      <code ref={codeRef} className={`language-${prismLanguage}`}>
        {code}
      </code>
    </pre>
  )
}
