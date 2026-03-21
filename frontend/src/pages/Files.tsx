import { useState } from 'react'
import FileTree from '../components/FileBrowser/FileTree'
import FileViewer from '../components/FileBrowser/FileViewer'
import Header from '../components/common/Header'

export default function Files() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  return (
    <div>
      <Header title="File Browser" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <FileTree onSelectFile={setSelectedPath} selectedPath={selectedPath} />
        </div>
        <div className="lg:col-span-2">
          <FileViewer path={selectedPath} />
        </div>
      </div>
    </div>
  )
}
