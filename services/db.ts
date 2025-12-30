
import { Pool } from '@neondatabase/serverless';
import { QuizResult } from '../types';

// WARNING: Exposing credentials in client-side code is not secure for production.
// This is for demonstration/prototyping purposes only.
const connectionString = "postgresql://neondb_owner:npg_dmicbT5IZ7wW@ep-lingering-pond-a11oe6ug-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ connectionString });

export const initDB = async () => {
  try {
    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_history (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        exam_name TEXT,
        subject_name TEXT,
        player1_score INTEGER,
        player1_accuracy DECIMAL,
        total_questions INTEGER,
        full_result JSONB
      )
    `);
    console.log("Neon Database initialized");
  } catch (e) {
    console.error("Failed to init Neon DB", e);
  }
};

export const saveQuizResultToDB = async (result: QuizResult, examName: string, subjectName: string) => {
  try {
    const query = `
      INSERT INTO quiz_history 
      (timestamp, exam_name, subject_name, player1_score, player1_accuracy, total_questions, full_result)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    const values = [
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

export const getHistoryFromDB = async () => {
  try {
    const res = await pool.query('SELECT * FROM quiz_history ORDER BY timestamp DESC');
    
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
