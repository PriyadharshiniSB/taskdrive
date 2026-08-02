const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const FileModel = require('../models/File');

const router = express.Router();

// Deliberately no `auth` middleware on this whole file — this is the
// public-facing route a shared link points to. Only the shareId in the
// URL grants access, and only if isPublic is still true (see
// getFileByShareId / getFolderByShareId, which enforce that).

// Metadata only — used by the frontend "share preview" page to show
// filename/size/type before the visitor decides to download, OR (new)
// folder contents if the shareId belongs to a shared folder instead of
// a file. shareIds are uuids from two different collections, so we just
// try file first, then folder — collision odds are effectively zero.
router.get('/:shareId', async (req, res) => {
  try {
    const file = await FileModel.getFileByShareId(req.params.shareId);
    if (file) {
      return res.json({
        type: 'file',
        file: {
          originalName: file.originalName,
          mimetype: file.mimetype,
          size: file.size,
          createdAt: file.createdAt
        }
      });
    }

    const folder = await FileModel.getFolderByShareId(req.params.shareId);
    if (folder) {
      const { files, folders } = await FileModel.getPublicFolderContents(folder.id, folder.userId);
      return res.json({
        type: 'folder',
        folder: {
          name: folder.name,
          color: folder.color,
          createdAt: folder.createdAt
        },
        files: files.map(f => ({
          id: f.id,
          originalName: f.originalName,
          mimetype: f.mimetype,
          size: f.size,
          createdAt: f.createdAt
        })),
        folders: folders.map(sub => ({ id: sub.id, name: sub.name, color: sub.color }))
      });
    }

    return res.status(404).json({ error: 'This link is invalid or no longer active' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load shared link' });
  }
});

router.get('/:shareId/download', async (req, res) => {
  try {
    const file = await FileModel.getFileByShareId(req.params.shareId);
    if (!file) {
      return res.status(404).json({ error: 'This link is invalid or no longer active' });
    }

    const filePath = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads', file.filename);

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'Physical file not found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download shared file' });
  }
});

// Downloads a single file that lives inside a shared folder. The file
// itself isn't individually shared (no shareId/isPublic of its own) — access
// is granted purely because it belongs to a folder that IS public, so we
// re-check the folder's public status on every request rather than trusting
// the URL alone.
router.get('/:shareId/file/:fileId/download', async (req, res) => {
  try {
    const folder = await FileModel.getFolderByShareId(req.params.shareId);
    if (!folder) {
      return res.status(404).json({ error: 'This link is invalid or no longer active' });
    }

    const file = await FileModel.getFileById(req.params.fileId, folder.userId);
    if (!file || file.folderId !== folder.id) {
      return res.status(404).json({ error: 'File not found in this shared folder' });
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

module.exports = router;