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
  const { data, loading, error } = useFileContent(filePath)

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
        <div className="text-gray-700">Loading file...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    )
  }

  if (!data) return null

  const extension = getFileExtension(data.path)
  const language = data.language || getLanguageFromExtension(extension)
  const isMarkdown = extension === 'md'
  const fileName = data.path.split('/').pop() || data.path

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FiFile className="w-5 h-5 text-gray-600" />
          <div>
            <h3 className="font-medium text-gray-900">{fileName}</h3>
            <p className="text-sm text-gray-700">
              {formatSize(data.size)} · {language}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const blob = new Blob([data.content], { type: 'text/plain' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = fileName
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="p-2 text-gray-700 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Download"
          >
            <FiDownload className="w-5 h-5" />
          </button>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-700 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isMarkdown ? (
          <MarkdownRenderer content={data.content} />
        ) : (
          <CodeHighlight code={data.content} language={language} />
        )}
      </div>
    </div>
  )
}
