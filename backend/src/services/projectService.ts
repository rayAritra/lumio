import pool from '../db/index';
import crypto from 'crypto';

interface DbProject {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  created_at: string;
  updated_at: string;
}

function toProject(row: DbProject): Project {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    prompt: row.prompt,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const result = await pool.query<DbProject>(
    'SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
    [userId]
  );
  return result.rows.map(toProject);
}

export async function createProject(userId: string, title: string, prompt: string): Promise<Project> {
  const id = crypto.randomUUID();
  const result = await pool.query<DbProject>(
    `INSERT INTO projects (id, user_id, title, prompt)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, userId, title, prompt]
  );
  return toProject(result.rows[0]);
}

export async function deleteProject(userId: string, projectId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getProjectById(userId: string, projectId: string): Promise<Project | null> {
  const result = await pool.query<DbProject>(
    'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return result.rows[0] ? toProject(result.rows[0]) : null;
}
