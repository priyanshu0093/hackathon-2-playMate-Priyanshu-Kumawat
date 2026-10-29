import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playmate';
const backupDir = path.resolve(process.cwd(), 'backups/mongodb_pre_prisma_backup');

async function backup() {
  console.log(`[Backup] Connecting to MongoDB: ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const collections = ['users', 'turfprofiles', 'matches', 'bookings', 'chatmessages', 'notifications', 'reviews'];
  const manifest = {
    timestamp: new Date().toISOString(),
    database: 'playmate',
    collections: {}
  };

  for (const colName of collections) {
    const col = mongoose.connection.db.collection(colName);
    const docs = await col.find({}).toArray();
    const filePath = path.join(backupDir, `${colName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');
    const fileSize = fs.statSync(filePath).size;
    manifest.collections[colName] = {
      count: docs.length,
      bytes: fileSize,
      file: filePath
    };
    console.log(`[Backup] Exported ${docs.length} documents from '${colName}' (${fileSize} bytes) -> ${filePath}`);
  }

  const manifestPath = path.join(backupDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`[Backup] Verified backup manifest created at: ${manifestPath}`);

  await mongoose.disconnect();
  console.log('[Backup] Completed successfully.');
}

backup().catch((err) => {
  console.error('[Backup Error]:', err);
  process.exit(1);
});

