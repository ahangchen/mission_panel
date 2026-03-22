import { useFileContent } from '../../hooks/useFiles'
import CodeHighlight from './CodeHighlight'
import MarkdownRenderer from './MarkdownRenderer'
import { FiFile, FiX, FiDownload } from 'react-icons/fi'
import { getLanguageFromExtension, getFileExtension, formatSize } from '../../utils/formatDate'

interface FileViewerProps {
  filePath: string | null
  onClose: () => void
}

export default function FileViewer({ filePath, onClose }: FileViewerProps) {
  const { content, loading, error } = useFileContent(filePath)

  if (!filePath) {
    return (
      <div className="h-full flex items-center justify-center text-gray-600">
        <div className="text-center">
          <FiFile className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Select a file to view its contents</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-700">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-600">Error: {error.message}</div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500 flex items-center gap-2">
          <FiFile className="w-12 h-12" />
          <span className="text-sm">Select a file to view its contents</span>
        </div>
      </div>
    )
  }

  const { path: fileName, content: fileContent, size, type } = content
  const fileExtension = getFileExtension(fileName)
  const language = getLanguageFromExtension(fileExtension)
  const isMarkdown = fileExtension === 'md' || type === 'markdown'

  const handleDownload = () => {
    const blob = new Blob([fileContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = fileName
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white flex-shrink-0">
        <div>
          <h3 className="font-medium text-gray-900">{fileName}</h3>
          <p className="text-xs text-gray-500">{formatSize(size)} • {type}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download"
          >
            <FiDownload className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isMarkdown ? (
          <MarkdownRenderer content={fileContent} />
        ) : (
          <CodeHighlight code={fileContent} language={language} />
        )}
      </div>
    </div>
  )
}
