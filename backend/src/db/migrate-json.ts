/**
 * One-time migration: imports users and projects from the old JSON files into Neon.
 * Run with:  npx ts-node src/db/migrate-json.ts
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pool from './index';
import { runMigrations } from './schema';

const DATA_DIR = path.join(__dirname, '../../data');

interface JsonUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface JsonProject {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  created_at: string;
  updated_at: string;
}

async function migrate() {
  await runMigrations();

  // ── Users ────────────────────────────────────────────────────────────────
  const usersFile = path.join(DATA_DIR, 'users.json');
  if (fs.existsSync(usersFile)) {
    const users: JsonUser[] = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    console.log(`Migrating ${users.length} user(s)…`);

    for (const u of users) {
      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.name, u.email.toLowerCase(), u.passwordHash, new Date(u.createdAt)]
      );
      console.log(`  ✓ ${u.email}`);
    }
  }

  // ── Projects ─────────────────────────────────────────────────────────────
  const projectsFile = path.join(DATA_DIR, 'projects.json');
  if (fs.existsSync(projectsFile)) {
    const projects: JsonProject[] = JSON.parse(fs.readFileSync(projectsFile, 'utf-8'));
    console.log(`Migrating ${projects.length} project(s)…`);

    for (const p of projects) {
      await pool.query(
        `INSERT INTO projects (id, user_id, title, prompt, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.userId, p.title, p.prompt, new Date(p.created_at), new Date(p.updated_at)]
      );
      console.log(`  ✓ "${p.title}" (user: ${p.userId})`);
    }
  }

  console.log('Migration complete.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
