import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { filesAPI, foldersAPI, getServerOrigin } from '../services/api';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import FilePreviewModal from './FilePreviewModal';
import TodoList from './TodoList';
import Logo from './Logo';
import {
  LogOut,
  Upload,
  FolderPlus,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FolderOpen,
  Folder,
  Download,
  Trash2,
  RotateCcw,
  XCircle,
  Search,
  Grid,
  List,
  ChevronRight,
  Home,
  Pencil,
  Moon,
  Sun,
  X,
  Info,
  ChevronDown,
  Palette,
  Share2,
  Copy,
  Check,
  Clock
} from 'lucide-react';

// Folder color options -> Tailwind class pairs
const FOLDER_COLORS = {
  primary: { bg: 'bg-primary-100 dark:bg-primary-900/30', text: 'text-primary-600 dark:text-primary-400', dot: 'bg-primary-600' },
  accent: { bg: 'bg-accent-100 dark:bg-accent-900/30', text: 'text-accent-600 dark:text-accent-400', dot: 'bg-accent-500' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
  violet: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500' },
};

// Category used by the file-type filter pills
const getFileCategory = (filename = '') => {
  const ext = filename.split('.').pop().toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'images';
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return 'documents';
  if (['mp4', 'mov', 'avi'].includes(ext)) return 'videos';
  if (['mp3', 'wav'].includes(ext)) return 'audio';
  if (['zip', 'rar', '7z'].includes(ext)) return 'archives';
  return 'other';
};

// Maps a filename to an icon + color pairing so file types are recognizable at a glance
const getFileTypeMeta = (filename = '') => {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    pdf: { Icon: FileText, bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400' },
    doc: { Icon: FileText, bg: 'bg-primary-100 dark:bg-primary-900/30', text: 'text-primary-600 dark:text-primary-400' },
    docx: { Icon: FileText, bg: 'bg-primary-100 dark:bg-primary-900/30', text: 'text-primary-600 dark:text-primary-400' },
    txt: { Icon: FileText, bg: 'bg-neutral-200 dark:bg-neutral-700', text: 'text-neutral-600 dark:text-neutral-300' },
    png: { Icon: FileImage, bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
    jpg: { Icon: FileImage, bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
    jpeg: { Icon: FileImage, bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
    gif: { Icon: FileImage, bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
    svg: { Icon: FileImage, bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
    mp4: { Icon: FileVideo, bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
    mov: { Icon: FileVideo, bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
    avi: { Icon: FileVideo, bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
    mp3: { Icon: FileAudio, bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    wav: { Icon: FileAudio, bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    zip: { Icon: FileArchive, bg: 'bg-accent-100 dark:bg-accent-900/30', text: 'text-accent-600 dark:text-accent-400' },
    rar: { Icon: FileArchive, bg: 'bg-accent-100 dark:bg-accent-900/30', text: 'text-accent-600 dark:text-accent-400' },
    '7z': { Icon: FileArchive, bg: 'bg-accent-100 dark:bg-accent-900/30', text: 'text-accent-600 dark:text-accent-400' },
    js: { Icon: FileCode, bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
    ts: { Icon: FileCode, bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
    json: { Icon: FileCode, bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
    html: { Icon: FileCode, bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
    css: { Icon: FileCode, bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
  };
  return map[ext] || { Icon: File, bg: 'bg-accent-100 dark:bg-accent-900/30', text: 'text-accent-600 dark:text-accent-400' };
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbTrail, setBreadcrumbTrail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingItem, setRenamingItem] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const [activeTab, setActiveTab] = useState('drive');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [trashFiles, setTrashFiles] = useState([]);
  const [trashFolders, setTrashFolders] = useState([]);
  const [trashSearchTerm, setTrashSearchTerm] = useState('');
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [totalStorageUsed, setTotalStorageUsed] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [uploadProgress, setUploadProgress] = useState({});
  const [detailsItem, setDetailsItem] = useState(null);
  const [colorPickerFolderId, setColorPickerFolderId] = useState(null);
  const [shareItem, setShareItem] = useState(null);
  const [shareItemType, setShareItemType] = useState('file'); // 'file' | 'folder' — which API/label the modal uses
  const [shareLoading, setShareLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Apply or remove the 'dark' class on <html> whenever darkMode changes, and remember the choice
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

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

  // Storage used across the WHOLE drive, not just the current folder
  const loadTotalStorage = useCallback(async () => {
    try {
      const response = await filesAPI.getTotalStorage();
      setTotalStorageUsed(response.data.totalBytes);
    } catch (error) {
      // Non-critical, fail silently rather than showing an error toast for a background stat
    }
  }, []);

  useEffect(() => {
    loadTotalStorage();
  }, [loadTotalStorage]);

  const loadTrash = useCallback(async () => {
    setLoadingTrash(true);
    try {
      const response = await filesAPI.getTrash();
      setTrashFiles(response.data.files);
      setTrashFolders(response.data.folders);
    } catch (error) {
      toast.error('Failed to load trash');
    } finally {
      setLoadingTrash(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'trash') {
      loadTrash();
    }
  }, [activeTab, loadTrash]);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // Must match backend's multer limit in files.js

  const onDrop = async (acceptedFiles) => {
    const oversizedFiles = acceptedFiles.filter((f) => f.size > MAX_FILE_SIZE);
    const validFiles = acceptedFiles.filter((f) => f.size <= MAX_FILE_SIZE);

    oversizedFiles.forEach((f) => {
      toast.error(`${f.name} is over the 100MB limit and won't be uploaded`);
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('file', file);
      if (currentFolder) formData.append('folderId', currentFolder);
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
      try {
        await filesAPI.uploadFile(formData, (percent) => {
          setUploadProgress((prev) => ({ ...prev, [file.name]: percent }));
        });
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[file.name];
          return next;
        });
      }
    }
    setUploading(false);
    loadFiles();
    loadTotalStorage();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

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
    if (window.confirm('Move this file to Trash?')) {
      try {
        await filesAPI.deleteFile(fileId);
        toast.success('File moved to trash');
        loadFiles();
        loadTotalStorage();
      } catch (error) {
        toast.error('Failed to delete file');
      }
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Move this folder to Trash?')) {
      try {
        await foldersAPI.deleteFolder(folderId);
        toast.success('Folder moved to trash');
        loadFiles();
      } catch (error) {
        toast.error('Failed to delete folder');
      }
    }
  };

  const handleRestoreFile = async (fileId) => {
    try {
      await filesAPI.restoreFile(fileId);
      toast.success('File restored');
      loadTrash();
      loadTotalStorage();
    } catch (error) {
      toast.error('Failed to restore file');
    }
  };

  const handleRestoreFolder = async (folderId) => {
    try {
      await foldersAPI.restoreFolder(folderId);
      toast.success('Folder restored');
      loadTrash();
    } catch (error) {
      toast.error('Failed to restore folder');
    }
  };

  const handlePermanentDeleteFile = async (fileId) => {
    if (window.confirm('Permanently delete this file? This cannot be undone.')) {
      try {
        await filesAPI.permanentDeleteFile(fileId);
        toast.success('File permanently deleted');
        loadTrash();
      } catch (error) {
        toast.error('Failed to permanently delete file');
      }
    }
  };

  const handlePermanentDeleteFolder = async (folderId) => {
    if (window.confirm('Permanently delete this folder? This cannot be undone.')) {
      try {
        await foldersAPI.permanentDeleteFolder(folderId);
        toast.success('Folder permanently deleted');
        loadTrash();
      } catch (error) {
        toast.error('Failed to permanently delete folder');
      }
    }
  };

  const handleSetFolderColor = async (folderId, color) => {
    try {
      await foldersAPI.setFolderColor(folderId, color);
      setColorPickerFolderId(null);
      loadFiles();
    } catch (error) {
      toast.error('Failed to update folder color');
    }
  };

  const handleEmptyTrash = async () => {
    const totalItems = trashFiles.length + trashFolders.length;
    if (totalItems === 0) return;
    if (!window.confirm(`Permanently delete all ${totalItems} item(s) in Trash? This cannot be undone.`)) {
      return;
    }
    try {
      await Promise.all([
        ...trashFiles.map((f) => filesAPI.permanentDeleteFile(f.id).catch(() => {})),
        ...trashFolders.map((f) => foldersAPI.permanentDeleteFolder(f.id).catch(() => {})),
      ]);
      toast.success('Trash emptied');
      loadTrash();
    } catch (error) {
      toast.error('Failed to empty trash');
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }
    try {
      await foldersAPI.createFolder({ name: newFolderName, parentId: currentFolder });
      toast.success('Folder created successfully');
      setNewFolderName('');
      setShowNewFolderModal(false);
      loadFiles();
    } catch (error) {
      toast.error('Failed to create folder');
    }
  };

  const handleOpenFolder = (folder) => {
    setBreadcrumbTrail((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setCurrentFolder(folder.id);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setBreadcrumbTrail([]);
      setCurrentFolder(null);
      return;
    }
    const newTrail = breadcrumbTrail.slice(0, index + 1);
    setBreadcrumbTrail(newTrail);
    setCurrentFolder(newTrail[newTrail.length - 1].id);
  };

  const startRename = (item, type) => {
    setRenamingItem({ id: item.id, type });
    setRenameValue(type === 'folder' ? item.name : item.originalName);
  };

  const cancelRename = () => {
    setRenamingItem(null);
    setRenameValue('');
  };

  const submitRename = async () => {
    if (!renamingItem) return;
    const trimmed = renameValue.trim();
    if (!trimmed) { toast.error('Name cannot be empty'); return; }
    try {
      if (renamingItem.type === 'folder') {
        await foldersAPI.renameFolder(renamingItem.id, trimmed);
        toast.success('Folder renamed successfully');
      } else {
        await filesAPI.renameFile(renamingItem.id, trimmed);
        toast.success('File renamed successfully');
      }
      cancelRename();
      loadFiles();
    } catch (error) {
      toast.error('Failed to rename');
    }
  };

  // ---- Sharing ----
  // Works for both files and folders now — shareItemType picks which API
  // and which display name (originalName vs name) to use.

  const openShareModal = (item, type = 'file') => {
    setLinkCopied(false);
    setShareItemType(type);
    setShareItem(item);
  };

  const handleToggleShare = async () => {
    if (!shareItem) return;
    setShareLoading(true);
    try {
      if (shareItemType === 'folder') {
        if (shareItem.isPublic) {
          const response = await foldersAPI.unshareFolder(shareItem.id);
          setShareItem(response.data.folder);
          toast.success('Link sharing turned off');
        } else {
          const response = await foldersAPI.shareFolder(shareItem.id);
          setShareItem(response.data.folder);
          toast.success('Link sharing turned on');
        }
      } else {
        if (shareItem.isPublic) {
          const response = await filesAPI.unshareFile(shareItem.id);
          setShareItem(response.data.file);
          toast.success('Link sharing turned off');
        } else {
          const response = await filesAPI.shareFile(shareItem.id);
          setShareItem(response.data.file);
          toast.success('Link sharing turned on');
        }
      }
      loadFiles();
    } catch (error) {
      toast.error('Failed to update sharing');
    } finally {
      setShareLoading(false);
    }
  };

  const getShareUrl = (item) => `${window.location.origin}/share/${item.shareId}`;
  const getShareDisplayName = (item) => (shareItemType === 'folder' ? item.name : item.originalName);

  const handleCopyLink = async () => {
    if (!shareItem?.shareId) return;
    try {
      await navigator.clipboard.writeText(getShareUrl(shareItem));
      setLinkCopied(true);
      toast.success('Link copied');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast.error('Could not copy link');
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
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredFiles = files
    .filter(file => file.originalName.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(file => typeFilter === 'all' || getFileCategory(file.originalName) === typeFilter)
    .sort((a, b) => {
      if (sortBy === 'name') return a.originalName.localeCompare(b.originalName);
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'size') return (b.size || 0) - (a.size || 0);
      if (sortBy === 'type') return getFileCategory(a.originalName).localeCompare(getFileCategory(b.originalName));
      return 0;
    });
  const filteredFolders = folders
    .filter(folder => folder.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  const filteredTrashFiles = trashFiles.filter((file) =>
    file.originalName.toLowerCase().includes(trashSearchTerm.toLowerCase())
  );
  const filteredTrashFolders = trashFolders.filter((folder) =>
    folder.name.toLowerCase().includes(trashSearchTerm.toLowerCase())
  );

  // Total storage used across the WHOLE drive (from the backend, not just current folder)
  const storageLimit = 500 * 1024 * 1024; // 500 MB display limit
  const storagePercent = Math.min((totalStorageUsed / storageLimit) * 100, 100).toFixed(1);

  const formatStorageSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-surface-dark transition-colors duration-300 font-body">
      {/* Header */}
      <div className="bg-white dark:bg-surfaceMuted-dark shadow-sm border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-white dark:bg-surfaceMuted-dark p-2 rounded-xl shadow-subtle">
                <Logo size={40} />
              </div>
              <h1 className="text-2xl font-display font-extrabold text-neutral-900 dark:text-white tracking-tight">
                TaskDrive<span className="text-accent-500"></span>
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {/* Tab toggle */}
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('drive')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'drive'
                      ? 'bg-white dark:bg-neutral-700 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }`}
                >
                  Drive
                </button>
                <button
                  onClick={() => setActiveTab('todos')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'todos'
                      ? 'bg-white dark:bg-neutral-700 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setActiveTab('trash')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'trash'
                      ? 'bg-white dark:bg-neutral-700 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }`}
                >
                  Trash
                </button>
              </div>

              {/* Search - only in drive tab */}
              {activeTab === 'drive' && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    className="pl-9 pr-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent w-56 sm:w-72 lg:w-80 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}

              {/* View mode - only in drive tab */}
              {activeTab === 'drive' && (
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
                </button>
              )}

              {/* Activity history */}
              <button
                onClick={() => navigate('/activity')}
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                title="Activity history"
              >
                <Clock size={18} />
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                title="Toggle dark mode"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User + logout */}
              <div className="flex items-center space-x-2.5 pl-3 border-l border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity"
                  title="View profile"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-primary-100 dark:ring-primary-900 flex-shrink-0">
                    {user?.avatarUrl ? (
                      <img src={`${getServerOrigin()}${user.avatarUrl}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hidden sm:block">{user?.name}</span>
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'todos' ? (
          <TodoList />
        ) : activeTab === 'trash' ? (
          <>
            <div className="flex justify-between items-center mb-5 gap-3 flex-wrap">
              <h2 className="text-2xl font-display font-extrabold text-neutral-900 dark:text-white">
                Trash
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search trash..."
                    className="pl-9 pr-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent w-48 sm:w-64 transition-all"
                    value={trashSearchTerm}
                    onChange={(e) => setTrashSearchTerm(e.target.value)}
                  />
                </div>
                {(trashFiles.length > 0 || trashFolders.length > 0) && (
                  <button
                    onClick={handleEmptyTrash}
                    className="flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <XCircle size={16} className="mr-1.5" />
                    Empty Trash
                  </button>
                )}
              </div>
            </div>
            {loadingTrash ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : trashFiles.length === 0 && trashFolders.length === 0 ? (
              <div className="text-center py-20 animate-fadeIn">
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-5">
                  <Trash2 className="h-11 w-11 text-neutral-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-display font-bold text-neutral-900 dark:text-white mb-1.5">Trash is empty</h3>
                <p className="text-neutral-500 dark:text-neutral-400">Files and folders you delete will show up here.</p>
              </div>
            ) : filteredTrashFiles.length === 0 && filteredTrashFolders.length === 0 ? (
              <div className="text-center py-20 animate-fadeIn">
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-5">
                  <Search className="h-11 w-11 text-neutral-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-display font-bold text-neutral-900 dark:text-white mb-1.5">No matches found</h3>
                <p className="text-neutral-500 dark:text-neutral-400">Nothing in Trash matches "{trashSearchTerm}".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredTrashFolders.map((folder) => (
                  <div key={folder.id} className="bg-white dark:bg-surfaceMuted-dark rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 opacity-90">
                    <div className="flex items-center mb-3">
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-xl mr-3 flex-shrink-0">
                        <Folder className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate flex-1">{folder.name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRestoreFolder(folder.id)}
                        className="flex items-center flex-1 justify-center px-2 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg text-xs font-medium transition-colors"
                      >
                        <RotateCcw size={13} className="mr-1" /> Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDeleteFolder(folder.id)}
                        className="flex items-center flex-1 justify-center px-2 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-xs font-medium transition-colors"
                      >
                        <XCircle size={13} className="mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
                {filteredTrashFiles.map((file) => {
                  const { Icon: TypeIcon, bg: typeBg, text: typeText } = getFileTypeMeta(file.originalName);
                  return (
                    <div key={file.id} className="bg-white dark:bg-surfaceMuted-dark rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 opacity-90">
                      <div className="flex items-center mb-3">
                        <div className={`${typeBg} p-2 rounded-xl mr-3 flex-shrink-0`}>
                          <TypeIcon className={`h-5 w-5 ${typeText}`} />
                        </div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate flex-1">{file.originalName}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRestoreFile(file.id)}
                          className="flex items-center flex-1 justify-center px-2 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg text-xs font-medium transition-colors"
                        >
                          <RotateCcw size={13} className="mr-1" /> Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDeleteFile(file.id)}
                          className="flex items-center flex-1 justify-center px-2 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-xs font-medium transition-colors"
                        >
                          <XCircle size={13} className="mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Storage meter */}
            <div className="mb-6 bg-white dark:bg-surfaceMuted-dark rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-subtle">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Storage used</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400 font-mono">
                  {formatStorageSize(totalStorageUsed)} of 500 MB
                </span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-600 to-accent-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${storagePercent}%` }}
                />
              </div>
              <p className="text-xs text-neutral-400 mt-1">{storagePercent}% used</p>
            </div>

            {/* Breadcrumb */}
            <div className="mb-4 flex items-center text-sm text-neutral-500 dark:text-neutral-400 flex-wrap">
              <button
                onClick={() => handleBreadcrumbClick(-1)}
                className={`flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${
                  breadcrumbTrail.length === 0 ? 'text-neutral-900 dark:text-white font-medium' : ''
                }`}
              >
                <Home size={15} className="mr-1" />
                Home
              </button>
              {breadcrumbTrail.map((crumb, index) => (
                <React.Fragment key={crumb.id}>
                  <ChevronRight size={15} className="mx-1" />
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${
                      index === breadcrumbTrail.length - 1 ? 'text-neutral-900 dark:text-white font-medium' : ''
                    }`}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Sort + Type filter */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center px-3 py-1.5 bg-white dark:bg-surfaceMuted-dark border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-600 dark:text-neutral-300 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                >
                  Sort: <span className="font-medium ml-1 capitalize">{sortBy}</span>
                  <ChevronDown size={14} className="ml-1.5" />
                </button>
                {showSortMenu && (
                  <div className="absolute left-0 mt-1 w-36 bg-white dark:bg-surfaceMuted-dark border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-card z-20 py-1 animate-scaleIn">
                    {['name', 'date', 'size', 'type'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setShowSortMenu(false); }}
                        className={`w-full text-left px-3 py-1.5 text-sm capitalize transition-colors ${
                          sortBy === opt
                            ? 'text-primary-700 dark:text-primary-300 font-medium bg-primary-50 dark:bg-primary-900/20'
                            : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {['all', 'images', 'documents', 'videos', 'audio', 'archives'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTypeFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                      typeFilter === cat
                        ? 'bg-primary-700 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="mb-4 space-y-2">
                {Object.entries(uploadProgress).map(([name, percent]) => (
                  <div key={name} className="bg-white dark:bg-surfaceMuted-dark rounded-xl p-3 border border-neutral-200 dark:border-neutral-800">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-neutral-600 dark:text-neutral-300 truncate mr-2">{name}</span>
                      <span className="text-neutral-400 font-mono flex-shrink-0">{percent}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5">
                      <div
                        className="bg-accent-500 h-1.5 rounded-full transition-all duration-200"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-6 flex space-x-3">
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="flex items-center justify-center min-w-[150px] px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-card"
              >
                <FolderPlus size={18} className="mr-2" />
                New Folder
              </button>

              <div {...getRootProps()} className="cursor-pointer">
                <input {...getInputProps()} />
                <button
                  disabled={uploading}
                  className="flex items-center justify-center min-w-[150px] px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-card disabled:opacity-50"
                >
                  <Upload size={18} className="mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </button>
              </div>
            </div>

            {/* Drop zone overlay */}
            {isDragActive && (
              <div className="fixed inset-0 bg-primary-600 bg-opacity-20 border-4 border-dashed border-primary-600 flex items-center justify-center z-50">
                <div className="text-2xl font-display font-bold text-primary-700 dark:text-primary-300">
                  Drop files here to upload
                </div>
              </div>
            )}

            {/* Files Grid/List */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
                : 'space-y-2'
              }>
                {/* Folders */}
                {filteredFolders.map((folder) => {
                  const folderColor = FOLDER_COLORS[folder.color] || FOLDER_COLORS.primary;
                  return (
                  <div
                    key={folder.id}
                    className={`group relative bg-white dark:bg-surfaceMuted-dark rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-cardHover hover:-translate-y-0.5 transition-all duration-200 ease-smooth cursor-pointer animate-fadeIn ${
                      viewMode === 'list' ? 'flex items-center justify-between p-3' : 'p-4'
                    }`}
                    onClick={() => handleOpenFolder(folder)}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className={`${folderColor.bg} p-2.5 rounded-xl mr-3 flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                        <Folder className={`h-5 w-5 ${folderColor.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {renamingItem?.id === folder.id && renamingItem?.type === 'folder' ? (
                          <input
                            autoFocus
                            type="text"
                            value={renameValue}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') submitRename();
                              if (e.key === 'Escape') cancelRename();
                            }}
                            onBlur={submitRename}
                            className="text-sm font-medium text-neutral-900 dark:text-white border border-primary-400 rounded px-1 py-0.5 w-full bg-white dark:bg-neutral-800"
                          />
                        ) : (
                          <div className="flex items-center min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                              {folder.name}
                            </p>
                            {folder.isPublic && (
                              <Share2 size={12} className="ml-1.5 text-accent-500 flex-shrink-0" title="Shared via link" />
                            )}
                          </div>
                        )}
                        {viewMode === 'list' && (
                          <p className="text-xs text-neutral-400 mt-0.5">{formatDate(folder.createdAt)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); openShareModal(folder, 'folder'); }}
                        className="p-1 text-neutral-400 hover:text-accent-500 rounded transition-colors"
                        title="Share folder"
                      >
                        <Share2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setColorPickerFolderId(colorPickerFolderId === folder.id ? null : folder.id); }}
                        className="p-1 text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
                        title="Folder color"
                      >
                        <Palette size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); startRename(folder, 'folder'); }}
                        className="p-1 text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                        className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {colorPickerFolderId === folder.id && (
                      <div
                        className="absolute top-full right-2 mt-1 bg-white dark:bg-surfaceMuted-dark border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-card z-20 p-2 flex gap-1.5 animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {Object.entries(FOLDER_COLORS).map(([name, c]) => (
                          <button
                            key={name}
                            onClick={() => handleSetFolderColor(folder.id, name)}
                            className={`w-5 h-5 rounded-full ${c.dot} hover:scale-110 transition-transform`}
                            title={name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  );
                })}

                {/* Files */}
                {filteredFiles.map((file) => {
                  const { Icon: TypeIcon, bg: typeBg, text: typeText } = getFileTypeMeta(file.originalName);
                  return (
                  <div
                    key={file.id}
                    className={`group bg-white dark:bg-surfaceMuted-dark rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-accent-300 dark:hover:border-accent-500 hover:shadow-cardHover hover:-translate-y-0.5 transition-all duration-200 ease-smooth cursor-pointer animate-fadeIn ${
                      viewMode === 'list' ? 'flex items-center p-3' : 'p-4'
                    }`}
                    onClick={() => setPreviewFile(file)}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className={`${typeBg} p-2.5 rounded-xl mr-3 flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                        <TypeIcon className={`h-5 w-5 ${typeText}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {renamingItem?.id === file.id && renamingItem?.type === 'file' ? (
                          <input
                            autoFocus
                            type="text"
                            value={renameValue}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') submitRename();
                              if (e.key === 'Escape') cancelRename();
                            }}
                            onBlur={submitRename}
                            className="text-sm font-medium text-neutral-900 dark:text-white border border-primary-400 rounded px-1 py-0.5 w-full bg-white dark:bg-neutral-800"
                          />
                        ) : (
                          <div className="flex items-center min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                              {file.originalName}
                            </p>
                            {file.isPublic && (
                              <Share2 size={12} className="ml-1.5 text-accent-500 flex-shrink-0" title="Shared via link" />
                            )}
                          </div>
                        )}
                        <p className="text-xs text-neutral-400 font-mono mt-0.5">
                          {formatFileSize(file.size)}
                          {viewMode === 'list' && ` • ${formatDate(file.createdAt)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); openShareModal(file, 'file'); }}
                        className="p-1 text-neutral-400 hover:text-accent-500 rounded transition-colors"
                      >
                        <Share2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDetailsItem(file); }}
                        className="p-1 text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
                      >
                        <Info size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); startRename(file, 'file'); }}
                        className="p-1 text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                        className="p-1 text-neutral-400 hover:text-accent-600 dark:hover:text-accent-400 rounded transition-colors"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                        className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {!loading && filteredFiles.length === 0 && filteredFolders.length === 0 && (
              <div className="text-center py-20 animate-fadeIn">
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-5">
                  <FolderOpen className="h-11 w-11 text-primary-500 dark:text-primary-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-display font-bold text-neutral-900 dark:text-white mb-1.5">
                  {searchTerm ? 'No matches found' : 'Your Drive is empty'}
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                  {searchTerm
                    ? `Nothing matches "${searchTerm}" — try a different search.`
                    : 'Upload files or create a folder to get started.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />

      {/* Share Modal — shared between files and folders, driven by shareItemType */}
      {shareItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShareItem(null)}>
          <div className="bg-white dark:bg-surfaceMuted-dark rounded-2xl p-6 w-full max-w-md shadow-modal animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-white truncate pr-2">
                Share "{getShareDisplayName(shareItem)}"
              </h3>
              <button onClick={() => setShareItem(null)} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded transition-colors flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 mb-4">
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {shareItem.isPublic
                    ? (shareItemType === 'folder' ? 'Anyone with the link can view this folder' : 'Anyone with the link can view')
                    : 'Link sharing is off'}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {shareItem.isPublic ? 'Turn off to revoke access' : 'Turn on to generate a link'}
                </p>
              </div>
              <button
                onClick={handleToggleShare}
                disabled={shareLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                  shareItem.isPublic ? 'bg-accent-500' : 'bg-neutral-300 dark:bg-neutral-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    shareItem.isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {shareItem.isPublic && shareItem.shareId && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl(shareItem)}
                  className="flex-1 px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono truncate"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center px-3 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-medium transition-colors flex-shrink-0"
                >
                  {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Details Panel */}
      {detailsItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn" onClick={() => setDetailsItem(null)}>
          <div className="bg-white dark:bg-surfaceMuted-dark rounded-2xl p-6 w-full max-w-sm shadow-modal animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-white truncate pr-2">{detailsItem.originalName}</h3>
              <button onClick={() => setDetailsItem(null)} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded transition-colors flex-shrink-0">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Size</span>
                <span className="text-neutral-900 dark:text-white font-mono">{formatFileSize(detailsItem.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Type</span>
                <span className="text-neutral-900 dark:text-white uppercase">{detailsItem.originalName.split('.').pop()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Created</span>
                <span className="text-neutral-900 dark:text-white">{formatDate(detailsItem.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Modified</span>
                <span className="text-neutral-900 dark:text-white">{formatDate(detailsItem.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-surfaceMuted-dark rounded-2xl p-6 w-full max-w-md shadow-modal">
            <h3 className="text-lg font-display font-semibold text-neutral-900 dark:text-white mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onKeyPress={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => { setShowNewFolderModal(false); setNewFolderName(''); }}
                className="px-4 py-2 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl transition-colors"
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