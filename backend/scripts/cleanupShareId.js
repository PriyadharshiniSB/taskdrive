// One-time cleanup script. Run this ONCE after applying the File.js fix
// that removed `default: null` from shareId. It strips the old, bad
// shareId: null field off every existing file/folder so the sparse unique
// index stops colliding on multiple nulls.
//
// Run from the backend folder:  node scripts/cleanupShareId.js

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const cleanup = async () => {
  console.log('Connecting to MongoDB...');
  await connectDB();

  console.log('Cleaning files collection...');
  const filesResult = await mongoose.connection.collection('files').updateMany(
    { shareId: null },
    { $unset: { shareId: '' } }
  );
  console.log(`Files: matched ${filesResult.matchedCount}, modified ${filesResult.modifiedCount}`);

  console.log('Cleaning folders collection...');
  const foldersResult = await mongoose.connection.collection('folders').updateMany(
    { shareId: null },
    { $unset: { shareId: '' } }
  );
  console.log(`Folders: matched ${foldersResult.matchedCount}, modified ${foldersResult.modifiedCount}`);

  console.log('Cleanup complete.');
  process.exit(0);
};

cleanup().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});