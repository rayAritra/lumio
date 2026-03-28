import pool from '../db/index';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface DbUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export function toSafeUser(user: DbUser): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at.toISOString(),
  };
}

export async function createUser(name: string, email: string, password: string): Promise<DbUser> {
  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  try {
    const result = await pool.query<DbUser>(
      `INSERT INTO users (id, name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, name, email.toLowerCase(), passwordHash]
    );
    return result.rows[0];
  } catch (err: any) {
    if (err.code === '23505') {
      throw new Error('An account with this email already exists');
    }
    throw err;
  }
}

export async function verifyUser(email: string, password: string): Promise<DbUser> {
  const result = await pool.query<DbUser>(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );

  const user = result.rows[0];
  if (!user) throw new Error('Invalid email or password');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Invalid email or password');

  return user;
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const result = await pool.query<DbUser>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] ?? null;
}
