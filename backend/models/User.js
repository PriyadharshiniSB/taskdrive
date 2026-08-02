const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  avatarUrl: { type: String, default: null },
  rootFolderId: { type: String, default: uuidv4 },
  createdAt: { type: Date, default: Date.now }
});

const UserModel = mongoose.model('User', userSchema);

// Same method names/behavior as before, now backed by MongoDB instead of an in-memory array
class User {
  async create(userData) {
    const { email, password, name } = userData;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      rootFolderId: uuidv4()
    });

    await newUser.save();

    const userObj = newUser.toObject();
    delete userObj.password;
    delete userObj._id;
    delete userObj.__v;
    return userObj;
  }

  async findByEmail(email) {
    const user = await UserModel.findOne({ email }).lean();
    return user;
  }

  async findById(id) {
    const user = await UserModel.findOne({ id }).lean();
    if (user) {
      delete user.password;
      delete user._id;
      delete user.__v;
      return user;
    }
    return null;
  }

  async validatePassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }

  // Used by PATCH /auth/profile. `updates` is a plain object of fields to
  // change (name, email, avatarUrl) — never accepts `password` here on
  // purpose, that has its own method below with current-password verification.
  async updateProfile(id, updates) {
    const safeUpdates = { ...updates };
    delete safeUpdates.password;
    delete safeUpdates.id;

    const user = await UserModel.findOneAndUpdate(
      { id },
      safeUpdates,
      { returnDocument: 'after' }
    ).lean();

    if (user) {
      delete user.password;
      delete user._id;
      delete user.__v;
    }
    return user;
  }

  async updatePassword(id, currentPassword, newPassword) {
    const user = await UserModel.findOne({ id });
    if (!user) return { success: false, error: 'User not found' };

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return { success: false, error: 'Current password is incorrect' };

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { success: true };
  }
}

module.exports = new User();