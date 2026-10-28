import { initDatabase, seedDatabaseIfEmpty, pool } from '../db/index.js';

async function run() {
  try {
    console.log('[Migration Script] Starting database migration & seed...');
    await initDatabase();
    await seedDatabaseIfEmpty();
    console.log('[Migration Script] Completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('[Migration Script] Error:', err);
    await pool.end();
    process.exit(1);
  }
}

run();
