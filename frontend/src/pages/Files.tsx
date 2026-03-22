import { useState } from 'react'
import FileTree from '../components/FileBrowser/FileTree'
import FileViewer from '../components/FileBrowser/FileViewer'
import Header from '../components/common/Header'

export default function Files() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <Header 
        title="File Browser" 
        subtitle="Browse and view files in coding directory" 
      />
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* File Tree */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Files</h3>
          </div>
          <FileTree 
            onFileSelect={(path, type) => {
              if (type === 'file') {
                setSelectedFile(path)
              }
            }}
            selectedPath={selectedFile || undefined}
          />
        </div>
        
        {/* File Viewer */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <FileViewer 
            filePath={selectedFile}
            onClose={() => setSelectedFile(null)}
          />
        </div>
      </div>
    </div>
  )
}
