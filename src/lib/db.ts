import Database from 'better-sqlite3';
import path from 'path';
import { mockPatients } from './mockData';

const dbPath = path.resolve(process.cwd(), 'cliniq.db');
const db = new Database(dbPath);

// Initialize schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      initials TEXT,
      age INTEGER,
      gender TEXT,
      bed_id TEXT,
      bed_label TEXT,
      esi_level INTEGER,
      chief_complaint TEXT,
      complaint_category TEXT,
      complaint_icon TEXT,
      arrived_at TEXT,
      status TEXT,
      risk_score REAL,
      risk_flags TEXT, -- JSON string
      owner_role TEXT,
      next_milestone_text TEXT,
      next_milestone_eta TEXT,
      milestone_overdue INTEGER,
      dispo_prediction_mins INTEGER,
      sepsis_watch INTEGER,
      sepsis_bundle_started_at TEXT,
      anticoag_status TEXT,
      is_waiting_room INTEGER
    );
  `);

  // Simple seed logic
  const rowCount = db.prepare('SELECT count(*) as count FROM patients').get() as { count: number };
  if (rowCount.count === 0) {
    const insert = db.prepare(`
      INSERT INTO patients (
        id, initials, age, gender, bed_id, bed_label, esi_level, 
        chief_complaint, complaint_category, complaint_icon, arrived_at, 
        status, risk_score, risk_flags, owner_role, next_milestone_text, 
        next_milestone_eta, milestone_overdue, dispo_prediction_mins, 
        sepsis_watch, sepsis_bundle_started_at, anticoag_status, is_waiting_room
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    mockPatients.forEach(p => {
      insert.run(
        p.id, p.initials, p.age, p.gender, p.bed_id, p.bed_label, p.esi_level,
        p.chief_complaint, p.complaint_category, p.complaint_icon, p.arrived_at,
        p.status, p.risk_score, JSON.stringify(p.risk_flags), p.owner_role, 
        p.next_milestone_text, p.next_milestone_eta, p.milestone_overdue ? 1 : 0,
        p.dispo_prediction_mins, p.sepsis_watch ? 1 : 0, p.sepsis_bundle_started_at || null,
        p.anticoag_status, p.is_waiting_room ? 1 : 0
      );
    });
    console.log('Database seeded with mock patients.');
  }
}

export default db;
