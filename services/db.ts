
import { Pool } from '@neondatabase/serverless';
import { QuizResult, User } from '../types';

// WARNING: Exposing credentials in client-side code is not secure for production.
// This is for demonstration/prototyping purposes only.
const connectionString = "postgresql://neondb_owner:npg_dmicbT5IZ7wW@ep-lingering-pond-a11oe6ug-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ connectionString });

// Simple SHA-256 hash for client-side password handling (Prototype only)
async function hashPassword(password: string) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const initDB = async () => {
  try {
    // Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create History Table (with user_id support)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        exam_name TEXT,
        subject_name TEXT,
        player1_score INTEGER,
        player1_accuracy DECIMAL,
        total_questions INTEGER,
        full_result JSONB
      )
    `);
    console.log("Neon Database initialized with Users and History");
  } catch (e) {
    console.error("Failed to init Neon DB", e);
  }
};

// --- AUTH FUNCTIONS ---

export const registerUser = async (email: string, password: string, name: string): Promise<User> => {
  const passwordHash = await hashPassword(password);
  try {
    const res = await pool.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name`,
      [email, passwordHash, name]
    );
    return res.rows[0];
  } catch (e: any) {
    if (e.code === '23505') { // Unique violation
      throw new Error("Email already exists");
    }
    throw e;
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const passwordHash = await hashPassword(password);
  const res = await pool.query(
    `SELECT id, email, name FROM users WHERE email = $1 AND password_hash = $2`,
    [email, passwordHash]
  );
  
  if (res.rows.length === 0) {
    throw new Error("Invalid email or password");
  }
  return res.rows[0];
};

// --- DATA FUNCTIONS ---

export const saveQuizResultToDB = async (result: QuizResult, examName: string, subjectName: string, userId: number) => {
  try {
    const query = `
      INSERT INTO quiz_history 
      (user_id, timestamp, exam_name, subject_name, player1_score, player1_accuracy, total_questions, full_result)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [
      userId,
      new Date().toISOString(),
      examName,
      subjectName,
      result.player1.score,
      result.player1.accuracy,
      result.totalQuestions,
      JSON.stringify(result)
    ];
    await pool.query(query, values);
    console.log("Result saved to Neon DB");
  } catch (e) {
    console.error("Failed to save result to Neon DB", e);
  }
};

export const getHistoryFromDB = async (userId: number) => {
  try {
    const res = await pool.query(
      'SELECT * FROM quiz_history WHERE user_id = $1 ORDER BY timestamp DESC',
      [userId]
    );
    
    // Map DB rows to the shape expected by the Dashboard
    return res.rows.map(row => ({
      timestamp: row.timestamp,
      examName: row.exam_name,
      subjectName: row.subject_name,
      player1: {
        score: row.player1_score,
        accuracy: parseFloat(row.player1_accuracy as any)
      },
      totalQuestions: row.total_questions,
    }));
  } catch (e) {
    console.error("Failed to fetch history from Neon DB", e);
    return [];
  }
};
