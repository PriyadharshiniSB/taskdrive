import React, { useState, useEffect } from 'react';
import { X, Download, FileArchive, FileSpreadsheet, File as FileIcon } from 'lucide-react';
import { filesAPI } from '../services/api';
import mammoth from 'mammoth';

// Icon shown in the "can't preview this" state, picked by extension
const getUnsupportedIcon = (filename = '') => {
  const ext = filename.split('.').pop().toLowerCase();
  if (['zip', 'rar', '7z'].includes(ext)) return FileArchive;
  if (['xlsx', 'xls', 'csv'].includes(ext)) return FileSpreadsheet;
  return FileIcon;
};

const FilePreviewModal = ({ file, onClose }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  // docxHtml holds the converted HTML content when previewing a Word document
  const [docxHtml, setDocxHtml] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isImage = file && file.mimetype && file.mimetype.startsWith('image/');
  const isPdf = file && file.mimetype === 'application/pdf';
  const isAudio = file && file.mimetype && file.mimetype.startsWith('audio/');
  const isVideo = file && file.mimetype && file.mimetype.startsWith('video/');
  const isText = file && file.mimetype === 'text/plain';
  // DOCX files report this specific mimetype
  const isDocx =
    file &&
    file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const isPreviewable = isImage || isPdf || isDocx || isAudio || isVideo || isText;

  useEffect(() => {
    setBlobUrl(null);
    setDocxHtml(null);
    setError(null);

    if (!file || !isPreviewable) {
      return;
    }

    let objectUrl;

    const fetchPreview = async () => {
      setLoading(true);
      try {
        // downloadFile returns the raw binary data as a blob (responseType: 'blob'
        // is set in services/api.js), with the auth token automatically attached.
        const response = await filesAPI.downloadFile(file.id);

        if (isDocx) {
          // mammoth needs the raw bytes as an ArrayBuffer, not a Blob, so we convert.
          const arrayBuffer = await response.data.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setDocxHtml(result.value);
        } else {
          objectUrl = window.URL.createObjectURL(
            new Blob([response.data], { type: file.mimetype })
          );
          setBlobUrl(objectUrl);
        }
      } catch (err) {
        console.error('Failed to load preview:', err);
        setError('Could not load preview for this file.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();

    return () => {
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file, isPreviewable, isDocx]);

  const handleDownload = async () => {
    try {
      const response = await filesAPI.downloadFile(file.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (!file) return null;

  const UnsupportedIcon = getUnsupportedIcon(file.originalName);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-surfaceMuted-dark rounded-2xl w-full mx-4 overflow-hidden flex flex-col shadow-modal animate-scaleIn ${
          isPdf || isDocx ? 'max-w-4xl h-[90vh]' : 'max-w-3xl max-h-[85vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-display font-semibold text-neutral-900 dark:text-white truncate">{file.originalName}</h3>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-neutral-50 dark:bg-surface-dark">
          {loading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          ) : error ? (
            <p className="text-red-500 dark:text-red-400">{error}</p>
          ) : isImage && blobUrl ? (
            <img
              src={blobUrl}
              alt={file.originalName}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : isPdf && blobUrl ? (
            <iframe
              src={blobUrl}
              title={file.originalName}
              className="w-full h-full border-0 rounded-lg"
            />
          ) : isDocx && docxHtml ? (
            // The HTML mammoth produces is rendered here. It's plain document
            // content (headings, paragraphs, bold/italic text, tables) converted
            // from the .docx file's internal structure.
            <div
              className="bg-white dark:bg-white w-full h-full overflow-auto p-8 prose max-w-none rounded-lg"
              dangerouslySetInnerHTML={{ __html: docxHtml }}
            />
          ) : isVideo && blobUrl ? (
            <div className="w-full flex flex-col items-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-3">Video Preview</p>
              <video
                src={blobUrl}
                controls
                autoPlay={false}
                className="max-w-full max-h-[65vh] rounded-xl shadow-card bg-black"
              />
            </div>
          ) : isAudio && blobUrl ? (
            <div className="w-full max-w-md flex flex-col items-center py-8">
              <div className="bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 rounded-full w-20 h-20 flex items-center justify-center mb-5">
                <span className="text-3xl">🎵</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-4">Audio Preview</p>
              <audio src={blobUrl} controls className="w-full" />
            </div>
          ) : isText && blobUrl ? (
            <iframe
              src={blobUrl}
              title={file.originalName}
              className="w-full h-full border-0 bg-white rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center text-center max-w-sm py-6">
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <UnsupportedIcon className="h-8 w-8 text-neutral-400" />
              </div>
              <h4 className="font-display font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
                Preview unavailable
              </h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
                This file type can't be previewed here. Download it to view the contents.
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-semibold shadow-card transition-colors"
              >
                <Download size={16} className="mr-2" />
                Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;