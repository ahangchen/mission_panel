import { FiFolder, FiFile, FiChevronRight, FiChevronDown } from 'react-icons/fi'
import { useState } from 'react'
import { useFileList } from '../../hooks/useFiles'
import Loading from '../common/Loading'
import { formatSize } from '../../utils/formatSize'
import { formatDateShort } from '../../utils/formatDate'

interface FileTreeProps {
  onSelectFile: (path: string) => void
  selectedPath: string | null
}

export default function FileTree({ onSelectFile, selectedPath }: FileTreeProps) {
  const [currentPath, setCurrentPath] = useState('')
  const { data, loading, error } = useFileList(currentPath)

  if (error) {
    return <div className="text-red-600 p-4">Error: {error.message}</div>
  }

  const handleItemClick = (item: { path: string; is_directory: boolean }) => {
    if (item.is_directory) {
      setCurrentPath(item.path)
    } else {
      onSelectFile(item.path)
    }
  }

  const goBack = () => {
    const parts = currentPath.split('/')
    parts.pop()
    setCurrentPath(parts.join('/'))
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Path breadcrumb */}
      <div className="p-3 border-b border-gray-200 flex items-center gap-2 text-sm">
        {currentPath && (
          <button onClick={goBack} className="text-primary-600 hover:underline">
            ..
          </button>
        )}
        <span className="text-gray-500">{currentPath || '/'}</span>
      </div>

      {/* File list */}
      {loading ? (
        <Loading />
      ) : (
        <ul className="divide-y divide-gray-100">
          {data?.items.map((item) => (
            <li
              key={item.path}
              onClick={() => handleItemClick(item)}
              className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 ${
                selectedPath === item.path ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {item.is_directory ? (
                  <FiFolder className="w-5 h-5 text-yellow-500" />
                ) : (
                  <FiFile className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-gray-900">{item.name}</span>
              </div>
              <div className="text-sm text-gray-500">
                {item.is_directory ? '' : formatSize(item.size)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
