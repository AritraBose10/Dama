-- Initial Schema for ClinIQ Command Center

-- Tables
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initials TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  bed_id TEXT,
  bed_label TEXT,
  esi_level INTEGER CHECK (esi_level BETWEEN 1 AND 5),
  chief_complaint TEXT NOT NULL,
  complaint_category TEXT NOT NULL,
  complaint_icon TEXT NOT NULL,
  arrived_at TIMESTAMPTZ DEFAULT NOW(),
  roomed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('WAITING', 'ROOMED', 'BOARDING', 'DISPO_READY', 'DISCHARGED')),
  risk_score INTEGER DEFAULT 0,
  risk_flags JSONB DEFAULT '[]'::jsonb,
  owner_role TEXT NOT NULL,
  owner_user_id UUID,
  next_milestone_text TEXT,
  next_milestone_eta TEXT,
  milestone_overdue BOOLEAN DEFAULT FALSE,
  ai_suggestion TEXT,
  dispo_prediction_mins INTEGER,
  sepsis_watch BOOLEAN DEFAULT FALSE,
  sepsis_bundle_started_at TIMESTAMPTZ,
  anticoag_status TEXT DEFAULT 'NONE',
  is_waiting_room BOOLEAN DEFAULT FALSE,
  fast_track_category TEXT,
  source VARCHAR(50) DEFAULT 'INTERNAL',
  external_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE imaging_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  modality TEXT NOT NULL,
  body_part TEXT NOT NULL,
  status TEXT NOT NULL,
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  alert_threshold_mins INTEGER DEFAULT 60
);

CREATE TABLE lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  value TEXT,
  status TEXT NOT NULL,
  critical BOOLEAN DEFAULT FALSE,
  alert_threshold INTEGER,
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  resulted_at TIMESTAMPTZ
);

CREATE TABLE consults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  called_at TIMESTAMPTZ DEFAULT NOW(),
  callback_at TIMESTAMPTZ,
  status TEXT NOT NULL
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE patients;
ALTER PUBLICATION supabase_realtime ADD TABLE imaging_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE lab_results;
ALTER PUBLICATION supabase_realtime ADD TABLE consults;

-- RLS (Basic - Public for demo, would be strictly gated in prod)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read" ON patients FOR SELECT USING (true);
CREATE POLICY "Public Write" ON patients FOR ALL USING (true);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
