import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

const sqlite = new Database(path.join(dbPath, 'kax.db'));
export const db = drizzle(sqlite, { schema });
