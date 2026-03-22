import { useState } from 'react'
import FileTree from '../components/FileBrowser/FileTree'
import FileViewer from '../components/FileBrowser/FileViewer'
import Header from '../components/common/Header'

export default function Files() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isMobileViewerOpen, setIsMobileViewerOpen] = useState(false)

  const handleFileSelect = (path: string, type: string) => {
    if (type === 'file') {
      setSelectedFile(path)
      setIsMobileViewerOpen(true)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setIsMobileViewerOpen(false)
  }

  return (
    <div className="h-full flex flex-col">
      <Header 
        title="File Browser" 
        subtitle="Browse and view files in coding directory" 
      />
      
      {/* Desktop Layout: Side by Side */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 min-h-0">
        {/* File Tree */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-200 flex-shrink-0">
            <h3 className="font-medium text-gray-900">Files</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <FileTree 
              onFileSelect={handleFileSelect}
              selectedPath={selectedFile || undefined}
            />
          </div>
        </div>
        
        {/* Desktop: File Viewer (Right Side) */}
        <div className="hidden lg:block lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
          <FileViewer 
            filePath={selectedFile}
            onClose={handleClose}
          />
        </div>
      </div>

      {/* Mobile: Bottom Sheet / Full Screen Modal */}
      {isMobileViewerOpen && selectedFile && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />
          
          {/* Modal Content */}
          <div className="relative mt-auto bg-white rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up">
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-4 p-2 text-gray-500 hover:text-gray-700 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* File Viewer */}
            <div className="flex-1 overflow-auto">
              <FileViewer 
                filePath={selectedFile}
                onClose={handleClose}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
