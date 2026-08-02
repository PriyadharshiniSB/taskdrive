const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');

// strict: false lets us store whatever fields the routes pass in (filename,
// originalName, mimetype, size, etc.) without redeclaring each one here.
const fileSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: uuidv4 },
  userId: { type: String, required: true },
  folderId: { type: mongoose.Schema.Types.Mixed, default: null },
  deletedAt: { type: Date, default: null },
  // No `default: null` here on purpose — with sparse:true, a field that's
  // genuinely ABSENT is skipped by the unique index, but a field explicitly
  // set to null still counts as "present" and collides with every other
  // null. That was the bug: every file got shareId: null written on it,
  // and the 2nd file/folder ever created would hit a duplicate-key error.
  shareId: { type: String, unique: true, sparse: true },
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const folderSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: uuidv4 },
  userId: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.Mixed, default: null },
  type: { type: String, default: 'folder' },
  color: { type: String, default: 'primary' },
  deletedAt: { type: Date, default: null },
  // Same fix as fileSchema.shareId above — no default: null.
  shareId: { type: String, unique: true, sparse: true },
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const FileModel = mongoose.model('File', fileSchema);
const FolderModel = mongoose.model('Folder', folderSchema);

class File {
  async createFile(fileData) {
    const file = new FileModel({ id: uuidv4(), ...fileData, createdAt: new Date(), updatedAt: new Date() });
    await file.save();
    return file.toObject();
  }

  async createFolder(folderData) {
    const folder = new FolderModel({ id: uuidv4(), ...folderData, type: 'folder', createdAt: new Date(), updatedAt: new Date() });
    await folder.save();
    return folder.toObject();
  }

  // Existing browsing views only ever show non-trashed items
  async getFilesByUserId(userId, folderId = null) {
    return await FileModel.find({ userId, folderId, deletedAt: null }).lean();
  }

  async getFoldersByUserId(userId, parentId = null) {
    return await FolderModel.find({ userId, parentId, deletedAt: null }).lean();
  }

  async getFileById(id, userId) {
    return await FileModel.findOne({ id, userId, deletedAt: null }).lean();
  }

  async getFolderById(id, userId) {
    return await FolderModel.findOne({ id, userId, deletedAt: null }).lean();
  }

  // ---- Delete (now recursive: trashing a folder trashes everything inside it) ----

  async deleteFile(id, userId) {
    const result = await FileModel.findOneAndUpdate(
      { id, userId, deletedAt: null },
      { deletedAt: new Date() }
    );
    return !!result;
  }

  async deleteFolder(id, userId) {
    const folder = await FolderModel.findOne({ id, userId, deletedAt: null });
    if (!folder) return false;
    await this._softDeleteRecursive(id, userId, new Date());
    return true;
  }

  async _softDeleteRecursive(folderId, userId, timestamp) {
    await FolderModel.updateOne({ id: folderId, userId }, { deletedAt: timestamp });
    await FileModel.updateMany({ folderId, userId, deletedAt: null }, { deletedAt: timestamp });
    const subfolders = await FolderModel.find({ parentId: folderId, userId, deletedAt: null }).lean();
    for (const sub of subfolders) {
      await this._softDeleteRecursive(sub.id, userId, timestamp);
    }
  }

  async renameFile(id, userId, newName) {
    const file = await FileModel.findOneAndUpdate(
      { id, userId, deletedAt: null },
      { originalName: newName, updatedAt: new Date() },
      { returnDocument: 'after' }
    ).lean();
    return file;
  }

  async renameFolder(id, userId, newName) {
    const folder = await FolderModel.findOneAndUpdate(
      { id, userId, deletedAt: null },
      { name: newName, updatedAt: new Date() },
      { returnDocument: 'after' }
    ).lean();
    return folder;
  }

  async setFolderColor(id, userId, color) {
    const folder = await FolderModel.findOneAndUpdate(
      { id, userId, deletedAt: null },
      { color, updatedAt: new Date() },
      { returnDocument: 'after' }
    ).lean();
    return folder;
  }

  // ---- Trash ----

  async getTrashedFiles(userId) {
    return await FileModel.find({ userId, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }).lean();
  }

  async getTrashedFolders(userId) {
    return await FolderModel.find({ userId, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }).lean();
  }

  async restoreFile(id, userId) {
    const file = await FileModel.findOneAndUpdate(
      { id, userId, deletedAt: { $ne: null } },
      { deletedAt: null },
      { returnDocument: 'after' }
    ).lean();
    return file;
  }

  async restoreFolder(id, userId) {
    const folder = await FolderModel.findOneAndUpdate(
      { id, userId, deletedAt: { $ne: null } },
      { deletedAt: null },
      { returnDocument: 'after' }
    ).lean();
    return folder;
  }

  async permanentlyDeleteFile(id, userId) {
    const file = await FileModel.findOne({ id, userId });
    if (!file) return false;

    const filePath = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads', file.filename);
    try {
      await fs.remove(filePath);
    } catch (error) {
      console.error('Error deleting physical file:', error);
    }

    await FileModel.deleteOne({ id, userId });
    return true;
  }

  async permanentlyDeleteFolder(id, userId) {
    const folder = await FolderModel.findOne({ id, userId });
    if (!folder) return false;
    await this._permanentDeleteRecursive(id, userId);
    return true;
  }

  async _permanentDeleteRecursive(folderId, userId) {
    const filesInFolder = await FileModel.find({ folderId, userId }).lean();
    for (const f of filesInFolder) {
      await this.permanentlyDeleteFile(f.id, userId);
    }
    const subfolders = await FolderModel.find({ parentId: folderId, userId }).lean();
    for (const sub of subfolders) {
      await this._permanentDeleteRecursive(sub.id, userId);
    }
    await FolderModel.deleteOne({ id: folderId, userId });
  }

  // ---- Storage total across the whole Drive (not just current folder) ----

  async getTotalStorageUsed(userId) {
    const result = await FileModel.aggregate([
      { $match: { userId, deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$size' } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  // ---- Public sharing: files ----

  // Turns sharing on. If the file was already shared, reuses the existing
  // shareId instead of generating a new one, so an old link a user already
  // sent someone doesn't silently break.
  async enableShare(id, userId) {
    const existing = await FileModel.findOne({ id, userId, deletedAt: null }).lean();
    if (!existing) return null;

    const shareId = existing.shareId || uuidv4();
    const file = await FileModel.findOneAndUpdate(
      { id, userId, deletedAt: null },
      { isPublic: true, shareId, updatedAt: new Date() },
      { returnDocument: 'after' }
    ).lean();
    return file;
  }

  async disableShare(id, userId) {
    const file = await FileModel.findOneAndUpdate(
      { id, userId, deletedAt: null },
      { isPublic: false, updatedAt: new Date() },
      { returnDocument: 'after' }
    ).lean();
    return file;
  }

  // No userId filter here on purpose — this is the lookup the public,
  // unauthenticated route uses. Only returns the file if it's still
  // marked public and hasn't been trashed since the link was created.
  async getFileByShareId(shareId) {
    return await FileModel.findOne({ shareId, isPublic: true, deletedAt: null }).lean();
  }

  // ---- Public sharing: folders ----
  // Same enable/disable/lookup pattern as files, just against FolderModel.

  async enableFolderShare(id, userId) {
    const existing = await FolderModel.findOne({ id, userId, deletedAt: null }).lean();
    if (!existing) return null;

    const shareId = existing.shareId || uuidv4();
    const folder = await FolderModel.findOneAndUpdate(
      { id, userId, deletedAt: null },
      { isPublic: true, shareId, updatedAt: new Date() },
      { returnDocument: 'after' }
    ).lean();
    return folder;
  }

  async disableFolderShare(id, userId) {
    const folder = await FolderModel.findOneAndUpdate(
      { id, userId, deletedAt: null },
      { isPublic: false, updatedAt: new Date() },
      { returnDocument: 'after' }
    ).lean();
    return folder;
  }

  async getFolderByShareId(shareId) {
    return await FolderModel.findOne({ shareId, isPublic: true, deletedAt: null }).lean();
  }

  // Direct children only (files + subfolders one level deep), same as the
  // normal authenticated folder-browsing view — no userId filter since the
  // caller (public route) has already verified the parent folder is public.
  // Subfolders are listed but not resolved further; opening one from the
  // public page would need its own share link (kept simple on purpose).
  async getPublicFolderContents(folderId, userId) {
    const files = await FileModel.find({ folderId, userId, deletedAt: null }).lean();
    const folders = await FolderModel.find({ parentId: folderId, userId, deletedAt: null }).lean();
    return { files, folders };
  }
}

module.exports = new File();