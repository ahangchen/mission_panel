import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeHighlightProps {
  code: string
  language?: string
}

export default function CodeHighlight({ code, language = 'text' }: CodeHighlightProps) {
  return (
    <div className="h-full">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          height: '100%',
          overflow: 'auto',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
