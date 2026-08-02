const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const auth = require('../middleware/auth');
const FileModel = require('../models/File');
const Activity = require('../models/Activity');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    
    cb(null, true);
  }
});


router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { folderId } = req.body;

    const fileData = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      userId: req.user.id,
      folderId: folderId || null
    };

    const file = await FileModel.createFile(fileData);
    await Activity.log(req.user.id, 'upload', file.originalName, 'file');

    res.status(201).json({
      message: 'File uploaded successfully',
      file
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    const { folderId } = req.query;
    
    const files = await FileModel.getFilesByUserId(req.user.id, folderId || null);
    const folders = await FileModel.getFoldersByUserId(req.user.id, folderId || null);

    res.json({
      files,
      folders,
      currentFolder: folderId || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get files' });
  }
});

// Total storage used across the whole Drive, regardless of which folder you're viewing
router.get('/storage/total', auth, async (req, res) => {
  try {
    const totalBytes = await FileModel.getTotalStorageUsed(req.user.id);
    res.json({ totalBytes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get storage total' });
  }
});

// List trashed files + folders together
router.get('/trash/list', auth, async (req, res) => {
  try {
    const files = await FileModel.getTrashedFiles(req.user.id);
    const folders = await FileModel.getTrashedFolders(req.user.id);
    res.json({ files, folders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get trash' });
  }
});

// Restore a trashed file
router.patch('/:id/restore', auth, async (req, res) => {
  try {
    const file = await FileModel.restoreFile(req.params.id, req.user.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found in trash' });
    }
    await Activity.log(req.user.id, 'restore', file.originalName, 'file');
    res.json({ message: 'File restored successfully', file });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore file' });
  }
});

// Permanently delete a file (only works on already-trashed files, enforced client-side + here)
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const deleted = await FileModel.permanentlyDeleteFile(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'File not found' });
    }
    await Activity.log(req.user.id, 'permanent_delete', 'a file', 'file');
    res.json({ message: 'File permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to permanently delete file' });
  }
});


router.get('/download/:id', auth, async (req, res) => {
  try {
    const file = await FileModel.getFileById(req.params.id, req.user.id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads', file.filename);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'Physical file not found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download file' });
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await FileModel.getFileById(req.params.id, req.user.id);
    const deleted = await FileModel.deleteFile(req.params.id, req.user.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'File not found' });
    }

    await Activity.log(req.user.id, 'delete', file ? file.originalName : 'a file', 'file');
    res.json({ message: 'File moved to trash' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});


router.patch('/:id/rename', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'New name is required' });
    }

    const file = await FileModel.renameFile(req.params.id, req.user.id, name);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    await Activity.log(req.user.id, 'rename', name, 'file');
    res.json({ message: 'File renamed successfully', file });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rename file' });
  }
});

// ---- Public sharing ----

// Turn sharing ON for a file. Returns the file (with its shareId) so the
// frontend can build the public URL as `${window.location.origin}/share/${shareId}`.
router.post('/:id/share', auth, async (req, res) => {
  try {
    const file = await FileModel.enableShare(req.params.id, req.user.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    await Activity.log(req.user.id, 'share', file.originalName, 'file');
    res.json({ message: 'Sharing enabled', file });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enable sharing' });
  }
});

// Turn sharing OFF. Old links stop working immediately since getFileByShareId
// only matches isPublic: true.
router.delete('/:id/share', auth, async (req, res) => {
  try {
    const file = await FileModel.disableShare(req.params.id, req.user.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    await Activity.log(req.user.id, 'unshare', file.originalName, 'file');
    res.json({ message: 'Sharing disabled', file });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable sharing' });
  }
});

// Get file info
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await FileModel.getFileById(req.params.id, req.user.id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ file });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

module.exports = router;