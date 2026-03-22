import { useState } from 'react'
import { FiFolder, FiFile, FiChevronRight, FiChevronDown } from 'react-icons/fi'
import { formatSize } from '../../utils/formatDate'
import { useFiles } from '../../hooks/useFiles'

interface FileTreeProps {
  onFileSelect: (path: string, type: 'file' | 'directory') => void
  selectedPath?: string
}

export default function FileTree({ onFileSelect, selectedPath }: FileTreeProps) {
  const { data, loading, error } = useFiles('')

  if (loading) return <div className="p-4 text-gray-700">Loading...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error.message}</div>
  if (!data || !data.items || !data.items.length) return <div className="p-4 text-gray-700">Empty directory</div>

  // 排序：文件夹在前，文件在后，都按字母顺序
  const sortedItems = [...data.items].sort((a, b) => {
    // 1. 文件夹在前，文件在后
    if (a.is_directory && !b.is_directory) return -1
    if (!a.is_directory && b.is_directory) return 1
    
    // 2. 同类型按字母顺序（不区分大小写）
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })

  return (
    <div className="h-full overflow-auto bg-white">
      <div className="p-2">
        {sortedItems.map((item) => (
          <FileNode
            key={item.path}
            item={item}
            depth={0}
            onFileSelect={onFileSelect}
            selectedPath={selectedPath}
          />
        ))}
      </div>
    </div>
  )
}

interface FileNodeProps {
  item: {
    name: string
    path: string
    is_directory: boolean
    size?: number
  }
  depth: number
  onFileSelect: (path: string, type: 'file' | 'directory') => void
  selectedPath?: string
}

function FileNode({ item, depth, onFileSelect, selectedPath }: FileNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isSelected = selectedPath === item.path
  const isDir = item.is_directory

  // 只有展开时才加载子目录数据
  const { data: childData, loading: childLoading } = useFiles(isExpanded && isDir ? item.path : '')

  const handleClick = () => {
    if (isDir) {
      setIsExpanded(!isExpanded)
    }
    onFileSelect(item.path, item.is_directory ? 'directory' : 'file')
  }

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded ${
          isSelected ? 'bg-blue-50' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {isDir && (
          <span className="w-4 h-4 flex items-center justify-center text-gray-600">
            {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
          </span>
        )}
        {!isDir && <span className="w-4" />}
        
        {isDir ? (
          <FiFolder className="w-4 h-4 text-yellow-600" />
        ) : (
          <FiFile className="w-4 h-4 text-gray-600" />
        )}
        
        <span className="text-sm truncate flex-1 text-gray-900">{item.name}</span>
        
        {item.size !== undefined && !isDir && (
          <span className="text-xs text-gray-600">{formatSize(item.size)}</span>
        )}
      </div>
      
      {/* 展开时显示子目录 */}
      {isDir && isExpanded && (
        <div>
          {childLoading ? (
            <div 
              className="text-gray-600 text-sm italic py-1"
              style={{ paddingLeft: `${(depth + 1) * 16 + 24}px` }}
            >
              Loading...
            </div>
          ) : childData && childData.items && childData.items.length > 0 ? (
            // 排序子目录：文件夹在前，文件在后，都按字母顺序
            [...childData.items]
              .sort((a, b) => {
                // 1. 文件夹在前，文件在后
                if (a.is_directory && !b.is_directory) return -1
                if (!a.is_directory && b.is_directory) return 1
                // 2. 同类型按字母顺序（不区分大小写）
                return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
              })
              .map((childItem) => (
                <FileNode
                  key={childItem.path}
                  item={childItem}
                  depth={depth + 1}
                  onFileSelect={onFileSelect}
                  selectedPath={selectedPath}
                />
              ))
          ) : (
            <div 
              className="text-gray-600 text-sm italic py-1"
              style={{ paddingLeft: `${(depth + 1) * 16 + 24}px` }}
            >
              Empty folder
            </div>
          )}
        </div>
      )}
    </div>
  )
}
