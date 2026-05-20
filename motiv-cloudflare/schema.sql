-- Motiv D1 Schema
-- Run with: wrangler d1 execute motiv-db --file=./schema.sql

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  upi_id TEXT,
  clerk_id TEXT,
  banned INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stakes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  habit_type TEXT NOT NULL,
  habit_description TEXT,
  total_amount INTEGER NOT NULL,
  daily_amount INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'pending_payment',
  gym_lat REAL,
  gym_lng REAL,
  gym_name TEXT,
  current_streak INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  total_burned INTEGER DEFAULT 0,
  completed_days INTEGER DEFAULT 0,
  missed_days INTEGER DEFAULT 0,
  platform_fee INTEGER DEFAULT 0,
  verification_config TEXT,
  days_per_week INTEGER DEFAULT 7,
  active_days TEXT DEFAULT '0,1,2,3,4,5,6',
  group_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  stake_id INTEGER,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (stake_id) REFERENCES stakes(id)
);

CREATE TABLE IF NOT EXISTS daily_proofs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stake_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  keyword TEXT,
  keyword_expires_at DATETIME,
  photo_url TEXT,
  photo_hash TEXT,
  gps_lat REAL,
  gps_lng REAL,
  screentime_url TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at DATETIME,
  verified_at DATETIME,
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stake_id) REFERENCES stakes(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stake_id INTEGER NOT NULL,
  method TEXT NOT NULL,
  config TEXT,
  enabled INTEGER DEFAULT 1,
  FOREIGN KEY (stake_id) REFERENCES stakes(id)
);

CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  habit_type TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  stake_amount INTEGER NOT NULL,
  max_members INTEGER DEFAULT 10,
  creator_id INTEGER NOT NULL,
  status TEXT DEFAULT 'open',
  start_date DATE,
  end_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  stake_id INTEGER,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (stake_id) REFERENCES stakes(id),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proof_id INTEGER NOT NULL,
  voter_id INTEGER NOT NULL,
  vote TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proof_id) REFERENCES daily_proofs(id),
  FOREIGN KEY (voter_id) REFERENCES users(id),
  UNIQUE(proof_id, voter_id)
);

CREATE TABLE IF NOT EXISTS integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  provider_user_id TEXT,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, provider)
);

CREATE TABLE IF NOT EXISTS leeway_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stake_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stake_id) REFERENCES stakes(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start INTEGER NOT NULL,
  UNIQUE(key, window_start)
);
