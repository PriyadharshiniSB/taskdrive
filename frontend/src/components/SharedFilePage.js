import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { publicAPI } from '../services/api';
import { File, Download, AlertCircle, Image as ImageIcon, Folder, FileText } from 'lucide-react';
import Logo from './Logo';

// Same extension-based approach Dashboard.js uses for category filters —
// no mimetype dependency needed, just the filename.
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

const getExtension = (filename = '') => filename.split('.').pop().toLowerCase();
const isImageFile = (filename) => IMAGE_EXTENSIONS.includes(getExtension(filename));

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const SharedFilePage = () => {
  const { shareId } = useParams();
  const [data, setData] = useState(null); // { type: 'file' | 'folder', ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thumbFailed, setThumbFailed] = useState(false);

  useEffect(() => {
    const loadShared = async () => {
      try {
        const response = await publicAPI.getSharedFile(shareId);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'This link is invalid or no longer active');
      } finally {
        setLoading(false);
      }
    };
    loadShared();
  }, [shareId]);

  const isFolder = data?.type === 'folder';
  const file = data?.type === 'file' ? data.file : null;
  const showThumbnail = file && isImageFile(file.originalName) && !thumbFailed;

  // Width varies: single-file card stays narrow like before, folder
  // listing gets more room since it's showing a list of items.
  const containerWidth = isFolder ? 'max-w-lg' : 'max-w-md';

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-10 font-body">
      <div className={`w-full ${containerWidth}`}>
        {/* Branding */}
        <div className="flex items-center justify-center space-x-2.5 mb-6">
          <div className="bg-white p-1 rounded-lg shadow-subtle">
            <Logo size={22} />
          </div>
          <span className="text-lg font-display font-extrabold text-neutral-900">TaskDrive</span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 sm:p-8">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-display font-bold text-neutral-900 mb-1.5">Link unavailable</h2>
              <p className="text-sm text-neutral-500">{error}</p>
            </div>
          ) : isFolder ? (
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-primary-100 rounded-xl w-12 h-12 flex items-center justify-center mr-3 flex-shrink-0">
                  <Folder className="h-6 w-6 text-primary-600" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-display font-bold text-neutral-900 truncate">{data.folder.name}</h2>
                  <p className="text-xs text-neutral-400">Shared on {formatDate(data.folder.createdAt)}</p>
                </div>
              </div>

              {data.files.length === 0 && data.folders.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-8">This folder is empty.</p>
              ) : (
                <ul className="divide-y divide-neutral-100 border border-neutral-100 rounded-xl overflow-hidden mb-2">
                  {data.folders.map((sub) => (
                    <li key={sub.id} className="flex items-center px-4 py-3">
                      <Folder className="h-4 w-4 text-primary-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-neutral-700 truncate flex-1">{sub.name}</span>
                      <span className="text-xs text-neutral-400 flex-shrink-0">Not shared</span>
                    </li>
                  ))}
                  {data.files.map((f) => (
                    <li key={f.id} className="flex items-center px-4 py-3">
                      {isImageFile(f.originalName) ? (
                        <ImageIcon className="h-4 w-4 text-fuchsia-500 mr-3 flex-shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 text-neutral-400 mr-3 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-neutral-800 truncate">{f.originalName}</p>
                        <p className="text-xs text-neutral-400 font-mono">{formatFileSize(f.size)}</p>
                      </div>
                      <a
                        href={publicAPI.getSharedFolderFileDownloadUrl(shareId, f.id)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex-shrink-0"
                        title="Download"
                      >
                        <Download size={16} />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {data.folders.length > 0 && (
                <p className="text-xs text-neutral-400 mt-3">
                  Subfolders aren't included in this link — ask the owner to share them individually.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              {showThumbnail ? (
                <div className="rounded-xl overflow-hidden border border-neutral-200 mb-4 bg-neutral-100">
                  <img
                    src={publicAPI.getSharedFileDownloadUrl(shareId)}
                    alt={file.originalName}
                    onError={() => setThumbFailed(true)}
                    className="w-full max-h-64 object-contain"
                  />
                </div>
              ) : (
                <div className="bg-accent-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {file && isImageFile(file.originalName) ? (
                    <ImageIcon className="h-8 w-8 text-accent-600" strokeWidth={1.5} />
                  ) : (
                    <File className="h-8 w-8 text-accent-600" strokeWidth={1.5} />
                  )}
                </div>
              )}

              <h2 className="text-lg font-display font-bold text-neutral-900 mb-1 break-all px-2">
                {file.originalName}
              </h2>
              <p className="text-sm text-neutral-400 font-mono mb-1">{formatFileSize(file.size)}</p>
              <p className="text-xs text-neutral-400 mb-6">Shared on {formatDate(file.createdAt)}</p>

              <a
                href={publicAPI.getSharedFileDownloadUrl(shareId)}
                className="flex items-center justify-center w-full px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-card"
              >
                <Download size={16} className="mr-2" />
                Download
              </a>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          Anyone with this link can view {isFolder ? 'this folder' : 'and download this file'}.
        </p>
      </div>
    </div>
  );
};

export default SharedFilePage;