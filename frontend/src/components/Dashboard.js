import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { filesAPI, foldersAPI } from '../services/api';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  HardDrive,
  LogOut,
  Upload,
  FolderPlus,
  File,
  Folder,
  Download,
  Trash2,
  Search,
  Grid,
  List
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await filesAPI.getFiles(currentFolder);
      setFiles(response.data.files);
      setFolders(response.data.folders);
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const onDrop = async (acceptedFiles) => {
    setUploading(true);
    
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      if (currentFolder) {
        formData.append('folderId', currentFolder);
      }

      try {
        await filesAPI.uploadFile(formData);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setUploading(false);
    loadFiles();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  const handleDownload = async (file) => {
    try {
      const response = await filesAPI.downloadFile(file.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await filesAPI.deleteFile(fileId);
        toast.success('File deleted successfully');
        loadFiles();
      } catch (error) {
        toast.error('Failed to delete file');
      }
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Are you sure you want to delete this folder?')) {
      try {
        await foldersAPI.deleteFolder(folderId);
        toast.success('Folder deleted successfully');
        loadFiles();
      } catch (error) {
        toast.error('Failed to delete folder');
      }
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      await foldersAPI.createFolder({
        name: newFolderName,
        parentId: currentFolder
      });
      toast.success('Folder created successfully');
      setNewFolderName('');
      setShowNewFolderModal(false);
      loadFiles();
    } catch (error) {
      toast.error('Failed to create folder');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFiles = files.filter(file =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <HardDrive className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Drive Clone</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search files..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
                </button>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Welcome, {user?.name}</span>
                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-700 flex items-center"
                >
                  <LogOut size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FolderPlus size={20} className="mr-2" />
              New Folder
            </button>
            
            <div {...getRootProps()} className="cursor-pointer">
              <input {...getInputProps()} />
              <button
                disabled={uploading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Upload size={20} className="mr-2" />
                {uploading ? 'Uploading...' : 'Upload Files'}
              </button>
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        {isDragActive && (
          <div className="fixed inset-0 bg-blue-500 bg-opacity-20 border-4 border-dashed border-blue-500 flex items-center justify-center z-50">
            <div className="text-2xl font-bold text-blue-700">
              Drop files here to upload
            </div>
          </div>
        )}

        {/* Files Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4' : 'space-y-2'}>
            {/* Folders */}
            {filteredFolders.map((folder) => (
              <div
                key={folder.id}
                className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'flex items-center p-3' : 'p-4'
                }`}
                onClick={() => setCurrentFolder(folder.id)}
              >
                <div className="flex items-center">
                  <Folder className="h-8 w-8 text-blue-500 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {folder.name}
                    </p>
                    {viewMode === 'list' && (
                      <p className="text-xs text-gray-500">
                        {formatDate(folder.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Files */}
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex items-center p-3' : 'p-4'
                }`}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <File className="h-8 w-8 text-gray-500 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                      {viewMode === 'list' && ` • ${formatDate(file.createdAt)}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredFiles.length === 0 && filteredFolders.length === 0 && (
          <div className="text-center py-12">
            <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
            <p className="text-gray-500 mb-4">Upload your first file to get started</p>
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
