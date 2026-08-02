const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// One document per user action. Kept deliberately simple/flat (no refs to
// populate) so reading the activity feed is a single fast query, not a join.
const activitySchema = new mongoose.Schema({
  id: { type: String, unique: true, default: uuidv4 },
  userId: { type: String, required: true },
  action: {
    type: String,
    required: true,
    enum: [
      'upload', 'delete', 'restore', 'permanent_delete',
      'rename', 'create_folder', 'share', 'unshare', 'login'
    ]
  },
  targetName: { type: String, required: true }, // file/folder name at time of action
  targetType: { type: String, enum: ['file', 'folder'], default: 'file' },
  createdAt: { type: Date, default: Date.now }
});

const ActivityModel = mongoose.model('Activity', activitySchema);

class Activity {
  // Fire-and-forget style logging — callers shouldn't have their main
  // action fail just because the activity log write hiccuped.
  async log(userId, action, targetName, targetType = 'file') {
    try {
      const entry = new ActivityModel({ id: uuidv4(), userId, action, targetName, targetType });
      await entry.save();
      return entry.toObject();
    } catch (error) {
      console.error('Failed to log activity:', error);
      return null;
    }
  }

  // skip/limit gives us real backend pagination: page 1 is skip=0, page 2 is
  // skip=limit, etc. total is returned separately so the frontend knows how
  // many pages exist without fetching everything.
  async getRecentActivity(userId, limit = 20, skip = 0) {
    const [items, total] = await Promise.all([
      ActivityModel.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityModel.countDocuments({ userId })
    ]);

    return { items, total };
  }

  async clearActivity(userId) {
    await ActivityModel.deleteMany({ userId });
    return true;
  }
}

module.exports = new Activity();