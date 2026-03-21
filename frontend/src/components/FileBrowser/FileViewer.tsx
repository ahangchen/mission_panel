import { useFileContent } from '../../hooks/useFiles'
import Loading from '../common/Loading'
import CodeHighlight from './CodeHighlight'
import MarkdownRenderer from './MarkdownRenderer'

interface FileViewerProps {
  path: string | null
}

export default function FileViewer({ path }: FileViewerProps) {
  const { data, loading, error } = useFileContent(path)

  if (!path) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        Select a file to view its contents
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-red-600">
        Error: {error.message}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* File header */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <span className="font-medium text-gray-900">{data.path}</span>
        <span className="text-sm text-gray-500">{data.size} bytes</span>
      </div>

      {/* File content */}
      <div className="p-4 overflow-auto max-h-[600px]">
        {data.file_type === 'markdown' ? (
          <MarkdownRenderer content={data.content} />
        ) : (
          <CodeHighlight code={data.content} language={data.file_type} />
        )}
      </div>
    </div>
  )
}
