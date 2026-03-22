import { useFiles } from '../../hooks/useFiles'
import { FiFolder, FiFile, FiChevronRight, FiChevronDown } from 'react-icons/fi'
import { useState } from 'react'
import { formatSize } from '../../utils/formatDate'

interface FileTreeProps {
  onFileSelect: (path: string, type: 'file' | 'directory') => void
  selectedPath?: string
}

export default function FileTree({ onFileSelect, selectedPath }: FileTreeProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())
  const { data, loading, error } = useFiles('')

  const toggleDir = (path: string) => {
    const newExpanded = new Set(expandedDirs)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedDirs(newExpanded)
  }

  if (loading) return <div className="p-4 text-gray-500">Loading...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>
  if (!data || !data.items || !data.items.length) return <div className="p-4 text-gray-500">Empty directory</div>

  return (
    <div className="overflow-auto h-full">
      <div className="p-2">
        {data.items.map((item) => (
          <FileNode
            key={item.path}
            item={item}
            depth={0}
            expanded={expandedDirs}
            onToggle={toggleDir}
            onSelect={onFileSelect}
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
  expanded: Set<string>
  onToggle: (path: string) => void
  onSelect: (path: string, type: 'file' | 'directory') => void
  selectedPath?: string
}

function FileNode({ item, depth, expanded, onToggle, onSelect, selectedPath }: FileNodeProps) {
  const isExpanded = expanded.has(item.path)
  const isSelected = selectedPath === item.path
  const isDir = item.is_directory

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded ${
          isSelected ? 'bg-blue-50' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (isDir) {
            onToggle(item.path)
          }
          onSelect(item.path, item.is_directory ? 'directory' : 'file')
        }}
      >
        {isDir && (
          <span className="w-4 h-4 flex items-center justify-center text-gray-400">
            {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
          </span>
        )}
        {!isDir && <span className="w-4" />}
        
        {isDir ? (
          <FiFolder className="w-4 h-4 text-yellow-500" />
        ) : (
          <FiFile className="w-4 h-4 text-gray-400" />
        )}
        
        <span className="text-sm truncate flex-1">{item.name}</span>
        
        {item.size !== undefined && !isDir && (
          <span className="text-xs text-gray-400">{formatSize(item.size)}</span>
        )}
      </div>
      
      {isDir && isExpanded && (
        <div className="text-gray-500 text-sm italic" style={{ paddingLeft: `${(depth + 1) * 16 + 24}px` }}>
          Loading...
        </div>
      )}
    </div>
  )
}
